const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const adminEmail = "admin@example.com";
const adminPassword = "admin123"; // Change this in production for security
const hashedPassword = bcrypt.hashSync(adminPassword, 10);

async function insertAdminUser() {
    try {
        await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                role: "admin",
                password: hashedPassword,
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
            },
        });
        console.log(`✅ Admin user created/updated successfully!`);
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log(`💡 Login URL: http://localhost:3001/login`);
        console.log(`⚠️  Note: Only users with role='admin' can access the admin panel.`);
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

insertAdminUser();
