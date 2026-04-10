import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { orderStatus } from "../utils/constants.js";

const assignRider = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const managerId = req.user.id;

  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      clientId: true,
      storeId: true,
      riderId: true,
      totalAmount: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      addressId: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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
          managerId: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      delivery: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!order) throw new ApiError(404, "Order not found");

  if (order.store.managerId !== managerId && req.user.role !== "ADMIN")
    throw new ApiError(
      403,
      "You are not authorized to assign rider to this order",
    );

  if (order.status !== orderStatus.READY_FOR_PICKUP)
    throw new ApiError(
      400,
      `Cannot assign order. Order status is ${order.status}. It must be ${orderStatus.READY_FOR_PICKUP} to assign delivery partner`,
    );

  if (order.riderId)
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          order,
          `Your order is already assigned with our delivery partner.`,
        ),
      );

  const availableRiders = await db.riderProfile.findMany({
    where: {
      isAvailable: true,
      currentOrderId: null,
      user: {
        isActive: true,
      },
    },
    select: {
      id: true,
      userId: true,
      currentLatitue: true,
      currentLongitude: true,
      rating: true,
      totalDeliveries: true,
      user: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { rating: "desc" }, //Prefer higher rated riders
    take: 10,
  });

  if (availableRiders.length === 0)
    throw new ApiError(
      400,
      "No riders available at the moment. Please try again shortly",
    );

  const selectedRider = availableRiders[0];

  const result = await db.$transaction(async (tx) => {
    //Create delivery record
    const delivery = await tx.delivery.create({
      data: {
        orderId: order.id,
        riderId: selectedRider.id,
        status: "ASSIGNED",
        estimatedTime: new Date(Date.now() + 20 * 60 * 1000), //~20 mins from now
      },
      select: {
        id: true,
        status: true,
        estimatedTime: true,
      },
    });

    //Update order
    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        riderId: selectedRider.id,
        status: "OUT_FOR_DELIVERY",
      },
    });

    //Update rider profile (mark rider as busy)
    await tx.riderProfile.update({
      where: {
        id: selectedRider.id,
      },
      data: {
        isAvailable: true,
        currentOrderId: order.id,
        totalDeliveries: { increment: 1 },
      },
    });

    return { delivery, rider: selectedRider };
  });

  const updatedOrder = await db.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      client: {
        select: {
          name: true,
          phone: true,
        },
      },
      store: {
        select: {
          name: true,
        },
      },
      rider: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
          rating: true,
        },
      },
      delivery: {
        select: {
          id: true,
          status: true,
          estimatedTime: true,
        },
      },
    },
  });

  // Future enhancement: Send real - time notification
  //     Client: "Your order has been assigned to rider XYZ"
  //     Rider: Push notification + order details
  //     Store manager: Confirmation of order assignment and rider

  res.status(200).json(
    new ApiResponse(
      200,
      {
        order: updatedOrder,
        rider: {
          id: result.rider.id,
          name: result.rider.user.name,
          phone: result.rider.user.phone,
          rating: result.rider.rating,
        },
        delivery: result.delivery,
        message: `Order assigned to rider ${result.rider.user.name} successfully! ETA ~20 mins 🚀`,
      },
      "Rider assigned successfully",
    ),
  );
});

const updateStatus = asyncHandler(async (req, res) => {});

const getAllDeliveries = asyncHandler(async (req, res) => {
  const { id } = req.user;

  if (!id) throw new ApiError(400, "User ID is required");

  const allDeliveries = await db.delivery.findMany({
    where: {
      riderId: id,
    },
    select: {
      id: true,
      orderId: true,
      riderId: true,
      status: true,
      pickupTime: true,
      deliveryTime: true,
      estimatedTime: true,
      createdAt: true,
      order: {
        id: true,
        totalAmount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        rider: {
          id: true,
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
          _count: {
            select: {
              deliveredOrders: true,
              riderDeliveries: true,
            },
          },
        },
      },
    },
  });

  if (!allDeliveries) throw new ApiError(400, "Error finding all deliveries");

  if (allDeliveries.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No deliveries found"));

  res
    .status(200)
    .json(new ApiResponse(200, allDeliveries, "All deliveries found"));
});

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
