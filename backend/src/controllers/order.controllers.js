import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  orderStatus,
  orderStatusArray,
  paymentMethodsArray,
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

  totalAmount = parseFloat(totalAmount);

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
      totalAmount,
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
      deliveryAddress: true,
      createdAt: true,
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
            id: true,
            name: true,
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
      deliveryAddress: true,
      createdAt: true,
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
            id: true,
            name: true,
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
      deliveryAddress: true,
      createdAt: true,
      updatedAt: true,
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
            id: true,
            name: true,
            phone: true,
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
  else {
    const store = updatedOrder.store;
    if (!store.latitude || !store.longitude)
      throw new ApiError(
        400,
        "Store location not available for rider assignment",
      );

    const deliveryAddress = updatedOrder.deliveryAddress;
  }
});

const cancelOrder = asyncHandler(async (req, res) => {});

const getAllOrdersForStore = asyncHandler(async (req, res) => {});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrdersForStore,
};
