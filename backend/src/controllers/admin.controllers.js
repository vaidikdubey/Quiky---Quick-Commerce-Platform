import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  deliveryStatus,
  notificationType,
  orderStatus,
  orderStatusArray,
} from "../utils/constants.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "", role } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const whereClause = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    }),
    ...(role && { role: role.toUpperCase() }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        isVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    }),
    db.user.count({ where: whereClause }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      "All users fetched",
    ),
  );
});

const getAllStores = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const whereClause = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { pincode: { contains: search } },
        ],
      }
    : {};

  const [stores, total] = await Promise.all([
    db.store.findMany({
      where: whereClause,
      skip,
      take,
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        pincode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.store.count({ where: whereClause }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stores,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      "All stores fetched",
    ),
  );
});

const getAllRiders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const whereClause = {
    user: {
      role: "RIDER",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      }),
    },
  };

  const [riders, total] = await Promise.all([
    db.riderProfile.findMany({
      where: whereClause,
      skip,
      take,
      select: {
        id: true,
        licenseNumber: true,
        currentLatitude: true,
        currentLongitude: true,
        lastLocationUpdate: true,
        isAvailable: true,
        totalDeliveries: true,
        rating: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.riderProfile.count({ where: whereClause }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        riders,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      "All riders fetched",
    ),
  );
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, storeId, clientId } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const whereClause = {
    ...(status && { status }),
    ...(storeId && { storeId }),
    ...(clientId && { clientId }),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: whereClause,
      skip,
      take,
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
        store: {
          select: { id: true, name: true, address: true, pincode: true },
        },
        rider: {
          select: {
            id: true,
            user: { select: { name: true, phone: true } },
            rating: true,
          },
        },
        delivery: {
          select: {
            status: true,
            pickupTime: true,
            deliveryTime: true,
            estimatedTime: true,
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.order.count({ where: whereClause }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      "All orders fetched",
    ),
  );
});

const toggleUserAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // optional – if not provided, we toggle

  if (!id) throw new ApiError(400, "User ID is required");

  const user = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      isActive: true,
      role: true,
      name: true,
      email: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  // Security: Never allow deactivation of ADMIN accounts
  if (user.role === "ADMIN") {
    throw new ApiError(403, "Cannot modify admin account status");
  }

  const newStatus = isActive !== undefined ? Boolean(isActive) : !user.isActive;

  const updatedUser = await db.user.update({
    where: { id },
    data: { isActive: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        `User account successfully ${newStatus ? "activated" : "deactivated"}`,
      ),
    );
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeStores,
    activeRiders,
    totalOrdersToday,
    totalRevenueToday,
    pendingOrders,
    avgDeliveryTime,
  ] = await Promise.all([
    db.user.count(),
    db.store.count({ where: { isActive: true } }),
    db.riderProfile.count({ where: { isAvailable: true } }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.aggregate({
      where: { createdAt: { gte: todayStart }, paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    db.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"],
        },
      },
    }),
    db.delivery.aggregate({
      where: {
        status: deliveryStatus.DELIVERED,
        deliveryTime: { not: null },
        pickupTime: { not: null },
      },
    }),
  ]);

  const avgTimeResult = await db.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM ("deliveryTime" - "pickupTime")) / 60) as avg_minutes
      FROM "Delivery"
      WHERE status = 'DELIVERED' 
        AND "deliveryTime" IS NOT NULL 
        AND "pickupTime" IS NOT NULL
  `;

  const stats = {
    totalUsers,
    activeStores,
    activeRiders,
    ordersToday: totalOrdersToday,
    revenueToday: parseFloat(totalOrdersToday._sum.totalAmount || 0).toFixed(2),
    pendingOrders,
    avgDeliveryTimeMins: parseFloat(avgTimeResult[0]?.avg_minutes || 0).toFixed(
      1,
    ),
    systemHealth: "Healthy",
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard statistics fetched"));
});

const toggleStoreStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!id) throw new ApiError(400, "Store ID is required");

  const store = await db.store.findUnique({
    where: {
      id,
    },
    select: {
      isActive: true,
    },
  });

  if (!store) throw new ApiError(404, "Store not found");

  const newStatus =
    isActive !== undefined ? Boolean(isActive) : !store.isActive;

  const updated = await db.store.update({
    where: {
      id,
    },
    data: {
      isActive: newStatus,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  if (!updated) throw new ApiError(500, "Error updating store status");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        `Store ${newStatus ? "activated" : "deactivated"}`,
      ),
    );
});

const toggleRiderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  if (!id) throw new ApiError(400, "Rider ID is required");

  const rider = await db.riderProfile.findUnique({
    where: {
      id,
    },
    select: {
      isAvailable: true,
    },
  });

  if (!rider) throw new ApiError(404, "Rider not found");

  const newStatus =
    isAvailable !== undefined ? Boolean(isAvailable) : !rider.isAvailable;

  const updated = await db.riderProfile.update({
    where: {
      id,
    },
    data: {
      isAvailable: newStatus,
    },
    select: {
      id: true,
      isAvailable: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!updated) throw new ApiError(500, "Error updating rider status");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        `Rider ${isAvailable ? "activated" : "deactivated"}`,
      ),
    );
});

const updateOrderStatusByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) throw new ApiError(400, "Order ID is required");

  if (!status) throw new ApiError(400, "Order status is required");

  if (!orderStatusArray.includes(status))
    throw new ApiError(400, "Invalid order status");

  const order = await db.order.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
      riderId: true,
      clientId: true,
      storeId: true,
    },
  });

  if (!order) throw new ApiError(404, "Order not found");

  // Prevent updating already delivered or cancelled orders unless admin forces from backend
  if (
    order.status === orderStatus.DELIVERED ||
    order.status === orderStatus.CANCELLED
  ) {
    throw new ApiError(400, `Cannot change status of a ${order.status} order`);
  }

  const updatedOrder = await db.$transaction(async (tx) => {
    // Update order status
    const orderUpdate = await tx.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        clientId: true,
        storeId: true,
        riderId: true,
      },
    });

    // If status is DELIVERED and rider exists → free the rider
    if (status === orderStatus.DELIVERED && order.riderId) {
      await tx.riderProfile.update({
        where: {
          id: order.riderId,
        },
        data: {
          isAvailable: true,
          currentOrderId: null,
        },
      });

      // Mark delivery as completed if exists
      await tx.delivery.updateMany({
        where: {
          orderId: id,
        },
        data: {
          status: deliveryStatus.DELIVERED,
          deliveryTime: new Date(),
        },
      });
    }

    // If status is CANCELLED → free rider if assigned
    if (status === orderStatus.CANCELLED && order.riderId) {
      await tx.riderProfile.update({
        where: {
          id: order.riderId,
        },
        data: {
          isAvailable: true,
          currentOrderId: null,
        },
      });

      await tx.delivery.updateMany({
        where: {
          orderId: id,
        },
        data: {
          status: deliveryStatus.FAILED,
        },
      });
    }

    return orderUpdate;
  });

  // Create notification for client
  await db.notification.create({
    data: {
      userId: updatedOrder.clientId,
      type:
        status === orderStatus.CANCELLED
          ? notificationType.ORDER_CANCELLED
          : notificationType.ORDER_CONFIRMED,
      title: `Order ${status}`,
      body: `Your order #${updatedOrder.id.slice(-6).toUpperCase()} status has been updated to ${status} by admin.`,
      orderId: updatedOrder.id,
      storeId: updatedOrder.storeId,
      riderId: updatedOrder.riderId || null,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedOrder,
        `Order status updated to ${status} successfully by admin`,
      ),
    );
});

const getPlatformAnalytics = asyncHandler(async (req, res) => {});

const deleteUser = asyncHandler(async (req, res) => {});

const sendBroadcastNotification = asyncHandler(async (req, res) => {});

export {
  getAllUsers,
  getAllStores,
  getAllRiders,
  getAllOrders,
  toggleUserAccount,
  getDashboardStats,
  toggleStoreStatus,
  toggleRiderStatus,
  updateOrderStatusByAdmin,
  getPlatformAnalytics,
  deleteUser,
  sendBroadcastNotification,
};
