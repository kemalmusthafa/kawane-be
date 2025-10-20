import prisma from "../../prisma";

interface CreateAddressData {
  userId: string;
  label?: string;
  detail: string;
  city: string;
  province: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export const createAddressService = async (data: CreateAddressData) => {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  if (!user) throw new Error("User not found");

  if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
    throw new Error("Invalid latitude value");
  }

  if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
    throw new Error("Invalid longitude value");
  }

  const address = await prisma.address.create({
    data: {
      userId: data.userId,
      label: data.label,
      detail: data.detail,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  return address;
};
