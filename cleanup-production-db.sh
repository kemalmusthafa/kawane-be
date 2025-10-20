#!/bin/bash

# Script untuk cleanup database di production
echo "🧹 Cleaning up database in production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running Prisma generate..."
npx prisma generate

echo "📊 Pushing schema to production database..."
echo "⚠️  This will remove the type column and dummy data"
npx prisma db push --accept-data-loss

echo "🔍 Verifying database cleanup..."
node -e "
const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function verifyCleanup() {
  try {
    await prisma.\$connect();
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, _count: { select: { products: true } } }
    });
    
    console.log('📊 Categories after cleanup:');
    categories.forEach((cat, index) => {
      console.log(\`\${index + 1}. \${cat.name} (\${cat._count.products} products)\`);
    });
    
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyCleanup();
"

echo "✅ Database cleanup completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Test backend build: npm run build"
echo "2. Test backend start: npm start"
echo "3. Verify no more type field errors"
