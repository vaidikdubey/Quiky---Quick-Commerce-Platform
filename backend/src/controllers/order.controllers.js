import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  orderStatusArray,
  paymentMethodsArray,
  paymentStatusArray,
} from "../utils/constants.js";

const createOrder = asyncHandler(async (req, res) => {
  const {
    clientId,
    storeId,
    totalAmount,
    status,
    paymentMethod,
    paymentStatus,
    deliveryAddress,
  } = req.body;

  //Data validation
  if (
    !clientId ||
    !storeId ||
    !totalAmount ||
    !status ||
    !paymentMethod ||
    !paymentStatus ||
    !deliveryAddress
  )
    throw new ApiError(400, "All fields are required");

  if (isNaN(totalAmount) || totalAmount < 0)
    throw new ApiError(400, "Invalid total amount");

  if (!orderStatusArray.includes(status))
    throw new ApiError(400, "Invalid order status");

  if (!paymentMethodsArray.includes(paymentMethod))
    throw new ApiError(
      400,
      "Invalid payment method. Payment method not supported",
    );

  if (!paymentStatusArray.includes(paymentStatus))
    throw new ApiError(400, "Invalid payment status");

  totalAmount = parseFloat(totalAmount);

  const newOrder = await db.order.create({
    data: {
      clientId,
      storeId,
      totalAmount,
      status,
      paymentMethod,
      paymentStatus,
      deliveryAddress,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  if (!newOrder) throw new ApiError(500, "Error creating new order");

  res.status(201).json(new ApiResponse(201, newOrder, "New order created"));
});

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
