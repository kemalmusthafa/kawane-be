import prisma from "../../prisma";

interface DeleteAddressParams {
  addressId: string;
  userId: string;
}

export const deleteAddressService = async (params: DeleteAddressParams) => {
  const { addressId, userId } = params;

  // Check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!existingAddress) {
    throw new Error("Address not found or does not belong to user");
  }

  // Delete the address
  await prisma.address.delete({
    where: {
      id: addressId,
    },
  });

  return true;
};





