import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { orderStatus } from "../utils/constants.js";

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
    },
  });

  const unreadNotifications = await db.notification.count({
    where: {
      userId,
      isRead: false,
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
      lastLocationUpda: profile.lastLocationUpdate,
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
      unreadNotifications,
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
  };

  res.status(200).json(new ApiResponse(200, responseData, "Profile updated"));
});

const getRiderRating = asyncHandler(async (req, res) => {
  const userId = req.params;

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

const updateRiderRating = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Rider ID is required");

  const { rating } = req.body;

  if (!rating) throw new ApiError(400, "Rating is required");

  if (rating < 0 || rating > 5)
    throw new ApiError(400, "Rating must be between 0 and 5");

  const rider = await db.riderProfile.findUnique({
    where: {
      id,
    },
    select: {
      totalDeliveries: true,
      rating: true,
    },
  });

  const oldCount = rider.totalDeliveries;
  const oldRating = rider.rating;

  let newRating;
  let newCount;

  //First delivery
  if (oldCount === 0) {
    newRating = parseFloat(rating);
    newCount = 1;
  } else {
    const oldSum = oldRating * oldCount;
    const newSum = oldSum + parseFloat(rating);
    newCount = oldCount + 1;
    newRating = newSum / newCount;
  }

  const updatedRider = await db.riderProfile.update({
    where: {
      id,
    },
    data: {
      rating: parseFloat(newRating.toFixed(2)),
      totalDeliveries: newCount,
    },
    select: {
      id: true,
      userId: true,
      licenseNumber: true,
      totalDeliveries: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!updatedRider) throw new ApiError(500, "Error updating rating");

  res.status(200).json(new ApiResponse(200, updatedRider, "Rating updated"));
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
      deliveredOrders: {
        select: {
          id: true,
          orderId: true,
          status: true,
          pickupTime: true,
          deliveryTime: true,
          estimatedTime: true,
          createdAt: true,
          updatedAt: true,
          order: {
            select: {
              totalAmount: true,
              status: true,
              paymentMethod: true,
              paymentStatus: true,
            },
          },
          _count: {
            items: true,
          },
        },
      },
      _count: {
        select: {
          deliveredOrders: true,
          riderDeliveries: true,
          notifications: true,
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

const getDeliveryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Delivery ID is required");

  const delivery = await db.riderProfile.findUnique({
    where: {
      id,
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
      deliveredOrders: {
        select: {
          id: true,
          orderId: true,
          status: true,
          pickupTime: true,
          deliveryTime: true,
          estimatedTime: true,
          createdAt: true,
          updatedAt: true,
          order: {
            select: {
              totalAmount: true,
              status: true,
              paymentMethod: true,
              paymentStatus: true,
            },
          },
          _count: {
            items: true,
          },
        },
      },
      _count: {
        select: {
          deliveredOrders: true,
          riderDeliveries: true,
          notifications: true,
        },
      },
    },
  });

  if (!delivery) throw new ApiError(500, "Error fetching delivery");

  res.status(200).json(new ApiResponse(200, delivery, "Delivery fetched"));
});

const getRiderEarnings = asyncHandler(async (req, res) => {
  const riderId = req.user.id;

  const { startDate, endDate, limit = 30 } = req.body;

  let dateFilter = {};

  if (startDate || endDate) {
    dateFilter = {
      createdAt: {
        ...(startDate && { gte: new Date(startDate) }), //if start date then >= start date
        ...(endDate && { lte: new Date(endDate) }), //if end date then <= end date
      },
    };
  }

  const earnings = await db.delivery.findMany({
    where: {
      riderId,
      status: orderStatus.DELIVERED,
      ...dateFilter,
    },
    select: {
      id: true,
      orderId: true,
      pickupTime: true,
      deliveryTime: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          client: {
            select: {
              name: true,
            },
          },
          store: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: parseInt(limit),
  });

  if (!earnings || earnings.length === 0)
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalEarnings: 0,
          totalDeliveries: 0,
          deliveries: [],
        },
        "No completed deliveries yet. Start delivering to earn!",
      ),
    );

  // Calculate earnings (The commission logic can be adjust as per the business model)
  // Current example: 15% of order value + fixed ₹30 per delivery (common in quick commerce)
  const COMMISSION_RATE = 0.15; // 15%
  const FIXED_PER_DELIVERY = 30; // ₹30 per successful delivery

  let totalEarnings = 0;
  let totalDeliveries = earnings.length;

  const deliveriesWithEarnings = earnings.map((delivery) => {
    const orderAmount = delivery.order.totalAmount || 0;
    const commission = orderAmount * COMMISSION_RATE;
    const earnings = Math.round(commission + FIXED_PER_DELIVERY); // Round to nearest rupee

    totalEarnings += earnings;

    return {
      deliveryId: delivery.id,
      orderId: delivery.order.id,
      storeName: delivery.order.store.name,
      customerName: delivery.order.client.name,
      orderAmount: parseFloat(orderAmount.toFixed(2)),
      commission,
      fixedEarning: FIXED_PER_DELIVERY,
      totalEarning: earnings,
      deliveryTime: delivery.deliveryTime,
      timeTaken: delivery.pickupTime
        ? Math.round(
            (new Date(delivery.deliveryTime) - new Date(delivery.pickupTime)) /
              (1000 * 60),
          ) + " mins"
        : "N/A",
      date: delivery.createdAt,
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalDeliveries,
        averageEarningPerDelivery: parseFloat(
          (totalEarnings / totalDeliveries).toFixed(2),
        ),
        deliveries: deliveriesWithEarnings,
        note: "Earnings include 15% commission on order value + ₹30 fixed per delivery",
      },
      "Rider earnings fetched successfully",
    ),
  );
});

export {
  getProfile,
  updateProfile,
  getRiderRating,
  updateRiderRating,
  getAllDeliveries,
  getDeliveryById,
  getRiderEarnings,
};
