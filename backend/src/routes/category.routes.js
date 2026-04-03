import { Router } from "express";
import { checkAdmin, isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/category.controllers.js";

const router = Router();

router.route("/getAll").post(isLoggedIn, getAllCategories);

router.route("/create").post(isLoggedIn, checkAdmin, createCategory);

router.route("/update/:id").patch(isLoggedIn, checkAdmin, updateCategory);

router.route("/delete/:id").delete(isLoggedIn, checkAdmin, deleteCategory);

export default router;
