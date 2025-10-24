const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start creating test data...');

  // 1. Create a test merchant
  const merchant = await prisma.merchant.upsert({
    where: { id: 'test-merchant-id' },
    update: {},
    create: {
      id: 'test-merchant-id',
      name: 'Test Merchant',
      description: 'A merchant for testing purposes',
      email: 'merchant@test.com',
    },
  });
  console.log('Test merchant created/found:', merchant);

  // 2. Create a test category
  const category = await prisma.category.upsert({
    where: { name: 'Test Category' },
    update: {},
    create: {
      name: 'Test Category',
    },
  });
  console.log('Test category created/found:', category);

  // 3. Create a test product
  const product = await prisma.product.upsert({
    where: { slug: 'test-product-slug' },
    update: {},
    create: {
      id: 'test-product-id',
      slug: 'test-product-slug',
      title: 'Test Product',
      mainImage: 'test-image.jpg',
      price: 99.99,
      quantity: 10,
      description: 'This is a test product.',
      manufacturer: 'Test Manufacturer',
      categoryId: category.id,
      merchantId: merchant.id,
    },
  });
  console.log('Test product created/found:', product);

  console.log('Test data creation finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

