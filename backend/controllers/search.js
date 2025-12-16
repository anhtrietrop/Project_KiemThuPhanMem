const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function searchProducts(request, response) {
  try {
    const query = (request.query.query || "").toString().trim();

    // If no query provided, return empty results (200) instead of Bad Request.
    if (query === "") {
      return response.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
    });

    return response.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    return response.status(500).json({ error: "Error searching products" });
  }
}

module.exports = { searchProducts };
