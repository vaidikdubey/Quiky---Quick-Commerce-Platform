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

const updateStoreDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, latitude, longitude, pincode } = req.body;

  if (!name && !address && !latitude && !longitude && !pincode)
    throw new ApiError(400, "Please provide some details to update");

  const existingStore = await db.store.findUnique({
    where: {
      id,
    },
    select: {
      isActive: true,
      managerId: true,
    },
  });

  if (!existingStore) throw new ApiError(404, "Store not found");

  if (!existingStore.isActive)
    throw new ApiError(400, "Store is inactive/deleted");

  if (existingStore.managerId !== req.user.id)
    throw new ApiError(
      403,
      "You are not authorized to update this store details",
    );

  let updatedStoreData = {};

  if (name) updatedStoreData.name = name;
  if (address) updatedStoreData.address = address;
  if (latitude) updatedStoreData.latitude = latitude;
  if (longitude) updatedStoreData.longitude = longitude;
  if (pincode) updatedStoreData.pincode = pincode;

  const updatedStore = await db.store.update({
    where: {
      id,
    },
    data: updatedStoreData,
    select: {
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      pincode: true,
      isActive: true,
      createdAt: true,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedStore, "Store details updated"));
});

const deleteStore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  const existingStore = await db.store.findUnique({
    where: {
      id,
    },
    select: {
      isActive: true,
      managerId: true,
    },
  });

  if (existingStore.managerId !== userId)
    throw new ApiError(403, "You are not authorized to delete this store");

  if (!existingStore.isActive)
    throw new ApiError(403, "This store is either inactive or deleted");

  const deletedStore = await db.store.delete({
    where: {
      id,
      managerId: userId,
    },
    select: {
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      pincode: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!deletedStore) throw new ApiError(400, "Invalid store id");

  res
    .status(200)
    .json(new ApiResponse(200, deletedStore, "Store deleted successfully"));
});

const getNearbyStores = asyncHandler(async (req, res) => {});

export {
  getAllStoresManaged,
  getStoreById,
  updateStoreDetails,
  deleteStore,
  getNearbyStores,
};
