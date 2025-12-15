const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dpsiy73bv/image/upload";

async function updateProductImages() {
  try {
    console.log("Starting product image update...");

    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        mainImage: true,
        title: true,
      },
    });

    console.log(`Found ${products.length} products`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const { id, mainImage, title } = product;

      // Skip if already a full URL
      if (
        mainImage &&
        (mainImage.startsWith("http://") || mainImage.startsWith("https://"))
      ) {
        console.log(`Skipping "${title}" - already has full URL`);
        skippedCount++;
        continue;
      }

      // Skip if null or empty
      if (!mainImage) {
        console.log(`Skipping "${title}" - no image`);
        skippedCount++;
        continue;
      }

      // Construct Cloudinary URL
      const hasExtension = /\.(jpg|jpeg|png|webp|gif)$/i.test(mainImage);
      const fileName = hasExtension ? mainImage : `${mainImage}.webp`;
      const newImageUrl = `${CLOUDINARY_BASE_URL}/${fileName}`;

      // Update product
      await prisma.product.update({
        where: { id },
        data: { mainImage: newImageUrl },
      });

      console.log(`✓ Updated "${title}": ${mainImage} → ${newImageUrl}`);
      updatedCount++;
    }

    console.log("\n=== Summary ===");
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log("Done!");
  } catch (error) {
    console.error("Error updating images:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages();
