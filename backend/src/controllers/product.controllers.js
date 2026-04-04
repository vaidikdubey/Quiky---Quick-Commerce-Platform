import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler";

const getAllProducts = asyncHandler(async (req, res) => {});

const getProductById = asyncHandler(async (req, res) => {});

const getProductByName = asyncHandler(async (req, res) => {});

const getProductsInNearbyStores = asyncHandler(async (req, res) => {});

const createProduct = asyncHandler(async (req, res) => {});

const updateProduct = asyncHandler(async (req, res) => {});

const deleteProduct = asyncHandler(async (req, res) => {});

export {
  getAllProducts,
  getProductById,
  getProductByName,
  getProductsInNearbyStores,
  createProduct,
  updateProduct,
  deleteProduct,
};
