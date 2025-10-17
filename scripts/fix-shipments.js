const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixShipments() {
  try {
    console.log('🔧 Fixing shipments for pending orders...');
    
    // Get all PENDING orders with PENDING payment
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        payment: {
          status: 'PENDING'
        }
      },
      include: {
        payment: true,
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`📦 Found ${pendingOrders.length} pending orders to process\n`);

    for (const order of pendingOrders) {
      try {
        console.log(`🔄 Processing order ${order.id}`);
        console.log(`   Customer: ${order.user.name}`);
        console.log(`   Total: Rp ${order.totalAmount.toLocaleString('id-ID')}`);

        // Step 1: Update payment status to SUCCEEDED
        await prisma.payment.update({
          where: { orderId: order.id },
          data: { status: 'SUCCEEDED' },
        });
        console.log(`   ✅ Payment status updated to SUCCEEDED`);

        // Step 2: Update order status to PAID
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });
        console.log(`   ✅ Order status updated to PAID`);

        // Step 3: Create shipment
        const trackingNumber = `KS${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        
        const shipment = await prisma.shipment.create({
          data: {
            orderId: order.id,
            courier: 'JNE',
            trackingNo: trackingNumber,
            cost: 0, // Free shipping
            estimatedDays: 3,
          },
        });

        console.log(`   📦 Shipment created: ${shipment.id}`);
        console.log(`   🚚 Tracking Number: ${trackingNumber}`);

        // Step 4: Update order status to SHIPPED
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'SHIPPED' },
        });
        console.log(`   🚚 Order status updated to SHIPPED`);

        console.log(`   ✅ Order ${order.id} fully processed!\n`);

      } catch (error) {
        console.error(`❌ Failed to process order ${order.id}:`, error.message);
      }
    }

    // Check final shipment count
    const shipmentCount = await prisma.shipment.count();
    console.log(`🎉 Process completed! Total shipments: ${shipmentCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixShipments();
