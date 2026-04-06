import { Router } from "express";
import { isLoggedIn, checkPermission } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductByName,
  getProductsInNearbyStores,
  updateProduct,
} from "../controllers/product.controllers.js";

const router = Router();

// CLIENT;
// RIDER;
// STORE_MANAGER;
// ADMIN;

const permissions = ["STORE_MANAGER", "ADMIN"];

router.route("/getAll/:storeId").get(isLoggedIn, getAllProducts);

router.route("/get/:id").get(isLoggedIn, getProductById);

//Public route for anyone to search any product by it's name
router.route("/search").post(getProductByName);

router.route("/nearby").get(isLoggedIn, getProductsInNearbyStores);

router
  .route("/create")
  .post(isLoggedIn, checkPermission(permissions), createProduct);

router
  .route("/update/:id")
  .patch(isLoggedIn, checkPermission(permissions), updateProduct);

router
  .route("/delete/:id")
  .delete(isLoggedIn, checkPermission(permissions), deleteProduct);

export default router;
