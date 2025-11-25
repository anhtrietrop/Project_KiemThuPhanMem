// Setup chung cho tất cả tests
// This file runs before each test suite

// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';

// Set default values for CI environment if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://root:test_password@localhost:3307/test_ecommerce_db';
  console.log('ℹ️  Using default DATABASE_URL for CI environment');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-ci-environment-only-do-not-use-in-production';
  console.log('ℹ️  Using default JWT_SECRET for CI environment');
}

// Set other default environment variables for CI
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-for-ci-only';
}

if (!process.env.MOMO_ACCESS_KEY) {
  process.env.MOMO_ACCESS_KEY = 'test-momo-access-key';
}

if (!process.env.MOMO_SECRET_KEY) {
  process.env.MOMO_SECRET_KEY = 'test-momo-secret-key';
}

if (!process.env.MOMO_PARTNER_CODE) {
  process.env.MOMO_PARTNER_CODE = 'test-partner-code';
}

// Increase timeout for slow tests
jest.setTimeout(parseInt(process.env.TEST_TIMEOUT) || 10000);

// Track resources for cleanup
const activeConnections = new Set();
const createdResources = new Set();

// Mock external services to avoid real API calls
jest.mock('../services/momoPayment', () => ({
  createPayment: jest.fn().mockResolvedValue({
    payUrl: 'https://test-payment.momo.vn/mock',
    orderId: 'MOCK_ORDER_123',
    requestId: 'MOCK_REQUEST_123',
  }),
  verifySignature: jest.fn().mockReturnValue(true),
  checkTransaction: jest.fn().mockResolvedValue({
    resultCode: 0,
    message: 'Success',
  }),
}), { virtual: true });

jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
}), { virtual: true });

// Database connection management
let prisma;
let isDbInitialized = false;

async function initializeTestDatabase() {
  if (process.env.SKIP_DB === 'true') {
    console.log('⏩ Skipping Database Connection (Unit Test Mode)');
    return;
  }
  if (isDbInitialized) return;
  
  try {
    // Lazy load Prisma Client
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error'],
    });

    // Track connection
    activeConnections.add(prisma);
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to test database');
    
    isDbInitialized = true;
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error.message);
    console.error('\n⚠️  SETUP REQUIRED: Please create the test database first!');
    console.error('📋 Run this SQL command in MySQL Workbench or command line:');
    console.error('   CREATE DATABASE IF NOT EXISTS test_ecommerce_db;');
    console.error('\n📄 See TEST_DATABASE_SETUP.md for detailed instructions\n');
    throw error;
  }
}

async function cleanTestDatabase() {
if (process.env.SKIP_DB === 'true') return;

  if (!prisma) return;
  
  try {
    // Delete in correct order to respect foreign key constraints
    // Only use tables that actually exist in schema.prisma
    const tablesToClean = [
      'customer_order_product',  // Relations first
      'customer_order',
      'momopayment',
      'cartitem',
      'wishlist',
      'notification',
      'product',                 // Products after relations
      'category',
      'cart',
      'merchant',
      'user',                    // Users last
      'image',
      'ratelimitlog',
      'securitylog',
    ];

    for (const table of tablesToClean) {
      try {
        await prisma[table].deleteMany({});
      } catch (error) {
        // Bỏ qua lỗi nếu table không tồn tại
        if (!error.message.includes('does not exist') && !error.message.includes('Unknown arg')) {
          console.warn(`Warning: Could not clean table ${table}:`, error.message);
        }
      }
    }
    
    console.log('🧹 Test database cleaned');
  } catch (error) {
    console.error('❌ Failed to clean test database:', error.message);
    throw error;
  }
}

async function disconnectTestDatabase() {
if (process.env.SKIP_DB === 'true') return;

  if (!prisma) return;
  
  try {
    await prisma.$disconnect();
    activeConnections.delete(prisma);
    console.log('🔌 Disconnected from test database');
  } catch (error) {
    console.error('❌ Failed to disconnect from test database:', error.message);
  }
}

// Global setup - runs once before all test suites
beforeAll(async () => {
  console.log('');
  console.log('🧪 ============================================');
  console.log('🧪 Test Suite Starting');
  console.log('🧪 ============================================');
  console.log('📦 Environment:', process.env.NODE_ENV);
  console.log('🗄️  Database:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not Set');
  console.log('🚫 External Calls:', process.env.DISABLE_EXTERNAL_CALLS === 'true' ? 'Disabled' : 'Enabled');
  
  try {
    // Initialize database connection
    await initializeTestDatabase();
    
    // Clean database before tests
    await cleanTestDatabase();
    
    console.log('✅ Test environment ready');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    process.exit(1);
  }
});

// Global teardown - runs once after all test suites
afterAll(async () => {
  console.log('');
  console.log('🧹 ============================================');
  console.log('🧹 Cleaning Up Test Environment');
  console.log('🧹 ============================================');
  
  try {
    // Clean test data
    await cleanTestDatabase();
    
    // Disconnect from database
    await disconnectTestDatabase();
    
    // Clean up any remaining connections
    for (const connection of activeConnections) {
      try {
        if (connection.$disconnect) {
          await connection.$disconnect();
        }
      } catch (error) {
        console.warn('Warning: Failed to close connection:', error.message);
      }
    }
    activeConnections.clear();
    
    // Clean up created resources
    for (const resource of createdResources) {
      try {
        // Clean up files, temporary data, etc.
        if (typeof resource.cleanup === 'function') {
          await resource.cleanup();
        }
      } catch (error) {
        console.warn('Warning: Failed to cleanup resource:', error.message);
      }
    }
    createdResources.clear();
    
    console.log('✅ Test environment cleaned up');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to cleanup test environment:', error);
  }
});

// Reset state between tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Reset mock implementation counts
  if (process.env.DEBUG_TESTS) {
    console.log('🔄 Resetting mocks for next test');
  }
});

afterEach(async () => {
  // Additional cleanup if needed
  // Clean up any test-specific data created in the test
  
  // Note: Không clean toàn bộ database sau mỗi test
  // vì nó sẽ làm chậm test suite. Thay vào đó, mỗi test
  // nên tự clean up data của nó nếu cần thiết.
  
  if (process.env.DEBUG_TESTS) {
    console.log('✓ Test completed');
  }
});

// Export utilities for tests to use
module.exports = {
  getPrismaClient: () => prisma,
  cleanTestDatabase,
  trackResource: (resource) => createdResources.add(resource),
  untrackResource: (resource) => createdResources.delete(resource),
};
