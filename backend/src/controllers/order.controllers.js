import { db } from "../db/db.js";
import { Prisma } from "../generated/prisma/index.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  orderStatus,
  orderStatusArray,
  paymentMethods,
  paymentMethodsArray,
  paymentStatus,
  paymentStatusArray,
} from "../utils/constants.js";

const createOrder = asyncHandler(async (req, res) => {
  const clientId = req.user.id;

  const {
    storeId,
    totalAmount,
    status = "PENDING",
    paymentMethod,
    paymentStatus,
    addressId,
  } = req.body;

  //Data validation
  if (!clientId || !storeId || !totalAmount || !paymentMethod || !paymentStatus)
    throw new ApiError(400, "All fields are required");

  if (isNaN(totalAmount) || totalAmount < 0)
    throw new ApiError(400, "Invalid total amount");

  if (!orderStatusArray.includes(status))
    throw new ApiError(400, "Invalid order status");

  if (!paymentMethodsArray.includes(paymentMethod))
    throw new ApiError(
      400,
      "Invalid payment method. Payment method not supported",
    );

  if (!paymentStatusArray.includes(paymentStatus))
    throw new ApiError(400, "Invalid payment status");

  const amount = parseFloat(totalAmount);

  let selectedAddress;

  if (addressId) {
    selectedAddress = await db.address.findUnique({
      where: {
        id: addressId,
        userId: clientId,
      },
      select: {
        label: true,
        fullAddress: true,
        latitude: true,
        longitude: true,
        pincode: true,
        city: true,
        state: true,
        landmark: true,
      },
    });

    if (!selectedAddress) throw new ApiError(404, "Address not found");
  } else {
    //Fallback: when user does not provide address, we use the default address
    const userWithDefault = await db.user.findUnique({
      where: {
        id: clientId,
      },
      select: {
        addresses: {
          where: {
            isDefault: true,
          },
          select: {
            label: true,
            fullAddress: true,
            latitude: true,
            longitude: true,
            pincode: true,
            city: true,
            state: true,
            landmark: true,
          },
          take: 1,
        },
      },
    });

    selectedAddress = userWithDefault?.addresses?.[0];

    if (!selectedAddress)
      throw new ApiError(
        400,
        "No default address found. Please add and select a default address",
      );
  }

  const newOrder = await db.order.create({
    data: {
      clientId,
      storeId,
      totalAmount: amount,
      status,
      paymentMethod,
      paymentStatus,
      addressId,
    },
    select: {
      id: true,
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
        },
      },
      totalAmount: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      deliveryAddress: {
        select: {
          label: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
          pincode: true,
          city: true,
          state: true,
          landmark: true,
        },
      },
      createdAt: true,
    },
  });

  if (!newOrder) throw new ApiError(500, "Error creating new order");

  res.status(201).json(new ApiResponse(201, newOrder, "New order created"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const allOrders = await db.order.findMany({
    where: {
      clientId: id,
    },
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
      createdAt: true,
      deliveryAddress: {
        select: {
          label: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
          pincode: true,
          city: true,
          state: true,
          landmark: true,
        },
      },
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
          pincode: true,
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      rider: {
        select: {
          id: true,
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
      },
      delivery: {
        select: {
          status: true,
          pickupTime: true,
          deliveryTime: true,
          estimatedTime: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!allOrders || allOrders.length < 0)
    throw new ApiError(400, "Error fetching all orders");

  if (allOrders.length === 0)
    return res.status(200).json(new ApiResponse(200, [], "No orders found"));

  res.status(200).json(new ApiResponse(200, allOrders, "All orders fetched"));
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Order ID is required");

  const order = await db.order.findUnique({
    where: {
      id,
    },
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
      createdAt: true,
      deliveryAddress: {
        select: {
          label: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
          pincode: true,
          city: true,
          state: true,
          landmark: true,
        },
      },
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
          pincode: true,
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      rider: {
        select: {
          id: true,
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
      },
      delivery: {
        select: {
          status: true,
          pickupTime: true,
          deliveryTime: true,
          estimatedTime: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!order) throw new ApiError(404, "Order not found");

  res.status(200).json(new ApiResponse(200, order, "Order found"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!orderStatusArray.includes(status))
    throw new ApiError(400, "Invalid order status");

  const updatedOrder = await db.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
    select: {
      totalAmount: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      addressId: true,
      createdAt: true,
      updatedAt: true,
      deliveryAddress: {
        select: {
          label: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
          pincode: true,
          city: true,
          state: true,
          landmark: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
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
          manager: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      },
      rider: {
        //Might be null, but since we are automating rider assignment we select this
        select: {
          id: true,
          licenseNumber: true,
          currentLatitue: true,
          currentLongitude: true,
          lastLocationUpdate: true,
          totalDeliveries: true,
          rating: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (status !== orderStatus.READY_FOR_PICKUP)
    return res
      .status(200)
      .json(new ApiResponse(200, updatedOrder, "Order status updated"));

  if (updatedOrder.rider)
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...updatedOrder, note: "Rider already assigned to this order" },
          `Order is ready for pickup - Rider ${updatedOrder.rider.user?.name || "already assigned"}`,
        ),
      );

  const store = updatedOrder.store;

  if (!store.latitude || !store.longitude)
    throw new ApiError(
      400,
      "Store location not available for rider assignment",
    );

  const deliveryAddress = updatedOrder.deliveryAddress;

  const customerLat = deliveryAddress?.latitude;
  const customerLong = deliveryAddress?.longitude;

  if (!customerLat || !customerLong)
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedOrder,
          note: "Customer co-ordinates missing. Manual rider assignment needed.",
        },
        "Order is ready for pickup - Rider assignment pending",
      ),
    );

  //Find nearby avaliable riders (range: 8km)
  const _radii = [5, 8, 12, 15, 20];

  let bestRider = null;

  for (const radius of _radii) {
    const nearbyRidersQuery = Prisma.sql`
      WITH rider_distances AS (
        SELECT 
          r.id,
          r."currentLatitue" as latitude,
          r."currentLongitude" as longitude,
          r.rating,
          r."totalDeliveries",
          u.name as "riderName",
          u.phone as "riderPhone",
          (6371 * acos(
            LEAST(1.0,
              cos(radians(${store.latitude})) * cos(radians(r."currentLatitue")) *
              cos(radians(r."currentLongitude") - radians(${store.longitude})) +
              sin(radians(${store.latitude})) * sin(radians(r."currentLatitue"))
            )
          )) AS distance_km
      FROM "RiderProfile" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r."isAvailable" = true
        AND r."currentLatitue" IS NOT NULL
        AND r."currentLongitude" IS NOT NULL
        AND u."isActive" = true
        -- Bounding box for performance (fast filter)
        AND r."currentLatitue" BETWEEN ${store.latitude} - (${radius} / 111.0)
                                 AND ${store.latitude} + (${radius} / 111.0)
        AND r."currentLongitude" BETWEEN ${store.longitude} - (${radius} / (111.0 * cos(radians(${store.latitude}))))
                                 AND ${store.longitude} + (${radius} / (111.0 * cos(radians(${store.latitude}))))
    )
    SELECT *
    FROM rider_distances
    WHERE distance_km <= ${radius}
    ORDER BY distance_km ASC, rating DESC
    LIMIT 5;
        `;

    const nearbyRiders = await db.$queryRaw(nearbyRidersQuery);

    if (nearbyRiders?.length > 0) {
      bestRider = nearbyRiders[0];
      break; // Found a rider → stop increasing radius
    }
  }

  // If still no rider found after trying all radii
  if (!bestRider) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedOrder,
          note: "No rider available in your area right now.",
        },
        "Order is ready for pickup - No rider found",
      ),
    );
  }

  // Assign the best rider
  await db.$transaction([
    db.order.update({
      where: { id },
      data: { riderId: bestRider.id },
    }),
    db.RiderProfile.update({
      where: { id: bestRider.id },
      data: { isAvailable: false },
    }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...updatedOrder,
        assignedRider: {
          id: bestRider.id,
          name: bestRider.riderName,
          phone: bestRider.riderPhone,
          distanceFromStore: parseFloat(bestRider.distance_km.toFixed(2)),
          rating: bestRider.rating,
        },
      },
      `Rider ${bestRider.riderName} assigned successfully (~${bestRider.distance_km.toFixed(1)} km away)`,
    ),
  );
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orderDetails = await db.order.findUnique({
    where: {
      id,
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
    },
  });

  if (orderDetails.status !== "PENDING")
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          orderDetails,
          "Order cannot be cancelled once it is accepted",
        ),
      );

  const cancelledOrder = await db.order.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
      paymentMethod: paymentMethods.CANCELLED,
      paymentStatus: paymentStatus.FAILED,
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
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          pincode: true,
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
      deliveryAddress: {
        select: {
          label: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
          pincode: true,
          city: true,
          state: true,
          landmark: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!cancelledOrder) throw new ApiError(404, "Order not found");

  res
    .status(200)
    .json(new ApiResponse(200, cancelledOrder, "Order cancelled successfully"));
});

const getAllOrdersForStore = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { id } = req.user;

  if (!storeId || !id)
    throw new ApiError(400, "Store ID and user ID are required");

  const store = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      managerId: true,
    },
  });

  if (!store) throw new ApiError(404, "Store not found");

  if (store.managerId !== id && req.user.role !== "ADMIN")
    throw new ApiError(403, "You are not authorized to access this store");

  const orders = await db.order.findMany({
    where: {
      storeId,
    },
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
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          pincode: true,
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
              email: true,
              phone: true,
            },
          },
        },
      },
      deliveryAddress: {
        select: {
          label: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
          pincode: true,
          city: true,
          state: true,
          landmark: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!orders) throw new ApiError(404, "Orders not found");

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrdersForStore,
};
