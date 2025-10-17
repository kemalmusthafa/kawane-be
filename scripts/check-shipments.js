const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkShipments() {
  try {
    console.log('🔍 Checking shipments directly...');
    
    // Get all shipments
    const shipments = await prisma.shipment.findMany({
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📦 Found ${shipments.length} shipments in database\n`);

    shipments.forEach((shipment, index) => {
      console.log(`${index + 1}. Shipment ID: ${shipment.id}`);
      console.log(`   Order ID: ${shipment.orderId}`);
      console.log(`   Courier: ${shipment.courier}`);
      console.log(`   Tracking No: ${shipment.trackingNo}`);
      console.log(`   Cost: Rp ${shipment.cost.toLocaleString('id-ID')}`);
      console.log(`   Estimated Days: ${shipment.estimatedDays}`);
      console.log(`   Created: ${shipment.createdAt.toISOString()}`);
      console.log(`   Customer: ${shipment.order.user.name}`);
      console.log(`   Order Status: ${shipment.order.status}`);
      console.log(`   Order Total: Rp ${shipment.order.totalAmount.toLocaleString('id-ID')}`);
      console.log('');
    });

    // Check if there are any issues with the query
    console.log('🔍 Testing the same query used by the API...');
    
    const apiQuery = await prisma.shipment.findMany({
      where: {}, // Same as the API
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

    console.log(`📦 API query found: ${apiQuery.length} shipments`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkShipments();
