# D-MartX — System Architecture

> **Document:** `architecture.md`
> **Project:** D-MartX Hyper-Local Grocery & Dark-Store Platform
> **Architecture Style:** Stateless REST API + Modular Backend
> **Backend:** Node.js / Express.js
> **Database:** MongoDB with Mongoose ODM
> **API Version:** `/api/v1`
> **Authentication:** JWT Access + Refresh Tokens

---

## 1. Architecture Overview

D-MartX is a hyper-local grocery and dark-store supermarket platform designed to support:

* Customer registration and authentication
* Product catalog browsing and management
* Dark-store inventory management
* Grocery order placement and lifecycle tracking
* Returns and exchanges
* Customer support tickets
* AI-assisted demand forecasting
* Product recommendations
* Role-based administrative operations

The backend follows a **stateless RESTful API architecture** implemented with **Express.js** and **MongoDB using Mongoose ODM**.

The API communicates using JSON over HTTP/HTTPS and exposes versioned endpoints under:

```text
/api/v1
```

The architecture is modular, with separate route and controller areas for authentication, products, orders, returns/exchanges, AI functionality, and support.

---

## 2. High-Level Architecture

```text
                    ┌─────────────────────────┐
                    │       End Users         │
                    │                         │
                    │  Customer / Staff /     │
                    │  Manager / Admin        │
                    └────────────┬────────────┘
                                 │
                                 │ HTTP / HTTPS
                                 │ JSON
                                 ▼
                    ┌─────────────────────────┐
                    │      Client Layer       │
                    │                         │
                    │  Web / Frontend Client  │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 ▼
              ┌────────────────────────────────────┐
              │          Express.js Server         │
              │                                    │
              │  /api/v1                            │
              │                                    │
              │  ┌──────────────────────────────┐  │
              │  │ Middleware Layer              │  │
              │  │                              │  │
              │  │ • JSON Parser                │  │
              │  │ • CORS                       │  │
              │  │ • JWT Authentication         │  │
              │  │ • Role Authorization          │  │
              │  │ • Error Handling              │  │
              │  └──────────────┬───────────────┘  │
              │                 │                  │
              │  ┌──────────────▼───────────────┐  │
              │  │        Route Layer           │  │
              │  │                              │  │
              │  │ Auth                         │  │
              │  │ Products                     │  │
              │  │ Orders                       │  │
              │  │ Returns / Exchanges          │  │
              │  │ AI                           │  │
              │  │ Support                      │  │
              │  └──────────────┬───────────────┘  │
              │                 │                  │
              │  ┌──────────────▼───────────────┐  │
              │  │       Controller Layer       │  │
              │  │                              │  │
              │  │ Request Validation            │  │
              │  │ Business Logic                │  │
              │  │ Database Operations            │  │
              │  │ HTTP Responses                │  │
              │  └──────────────┬───────────────┘  │
              └─────────────────┼──────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
          ┌─────────────────┐     ┌──────────────────┐
          │ MongoDB         │     │ Google Gemini    │
          │                 │     │ API              │
          │ • Users         │     │                  │
          │ • Products      │     │ AI forecasting   │
          │ • Orders        │     │ Recommendations  │
          │ • Returns       │     │                  │
          │ • Support       │     └──────────────────┘
          └─────────────────┘
```

---

# 3. Architectural Style

The application uses a **modular layered REST architecture**.

The major layers are:

```text
Client
  ↓
HTTP / REST API
  ↓
Middleware
  ↓
Routes
  ↓
Controllers
  ↓
Mongoose Models / MongoDB
  ↓
External Services
```

The architecture is intentionally stateless at the HTTP API layer.

Authentication state is represented through JWT tokens rather than server-side HTTP sessions.

---

# 4. Technology Stack

| Layer                 | Technology            |
| --------------------- | --------------------- |
| Runtime               | Node.js               |
| Backend Framework     | Express.js            |
| API Style             | REST                  |
| Database              | MongoDB               |
| ODM                   | Mongoose              |
| Authentication        | JSON Web Token (JWT)  |
| Password Hashing      | bcryptjs              |
| API Format            | JSON                  |
| Protocol              | HTTP/1.1, HTTPS       |
| AI Integration        | Google Gemini API     |
| Configuration         | Environment variables |
| Cross-Origin Security | CORS                  |

The documented backend uses Express.js and MongoDB with Mongoose ODM.

---

# 5. Deployment Architecture

The logical deployment architecture is:

```text
                  Internet / Local Network
                           │
                           ▼
                  ┌─────────────────┐
                  │ Frontend Client │
                  └────────┬────────┘
                           │
                           │ HTTPS
                           ▼
                ┌──────────────────────┐
                │   Express.js API     │
                │                      │
                │   Node.js Runtime    │
                └──────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌─────────────────┐     ┌─────────────────┐
      │ MongoDB         │     │ Gemini API      │
      │                 │     │                 │
      │ Application     │     │ Optional AI     │
      │ Data            │     │ Services        │
      └─────────────────┘     └─────────────────┘
```

### Development

```text
Frontend
    │
    ▼
http://localhost:5000/api/v1
    │
    ▼
Express.js
    │
    ▼
MongoDB
```

The documented development API base URL is:

```text
http://localhost:5000/api/v1
```

The production URL is not specified in the project documentation and is expected to be configured through runtime environment variables.

---

# 6. Backend Directory Architecture

The documented route structure places domain-specific routes under:

```text
server/src/routes/
```

and controllers under:

```text
server/src/controllers/
```

A recommended structure matching the documented architecture is:

```text
server/
└── src/
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── product.controller.js
    │   ├── order.controller.js
    │   ├── returnExchange.controller.js
    │   ├── ai.controller.js
    │   └── support.controller.js
    │
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleGuard.js
    │   └── errorMiddleware.js
    │
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   ├── ReturnExchange.js
    │   └── Support.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── product.routes.js
    │   ├── order.routes.js
    │   ├── returnExchange.routes.js
    │   ├── ai.routes.js
    │   └── support.routes.js
    │
    ├── services/
    │   ├── auth.service.js
    │   ├── product.service.js
    │   ├── order.service.js
    │   ├── returnExchange.service.js
    │   ├── ai.service.js
    │   └── support.service.js
    │
    ├── config/
    │   └── database.js
    │
    └── server.js
```

> **Implementation note:** The documentation explicitly confirms the route and controller locations. The exact `services/`, `config/`, and individual model filenames should be treated as the intended logical organization unless those files exist in the repository.

---

# 7. Request Processing Pipeline

Every request passes through a predictable processing pipeline.

```text
Client Request
      │
      ▼
Express Application
      │
      ▼
express.json()
      │
      ▼
CORS Validation
      │
      ▼
Authentication Middleware
      │
      ▼
Role Guard
      │
      ▼
Route Handler
      │
      ▼
Controller
      │
      ▼
Mongoose / MongoDB
      │
      ▼
Controller Response
      │
      ▼
Global Error Handler
      │
      ▼
JSON Response
```

The documented middleware order is:

1. `express.json()`
2. CORS verification
3. `authMiddleware`
4. `roleGuard`
5. Global error handling middleware.

---

# 8. API Architecture

All primary endpoints use the `/api/v1` prefix.

```text
/api/v1
│
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   └── GET  /me
│
├── /products
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
│
├── /orders
│   ├── POST / 
│   ├── GET  /my-orders
│   ├── GET  /:id
│   ├── PUT  /:id/status
│   └── GET  /
│
├── /returns-exchanges
│   ├── POST /
│   ├── GET  /my-requests
│   ├── GET  /:id
│   └── PUT  /:id/status
│
├── /ai
│   ├── GET  /forecast
│   └── POST /recommendations
│
└── /support
    ├── POST /
    └── GET  /
```

Root-level aliases are also maintained for compatibility.

---

# 9. Authentication Architecture

D-MartX uses a two-token JWT architecture.

```text
                  Login
                    │
                    ▼
             Validate Credentials
                    │
                    ▼
             bcrypt Password Check
                    │
                    ▼
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
 Access Token              Refresh Token
 Short-lived               Long-lived
 15 minutes                7 days
        │                        │
        ▼                        ▼
 API Authorization        Token Refresh
```

## Access Token

Configured using:

```env
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
```

The access token is sent through:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

## Refresh Token

Configured using:

```env
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
```

A valid refresh token can be exchanged for a new access token.

The project documentation specifies separate secrets and different expiration periods for access and refresh tokens.

---

# 10. Authorization Architecture

The platform implements role-based access control.

## Roles

```text
CUSTOMER
   │
   ├── Browse products
   ├── Place orders
   ├── View orders
   └── Create return/exchange requests


STAFF
   │
   ├── View platform orders
   ├── Update order status
   ├── Manage returns
   └── Read support tickets


MANAGER
   │
   ├── Staff capabilities
   ├── Product management
   ├── Inventory management
   └── AI forecasting


ADMIN
   │
   └── Full platform access
```

## Authorization Flow

```text
Request
   │
   ▼
JWT Verification
   │
   ├── Invalid → 401
   │
   ▼
req.user
   │
   ▼
Role Guard
   │
   ├── Unauthorized Role → 403
   │
   ▼
Controller
```

The documented roles are `CUSTOMER`, `STAFF`, `MANAGER`, and `ADMIN`.

---

# 11. Domain Modules

The system is divided into six major business modules.

```text
                 D-MartX Backend
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Authentication   Product Catalog   Order Lifecycle
       │               │                │
       └───────────────┼────────────────┘
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
      Returns/Exchanges      Support
             │
             ▼
             AI
```

---

# 12. Authentication Module

Responsible for:

* Customer registration
* Login
* Access token generation
* Refresh token generation
* Access token renewal
* Authenticated user profile retrieval

Endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

Password storage uses bcrypt hashing rather than storing plaintext passwords.

---

# 13. Product Catalog Module

Responsible for:

* Product discovery
* Search
* Category filtering
* Featured products
* Pagination
* Product creation
* Product modification
* Product deletion
* Stock management

Endpoints:

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Product Data

```text
Product
├── _id
├── name
├── category
├── regularPrice
├── discountPrice
├── stock
├── unit
├── image
├── description
├── isFeatured
└── createdAt
```

Products use MongoDB ObjectIds.

The documented model specifies indexed product names and categories and non-negative pricing and inventory values.

---

# 14. Order Lifecycle Module

The order module manages the complete customer order lifecycle.

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

Cancellation is represented by:

```text
CANCELLED
```

Payment status is independently tracked:

```text
PENDING
   │
   ▼
PAID
   │
   ▼
REFUNDED
```

## Order Creation Flow

```text
Customer
   │
   ▼
POST /orders
   │
   ▼
Authenticate Customer
   │
   ▼
Validate Items
   │
   ▼
Check Product Stock
   │
   ├── Insufficient → 400
   │
   ▼
Reserve / Decrement Stock
   │
   ▼
Create Order
   │
   ▼
PENDING
   │
   ▼
Return Order
```

The documented order creation process validates stock availability, decrements stock, creates the order, and initially sets the order status to `PENDING`.

---

# 15. Order Data Model

Logical structure:

```text
Order
├── _id
├── user
│   └── ObjectId → User
│
├── items[]
│   ├── product
│   │   └── ObjectId → Product
│   ├── quantity
│   └── price
│
├── totalAmount
├── deliveryAddress
├── orderStatus
├── paymentStatus
└── createdAt
```

Supported order statuses:

```text
PENDING
CONFIRMED
PACKED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Supported payment statuses:

```text
PENDING
PAID
REFUNDED
```

The documented order model uses a User reference and product references inside order items.

---

# 16. Returns & Exchanges Module

This module handles customer requests for:

* Product returns
* Product exchanges
* Return inspection
* Approval/rejection
* Item movement
* Completion/refund processing

Endpoints:

```text
POST /api/v1/returns-exchanges
GET  /api/v1/returns-exchanges/my-requests
GET  /api/v1/returns-exchanges/:id
PUT  /api/v1/returns-exchanges/:id/status
```

## Return Lifecycle

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

An alternative terminal state is:

```text
REJECTED
```

---

# 17. AI Architecture

AI functionality is exposed through the `/api/v1/ai` module.

```text
                 AI Module
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     Forecasting       Recommendations
          │                   │
          ▼                   ▼
    Stock Velocity       Cart Items
          │                   │
          ▼                   ▼
    Restock Advice      Related Products
```

## Forecast Endpoint

```http
GET /api/v1/ai/forecast
```

Purpose:

* Analyze inventory consumption velocity
* Identify low-stock products
* Estimate replenishment requirements
* Generate restock recommendations

Example conceptual result:

```text
Product
   │
   ├── Current Stock
   ├── Reorder Threshold
   ├── Suggested Restock
   └── Urgency
```

## Recommendation Endpoint

```http
POST /api/v1/ai/recommendations
```

Input:

```json
{
  "cartItemIds": [
    "PRODUCT_ID"
  ]
}
```

Output:

```text
Recommended Products
```

---

# 18. Gemini Integration

Google Gemini is an **optional external AI dependency**.

```text
              D-MartX
                 │
                 ▼
           AI Service Layer
                 │
          ┌──────┴──────┐
          │             │
     API Key Set    API Key Missing
          │             │
          ▼             ▼
     Gemini API     Local Fallback
          │             │
          └──────┬──────┘
                 ▼
          Recommendation /
          Forecast Result
```

Environment variable:

```env
GEMINI_API_KEY=...
```

Gemini is documented for dynamic demand velocity estimation and recipe/product pairing suggestions. If the API key is unavailable, the system falls back to localized category-affinity logic.

---

# 19. Support Module

The support module manages customer inquiries and support tickets.

Endpoints:

```text
POST /api/v1/support
GET  /api/v1/support
```

## Ticket Flow

```text
Customer
   │
   ▼
Submit Inquiry
   │
   ▼
Support Ticket
   │
   ▼
OPEN
   │
   ▼
Staff Review
```

The public ticket creation endpoint does not require authentication according to the current API documentation.

Support ticket listing requires `STAFF` or `ADMIN`.

---

# 20. Database Architecture

MongoDB is the primary persistence layer.

Logical collections/entities include:

```text
MongoDB
│
├── users
│
├── products
│
├── orders
│
├── return-exchanges
│
└── support
```

## Entity Relationships

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Orders       Returns/Exchanges
 │
 ▼
Order Items
 │
 ▼
Products
```

Additional conceptual relationship:

```text
User
  │
  └── Support Tickets
```

---

# 21. User Model

```text
User
├── _id
├── name
├── email
├── password
├── phone
├── role
└── createdAt
```

Constraints:

* `name` is required
* `email` is required and unique
* `password` is required
* password minimum length is 6 characters
* `phone` is optional
* role defaults to `CUSTOMER`

Passwords are salted and hashed using bcrypt.

---

# 22. Product Model

```text
Product
├── _id
├── name
├── category
├── regularPrice
├── discountPrice
├── stock
├── unit
├── image
├── description
├── isFeatured
└── createdAt
```

Constraints:

```text
regularPrice >= 0
discountPrice >= 0
discountPrice <= regularPrice
stock >= 0
```

Product names are text indexed and categories are indexed.

---

# 23. API Response Architecture

Successful API responses follow a standardized structure.

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Detailed error string or validation breakdown"
}
```

The exact response fields can vary for some endpoints, but the API documentation establishes `success` as the standard success indicator.

---

# 24. HTTP Error Architecture

| Status | Meaning               | Typical Usage                                   |
| ------ | --------------------- | ----------------------------------------------- |
| `200`  | OK                    | Successful read/update                          |
| `201`  | Created               | Successful resource creation                    |
| `400`  | Bad Request           | Invalid payload, validation, insufficient stock |
| `401`  | Unauthorized          | Missing/invalid/expired JWT                     |
| `403`  | Forbidden             | Insufficient role                               |
| `404`  | Not Found             | Resource does not exist                         |
| `409`  | Conflict              | Duplicate unique value                          |
| `500`  | Internal Server Error | Unexpected server/database error                |

---

# 25. Validation Architecture

Validation occurs before business operations.

```text
Request
   │
   ▼
Parse JSON
   │
   ▼
Validate Required Fields
   │
   ▼
Validate Types
   │
   ▼
Validate Business Constraints
   │
   ▼
Controller
```

Examples:

```text
User
├── Valid email
├── Password length >= 6
└── Unique email

Product
├── Valid name
├── Valid category
├── Positive/non-negative prices
├── discountPrice <= regularPrice
└── stock >= 0

Order
├── At least one item
├── Valid product ObjectIds
├── quantity >= 1
└── Valid payment method
```

---

# 26. Pagination Architecture

Product listing supports:

```text
page
limit
category
search
featured
```

Defaults:

```text
page  = 1
limit = 20
```

Example:

```http
GET /api/v1/products?page=1&limit=20&category=Dairy%20%26%20Breakfast
```

Pagination metadata:

```json
{
  "count": 1,
  "total": 9,
  "page": 1,
  "pages": 1
}
```

The documented product endpoint supports category filtering, name/description search, featured filtering, and pagination.

---

# 27. Security Architecture

Security is implemented at multiple layers.

```text
                  Security
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
 Password        JWT Auth        CORS
 Hashing
       │             │             │
       ▼             ▼             ▼
 bcryptjs      Access/Refresh    Allowed
               Secrets           Origins
```

## Password Security

Passwords are:

```text
Plain Password
      │
      ▼
bcryptjs
      │
      ▼
Salt + Hash
      │
      ▼
MongoDB
```

The documented bcrypt salt-round factor is:

```text
10
```

## JWT Security

Separate secrets are used:

```env
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

## CORS

Allowed client origins are configured through:

```env
CLIENT_URL=...
```

## Secret Management

Sensitive values are stored through environment configuration rather than hardcoded into application source.

These security mechanisms are explicitly documented in the project API documentation.

---

# 28. Environment Configuration

The architecture depends on runtime environment variables.

Example:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=mongodb://localhost:27017/dmartx

CLIENT_URL=http://localhost:3000

JWT_ACCESS_SECRET=change-me
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=change-me
JWT_REFRESH_EXPIRES_IN=7d

GEMINI_API_KEY=
```

> Only variables explicitly documented by the project should be treated as mandatory. `MONGODB_URI`, for example, is shown here as the logical database connection configuration and should match the actual repository configuration.

---

# 29. CORS Architecture

The API restricts cross-origin requests according to the configured client origin.

```text
Frontend Origin
       │
       ▼
     CORS
       │
       ├── Allowed → Express API
       │
       └── Rejected → Request blocked
```

Configuration:

```env
CLIENT_URL=<allowed-client-origin>
```

---

# 30. Stateless API Design

The API is designed to be stateless.

The server does not depend on an HTTP session for normal authentication.

Each authenticated request carries:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Therefore:

```text
Request 1 ── JWT ──> Server
Request 2 ── JWT ──> Server
Request 3 ── JWT ──> Server
```

Each request can be independently authenticated.

Benefits:

* Horizontal scalability
* No session affinity requirement
* Easier API deployment
* Clear separation between client and server state

---

# 31. Order and Inventory Consistency

Inventory is checked during order creation.

```text
Customer Checkout
       │
       ▼
Requested Quantity
       │
       ▼
Read Product Stock
       │
       ├── Stock < Requested
       │       │
       │       ▼
       │     Reject
       │
       └── Stock >= Requested
               │
               ▼
        Decrement Stock
               │
               ▼
          Create Order
```

Insufficient inventory results in a `400 Bad Request`.

The current documentation describes stock decrement during order placement but does not specify a database transaction strategy or distributed locking mechanism. Therefore, transaction/locking behavior should not be assumed beyond the documented implementation.

---

# 32. Customer Purchase Workflow

Complete customer workflow:

```text
┌───────────────┐
│ Register/Login│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Browse Catalog│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Search/Filter │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Add to Cart   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Recommendations│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Checkout      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Stock Check   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Create Order  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Track Order   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Delivered     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Return/Exchange│
└───────────────┘
```

---

# 33. Staff Workflow

```text
Staff Login
    │
    ▼
View Orders
    │
    ▼
Review Pending Orders
    │
    ▼
Update Status
    │
    ├── CONFIRMED
    ├── PACKED
    └── OUT_FOR_DELIVERY
    │
    ▼
Delivery
```

Staff can also participate in return processing and support-ticket review according to their authorized endpoints.

---

# 34. Manager Workflow

```text
Manager Login
      │
      ├───────────────┐
      │               │
      ▼               ▼
Product Management   AI Forecast
      │               │
      ▼               ▼
Inventory Updates   Restock Advice
      │               │
      └───────┬───────┘
              ▼
        Store Operations
```

Managers can manage catalog data and access AI inventory forecasting.

---

# 35. Admin Workflow

The administrator has the broadest authorization level.

```text
                     ADMIN
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
 Authentication    Catalog          Orders
       │               │               │
       └───────────────┼───────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Returns        AI         Support
```

Administrative access is controlled through the same JWT + role-guard mechanism.

---

# 36. External Integration Boundary

The system currently has one documented optional external AI integration:

```text
D-MartX Backend
      │
      ▼
AI Service
      │
      ├── Gemini API
      │
      └── Local fallback
```

No additional payment gateway, maps provider, delivery provider, file storage provider, or notification service is specified in the supplied documentation.

Therefore, those services should not be considered part of the current documented architecture.

---

# 37. File and Media Architecture

The current implementation does **not** use multipart file uploads.

Product images are represented as external URLs:

```text
Product
   │
   └── image: String URL
```

Example:

```json
{
  "image": "https://example.com/product-image.jpg"
}
```

The supplied documentation explicitly states that multipart uploads are not implemented and product assets are stored as external image URLs in MongoDB.

---

# 38. Error Handling Architecture

All unexpected errors should flow toward the global error middleware.

```text
Controller
   │
   ├── Expected Validation Error
   │
   ├── Not Found
   │
   ├── Authorization Error
   │
   └── Unexpected Exception
              │
              ▼
       Global Error Handler
              │
              ▼
        JSON Error Response
```

Expected responses should preserve the project's standard JSON response format.

---

# 39. API Versioning

The current API version is:

```text
v1
```

Base path:

```text
/api/v1
```

Example:

```text
/api/v1/products
/api/v1/orders
/api/v1/auth/login
```

Root aliases are maintained for compatibility with clients that may use routes without the `/api/v1` prefix.

Future breaking API changes should use a new version rather than silently changing the existing contract.

---

# 40. Scalability Architecture

The stateless API design allows the backend to scale horizontally.

Conceptually:

```text
                    Load Balancer
                         │
             ┌───────────┼───────────┐
             │           │           │
             ▼           ▼           ▼
         API Node 1  API Node 2  API Node 3
             │           │           │
             └───────────┼───────────┘
                         │
                         ▼
                      MongoDB
```

Because authentication is token-based rather than session-based, requests can be distributed between API instances without requiring sticky sessions.

The current project documentation does not specify a production load balancer, container orchestration system, or cloud provider.

---

# 41. Observability

The supplied API documentation does not define a dedicated logging, metrics, tracing, or monitoring stack.

Therefore the current documented architecture should be considered:

```text
Application
    │
    ▼
HTTP Responses
    │
    ▼
Error Middleware
```

Future production observability can be introduced through:

* Structured application logs
* Request correlation IDs
* Error tracking
* API metrics
* Database monitoring
* Health checks
* Distributed tracing

These are architectural recommendations rather than currently documented implementation components.

---

# 42. Current Architecture Limitations

The documented implementation has several known limitations:

### Rate Limiting

Rate limiting is not specified in the current implementation.

### File Uploads

Multipart uploads are not implemented.

### WebSockets

WebSocket functionality is not specified.

### Production Infrastructure

The production API URL is not specified.

### AI Dependency

Gemini is optional and has a local fallback.

### Transaction Strategy

The documentation describes inventory decrement during order creation but does not specify MongoDB transaction or locking behavior.

These limitations should be considered when evolving the system.

---

# 43. Recommended Future Architecture

The existing architecture can evolve without changing the primary domain boundaries.

```text
                       CDN
                        │
                        ▼
                 Frontend Application
                        │
                        ▼
                Load Balancer / API Gateway
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        API Instance 1      API Instance N
              │                   │
              └─────────┬─────────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
              ▼         ▼         ▼
           MongoDB    Cache      Queue
                        │
                        ▼
                  Background Jobs
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
          AI Jobs   Notifications Analytics
```

Potential future components include:

* Redis for caching
* Background job queues
* Notification services
* Payment gateway integration
* Delivery tracking
* Object storage for product images
* API rate limiting
* Centralized logging
* Monitoring and metrics
* Automated health checks

These are future architectural options and are not part of the currently documented implementation.

---

# 44. Architectural Principles

The D-MartX architecture follows these primary principles:

## 44.1 Separation of Concerns

Routes, middleware, controllers, and persistence responsibilities are separated.

```text
Routes
  ↓
Controllers
  ↓
Database
```

## 44.2 Stateless Authentication

Authentication is handled through JWT tokens rather than server-side sessions.

## 44.3 Role-Based Authorization

Access is determined by the authenticated user's role.

## 44.4 Modular Domains

Business functionality is divided into independent domain modules.

## 44.5 API Versioning

REST endpoints are grouped under `/api/v1`.

## 44.6 JSON-First Communication

Client/server communication uses JSON.

## 44.7 Graceful AI Degradation

AI features can fall back to local recommendation logic when Gemini is unavailable.

---

# 45. Module Dependency Diagram

```text
                       ┌───────────────┐
                       │ Authentication│
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │    Users      │
                       └───────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
           Products         Orders         Support
                │              │
                │              ▼
                │         Returns /
                │         Exchanges
                │
                ▼
               AI
```

---

# 46. Complete Request Lifecycle Example

Example:

```http
POST /api/v1/orders
```

### Step 1 — Client

Client sends:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

with order data.

### Step 2 — Express

Express receives the request.

### Step 3 — JSON Parser

The request body is converted into a JavaScript object.

### Step 4 — CORS

The request origin is checked.

### Step 5 — JWT Middleware

The access token is extracted and verified.

### Step 6 — Role Guard

The user's role is checked.

For order creation:

```text
CUSTOMER
ADMIN
```

are allowed.

### Step 7 — Controller

The order controller:

1. Validates the payload.
2. Validates product IDs.
3. Checks inventory.
4. Decrements stock.
5. Creates the order.
6. Sets initial status to `PENDING`.

### Step 8 — MongoDB

Mongoose persists the order.

### Step 9 — Response

The API returns:

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {}
}
```

---

# 47. Architecture Summary

The D-MartX platform is organized as a modular, stateless REST API backed by MongoDB.

The core architecture is:

```text
                    D-MartX
                       │
                       ▼
                REST API / Express
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Auth        Catalog       Orders
          │            │            │
          │            │            ▼
          │            │        Returns
          │            │
          └────────────┼────────────┐
                       │            │
                       ▼            ▼
                      AI         Support
                       │
                       ▼
                 Gemini API
                 (Optional)
                       │
                       ▼
                    MongoDB
```

### Core Stack

```text
Node.js
   +
Express.js
   +
MongoDB
   +
Mongoose
   +
JWT
   +
bcryptjs
   +
Optional Gemini API
```

### Core Security

```text
bcryptjs
   +
JWT Access Token
   +
JWT Refresh Token
   +
Role Guard
   +
CORS
   +
Environment Secrets
```

### Core Business Modules

```text
Authentication
Product Catalog
Order Lifecycle
Returns & Exchanges
AI Predictive & Demand
Support & Inquiries
```

### Current API Base

```text
http://localhost:5000/api/v1
```

---

# 48. Source of Architecture

This architecture document is derived from the supplied D-MartX REST API documentation, including its documented technology stack, API modules, authentication model, data models, middleware flow, external Gemini integration, security controls, development structure, and current limitations.
Where the supplied documentation does not specify an implementation detail, this document explicitly labels it as a logical/recommended architecture rather than presenting it as an existing project component.

---

## End of Architecture Document
