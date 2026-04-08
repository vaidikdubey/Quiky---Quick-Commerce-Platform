import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  addNewAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses,
  setDefaultAddress,
  updateAddress,
} from "../controllers/address.controllers.js";

const router = Router();

router.route("/add").post(isLoggedIn, addNewAddress);

router.route("/update/:id").patch(isLoggedIn, updateAddress);

router.route("/getAll").get(isLoggedIn, getAllAddresses);

router.route("/get/:id").get(isLoggedIn, getAddressById);

router.route("/setDefault/:id").patch(isLoggedIn, setDefaultAddress);

router.route("/delete/:id").delete(isLoggedIn, deleteAddress);

export default router;
