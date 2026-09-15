export const API_BASE_URL = "https://quiky-backend.onrender.com";

export const ENDPOINT_STATS = {
  totalEndpoints: 52,
  modulesCount: 10,
  rolesCount: 4,
};

export const API_MODULES = [
  { id: "auth", name: "Auth & Profile", count: 16 },
  { id: "address", name: "Addresses", count: 6 },
  { id: "admin", name: "Admin Portal", count: 12 },
  { id: "categories", name: "Categories", count: 4 },
  { id: "delivery", name: "Delivery Engine", count: 6 },
  { id: "notifications", name: "Notifications", count: 5 },
  { id: "orders", name: "Order Processing", count: 6 },
  { id: "products", name: "Product Catalog", count: 8 },
  { id: "rider", name: "Rider Portal", count: 6 },
  { id: "stores", name: "Store Management", count: 5 },
];

export const ALL_ENDPOINTS = [
  // Auth & Profile
  {
    method: "POST",
    path: "/api/v1/auth/register",
    description: "Register a new customer account",
    module: "auth",
    role: "Customer",
    sampleBody: JSON.stringify(
      {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        phone: "+919876543210"
      },
      null,
      2
    )
  },
  {
    method: "POST",
    path: "/api/v1/auth/register/rider",
    description: "Onboard a new delivery rider",
    module: "auth",
    role: "Rider",
    sampleBody: JSON.stringify(
      {
        name: "Rider Alex",
        email: "alex.rider@example.com",
        password: "Password123!",
        vehicleType: "BIKE",
        licenseNumber: "DL-99182312"
      },
      null,
      2
    )
  },
  {
    method: "POST",
    path: "/api/v1/auth/register/store",
    description: "Register a new partner store",
    module: "auth",
    role: "Store",
    sampleBody: JSON.stringify(
      {
        storeName: "Quiky Express Mart",
        ownerEmail: "owner@quikyexpress.com",
        password: "Password123!",
        address: "Block B, Tech Park, City"
      },
      null,
      2
    )
  },
  {
    method: "POST",
    path: "/api/v1/auth/login",
    description: "Authenticate user and issue session",
    module: "auth",
    role: "Public",
    sampleBody: JSON.stringify(
      {
        email: "john@example.com",
        password: "Password123!"
      },
      null,
      2
    )
  },
  { method: "GET", path: "/api/v1/auth/me", description: "Fetch current user profile details", module: "auth", role: "Auth" },
  { method: "POST", path: "/api/v1/auth/send-otp", description: "Send OTP for phone verification", module: "auth", role: "Public", sampleBody: JSON.stringify({ phone: "+919876543210" }, null, 2) },

  // Addresses
  {
    method: "POST",
    path: "/api/v1/address/add",
    description: "Add new customer delivery address",
    module: "address",
    role: "Customer",
    sampleBody: JSON.stringify(
      {
        street: "42 Wallaby Way",
        city: "Bhopal",
        state: "MP",
        zipCode: "462001",
        isDefault: true
      },
      null,
      2
    )
  },
  { method: "GET", path: "/api/v1/address/getAll", description: "Fetch all saved user addresses", module: "address", role: "Customer" },

  // Admin
  { method: "GET", path: "/api/v1/admin/stats", description: "Retrieve high level dashboard statistics", module: "admin", role: "Admin" },
  { method: "GET", path: "/api/v1/admin/analytics", description: "Fetch platform performance analytics", module: "admin", role: "Admin" },
  { method: "GET", path: "/api/v1/admin/users", description: "Fetch all platform user accounts", module: "admin", role: "Admin" },

  // Orders
  {
    method: "POST",
    path: "/api/v1/orders/create",
    description: "Place new customer product order",
    module: "orders",
    role: "Customer",
    sampleBody: JSON.stringify(
      {
        storeId: "store_65a12b",
        addressId: "addr_991a",
        items: [{ productId: "prod_1", quantity: 2 }]
      },
      null,
      2
    )
  },
  { method: "GET", path: "/api/v1/orders/myOrders", description: "Fetch user past order history", module: "orders", role: "Customer" },

  // Rider & Delivery
  { method: "GET", path: "/api/v1/rider/location", description: "Update active rider live location", module: "rider", role: "Rider" },
  { method: "GET", path: "/api/v1/rider/earnings", description: "Calculate total rider payout earnings", module: "rider", role: "Rider" },
  { method: "GET", path: "/api/v1/delivery/track/ord_123", description: "Track live customer order delivery", module: "delivery", role: "Public" },

  // Products & Stores
  { method: "GET", path: "/api/v1/products/nearby", description: "Find products in nearby stores", module: "products", role: "Customer" },
  { method: "GET", path: "/api/v1/products/search?q=milk", description: "Search catalog products by name", module: "products", role: "Public" },
  { method: "GET", path: "/api/v1/stores/getAll", description: "Fetch all managed partner stores", module: "stores", role: "Public" }
];