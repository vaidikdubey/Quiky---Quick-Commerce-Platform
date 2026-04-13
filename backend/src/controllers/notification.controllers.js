import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { notificationTypeArray } from "../utils/constants.js";

const createNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, title, body, data, orderId, storeId, riderId } = req.body;

  if (!type || !title || !body || !orderId || !storeId)
    throw new ApiError(400, "All fields are required");

  if (!notificationTypeArray.includes(type))
    throw new ApiError(400, "Invalid notification type");

  const newNotifData = { userId, type, title, body, orderId, storeId };

  if (data) newNotifData.data = data;
  if (riderId) newNotifData.riderId = riderId;

  const newNotification = await db.notification.create({
    data: newNotifData,
    select: {
      id: true,
      userId: true,
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
    },
  });

  if (!newNotification)
    throw new ApiError(500, "Error creating new notification");

  res
    .status(201)
    .json(new ApiResponse(201, newNotification, "Notification created"));
});

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

  if (notification.length === 0)
    return res.status(200).json(new ApiResponse(200, [], "No notifications"));

  res
    .status(200)
    .json(new ApiResponse(200, notification, "All notifications fetched"));
});

const getAllUnreadNotifications = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const unreadNotification = await db.notification.findMany({
    where: {
      userId: id,
      isRead: false,
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

  if (!unreadNotification)
    throw new ApiError(500, "Error fetching unread notifications");

  if (unreadNotification.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No unread notifications"));

  res
    .status(200)
    .json(
      new ApiResponse(200, unreadNotification, "Unread notifications fetched"),
    );
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Notification ID is required");

  const readNotification = await db.notification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
      readAt: new Date(),
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

  if (!readNotification)
    throw new ApiError(500, "Error marking notification read");

  res
    .status(200)
    .json(
      new ApiResponse(200, readNotification, "Notification marked as read"),
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Notification ID is required");

  const deletedNotification = await db.notification.delete({
    where: {
      id,
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

  if (!deletedNotification) throw new ApiError(404, "Notification not found");

  res
    .status(200)
    .json(new ApiResponse(200, deletedNotification, "Notification deleted"));
});

export {
  createNotification,
  getAllNotifications,
  getAllUnreadNotifications,
  markNotificationRead,
  deleteNotification,
};
