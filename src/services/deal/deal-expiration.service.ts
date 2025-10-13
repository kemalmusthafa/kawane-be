import prisma from "../../prisma";

export const expireDealsService = async () => {
  const now = new Date();

  try {
    // Use a single transaction to process all expired deals
    const result = await prisma.$transaction(async (tx) => {
      // Find expired deals
      const expiredDeals = await tx.deal.findMany({
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

      let processedCount = 0;

      for (const deal of expiredDeals) {
        try {
          console.log(`Processing expired deal: ${deal.title} (${deal.id})`);

          // Update deal status to EXPIRED
          await tx.deal.update({
            where: { id: deal.id },
            data: { status: "EXPIRED" },
          });

          // Delete deal product relationships (NO PRODUCTS DELETED - only relationships)
          console.log(
            `Removing deal relationships for ${deal.dealProducts.length} products`
          );

          await tx.dealProduct.deleteMany({
            where: { dealId: deal.id },
          });

          // Also check for any deal-specific products that might still exist
          // (from old system where products were created specifically for deals)
          for (const dealProduct of deal.dealProducts) {
            const product = dealProduct.product;

            // Check if this is a deal-specific product (created for the deal)
            if (
              product.name.includes(deal.title) ||
              product.sku?.startsWith("DEAL-") ||
              (product.description &&
                product.description.includes("DEAL SPECIAL"))
            ) {
              console.log(
                `Deleting deal-specific product: ${product.name} (${product.id})`
              );

              // Delete the product and all related data
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
            }
          }

          console.log(`Successfully processed expired deal: ${deal.title}`);
          processedCount++;
        } catch (dealError) {
          console.error(`Error processing deal ${deal.id}:`, dealError);
          // Continue with next deal instead of failing entire batch
        }
      }

      return {
        success: true,
        message: `Successfully processed ${processedCount} expired deals`,
        expiredDealsCount: processedCount,
        totalFound: expiredDeals.length,
      };
    });

    return result;
  } catch (error) {
    console.error("Error processing expired deals:", error);
    throw error;
  }
};

export const cleanupExpiredDealsService = async () => {
  const now = new Date();

  try {
    // Use a single transaction to cleanup all old expired deals
    const result = await prisma.$transaction(async (tx) => {
      // Find deals that have been expired for more than 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const oldExpiredDeals = await tx.deal.findMany({
        where: {
          status: "EXPIRED",
          endDate: { lt: thirtyDaysAgo },
        },
        include: {
          images: true,
          dealProducts: true,
        },
      });

      console.log(
        `Found ${oldExpiredDeals.length} old expired deals to cleanup`
      );

      let cleanedUpCount = 0;

      for (const deal of oldExpiredDeals) {
        try {
          console.log(
            `Cleaning up old expired deal: ${deal.title} (${deal.id})`
          );

          // Delete deal images
          await tx.dealImage.deleteMany({
            where: { dealId: deal.id },
          });

          // Delete deal products relationships
          await tx.dealProduct.deleteMany({
            where: { dealId: deal.id },
          });

          // Delete the deal
          await tx.deal.delete({
            where: { id: deal.id },
          });

          console.log(
            `Successfully cleaned up old expired deal: ${deal.title}`
          );
          cleanedUpCount++;
        } catch (dealError) {
          console.error(`Error cleaning up deal ${deal.id}:`, dealError);
          // Continue with next deal instead of failing entire batch
        }
      }

      return {
        success: true,
        message: `Successfully cleaned up ${cleanedUpCount} old expired deals`,
        cleanedUpDealsCount: cleanedUpCount,
        totalFound: oldExpiredDeals.length,
      };
    });

    return result;
  } catch (error) {
    console.error("Error cleaning up expired deals:", error);
    throw error;
  }
};
