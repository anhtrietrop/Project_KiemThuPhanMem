const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log("Reading SQL file...");
    const sql = fs.readFileSync("../database_backup/data_import.sql", "utf8");

    // Split by INSERT statements
    const statements = sql
      .split("\n")
      .filter((line) => line.trim().startsWith("INSERT INTO"))
      .filter((line) => !line.includes("_prisma_migrations")); // Skip migrations

    console.log(`Found ${statements.length} INSERT statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(stmt);
      }
    }

    console.log("✅ Data import completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
