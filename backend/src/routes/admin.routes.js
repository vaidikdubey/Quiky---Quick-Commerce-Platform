import { Router } from "express";
import { checkAdmin, isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  deleteUser,
  getAllOrders,
  getAllRiders,
  getAllStores,
  getAllUsers,
  getDashboardStats,
  getPlatformAnalytics,
  sendBroadcastNotification,
  toggleRiderStatus,
  toggleStoreStatus,
  toggleUserAccount,
  updateOrderStatusByAdmin,
} from "../controllers/admin.controllers.js";

const router = Router();

router.route("/users").get(isLoggedIn, checkAdmin, getAllUsers);

router.route("/stores").get(isLoggedIn, checkAdmin, getAllStores);

router.route("/riders").get(isLoggedIn, checkAdmin, getAllRiders);

router.route("/orders").get(isLoggedIn, checkAdmin, getAllOrders);

router
  .route("/users/:id/status")
  .patch(isLoggedIn, checkAdmin, toggleUserAccount);

router.route("/stats").get(isLoggedIn, checkAdmin, getDashboardStats); // alias

router
  .route("/stores/:id/status")
  .patch(isLoggedIn, checkAdmin, toggleStoreStatus);
router
  .route("/riders/:id/status")
  .patch(isLoggedIn, checkAdmin, toggleRiderStatus);

router
  .route("/orders/:id/status")
  .patch(isLoggedIn, checkAdmin, updateOrderStatusByAdmin);

router.route("/analytics").get(isLoggedIn, checkAdmin, getPlatformAnalytics);

router.route("/users/:id").delete(isLoggedIn, checkAdmin, deleteUser);

router
  .route("/notify-all")
  .post(isLoggedIn, checkAdmin, sendBroadcastNotification);

export default router;
