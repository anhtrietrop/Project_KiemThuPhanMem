const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://avnadmin:AVNS_vOxavUE1Bc5hiqpyggA@mysql-113d396c-anhtrietrop-c340.j.aivencloud.com:17368/defaultdb?ssl-mode=REQUIRED",
    },
  },
});

async function checkData() {
  try {
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const categories = await prisma.category.count();
    const merchants = await prisma.merchant.count();

    console.log("📊 Data count:");
    console.log(`   Users: ${users}`);
    console.log(`   Products: ${products}`);
    console.log(`   Categories: ${categories}`);
    console.log(`   Merchants: ${merchants}`);

    if (products > 0) {
      const sampleProduct = await prisma.product.findFirst();
      console.log("\n📦 Sample product:");
      console.log(`   ID: ${sampleProduct.id}`);
      console.log(`   Title: ${sampleProduct.title}`);
      console.log(`   Price: ${sampleProduct.price}`);
      console.log(`   Slug: ${sampleProduct.slug || "NULL"}`);
      console.log(`   Manufacturer: ${sampleProduct.manufacturer || "NULL"}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
