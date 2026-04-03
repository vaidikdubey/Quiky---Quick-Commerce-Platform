import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getAllCategories = asyncHandler(async (req, res) => {
  const { active = false, limit = 50, includeProductCount } = req.body;

  const where = {}; //Set where condition based upon isActive status from user

  if (active) {
    where.products = {
      some: {
        isAvailable: true,
        stock: { gt: 0 },
      },
    };
  }

  const categories = await db.category.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      ...(includeProductCount && {
        _count: {
          select: {
            products: true,
          },
        },
      }),
    },
    orderBy: { name: asc },
    take: parseInt(limit),
  });

  if (!categories) throw new ApiError(404, "No categories found");

  res
    .status(200)
    .json(new ApiResponse(200, categories, "All categories fetched"));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  if (!name) throw new ApiError(400, "Category name is required");

  const newCategory = await db.category.create({
    data: {
      name,
      slug,
    },
  });

  if (!newCategory) throw new ApiError(500, "Failed to create category");

  res.status(200).json(new ApiResponse(200, newCategory, "Category created"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingCategory = await db.category.findUnique({
    where: {
      id,
    },
  });

  if (!existingCategory) throw new ApiError(404, "Category not found");

  const { name, slug } = req.body;

  const updatedData = {
    ...(name && { name }),
    ...(slug && { slug }),
  };

  const updatedCategory = await db.category.update({
    where: {
      id,
    },
    data: updatedData,
    select: {
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!updatedCategory) throw new Error(500, "Failed to update category");

  res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, "Category updated"));
});

const deleteCategory = asyncHandler(async (req, res) => {});

export { getAllCategories, createCategory, updateCategory, deleteCategory };
