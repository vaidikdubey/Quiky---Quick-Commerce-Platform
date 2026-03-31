import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllStoresManaged = asyncHandler(async (req, res) => {});

const getStoreById = asyncHandler(async (req, res) => {});

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
