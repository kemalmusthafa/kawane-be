// Script untuk reset database schema dan hapus data dummy
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function resetDatabaseSchema() {
  try {
    console.log('🔄 Resetting database schema...');
    
    // Test connection first
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Try to push schema to remove type column
    console.log('\n📊 Pushing schema to database...');
    console.log('⚠️  This will remove the type column from Category table');
    
    // Note: This should be run with --accept-data-loss flag
    console.log('\n💡 To remove the type column, run:');
    console.log('   npx prisma db push --accept-data-loss');
    
    console.log('\n🎯 Alternative: Run SQL script in Supabase:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run the SQL commands from clean-database.sql');
    console.log('   3. This will safely remove dummy data');
    
  } catch (error) {
    console.error('❌ Schema reset failed:', error);
    
    if (error.message.includes('type')) {
      console.log('\n💡 The type column still exists in the database.');
      console.log('   You need to remove it manually or run db push with --accept-data-loss');
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabaseSchema();
