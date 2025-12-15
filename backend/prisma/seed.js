/**
 * Database Seed Script - Simplified for E-commerce Project
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  console.log("🗑️  Cleaning existing data...");
  await prisma.customer_order_product.deleteMany();
  await prisma.customer_order.deleteMany();
  await prisma.cartitem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin User
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.create({
    data: {
      id: "admin-uuid-001",
      email: "admin@singitronic.com",
      password: hashedPassword,
      name: "System Administrator",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // 2. Create Sample Users
  console.log("👥 Creating sample users...");
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        id: `user-uuid-00${i}`,
        email: `user${i}@test.com`,
        password: hashedPassword,
        name: `Test User ${i}`,
        phone: `012345678${i}`,
        role: "USER",
        status: "ACTIVE",
      },
    });
    users.push(user);
  }

  // 3. Create Categories
  console.log("📂 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: "cat-001",
        name: "Electronics",
      },
    }),
    prisma.category.create({
      data: {
        id: "cat-002",
        name: "Fashion",
      },
    }),
    prisma.category.create({
      data: {
        id: "cat-003",
        name: "Home & Living",
      },
    }),
    prisma.category.create({
      data: {
        id: "cat-004",
        name: "Books",
      },
    }),
    prisma.category.create({
      data: {
        id: "cat-005",
        name: "Sports",
      },
    }),
  ]);

  // 4. Create Merchants
  console.log("🏪 Creating merchants...");
  const merchant1 = await prisma.merchant.create({
    data: {
      businessName: "TechStore Vietnam",
      businessAddress: "123 Tech Street, District 1, HCMC",
      businessPhone: "0901234567",
      businessEmail: "contact@techstore.vn",
      taxCode: "TAX001",
      status: "APPROVED",
      userId: users[0].id,
    },
  });

  const merchant2 = await prisma.merchant.create({
    data: {
      businessName: "Fashion Hub",
      businessAddress: "456 Fashion Avenue, District 3, HCMC",
      businessPhone: "0907654321",
      businessEmail: "hello@fashionhub.vn",
      taxCode: "TAX002",
      status: "APPROVED",
      userId: users[1].id,
    },
  });

  // 5. Create Products
  console.log("📦 Creating products...");
  const products = [];

  // Electronics products
  for (let i = 1; i <= 10; i++) {
    const product = await prisma.product.create({
      data: {
        name: `Laptop Gaming ${i}`,
        slug: `laptop-gaming-${i}`,
        description: `High-performance gaming laptop with latest specs - Model ${i}`,
        price: 15000000 + i * 1000000,
        stock: 50 + i * 5,
        categoryId: categories[0].id,
        merchantId: merchant1.id,
        status: "ACTIVE",
      },
    });
    products.push(product);
  }

  // Fashion products
  for (let i = 1; i <= 10; i++) {
    const product = await prisma.product.create({
      data: {
        name: `T-Shirt Collection ${i}`,
        slug: `tshirt-collection-${i}`,
        description: `Premium cotton t-shirt - Style ${i}`,
        price: 200000 + i * 50000,
        stock: 100 + i * 10,
        categoryId: categories[1].id,
        merchantId: merchant2.id,
        status: "ACTIVE",
      },
    });
    products.push(product);
  }

  // Home products
  for (let i = 1; i <= 5; i++) {
    const product = await prisma.product.create({
      data: {
        name: `Sofa Set ${i}`,
        slug: `sofa-set-${i}`,
        description: `Modern sofa set for living room - Design ${i}`,
        price: 5000000 + i * 500000,
        stock: 20 + i * 2,
        categoryId: categories[2].id,
        merchantId: merchant1.id,
        status: "ACTIVE",
      },
    });
    products.push(product);
  }

  // Books
  for (let i = 1; i <= 5; i++) {
    const product = await prisma.product.create({
      data: {
        name: `Programming Book ${i}`,
        slug: `programming-book-${i}`,
        description: `Learn programming with this comprehensive guide - Volume ${i}`,
        price: 150000 + i * 20000,
        stock: 200 + i * 20,
        categoryId: categories[3].id,
        merchantId: merchant2.id,
        status: "ACTIVE",
      },
    });
    products.push(product);
  }

  // 6. Create Sample Orders
  console.log("🛒 Creating sample orders...");
  for (let i = 0; i < 3; i++) {
    const user = users[i];
    const userAddress = await prisma.address.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: userAddress.id,
        status: i === 0 ? "DELIVERED" : i === 1 ? "SHIPPING" : "PENDING",
        paymentMethod: i % 2 === 0 ? "COD" : "MOMO",
        paymentStatus: i === 0 ? "PAID" : "UNPAID",
        subtotal: products[i].price * 2,
        shippingFee: 30000,
        total: products[i].price * 2 + 30000,
      },
    });

    // Create order items
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: products[i].id,
        quantity: 2,
        price: products[i].price,
      },
    });
  }

  // 7. Create Sample Reviews
  console.log("⭐ Creating sample reviews...");
  for (let i = 0; i < 5; i++) {
    await prisma.review.create({
      data: {
        userId: users[i].id,
        productId: products[i].id,
        rating: 4 + (i % 2),
        comment: `Great product! Very satisfied with my purchase. Would recommend to others.`,
      },
    });
  }

  console.log("✅ Seeding completed successfully!");
  console.log(`
  📊 Summary:
  - Users: ${users.length + 1} (including admin)
  - Categories: ${categories.length}
  - Merchants: 2
  - Products: ${products.length}
  - Orders: 3
  - Reviews: 5
  
  🔐 Admin Credentials:
  Email: admin@singitronic.com
  Password: admin123
  
  👤 Test User Credentials:
  Email: user1@test.com (to user5@test.com)
  Password: admin123
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
