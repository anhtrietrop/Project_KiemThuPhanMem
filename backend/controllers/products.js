const prisma = require("../utills/db"); // ✅ Use shared connection with SSL
const {
  asyncHandler,
  handleServerError,
  AppError,
} = require("../utills/errorHandler");

// Security: Define whitelists for allowed filter types and operators
const ALLOWED_FILTER_TYPES = [
  "price",
  "rating",
  "category",
  "quantity",
  "inStock",
];
const ALLOWED_OPERATORS = ["gte", "lte", "gt", "lt", "equals", "contains"];
const ALLOWED_SORT_VALUES = [
  "defaultSort",
  "titleAsc",
  "titleDesc",
  "lowPrice",
  "highPrice",
];

// Helper: create URL-friendly slug from title
function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD") // split accented characters
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Security: Input validation functions
function validateFilterType(filterType) {
  return ALLOWED_FILTER_TYPES.includes(filterType);
}

function validateOperator(operator) {
  return ALLOWED_OPERATORS.includes(operator);
}

function validateSortValue(sortValue) {
  return ALLOWED_SORT_VALUES.includes(sortValue);
}

function validateAndSanitizeFilterValue(filterType, filterValue) {
  switch (filterType) {
    case "price":
    case "rating":
    case "quantity":
    case "inStock":
      // Parse numeric values
      const numericValue = Number(filterValue);
      if (isNaN(numericValue)) {
        return null;
      }
      return numericValue;

    case "category":
      return typeof filterValue === "string" && filterValue.trim().length > 0
        ? filterValue.trim()
        : null;
    default:
      return null;
  }
}

// Security: Safe filter object builder
function buildSafeFilterObject(filterArray) {
  const filterObj = {};

  for (const item of filterArray) {
    // Validate filter type
    if (!validateFilterType(item.filterType)) {
      console.warn(`Invalid filter type: ${item.filterType}`);
      continue;
    }

    // Validate operator
    if (!validateOperator(item.filterOperator)) {
      console.warn(`Invalid operator: ${item.filterOperator}`);
      continue;
    }

    // Validate and sanitize filter value
    const sanitizedValue = validateAndSanitizeFilterValue(
      item.filterType,
      item.filterValue
    );
    if (sanitizedValue === null) {
      console.warn(
        `Invalid filter value for ${item.filterType}: ${item.filterValue}`
      );
      continue;
    }

    // Build safe filter object
    // Map inStock to quantity for database query
    const dbFieldName =
      item.filterType === "inStock" ? "quantity" : item.filterType;

    if (!filterObj[dbFieldName]) {
      filterObj[dbFieldName] = {};
    }

    filterObj[dbFieldName][item.filterOperator] = sanitizedValue;
  }

  return filterObj;
}

const getAllProducts = asyncHandler(async (request, response) => {
  const mode = request.query.mode || "";

  // checking if we are on the admin products page because we don't want to have filtering, sorting and pagination there
  if (mode === "admin") {
    const adminProducts = await prisma.product.findMany({});
    return response.json(adminProducts);
  } else {
    const dividerLocation = request.url.indexOf("?");
    let filterObj = {};
    let sortObj = {};
    let sortByValue = "defaultSort";

    // getting current page with validation
    const page = Number(request.query.page);
    const validatedPage = page && page > 0 ? page : 1;

    if (dividerLocation !== -1) {
      const queryString = request.url.substring(dividerLocation + 1);
      const decodedQueryString = decodeURIComponent(queryString);
      console.log("DEBUG_DECODED_QUERY:", decodedQueryString);
      const queryArray = decodedQueryString.split("&");

      console.log("DEBUG_QUERY_ARRAY:", queryArray);
      let filterType;
      let filterArray = [];

      for (let i = 0; i < queryArray.length; i++) {
        const queryParam = queryArray[i];
        if (!queryParam.includes("filters")) continue;

        // Regex to parse: filters=TYPE$OP=VALUE
        // Example: filters=price$gte=10000000
        const match = queryParam.match(/filters=([^$]+)\$([^=]+)=(.+)/);
        if (match) {
          const [, type, operator, value] = match;

          // Validate Type
          if (!validateFilterType(type)) {
            continue;
          }

          // Validate Operator
          if (!validateOperator(operator)) {
            continue;
          }

          // Sanitize Value
          const sanitizedValue = validateAndSanitizeFilterValue(type, value);
          if (sanitizedValue === null) continue;

          const dbFieldName = type === "inStock" ? "quantity" : type;

          if (!filterObj[dbFieldName]) {
            filterObj[dbFieldName] = {};
          }
          filterObj[dbFieldName][operator] = sanitizedValue;
        }
      }
    }

    let whereClause = { ...filterObj };
    // console.log("DEBUG_WHERE_CLAUSE:", JSON.stringify(whereClause, null, 2));

    // Security: Handle category filter separately with validation
    if (filterObj.category && filterObj.category.equals) {
      delete whereClause.category;
    }

    // Security: Build sort object safely
    switch (sortByValue) {
      case "defaultSort":
        sortObj = {};
        break;
      case "titleAsc":
        sortObj = { title: "asc" };
        break;
      case "titleDesc":
        sortObj = { title: "desc" };
        break;
      case "lowPrice":
        sortObj = { price: "asc" };
        break;
      case "highPrice":
        sortObj = { price: "desc" };
        break;
      default:
        sortObj = {};
    }

    let products;

    if (Object.keys(filterObj).length === 0) {
      products = await prisma.product.findMany({
        skip: (validatedPage - 1) * 10,
        take: 12,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: sortObj,
      });
    } else {
      // Security: Handle category filter with proper validation
      if (filterObj.category && filterObj.category.equals) {
        products = await prisma.product.findMany({
          skip: (validatedPage - 1) * 10,
          take: 12,
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          where: {
            ...whereClause,
            category: {
              name: {
                equals: filterObj.category.equals,
              },
            },
          },
          orderBy: sortObj,
        });
      } else {
        products = await prisma.product.findMany({
          skip: (validatedPage - 1) * 10,
          take: 12,
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          where: whereClause,
          orderBy: sortObj,
        });
      }
    }

    return response.json(products);
  }
});

const getAllProductsOld = asyncHandler(async (request, response) => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  response.status(200).json(products);
});

const createProduct = asyncHandler(async (request, response) => {
  const {
    merchantId,
    title,
    slug, // optional slug provided by client
    mainImage,
    price,
    costPrice,
    quantity,
    description,
    manufacturer,
    categoryId,
  } = request.body;

  if (!title) {
    throw new AppError("Missing required field: title", 400);
  }

  // Basic validation
  if (!merchantId) {
    throw new AppError("Missing required field: merchantId", 400);
  }

  if (!price) {
    throw new AppError("Missing required field: price", 400);
  }

  // Validate price is not negative
  if (price < 0) {
    throw new AppError("Price cannot be negative", 400);
  }

  // Validate costPrice if provided
  if (costPrice !== undefined && costPrice < 0) {
    throw new AppError("Cost price cannot be negative", 400);
  }

  if (!categoryId) {
    throw new AppError("Missing required field: categoryId", 400);
  }

  if (!mainImage) {
    throw new AppError("Missing required field: mainImage", 400);
  }

  const product = await prisma.product.create({
    data: {
      slug: finalSlug,
      merchantId,
      title,
      mainImage,
      price,
      costPrice,
      quantity,
      rating: 5,
      description,
      manufacturer,
      categoryId,
    },
  });
  console.log(`Product created - id: ${product.id}, slug: ${product.slug}`);
  return response.status(201).json(product);
});

// Method for updating existing product
const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const {
    merchantId,
    title,
    slug, // optional client-provided slug
    mainImage,
    price,
    costPrice,
    quantity,
    rating,
    description,
    manufacturer,
    categoryId,
  } = request.body;

  // Basic validation
  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Finding a product by id
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  // Updating found product
  // Determine new slug: prefer provided slug, otherwise keep existing or generate from title
  let finalSlug = existingProduct.slug;
  if (slug && typeof slug === "string" && slug.trim().length > 0) {
    finalSlug = slugify(slug);
  } else if (!finalSlug && title) {
    finalSlug = slugify(title) || `product-${Date.now()}`;
  }

  // Ensure uniqueness when slug changed
  try {
    if (finalSlug && finalSlug !== existingProduct.slug) {
      const found = await prisma.product.findUnique({
        where: { slug: finalSlug },
      });
      if (found) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }
  } catch (e) {
    console.warn(
      "Error checking slug uniqueness during update:",
      e && e.message ? e.message : e
    );
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },
    data: {
      merchantId: merchantId,
      title: title,
      slug: finalSlug,
      mainImage: mainImage,
      price: price,
      costPrice: costPrice,
      quantity: quantity,
      rating: rating,
      description: description,
      manufacturer: manufacturer,
      categoryId: categoryId,
    },
  });
  console.log(
    `Product updated - id: ${updatedProduct.id}, slug: ${updatedProduct.slug}`
  );

  return response.status(200).json(updatedProduct);
});

// Method for deleting a product
// With Cascade delete in schema, related records are automatically deleted
const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Try to remove related records first to avoid FK constraint issues.
  // We'll remove common dependent records referencing productId.
  try {
    const ops = [];
    if (prisma.cartitem)
      ops.push(prisma.cartitem.deleteMany({ where: { productId: id } }));
    if (prisma.wishlist)
      ops.push(prisma.wishlist.deleteMany({ where: { productId: id } }));
    if (prisma.customer_order_product)
      ops.push(
        prisma.customer_order_product.deleteMany({ where: { productId: id } })
      );
    if (prisma.orderItem)
      ops.push(prisma.orderItem.deleteMany({ where: { productId: id } }));
    if (prisma.review)
      ops.push(prisma.review.deleteMany({ where: { productId: id } }));
    if (prisma.productImage)
      ops.push(prisma.productImage.deleteMany({ where: { productId: id } }));

    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }

    // Finally delete the product itself
    await prisma.product.delete({ where: { id } });

    return response.status(200).json({
      message: "Product and related records deleted successfully",
      deletedProductId: id,
    });
  } catch (err) {
    // If transaction fails due to missing model or constraint, attempt a best-effort deletion
    try {
      await prisma.product.delete({ where: { id } });
      return response.status(200).json({
        message:
          "Product deleted (best-effort). Some related records may remain.",
        deletedProductId: id,
      });
    } catch (e) {
      // If still failing, bubble up an error
      console.error("Failed to delete product and related records:", e);
      throw new AppError("Failed to delete product", 500);
    }
  }
});

const searchProducts = asyncHandler(async (request, response) => {
  const { query } = request.query;
  if (!query) {
    return response.json({ products: [] });
  }
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
  });
  return response.json({ products });
});

const getProductById = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
    },
  });

  console.log(
    `getProductById - id: ${id}, slug: ${product ? product.slug : "NOT_FOUND"}`
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return response.status(200).json(product);
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
};
