import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware";

const router = Router();

router.route("/getAll").get(isLoggedIn, getAllStoresManaged);

router.route("/getStore/:id").get(isLoggedIn, getStoreById);

router.route("/updateStore").patch(isLoggedIn, updateStoreDetails);

router.route("/delete").delete(isLoggedIn, deleteStore);

router.route("/getNearbyStores").get(isLoggedIn, getNearbyStores);

export default router;
