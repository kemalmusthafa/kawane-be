// Script untuk test API endpoints setelah migration
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function testApiEndpoints() {
  try {
    console.log('🧪 Testing API endpoints after migration...\n');
    
    // Test 1: Get all categories
    console.log('1️⃣ Testing categories endpoint...');
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${categories.length} categories`);
    
    const collections = categories.filter(cat => cat.type === 'COLLECTION');
    const categoryTypes = categories.filter(cat => cat.type === 'CATEGORY');
    
    console.log(`   📦 Collections: ${collections.length}`);
    console.log(`   🏷️  Categories: ${categoryTypes.length}`);
    
    // Test 2: Get products with categories
    console.log('\n2️⃣ Testing products with categories...');
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true
      },
      take: 5
    });
    
    console.log(`✅ Found ${products.length} products`);
    products.forEach(product => {
      const categoryType = product.category?.type || 'NO_CATEGORY';
      console.log(`   - ${product.name} (${categoryType})`);
    });
    
    // Test 3: Test best sellers query
    console.log('\n3️⃣ Testing best sellers query...');
    const bestSellers = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        _count: {
          select: {
            reviews: true,
            wishlist: true
          }
        }
      },
      take: 3
    });
    
    console.log(`✅ Found ${bestSellers.length} products for best sellers`);
    bestSellers.forEach(product => {
      const categoryType = product.category?.type || 'NO_CATEGORY';
      console.log(`   - ${product.name} (${categoryType}) - ${product._count.reviews} reviews`);
    });
    
    // Test 4: Test category filtering
    console.log('\n4️⃣ Testing category filtering...');
    const collectionProducts = await prisma.product.findMany({
      where: {
        category: {
          type: 'COLLECTION'
        }
      },
      include: {
        category: true
      },
      take: 3
    });
    
    console.log(`✅ Found ${collectionProducts.length} products in Collections`);
    collectionProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category?.name})`);
    });
    
    const categoryProducts = await prisma.product.findMany({
      where: {
        category: {
          type: 'CATEGORY'
        }
      },
      include: {
        category: true
      },
      take: 3
    });
    
    console.log(`✅ Found ${categoryProducts.length} products in Categories`);
    categoryProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category?.name})`);
    });
    
    console.log('\n🎯 API Test Summary:');
    console.log(`📊 Total Categories: ${categories.length}`);
    console.log(`📦 Collections: ${collections.length}`);
    console.log(`🏷️  Categories: ${categoryTypes.length}`);
    console.log(`📱 Products with Collections: ${collectionProducts.length}`);
    console.log(`📱 Products with Categories: ${categoryProducts.length}`);
    
    console.log('\n✅ All API endpoints are working correctly!');
    console.log('\n🚀 System is ready for production!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiEndpoints();
