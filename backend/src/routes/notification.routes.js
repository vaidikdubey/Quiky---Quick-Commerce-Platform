import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getAll").get(isLoggedIn, getAllNotifications);

router.route("/unread").get(isLoggedIn, getAllUnreadNotifications);

router.route("/read/:id").patch(isLoggedIn, markNotificationRead);

router.route("/delete/:id").delete(isLoggedIn, deleteNotification);

export default router;
