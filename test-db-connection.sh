#!/bin/bash

# Script untuk fix database connection di production
echo "🚀 Fixing database connection in production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running Prisma generate..."
npx prisma generate

echo "🏗️  Building project..."
npm run build

echo "📊 Testing database connection..."
node -e "
const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await prisma.\$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, _count: { select: { products: true } } }
    });
    
    console.log('📊 Categories found:', categories.length);
    categories.forEach((cat, index) => {
      console.log(\`\${index + 1}. \${cat.name} (\${cat._count.products} products)\`);
    });
    
    await prisma.\$disconnect();
    console.log('✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

echo "✅ Database connection test completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Commit and push changes to trigger new deployment"
echo "2. Check Vercel dashboard for successful deployment"
echo "3. Verify API endpoints are working"
