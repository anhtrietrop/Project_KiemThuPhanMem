const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log("🔍 Checking Aiven MySQL data...\n");

    const products = await prisma.product.count();
    const categories = await prisma.category.count();
    const users = await prisma.user.count();
    const merchants = await prisma.merchant.count();
    const orders = await prisma.customer_orders.count();

    console.log("📊 Database Statistics:");
    console.log(`   Products: ${products}`);
    console.log(`   Categories: ${categories}`);
    console.log(`   Users: ${users}`);
    console.log(`   Merchants: ${merchants}`);
    console.log(`   Orders: ${orders}`);

    if (products === 0) {
      console.log("\n⚠️  Database is EMPTY! Need to import data.");
      console.log("\n📝 Import steps:");
      console.log("1. Open MySQL Workbench");
      console.log("2. Connect to Aiven");
      console.log("3. Server → Data Import");
      console.log("4. Import from: database_backup/full_database_dump.sql");
    } else {
      console.log("\n✅ Database has data!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
