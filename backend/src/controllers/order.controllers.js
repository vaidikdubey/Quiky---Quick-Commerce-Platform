import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createOrder = asyncHandler(async (req, res) => {});

const getAllOrders = asyncHandler(async (req, res) => {});

const getOrderById = asyncHandler(async (req, res) => {});

const updateOrderStatus = asyncHandler(async (req, res) => {});

const cancelOrder = asyncHandler(async (req, res) => {});

const getAllOrdersForStore = asyncHandler(async (req, res) => {});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrdersForStore,
};
