const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrderStatuses() {
  try {
    console.log('🔍 Checking all orders and their statuses...');
    
    // Get all orders with payment and shipment info
    const orders = await prisma.order.findMany({
      include: {
        payment: true,
        shipment: true,
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📦 Found ${orders.length} total orders\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.payment?.status || 'No payment'}`);
      console.log(`   Payment Method: ${order.payment?.method || 'No payment'}`);
      console.log(`   Has Shipment: ${order.shipment ? 'Yes' : 'No'}`);
      console.log(`   Customer: ${order.user.name}`);
      console.log(`   Total: Rp ${order.totalAmount.toLocaleString('id-ID')}`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log('');
    });

    // Check what orders can be made ready for shipment
    console.log('🔍 Orders that can be made ready for shipment:');
    
    const pendingOrders = orders.filter(order => 
      order.status === 'PENDING' && 
      !order.shipment &&
      order.payment?.status === 'PENDING'
    );

    console.log(`📦 Found ${pendingOrders.length} PENDING orders with PENDING payment`);

    if (pendingOrders.length > 0) {
      console.log('\n💡 To make these orders ready for shipment, you need to:');
      console.log('   1. Update payment status to SUCCEEDED');
      console.log('   2. Update order status to PAID');
      console.log('   3. Then create shipments');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkOrderStatuses();
