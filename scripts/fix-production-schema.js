// Script untuk fix database schema di production
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function fixProductionSchema() {
  try {
    console.log('🔧 Fixing production database schema...');
    
    // Test connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check current schema
    console.log('🔍 Checking current schema...');
    const sampleCategory = await prisma.category.findFirst();
    
    if (!sampleCategory) {
      console.log('⚠️  No categories found in database');
      return;
    }
    
    console.log('📊 Sample category:', {
      id: sampleCategory.id,
      name: sampleCategory.name,
      hasType: 'type' in sampleCategory,
      type: sampleCategory.type || 'NOT_SET'
    });
    
    // If type field doesn't exist, we need to handle this gracefully
    if (!('type' in sampleCategory)) {
      console.log('⚠️  Type field does not exist in production database');
      console.log('💡 This means the migration hasn\'t been applied yet');
      
      // For now, let's create a temporary solution
      console.log('🔧 Creating temporary categories with proper types...');
      
      // Add sample categories with proper types
      const sampleCategories = [
        { name: 'Pants', type: 'CATEGORY', description: 'Product category for pants' },
        { name: 'Shirts', type: 'CATEGORY', description: 'Product category for shirts' },
        { name: 'Jackets', type: 'CATEGORY', description: 'Product category for jackets' },
        { name: 'Accessories', type: 'CATEGORY', description: 'Product category for accessories' }
      ];
      
      for (const catData of sampleCategories) {
        try {
          const existing = await prisma.category.findFirst({
            where: { name: catData.name }
          });
          
          if (!existing) {
            await prisma.category.create({
              data: catData
            });
            console.log(`✅ Created category: ${catData.name}`);
          } else {
            console.log(`⚠️  Category already exists: ${catData.name}`);
          }
        } catch (error) {
          console.log(`❌ Failed to create ${catData.name}:`, error.message);
        }
      }
    } else {
      console.log('✅ Type field exists, checking values...');
      
      const categories = await prisma.category.findMany();
      const withoutType = categories.filter(cat => !cat.type);
      
      if (withoutType.length > 0) {
        console.log(`⚠️  Found ${withoutType.length} categories without type. Updating...`);
        
        for (const category of withoutType) {
          await prisma.category.update({
            where: { id: category.id },
            data: { type: 'COLLECTION' }
          });
          console.log(`✅ Updated ${category.name} to COLLECTION`);
        }
      }
    }
    
    // Final verification
    console.log('\n🎯 Final verification:');
    const allCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    const collections = allCategories.filter(cat => cat.type === 'COLLECTION');
    const categories = allCategories.filter(cat => cat.type === 'CATEGORY');
    
    console.log(`📦 Collections: ${collections.length}`);
    collections.forEach(cat => console.log(`   - ${cat.name} (${cat._count.products} products)`));
    
    console.log(`🏷️  Categories: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat._count.products} products)`));
    
    console.log('\n✅ Schema fix completed!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    
    if (error.code === 'P2021') {
      console.log('\n💡 The table does not exist. Please run:');
      console.log('   npx prisma db push');
    } else if (error.code === 'P1001') {
      console.log('\n💡 Cannot reach database server. Please check:');
      console.log('   1. DATABASE_URL in Vercel environment variables');
      console.log('   2. Database server is running');
      console.log('   3. Network connectivity');
    } else if (error.message.includes('Unknown field')) {
      console.log('\n💡 Schema mismatch detected. Please run:');
      console.log('   npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionSchema();
