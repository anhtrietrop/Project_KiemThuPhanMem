const prisma = require('./utills/db');

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({ take: 5 });
    console.log('Products in database:');
    products.forEach(p => console.log('Slug:', p.slug, 'Title:', p.title));
    
    // Check specific slug
    const specificProduct = await prisma.product.findFirst({
      where: { slug: 'smart-phone-demo' }
    });
    console.log('\nSpecific product (smart-phone-demo):', specificProduct);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

checkProducts();
