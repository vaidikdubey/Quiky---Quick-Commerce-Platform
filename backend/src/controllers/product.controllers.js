import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler";

const getAllProducts = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  if (!storeId) throw new ApiError(404, "Store id not found");

  const existingStore = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      pincode: true,
      isActive: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          products,
          orders,
        },
      },
    },
  });

  if (!existingStore || !existingStore.isActive)
    throw new ApiError(404, "Store not found");

  const allProducts = await db.product.findMany({
    where: {
      storeId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
      isAvailable: true,
      category: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  if (!allProducts) throw new ApiError(404, "No products found");

  const data = allProducts.map((product) => {
    return {
      ...product,
      store: {
        name: existingStore.name,
        address: existingStore.address,
        latitude: existingStore.latitude ? existingStore.latitude : null,
        longitude: existingStore.longitude ? existingStore.longitude : null,
        pincode: existingStore.pincode,
        isActive: existingStore.isActive,
        manager: {
          id: existingStore.manager.id,
          name: existingStore.manager.name,
          email: existingStore.manager.email,
          phone: existingStore.manager.phone,
        },
        productCount: existingStore._count.products,
        orderCount: existingStore._count.orders,
      },
    };
  });

  res.status(200).json(new ApiResponse(200, data, "Products found"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(404, "Product id is required");

  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
      isAvailable: true,
      category: {
        select: {
          name: true,
          slug: true,
          createdAt: true,
        },
      },
      store: {
        select: {
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          pincode: true,
          isActive: true,
          manager: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
          _count: {
            orders: true,
          },
        },
      },
      _count: {
        orderItems: true,
      },
    },
  });

  if (!product) throw new ApiError(404, "Product not found");

  res.status(200).json(new ApiResponse(200, product, "Product found"));
});

const getProductByName = asyncHandler(async (req, res) => {
  const { productName } = req.body;

  if (
    !productName ||
    typeof productName != "string" ||
    productName.trim() === ""
  )
    throw new ApiError(400, "Invalid or missing product name");

  const validName = productName.trim();

  const productByName = await db.product.findMany({
    where: {
      //Filter by case-insensitive name, with product available and stock > 0 and store active
      name: {
        equals: validName,
        mode: "insensitive", //Makes search case-insensitive
      },
      isAvailable: true,
      stock: { gt: 0 },
      store: {
        is: {
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
      isAvailable: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          pincode: true,
        },
      },
    },
    orderBy: {
      price: "asc", //Show cheapest first
    },
  });

  if (!productByName || productByName.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No products found with this name"));

  res.status(200).json(new ApiResponse(200, productByName, "Products found"));
});

const getProductsInNearbyStores = asyncHandler(async (req, res) => {});

const createProduct = asyncHandler(async (req, res) => {});

const updateProduct = asyncHandler(async (req, res) => {});

const deleteProduct = asyncHandler(async (req, res) => {});

export {
  getAllProducts,
  getProductById,
  getProductByName,
  getProductsInNearbyStores,
  createProduct,
  updateProduct,
  deleteProduct,
};
