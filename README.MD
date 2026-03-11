# Quiky – Quick Commerce Platform 🛍️

## Overview

**Quiky** is a quick-commerce platform designed to deliver groceries and daily essentials within **10–20 minutes**. The system connects **customers, dark stores, delivery riders, and administrators** through a coordinated platform that enables real-time inventory management, rapid order fulfillment, and efficient delivery routing.

Unlike traditional e-commerce systems, Quiky focuses on **instant local fulfillment using nearby dark stores** and optimized rider assignment. The platform is structured as a multi-role ecosystem consisting of mobile apps and management dashboards that work together to complete the delivery cycle quickly.

---

## Problem Statement

Urban consumers increasingly demand **instant delivery of groceries and essentials**. Traditional marketplaces and supermarkets operate with longer fulfillment cycles and centralized warehouses, making them inefficient for rapid delivery.

To solve this, Quiky introduces a **localized quick-commerce architecture** using dark stores positioned close to customers. This allows orders to be processed, packed, and delivered within minutes.

---

## Objectives

The primary goals of the platform include:

* Provide customers with a **fast and intuitive ordering experience**
* Enable dark stores to **manage real-time inventory and prepare orders efficiently**
* Equip delivery riders with tools to **receive and complete delivery assignments**
* Provide administrators with a **centralized control panel for platform management**
* Support **secure checkout through Cash on Delivery (COD) and UPI payments**

---

## System Roles

### Client (Customer)

Customers interact with the platform through the client app to browse products, place orders, and track deliveries.

Capabilities:

* Browse nearby dark store inventory
* Add products to cart
* Place orders instantly
* Track delivery status in real time
* Choose payment method (COD or UPI)

---

### Delivery Rider

Delivery riders are responsible for collecting orders from dark stores and delivering them to customers.

Capabilities:

* Receive assigned delivery requests
* View pickup location and delivery address
* Navigate using map integration
* Update order status (Picked Up / Delivered)

---

### Dark Store Manager

Dark store managers oversee product inventory and order preparation.

Capabilities:

* Add or update product inventory
* Monitor incoming orders
* Prepare items for dispatch
* Notify riders when orders are ready for pickup

---

### Super Admin

Super Admins manage the entire ecosystem and monitor platform performance.

Capabilities:

* Add or manage dark stores
* Register and manage delivery riders
* Monitor platform-wide orders
* Access analytics and performance metrics
* Manage role-based access control

---

## Core Features

### Client Application

* Product browsing from nearby dark stores
* Cart and checkout system
* Order placement and tracking
* Secure payments via **COD** and **UPI**
* Real-time order status updates

---

### Delivery Rider Application

* Assigned delivery list
* Pickup and delivery workflow
* Status updates for each order
* Navigation to pickup and drop locations

---

### Dark Store Management Panel

* Inventory management system
* Product CRUD operations
* Order management dashboard
* Pickup notification system for riders

---

### Super Admin Dashboard

* Centralized management interface
* Dark store and rider administration
* Order monitoring and reporting
* Platform analytics and operational insights

---

## Basic MVP Workflow

1. Client browses products from nearby dark store
2. Items are added to the cart
3. Client places the order
4. Payment option selected (COD / UPI)
5. Dark store receives the order notification
6. Store prepares the order
7. Rider is assigned automatically
8. Rider picks up the order
9. Order is delivered to the client

---

## Deliverables (MVP Scope)

The Minimum Viable Product includes:

* Client application with product browsing, cart, checkout, and tracking
* Integrated payment options (COD and UPI)
* Rider application for managing assigned deliveries
* Dark store dashboard for inventory and order management
* Super admin panel for managing riders, stores, and analytics
* End-to-end functional workflow using **mock APIs, dummy payment gateway, and simulated map services**

---

## Tech Stack

### Frontend

* React / React Native (mobile apps, future enhancement)

### Backend

* Node.js + Express

### Database

* PostgreSQL

### Authentication

* JWT based authentication

### Other Integrations

* Map APIs for navigation (Google Maps)
* Payment gateway simulation (Razorpay Test Mode)
* Push notifications for order updates

---

## Future Improvements

Possible enhancements beyond MVP:

* Mobile app for riders, customers and dark store managers
* AI-based rider assignment
* Dynamic inventory forecasting
* Real payment gateway integration
* Multi-city dark store support
* Customer loyalty programs
* Delivery ETA prediction system

---

## Conclusion

Quiky demonstrates a scalable architecture for **modern quick-commerce systems**. By combining localized inventory, real-time order management, and optimized rider logistics, the platform delivers an efficient solution for ultra-fast urban deliveries.
