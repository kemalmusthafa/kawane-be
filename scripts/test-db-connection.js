// Script untuk test koneksi database dengan berbagai URL
const { PrismaClient } = require('../prisma/generated/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connections...');
  
  const urls = [
    'postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    'postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
  ];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n${i + 1}. Testing URL: ${url.substring(0, 50)}...`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: url
          }
        }
      });
      
      await prisma.$connect();
      console.log('✅ Connection successful!');
      
      // Test a simple query
      const categories = await prisma.category.findMany({
        take: 3,
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
      
      console.log(`📊 Found ${categories.length} categories:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat._count.products} products)`);
      });
      
      await prisma.$disconnect();
      console.log('✅ Test completed successfully!');
      
      console.log(`\n🎯 Working DATABASE_URL: ${url}`);
      break;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
}

testDatabaseConnection().catch(console.error);
