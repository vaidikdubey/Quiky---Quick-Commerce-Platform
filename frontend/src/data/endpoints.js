export const ENDPOINT_STATS = {
  totalEndpoints: 52,
  modulesCount: 10,
  rolesCount: 4,
};

export const API_MODULES = [
  { id: "auth", name: "Auth & Profile", icon: "Lock", count: 16 },
  { id: "address", name: "Addresses", icon: "MapPin", count: 6 },
  { id: "admin", name: "Admin Portal", icon: "ShieldAlert", count: 12 },
  { id: "categories", name: "Categories", icon: "FolderTree", count: 4 },
  { id: "delivery", name: "Delivery Engine", icon: "Navigation", count: 6 },
  { id: "notifications", name: "Notifications", icon: "Bell", count: 5 },
  { id: "orders", name: "Order Processing", icon: "ShoppingBag", count: 6 },
  { id: "products", name: "Product Catalog", icon: "Package", count: 8 },
  { id: "rider", name: "Rider Portal", icon: "Bike", count: 6 },
  { id: "stores", name: "Store Management", icon: "Store", count: 5 },
];

export const ALL_ENDPOINTS = [
  // Auth & Profile
  { method: "POST", path: "/api/v1/auth/register", description: "Register a new customer account", module: "auth", role: "Customer" },
  { method: "POST", path: "/api/v1/auth/register/rider", description: "Onboard a new delivery rider", module: "auth", role: "Rider" },
  { method: "POST", path: "/api/v1/auth/register/store", description: "Register a new partner store", module: "auth", role: "Store" },
  { method: "POST", path: "/api/v1/auth/login", description: "Authenticate user and issue session", module: "auth", role: "Public" },
  { method: "GET", path: "/api/v1/auth/me", description: "Fetch current user profile details", module: "auth", role: "Auth" },

  // Addresses
  { method: "POST", path: "/api/v1/address/add", description: "Add new customer delivery address", module: "address", role: "Customer" },
  { method: "GET", path: "/api/v1/address/getAll", description: "Fetch all saved user addresses", module: "address", role: "Customer" },

  // Admin
  { method: "GET", path: "/api/v1/admin/stats", description: "Retrieve high level dashboard statistics", module: "admin", role: "Admin" },
  { method: "GET", path: "/api/v1/admin/analytics", description: "Fetch platform performance analytics", module: "admin", role: "Admin" },
  { method: "PATCH", path: "/api/v1/admin/users/status/:id", description: "Toggle user account active status", module: "admin", role: "Admin" },

  // Orders
  { method: "POST", path: "/api/v1/orders/create", description: "Place new customer product order", module: "orders", role: "Customer" },
  { method: "GET", path: "/api/v1/orders/myOrders", description: "Fetch user past order history", module: "orders", role: "Customer" },
  { method: "PATCH", path: "/api/v1/orders/cancel/:id", description: "Cancel placed customer order request", module: "orders", role: "Customer" },

  // Rider
  { method: "GET", path: "/api/v1/rider/location", description: "Update active rider live location", module: "rider", role: "Rider" },
  { method: "GET", path: "/api/v1/rider/earnings", description: "Calculate total rider payout earnings", module: "rider", role: "Rider" },
  { method: "GET", path: "/api/v1/delivery/track/:id", description: "Track live customer order delivery", module: "delivery", role: "Public" },

  // Products
  { method: "GET", path: "/api/v1/products/nearby", description: "Find products in nearby stores", module: "products", role: "Customer" },
  { method: "GET", path: "/api/v1/products/search", description: "Search catalog products by name", module: "products", role: "Public" }
];