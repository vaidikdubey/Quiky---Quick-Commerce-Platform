import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const assignRider = asyncHandler(async (req, res) => {});

const updateStatus = asyncHandler(async (req, res) => {});

const getAllDeliveries = asyncHandler(async (req, res) => {});

const getDeliveryById = asyncHandler(async (req, res) => {});

const updateLocation = asyncHandler(async (req, res) => {});

const trackDelivery = asyncHandler(async (req, res) => {});

export {
  assignRider,
  updateStatus,
  getAllDeliveries,
  getDeliveryById,
  updateLocation,
  trackDelivery,
};
