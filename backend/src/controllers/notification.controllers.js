import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllNotifications = asyncHandler(async (req, res) => {});

const getAllUnreadNotifications = asyncHandler(async (req, res) => {});

const markNotificationRead = asyncHandler(async (req, res) => {});

const deleteNotification = asyncHandler(async (req, res) => {});

export {
  getAllNotifications,
  getAllUnreadNotifications,
  markNotificationRead,
  deleteNotification,
};
