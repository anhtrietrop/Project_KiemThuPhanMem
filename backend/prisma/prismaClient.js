// Prisma Client Instance for Tests
// Exports a singleton instance of Prisma Client
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
