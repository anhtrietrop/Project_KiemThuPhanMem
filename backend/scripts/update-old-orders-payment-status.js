/**
 * Migration script to update old orders with payment_status
 * This script will set payment_status = 'PENDING' for all orders that don't have it set
 */

const prisma = require('../utills/db');

async function updateOldOrdersPaymentStatus() {
  try {
    console.log('🔄 Starting migration: Update old orders with payment_status...\n');

    // Find all orders without payment_status (NULL or undefined)
    const ordersWithoutPaymentStatus = await prisma.customer_order.findMany({
      where: {
        payment_status: null
      },
      select: {
        id: true,
        status: true,
        dateTime: true,
        email: true
      }
    });

    console.log(`📊 Found ${ordersWithoutPaymentStatus.length} orders without payment_status\n`);

    if (ordersWithoutPaymentStatus.length === 0) {
      console.log('✅ All orders already have payment_status set. No migration needed.');
      return;
    }

    // Update all orders without payment_status to 'PENDING'
    const result = await prisma.customer_order.updateMany({
      where: {
        payment_status: null
      },
      data: {
        payment_status: 'PENDING',
        updated_at: new Date()
      }
    });

    console.log(`✅ Successfully updated ${result.count} orders`);
    console.log('\n📋 Migration Summary:');
    console.log(`   - Orders updated: ${result.count}`);
    console.log(`   - Default payment_status: PENDING`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);
    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  updateOldOrdersPaymentStatus()
    .then(() => {
      console.log('👋 Script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { updateOldOrdersPaymentStatus };
