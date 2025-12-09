const prisma = require("../utills/db"); // ✅ Use shared connection with SSL
const {
  asyncHandler,
  handleServerError,
  AppError,
} = require("../utills/errorHandler");

// Security: Define whitelists for allowed filter types and operators
const ALLOWED_FILTER_TYPES = ["price", "rating", "category", "quantity", "inStock"];
const ALLOWED_OPERATORS = ["gte", "lte", "gt", "lt", "equals", "contains"];
const ALLOWED_SORT_VALUES = [
  "defaultSort",
  "titleAsc",
  "titleDesc",
  "lowPrice",
  "highPrice",
];

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
    const dbFieldName = item.filterType === "inStock" ? "quantity" : item.filterType;
    filterObj[dbFieldName] = {
      [item.filterOperator]: sanitizedValue,
    };
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
      const queryArray = request.url
        .substring(dividerLocation + 1, request.url.length)
        .split("&");

      let filterType;
      let filterArray = [];

      for (let i = 0; i < queryArray.length; i++) {
        // Security: Use more robust parsing with validation
        const queryParam = queryArray[i];

        // Extract filter type safely
        if (queryParam.includes("filters")) {
          if (queryParam.includes("price")) {
            filterType = "price";
          } else if (queryParam.includes("rating")) {
            filterType = "rating";
          } else if (queryParam.includes("category")) {
            filterType = "category";
          } else if (queryParam.includes("quantity")) {
            filterType = "quantity";
          } else if (queryParam.includes("inStock")) {
            filterType = "inStock";
          } else {
            // Skip unknown filter types
            continue;
          }
        }

        if (queryParam.includes("sort")) {
          // Security: Validate sort value
          const extractedSortValue = queryParam.substring(
            queryParam.indexOf("=") + 1
          );
          if (validateSortValue(extractedSortValue)) {
            sortByValue = extractedSortValue;
          }
        }

        // Security: Extract filter parameters safely
        if (queryParam.includes("filters") && filterType) {
          let filterValue;

          // Extract filter value based on type
          if (filterType === "category") {
            filterValue = queryParam.substring(queryParam.indexOf("=") + 1);
          } else {
            const numValue = parseInt(
              queryParam.substring(queryParam.indexOf("=") + 1)
            );
            filterValue = isNaN(numValue) ? null : numValue;
          }

          // Extract operator safely
          const operatorStart = queryParam.indexOf("$") + 1;
          const operatorEnd = queryParam.indexOf("=") - 1;

          if (operatorStart > 0 && operatorEnd > operatorStart) {
            const filterOperator = queryParam.substring(
              operatorStart,
              operatorEnd
            );

            // Only add to filter array if all values are valid
            if (filterValue !== null && filterOperator) {
              filterArray.push({
                filterType,
                filterOperator,
                filterValue,
              });
            }
          }
        }
      }

      // Security: Build filter object using safe function
      filterObj = buildSafeFilterObject(filterArray);
    }

    let whereClause = { ...filterObj };

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

    // Validate price is not negative
    if (price < 0) {
      throw new AppError("Price cannot be negative", 400);
    }

    // Validate costPrice if provided
    if (costPrice !== undefined && costPrice < 0) {
      throw new AppError("Cost price cannot be negative", 400);
    }
  }

  if (!categoryId) {
    throw new AppError("Missing required field: categoryId", 400);
  }

  const product = await prisma.product.create({
    data: {
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
  return response.status(201).json(product);
});

// Method for updating existing product
const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const {
    merchantId,
    title,
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
  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },
    data: {
      merchantId: merchantId,
      title: title,
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

  return response.status(200).json(updatedProduct);
});

// Method for deleting a product
const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Delete all related records first to avoid foreign key constraint
  await prisma.$transaction([
    // Delete from cart
    prisma.cart.deleteMany({
      where: { productId: id },
    }),
    // Delete from wishlist
    prisma.wishlist.deleteMany({
      where: { productId: id },
    }),
    // Delete from customer_order_product
    prisma.customer_order_product.deleteMany({
      where: { productId: id },
    }),
    // Delete from review
    prisma.review.deleteMany({
      where: { productId: id },
    }),
    // Finally delete the product
    prisma.product.delete({
      where: { id },
    }),
  ]);

  return response.status(204).send();
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
