const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createShipmentForOrder() {
  try {
    const orderId = '288fdca2-a67d-4a0d-8ddd-ac960832e71f';
    
    console.log(`📦 Creating shipment for order: ${orderId}`);
    
    // Check if order exists and is ready for shipment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
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
      paymentStatus: order.payment?.status,
      customer: order.user?.name,
    });

    // Check if order is ready for shipment (PAID status)
    if (order.status !== 'PAID') {
      console.log('⚠️ Order is not ready for shipment. Status:', order.status);
      return;
    }

    // Generate tracking number
    const trackingNumber = `KS${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create shipment directly
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        courier: 'JNE',
        trackingNo: trackingNumber,
        cost: 0, // Free shipping
        estimatedDays: 3,
      },
    });

    console.log('✅ Shipment created:', {
      id: shipment.id,
      orderId: shipment.orderId,
      courier: shipment.courier,
      trackingNo: shipment.trackingNo,
      cost: shipment.cost,
      estimatedDays: shipment.estimatedDays,
    });

    // Update order status to SHIPPED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'SHIPPED' },
    });

    console.log('✅ Order status updated to SHIPPED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createShipmentForOrder();