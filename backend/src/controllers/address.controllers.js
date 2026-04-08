import { db } from "../db/db.js";
import { isDbNull } from "../generated/prisma/runtime/client.js";
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
    isDefault = false,
  } = req.body;

  if (!fullAddress || !pincode)
    throw new ApiError(400, "Please provide full address and pincode");

  if ((latitude && !longitude) || (!latitude && longitude))
    throw new ApiError(
      400,
      "Both latitude and longitude must be provided together",
    );

  //If current address is marked default, unmark all other addresses
  if (isDefault) {
    await db.address.updateMany({
      where: {
        id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const data = {};

  data.userId = id;
  data.fullAddress = fullAddress;
  data.pincode = pincode;
  if (label) data.label = label;
  if (latitude) data.latitude = latitude;
  if (longitude) data.longitude = longitude;
  if (city) data.city = city;
  if (state) data.state = state;
  if (landmark) data.landmark = landmark;
  if (isDefault) data.isDefault = Boolean(isDefault);

  let newAddress = await db.address.create({
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

  //If this is the first address mark it as default
  const addressCount = await db.address.count({
    where: {
      id,
    },
  });

  if (addressCount === 1) {
    newAddress = await db.address.update({
      where: {
        id: newAddress.id,
      },
      data: {
        isDefault: true,
      },
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
  }

  res
    .status(201)
    .json(new ApiResponse(201, newAddress, "Address added successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
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

  if ((latitude && !longitude) || (!latitude && longitude))
    throw new ApiError(
      400,
      "Both latitude and longitude must be provided together",
    );

  //If current address is marked default, unmark all other addresses
  if (isDefault) {
    await db.address.updateMany({
      where: {
        id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const data = {};

  if (label) data.label = label;
  if (fullAddress) data.fullAddress = fullAddress;
  if (latitude) data.latitude = parseFloat(latitude);
  if (longitude) data.longitude = parseFloat(longitude);
  if (pincode) data.pincode = pincode;
  if (city) data.city = city;
  if (state) data.state = state;
  if (landmark) data.landmark = landmark;
  if (isDefault) data.isDefault = Boolean(isDefault);

  const updatedAddresss = await db.address.update({
    where: {
      id,
    },
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

  if (!updatedAddresss) throw new ApiError(500, "Error updating address");

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedAddresss, "Address updated successfully"),
    );
});

const getAllAddresses = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const addresses = await db.address.findMany({
    where: {
      userId: id,
    },
    select: {
      id: true,
      label: true,
      fullAddress: true,
      latitude: true,
      longitude: true,
      pincode: true,
      city: true,
      state: true,
      landmark: true,
      isDefault: true,
    },
  });

  if (!addresses) throw new ApiError(500, "Error fetching addresses");

  res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

const getAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await db.address.findUnique({
    where: {
      id,
    },
    select: {
      label: true,
      fullAddress: true,
      latitude: true,
      longitude: true,
      pincode: true,
      city: true,
      state: true,
      landmark: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!address) throw new ApiError(404, "Address not found");

  res.status(200).json(new ApiResponse(200, address, "Address found"));
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  //Mark all addresses as non-default
  await db.address.updateMany({
    where: {
      userId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  const defaultAddress = await db.address.update({
    where: {
      id,
    },
    data: {
      isDefault: true,
    },
    select: {
      id: true,
      label: true,
      fullAddress: true,
      latitude: true,
      longitude: true,
      pincode: true,
      city: true,
      state: true,
      landmark: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!defaultAddress) throw new ApiError(500, "Error setting default address");

  res
    .status(200)
    .json(
      new ApiResponse(200, defaultAddress, "Default address set successfully"),
    );
});

const deleteAddress = asyncHandler(async (req, res) => {});

export {
  addNewAddress,
  updateAddress,
  getAllAddresses,
  getAddressById,
  setDefaultAddress,
  deleteAddress,
};
