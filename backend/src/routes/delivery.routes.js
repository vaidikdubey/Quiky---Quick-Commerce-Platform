import { Router } from "express";
import { isLoggedIn, checkPermission } from "../middlewares/auth.middleware.js";
import {
  assignRider,
  getAllDeliveries,
  getDeliveryById,
  trackDelivery,
  updateLocation,
  updateStatus,
} from "../controllers/delivery.controllers.js";

const router = Router();

const managerPermission = ["STORE_MANAGER", "ADMIN"];
const riderPermission = ["RIDER", "ADMIN"];

router
  .route("/assign/:orderId")
  .post(isLoggedIn, checkPermission(managerPermission), assignRider);

router
  .route("/status/:id")
  .patch(isLoggedIn, checkPermission(riderPermission), updateStatus);

router
  .route("/myDeliveries")
  .get(isLoggedIn, checkPermission(riderPermission), getAllDeliveries);

router
  .route("/getDelivery/:id")
  .get(isLoggedIn, checkPermission(riderPermission), getDeliveryById);

router
  .route("/location")
  .patch(isLoggedIn, checkPermission(riderPermission), updateLocation);

//Client side route to track delivery
router.route("/track/:id").get(isLoggedIn, trackDelivery);

export default router;
