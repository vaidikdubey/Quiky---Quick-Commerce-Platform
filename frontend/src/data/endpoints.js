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
  // AUTH & PROFILE (16 Endpoints)
  {
    method: "POST",
    path: "/api/v1/auth/register",
    description: "Register a new customer account",
    module: "auth",
    role: "CLIENT",
    sampleBody: JSON.stringify(
      {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        phone: "+919876543210",
        role: "CLIENT"
      },
      null,
      2
    )
  },
  {
    method: "POST",
    path: "/api/v1/auth/register/rider",
    description: "Onboard a new delivery rider account",
    module: "auth",
    role: "RIDER",
    sampleBody: JSON.stringify(
      {
        name: "Rider Alex",
        email: "alex.rider@example.com",
        password: "Password123!",
        phone: "+919876543211",
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
    description: "Register a new store manager account",
    module: "auth",
    role: "STORE_MANAGER",
    sampleBody: JSON.stringify(
      {
        name: "Store Owner",
        email: "owner@quikyexpress.com",
        password: "Password123!",
        phone: "+919876543212",
        storeName: "Quiky Express Mart",
        fullAddress: "Block B, Tech Park, City",
        pincode: "462001",
        latitude: 23.259933,
        longitude: 77.412613
      },
      null,
      2
    )
  },
  {
    method: "POST",
    path: "/api/v1/auth/login",
    description: "Authenticate user and set cookie session",
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
  {
    method: "POST",
    path: "/api/v1/auth/logout",
    description: "Clear user session and cookies",
    module: "auth",
    role: "Auth"
  },
  {
    method: "POST",
    path: "/api/v1/auth/refresh-token",
    description: "Renew access token using refresh token cookie",
    module: "auth",
    role: "Public"
  },
  {
    method: "GET",
    path: "/api/v1/auth/me",
    description: "Fetch authenticated user profile",
    module: "auth",
    role: "Auth"
  },
  {
    method: "PUT",
    path: "/api/v1/auth/update-profile",
    description: "Update user profile details",
    module: "auth",
    role: "Auth",
    sampleBody: JSON.stringify(
      {
        name: "John Updated",
        phone: "+919876543210"
      },
      null,
      2
    )
  },
  {
    method: "POST",
    path: "/api/v1/auth/send-otp",
    description: "Send OTP for phone verification",
    module: "auth",
    role: "Public",
    sampleBody: JSON.stringify({ phone: "+919876543210" }, null, 2)
  },
  {
    method: "POST",
    path: "/api/v1/auth/verify-otp",
    description: "Verify OTP for user authentication",
    module: "auth",
    role: "Public",
    sampleBody: JSON.stringify({ phone: "+919876543210", otp: "123456" }, null, 2)
  },
  {
    method: "PATCH",
    path: "/api/v1/auth/change-password",
    description: "Update user password",
    module: "auth",
    role: "Auth",
    sampleBody: JSON.stringify({ oldPassword: "Password123!", newPassword: "NewPassword123!" }, null, 2)
  },

  // ==========================================
  // ADDRESSES (6 Endpoints)
  // ==========================================
  {
    method: "POST",
    path: "/api/v1/address/add",
    description: "Add new customer delivery address",
    module: "address",
    role: "CLIENT",
    sampleBody: JSON.stringify(
      {
        fullAddress: "42 Wallaby Way, Tech Zone",
        pincode: "462001",
        latitude: 23.259933,
        longitude: 77.412613,
        isDefault: true
      },
      null,
      2
    )
  },
  {
    method: "GET",
    path: "/api/v1/address/getAll",
    description: "Fetch all saved delivery addresses",
    module: "address",
    role: "CLIENT"
  },
  {
    method: "GET",
    path: "/api/v1/address/get/addr_123",
    description: "Get specific delivery address details",
    module: "address",
    role: "CLIENT"
  },
  {
    method: "PUT",
    path: "/api/v1/address/update/addr_123",
    description: "Update existing delivery address",
    module: "address",
    role: "CLIENT",
    sampleBody: JSON.stringify(
      {
        fullAddress: "100 New Tech Road",
        pincode: "462002",
        latitude: 23.260000,
        longitude: 77.413000,
        isDefault: false
      },
      null,
      2
    )
  },
  {
    method: "PATCH",
    path: "/api/v1/address/set-default/addr_123",
    description: "Set an address as default delivery location",
    module: "address",
    role: "CLIENT"
  },
  {
    method: "DELETE",
    path: "/api/v1/address/delete/addr_123",
    description: "Remove saved delivery address",
    module: "address",
    role: "CLIENT"
  },

  // ==========================================
  // ORDERS (6 Endpoints)
  // ==========================================
  {
    method: "POST",
    path: "/api/v1/orders/create",
    description: "Place new customer product order",
    module: "orders",
    role: "CLIENT",
    sampleBody: JSON.stringify(
      {
        storeId: "store_65a12b",
        addressId: "addr_991a",
        items: [
          { productId: "prod_1", quantity: 2, price: 50.0 },
          { productId: "prod_2", quantity: 1, price: 120.0 }
        ],
        paymentMode: "COD"
      },
      null,
      2
    )
  },
  {
    method: "GET",
    path: "/api/v1/orders/myOrders",
    description: "Fetch order history for logged-in user",
    module: "orders",
    role: "CLIENT"
  },
  {
    method: "GET",
    path: "/api/v1/orders/details/ord_123",
    description: "Retrieve single order details",
    module: "orders",
    role: "Auth"
  },
  {
    method: "PATCH",
    path: "/api/v1/orders/status/ord_123",
    description: "Update order status & trigger rider geo-radius search",
    module: "orders",
    role: "STORE_MANAGER",
    sampleBody: JSON.stringify({ status: "READY_FOR_PICKUP" }, null, 2)
  },
  {
    method: "POST",
    path: "/api/v1/orders/cancel/ord_123",
    description: "Cancel an ongoing order",
    module: "orders",
    role: "CLIENT",
    sampleBody: JSON.stringify({ reason: "Order placed by mistake" }, null, 2)
  },
  {
    method: "GET",
    path: "/api/v1/orders/store-orders?status=PENDING",
    description: "Fetch active orders for current store",
    module: "orders",
    role: "STORE_MANAGER"
  },

  // ==========================================
  // RIDER PORTAL (6 Endpoints)
  // ==========================================
  {
    method: "POST",
    path: "/api/v1/rider/location",
    description: "Update active rider live coordinates",
    module: "rider",
    role: "RIDER",
    sampleBody: JSON.stringify(
      {
        currentLatitude: 23.259933,
        currentLongitude: 77.412613
      },
      null,
      2
    )
  },
  {
    method: "GET",
    path: "/api/v1/rider/earnings",
    description: "Calculate total rider payout earnings",
    module: "rider",
    role: "RIDER"
  },
  {
    method: "GET",
    path: "/api/v1/rider/deliveries/available",
    description: "Fetch nearby unassigned orders within geo-radius",
    module: "rider",
    role: "RIDER"
  },
  {
    method: "POST",
    path: "/api/v1/rider/accept/ord_123",
    description: "Accept delivery assignment for order",
    module: "rider",
    role: "RIDER"
  },
  {
    method: "PATCH",
    path: "/api/v1/rider/delivery/status/ord_123",
    description: "Advance order delivery state",
    module: "rider",
    role: "RIDER",
    sampleBody: JSON.stringify({ status: "PICKED_UP" }, null, 2)
  },
  {
    method: "GET",
    path: "/api/v1/rider/history",
    description: "Fetch rider completed delivery logs",
    module: "rider",
    role: "RIDER"
  },

  // ==========================================
  // DELIVERY ENGINE (6 Endpoints)
  // ==========================================
  {
    method: "GET",
    path: "/api/v1/delivery/track/ord_123",
    description: "Track live order status & rider position",
    module: "delivery",
    role: "Public"
  },
  {
    method: "GET",
    path: "/api/v1/delivery/estimate?storeId=store_65a12b&addressId=addr_991a",
    description: "Calculate delivery time & distance matrix",
    module: "delivery",
    role: "CLIENT"
  },
  {
    method: "PATCH",
    path: "/api/v1/delivery/update-status/ord_123",
    description: "Transition delivery pipeline (ASSIGNED -> IN_TRANSIT -> DELIVERED)",
    module: "delivery",
    role: "RIDER",
    sampleBody: JSON.stringify({ status: "DELIVERED" }, null, 2)
  },

  // ==========================================
  // ADMIN PORTAL (12 Endpoints)
  // ==========================================
  {
    method: "GET",
    path: "/api/v1/admin/stats",
    description: "Retrieve high level dashboard statistics",
    module: "admin",
    role: "ADMIN"
  },
  {
    method: "GET",
    path: "/api/v1/admin/analytics",
    description: "Fetch platform performance analytics",
    module: "admin",
    role: "ADMIN"
  },
  {
    method: "GET",
    path: "/api/v1/admin/users?page=1&limit=10&role=CLIENT&search=",
    description: "Fetch paginated platform users with role filtering",
    module: "admin",
    role: "ADMIN"
  },
  {
    method: "GET",
    path: "/api/v1/admin/stores?page=1&limit=10",
    description: "Fetch paginated list of all partner stores",
    module: "admin",
    role: "ADMIN"
  },
  {
    method: "GET",
    path: "/api/v1/admin/orders?page=1&limit=10",
    description: "Fetch system-wide orders list",
    module: "admin",
    role: "ADMIN"
  },
  {
    method: "PATCH",
    path: "/api/v1/admin/users/usr_123/toggle-status",
    description: "Activate or suspend user account",
    module: "admin",
    role: "ADMIN",
    sampleBody: JSON.stringify({ isActive: false }, null, 2)
  },

  // ==========================================
  // PRODUCTS CATALOG (8 Endpoints)
  // ==========================================
  {
    method: "GET",
    path: "/api/v1/products/nearby?latitude=23.259933&longitude=77.412613",
    description: "Find products in stores near geo location",
    module: "products",
    role: "CLIENT"
  },
  {
    method: "GET",
    path: "/api/v1/products/search?q=milk",
    description: "Search catalog products by title or tag",
    module: "products",
    role: "Public"
  },
  {
    method: "POST",
    path: "/api/v1/products/add",
    description: "Add new product entry to store catalog",
    module: "products",
    role: "STORE_MANAGER",
    sampleBody: JSON.stringify(
      {
        name: "Fresh Whole Milk 1L",
        price: 64.0,
        stock: 50,
        categoryId: "cat_dairy",
        description: "Pasteurized whole cow milk"
      },
      null,
      2
    )
  },
  {
    method: "GET",
    path: "/api/v1/products/get/prod_1",
    description: "Fetch single product details",
    module: "products",
    role: "Public"
  },
  {
    method: "PUT",
    path: "/api/v1/products/update/prod_1",
    description: "Update product stock and details",
    module: "products",
    role: "STORE_MANAGER",
    sampleBody: JSON.stringify({ price: 66.0, stock: 45 }, null, 2)
  },
  {
    method: "DELETE",
    path: "/api/v1/products/delete/prod_1",
    description: "Remove product item from store catalog",
    module: "products",
    role: "STORE_MANAGER"
  },

  // ==========================================
  // STORES MANAGEMENT (5 Endpoints)
  // ==========================================
  {
    method: "GET",
    path: "/api/v1/stores/getAll",
    description: "Fetch all registered partner stores",
    module: "stores",
    role: "Public"
  },
  {
    method: "GET",
    path: "/api/v1/stores/details/store_65a12b",
    description: "Fetch individual store metadata",
    module: "stores",
    role: "Public"
  },
  {
    method: "PATCH",
    path: "/api/v1/stores/status/store_65a12b",
    description: "Toggle store open/closed operational status",
    module: "stores",
    role: "STORE_MANAGER",
    sampleBody: JSON.stringify({ isOpen: true }, null, 2)
  },

  // ==========================================
  // NOTIFICATIONS (5 Endpoints)
  // ==========================================
  {
    method: "GET",
    path: "/api/v1/notifications/my",
    description: "Retrieve notifications for logged-in user",
    module: "notifications",
    role: "Auth"
  },
  {
    method: "POST",
    path: "/api/v1/notifications/broadcast",
    description: "Send system-wide broadcast notification",
    module: "notifications",
    role: "ADMIN",
    sampleBody: JSON.stringify(
      {
        title: "Platform Maintenance",
        message: "Scheduled downtime tonight at 2 AM",
        data: { noticeId: "n_100" }
      },
      null,
      2
    )
  },
  {
    method: "PATCH",
    path: "/api/v1/notifications/read/notif_100",
    description: "Mark specific notification as read",
    module: "notifications",
    role: "Auth"
  },

  // ==========================================
  // CATEGORIES (4 Endpoints)
  // ==========================================
  {
    method: "GET",
    path: "/api/v1/categories/getAll",
    description: "Fetch product category taxonomy tree",
    module: "categories",
    role: "Public"
  },
  {
    method: "POST",
    path: "/api/v1/categories/create",
    description: "Create new product category",
    module: "categories",
    role: "ADMIN",
    sampleBody: JSON.stringify({ name: "Dairy & Eggs", slug: "dairy-eggs" }, null, 2)
  }
];