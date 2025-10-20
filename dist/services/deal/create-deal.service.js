"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDealService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createDealService = async (data) => {
    const { title, description, type, value, startDate, endDate, image, images = [], isFlashSale = false, maxUses, productName, productDescription, productPrice, productSku, productStock = 0, categoryId, } = data;
    // Handle empty image string
    const imageUrl = image && image.trim() ? image.trim() : undefined;
    // Validate dates
    if (startDate >= endDate) {
        throw new Error("Start date must be before end date");
    }
    // Validate value based on type
    if (type === "PERCENTAGE" && (value < 0 || value > 100)) {
        throw new Error("Percentage value must be between 0 and 100");
    }
    if (type === "FIXED_AMOUNT" && value < 0) {
        throw new Error("Fixed amount value must be positive");
    }
    // Validate product price
    if (productPrice <= 0) {
        throw new Error("Product price must be greater than 0");
    }
    // Validate SKU uniqueness if provided
    if (productSku) {
        const existingSku = await prisma_1.default.product.findUnique({
            where: { sku: productSku },
        });
        if (existingSku) {
            throw new Error("SKU already exists");
        }
    }
    // Validate category if provided
    if (categoryId) {
        const category = await prisma_1.default.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new Error("Category not found");
        }
    }
    // Create deal with product in transaction
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Create deal
        const newDeal = await tx.deal.create({
            data: {
                title,
                description,
                type,
                value,
                startDate,
                endDate,
                image: imageUrl,
                isFlashSale,
                maxUses,
                status: "ACTIVE",
                images: images.length > 0
                    ? {
                        create: images.map((url) => ({ url })),
                    }
                    : undefined,
            },
        });
        // Calculate discounted price for the product
        let discountedPrice = productPrice;
        if (type === "PERCENTAGE") {
            discountedPrice = productPrice * (1 - value / 100);
        }
        else if (type === "FIXED_AMOUNT") {
            discountedPrice = Math.max(0, productPrice - value);
        }
        // Create product for the deal
        const dealProduct = await tx.product.create({
            data: {
                name: productName,
                description: productDescription || `🎉 DEAL SPECIAL: ${title}`,
                price: discountedPrice,
                stock: productStock,
                sku: productSku || `DEAL-${newDeal.id.slice(-8)}`,
                categoryId,
                status: "ACTIVE",
                images: images.length > 0
                    ? {
                        create: images.map((url) => ({ url })),
                    }
                    : undefined,
            },
            include: {
                images: true,
                category: true,
            },
        });
        // Create DealProduct relationship
        await tx.dealProduct.create({
            data: {
                dealId: newDeal.id,
                productId: dealProduct.id,
            },
        });
        // Create inventory log for initial stock
        if (productStock > 0) {
            await tx.inventoryLog.create({
                data: {
                    productId: dealProduct.id,
                    change: productStock,
                    note: "Initial stock for deal product",
                },
            });
        }
        return {
            deal: newDeal,
            product: dealProduct,
        };
    });
    return {
        success: true,
        message: "Deal created successfully with new product",
        data: {
            deal: result.deal,
            product: result.product,
            dealInfo: {
                originalPrice: productPrice,
                discountedPrice: result.product.price,
                discountAmount: productPrice - result.product.price,
                discountPercentage: Math.round(((productPrice - result.product.price) / productPrice) * 100),
            },
        },
    };
};
exports.createDealService = createDealService;
