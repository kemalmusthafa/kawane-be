const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Starting migration to production database...\n');

    // Migration 1: OrderItem.size
    console.log('📦 Checking OrderItem.size column...');
    const orderItemSizeExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'OrderItem' 
      AND column_name = 'size'
    `;

    if (orderItemSizeExists.length === 0) {
      console.log('   → Adding OrderItem.size column...');
      await prisma.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN "size" TEXT;`;
      console.log('   ✅ OrderItem.size column added successfully!');
    } else {
      console.log('   ✓ OrderItem.size column already exists');
    }

    // Migration 2: Address.isDefault
    console.log('\n📍 Checking Address.isDefault column...');
    const addressIsDefaultExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Address' 
      AND column_name = 'isDefault'
    `;

    if (addressIsDefaultExists.length === 0) {
      console.log('   → Adding Address.isDefault column...');
      await prisma.$executeRaw`ALTER TABLE "Address" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;`;
      console.log('   ✅ Address.isDefault column added successfully!');
    } else {
      console.log('   ✓ Address.isDefault column already exists');
    }

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

