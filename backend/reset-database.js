const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: "mysql-113d396c-anhtrietrop-c340.j.aivencloud.com",
    port: 17368,
    user: "avnadmin",
    password: "AVNS_vOxavUE1Bc5hiqpyggA",
    database: "defaultdb",
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  try {
    console.log("Connected to Aiven MySQL database");

    // Disable foreign key checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    console.log("✓ Disabled foreign key checks");

    // Get all tables
    const [tables] = await connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'defaultdb'"
    );

    // Drop all tables
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`✓ Dropped table: ${tableName}`);
    }

    console.log("✓ All tables dropped");

    // Re-enable foreign key checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✓ Re-enabled foreign key checks");

    console.log("\n--- Database reset complete ---");
    console.log("Now run: npx prisma migrate deploy");
    console.log("Then run: node import-data.js to restore data");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

resetDatabase();
