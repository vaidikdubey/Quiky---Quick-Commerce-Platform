import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllCategories = asyncHandler(async (req, res) => {});

const createCategory = asyncHandler(async (req, res) => {});

const updateCategory = asyncHandler(async (req, res) => {});

const deleteCategory = asyncHandler(async (req, res) => {});

export { getAllCategories, createCategory, updateCategory, deleteCategory };
