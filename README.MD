# Quiky – Quick Commerce Platform (Backend) 🛍️

## Overview

**Quiky** is the backend for a quick-commerce platform designed to power grocery and daily-essentials delivery within **10–20 minutes**. It provides a production-ready REST API layer connecting **customers, dark stores, delivery riders, and administrators** through a coordinated system for real-time inventory management, rapid order fulfillment, and delivery routing logic.

Unlike traditional e-commerce backends, Quiky is built around **localized fulfillment from nearby dark stores** and optimized rider assignment — the core engine that a quick-commerce product would run on, independent of any specific client (web, mobile, or admin dashboard).

This repository contains the **complete, tested, and deployed backend**. No frontend/client application is included or in progress.

---

## Problem Statement

Urban consumers increasingly demand **instant delivery of groceries and essentials**. Traditional marketplaces and centralized-warehouse supermarkets operate on longer fulfillment cycles, making them inefficient for rapid delivery.

Quiky's backend solves the coordination problem underneath this: routing orders to the nearest dark store, managing real-time inventory state, and assigning riders efficiently enough to support a 10–20 minute delivery promise.

---

## Objectives

- Enable a **fast, reliable ordering API** that a client app could build directly on top of
- Support dark stores in **managing real-time inventory** and preparing orders efficiently
- Provide delivery riders **structured assignment and status-update workflows** via API
- Give administrators **centralized control** over stores, riders, and platform-wide data
- Support **secure checkout logic** for both Cash on Delivery (COD) and UPI payment flows

---

## System Roles (API-Level)

Each role below is represented through role-scoped API endpoints and permissions — not a client application. A frontend consuming these APIs is not part of this repo.

### Customer

- Browse nearby dark store inventory
- Cart and order placement logic
- Order tracking and status retrieval
- Payment method selection (COD or UPI)

### Delivery Rider

- Receive assigned delivery requests
- Retrieve pickup/delivery location data
- Update order status (Picked Up / Delivered)

### Dark Store Manager

- Add/update product inventory
- Monitor and manage incoming orders
- Trigger pickup notifications to riders

### Super Admin

- Manage dark stores and riders
- Monitor platform-wide orders
- Access analytics and role-based access control

---

## Core Backend Features

- **Inventory management** - full CRUD for dark store product inventory
- **Order lifecycle management** - from placement → preparation → rider assignment → delivery, with state transitions enforced server-side
- **Role-based access control (RBAC)** - scoped permissions across Customer, Rider, Dark Store Manager, and Super Admin
- **Rider assignment logic** - automatic assignment workflow based on order and store data
- **Payment handling** - COD and UPI flows, with Razorpay integration in test mode
- **JWT-based authentication** - secure, role-aware auth across all endpoints
- **Analytics endpoints** - platform-wide order and performance data for admin use

---

## Basic MVP Workflow (Backend Perspective)

1. Customer request hits inventory API for nearby dark store products
2. Order placed via checkout API; payment method recorded (COD/UPI)
3. Dark store receives order via order-management endpoint
4. Store updates preparation status
5. Rider auto-assigned via assignment logic
6. Rider updates status through pickup → delivery lifecycle
7. Order marked complete; data available via admin analytics endpoints

---

## Tech Stack

### Backend

- Node.js + Express

### Database

- PostgreSQL + Prisma ORM

### Authentication

- JWT-based authentication, RBAC across all roles

### Other Integrations

- Payment gateway simulation (Razorpay Test Mode)
- Map/geolocation data handling for rider assignment logic

### Testing & Deployment

- Fully tested backend (unit/integration)
- Deployed and live

---

## Status

✅ **Backend: Complete** - all endpoints listed above are implemented, tested, and deployed.
❌ **Frontend: Not built** - this repo is backend-only by design. See Future Enhancements below.

---

## Future Enhancements

- Client application (web/mobile) consuming this API
- Rider mobile app
- Dark store and Super Admin dashboards
- AI-based rider assignment
- Dynamic inventory forecasting
- Real (non-simulated) payment gateway integration
- Multi-city dark store support
- Customer loyalty programs
- Delivery ETA prediction system

---

## Conclusion

Quiky's backend demonstrates a scalable, production-ready architecture for **modern quick-commerce systems** - role-based order orchestration, inventory management, and rider logistics, built and tested as a standalone API layer ready for any client to consume.
