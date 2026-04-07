import { db } from "../db/db.js";
import { Prisma } from "../generated/prisma/index.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

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
          products: true,
          orders: true,
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
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      },
      _count: {
        select: {
          orderItems: true,
        },
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

const getProductsInNearbyStores = asyncHandler(async (req, res) => {
  const {
    userLatitude,
    userLongitude,
    radius = 10,
    limit = 15,
    categoryId,
  } = req.body;

  if (!userLatitude || !userLongitude)
    throw new ApiError(400, "User latitude and longitude are required");

  const _radius = parseFloat(radius);
  const _limit = parseInt(limit);

  if (NaN(_radius) || _radius <= 0)
    throw new ApiError(400, "Invalid radius value");

  //Find nearby active stores using Haversine formula
  const nearbyStoreQuery = Prisma.sql`
  SELECT
    id,
    name,
    address,
    latitude,
    longitude,
    pincode,
    distance_km
    FROM (
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        pincode,
      -- Haversine formula to calculate distance of each store from user
        (6371 * acos(
          LEAST(1.0,
            cos(radians(${userLatitude})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${userLongitude})) +
            sin(radians(${userLatitude})) * sin(radians(latitude))
          )
        )) AS distance_km
    FROM "Store"
    WHERE "isActive" = true
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
    -- Find the range of latitude and longitude which fits between -+10KM (since 1 degree is ~ 111KM)
    AND latitude  BETWEEN ${userLatitude}  - (${_radius} / 111.0)
                       AND ${userLatitude}  + (${_radius} / 111.0)
    -- Longitude is multiplied by cos of latitude to account for curvature which varies the distance by longitude. Like at equator it is 1 degree but at poles it becomes almost 0 degrees
    AND longitude BETWEEN ${userLongitude} - (${_radius} / (111.0 * cos(radians(${userLatitude}))))
                       AND ${userLongitude} + (${_radius} / (111.0 * cos(radians(${userLatitude}))))
    ) AS subquery
    WHERE distance_km <= ${_radius}
    ORDER BY distance_km ASC
    LIMIT ${_storeLimit}
  `;

  const nearbyStores = await Prisma.$queryRaw(nearbyStoreQuery);

  if (!nearbyStores || nearbyStores.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No nearby stores found"));

  const storeIds = nearbyStores.map((store) => store.id);

  //Fetch available products from nearby stores
  const whereClause = {
    storeId: { in: storeIds },
    isAvailable: true,
    stock: { gt: 0 },
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const products = await db.product.findMany({
    where: whereClause,
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
          distance_km: false, // We'll add it manually
        },
      },
    },
    orderBy: [
      { price: "asc" }, // Cheapest first
      { stock: "desc" }, // Higher stock preferred
    ],
    take: _limit,
  });

  //Better response crafting with adding store distance in products
  const storeDistanceMap = new Map(
    nearbyStores.map((s) => [s.id, parseFloat(s.distance_km.toFixed(2))]),
  );

  const responseData = products.map((product) => ({
    ...product,
    store: {
      ...product.store,
      distance_km: storeDistanceMap.get(product.store.id) || null,
    },
  }));

  //Sorting responses by distance and then price
  responseData.sort((a, b) => {
    const distA = a.store.distance_km || 999; //Default distance to 999 (like keeing infinite)
    const distB = b.store.distance_km || 999;

    if (distA !== distB) return distA - distB; //Sort based on distance first
    return a.price - b.price; //If equal distance, sort based on price
  });

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "Nearby products found"));
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    imageUrl,
    stock,
    isAvailable,
    categoryId,
    storeId,
  } = req.body;

  if (!name || !price || !storeId)
    throw new ApiError(
      400,
      "Missing required fields. Kindly provide all required fields",
    );

  const data = {};

  data.name = name;
  if (description) data.description = description;
  data.price = parseFloat(price);
  if (imageUrl) data.imageUrl = imageUrl;
  if (stock) data.stock = +stock;
  if (isAvailable) data.isAvailable = isAvailable;
  if (categoryId) data.categoryId = categoryId;
  data.storeId = storeId;

  const newProduct = await db.product.create({
    data,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
      isAvailable: true,
      categoryId: true,
      storeId: true,
    },
  });

  if (!newProduct) throw new ApiError(500, "Error creating new product");

  res.status(201).json(new ApiResponse(201, newProduct, "New product created"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name, description, price, imageUrl, stock, isAvailable, categoryId } =
    req.body;

  const updateData = {};

  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (price) updateData.price = parseFloat(price);
  if (imageUrl) updateData.imageUrl = imageUrl;
  if (stock) updateData.stock = +stock;
  if (isAvailable) updateData.isAvailable = isAvailable;
  if (categoryId) updateData.categoryId = categoryId;

  const updatedProduct = await db.product.update({
    where: {
      id,
    },
    data: updateData,
    select: {
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
      isAvailable: true,
      categoryId: true,
    },
  });

  if (!updatedProduct) throw new ApiError(500, "Error updating product");

  res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated"));
});

const toggleProductAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { isAvailable } = req.body;

  // if (!isAvailable || typeof isAvailable !== "boolean")
  //   throw new ApiError(
  //     400,
  //     "Invalid or missing required fields. Kindly provide all required fields",
  //   );

  const updateProductAvailability = await db.product.update({
    where: {
      id,
    },
    data: {
      isAvailable,
    },
    select: {
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
      isAvailable: true,
      categoryId: true,
    },
  });

  if (!updateProductAvailability)
    throw new ApiError(500, "Error updating product availability");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateProductAvailability,
        "Product availability updated",
      ),
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  const existingProduct = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      store: {
        select: {
          managerId: true,
        },
      },
    },
  });

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  if (!existingProduct) throw new ApiError(404, "Product not found");
  if (existingProduct.store.managerId !== userId && user.role !== "ADMIN") {
    console.log("Condition: ", existingProduct.store.managerId !== userId);
    console.log("Condition: ", user.role !== "ADMIN");
    throw new ApiError(
      403,
      "Unauthorized - You do not have permission to delete this product",
    );
  }

  const deletedProduct = await db.product.delete({
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
      categoryId: true,
      storeId: true,
      createdAt: true,
    },
  });

  if (!deletedProduct) throw new ApiError(500, "Error deleting product");

  res.status(200).json(new ApiResponse(200, deletedProduct, "Product deleted"));
});

export {
  getAllProducts,
  getProductById,
  getProductByName,
  getProductsInNearbyStores,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  deleteProduct,
};
