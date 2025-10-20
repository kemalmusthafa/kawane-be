#!/bin/bash

# Script untuk setup environment variables yang benar
echo "🔧 Setting up environment variables..."

# Create .env file with correct configuration
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET="kawane-studio-website-e-commerce-application-jwt-secret"

# Email
MAIL_USER="kemalmusthafa80@gmail.com"
MAIL_PASS="cfxb sutp bdhx jpgq"

#Client ID OAuth
CLIENT_ID="[Your Google Client ID]"
CLIENT_SECRET="[Your Google Client Secret]"
REDIRECT_URI="http://localhost:3000"

# Midtrans (Sandbox - Replace with your actual keys)
MIDTRANS_SERVER_KEY="[Your Midtrans Server Key]"
MIDTRANS_CLIENT_KEY="[Your Midtrans Client Key]"
MIDTRANS_IS_PRODUCTION="false"

#Cloudinary
CLOUD_NAME="dkpn9aqne"
CLOUD_KEY="222754858211214"
CLOUD_SECRET="qXKf3Wfl_ru01absqJQtc3xzUwY"

# Frontend URL
BASE_URL_FE="http://localhost:3000"

# Server
PORT=8000
NODE_ENV="development"
EOF

echo "✅ Environment file created successfully!"
echo ""
echo "🔍 Verifying environment variables..."
echo "DATABASE_URL: $(grep DATABASE_URL .env | cut -d'=' -f2 | cut -c1-20)..."
echo "DIRECT_URL: $(grep DIRECT_URL .env | cut -d'=' -f2 | cut -c1-20)..."
echo "JWT_SECRET: $(grep JWT_SECRET .env | cut -d'=' -f2 | cut -c1-10)..."
echo ""
echo "🎯 Next steps:"
echo "1. Run: npm install"
echo "2. Run: npx prisma generate"
echo "3. Run: npm run build"
echo "4. Test database connection"
