const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testShipmentsQuery() {
  try {
    console.log('🔍 Testing shipments query with different parameters...\n');
    
    // Test 1: No userId (admin view)
    console.log('1. Testing admin view (no userId):');
    const adminQuery = await prisma.shipment.findMany({
      where: {}, // No userId filter
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Found: ${adminQuery.length} shipments`);

    // Test 2: With userId (customer view)
    console.log('\n2. Testing customer view (with userId):');
    const customerQuery = await prisma.shipment.findMany({
      where: {
        order: {
          userId: '44e2fad3-d1d5-44c2-a2b0-7d3a4e38fc78', // Test customer ID
        },
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Found: ${customerQuery.length} shipments`);

    // Test 3: Check what happens when userId is undefined
    console.log('\n3. Testing with undefined userId:');
    const whereClause = {};
    if (undefined) { // This should be false
      whereClause.order = {
        userId: undefined,
      };
    }
    console.log('   Where clause:', whereClause);
    
    const undefinedQuery = await prisma.shipment.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Found: ${undefinedQuery.length} shipments`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testShipmentsQuery();
