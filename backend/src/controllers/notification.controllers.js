import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllNotifications = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const notification = await db.notification.findMany({
    where: {
      userId: id,
    },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      data: true,
      isRead: true,
      readAt: true,
      orderId: true,
      storeId: true,
      riderId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          id: true,
          clientId: true,
          storeId: true,
          riderId: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          addressId: true,
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          pincode: true,
          isActive: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      },
      rider: {
        select: {
          id: true,
          userId: true,
          licenseNumber: true,
          totalDeliveries: true,
          rating: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!notification)
    throw new ApiError(500, "Error fetching all notifications");

  res
    .status(200)
    .json(new ApiResponse(200, notification, "All notifications fetched"));
});

const getAllUnreadNotifications = asyncHandler(async (req, res) => {});

const markNotificationRead = asyncHandler(async (req, res) => {});

const deleteNotification = asyncHandler(async (req, res) => {});

export {
  getAllNotifications,
  getAllUnreadNotifications,
  markNotificationRead,
  deleteNotification,
};
