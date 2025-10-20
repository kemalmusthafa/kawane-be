// Script untuk menambahkan kategori contoh
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function addSampleCategories() {
  try {
    console.log('🏷️  Adding sample categories...');
    
    // Tambahkan kategori untuk tipe produk
    const sampleCategories = [
      {
        name: 'Pants',
        type: 'CATEGORY',
        description: 'Product category for pants and trousers'
      },
      {
        name: 'Shirts',
        type: 'CATEGORY', 
        description: 'Product category for shirts and tops'
      },
      {
        name: 'Jackets',
        type: 'CATEGORY',
        description: 'Product category for jackets and outerwear'
      },
      {
        name: 'Accessories',
        type: 'CATEGORY',
        description: 'Product category for accessories like bags, hats, etc'
      }
    ];

    for (const categoryData of sampleCategories) {
      // Cek apakah kategori sudah ada
      const existing = await prisma.category.findFirst({
        where: { name: categoryData.name }
      });

      if (existing) {
        console.log(`⚠️  Category "${categoryData.name}" already exists`);
      } else {
        const newCategory = await prisma.category.create({
          data: categoryData
        });
        console.log(`✅ Created category: ${newCategory.name} (${newCategory.type})`);
      }
    }

    // Verifikasi hasil
    console.log('\n🎯 Final categories list:');
    const allCategories = await prisma.category.findMany({
      orderBy: { type: 'asc' }
    });

    const collections = allCategories.filter(cat => cat.type === 'COLLECTION');
    const categories = allCategories.filter(cat => cat.type === 'CATEGORY');

    console.log(`📦 Collections (${collections.length}):`);
    collections.forEach(cat => console.log(`   - ${cat.name}`));

    console.log(`🏷️  Categories (${categories.length}):`);
    categories.forEach(cat => console.log(`   - ${cat.name}`));

    console.log('\n✅ Sample categories added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleCategories();
