const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://avnadmin:AVNS_vOxavUE1Bc5hiqpyggA@mysql-113d396c-anhtrietrop-c340.j.aivencloud.com:17368/defaultdb?ssl-mode=REQUIRED",
    },
  },
});

async function createAdminUser() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "anhtrietrop@gmail.com" },
    });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("123456", 14);

    const admin = await prisma.user.create({
      data: {
        email: "anhtrietrop@gmail.com",
        password: hashedPassword,
        role: "admin",
        status: "ACTIVE",
      },
    });

    console.log("✅ Admin user created:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: 123456`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
