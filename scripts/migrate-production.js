// Script untuk migration production database
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function migrateProductionDatabase() {
  try {
    console.log('🚀 Starting production database migration...');
    
    // Test connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if type column exists
    console.log('🔍 Checking if type column exists...');
    const categories = await prisma.category.findMany({
      take: 1
    });
    
    if (categories.length > 0 && !categories[0].type) {
      console.log('⚠️  Type column does not exist. Adding default values...');
      
      // Update all existing categories to have COLLECTION type
      const updateResult = await prisma.category.updateMany({
        data: {
          type: 'COLLECTION'
        }
      });
      
      console.log(`✅ Updated ${updateResult.count} categories to COLLECTION type`);
    } else {
      console.log('✅ Type column already exists');
    }
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${allCategories.length} categories:`);
    
    const collections = allCategories.filter(cat => cat.type === 'COLLECTION');
    const categories = allCategories.filter(cat => cat.type === 'CATEGORY');
    
    console.log(`📦 Collections: ${collections.length}`);
    collections.forEach(cat => console.log(`   - ${cat.name} (${cat._count.products} products)`));
    
    console.log(`🏷️  Categories: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat._count.products} products)`));
    
    console.log('\n✅ Production database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    if (error.code === 'P2021') {
      console.log('\n💡 Solution: The table does not exist. Please run:');
      console.log('   npx prisma db push');
    } else if (error.code === 'P1001') {
      console.log('\n💡 Solution: Cannot reach database server. Please check:');
      console.log('   1. DATABASE_URL in environment variables');
      console.log('   2. Database server is running');
      console.log('   3. Network connectivity');
    }
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductionDatabase();
