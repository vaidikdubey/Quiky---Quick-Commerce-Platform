export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  partitioned: true,
  maxAge: 15 * 60 * 1000, //15min
};

export const orderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const orderStatusArray = Object.values(orderStatus);

export const paymentMethods = {
  COD: "COD",
  UPI: "UPI",
  CASH: "CASH",
  CANCELLED: "CANCELLED",
};

export const paymentMethodsArray = Object.values(paymentMethods);

export const paymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

export const paymentStatusArray = Object.values(paymentStatus);

export const deliveryStatus = {
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
};

export const deliveryStatusArray = Object.values(deliveryStatus);

export const notificationType = {
  ORDER_PLACED: "ORDER_PLACED",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_PREPARING: "ORDER_PREPARING",
  ORDER_READY_FOR_PICKUP: "ORDER_READY_FOR_PICKUP",
  ORDER_PICKED_UP: "ORDER_PICKED_UP",
  ORDER_OUT_FOR_DELIVERY: "ORDER_OUT_FOR_DELIVERY",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
};

export const notificationTypeArray = Object.values(notificationType);
