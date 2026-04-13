import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  deliveryStatus,
  deliveryStatusArray,
  orderStatus,
  paymentStatus,
} from "../utils/constants.js";
import { formatDuration, formatTimeDifference } from "../utils/timeUtils.js";

const assignRider = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const managerId = req.user.id;

  const order = await db.order.findUnique({
    where: {
      id: orderId,
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

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const riderId = req.user.id;

  if (!id || !riderId) throw new ApiError(400, "All fields are required");

  if (
    !status ||
    status === deliveryStatus.ASSIGNED ||
    !deliveryStatusArray.includes(status)
  )
    throw new ApiError(400, "Invalid delivery status.");

  const delivery = await db.delivery.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      orderId: true,
      riderId: true,
      status: true,
      pickupTime: true,
      deliveryTime: true,
      estimatedTime: true,
      order: {
        select: {
          id: true,
          clientId: true,
          storeId: true,
          status: true,
          riderId: true,
        },
      },
    },
  });

  if (!delivery) throw new ApiError(404, "Delivery not found");

  if (delivery.riderId !== riderId && req.user.role !== "ADMIN")
    throw new ApiError(
      403,
      "You are not authorized to update this delivery status",
    );

  //Edge cases. Preventing invalid states
  if (
    delivery.status === deliveryStatus.DELIVERED ||
    delivery.status === deliveryStatus.FAILED
  )
    throw new ApiError(
      400,
      `Cannot update status. Order is already ${delivery.status}`,
    );

  if (
    status === deliveryStatus.PICKED_UP &&
    delivery.status !== deliveryStatus.ASSIGNED
  )
    throw new ApiError(
      400,
      "Delivery can be marked PICKED_UP when currently status is ASSIGNED",
    );

  if (
    status === deliveryStatus.IN_TRANSIT &&
    delivery.status !== deliveryStatus.PICKED_UP
  )
    throw new ApiError(
      400,
      "Delivery can be marked IN_TRANSIT after PICKED_UP",
    );

  //Atomic transaction since delivery status should have all or none update with rollback
  const result = await db.$transaction(async (tx) => {
    const now = new Date();

    let updateData = {
      status,
    };

    if (status === deliveryStatus.PICKED_UP) {
      updateData.pickupTime = now;
      await tx.order.update({
        where: {
          id: delivery.orderId,
        },
        data: {
          status: orderStatus.OUT_FOR_DELIVERY,
        },
      });
    }

    if (status === deliveryStatus.DELIVERED) {
      updateData.deliveryTime = now;
      await tx.order.update({
        where: {
          id: delivery.orderId,
        },
        data: {
          status: orderStatus.DELIVERED,
          paymentStatus: paymentStatus.PAID,
        },
      });

      //Mark rider as available again
      await tx.riderProfile.update({
        where: {
          id: delivery.riderId,
        },
        data: {
          isAvailable: true,
          currentOrderId: null,
        },
      });
    }

    if (status === deliveryStatus.FAILED) {
      //Marking rider available again, since order failed
      await tx.riderProfile.update({
        where: {
          id: delivery.riderId,
        },
        data: {
          isAvailable: true,
          currentOrderId: null,
        },
      });

      await tx.order.update({
        where: {
          id: delivery.orderId,
        },
        data: {
          status: orderStatus.CANCELLED,
        },
      });
    }

    const updatedDelivery = await tx.delivery.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        status: true,
        pickupTime: true,
        deliveryTime: true,
        estimatedTime: true,
      },
    });

    return updatedDelivery;
  });

  //Calculate time taken
  let timeTaken = "N/A";
  let timeDifference = null;

  if (result.deliveryTime && result.pickupTime) {
    const actualMs =
      new Date(result.deliveryTime) - new Date(result.pickupTime);
    timeTaken = formatDuration(actualMs);

    if (result.estimatedTime) {
      const estimatedMs =
        new Date(result.estimatedTime) - new Date(result.pickupTime);
      const diffMs = actualMs - estimatedMs;

      timeDifference = formatTimeDifference(diffMs);
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        deliveryId: result.id,
        status: result.status,
        pickupTime: result.pickupTime,
        deliveryTime: result.deliveryTime,
        estimatedTime: result.estimatedTime,
        timeTaken,
        timeDifference,
        message: `Delivery status updated to ${result.status}`,
      },
      "Delivery status updated",
    ),
  );
});

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
        select: {
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
            select: {
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
      },
    },
  });

  if (!allDeliveries) throw new ApiError(500, "Error finding all deliveries");

  if (allDeliveries.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No deliveries found"));

  res
    .status(200)
    .json(new ApiResponse(200, allDeliveries, "All deliveries found"));
});

const getDeliveryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Delivery ID is required");

  const delivery = await db.delivery.findUnique({
    where: {
      id,
    },
    select: {
      orderId: true,
      riderId: true,
      status: true,
      pickupTime: true,
      deliveryTime: true,
      estimatedTime: true,
      createdAt: true,
      updatedAt: true,
      order: {
        select: {
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
            select: {
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
      },
    },
  });

  if (!delivery) throw new ApiError(404, "Delivery not found");

  res.status(200).json(new ApiResponse(200, delivery, "Delivery fetched"));
});

const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const { currentLatitue, currentLongitude } = req.body;

  if (!currentLatitue || !currentLongitude)
    throw new ApiError(
      400,
      "Current latitude and longitude are required to update location",
    );

  const updatedLatitude = parseFloat(currentLatitue);
  const updatedLongitude = parseFloat(currentLongitude);

  const updatedData = await db.riderProfile.update({
    where: {
      userId: id,
    },
    data: {
      currentLatitue: updatedLatitude,
      currentLongitude: updatedLongitude,
      lastLocationUpdate: new Date(), //Current time, since this is the time when location is updated
    },
    select: {
      id: true,
      currentLatitue: true,
      currentLongitude: true,
      lastLocationUpdate: true,
    },
  });

  if (!updatedData.id) throw new ApiError(500, "Error updating location");

  res
    .status(200)
    .json(new ApiResponse(200, updatedData, "Rider location updated"));
});

const trackDelivery = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Deilvery ID is required to track delivery");

  const delivery = await db.delivery.findUnique({
    where: {
      id,
    },
    select: {
      orderId: true,
      riderId: true,
      status: true,
      pickupTime: true,
      deliveryTime: true,
      estimatedTime: true,
      createdAt: true,
      order: {
        select: {
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
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
              pincode: true,
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          deliveryAddress: {
            select: {
              id: true,
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
        },
      },
      rider: {
        select: {
          id: true,
          licenseNumber: true,
          currentLatitue: true,
          currentLongitude: true,
          lastLocationUpdate: true,
          currentOrderId: true,
          totalDeliveries: true,
          rating: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
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

  if (!delivery) throw new ApiError(404, "Delivery not found");

  let locationStatus = "LIVE";
  let minutesAgo = 0;
  let locationMessage = "";

  const now = Date.now();
  const lastUpdateTime = delivery.rider.lastLocationUpdate
    ? new Date(delivery.rider.lastLocationUpdate).getTime()
    : null;

  if (
    !lastUpdateTime ||
    !delivery.rider.currentLatitue ||
    !delivery.rider.currentLongitude
  ) {
    locationStatus = "UNKNOWN";
    locationMessage = "Rider location is not available yet";
  } else {
    minutesAgo = Math.floor((now - lastUpdateTime) / 1000 / 60); //Convert to minutes

    if (minutesAgo <= 2) {
      ((locationStatus = "LIVE"),
        (locationMessage = "Live • Updated just now"));
    } else if (minutesAgo <= 5) {
      locationStatus = "RECENT";
      locationMessage = `Updated ${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    } else if (minutesAgo <= 15) {
      locationStatus = "STALE";
      locationMessage = `Updated ${minutesAgo} minutes ago • Rider may be in low-signal area`;
    } else {
      locationStatus = "VERY_STALE";
      locationMessage =
        "Location is quiet old. Rider might be offline or in a poor network area.";
    }
  }

  const responseData = {
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    status: delivery.status,
    estimatedTime: delivery.estimatedTime,
    pickupTime: delivery.pickupTime,
    deliveryTime: delivery.deliveryTime,

    rider: {
      id: delivery.rider.id,
      name: delivery.rider.user.name,
      phone: delivery.rider.user.phone,
      rating: delivery.rider.rating,
      totalDeliveries: delivery.rider.totalDeliveries,
    },

    riderLocation: {
      latitude: delivery.rider.currentLatitue,
      longitude: delivery.rider.currentLongitude,
      lastUpdated: delivery.rider.lastLocationUpdate,
      minutesAgo: minutesAgo,
      status: locationStatus, // LIVE | RECENT | STALE | VERY_STALE | UNKNOWN
      message: locationMessage,
    },

    order: {
      totalAmount: delivery.order.totalAmount,
      status: delivery.order.status,
      paymentMethod: delivery.order.paymentMethod,
      paymentStatus: delivery.order.paymentStatus,
      client: delivery.order.client,
      store: delivery.order.store,
      deliveryAddress: delivery.order.deliveryAddress,
    },

    // Helpful flags for frontend
    isRiderMoving:
      delivery.status === "IN_TRANSIT" || delivery.status === "PICKED_UP",
    canContactRider: true,
  };

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "Delivery tracking data fetched"));
});

export {
  assignRider,
  updateStatus,
  getAllDeliveries,
  getDeliveryById,
  updateLocation,
  trackDelivery,
};
