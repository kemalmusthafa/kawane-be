// Script untuk memverifikasi dan mengupdate kategori existing
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function verifyAndUpdateCategories() {
  try {
    console.log('🔍 Checking existing categories...');
    
    // Ambil semua kategori
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log(`📊 Found ${categories.length} categories:`);
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   - Type: ${category.type}`);
      console.log(`   - Products: ${category._count.products}`);
      console.log(`   - Description: ${category.description || 'No description'}`);
      console.log('');
    });

    // Update kategori yang belum memiliki type
    const categoriesWithoutType = categories.filter(cat => !cat.type);
    
    if (categoriesWithoutType.length > 0) {
      console.log(`⚠️  Found ${categoriesWithoutType.length} categories without type. Updating...`);
      
      for (const category of categoriesWithoutType) {
        await prisma.category.update({
          where: { id: category.id },
          data: { type: 'COLLECTION' }
        });
        console.log(`✅ Updated ${category.name} to COLLECTION`);
      }
    } else {
      console.log('✅ All categories already have type assigned');
    }

    // Verifikasi final
    const updatedCategories = await prisma.category.findMany();
    console.log('\n🎯 Final verification:');
    
    const collections = updatedCategories.filter(cat => cat.type === 'COLLECTION');
    const categoriesList = updatedCategories.filter(cat => cat.type === 'CATEGORY');
    
    console.log(`📦 Collections (${collections.length}):`);
    collections.forEach(cat => console.log(`   - ${cat.name}`));
    
    console.log(`🏷️  Categories (${categoriesList.length}):`);
    categoriesList.forEach(cat => console.log(`   - ${cat.name}`));

    console.log('\n✅ Database verification completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAndUpdateCategories();
