const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificShipment() {
  try {
    const problemId = 'fe435d4a-2890-475c-ae98-c576cd385b68';
    
    console.log(`🔍 Checking for shipment ID: ${problemId}`);
    
    const shipment = await prisma.shipment.findUnique({
      where: { id: problemId },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (shipment) {
      console.log('✅ Shipment found:', {
        id: shipment.id,
        orderId: shipment.orderId,
        trackingNo: shipment.trackingNo,
        courier: shipment.courier,
        createdAt: shipment.createdAt,
      });
    } else {
      console.log('❌ Shipment not found in database');
    }

    // Check all shipments
    const allShipments = await prisma.shipment.findMany({
      select: {
        id: true,
        orderId: true,
        trackingNo: true,
        courier: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📦 All shipments in database (${allShipments.length}):`);
    allShipments.forEach((shipment, index) => {
      console.log(`${index + 1}. ${shipment.id} - ${shipment.trackingNo} (${shipment.courier})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificShipment();
