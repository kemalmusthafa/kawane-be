#!/bin/bash

# Script untuk deploy migration ke Vercel
echo "🚀 Deploying database migration to Vercel..."

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
npx prisma db push

echo "🔍 Verifying migration..."
node scripts/fix-production-schema.js

echo "✅ Migration deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Check your Vercel dashboard for deployment status"
echo "2. Test the frontend to ensure categories are working"
echo "3. Verify Collections vs Categories separation"
