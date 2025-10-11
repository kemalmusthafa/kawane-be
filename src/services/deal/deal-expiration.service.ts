import prisma from "../../prisma";

export const expireDealsService = async () => {
  const now = new Date();

  try {
    // Find expired deals
    const expiredDeals = await prisma.deal.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
      include: {
        dealProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`Found ${expiredDeals.length} expired deals to process`);

    for (const deal of expiredDeals) {
      console.log(`Processing expired deal: ${deal.title} (${deal.id})`);

      // Update deal status to EXPIRED
      await prisma.deal.update({
        where: { id: deal.id },
        data: { status: "EXPIRED" },
      });

      // Delete deal products (products created specifically for this deal)
      for (const dealProduct of deal.dealProducts) {
        const product = dealProduct.product;

        // Check if this is a deal-specific product (created for the deal)
        if (
          product.name.includes(deal.title) ||
          product.sku?.startsWith("DEAL-")
        ) {
          console.log(
            `Deleting deal-specific product: ${product.name} (${product.id})`
          );

          // Delete the product and all related data
          await prisma.$transaction(async (tx) => {
            // Delete product images
            await tx.productImage.deleteMany({
              where: { productId: product.id },
            });

            // Delete cart items
            await tx.cartItem.deleteMany({
              where: { productId: product.id },
            });

            // Delete wishlist items
            await tx.wishlist.deleteMany({
              where: { productId: product.id },
            });

            // Delete reviews
            await tx.review.deleteMany({
              where: { productId: product.id },
            });

            // Delete inventory logs
            await tx.inventoryLog.deleteMany({
              where: { productId: product.id },
            });

            // Delete order items
            await tx.orderItem.deleteMany({
              where: { productId: product.id },
            });

            // Delete deal product relationship
            await tx.dealProduct.deleteMany({
              where: { productId: product.id },
            });

            // Finally delete the product
            await tx.product.delete({
              where: { id: product.id },
            });
          });
        }
      }

      console.log(`Successfully processed expired deal: ${deal.title}`);
    }

    return {
      success: true,
      message: `Successfully processed ${expiredDeals.length} expired deals`,
      expiredDealsCount: expiredDeals.length,
    };
  } catch (error) {
    console.error("Error processing expired deals:", error);
    throw error;
  }
};

export const cleanupExpiredDealsService = async () => {
  const now = new Date();

  try {
    // Find deals that have been expired for more than 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const oldExpiredDeals = await prisma.deal.findMany({
      where: {
        status: "EXPIRED",
        endDate: { lt: thirtyDaysAgo },
      },
      include: {
        images: true,
        dealProducts: true,
      },
    });

    console.log(`Found ${oldExpiredDeals.length} old expired deals to cleanup`);

    for (const deal of oldExpiredDeals) {
      console.log(`Cleaning up old expired deal: ${deal.title} (${deal.id})`);

      // Delete deal images
      await prisma.dealImage.deleteMany({
        where: { dealId: deal.id },
      });

      // Delete deal products relationships
      await prisma.dealProduct.deleteMany({
        where: { dealId: deal.id },
      });

      // Delete the deal
      await prisma.deal.delete({
        where: { id: deal.id },
      });

      console.log(`Successfully cleaned up old expired deal: ${deal.title}`);
    }

    return {
      success: true,
      message: `Successfully cleaned up ${oldExpiredDeals.length} old expired deals`,
      cleanedUpDealsCount: oldExpiredDeals.length,
    };
  } catch (error) {
    console.error("Error cleaning up expired deals:", error);
    throw error;
  }
};
