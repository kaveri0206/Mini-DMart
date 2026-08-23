# D-MartX REST API Documentation

## Table of Contents

1. [API Overview](##1-api-overview)
2. [Base URL](##2-base-url)
3. [Authentication](##3-authentication)
4. [Standard Response Format](##4-standard-response-format)
5. [Error Handling](##5-error-handling)
6. [API Endpoints](##6-api-endpoints)
   - [Authentication Module](##1-authentication-module)
     - [POST /api/v1/auth/register](##post-apiv1authregister)
     - [POST /api/v1/auth/login](##post-apiv1authlogin)
     - [POST /api/v1/auth/refresh](##post-apiv1authrefresh)
     - [GET /api/v1/auth/me](##get-apiv1authme)
   - [Product Catalog Module](##2-product-catalog-module)
     - [GET /api/v1/products](##get-apiv1products)
     - [GET /api/v1/products/:id](##get-apiv1productsid)
     - [POST /api/v1/products](##post-apiv1products)
     - [PUT /api/v1/products/:id](##put-apiv1productsid)
     - [DELETE /api/v1/products/:id](##delete-apiv1productsid)
   - [Order Lifecycle Module](##3-order-lifecycle-module)
     - [POST /api/v1/orders](##post-apiv1orders)
     - [GET /api/v1/orders/my-orders](##get-apiv1ordersmy-orders)
     - [GET /api/v1/orders/:id](##get-apiv1ordersid)
     - [PUT /api/v1/orders/:id/status](##put-apiv1ordersidstatus)
     - [GET /api/v1/orders](##get-apiv1orders)
   - [Returns & Exchanges Module](##4-returns--exchanges-module)
     - [POST /api/v1/returns-exchanges](##post-apiv1returns-exchanges)
     - [GET /api/v1/returns-exchanges/my-requests](##get-apiv1returns-exchangesmy-requests)
     - [GET /api/v1/returns-exchanges/:id](##get-apiv1returns-exchangesid)
     - [PUT /api/v1/returns-exchanges/:id/status](##put-apiv1returns-exchangesidstatus)
   - [AI Predictive & Demand Module](##5-ai-predictive--demand-module)
     - [GET /api/v1/ai/forecast](##get-apiv1aiforecast)
     - [POST /api/v1/ai/recommendations](##post-apiv1airecommendations)
   - [Support & Inquiries Module](##6-support--inquiries-module)
     - [POST /api/v1/support](##post-apiv1support)
     - [GET /api/v1/support](##get-apiv1support)
7. [Request Validation & Data Types](##7-request-validation--data-types)
8. [Pagination, Filtering & Sorting](##8-pagination-filtering--sorting)
9. [File Uploads](##9-file-uploads)
10. [External API Integrations](##10-external-api-integrations)
11. [API Security](##11-api-security)
12. [End-to-End Workflow Examples](##12-end-to-end-workflow-examples)
13. [API Usage Examples](##13-api-usage-examples)
14. [API Development Notes](##14-api-development-notes)
15. [API Versioning](##15-api-versioning)
16. [API Limitations](##16-api-limitations)
17. [Related Documentation](##17-related-documentation)

## 1. API Overview

The **D-MartX REST API** powers the hyper-local grocery and dark-store supermarket platform. It provides JSON endpoints for customer authentication, catalog discovery, dark-store inventory reservation, order placement lifecycle, automated return/exchange processing, customer support desk ticketing, and AI demand forecasting.

- **Architecture**: Stateless RESTful HTTP API built with Express.js and MongoDB Mongoose ODM.
- **Protocol**: HTTP/1.1 and HTTPS.
- **Request & Response Format**: `application/json`.
- **API Versioning**: URL Path Prefixing (`/api/v1`) with root-level aliased routes (e.g. `/auth`, `/products`, `/orders`, `/returns-exchanges`, `/ai`, `/support`) mounted for compatibility.
- **Conventions**:
  - Standard REST verbs (`GET`, `POST`, `PUT`, `DELETE`).
  - Standardized JSON responses with a boolean `success` indicator.
  - Date/time formats serialized in ISO 8601 UTC strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
  - MongoDB 24-character hexadecimal `ObjectId` format for resource primary keys.

## 2. Base URL

- **Development URL**: `http://localhost:5000/api/v1`


- **Production URL**: Production URL: Not specified in the repository. (Configured at runtime via host environment variables `CLIENT_URL` / `VITE_API_BASE_URL`).

## 3. Authentication

The API utilizes stateless JSON Web Tokens (JWT) for authentication and access control.

- **Authentication Mechanism**: Two-tier JWT architecture:
  - **Access Token**: Short-lived (configured via `JWT_ACCESS_EXPIRES_IN=15m`), verified using `JWT_ACCESS_SECRET`.
  - **Refresh Token**: Extended-lifetime (configured via `JWT_REFRESH_EXPIRES_IN=7d`), verified using `JWT_REFRESH_SECRET`.
- **Authorization Header**:
  ```
  Authorization: Bearer <ACCESS_TOKEN>

  ```
- **Roles & Permissions**:
  - `CUSTOMER`: Standard customer account created on registration (can place orders, view order history, file return/exchange tickets).
  - `STAFF`: Store fulfillment operator (can update order dispatch states, manage return inspections, read support tickets).
  - `MANAGER`: Store supervisor (can update catalog products, modify stock levels, view AI inventory forecast analytics).
  - `ADMIN`: Full administrative superuser access across all endpoints.
- **Middleware Handlers**:
  - `authMiddleware`: Extracts and validates the Bearer token from the `Authorization` header.
  - `roleGuard` / role authorization check: Validates that `req.user.role` matches the route's allowed roles.

## 4. Standard Response Format

### Success Response
```
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}

```

### Error Response
```
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Detailed error string or validation breakdown"
}

```

## 5. Error Handling

### HTTP Status Code Mapping

| **Status Code** | **Meaning**      | **When It Occurs**                   |
| --------------- | ---------------- | ------------------------------------ |
| `200 OK`        | Success          | Successful read or update operation. |
| `201 Created`   | Resource Created |                                      |

Successful document creation (User, Product, Order, Return, Support).

| `400 Bad Request`  | Validation Error       | Required field missing, invalid format, or insufficient inventory stock. |
| ------------------ | ---------------------- | ------------------------------------------------------------------------ |
| `401 Unauthorized` | Authentication Failure |                                                                          |

Missing, invalid, or expired JWT bearer token.

| `403 Forbidden`             | Access Denied        | Authenticated user lacks required role permissions for the endpoint. |
| --------------------------- | -------------------- | -------------------------------------------------------------------- |
| `404 Not Found`             | Resource Absent      | Requested entity ID was not found in the database.                   |
| `409 Conflict`              | Unique Key Collision | Email already registered during account creation.                    |
| `500 Internal Server Error` | Server Failure       | Unhandled runtime exception or database connection issue.            |

## 6. API Endpoints

### 1. Authentication Module

#### POST /api/v1/auth/register

Registers a new customer user account, hashes password using `bcryptjs`, and returns auth tokens.

- **Description**: Creates a new user record with `CUSTOMER` role.
- **Authentication**:
  - Required: No
  - Required role(s): None
  - Required permissions: None
- **Request Headers**:
  | **Header**     | **Required** | **Description**    |
  | -------------- | ------------ | ------------------ |
  | `Content-Type` | Yes          | `application/json` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password@123",
    "phone": "+919876543210"
  }

  ```
- **Validation Rules**:
  - `name`: Required, String.
  - `email`: Required, String, valid email format, unique.
  - `password`: Required, String, minimum length 6.
  - `phone`: Optional, String.
- **Success Response (****`201 Created`****)**:
  ```
  {
    "success": true,
    "message": "User registered successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65e2b0f4a8b1c2d3e4f50101",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+919876543210",
      "role": "CUSTOMER",
      "createdAt": "2026-08-23T06:00:00.000Z"
    }
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Please provide name, email, and password"}`
  - `409 Conflict`: `{"success": false, "message": "Email is already registered"}`
- **Status Codes**:
  | **Status** | **Meaning**                  |
  | ---------- | ---------------------------- |
  | `201`      | User registered successfully |
  | `400`      | Missing required fields      |
  | `409`      | Email already exists         |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Doe","email":"jane.doe@example.com","password":"Password@123","phone":"+919876543210"}'

  ```

#### POST /api/v1/auth/login

Authenticates an existing user and returns access and refresh tokens.

- **Description**: Verifies email and password against stored bcrypt hashes.
- **Authentication**:
  - Required: No
  - Required role(s): None
  - Required permissions: None
- **Request Headers**:
  | **Header**     | **Required** | **Description**    |
  | -------------- | ------------ | ------------------ |
  | `Content-Type` | Yes          | `application/json` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "email": "jane.doe@example.com",
    "password": "Password@123"
  }

  ```
- **Validation Rules**:
  - `email`: Required, String.
  - `password`: Required, String.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "message": "Login successful",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65e2b0f4a8b1c2d3e4f50101",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+919876543210",
      "role": "CUSTOMER"
    }
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Please provide email and password"}`
  - `401 Unauthorized`: `{"success": false, "message": "Invalid email or password"}`
- **Status Codes**:
  | **Status** | **Meaning**               |
  | ---------- | ------------------------- |
  | `200`      | Login successful          |
  | `400`      | Missing credentials       |
  | `401`      | Invalid email or password |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"jane.doe@example.com","password":"Password@123"}'

  ```

#### POST /api/v1/auth/refresh

Generates a new access token using a valid refresh token.

- **Description**: Issues replacement access token for ongoing sessions.
- **Authentication**:
  - Required: No (Token validated in body payload)
  - Required role(s): None
  - Required permissions: None
- **Request Headers**:
  | **Header**     | **Required** | **Description**    |
  | -------------- | ------------ | ------------------ |
  | `Content-Type` | Yes          | `application/json` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }

  ```
- **Validation Rules**:
  - `refreshToken`: Required, String.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }

  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Invalid or expired refresh token"}`
- **Status Codes**:
  | **Status** | **Meaning**     |
  | ---------- | --------------- |
  | `200`      | Token refreshed |
  | `401`      | Unauthorized    |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/auth/refresh" \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'

  ```

#### GET /api/v1/auth/me

Retrieves current profile information for the authenticated user.

- **Description**: Returns authenticated user document.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`
  - Required permissions: Authenticated profile read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "user": {
      "_id": "65e2b0f4a8b1c2d3e4f50101",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+919876543210",
      "role": "CUSTOMER"
    }
  }

  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Not authorized to access this route"}`
- **Status Codes**:
  | **Status** | **Meaning**              |
  | ---------- | ------------------------ |
  | `200`      | Profile retrieved        |
  | `401`      | Missing or invalid token |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/auth/me" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

### 2. Product Catalog Module

#### GET /api/v1/products

Fetches items in the catalog with category filtering, search, and pagination.

- **Description**: Retrieves grocery catalog products.
- **Authentication**:
  - Required: No
  - Required role(s): None
  - Required permissions: None
- **Request Headers**: None.
- **Path Parameters**: None.
- **Query Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**                       |
  | ------------- | -------- | ------------ | ------------------------------------- |
  | `category`    | String   | No           | Filter by category name               |
  | `search`      | String   | No           | Search query for name and description |
  | `featured`    | Boolean  | No           | Filter featured products              |
  | `page`        | Integer  | No           | Page number (Default: `1`)            |
  | `limit`       | Integer  | No           | Page size (Default: `20`)             |
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "count": 1,
    "total": 9,
    "page": 1,
    "pages": 1,
    "data": [
      {
        "_id": "65e2b10aa8b1c2d3e4f50201",
        "name": "Amul Fresh Toned Milk 1L",
        "category": "Dairy & Breakfast",
        "regularPrice": 34,
        "discountPrice": 32,
        "stock": 50,
        "unit": "1 L",
        "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
        "description": "Pasteurized toned milk packed with essential nutrients and freshness.",
        "isFeatured": true,
        "createdAt": "2026-08-23T06:10:00.000Z"
      }
    ]
  }

  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{"success": false, "message": "Server Error"}`
- **Status Codes**:
  | **Status** | **Meaning**                       |
  | ---------- | --------------------------------- |
  | `200`      | Products retrieved successfully   |
  | `500`      | Database or internal server error |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/products?category=Dairy%20%26%20Breakfast"

  ```

#### GET /api/v1/products/:id

Retrieves detailed information for a single product.

- **Description**: Returns one SKU record by MongoDB ID.
- **Authentication**:
  - Required: No
  - Required role(s): None
  - Required permissions: None
- **Request Headers**: None.
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**               |
  | ------------- | -------- | ------------ | ----------------------------- |
  | `id`          | String   | Yes          | MongoDB 24-character ObjectId |
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "data": {
      "_id": "65e2b10aa8b1c2d3e4f50201",
      "name": "Amul Fresh Toned Milk 1L",
      "category": "Dairy & Breakfast",
      "regularPrice": 34,
      "discountPrice": 32,
      "stock": 50,
      "unit": "1 L",
      "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
      "description": "Pasteurized toned milk packed with essential nutrients and freshness.",
      "isFeatured": true
    }
  }

  ```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Product not found"}`
- **Status Codes**:
  | **Status** | **Meaning**       |
  | ---------- | ----------------- |
  | `200`      | Product found     |
  | `404`      | Product not found |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/products/65e2b10aa8b1c2d3e4f50201"

  ```

#### POST /api/v1/products

Creates a new SKU in the catalog.

- **Description**: Inserts a new product document.
- **Authentication**:
  - Required: Yes
  - Required role(s): `ADMIN`, `MANAGER`


  - Required permissions: Product catalog write
- **Request Headers**:
  | **Header**      | **Required** | **Description** |
  | --------------- | ------------ | --------------- |
  | `Authorization` | Yes          |                 |
  `Bearer <ACCESS_TOKEN>`


  | `Content-Type` | Yes | `application/json` |
  | -------------- | --- | ------------------ |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "name": "Tata Sampann Unpolished Toor Dal 1kg",
    "category": "Staples & Grains",
    "regularPrice": 160,
    "discountPrice": 142,
    "stock": 45,
    "unit": "1 kg",
    "image": "https://images.unsplash.com/photo-1585998066891-64af9e7a8657?auto=format&fit=crop&w=600&q=80",
    "description": "Unpolished split yellow pigeon peas packed with natural protein and fiber.",
    "isFeatured": true
  }

  ```
- **Validation Rules**:
  - `name`: Required, String.
  - `category`: Required, String.
  - `regularPrice`: Required, Number, positive.
  - `discountPrice`: Required, Number, $\le$ `regularPrice`.
  - `stock`: Optional, Number, default `0`.
  - `unit`: Required, String.
  - `image`: Optional, String URL.
  - `isFeatured`: Optional, Boolean, default `false`.
- **Success Response (****`201 Created`****)**:
  ```
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "_id": "65e2b10aa8b1c2d3e4f50206",
      "name": "Tata Sampann Unpolished Toor Dal 1kg",
      "category": "Staples & Grains",
      "regularPrice": 160,
      "discountPrice": 142,
      "stock": 45,
      "unit": "1 kg",
      "image": "https://images.unsplash.com/photo-1585998066891-64af9e7a8657?auto=format&fit=crop&w=600&q=80",
      "description": "Unpolished split yellow pigeon peas packed with natural protein and fiber.",
      "isFeatured": true
    }
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Validation Error"}`
  - `403 Forbidden`: `{"success": false, "message": "User role is not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**          |
  | ---------- | -------------------- |
  | `201`      | Product created      |
  | `400`      | Invalid product data |
  | `403`      | Role unauthorized    |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/products" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name":"Tata Sampann Unpolished Toor Dal 1kg","category":"Staples & Grains","regularPrice":160,"discountPrice":142,"stock":45,"unit":"1 kg"}'

  ```

#### PUT /api/v1/products/:id

Updates fields of an existing product.

- **Description**: Modifies catalog details and stock levels.
- **Authentication**:
  - Required: Yes
  - Required role(s): `ADMIN`, `MANAGER`
  - Required permissions: Product catalog update
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
  | `Content-Type`  | Yes          | `application/json`      |
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**               |
  | ------------- | -------- | ------------ | ----------------------------- |
  | `id`          | String   | Yes          | MongoDB 24-character ObjectId |
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "discountPrice": 139,
    "stock": 50
  }

  ```
- **Validation Rules**:
  - Fields must conform to product schema types.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "message": "Product updated successfully",
    "data": {
      "_id": "65e2b10aa8b1c2d3e4f50206",
      "name": "Tata Sampann Unpolished Toor Dal 1kg",
      "discountPrice": 139,
      "stock": 50
    }
  }

  ```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Product not found"}`
- **Status Codes**:
  | **Status** | **Meaning**       |
  | ---------- | ----------------- |
  | `200`      | Product updated   |
  | `404`      | Product not found |
- **cURL Example**:
  ```
  curl -X PUT "http://localhost:5000/api/v1/products/65e2b10aa8b1c2d3e4f50206" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"discountPrice":139,"stock":50}'

  ```

#### DELETE /api/v1/products/:id

Deletes a SKU from the catalog.

- **Description**: Permanently removes product document.
- **Authentication**:
  - Required: Yes
  - Required role(s): `ADMIN`
  - Required permissions: Product catalog delete
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**               |
  | ------------- | -------- | ------------ | ----------------------------- |
  | `id`          | String   | Yes          | MongoDB 24-character ObjectId |
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "message": "Product deleted successfully"
  }

  ```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Product not found"}`
  - `403 Forbidden`: `{"success": false, "message": "User role is not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**       |
  | ---------- | ----------------- |
  | `200`      | Product deleted   |
  | `403`      | Role unauthorized |
  | `404`      | Product not found |
- **cURL Example**:
  ```
  curl -X DELETE "http://localhost:5000/api/v1/products/65e2b10aa8b1c2d3e4f50206" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

### 3. Order Lifecycle Module

#### POST /api/v1/orders

Creates a customer order, validates stock availability, and sets status to `PENDING`.

- **Description**: Processes checkout, records order line items, and links to customer.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`, `ADMIN`


  - Required permissions: Order placement
- **Request Headers**:
  | **Header**      | **Required** | **Description** |
  | --------------- | ------------ | --------------- |
  | `Authorization` | Yes          |                 |
  `Bearer <ACCESS_TOKEN>`


  | `Content-Type` | Yes | `application/json` |
  | -------------- | --- | ------------------ |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "items": [
      {
        "product": "65e2b10aa8b1c2d3e4f50201",
        "quantity": 2,
        "price": 32
      }
    ],
    "totalAmount": 64,
    "deliveryAddress": "Flat 402, Sunshine Heights, MG Road, Pune - 411001",
    "paymentMethod": "COD"
  }

  ```
- **Validation Rules**:
  - `items`: Required, Array ($\ge 1$ element).
  - `items[].product`: Required, valid ObjectId.
  - `items[].quantity`: Required, Integer $\ge 1$.
  - `items[].price`: Required, Number $\ge 0$.
  - `totalAmount`: Required, Number.
  - `deliveryAddress`: Required, String.
  - `paymentMethod`: Optional, String enum [`COD`, `ONLINE`, `UPI`].
- **Success Response (****`201 Created`****)**:
  ```
  {
    "success": true,
    "message": "Order placed successfully",
    "data": {
      "_id": "65e2b200a8b1c2d3e4f50301",
      "user": "65e2b0f4a8b1c2d3e4f50101",
      "items": [
        {
          "product": "65e2b10aa8b1c2d3e4f50201",
          "quantity": 2,
          "price": 32
        }
      ],
      "totalAmount": 64,
      "deliveryAddress": "Flat 402, Sunshine Heights, MG Road, Pune - 411001",
      "orderStatus": "PENDING",
      "paymentStatus": "PENDING",
      "createdAt": "2026-08-23T06:20:00.000Z"
    }
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Insufficient stock for product Amul Fresh Toned Milk 1L"}`
- **Status Codes**:
  | **Status** | **Meaning**                           |
  | ---------- | ------------------------------------- |
  | `201`      | Order placed                          |
  | `400`      | Insufficient stock or invalid payload |
  | `401`      | Unauthorized                          |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/orders" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"items":[{"product":"65e2b10aa8b1c2d3e4f50201","quantity":2,"price":32}],"totalAmount":64,"deliveryAddress":"Flat 402, MG Road, Pune"}'

  ```

#### GET /api/v1/orders/my-orders

Retrieves the complete order history and real-time statuses for the authenticated user.

- **Description**: Returns all orders placed by the token holder.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`


  - Required permissions: Order history read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "65e2b200a8b1c2d3e4f50301",
        "totalAmount": 64,
        "orderStatus": "CONFIRMED",
        "paymentStatus": "PAID",
        "createdAt": "2026-08-23T06:20:00.000Z",
        "items": [
          {
            "product": {
              "_id": "65e2b10aa8b1c2d3e4f50201",
              "name": "Amul Fresh Toned Milk 1L",
              "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"
            },
            "quantity": 2,
            "price": 32
          }
        ]
      }
    ]
  }

  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**      |
  | ---------- | ---------------- |
  | `200`      | Orders retrieved |
  | `401`      | Unauthorized     |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/orders/my-orders" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

#### GET /api/v1/orders/:id

Fetches individual order breakdown by ID.

- **Description**: Returns order line items and shipping information.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`
  - Required permissions: Specific order read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**               |
  | ------------- | -------- | ------------ | ----------------------------- |
  | `id`          | String   | Yes          | MongoDB 24-character ObjectId |
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "data": {
      "_id": "65e2b200a8b1c2d3e4f50301",
      "user": "65e2b0f4a8b1c2d3e4f50101",
      "totalAmount": 64,
      "orderStatus": "CONFIRMED",
      "deliveryAddress": "Flat 402, Sunshine Heights, Pune - 411001"
    }
  }

  ```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Order not found"}`
- **Status Codes**:
  | **Status** | **Meaning**     |
  | ---------- | --------------- |
  | `200`      | Order found     |
  | `404`      | Order not found |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/orders/65e2b200a8b1c2d3e4f50301" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

#### PUT /api/v1/orders/:id/status

Updates the lifecycle status of a customer order.

- **Description**: Transitions order through fulfillment states.
- **Authentication**:
  - Required: Yes
  - Required role(s): `STAFF`, `MANAGER`, `ADMIN`


  - Required permissions: Order status management
- **Request Headers**:
  | **Header**      | **Required** | **Description** |
  | --------------- | ------------ | --------------- |
  | `Authorization` | Yes          |                 |
  `Bearer <ACCESS_TOKEN>`


  | `Content-Type` | Yes | `application/json` |
  | -------------- | --- | ------------------ |
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**    |
  | ------------- | -------- | ------------ | ------------------ |
  | `id`          | String   | Yes          | Target Order `_id` |
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "orderStatus": "OUT_FOR_DELIVERY",
    "paymentStatus": "PAID"
  }

  ```
- **Validation Rules**:
  - `orderStatus`: Required, String enum [`PENDING`, `CONFIRMED`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`].
  - `paymentStatus`: Optional, String enum [`PENDING`, `PAID`, `REFUNDED`].
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "message": "Order status updated successfully",
    "data": {
      "_id": "65e2b200a8b1c2d3e4f50301",
      "orderStatus": "OUT_FOR_DELIVERY",
      "paymentStatus": "PAID"
    }
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Invalid order status value"}`
- **Status Codes**:
  | **Status** | **Meaning**          |
  | ---------- | -------------------- |
  | `200`      | Order status updated |
  | `400`      | Invalid status value |
  | `403`      | Unauthorized role    |
- **cURL Example**:
  ```
  curl -X PUT "http://localhost:5000/api/v1/orders/65e2b200a8b1c2d3e4f50301/status" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"orderStatus":"OUT_FOR_DELIVERY","paymentStatus":"PAID"}'

  ```

#### GET /api/v1/orders

Lists all orders platform-wide.

- **Description**: Store-wide operational order listing.
- **Authentication**:
  - Required: Yes
  - Required role(s): `STAFF`, `MANAGER`, `ADMIN`
  - Required permissions: Platform order review
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "65e2b200a8b1c2d3e4f50301",
        "user": {
          "name": "Jane Doe",
          "email": "jane.doe@example.com"
        },
        "totalAmount": 64,
        "orderStatus": "OUT_FOR_DELIVERY"
      }
    ]
  }

  ```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "User role is not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**       |
  | ---------- | ----------------- |
  | `200`      | Orders listed     |
  | `403`      | Role unauthorized |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/orders" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

### 4. Returns & Exchanges Module

#### POST /api/v1/returns-exchanges

Initiates a return or replacement ticket for an item from a delivered order.

- **Description**: Registers a customer return or exchange claim.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`, `ADMIN`
  - Required permissions: Return filing
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
  | `Content-Type`  | Yes          | `application/json`      |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "orderId": "65e2b200a8b1c2d3e4f50301",
    "productId": "65e2b10aa8b1c2d3e4f50201",
    "type": "RETURN",
    "reason": "Damaged packaging on delivery",
    "pickupAddress": "Flat 402, Sunshine Heights, MG Road, Pune - 411001"
  }

  ```
- **Validation Rules**:
  - `orderId`: Required, valid Order ObjectId.
  - `productId`: Required, valid Product ObjectId.
  - `type`: Required, enum [`RETURN`, `EXCHANGE`].
  - `reason`: Required, String.
  - `pickupAddress`: Required, String.
- **Success Response (****`201 Created`****)**:
  ```
  {
    "success": true,
    "message": "Return/Exchange request registered",
    "data": {
      "_id": "65e2b300a8b1c2d3e4f50401",
      "orderId": "65e2b200a8b1c2d3e4f50301",
      "type": "RETURN",
      "status": "REQUESTED",
      "createdAt": "2026-08-23T06:30:00.000Z"
    }
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Please provide orderId, productId, and reason"}`
- **Status Codes**:
  | **Status** | **Meaning**    |
  | ---------- | -------------- |
  | `201`      | Request filed  |
  | `400`      | Missing fields |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/returns-exchanges" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"orderId":"65e2b200a8b1c2d3e4f50301","productId":"65e2b10aa8b1c2d3e4f50201","type":"RETURN","reason":"Damaged packaging","pickupAddress":"Flat 402, Pune"}'

  ```

#### GET /api/v1/returns-exchanges/my-requests

Retrieves return and exchange tickets created by the authenticated customer.

- **Description**: Returns all filed claims for the current user.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`
  - Required permissions: Own return requests read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "data": [
      {
        "_id": "65e2b300a8b1c2d3e4f50401",
        "type": "RETURN",
        "status": "APPROVED",
        "reason": "Damaged packaging on delivery"
      }
    ]
  }

  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**        |
  | ---------- | ------------------ |
  | `200`      | Requests retrieved |
  | `401`      | Unauthorized       |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/returns-exchanges/my-requests" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

#### GET /api/v1/returns-exchanges/:id

Retrieves individual return claim record.

- **Description**: Returns claim status and details.
- **Authentication**:
  - Required: Yes
  - Required role(s): `CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`
  - Required permissions: Return record read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**               |
  | ------------- | -------- | ------------ | ----------------------------- |
  | `id`          | String   | Yes          | MongoDB 24-character ObjectId |
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "data": {
      "_id": "65e2b300a8b1c2d3e4f50401",
      "status": "APPROVED"
    }
  }

  ```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Return ticket not found"}`
- **Status Codes**:
  | **Status** | **Meaning**             |
  | ---------- | ----------------------- |
  | `200`      | Return ticket found     |
  | `404`      | Return ticket not found |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/returns-exchanges/65e2b300a8b1c2d3e4f50401" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

#### PUT /api/v1/returns-exchanges/:id/status

Updates ticket status for warehouse dispatch or customer refund.

- **Description**: Approves, rejects, or completes refund processing.
- **Authentication**:
  - Required: Yes
  - Required role(s): `STAFF`, `MANAGER`, `ADMIN`
  - Required permissions: Return workflow management
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
  | `Content-Type`  | Yes          | `application/json`      |
- **Path Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**            |
  | ------------- | -------- | ------------ | -------------------------- |
  | `id`          | String   | Yes          | Target Return Ticket `_id` |
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "status": "COMPLETED",
    "resolutionNotes": "Item inspected; refund issued."
  }

  ```
- **Validation Rules**:
  - `status`: Required, enum [`REQUESTED`, `APPROVED`, `REJECTED`, `IN_TRANSIT`, `COMPLETED`].
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "message": "Return ticket updated successfully"
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Invalid status value"}`
- **Status Codes**:
  | **Status** | **Meaning**       |
  | ---------- | ----------------- |
  | `200`      | Status updated    |
  | `400`      | Invalid status    |
  | `403`      | Role unauthorized |
- **cURL Example**:
  ```
  curl -X PUT "http://localhost:5000/api/v1/returns-exchanges/65e2b300a8b1c2d3e4f50401/status" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"status":"COMPLETED","resolutionNotes":"Refund processed"}'

  ```

### 5. AI Predictive & Demand Module

#### GET /api/v1/ai/forecast

Computes stock velocity and generates restock suggestions.

- **Description**: Analyzes dark-store consumption velocity and low-stock items.
- **Authentication**:
  - Required: Yes
  - Required role(s): `MANAGER`, `ADMIN`
  - Required permissions: Analytics and forecasting read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**: None.
- **Query Parameters**:
  | **Parameter** | **Type** | **Required** | **Description**                          |
  | ------------- | -------- | ------------ | ---------------------------------------- |
  | `darkStoreId` | String   | No           | Target store code (Default: `DS-MUM-01`) |
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "darkStoreId": "DS-MUM-01",
    "recommendations": [
      {
        "productId": "65e2b10aa8b1c2d3e4f50201",
        "productName": "Amul Fresh Toned Milk 1L",
        "currentStock": 8,
        "reorderThreshold": 15,
        "suggestedRestock": 50,
        "urgency": "HIGH"
      }
    ]
  }

  ```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "User role is not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**        |
  | ---------- | ------------------ |
  | `200`      | Forecast generated |
  | `403`      | Role unauthorized  |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/ai/forecast?darkStoreId=DS-MUM-01" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

#### POST /api/v1/ai/recommendations

Generates related product pairings based on user's current shopping cart items.

- **Description**: Produces recommendation array based on catalog category affinities.
- **Authentication**:
  - Required: No
  - Required role(s): None
  - Required permissions: None
- **Request Headers**:
  | **Header**     | **Required** | **Description**    |
  | -------------- | ------------ | ------------------ |
  | `Content-Type` | Yes          | `application/json` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "cartItemIds": [
      "65e2b10aa8b1c2d3e4f50201"
    ]
  }

  ```
- **Validation Rules**:
  - `cartItemIds`: Required, Array of strings/ObjectIds.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "recommendedItems": [
      {
        "_id": "65e2b10aa8b1c2d3e4f50202",
        "name": "Epigamia Greek Blueberry Yogurt 90g",
        "category": "Dairy & Breakfast",
        "discountPrice": 45
      }
    ]
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "cartItemIds array required"}`
- **Status Codes**:
  | **Status** | **Meaning**              |
  | ---------- | ------------------------ |
  | `200`      | Recommendations returned |
  | `400`      | Invalid payload          |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/ai/recommendations" \
    -H "Content-Type: application/json" \
    -d '{"cartItemIds":["65e2b10aa8b1c2d3e4f50201"]}'

  ```

### 6. Support & Inquiries Module

#### POST /api/v1/support

Submits a customer inquiry or support ticket.

- **Description**: Records incoming messages and customer requests.
- **Authentication**:
  - Required: No
  - Required role(s): None
  - Required permissions: None
- **Request Headers**:
  | **Header**     | **Required** | **Description**    |
  | -------------- | ------------ | ------------------ |
  | `Content-Type` | Yes          | `application/json` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**:
  ```
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "subject": "Delivery Inquiry",
    "message": "When will express delivery resume in Pune?"
  }

  ```
- **Validation Rules**:
  - `name`: Required, String.
  - `email`: Required, String, valid email format.
  - `subject`: Required, String.
  - `message`: Required, String.
- **Success Response (****`201 Created`****)**:
  ```
  {
    "success": true,
    "message": "Support ticket created. Our team will contact you shortly."
  }

  ```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "All fields are required"}`
- **Status Codes**:
  | **Status** | **Meaning**            |
  | ---------- | ---------------------- |
  | `201`      | Support ticket created |
  | `400`      | Missing fields         |
- **cURL Example**:
  ```
  curl -X POST "http://localhost:5000/api/v1/support" \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Doe","email":"jane.doe@example.com","subject":"Delivery","message":"When will express delivery resume?"}'

  ```

#### GET /api/v1/support

Lists submitted support tickets for operator review.

- **Description**: Retrieves support tickets list.
- **Authentication**:
  - Required: Yes
  - Required role(s): `STAFF`, `ADMIN`
  - Required permissions: Support desk read
- **Request Headers**:
  | **Header**      | **Required** | **Description**         |
  | --------------- | ------------ | ----------------------- |
  | `Authorization` | Yes          | `Bearer <ACCESS_TOKEN>` |
- **Path Parameters**: None.
- **Query Parameters**: None.
- **Request Body**: None.
- **Success Response (****`200 OK`****)**:
  ```
  {
    "success": true,
    "data": [
      {
        "_id": "65e2b400a8b1c2d3e4f50501",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "subject": "Delivery Inquiry",
        "status": "OPEN",
        "createdAt": "2026-08-23T06:45:00.000Z"
      }
    ]
  }

  ```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "User role is not authorized"}`
- **Status Codes**:
  | **Status** | **Meaning**       |
  | ---------- | ----------------- |
  | `200`      | Tickets listed    |
  | `403`      | Role unauthorized |
- **cURL Example**:
  ```
  curl -X GET "http://localhost:5000/api/v1/support" \
    -H "Authorization: Bearer <ACCESS_TOKEN>"

  ```

## 7. Request Validation & Data Types

- **User Model Attributes**:
  - `name`: String, required, trimmed.
  - `email`: String, required, unique, validated via standard email regex.
  - `password`: String, required, minimum length 6 (salted and hashed with bcrypt).
  - `phone`: String, optional.
  - `role`: String enum [`CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`], default `CUSTOMER`.
- **Product Model Attributes**:
  - `name`: String, required, trimmed, text indexed.
  - `category`: String, required, indexed.
  - `regularPrice`: Number, required, non-negative.
  - `discountPrice`: Number, required, non-negative, $\le$ `regularPrice`.
  - `stock`: Number, integer $\ge 0$, default `0`.
  - `unit`: String, required (e.g. `1 kg`, `500 g`, `1 L`, `6 pcs`).
  - `image`: String, URL format.
  - `isFeatured`: Boolean, default `false`.
- **Order Model Attributes**:
  - `user`: ObjectId, ref `User`, required.
  - `items`: Array of subdocuments containing `product` (ObjectId), `quantity` ($\ge 1$), and `price` ($\ge 0$).
  - `totalAmount`: Number, required.
  - `deliveryAddress`: String, required.
  - `orderStatus`: String enum [`PENDING`, `CONFIRMED`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`], default `PENDING`.
  - `paymentStatus`: String enum [`PENDING`, `PAID`, `REFUNDED`], default `PENDING`.

## 8. Pagination, Filtering & Sorting

### Supported Query Parameters (`GET /api/v1/products`)

- `page`: Target page index (Default: `1`).
- `limit`: Number of items returned per page (Default: `20`).
- `category`: Exact match category filter.
- `search`: Substring search evaluated against product `name` and `description`.
- `featured`: Filter by `isFeatured: true`.

### Pagination Response Structure
```
{
  "count": 1,
  "total": 9,
  "page": 1,
  "pages": 1
}

```

## 9. File Uploads

Not specified in the current implementation. Product assets are referenced via external image URLs stored in the MongoDB document.

## 10. External API Integrations

### 1. Google Gemini API (Optional)

- **Service Name**: Google Generative AI (Gemini)
- **Purpose**: Dynamic demand velocity estimation and recipe pairing suggestions.
- **Authentication**: Provided via `GEMINI_API_KEY` in environment variables.
- **API Endpoints Used**: Generative text prediction.
- **Environment Variables**: `GEMINI_API_KEY`
- **Error Handling**: Graceful fallback to localized category affinity logic when API key is unconfigured.

## 11. API Security

- **Password Cryptography**: Passwords salted and hashed using `bcryptjs` with salt round factor of 10.
- **JWT Authorization**: Cryptographic signing of access and refresh tokens via distinct secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
- **CORS Protection**: Restricted to allowed client origins configured in `CLIENT_URL`.
- **Secrets Management**: Sensitive credentials isolated in environment configuration files (`.env`).

For detailed platform security architecture, see [SECURITY](#./SECURITY.md).

## 12. End-to-End Workflow Examples

### Customer Registration, Catalog Exploration & Order Workflow
```
1. Customer Account Registration / Login
   Client ──> POST /api/v1/auth/login ──> Returns Access Token & Refresh Token

2. Catalog Exploration
   Client ──> GET /api/v1/products?category=Dairy%20%26%20Breakfast ──> Returns Catalog Items

3. Order Placement & Inventory Reservation
   Client ──> POST /api/v1/orders (Bearer Token) ──> Decrements Stock & Creates PENDING Order

4. Status Tracking
   Client ──> GET /api/v1/orders/my-orders ──> Returns Active Order Tracking Timeline

```

## 13. API Usage Examples

### End-to-End Order Creation Flow via cURL
```
# Step 1: Authenticate Customer
LOGIN_RES=$(curl -s -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@dmartx.demo","password":"Password@123"}')

TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Step 2: Fetch Products
curl -s -X GET "http://localhost:5000/api/v1/products?category=Dairy%20%26%20Breakfast"

# Step 3: Place Order with Bearer Token
curl -X POST "http://localhost:5000/api/v1/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "65e2b10aa8b1c2d3e4f50201",
        "quantity": 1,
        "price": 32
      }
    ],
    "totalAmount": 32,
    "deliveryAddress": "Flat 101, Palm Grove, Mumbai - 400001",
    "paymentMethod": "COD"
  }'

```

## 14. API Development Notes

- **Route Architecture**: Routes are located under `server/src/routes/` and separated by domain module (`auth.routes.js`, `product.routes.js`, `order.routes.js`, `returnExchange.routes.js`, `ai.routes.js`, `support.routes.js`).
- **Controller Logic**: Request parsing, validation, database operations, and HTTP responses are managed in `server/src/controllers/`.
- **Middleware Flow**:
  1. `express.json()` body parser.
  2. CORS header verification against `CLIENT_URL`.
  3. Route protection via `authMiddleware` and `roleGuard`.
  4. Global error handling middleware.

## 15. API Versioning

All current API endpoints are routed under the `/api/v1` prefix. Root alias routes are maintained to ensure backwards compatibility across client updates.

## 16. API Limitations

- Rate limiting: Not specified in the current implementation.
- Multipart form uploads: Not implemented; image assets are referenced via external URLs.
- WebSockets: Not specified in the current implementation.
