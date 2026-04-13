import { Router } from "express";
import { checkAdmin, isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  getAllOrders,
  getAllRiders,
  getAllStores,
  getAllUsers,
  toggleUserAccount,
} from "../controllers/admin.controllers.js";

const router = Router();

router.route("/users").get(isLoggedIn, checkAdmin, getAllUsers);

router.route("/stores").get(isLoggedIn, checkAdmin, getAllStores);

router.route("/riders").get(isLoggedIn, checkAdmin, getAllRiders);

router.route("/orders").get(isLoggedIn, checkAdmin, getAllOrders);

router
  .route("/users/:id/status")
  .patch(isLoggedIn, checkAdmin, toggleUserAccount);

export default router;
