#!/bin/bash

# Script untuk fix Vercel environment variables dan database connection
echo "🔧 Fixing Vercel environment variables and database connection..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running Prisma generate..."
npx prisma generate

echo "📊 Testing database connection..."
node -e "
const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.\$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const count = await prisma.category.count();
    console.log(\`📊 Found \${count} categories in database\`);
    
    await prisma.\$disconnect();
    console.log('✅ Connection test completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Check Vercel dashboard for deployment status"
echo "2. Verify environment variables are set correctly"
echo "3. Test the API endpoints"
echo "4. Check if database connection is working"
