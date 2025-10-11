import prisma from "../../prisma";

interface GetPaymentsParams {
  userId?: string;
  orderId?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const getPaymentsService = async (params: GetPaymentsParams = {}) => {
  const {
    userId,
    orderId,
    status,
    page = 1,
    limit = 10,
    startDate,
    endDate,
  } = params;

  const filter: any = {};

  if (userId) {
    filter.order = {
      userId,
    };
  }

  if (orderId) {
    filter.orderId = orderId;
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.lte = new Date(endDate);
    }
  }

  const countPayments = await prisma.payment.count({
    where: filter,
  });
  const totalPages = Math.ceil(countPayments / limit);

  const payments = await prisma.payment.findMany({
    where: filter,
    include: {
      order: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: limit * (page - 1),
  });

  return {
    payments,
    pagination: {
      page,
      limit,
      totalItems: countPayments,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
