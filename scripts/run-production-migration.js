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

    // Migration 3: Order WhatsApp fields
    console.log('\n📱 Checking Order WhatsApp fields...');
    const orderWhatsAppFields = ['isWhatsAppOrder', 'whatsappMessage', 'whatsappOrderId', 'whatsappPhoneNumber'];
    
    for (const field of orderWhatsAppFields) {
      const fieldExists = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = ${field}
      `;

      if (fieldExists.length === 0) {
        console.log(`   → Adding Order.${field} column...`);
        if (field === 'isWhatsAppOrder') {
          await prisma.$executeRaw`ALTER TABLE "Order" ADD COLUMN "isWhatsAppOrder" BOOLEAN NOT NULL DEFAULT false;`;
        } else {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN "${field}" TEXT;`);
        }
        console.log(`   ✅ Order.${field} column added successfully!`);
      } else {
        console.log(`   ✓ Order.${field} column already exists`);
      }
    }

    // Create unique index for whatsappOrderId if not exists
    console.log('\n🔑 Checking Order_whatsappOrderId_key index...');
    const indexExists = await prisma.$queryRaw`
      SELECT 1 
      FROM pg_indexes 
      WHERE tablename = 'Order' 
      AND indexname = 'Order_whatsappOrderId_key'
    `;

    if (indexExists.length === 0) {
      console.log('   → Creating unique index for whatsappOrderId...');
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Order_whatsappOrderId_key" ON "Order"("whatsappOrderId");`;
      console.log('   ✅ Unique index created successfully!');
    } else {
      console.log('   ✓ Unique index already exists');
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

