const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createShipmentsForReadyOrders() {
  try {
    console.log('🔍 Checking orders ready for shipment...');
    
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

    console.log(`📦 Found ${orders.length} total orders`);

    // Filter orders ready for shipment
    const readyOrders = orders.filter(order => {
      // Order should be PAID or PENDING with SUCCEEDED payment
      const isPaid = order.status === 'PAID' || 
                    (order.status === 'PENDING' && order.payment?.status === 'SUCCEEDED');
      
      // Should not already have a shipment
      const hasNoShipment = !order.shipment;
      
      return isPaid && hasNoShipment;
    });

    console.log(`✅ Found ${readyOrders.length} orders ready for shipment`);

    if (readyOrders.length === 0) {
      console.log('❌ No orders ready for shipment');
      return;
    }

    // Create shipments for ready orders
    for (const order of readyOrders) {
      try {
        console.log(`\n📦 Creating shipment for order ${order.id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment Status: ${order.payment?.status}`);
        console.log(`   Customer: ${order.user.name}`);
        console.log(`   Total: Rp ${order.totalAmount.toLocaleString('id-ID')}`);

        // Generate tracking number
        const trackingNumber = `KS${Date.now().toString().slice(-8)}`;

        // Create shipment
        const shipment = await prisma.shipment.create({
          data: {
            orderId: order.id,
            courier: 'JNE',
            trackingNo: trackingNumber,
            cost: 0, // Free shipping
            estimatedDays: 3,
          },
        });

        console.log(`   ✅ Shipment created: ${shipment.id}`);
        console.log(`   📦 Tracking Number: ${trackingNumber}`);

        // Update order status to SHIPPED
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'SHIPPED' },
        });

        console.log(`   🚚 Order status updated to SHIPPED`);

      } catch (error) {
        console.error(`❌ Failed to create shipment for order ${order.id}:`, error.message);
      }
    }

    console.log('\n🎉 Shipment creation process completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createShipmentsForReadyOrders();
