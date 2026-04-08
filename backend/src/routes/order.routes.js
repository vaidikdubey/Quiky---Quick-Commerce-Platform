import { Router } from "express";
import { isLoggedIn, checkPermission } from "../middlewares/auth.middleware.js";

const router = Router();

const clientPermission = ["CLIENT", "ADMIN"];
const managerPermission = ["STORE_MANAGER", "ADMIN"];

router
  .route("/create")
  .post(isLoggedIn, checkPermission(clientPermission), createOrder);

router.route("/myOrders").get(isLoggedIn, getAllOrders);

router.route("/getOrder/:id").get(isLoggedIn, getOrderById);

router
  .route("/updateStatus/:id")
  .patch(isLoggedIn, checkPermission(managerPermission), updateOrderStatus);

router.route("/cancel/:id").post(isLoggedIn, cancelOrder);

router
  .route("/storeOrders/:storeId")
  .get(isLoggedIn, checkPermission(managerPermission), getAllOrdersForStore);

export default router;
