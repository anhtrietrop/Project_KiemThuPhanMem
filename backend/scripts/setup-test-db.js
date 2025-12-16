const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.test' });

async function createTestDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is missing in .env.test');
        process.exit(1);
    }

    // Parse connection string manually or use specific params
    // "mysql://root:rootpassword123@localhost:3307/test_ecommerce_db"

    try {
        const url = new URL(dbUrl);
        const connectionParams = {
            host: url.hostname,
            port: url.port || 3306,
            user: url.username,
            password: url.password,
        };

        const dbName = url.pathname.substring(1); // Remove leading /

        console.log(`🔌 Connecting to MySQL at ${connectionParams.host}:${connectionParams.port}...`);

        // Connect without database selected
        const connection = await mysql.createConnection(connectionParams);

        console.log(`🔨 Creating database '${dbName}' if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

        console.log(`✅ Database '${dbName}' created/verified successfully.`);
        await connection.end();
    } catch (error) {
        console.error('❌ Failed to create database:', error.message);
        console.log('\n💡 Tip: Check if your MySQL server is running and credentials in .env.test are correct.');
        process.exit(1);
    }
}

createTestDatabase();
