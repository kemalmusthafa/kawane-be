#!/bin/bash

# Script untuk deploy ulang dengan environment variables yang benar
echo "🚀 Redeploying Backend with correct environment variables..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running Prisma generate..."
npx prisma generate

echo "📊 Building project..."
npm run build

echo "🔍 Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful - dist folder exists"
    ls -la dist/
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo "🚀 Deploying to Vercel..."
echo "⚠️  Make sure to set environment variables in Vercel Dashboard first!"
echo "📋 Required environment variables:"
echo "   - DATABASE_URL"
echo "   - DIRECT_URL" 
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET"
echo "   - Other variables from .env file"
echo ""

# Deploy to Vercel
vercel --prod --confirm

echo "✅ Deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Check Vercel dashboard for deployment status"
echo "2. Verify environment variables are set correctly"
echo "3. Test API endpoints:"
echo "   - https://kawane-be.vercel.app/api/categories"
echo "   - https://kawane-be.vercel.app/api/products"
echo "4. Check if database connection errors are resolved"
