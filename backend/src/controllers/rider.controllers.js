import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getProfile = asyncHandler(async (req, res) => {});

const updateProfile = asyncHandler(async (req, res) => {});

const getRiderRating = asyncHandler(async (req, res) => {});

const getAllDeliveries = asyncHandler(async (req, res) => {});

const getDeliveryById = asyncHandler(async (req, res) => {});

const getRiderEarnings = asyncHandler(async (req, res) => {});

export {
  getProfile,
  updateProfile,
  getRiderRating,
  getAllDeliveries,
  getDeliveryById,
  getRiderEarnings,
};
