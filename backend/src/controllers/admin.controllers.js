import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllUsers = asyncHandler(async (req, res) => {});

const getAllStores = asyncHandler(async (req, res) => {});

const getAllRiders = asyncHandler(async (req, res) => {});

const getAllOrders = asyncHandler(async (req, res) => {});

const toggleUserAccount = asyncHandler(async (req, res) => {});

export {
  getAllUsers,
  getAllStores,
  getAllRiders,
  getAllOrders,
  toggleUserAccount,
};
