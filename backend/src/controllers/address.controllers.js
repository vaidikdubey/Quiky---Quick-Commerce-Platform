import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const addNewAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    label,
    fullAddress,
    latitude,
    longitude,
    pincode,
    city,
    state,
    landmark,
    isDefault,
  } = req.body;

  if (!fullAddress || !pincode)
    throw new ApiError(400, "Please provide full address and pincode");

  const data = {};

  data.fullAddress = fullAddress;
  data.pincode = pincode;
  if (label) data.label = label;
  if (latitude) data.latitude = latitude;
  if (longitude) data.longitude = longitude;
  if (city) data.city = city;
  if (state) data.state = state;
  if (landmark) data.landmark = landmark;
  if (isDefault) data.isDefault = isDefault;

  const newAddress = await db.address.create({
    data,
    select: {
      id: true,
      label: true,
      fullAddress: true,
      pincode: true,
      latitude: true,
      longitude: true,
      city: true,
      state: true,
      landmark: true,
      isDefault: true,
    },
  });

  if (!newAddress) throw new ApiError(500, "Error adding new address");

  res
    .status(201)
    .json(new ApiResponse(201, newAddress, "Address added successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {});

const getAllAddresses = asyncHandler(async (req, res) => {});

const getAddressById = asyncHandler(async (req, res) => {});

const setDefaultAddress = asyncHandler(async (req, res) => {});

const deleteAddress = asyncHandler(async (req, res) => {});

export {
  addNewAddress,
  updateAddress,
  getAllAddresses,
  getAddressById,
  setDefaultAddress,
  deleteAddress,
};
