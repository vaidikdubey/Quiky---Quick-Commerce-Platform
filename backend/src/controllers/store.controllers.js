import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllStoresManaged = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const allStores = await db.store.findMany({
    where: {
      managerId: id,
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      pincode: true,
      isActive: true,
      products: {
        name: true,
        description: true,
        price: true,
        stock: true,
        isAvailable: true,
      },
      _count: {
        products: true,
        orders: true,
      },
    },
  });

  if (!allStores) throw new ApiError(404, "No stores found for this user");

  res.status(200).json(new ApiResponse(200, allStores, "All stores fetched"));
});

const getStoreById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(404, "Store ID not found");

  const storeById = await db.store.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      pincode: true,
      isActive: true,
      createdAt: true,
      manager: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      products: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        isAvailable: true,
      },
      orders: {
        id: true,
        totalAmount: true,
        status: true,
      },
      _count: {
        products: true,
        orders: true,
      },
    },
  });

  if (!storeById) throw new ApiError(404, "Store not found");

  res.status(200).json(new ApiResponse(200, storeById, "Store fetched"));
});

const updateStoreDetails = asyncHandler(async (req, res) => {});

const deleteStore = asyncHandler(async (req, res) => {});

const getNearbyStores = asyncHandler(async (req, res) => {});

export {
  getAllStoresManaged,
  getStoreById,
  updateStoreDetails,
  deleteStore,
  getNearbyStores,
};
