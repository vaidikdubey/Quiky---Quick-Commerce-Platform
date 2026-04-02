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

const createCategory = asyncHandler(async (req, res) => {});

const updateCategory = asyncHandler(async (req, res) => {});

const deleteCategory = asyncHandler(async (req, res) => {});

export { getAllCategories, createCategory, updateCategory, deleteCategory };
