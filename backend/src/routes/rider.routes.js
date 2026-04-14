import { Router } from "express";
import { isLoggedIn, checkPermission } from "../middlewares/auth.middleware.js";
import {
  getAllDeliveries,
  getDeliveryById,
  getProfile,
  getRiderEarnings,
  getRiderRating,
  updateProfile,
  updateRiderRating,
} from "../controllers/rider.controllers.js";

const router = Router();

const riderPermission = ["RIDER", "ADMIN"];
const clientPermission = ["CLIENT", "ADMIN"];

router
  .route("/profile")
  .get(isLoggedIn, checkPermission(riderPermission), getProfile)
  .patch(isLoggedIn, checkPermission(riderPermission), updateProfile);

router
  .route("/rating")
  .get(isLoggedIn, checkPermission(riderPermission), getRiderRating);

router
  .route("/setRating/:id")
  .patch(isLoggedIn, checkPermission(clientPermission), updateRiderRating);

router
  .route("/allDeliveries")
  .get(isLoggedIn, checkPermission(riderPermission), getAllDeliveries);

router
  .route("/getDelivery/:id")
  .get(isLoggedIn, checkPermission(riderPermission), getDeliveryById);

router
  .route("/earnings")
  .post(isLoggedIn, checkPermission(riderPermission), getRiderEarnings);

export default router;
