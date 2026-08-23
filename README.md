# Mini DMart — Smart Supermarket & Dark-Store Fulfillment Platform

Mini DMart is a full-stack, enterprise-grade hyperlocal 15-minute grocery delivery and dark-store fulfillment web application. Built with React, Vite, and Tailwind CSS on the frontend, and Node.js, Express, and MongoDB on the backend.

---

## Features
- **Hyperlocal 15-Min Delivery & Store Pickup**: Real-time 4-stage order milestone tracking.
- **Role-Based Portals**:
  - **Customer Portal**: Catalog browsing, multi-mode checkout (UPI/Card/NetBanking/COD), order cancellation, return/replacement requests, live support chat, and AI recipes.
  - **Staff Fulfillment Station**: Picking & packing queues, rider handovers, return/replacement audit, and 2-way live customer support desk.
  - **Admin Console**: Customer database management, global order logs, returns audit, staff authorization form, and AI demand forecasting co-pilot.
- **Fresh Green & White UI Theme**: Clean, professional monochromatic green-and-white aesthetic across all views.
- **Session Persistence**: Robust localStorage synchronization preserving active user sessions across browser refreshes.

---

# D-MartX REST API

A complete REST API for **D-MartX**, a hyper-local grocery and dark-store supermarket platform. The API provides authentication, product catalog management, order lifecycle management, returns/exchanges, AI-powered recommendations and demand forecasting, and customer support.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Prerequisites](#4-prerequisites)
5. [Project Structure](#5-project-structure)
6. [Environment Configuration](#6-environment-configuration)
7. [Running the Backend](#7-running-the-backend)
8. [Base URL](#8-base-url)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [API Response Format](#10-api-response-format)
11. [Complete API Flow](#11-complete-api-flow)
12. [Authentication APIs](#12-authentication-apis)
13. [Product APIs](#13-product-apis)
14. [Order APIs](#14-order-apis)
15. [Returns & Exchanges APIs](#15-returns--exchanges-apis)
16. [AI APIs](#16-ai-apis)
17. [Support APIs](#17-support-apis)
18. [Role-Based Access Matrix](#18-role-based-access-matrix)
19. [Order Lifecycle](#19-order-lifecycle)
20. [Return/Exchange Lifecycle](#20-returnexchange-lifecycle)
21. [Database Models](#21-database-models)
22. [Frontend Integration Flow](#22-frontend-integration-flow)
23. [Complete Customer Journey](#23-complete-customer-journey)
24. [Manager/Staff Workflow](#24-managerstaff-workflow)
25. [API Testing with cURL](#25-api-testing-with-curl)
26. [Error Handling](#26-error-handling)
27. [Pagination & Filtering](#27-pagination--filtering)
28. [Security](#28-security)
29. [AI Integration](#29-ai-integration)
30. [File Uploads](#30-file-uploads)
31. [API Versioning](#31-api-versioning)
32. [Known Limitations](#32-known-limitations)
33. [Development Notes](#33-development-notes)
34. [Production Checklist](#34-production-checklist)

---

# 1. Project Overview

D-MartX is a hyper-local grocery shopping platform designed around a dark-store fulfillment model.

The backend exposes REST APIs for:

* Customer registration and login
* JWT-based authentication
* Customer profile management
* Grocery product catalog
* Product search and category filtering
* Product creation and stock management
* Shopping cart recommendations
* Order creation
* Inventory validation
* Order status tracking
* Staff order fulfillment
* Returns and exchanges
* Customer support tickets
* AI demand forecasting
* AI product recommendations

The backend follows a stateless REST architecture using Express.js and MongoDB.

---

# 2. Architecture

```text
                    ┌─────────────────────┐
                    │     D-MartX UI      │
                    │ React / Vite / Web  │
                    └──────────┬──────────┘
                               │
                               │ HTTP/HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   Express.js API    │
                    │      /api/v1        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Authentication      Controllers       Middleware
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Mongoose / MongoDB  │
                    └─────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
         External Services              Gemini API
```

---

# 3. Technology Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS
* dotenv

## Optional AI

* Google Gemini API

## Frontend

The API is designed to work with a web frontend such as:

* React
* Vite
* JavaScript/TypeScript

---

# 4. Prerequisites

Install the following before running the backend:

* Node.js
* npm
* MongoDB
* Git

Verify installation:

```bash
node --version
npm --version
mongod --version
```

---

# 5. Project Structure

Recommended backend structure:

```text
server/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── returnExchange.controller.js
│   │   ├── ai.controller.js
│   │   └── support.controller.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleGuard.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── ReturnExchange.js
│   │   └── Support.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── returnExchange.routes.js
│   │   ├── ai.routes.js
│   │   └── support.routes.js
│   │
│   ├── services/
│   │   └── ...
│   │
│   ├── config/
│   │   └── db.js
│   │
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

# 6. Environment Configuration

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/dmartx

JWT_ACCESS_SECRET=change-this-access-secret
JWT_REFRESH_SECRET=change-this-refresh-secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

VITE_API_BASE_URL=http://localhost:5000/api/v1

GEMINI_API_KEY=
```

Do not commit `.env` to Git.

Add:

```gitignore
.env
node_modules/
```

---

# 7. Running the Backend

Go to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Or:

```bash
npm start
```

Expected development URL:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api/v1
```

---

# 8. Base URL

## Development

```text
http://localhost:5000/api/v1
```

## Production

Production URL is configured through deployment/environment configuration.

The frontend should use:

```env
VITE_API_BASE_URL=<production-api-url>
```

---

# 9. Authentication & Authorization

D-MartX uses two JWT tokens.

## Access Token

Used for authenticated API requests.

Default lifetime:

```text
15 minutes
```

Send it using:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

## Refresh Token

Used to obtain a new access token.

Default lifetime:

```text
7 days
```

Refresh request:

```http
POST /api/v1/auth/refresh
```

Body:

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

---

## Roles

There are four roles:

```text
CUSTOMER
STAFF
MANAGER
ADMIN
```

### CUSTOMER

Can:

* Register
* Login
* View profile
* Browse products
* Place orders
* View own orders
* Create return/exchange requests
* View own return/exchange requests

### STAFF

Can:

* View platform orders
* Update order statuses
* Manage return/exchange workflows
* View support tickets

### MANAGER

Can:

* Manage products
* Manage stock
* View platform orders
* Update order statuses
* Manage returns/exchanges
* View AI forecasts

### ADMIN

Has full administrative access.

---

# 10. API Response Format

## Successful response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Some endpoints return additional top-level properties such as:

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": []
}
```

## Error response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Detailed error information"
}
```

---

# 11. Complete API Flow

The main D-MartX customer flow is:

```text
Register
   │
   ▼
Login
   │
   ▼
Receive Access Token + Refresh Token
   │
   ▼
Browse Products
   │
   ▼
Search / Filter Products
   │
   ▼
Add Products to Cart
   │
   ▼
Get AI Recommendations
   │
   ▼
Checkout
   │
   ▼
POST /orders
   │
   ├── Validate JWT
   ├── Validate products
   ├── Check inventory
   ├── Decrease stock
   └── Create PENDING order
   │
   ▼
Staff/Manager confirms order
   │
   ▼
PACKED
   │
   ▼
OUT_FOR_DELIVERY
   │
   ▼
DELIVERED
   │
   ▼
Customer may request RETURN / EXCHANGE
```

---

# 12. Authentication APIs

## Register

```http
POST /api/v1/auth/register
```

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Password@123",
  "phone": "+919876543210"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "user": {
    "_id": "USER_ID",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+919876543210",
    "role": "CUSTOMER"
  }
}
```

---

## Login

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "jane.doe@example.com",
  "password": "Password@123"
}
```

---

## Refresh Token

```http
POST /api/v1/auth/refresh
```

Body:

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

---

## Current User

```http
GET /api/v1/auth/me
```

Header:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

# 13. Product APIs

## Get Products

```http
GET /api/v1/products
```

Supported filters:

```text
category
search
featured
page
limit
```

Example:

```http
GET /api/v1/products?category=Dairy%20%26%20Breakfast&page=1&limit=20
```

---

## Get Product

```http
GET /api/v1/products/:id
```

Example:

```http
GET /api/v1/products/PRODUCT_ID
```

---

## Create Product

Required role:

```text
ADMIN
MANAGER
```

Endpoint:

```http
POST /api/v1/products
```

Body:

```json
{
  "name": "Tata Sampann Unpolished Toor Dal 1kg",
  "category": "Staples & Grains",
  "regularPrice": 160,
  "discountPrice": 142,
  "stock": 45,
  "unit": "1 kg",
  "image": "https://example.com/product.jpg",
  "description": "Unpolished split yellow pigeon peas.",
  "isFeatured": true
}
```

---

## Update Product

Required role:

```text
ADMIN
MANAGER
```

```http
PUT /api/v1/products/:id
```

Example:

```json
{
  "discountPrice": 139,
  "stock": 50
}
```

---

## Delete Product

Required role:

```text
ADMIN
```

```http
DELETE /api/v1/products/:id
```

---

# 14. Order APIs

## Create Order

Required role:

```text
CUSTOMER
ADMIN
```

```http
POST /api/v1/orders
```

Headers:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "items": [
    {
      "product": "PRODUCT_ID",
      "quantity": 2,
      "price": 32
    }
  ],
  "totalAmount": 64,
  "deliveryAddress": "Flat 402, Sunshine Heights, Pune - 411001",
  "paymentMethod": "COD"
}
```

The backend should:

1. Authenticate the customer.
2. Validate the request.
3. Find every requested product.
4. Verify stock availability.
5. Decrease available stock.
6. Create the order.
7. Set `orderStatus` to `PENDING`.
8. Set `paymentStatus` to `PENDING`.
9. Return the created order.

---

## Get My Orders

```http
GET /api/v1/orders/my-orders
```

Requires authentication.

---

## Get Specific Order

```http
GET /api/v1/orders/:id
```

Requires authentication.

---

## Update Order Status

Required roles:

```text
STAFF
MANAGER
ADMIN
```

```http
PUT /api/v1/orders/:id/status
```

Body:

```json
{
  "orderStatus": "OUT_FOR_DELIVERY",
  "paymentStatus": "PAID"
}
```

Allowed order statuses:

```text
PENDING
CONFIRMED
PACKED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Allowed payment statuses:

```text
PENDING
PAID
REFUNDED
```

---

## Get All Orders

Required roles:

```text
STAFF
MANAGER
ADMIN
```

```http
GET /api/v1/orders
```

---

# 15. Returns & Exchanges APIs

## Create Return/Exchange

Required roles:

```text
CUSTOMER
ADMIN
```

```http
POST /api/v1/returns-exchanges
```

Body:

```json
{
  "orderId": "ORDER_ID",
  "productId": "PRODUCT_ID",
  "type": "RETURN",
  "reason": "Damaged packaging on delivery",
  "pickupAddress": "Flat 402, Sunshine Heights, Pune - 411001"
}
```

Allowed types:

```text
RETURN
EXCHANGE
```

---

## Get My Requests

```http
GET /api/v1/returns-exchanges/my-requests
```

---

## Get Specific Request

```http
GET /api/v1/returns-exchanges/:id
```

---

## Update Return/Exchange Status

Required roles:

```text
STAFF
MANAGER
ADMIN
```

```http
PUT /api/v1/returns-exchanges/:id/status
```

Body:

```json
{
  "status": "COMPLETED",
  "resolutionNotes": "Item inspected; refund issued."
}
```

Allowed statuses:

```text
REQUESTED
APPROVED
REJECTED
IN_TRANSIT
COMPLETED
```

---

# 16. AI APIs

## Demand Forecast

Required roles:

```text
MANAGER
ADMIN
```

```http
GET /api/v1/ai/forecast
```

Optional query parameter:

```text
darkStoreId
```

Example:

```http
GET /api/v1/ai/forecast?darkStoreId=DS-MUM-01
```

Example response:

```json
{
  "success": true,
  "darkStoreId": "DS-MUM-01",
  "recommendations": [
    {
      "productId": "PRODUCT_ID",
      "productName": "Amul Fresh Toned Milk 1L",
      "currentStock": 8,
      "reorderThreshold": 15,
      "suggestedRestock": 50,
      "urgency": "HIGH"
    }
  ]
}
```

---

## Product Recommendations

Authentication is not required.

```http
POST /api/v1/ai/recommendations
```

Body:

```json
{
  "cartItemIds": [
    "PRODUCT_ID"
  ]
}
```

Response:

```json
{
  "success": true,
  "recommendedItems": [
    {
      "_id": "PRODUCT_ID",
      "name": "Epigamia Greek Blueberry Yogurt 90g",
      "category": "Dairy & Breakfast",
      "discountPrice": 45
    }
  ]
}
```

---

# 17. Support APIs

## Create Support Ticket

No authentication required.

```http
POST /api/v1/support
```

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "subject": "Delivery Inquiry",
  "message": "When will express delivery resume?"
}
```

---

## View Support Tickets

Required roles:

```text
STAFF
ADMIN
```

```http
GET /api/v1/support
```

---

# 18. Role-Based Access Matrix

| Endpoint              | CUSTOMER | STAFF | MANAGER | ADMIN |
| --------------------- | -------: | ----: | ------: | ----: |
| Register              |      Yes |   Yes |     Yes |   Yes |
| Login                 |      Yes |   Yes |     Yes |   Yes |
| `/auth/me`            |      Yes |   Yes |     Yes |   Yes |
| View Products         |      Yes |   Yes |     Yes |   Yes |
| Create Product        |       No |    No |     Yes |   Yes |
| Update Product        |       No |    No |     Yes |   Yes |
| Delete Product        |       No |    No |      No |   Yes |
| Create Order          |      Yes |    No |      No |   Yes |
| My Orders             |      Yes |   Yes |     Yes |   Yes |
| View Specific Order   |      Yes |   Yes |     Yes |   Yes |
| Update Order Status   |       No |   Yes |     Yes |   Yes |
| View All Orders       |       No |   Yes |     Yes |   Yes |
| Create Return         |      Yes |    No |      No |   Yes |
| My Returns            |      Yes |    No |      No |    No |
| View Return           |      Yes |   Yes |     Yes |   Yes |
| Update Return         |       No |   Yes |     Yes |   Yes |
| AI Forecast           |       No |    No |     Yes |   Yes |
| AI Recommendations    |      Yes |   Yes |     Yes |   Yes |
| Create Support Ticket |      Yes |   Yes |     Yes |   Yes |
| View Support Tickets  |       No |   Yes |      No |   Yes |

---

# 19. Order Lifecycle

The standard order lifecycle is:

```text
PENDING
   │
   ▼
CONFIRMED
   │
   ▼
PACKED
   │
   ▼
OUT_FOR_DELIVERY
   │
   ▼
DELIVERED
```

An order may also be:

```text
CANCELLED
```

---

## Order Flow

### Step 1 — Customer logs in

```http
POST /api/v1/auth/login
```

The frontend stores the access token and refresh token according to the application's security strategy.

---

### Step 2 — Customer browses catalog

```http
GET /api/v1/products
```

The customer can search:

```http
GET /api/v1/products?search=milk
```

or filter:

```http
GET /api/v1/products?category=Dairy%20%26%20Breakfast
```

---

### Step 3 — Customer requests recommendations

```http
POST /api/v1/ai/recommendations
```

---

### Step 4 — Customer creates order

```http
POST /api/v1/orders
```

The backend validates inventory before creating the order.

---

### Step 5 — Staff confirms

```http
PUT /api/v1/orders/:id/status
```

```json
{
  "orderStatus": "CONFIRMED"
}
```

---

### Step 6 — Staff packs order

```json
{
  "orderStatus": "PACKED"
}
```

---

### Step 7 — Delivery starts

```json
{
  "orderStatus": "OUT_FOR_DELIVERY"
}
```

---

### Step 8 — Delivery completed

```json
{
  "orderStatus": "DELIVERED",
  "paymentStatus": "PAID"
}
```

---

# 20. Return/Exchange Lifecycle

Standard return flow:

```text
REQUESTED
   │
   ▼
APPROVED
   │
   ▼
IN_TRANSIT
   │
   ▼
COMPLETED
```

Rejected flow:

```text
REQUESTED
   │
   ▼
REJECTED
```

---

## Return Flow

```text
Customer
   │
   │ POST /returns-exchanges
   ▼
REQUESTED
   │
   │ Staff inspection
   ▼
APPROVED / REJECTED
   │
   │ If approved
   ▼
IN_TRANSIT
   │
   ▼
COMPLETED
```

For a completed return, the backend can record resolution information such as:

```json
{
  "resolutionNotes": "Item inspected; refund issued."
}
```

---

# 21. Database Models

## User

```text
User
├── name
├── email
├── password
├── phone
└── role
```

Role enum:

```text
CUSTOMER
STAFF
MANAGER
ADMIN
```

---

## Product

```text
Product
├── name
├── category
├── regularPrice
├── discountPrice
├── stock
├── unit
├── image
├── description
└── isFeatured
```

---

## Order

```text
Order
├── user
├── items[]
│   ├── product
│   ├── quantity
│   └── price
├── totalAmount
├── deliveryAddress
├── orderStatus
└── paymentStatus
```

---

## Return/Exchange

```text
ReturnExchange
├── orderId
├── productId
├── type
├── reason
├── pickupAddress
├── status
└── resolutionNotes
```

---

## Support

```text
Support
├── name
├── email
├── subject
├── message
├── status
└── createdAt
```

---

# 22. Frontend Integration Flow

The frontend should configure the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

A centralized API client is recommended.

Example:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}
```

Authenticated requests should send:

```javascript
const token = localStorage.getItem("accessToken");

const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

# 23. Complete Customer Journey

```text
                    CUSTOMER
                       │
                       ▼
                 Registration
                       │
                       ▼
                    Login
                       │
                       ▼
              Access + Refresh Token
                       │
                       ▼
              ┌────────────────┐
              │ Product Catalog│
              └───────┬────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Search      Category    Featured
          │           │           │
          └───────────┼───────────┘
                      ▼
                     Cart
                      │
                      ▼
              AI Recommendations
                      │
                      ▼
                   Checkout
                      │
                      ▼
                Create Order
                      │
                      ▼
                   PENDING
                      │
                      ▼
                  CONFIRMED
                      │
                      ▼
                    PACKED
                      │
                      ▼
              OUT_FOR_DELIVERY
                      │
                      ▼
                  DELIVERED
                      │
                ┌─────┴─────┐
                │           │
                ▼           ▼
              Return      Exchange
                │           │
                └─────┬─────┘
                      ▼
                   REQUESTED
                      │
                      ▼
                   APPROVED
                      │
                      ▼
                  IN_TRANSIT
                      │
                      ▼
                  COMPLETED
```

---

# 24. Manager/Staff Workflow

## Staff workflow

```text
Login
  │
  ▼
View All Orders
  │
  ▼
Confirm Order
  │
  ▼
Pack Order
  │
  ▼
Mark Out For Delivery
  │
  ▼
Mark Delivered
```

Staff can also:

```text
View Return Requests
       │
       ▼
Inspect Request
       │
       ▼
Approve / Reject
       │
       ▼
Complete Workflow
```

---

## Manager workflow

Managers can additionally:

```text
Login
  │
  ├── Manage Products
  │
  ├── Update Stock
  │
  ├── Review Orders
  │
  ├── Manage Returns
  │
  └── View AI Forecast
          │
          ▼
     Low Stock Items
          │
          ▼
      Restock Planning
```

---

# 25. API Testing with cURL

## Register

```bash
curl -X POST "http://localhost:5000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Jane Doe",
    "email":"jane.doe@example.com",
    "password":"Password@123",
    "phone":"+919876543210"
  }'
```

---

## Login

```bash
curl -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"jane.doe@example.com",
    "password":"Password@123"
  }'
```

Copy the returned:

```text
accessToken
```

---

## Get Products

```bash
curl -X GET "http://localhost:5000/api/v1/products"
```

---

## Search Products

```bash
curl -X GET "http://localhost:5000/api/v1/products?search=milk"
```

---

## Get My Orders

```bash
curl -X GET "http://localhost:5000/api/v1/orders/my-orders" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## Create Order

```bash
curl -X POST "http://localhost:5000/api/v1/orders" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID",
        "quantity": 1,
        "price": 32
      }
    ],
    "totalAmount": 32,
    "deliveryAddress": "Flat 101, Palm Grove, Pune - 411001",
    "paymentMethod": "COD"
  }'
```

---

## Update Order

```bash
curl -X PUT "http://localhost:5000/api/v1/orders/ORDER_ID/status" \
  -H "Authorization: Bearer <STAFF_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus":"CONFIRMED"
  }'
```

---

## Get Forecast

```bash
curl -X GET "http://localhost:5000/api/v1/ai/forecast?darkStoreId=DS-MUM-01" \
  -H "Authorization: Bearer <MANAGER_ACCESS_TOKEN>"
```

---

# 26. Error Handling

The API uses standard HTTP status codes.

| Status | Meaning                            |
| ------ | ---------------------------------- |
| 200    | Successful read/update             |
| 201    | Resource successfully created      |
| 400    | Invalid request/validation failure |
| 401    | Authentication failure             |
| 403    | Insufficient permissions           |
| 404    | Resource not found                 |
| 409    | Conflict/duplicate resource        |
| 500    | Internal server error              |

---

## 400 Example

```json
{
  "success": false,
  "message": "Please provide name, email, and password"
}
```

---

## 401 Example

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 403 Example

```json
{
  "success": false,
  "message": "User role is not authorized"
}
```

---

## 404 Example

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

# 27. Pagination & Filtering

Product endpoint:

```http
GET /api/v1/products
```

Supported query parameters:

| Parameter  | Example             | Purpose                         |
| ---------- | ------------------- | ------------------------------- |
| `page`     | `1`                 | Page number                     |
| `limit`    | `20`                | Items per page                  |
| `category` | `Dairy & Breakfast` | Category filter                 |
| `search`   | `milk`              | Search product name/description |
| `featured` | `true`              | Featured products               |

Example:

```http
GET /api/v1/products?search=milk&category=Dairy%20%26%20Breakfast&page=1&limit=20
```

Response:

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": []
}
```

---

# 28. Security

## Password Security

Passwords are hashed using:

```text
bcryptjs
```

Configured salt rounds:

```text
10
```

Passwords must never be returned in API responses.

---

## JWT Security

Use separate secrets:

```env
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

Access and refresh tokens should never use the same secret.

---

## CORS

Allowed frontend origin:

```env
CLIENT_URL=http://localhost:5173
```

Configure CORS to only allow trusted frontend origins.

---

## Environment Secrets

Never commit:

```text
.env
JWT secrets
MongoDB credentials
GEMINI_API_KEY
production credentials
```

to Git.

---

# 29. AI Integration

D-MartX optionally integrates with Google Gemini.

Environment variable:

```env
GEMINI_API_KEY=
```

AI can be used for:

* Demand estimation
* Stock velocity analysis
* Restocking suggestions
* Product pairing
* Grocery recommendations

If Gemini is unavailable, the application can fall back to category-affinity recommendation logic.

Example:

```text
Customer adds:
Milk

Recommendation:
Yogurt
Bread
Butter
```

---

# 30. File Uploads

Multipart file uploads are currently not implemented.

Product images are stored as external URLs:

```json
{
  "image": "https://example.com/product.jpg"
}
```

A future implementation can introduce:

* Cloudinary
* AWS S3
* Firebase Storage
* Another object storage service

without changing the basic product API contract.

---

# 31. API Versioning

All APIs use:

```text
/api/v1
```

Example:

```text
/api/v1/products
/api/v1/orders
/api/v1/auth/login
```

Root-level aliases may also exist for compatibility.

Future breaking API changes should use:

```text
/api/v2
```

instead of modifying existing `/api/v1` contracts.

---

# 32. Known Limitations

Current implementation limitations include:

* Rate limiting is not specified.
* Multipart file uploads are not implemented.
* Images are referenced through URLs.
* WebSockets are not specified.
* Real-time order tracking currently relies on HTTP API polling/refetching.
* Payment gateway integration is not specified.
* Production deployment URL is not specified.
* Advanced inventory reservation locking/transactions should be reviewed for high-concurrency production usage.
* AI forecasting depends on available inventory/order history and optional Gemini configuration.

---

# 33. Development Notes

Routes are organized by domain:

```text
server/src/routes/
```

Recommended route files:

```text
auth.routes.js
product.routes.js
order.routes.js
returnExchange.routes.js
ai.routes.js
support.routes.js
```

Controllers should contain:

* Request validation
* Business logic
* Database operations
* Response generation

Middleware should contain:

* Authentication
* Authorization
* Error handling
* CORS/security handling

Recommended request flow:

```text
HTTP Request
     │
     ▼
Express
     │
     ▼
express.json()
     │
     ▼
CORS
     │
     ▼
Authentication Middleware
     │
     ▼
Role Guard
     │
     ▼
Route
     │
     ▼
Controller
     │
     ▼
Mongoose Model
     │
     ▼
MongoDB
     │
     ▼
Controller Response
     │
     ▼
Client
```

---

# 34. Production Checklist

Before production deployment, verify:

* [ ] MongoDB production database configured
* [ ] Strong JWT access secret configured
* [ ] Strong JWT refresh secret configured
* [ ] `CLIENT_URL` configured correctly
* [ ] `VITE_API_BASE_URL` points to production API
* [ ] Gemini API key configured if AI features are enabled
* [ ] `.env` excluded from Git
* [ ] HTTPS enabled
* [ ] CORS restricted to trusted origins
* [ ] Rate limiting added
* [ ] Request validation hardened
* [ ] MongoDB indexes reviewed
* [ ] Inventory concurrency handling reviewed
* [ ] Error responses do not expose secrets
* [ ] Passwords never returned
* [ ] JWT expiration verified
* [ ] Refresh-token handling reviewed
* [ ] Production logging configured
* [ ] Database backups configured
* [ ] API monitoring configured
* [ ] Payment integration secured if enabled
* [ ] Image hosting/storage configured
* [ ] API documentation kept synchronized with implementation

---

# Quick API Reference

## Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

## Products

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Orders

```text
POST   /api/v1/orders
GET    /api/v1/orders/my-orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id/status
GET    /api/v1/orders
```

## Returns & Exchanges

```text
POST   /api/v1/returns-exchanges
GET    /api/v1/returns-exchanges/my-requests
GET    /api/v1/returns-exchanges/:id
PUT    /api/v1/returns-exchanges/:id/status
```

## AI

```text
GET    /api/v1/ai/forecast
POST   /api/v1/ai/recommendations
```

## Support

```text
POST   /api/v1/support
GET    /api/v1/support
```

---

# Complete D-MartX System Flow

```text
                         D-MARTX
                            │
             ┌──────────────┴──────────────┐
             │                             │
          CUSTOMER                      OPERATIONS
             │                             │
             ▼                             ▼
        Registration                   Staff Login
             │                             │
             ▼                             ▼
           Login                       All Orders
             │                             │
             ▼                             ▼
       Access Token                  Order Processing
             │                             │
             ▼                             ▼
       Product Catalog                CONFIRMED
             │                             │
             ▼                             ▼
       Search / Filter                   PACKED
             │                             │
             ▼                             ▼
            Cart                    OUT_FOR_DELIVERY
             │                             │
             ▼                             ▼
       Recommendations                  DELIVERED
             │
             ▼
          Checkout
             │
             ▼
        Create Order
             │
             ▼
          PENDING
             │
             └──────────────┐
                            ▼
                         Delivery
                            │
                            ▼
                         DELIVERED
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  ▼                   ▼
                RETURN             EXCHANGE
                  │                   │
                  └─────────┬─────────┘
                            ▼
                         REQUESTED
                            │
                            ▼
                         APPROVED
                            │
                            ▼
                        IN_TRANSIT
                            │
                            ▼
                         COMPLETED


        ┌──────────────────────────────────┐
        │          MANAGER / ADMIN         │
        ├──────────────────────────────────┤
        │ Product Management               │
        │ Stock Management                 │
        │ Order Management                 │
        │ Return Management                │
        │ AI Forecasting                   │
        │ Operational Analytics            │
        └──────────────────────────────────┘
```

---

## Final API Architecture

```text
Frontend
   │
   │ JSON + JWT
   ▼
Express REST API
   │
   ├── /auth
   ├── /products
   ├── /orders
   ├── /returns-exchanges
   ├── /ai
   └── /support
   │
   ▼
Controllers
   │
   ▼
Middleware
   │
   ├── Authentication
   ├── Authorization
   ├── Validation
   └── Error Handling
   │
   ▼
Mongoose
   │
   ▼
MongoDB

Optional:
   │
   └── Gemini API
```

D-MartX therefore provides a complete API flow from **customer registration → authentication → catalog browsing → AI recommendations → checkout → inventory validation → order fulfillment → delivery → returns/exchanges**, while providing separate operational capabilities for **staff, managers, and administrators**.
l