import prisma from "../../prisma";

interface AddToCartData {
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
}

export const addToCartService = async (data: AddToCartData) => {
  const { userId, productId, quantity, size } = data;

  // Debug: Log the incoming request
  console.log("🛒 Add to cart request:", { userId, productId, quantity, size });

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  // Verify product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error("Product not found");

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.stock}`);
  }

  // Get or create user's cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }

  // Check if product already exists in cart with same size
  const existingItem = cart.items.find(
    (item) => item.productId === productId && item.size === size
  );

  if (existingItem) {
    // Update quantity if item already exists
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    return {
      message: "Cart item quantity updated successfully",
      cartItem: updatedItem,
    };
  } else {
    // Add new item to cart
    console.log("🛒 Creating new cart item with data:", {
      cartId: cart.id,
      productId,
      quantity,
      size,
    });

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        size,
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    console.log("🛒 Created cart item:", {
      id: newItem.id,
      productId: newItem.productId,
      size: newItem.size,
      quantity: newItem.quantity,
    });

    return {
      message: "Item added to cart successfully",
      cartItem: newItem,
    };
  }
};
