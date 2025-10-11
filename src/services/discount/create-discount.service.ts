import prisma from "../../prisma";

interface CreateDiscountData {
  code: string;
  description?: string;
  percentage?: number;
  amount?: number;
  validFrom?: Date;
  validTo?: Date;
  usageLimit?: number;
}

export const createDiscountService = async (data: CreateDiscountData) => {
  if (!data.percentage && !data.amount) {
    throw new Error("Either percentage or amount must be provided");
  }

  if (data.percentage && data.amount) {
    throw new Error("Cannot provide both percentage and amount");
  }

  if (data.percentage && (data.percentage <= 0 || data.percentage > 100)) {
    throw new Error("Percentage must be between 0 and 100");
  }

  if (data.amount && data.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (data.validFrom && data.validTo && data.validFrom >= data.validTo) {
    throw new Error("Valid from date must be before valid to date");
  }

  const existingDiscount = await prisma.discount.findUnique({
    where: { code: data.code },
  });
  if (existingDiscount) throw new Error("Discount code already exists");

  const discount = await prisma.discount.create({
    data: {
      code: data.code.toUpperCase(),
      description: data.description,
      percentage: data.percentage,
      amount: data.amount,
      validFrom: data.validFrom,
      validTo: data.validTo,
      usageLimit: data.usageLimit,
    },
  });

  return discount;
};
