import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllUsers = asyncHandler(async (req, res) => {});

const getAllStores = asyncHandler(async (req, res) => {});

const getAllRiders = asyncHandler(async (req, res) => {});

const getAllOrders = asyncHandler(async (req, res) => {});

const toggleUserAccount = asyncHandler(async (req, res) => {});

const getDashboardStats = asyncHandler(async (req, res) => {});

const toggleStoreStatus = asyncHandler(async (req, res) => {});

const toggleRiderStatus = asyncHandler(async (req, res) => {});

const updateOrderStatusByAdmin = asyncHandler(async (req, res) => {});

const getPlatformAnalytics = asyncHandler(async (req, res) => {});

const deleteUser = asyncHandler(async (req, res) => {});

const sendBroadcastNotification = asyncHandler(async (req, res) => {});

export {
  getAllUsers,
  getAllStores,
  getAllRiders,
  getAllOrders,
  toggleUserAccount,
  getDashboardStats,
  toggleStoreStatus,
  toggleRiderStatus,
  updateOrderStatusByAdmin,
  getPlatformAnalytics,
  deleteUser,
  sendBroadcastNotification,
};
