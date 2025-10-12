const mysql = require('mysql2/promise');

async function testMySQLConnection() {
    console.log('🔍 Testing MySQL Connection...\n');

    // Các cấu hình thường dùng để test
    const configs = [
        {
            name: 'Default MySQL Workbench',
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'singitronic_nextjs_db'
        },
        {
            name: 'Empty Password',
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'singitronic_nextjs_db'
        },
        {
            name: 'Password: password',
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'password',
            database: 'singitronic_nextjs_db'
        },
        {
            name: 'Password: 123456',
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '123456',
            database: 'singitronic_nextjs_db'
        }
    ];

    for (const config of configs) {
        try {
            console.log(`Testing: ${config.name}`);
            console.log(`Host: ${config.host}:${config.port}`);
            console.log(`User: ${config.user}`);
            console.log(`Password: ${config.password ? '***' : '(empty)'}`);
            console.log(`Database: ${config.database}`);

            const connection = await mysql.createConnection(config);
            await connection.ping();
            console.log('✅ Connection successful!\n');

            // Test database exists
            const [databases] = await connection.execute('SHOW DATABASES');
            const dbExists = databases.some(db => db.Database === config.database);

            if (dbExists) {
                console.log(`✅ Database '${config.database}' exists`);
            } else {
                console.log(`⚠️  Database '${config.database}' does not exist`);
                console.log('Available databases:');
                databases.forEach(db => console.log(`  - ${db.Database}`));
            }

            await connection.end();

            // Generate DATABASE_URL
            const databaseUrl = `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
            console.log(`\n📋 DATABASE_URL for .env file:`);
            console.log(`DATABASE_URL="${databaseUrl}"`);

            return config;

        } catch (error) {
            console.log(`❌ Connection failed: ${error.message}\n`);
        }
    }

    console.log('❌ All connection attempts failed.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MySQL Server is running');
    console.log('2. Check MySQL Workbench connection settings');
    console.log('3. Verify username and password');
    console.log('4. Ensure database exists');
    console.log('5. Check if MySQL is running on port 3306');

    return null;
}

// Test connection
testMySQLConnection().then((workingConfig) => {
    if (workingConfig) {
        console.log('\n🎉 Found working configuration!');
        console.log('Create a .env file in the backend folder with the DATABASE_URL shown above.');
    }
}).catch(console.error);
