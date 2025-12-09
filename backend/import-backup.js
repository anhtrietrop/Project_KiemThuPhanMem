const mysql = require("mysql2/promise");
const fs = require("fs");

async function importData() {
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

    // Read SQL file
    const sql = fs.readFileSync("../database_backup/data_import.sql", "utf8");

    // Disable foreign key checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    console.log("✓ Disabled foreign key checks");

    // Split by semicolons and filter valid statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((s) => !s.startsWith("--"))
      .filter((s) => !s.startsWith("/*"))
      .filter((s) => s.toUpperCase().includes("INSERT"));

    console.log(`Found ${statements.length} INSERT statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.execute(statements[i]);
        console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        console.log(
          `⚠ Warning on statement ${i + 1}: ${error.message.substring(0, 100)}`
        );
      }
    }

    // Re-enable foreign key checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✓ Re-enabled foreign key checks");

    console.log("\n✅ Data import completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

importData();
