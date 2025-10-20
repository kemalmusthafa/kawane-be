import prisma from "../../prisma";

interface ValidateDiscountData {
  code: string;
  orderAmount: number;
}

export const validateDiscountService = async (data: ValidateDiscountData) => {
  const discount = await prisma.discount.findUnique({
    where: { code: data.code.toUpperCase() },
  });

  if (!discount) {
    throw new Error("Invalid discount code");
  }

  const now = new Date();

  if (discount.validFrom && now < discount.validFrom) {
    throw new Error("Discount code not yet valid");
  }

  if (discount.validTo && now > discount.validTo) {
    throw new Error("Discount code has expired");
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    throw new Error("Discount code usage limit exceeded");
  }

  let discountAmount = 0;
  let finalAmount = data.orderAmount;

  if (discount.percentage) {
    discountAmount = data.orderAmount * (discount.percentage / 100);
    finalAmount = data.orderAmount - discountAmount;
  } else if (discount.amount) {
    discountAmount = Math.min(discount.amount, data.orderAmount);
    finalAmount = data.orderAmount - discountAmount;
  }

  return {
    discount,
    originalAmount: data.orderAmount,
    discountAmount,
    finalAmount,
    savings: discountAmount,
  };
};
