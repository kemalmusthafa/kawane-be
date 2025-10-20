// Script untuk membersihkan data dummy dengan field type
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function cleanDummyData() {
  try {
    console.log('🧹 Cleaning up dummy data with type field...');
    
    // Test connection first
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check current categories
    console.log('\n📊 Current categories:');
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log(`Found ${categories.length} categories:`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat._count.products} products)`);
    });
    
    // Find categories that might have type field issues
    console.log('\n🔍 Checking for problematic categories...');
    
    // Try to find categories that might cause issues
    const problematicCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('bags') ||
      cat.name.toLowerCase().includes('shirts') ||
      cat.name.toLowerCase().includes('jackets') ||
      cat.name.toLowerCase().includes('pants') ||
      cat.name.toLowerCase().includes('accessories') ||
      cat.name.toLowerCase().includes('hats')
    );
    
    if (problematicCategories.length > 0) {
      console.log(`⚠️  Found ${problematicCategories.length} potentially problematic categories:`);
      problematicCategories.forEach(cat => {
        console.log(`   - ${cat.name}`);
      });
      
      console.log('\n🗑️  Removing problematic categories...');
      for (const category of problematicCategories) {
        try {
          // First, remove products associated with these categories
          const products = await prisma.product.findMany({
            where: { categoryId: category.id }
          });
          
          if (products.length > 0) {
            console.log(`   Removing ${products.length} products from ${category.name}...`);
            await prisma.product.deleteMany({
              where: { categoryId: category.id }
            });
          }
          
          // Then remove the category
          await prisma.category.delete({
            where: { id: category.id }
          });
          
          console.log(`   ✅ Removed category: ${category.name}`);
        } catch (error) {
          console.log(`   ❌ Failed to remove ${category.name}: ${error.message}`);
        }
      }
    } else {
      console.log('✅ No problematic categories found');
    }
    
    // Final verification
    console.log('\n🎯 Final verification:');
    const finalCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log(`📊 Remaining categories: ${finalCategories.length}`);
    finalCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat._count.products} products)`);
    });
    
    console.log('\n✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    if (error.message.includes('type')) {
      console.log('\n💡 This error suggests there are still type field issues.');
      console.log('   You may need to manually clean the database or run a migration.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

cleanDummyData();
