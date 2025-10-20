// Script untuk memperbaiki environment variables di Vercel
const { PrismaClient } = require('../prisma/generated/client');

async function fixVercelEnvironment() {
  console.log('🔧 Fixing Vercel environment variables...');
  
  // Test different database URLs
  const databaseUrls = [
    process.env.DATABASE_URL,
    process.env.DIRECT_URL,
    'postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  ];
  
  console.log('🔍 Testing database connections...');
  
  for (let i = 0; i < databaseUrls.length; i++) {
    const url = databaseUrls[i];
    if (!url) continue;
    
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
      const count = await prisma.category.count();
      console.log(`📊 Found ${count} categories`);
      
      await prisma.$disconnect();
      
      console.log(`\n🎯 Recommended DATABASE_URL for Vercel:`);
      console.log(url);
      break;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n💡 Vercel Environment Variables Setup:');
  console.log('1. Go to Vercel Dashboard → kawane-be project');
  console.log('2. Go to Settings → Environment Variables');
  console.log('3. Add/Update these variables:');
  console.log('   - DATABASE_URL: [Use the working URL above]');
  console.log('   - DIRECT_URL: [Use the direct connection URL]');
  console.log('   - NODE_ENV: production');
  console.log('4. Redeploy the project');
}

fixVercelEnvironment().catch(console.error);
