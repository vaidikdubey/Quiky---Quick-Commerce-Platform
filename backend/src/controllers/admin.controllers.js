import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

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

const getDashboardStats = asyncHandler(async (req, res) => {});

const toggleStoreStatus = asyncHandler(async (req, res) => {});

const toggleRiderStatus = asyncHandler(async (req, res) => {});

const updateOrderStatusByAdmin = asyncHandler(async (req, res) => {});

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
