import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await db.riderProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      licenseNumber: true,
      currentLatitude: true,
      currentLongitude: true,
      lastLocationUpdate: true,
      isAvailable: true,
      currentOrderId: true,
      totalDeliveries: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          deliveredOrders: true,
          riderDeliveries: true,
          notifications: true,
        },
      },
      unreadNotifications: {
        _count: {
          where: {
            isRead: false,
          },
        },
      },
    },
  });

  if (!profile) throw new ApiError(500, "Error fetching rider profile");

  const responseData = {
    rider: {
      id: profile.id,
      userId: profile.userId,
      licenseNumber: profile.licenseNumber,
      currentLatitude: profile.currentLatitude,
      currentLongitude: profile.currentLongitude,
      lastLocationUpda: profile.lastLocationUpda,
      isAvailable: profile.isAvailable,
      currentOrderId: profile.currentOrderId,
      totalDeliveries: profile.totalDeliveries,
      rating: profile.rating,
      createdAt: profile.createdAt,
    },
    user: {
      id: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      phone: profile.user.phone,
    },
    count: {
      deliveredOrders: profile._count.deliveredOrders,
      riderDeliveries: profile._count.riderDeliveries,
      totalNotifications: profile._count.notifications,
      unreadNotifications: profile.unreadNotifications._count,
    },
  };

  res.status(200).json(new ApiResponse(200, responseData, "Profile fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    licenseNumber,
    currentLatitude,
    currentLongitude,
    lastLocationUpdate,
    isAvailable,
    currentOrderId,
    totalDeliveries,
    rating,
  } = req.body;

  const data = {};

  if (licenseNumber) data.licenseNumber = licenseNumber;
  if (currentLatitude) data.currentLatitude = parseFloat(currentLatitude);
  if (currentLongitude) data.currentLongitude = parseFloat(currentLongitude);
  if (lastLocationUpdate) data.lastLocationUpdate = lastLocationUpdate;
  if (isAvailable) data.isAvailable = Boolean(isAvailable);
  if (currentOrderId) data.currentOrderId = currentOrderId;
  if (totalDeliveries) data.totalDeliveries = parseInt(totalDeliveries);
  if (rating) data.rating = parseFloat(rating);

  const updatedProfile = await db.riderProfile.update({
    where: {
      userId,
    },
    data,
    select: {
      id: true,
      userId: true,
      licenseNumber: true,
      currentLatitude: true,
      currentLongitude: true,
      lastLocationUpdate: true,
      isAvailable: true,
      currentOrderId: true,
      totalDeliveries: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          deliveredOrders: true,
          riderDeliveries: true,
          notifications: true,
        },
      },
      unreadNotifications: {
        _count: {
          where: {
            isRead: false,
          },
        },
      },
    },
  });

  if (!updatedProfile) throw new ApiError(500, "Error updating profile");

  const responseData = {
    rider: {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      licenseNumber: updatedProfile.licenseNumber,
      currentLatitude: updatedProfile.currentLatitude,
      currentLongitude: updatedProfile.currentLongitude,
      lastLocationUpda: updatedProfile.lastLocationUpda,
      isAvailable: updatedProfile.isAvailable,
      currentOrderId: updatedProfile.currentOrderId,
      totalDeliveries: updatedProfile.totalDeliveries,
      rating: updatedProfile.rating,
      createdAt: updatedProfile.createdAt,
    },
    user: {
      id: updatedProfile.user.id,
      name: updatedProfile.user.name,
      email: updatedProfile.user.email,
      phone: updatedProfile.user.phone,
    },
    count: {
      deliveredOrders: updatedProfile._count.deliveredOrders,
      riderDeliveries: updatedProfile._count.riderDeliveries,
      totalNotifications: updatedProfile._count.notifications,
      unreadNotifications: updatedProfile.unreadNotifications._count,
    },
  };

  res.status(200).json(new ApiResponse(200, responseData, "Profile updated"));
});

const getRiderRating = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const rating = await db.riderProfile.findUnique({
    where: {
      userId,
    },
    select: {
      rating: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!rating) throw new ApiError(500, "Error fetching rating");

  res.status(200).json(new ApiResponse(200, rating, "Rider rating fetched"));
});

const getAllDeliveries = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const allDeliveries = await db.riderProfile.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      licenseNumber: true,
      currentLatitude: true,
      currentLongitude: true,
      lastLocationUpdate: true,
      isAvailable: true,
      currentOrderId: true,
      totalDeliveries: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          deliveredOrders: true,
          riderDeliveries: true,
          notifications: true,
        },
      },
      unreadNotifications: {
        _count: {
          where: {
            isRead: false,
          },
        },
      },
    },
  });

  if (!allDeliveries) throw new ApiError(500, "Error fetching deliveries");

  if (allDeliveries.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No deliveries found"));

  res
    .status(200)
    .json(new ApiResponse(200, allDeliveries, "All deliveries fetched"));
});

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
