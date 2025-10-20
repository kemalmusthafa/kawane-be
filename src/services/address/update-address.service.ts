import prisma from "../../prisma";

interface UpdateAddressParams {
  addressId: string;
  userId: string;
  detail?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean; // Will be available after migration
  label?: string;
}

export const updateAddressService = async (params: UpdateAddressParams) => {
  const { addressId, userId, ...updateData } = params;

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

  // If setting as default, unset other default addresses
  // Note: isDefault field will be available after database migration
  if (updateData.isDefault) {
    // await prisma.address.updateMany({
    //   where: {
    //     userId: userId,
    //     isDefault: true,
    //   },
    //   data: {
    //     isDefault: false,
    //   },
    // });
  }

  // Update the address (excluding isDefault for now)
  const { isDefault, ...updateDataWithoutDefault } = updateData;
  const updatedAddress = await prisma.address.update({
    where: {
      id: addressId,
    },
    data: updateDataWithoutDefault,
  });

  return updatedAddress;
};
