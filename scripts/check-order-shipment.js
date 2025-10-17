const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrderShipment() {
  try {
    const orderId = '288fdca2-a67d-4a0d-8ddd-ac960832e71f';
    
    console.log(`🔍 Checking order: ${orderId}`);
    
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shipment: true,
        user: true,
      },
    });

    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('✅ Order found:', {
      id: order.id,
      status: order.status,
      userId: order.userId,
      customer: order.user?.name,
    });

    if (order.shipment) {
      console.log('📦 Shipment found:', {
        id: order.shipment.id,
        courier: order.shipment.courier,
        trackingNo: order.shipment.trackingNo,
        cost: order.shipment.cost,
        estimatedDays: order.shipment.estimatedDays,
        createdAt: order.shipment.createdAt,
      });
    } else {
      console.log('❌ No shipment found for this order');
    }

    // Check all shipments
    const allShipments = await prisma.shipment.findMany({
      select: {
        id: true,
        orderId: true,
        courier: true,
        trackingNo: true,
        cost: true,
        estimatedDays: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📦 All shipments (${allShipments.length}):`);
    allShipments.forEach((shipment, index) => {
      console.log(`${index + 1}. Order: ${shipment.orderId} - ${shipment.trackingNo} (${shipment.courier})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderShipment();
