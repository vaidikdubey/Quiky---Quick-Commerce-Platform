import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware";
import {
  deleteStore,
  getAllStoresManaged,
  getNearbyStores,
  getStoreById,
  updateStoreDetails,
} from "../controllers/store.controllers.js";

const router = Router();

router.route("/getAll").get(isLoggedIn, getAllStoresManaged);

router.route("/getStore/:id").get(isLoggedIn, getStoreById);

router.route("/updateStore/:id").patch(isLoggedIn, updateStoreDetails);

router.route("/delete/:id").delete(isLoggedIn, deleteStore);

router.route("/getNearbyStores").get(isLoggedIn, getNearbyStores);

export default router;
