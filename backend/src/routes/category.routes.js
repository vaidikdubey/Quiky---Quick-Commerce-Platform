import { Router } from "express";
import { checkAdmin, isLoggedIn } from "../middlewares/auth.middleware";

const router = Router();

router
    .route("/getAll")
    .get(isLoggedIn, getAllCategories)

router
    .route("/create")
    .post(isLoggedIn, checkAdmin, createCategory)

router
    .route("/update/:id")
    .patch(isLoggedIn, checkAdmin, updateCategory)

router
    .route("/delete/:id")
    .delete(isLoggedIn, checkAdmin, deleteCategory)