// Script untuk testing sistem type
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function testCategoryTypes() {
  try {
    console.log('🧪 Testing category types system...\n');
    
    // Ambil semua kategori dengan detail
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log('📋 Complete Categories List:');
    console.log('=' .repeat(50));
    
    let collectionCount = 0;
    let categoryCount = 0;
    
    categories.forEach((cat, index) => {
      const typeIcon = cat.type === 'COLLECTION' ? '📦' : '🏷️';
      const typeLabel = cat.type === 'COLLECTION' ? 'Collection' : 'Category';
      const badge = cat.type === 'COLLECTION' ? '[BLUE]' : '[GRAY]';
      
      console.log(`${index + 1}. ${typeIcon} ${cat.name}`);
      console.log(`   Type: ${typeLabel} ${badge}`);
      console.log(`   Products: ${cat._count.products}`);
      console.log(`   Description: ${cat.description || 'No description'}`);
      console.log('');
      
      if (cat.type === 'COLLECTION') collectionCount++;
      else categoryCount++;
    });

    console.log('📊 Summary:');
    console.log(`📦 Collections: ${collectionCount} (Shows on Homepage)`);
    console.log(`🏷️  Categories: ${categoryCount} (For Product Filtering)`);
    console.log(`📈 Total: ${categories.length} categories`);

    console.log('\n✅ System verification completed!');
    console.log('\n🎯 Next steps:');
    console.log('1. Check Admin Dashboard → Categories');
    console.log('2. Check Homepage → Only Collections should appear');
    console.log('3. Check Product Filters → Both Collections and Categories');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoryTypes();
