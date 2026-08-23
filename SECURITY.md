# D-MartX Security Architecture

## 1. Overview

D-MartX is a hyper-local grocery and dark-store supermarket platform
exposing REST APIs for authentication, product catalog management, order
processing, returns/exchanges, support operations, and AI-assisted
demand forecasting.

This document defines the security architecture, controls,
implementation requirements, operational practices, and security
limitations for the D-MartX application.

The security model is based on:

-   Stateless JWT authentication.
-   Short-lived access tokens and longer-lived refresh tokens.
-   Role-based access control (RBAC).
-   Password hashing with `bcryptjs`.
-   Strict request validation.
-   CORS restrictions.
-   Environment-based secret management.
-   Resource-level authorization for customer-owned data.
-   Secure handling of order, payment, return, and support information.
-   Defensive error handling.
-   Auditability of privileged operations.
-   Least-privilege access to administrative and AI/analytics functions.

> **Security note:** This document describes the intended security
> architecture and the controls that should be enforced in production.
> Features explicitly marked as "not implemented" or "recommended" must
> not be considered active security controls until implemented and
> tested.

------------------------------------------------------------------------

## 2. Security Objectives

D-MartX security controls are designed to protect:

1.  **Confidentiality**
    -   Prevent unauthorized access to customer accounts, orders,
        addresses, support requests, and operational data.
2.  **Integrity**
    -   Prevent unauthorized modification of products, prices, stock,
        orders, return decisions, and user privileges.
3.  **Availability**
    -   Reduce the impact of abuse, denial-of-service conditions,
        malformed requests, and dependency failures.
4.  **Authentication**
    -   Ensure users prove their identity before accessing protected
        resources.
5.  **Authorization**
    -   Ensure authenticated users can access only the resources and
        operations permitted by their role and ownership.
6.  **Account Security**
    -   Protect passwords and authentication tokens from unnecessary
        exposure.
7.  **Operational Security**
    -   Restrict administrative capabilities and protect server-side
        secrets.
8.  **Data Protection**
    -   Minimize exposure of personal and transactional information in
        logs, API responses, and error messages.

------------------------------------------------------------------------

## 3. Threat Model

The following threat categories are considered relevant to the D-MartX
API.

  -----------------------------------------------------------------------
  Threat                  Example                 Primary Controls
  ----------------------- ----------------------- -----------------------
  Credential theft        Stolen password or      Password hashing,
                          token                   short-lived access
                                                  tokens, HTTPS

  Brute-force login       Repeated password       Rate limiting, account
                          attempts                monitoring,
                                                  lockout/throttling

  Token theft             Access token captured   HTTPS, short token
                          from an insecure client lifetime, secure client
                                                  storage

  Broken access control   Customer reads another  Ownership checks and
                          customer's order        RBAC

  Privilege escalation    Customer invokes        Role guard and
                          manager endpoint        server-side
                                                  authorization

  Injection               Malicious query or      Mongoose validation,
                          request payload         input validation,
                                                  sanitization

  Data exposure           API returns passwords   Response projection and
                          or secrets              secret filtering

  CSRF                    Unauthorized browser    Token strategy,
                          action                  SameSite protections
                                                  where applicable

  CORS abuse              Unauthorized web origin Explicit origin
                          calling API             allowlist

  Denial of service       Request flooding        Rate limiting, payload
                                                  limits, infrastructure
                                                  controls

  Business logic abuse    Ordering more stock     Server-side inventory
                          than available          validation

  Price manipulation      Client submits          Server-side price
                          arbitrary product price calculation

  IDOR                    Guessing order/return   Authentication plus
                          IDs                     ownership/role checks

  Secret leakage          JWT/database/API keys   Environment secrets and
                          committed to Git        secret scanning

  Dependency              Vulnerable npm package  Dependency scanning and
  vulnerability                                   patching
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Security Architecture

The API follows a layered security model:

``` text
Client
  |
  | HTTPS
  v
CORS / Request Limits / Security Headers
  |
  v
Express JSON Parser
  |
  v
Authentication Middleware
  |
  +---- Public Route ----------------------+
  |                                        |
  +---- Protected Route                    |
           |                               |
           v                               |
      JWT Verification                     |
           |                               |
           v                               |
      Role / Ownership Guard               |
           |                               |
           v                               |
      Request Validation                   |
           |                               |
           v                               |
      Controller                           |
           |                               |
           v                               |
      Mongoose / MongoDB                   |
           |                               |
           v                               |
      Sanitized Response                   |
```

Security should be enforced on the server. Frontend controls, hidden UI
elements, route guards, and disabled buttons are not considered
authorization mechanisms.

------------------------------------------------------------------------

## 5. Transport Security

### 5.1 HTTPS

Production traffic must use HTTPS.

All production API requests should be served over TLS:

``` text
https://<production-host>/api/v1/...
```

Plain HTTP should not be used for authentication or transactional
operations in production.

### 5.2 TLS Requirements

Production infrastructure should:

-   Use a trusted TLS certificate.
-   Disable obsolete TLS protocols.
-   Prefer TLS 1.2 or newer.
-   Redirect HTTP to HTTPS at the reverse proxy/load balancer.
-   Renew certificates automatically where possible.
-   Use secure cipher suites recommended by the hosting platform.
-   Enable HSTS after confirming HTTPS is correctly deployed.

Example security header:

``` http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

HSTS should only be enabled when all relevant production domains are
consistently accessible through HTTPS.

------------------------------------------------------------------------

## 6. Authentication

D-MartX uses stateless JSON Web Tokens (JWT).

### 6.1 Token Types

Two token types are used:

  Token           Purpose                     Default Lifetime
  --------------- --------------------------- ------------------
  Access Token    API authorization           15 minutes
  Refresh Token   Obtain a new access token   7 days

The configured environment variables are:

``` env
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=<different-strong-random-secret>
JWT_REFRESH_EXPIRES_IN=7d
```

The access and refresh secrets must be different.

### 6.2 Access Token

Protected API requests use:

``` http
Authorization: Bearer <ACCESS_TOKEN>
```

The server must:

1.  Extract the bearer token.
2.  Validate its JWT signature.
3.  Verify expiration.
4.  Validate expected claims.
5.  Resolve the authenticated user.
6.  Apply role and ownership authorization.
7.  Reject malformed or invalid tokens.

### 6.3 Refresh Token

Refresh tokens must be accepted only by the refresh endpoint.

``` http
POST /api/v1/auth/refresh
Content-Type: application/json
```

Request:

``` json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

The refresh token must not be accepted as an access token.

### 6.4 JWT Claims

JWT payloads should contain only the minimum information required by the
API.

Recommended claims:

``` json
{
  "sub": "<user-id>",
  "role": "CUSTOMER",
  "iat": 1724392800,
  "exp": 1724393700
}
```

Do not place sensitive information such as:

-   Passwords.
-   Password hashes.
-   Payment information.
-   Full delivery addresses.
-   API keys.
-   Database credentials.
-   Personal secrets.

inside JWT payloads.

JWT payloads are encoded, not encrypted.

------------------------------------------------------------------------

## 7. Refresh Token Security

The current API accepts the refresh token in the request body.
Production implementations should consider stronger session-management
controls.

Recommended controls:

-   Store refresh tokens securely on the client.
-   Never expose refresh tokens in URLs.
-   Never log refresh tokens.
-   Use HTTPS.
-   Rotate refresh tokens when appropriate.
-   Track refresh-token sessions server-side if revocation is required.
-   Revoke sessions after password changes or suspicious activity.
-   Detect refresh-token reuse.
-   Use a short enough lifetime for the application's risk profile.

If refresh tokens are stored in browser cookies, use:

``` text
HttpOnly
Secure
SameSite=Lax or Strict
```

The exact SameSite policy must match the application's deployment
architecture.

------------------------------------------------------------------------

## 8. Password Security

Passwords are hashed using `bcryptjs`.

The documented configuration uses:

``` text
bcrypt salt rounds = 10
```

Passwords must never be stored as plaintext.

Passwords must never be returned through an API response.

Passwords must never be logged.

Example safe user response:

``` json
{
  "_id": "65e2b0f4a8b1c2d3e4f50101",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+919876543210",
  "role": "CUSTOMER"
}
```

The following must never be returned:

``` json
{
  "password": "...",
  "passwordHash": "..."
}
```

### 8.1 Password Requirements

The current minimum length is 6 characters.

For production, a stronger password policy is recommended:

-   Minimum length of at least 8-12 characters.
-   Allow passphrases.
-   Do not require arbitrary character substitutions if they reduce
    usability.
-   Reject passwords found in common/breached-password lists where
    practical.
-   Do not force frequent password changes unless compromise is
    suspected.
-   Never reveal whether a particular email exists during password reset
    flows.

------------------------------------------------------------------------

## 9. Role-Based Access Control

D-MartX defines four roles:

``` text
CUSTOMER
STAFF
MANAGER
ADMIN
```

### 9.1 Customer

Customers can:

-   Access their profile.
-   Browse products.
-   Place orders.
-   View their own orders.
-   File returns/exchanges.
-   View their own return/exchange requests.

Customers must not:

-   Modify products.
-   Modify inventory.
-   Change order statuses.
-   Review platform-wide orders.
-   Access support operator data.
-   Access AI inventory forecasting.
-   Modify user roles.

### 9.2 Staff

Staff can:

-   Review operational orders.
-   Update fulfillment statuses.
-   Manage return/exchange workflow.
-   Review support tickets.

Staff must not:

-   Create or delete products unless explicitly authorized.
-   Access manager-only forecasting functions.
-   Change user roles.
-   Perform unrestricted administrative operations.

### 9.3 Manager

Managers can:

-   Create and update products.
-   Modify stock.
-   Review operational orders.
-   Manage returns/exchanges.
-   Access AI demand forecasting.

Managers should not receive unrestricted administrative privileges.

### 9.4 Admin

Administrators have the broadest privileges, including:

-   Product deletion.
-   Administrative order operations.
-   Return/exchange management.
-   Support operations.
-   User and platform administration.

Administrative access must be limited to trusted personnel.

------------------------------------------------------------------------

## 10. Route Authorization Matrix

  Endpoint                                 CUSTOMER      STAFF    MANAGER      ADMIN
  -------------------------------------- ---------- ---------- ---------- ----------
  `POST /auth/register`                      Public     Public     Public     Public
  `POST /auth/login`                         Public     Public     Public     Public
  `POST /auth/refresh`                     Public\*   Public\*   Public\*   Public\*
  `GET /auth/me`                                Yes        Yes        Yes        Yes
  `GET /products`                               Yes        Yes        Yes        Yes
  `GET /products/:id`                           Yes        Yes        Yes        Yes
  `POST /products`                               No         No        Yes        Yes
  `PUT /products/:id`                            No         No        Yes        Yes
  `DELETE /products/:id`                         No         No         No        Yes
  `POST /orders`                                Yes         No         No        Yes
  `GET /orders/my-orders`                       Yes        Yes        Yes        Yes
  `GET /orders/:id`                         Yes\*\*    Yes\*\*    Yes\*\*        Yes
  `PUT /orders/:id/status`                       No        Yes        Yes        Yes
  `GET /orders`                                  No        Yes        Yes        Yes
  `POST /returns-exchanges`                     Yes         No         No        Yes
  `GET /returns-exchanges/my-requests`          Yes         No         No         No
  `GET /returns-exchanges/:id`              Yes\*\*        Yes        Yes        Yes
  `PUT /returns-exchanges/:id/status`            No        Yes        Yes        Yes
  `GET /ai/forecast`                             No         No        Yes        Yes
  `POST /ai/recommendations`                 Public     Public     Public     Public
  `POST /support`                            Public     Public     Public     Public
  `GET /support`                                 No        Yes       No\*        Yes

`*` The endpoint itself is public but must validate the supplied
token/session material.

`**` The implementation must enforce resource ownership for customers.
Authentication alone is not sufficient.

------------------------------------------------------------------------

## 11. Object-Level Authorization

Object-level authorization is mandatory for customer-owned resources.

For example, a customer requesting:

``` http
GET /api/v1/orders/<ORDER_ID>
```

must not automatically gain access merely because the order ID exists.

The server must verify that:

``` text
order.user === authenticatedUser._id
```

unless the authenticated user's role is explicitly permitted to access
the resource.

The same principle applies to:

-   Orders.
-   Return/exchange tickets.
-   Customer profile data.
-   Support information where applicable.

This protects against Insecure Direct Object Reference (IDOR) and Broken
Object Level Authorization (BOLA).

------------------------------------------------------------------------

## 12. User Registration Security

`POST /api/v1/auth/register` must:

1.  Validate all required fields.
2.  Normalize email addresses where appropriate.
3.  Check email uniqueness.
4.  Hash the password before persistence.
5.  Never trust a client-supplied role.
6.  Always create public registrations as `CUSTOMER`.
7.  Avoid returning sensitive database fields.
8.  Apply registration rate limiting.
9.  Log security-relevant events without logging passwords or tokens.

A request such as:

``` json
{
  "name": "Attacker",
  "email": "attacker@example.com",
  "password": "Password@123",
  "role": "ADMIN"
}
```

must never create an administrator account.

The server must ignore or reject client-supplied privileged roles.

------------------------------------------------------------------------

## 13. Login Security

`POST /api/v1/auth/login` should:

-   Validate input.
-   Normalize email consistently.
-   Compare the supplied password using bcrypt.
-   Return a generic authentication failure message.
-   Issue short-lived access tokens.
-   Issue refresh tokens according to the session policy.
-   Never reveal whether the email or password was incorrect separately.

Recommended error:

``` json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Avoid responses such as:

``` text
Email does not exist
```

because they enable account enumeration.

------------------------------------------------------------------------

## 14. Brute-Force Protection

The current API documentation does not specify rate limiting.

Production deployment should implement rate limiting, especially for:

-   Login.
-   Registration.
-   Refresh token requests.
-   Support submission.
-   Order creation.
-   Return/exchange creation.

Example conceptual policy:

``` text
Authentication:
  Per-IP rate limit
  Per-account/email throttling
  Progressive delay after repeated failures
```

Rate limits should be configurable and enforced at both the application
and infrastructure layers where appropriate.

Do not rely solely on IP-based rate limiting because many legitimate
users may share an IP address.

------------------------------------------------------------------------

## 15. Input Validation

Every endpoint must validate untrusted input.

Validation must cover:

-   Data type.
-   Required fields.
-   String length.
-   Numeric ranges.
-   Enum values.
-   ObjectId format.
-   Array sizes.
-   URL formats where URLs are accepted.
-   Date formats.
-   Nested objects.

Example:

``` json
{
  "quantity": -100
}
```

must be rejected.

Similarly:

``` json
{
  "orderStatus": "MAKE_ADMIN"
}
```

must be rejected because it is not an allowed enum value.

------------------------------------------------------------------------

## 16. MongoDB and Mongoose Security

D-MartX uses MongoDB through Mongoose.

### 16.1 Query Safety

Do not directly trust client-provided MongoDB operators.

Reject or sanitize unexpected objects such as:

``` json
{
  "email": {
    "$ne": null
  }
}
```

Use schema validation and safe query construction.

### 16.2 ObjectId Validation

Endpoints accepting IDs should validate MongoDB ObjectIds before
database operations.

Expected format:

``` text
24 hexadecimal characters
```

Malformed IDs should produce a controlled client error rather than an
unhandled exception.

### 16.3 Database Credentials

MongoDB credentials must never be hardcoded in source code.

Use environment configuration or a managed secret store.

Example:

``` env
MONGODB_URI=<secret>
```

### 16.4 Database Network Security

Production MongoDB should:

-   Require authentication.
-   Restrict network access.
-   Use private networking where available.
-   Avoid exposing the database directly to the public internet.
-   Use TLS for database connections where supported/required.
-   Restrict application database permissions using least privilege.
-   Enable backups and recovery procedures.

------------------------------------------------------------------------

## 17. Mass Assignment Protection

Do not blindly pass `req.body` into Mongoose update operations.

Unsafe pattern:

``` js
await Product.findByIdAndUpdate(req.params.id, req.body);
```

A safer approach explicitly selects permitted fields:

``` js
const updates = {
  name: req.body.name,
  category: req.body.category,
  regularPrice: req.body.regularPrice,
  discountPrice: req.body.discountPrice,
  stock: req.body.stock,
  unit: req.body.unit,
  image: req.body.image,
  description: req.body.description,
  isFeatured: req.body.isFeatured
};
```

For user records, fields such as `role`, password hashes, internal
flags, and administrative properties must never be mass-assigned from
ordinary customer requests.

------------------------------------------------------------------------

## 18. Product and Price Integrity

The client must not be considered authoritative for pricing.

The documented order payload contains:

``` json
{
  "product": "<PRODUCT_ID>",
  "quantity": 2,
  "price": 32
}
```

For production, the server should retrieve the current product price
from the database and calculate the order total itself.

Do not trust:

``` text
items[].price
totalAmount
```

from the client without server-side verification.

Recommended flow:

``` text
Client
  |
  | product ID + quantity
  v
API
  |
  +--> Load product
  +--> Verify product exists
  +--> Verify stock
  +--> Determine authoritative price
  +--> Calculate line total
  +--> Calculate order total
  +--> Create order
  +--> Decrement/reserve stock
```

This prevents price tampering.

------------------------------------------------------------------------

## 19. Inventory Integrity

Order placement must be protected against race conditions and stock
manipulation.

A secure implementation should:

-   Validate stock server-side.
-   Prevent negative stock.
-   Atomically decrement inventory where possible.
-   Prevent two concurrent orders from consuming the same unit of stock.
-   Use database transactions where multiple writes must remain
    consistent.
-   Restore stock if a transaction is rolled back.
-   Define clear behavior for cancelled orders.

For example, this business rule must always hold:

``` text
stock >= 0
```

An order should never be allowed to create a negative stock quantity.

------------------------------------------------------------------------

## 20. Order Security

Orders contain sensitive customer and transaction information.

### 20.1 Creation

Only authorized customer/admin roles may create orders.

The server must determine the authenticated customer from the access
token rather than trusting a client-supplied `user` field.

### 20.2 Retrieval

Customers may access only their own orders.

Staff, managers, and administrators may access orders according to
operational permissions.

### 20.3 Status Changes

Order status changes must be restricted to:

``` text
STAFF
MANAGER
ADMIN
```

The server should also enforce valid state transitions.

Example:

``` text
PENDING
  -> CONFIRMED
  -> CANCELLED

CONFIRMED
  -> PACKED
  -> CANCELLED

PACKED
  -> OUT_FOR_DELIVERY

OUT_FOR_DELIVERY
  -> DELIVERED
```

The exact state machine should be enforced by business logic rather than
allowing arbitrary transitions.

------------------------------------------------------------------------

## 21. Payment Security

The documented API supports:

``` text
COD
ONLINE
UPI
```

The API must not accept raw card numbers, CVVs, PINs, or other sensitive
payment authentication data unless a compliant payment provider
integration specifically requires it.

Recommended architecture:

``` text
D-MartX API
    |
    v
Payment Gateway
    |
    v
Gateway-hosted payment processing
```

D-MartX should store only the minimum payment information required for
order processing.

Never store:

-   CVV.
-   Card PIN.
-   Full payment credentials.
-   Payment gateway secret keys in source code.

Payment status must be updated based on trusted server-to-server gateway
verification or signed webhook events, not solely on a client request.

------------------------------------------------------------------------

## 22. Return and Exchange Security

Return/exchange requests must verify:

1.  The order exists.
2.  The authenticated customer owns the order, unless privileged
    staff/admin access is used.
3.  The product belongs to the order.
4.  The order is eligible for return/exchange.
5.  The request has not already been completed or rejected in a
    conflicting state.
6.  The requested quantity is valid.
7.  Any applicable return window is satisfied.

Customers must not be able to submit a return for another customer's
order by changing `orderId`.

Status changes must be restricted to:

``` text
STAFF
MANAGER
ADMIN
```

------------------------------------------------------------------------

## 23. Support Ticket Security

Public support submission accepts:

``` text
name
email
subject
message
```

These fields are untrusted user input.

The API should:

-   Validate length.
-   Validate email format.
-   Restrict payload size.
-   Sanitize or safely render message content.
-   Apply rate limiting.
-   Prevent HTML/script execution in operator dashboards.
-   Avoid logging complete sensitive messages unnecessarily.

Support ticket listing is restricted to authorized operators.

------------------------------------------------------------------------

## 24. Cross-Site Scripting (XSS)

The API should treat all client-provided strings as untrusted.

Potentially dangerous fields include:

-   Product names.
-   Product descriptions.
-   Support subjects.
-   Support messages.
-   Customer names.
-   Delivery addresses.

The backend should validate input and the frontend/operator interface
must escape output.

If HTML is not a business requirement, do not permit arbitrary HTML.

Never render untrusted content using unsafe HTML injection mechanisms.

------------------------------------------------------------------------

## 25. NoSQL Injection Protection

MongoDB queries must not accept arbitrary operators from client input.

Use:

-   Schema validation.
-   Explicit field selection.
-   Type checking.
-   Input sanitization.
-   Safe query construction.

Do not directly merge arbitrary request objects into MongoDB filters or
update documents.

------------------------------------------------------------------------

## 26. HTTP Security Headers

Production Express deployments should use appropriate security headers,
commonly through a maintained security middleware such as Helmet.

Recommended headers include:

``` text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Strict-Transport-Security
X-Frame-Options
Permissions-Policy
```

The exact `Content-Security-Policy` must be tailored to the frontend
architecture.

For a pure JSON API, unnecessary browser-facing functionality should be
minimized.

------------------------------------------------------------------------

## 27. CORS Security

The API documents CORS protection using:

``` env
CLIENT_URL=<allowed-client-origin>
```

Production CORS configuration should use an explicit allowlist.

Do not use:

``` js
origin: "*"
```

for authenticated APIs when credentials or sensitive browser
interactions are involved.

Recommended behavior:

``` text
Allowed:
https://app.example.com

Rejected:
https://attacker.example.com
```

CORS is not an authentication mechanism. It only controls browser-origin
behavior. Server-side authorization remains mandatory.

------------------------------------------------------------------------

## 28. CSRF Protection

If access tokens are sent using the `Authorization` header and are not
automatically attached by browsers, traditional cookie-based CSRF
exposure is reduced.

If authentication is moved to cookies, CSRF protections must be
evaluated and implemented.

Possible controls include:

-   SameSite cookies.
-   CSRF tokens.
-   Origin/Referer validation for sensitive operations.
-   Strict CORS policy.

------------------------------------------------------------------------

## 29. Request Body and Payload Limits

The API should impose request-size limits.

Example:

``` js
app.use(express.json({ limit: "1mb" }));
```

The exact value should reflect legitimate application requirements.

Small limits reduce the risk of oversized payload attacks.

Additional limits should be applied to:

-   Array lengths.
-   String lengths.
-   Nested object depth where appropriate.
-   Support message size.
-   Product description size.
-   Search query length.

------------------------------------------------------------------------

## 30. File Upload Security

The current implementation does not implement multipart file uploads.

Product images are referenced through external URLs.

If file uploads are added later, implement:

-   MIME-type validation.
-   File-extension validation.
-   Maximum file size.
-   Malware scanning where appropriate.
-   Randomized server-side filenames.
-   Storage outside executable directories.
-   Access-controlled object storage.
-   Image re-encoding to remove malicious payloads/metadata where
    appropriate.
-   Content-Disposition controls.
-   Signed URLs for private assets.

Never trust the client-provided filename or MIME type alone.

------------------------------------------------------------------------

## 31. External Image URL Security

Product image URLs are external input.

If the backend fetches external URLs in the future, protect against
SSRF.

Do not allow arbitrary internal targets such as:

``` text
http://localhost
http://127.0.0.1
http://169.254.169.254
```

or private network ranges.

Prefer storing trusted CDN/object-storage URLs when possible.

------------------------------------------------------------------------

## 32. AI and Gemini API Security

D-MartX may integrate with Google Gemini through:

``` env
GEMINI_API_KEY=<secret>
```

The Gemini API key must:

-   Exist only on the server.
-   Never be sent to browsers.
-   Never be committed to Git.
-   Never be included in API responses.
-   Never be logged.
-   Be rotated periodically or after suspected exposure.

AI-generated content must not be treated as an authoritative security or
transactional decision without server-side validation.

For inventory forecasting, AI output should be treated as a
recommendation.

It must not directly:

-   Grant user privileges.
-   Change prices without validation.
-   Delete products.
-   Authorize refunds.
-   Change payment status.
-   Override inventory integrity rules.

------------------------------------------------------------------------

## 33. AI Prompt Injection

If user-controlled product descriptions, support messages, or other
content is passed to an AI model, treat it as untrusted input.

AI prompts should clearly separate:

``` text
System instructions
Trusted application data
Untrusted user content
```

Never allow user-controlled text to redefine security policies or
application permissions.

The application must validate AI output before using it in business
logic.

------------------------------------------------------------------------

## 34. Secrets Management

Sensitive configuration must be stored outside source code.

Examples:

``` env
MONGODB_URI=<secret>
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
GEMINI_API_KEY=<secret>
CLIENT_URL=<allowed-origin>
```

`.env` files must not be committed to Git.

Recommended `.gitignore` entries:

``` gitignore
.env
.env.*
!.env.example
```

An example configuration may contain placeholders:

``` env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=
CLIENT_URL=
```

Production secrets should preferably be stored in a dedicated secret
manager.

------------------------------------------------------------------------

## 35. Secret Rotation

Secrets should be rotated when:

-   A credential may have been exposed.
-   A developer leaves the project with access.
-   A production secret appears in source control.
-   A token-signing key is suspected to be compromised.
-   A third-party API provider recommends rotation.
-   Periodic security policy requires rotation.

After JWT signing-key rotation, existing tokens may need to be
invalidated depending on the rotation strategy.

------------------------------------------------------------------------

## 36. Logging Security

Logs are useful for debugging and incident response but can become a
source of data leakage.

Never log:

-   Passwords.
-   Password hashes.
-   Access tokens.
-   Refresh tokens.
-   JWT secrets.
-   MongoDB credentials.
-   Gemini API keys.
-   Payment credentials.
-   Full sensitive customer information unless operationally necessary.

Safe example:

``` text
LOGIN_FAILED user=<internal-id> ip=<masked-or-policy-compliant-value>
```

Avoid:

``` text
LOGIN password=Password@123
```

### 36.1 Security Events

Recommended events to record:

-   Successful login.
-   Failed login.
-   Account registration.
-   Token refresh failures.
-   Privilege changes.
-   Product creation/update/deletion.
-   Stock changes.
-   Order status changes.
-   Return/exchange status changes.
-   Administrative actions.
-   Suspicious repeated requests.

Logs should include timestamps and sufficient context for investigation
without exposing secrets.

------------------------------------------------------------------------

## 37. Error Handling

Production errors should not reveal:

-   Stack traces.
-   Database connection strings.
-   File system paths.
-   JWT secrets.
-   Internal service credentials.
-   MongoDB queries.
-   Implementation details unnecessary to the client.

Use controlled responses:

``` json
{
  "success": false,
  "message": "Internal server error"
}
```

Detailed diagnostic information should be written to secure server logs
rather than returned to clients.

------------------------------------------------------------------------

## 38. HTTP Status Security Policy

The API uses standard HTTP status codes.

  Status   Security Interpretation
  -------- ----------------------------------
  `200`    Successful operation
  `201`    Resource successfully created
  `400`    Invalid or malformed request
  `401`    Missing/invalid authentication
  `403`    Authenticated but not authorized
  `404`    Resource unavailable
  `409`    Resource conflict
  `429`    Rate limit exceeded
  `500`    Unexpected server failure

A `401` response should be used for authentication failure.

A `403` response should be used when the identity is known but lacks
permission.

------------------------------------------------------------------------

## 39. Resource Enumeration Protection

APIs that expose identifiers should avoid unnecessarily revealing
information about whether a resource exists.

For highly sensitive resources, consider returning consistent responses
where appropriate.

For customer-owned resources:

``` text
GET /orders/<other-customer-order-id>
```

should not reveal private order information.

The authorization layer should determine whether the authenticated user
can access the resource.

------------------------------------------------------------------------

## 40. Search Security

Product search accepts:

``` text
GET /api/v1/products?search=<query>
```

Search inputs should have:

-   Maximum length.
-   Safe string handling.
-   Controlled regex behavior.
-   Protection against expensive database queries.

Avoid constructing unbounded regular expressions directly from user
input.

Where possible, use indexed search mechanisms.

------------------------------------------------------------------------

## 41. Pagination Security

Pagination parameters should be constrained.

Example:

``` text
page >= 1
limit >= 1
limit <= configured maximum
```

Do not allow:

``` text
limit=100000000
```

because large result sets can cause excessive memory and database load.

------------------------------------------------------------------------

## 42. API Rate Limiting

The current documentation states that rate limiting is not specified.

This is a production security gap.

Recommended rate-limit classes:

``` text
Global API:
  Moderate request limit

Authentication:
  Strict limit

Registration:
  Strict limit

Support:
  Moderate/strict limit

Orders:
  Moderate limit

AI:
  Strict limit due to external API cost
```

Use distributed rate limiting if the application runs across multiple
instances.

------------------------------------------------------------------------

## 43. Abuse Protection for AI Endpoints

AI endpoints can generate external API cost.

`POST /api/v1/ai/recommendations` is public according to the current API
specification.

This endpoint should be protected against abuse through:

-   Rate limiting.
-   Payload limits.
-   Maximum cart-item count.
-   Input validation.
-   Caching where safe.
-   Abuse monitoring.
-   Optional authenticated-user quotas.

The public endpoint should never expose the Gemini API key.

------------------------------------------------------------------------

## 44. Authorization Middleware

A recommended middleware chain is:

``` text
request
  |
  v
security headers
  |
  v
CORS
  |
  v
body-size limit
  |
  v
authentication
  |
  v
role authorization
  |
  v
resource ownership
  |
  v
validation
  |
  v
controller
```

Each layer should have one responsibility.

------------------------------------------------------------------------

## 45. Role Guard Implementation

Conceptually:

``` js
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "User role is not authorized"
      });
    }

    next();
  };
};
```

The role must come from a trusted authentication context and not from
the request body.

------------------------------------------------------------------------

## 46. Ownership Guard Implementation

For customer-owned resources, role checks are not enough.

Conceptually:

``` js
if (
  req.user.role === "CUSTOMER" &&
  order.user.toString() !== req.user._id.toString()
) {
  return res.status(403).json({
    success: false,
    message: "You are not authorized to access this order"
  });
}
```

A centralized authorization service is preferable as the application
grows.

------------------------------------------------------------------------

## 47. Database Transactions

Operations involving multiple dependent writes should use transactions
when consistency is required.

For example, order placement may involve:

``` text
1. Verify products
2. Verify stock
3. Calculate totals
4. Create order
5. Decrement stock
```

If step 5 fails after step 4 succeeds, the system can become
inconsistent.

A MongoDB transaction can provide atomicity where the deployment
supports it.

------------------------------------------------------------------------

## 48. Concurrency Controls

Concurrency-sensitive operations include:

-   Inventory decrement.
-   Order creation.
-   Cancellation.
-   Return completion.
-   Refund state changes.

Use atomic database operations, transactions, or optimistic concurrency
controls where appropriate.

Do not assume that checking a value and updating it in separate
unrestricted operations is race-condition safe.

------------------------------------------------------------------------

## 49. Security of Administrative Endpoints

Administrative endpoints must receive stronger protection.

Recommended controls:

-   Strong authentication.
-   Short session lifetime.
-   MFA for administrator accounts.
-   Strict role checks.
-   Audit logs.
-   Administrative IP/network restrictions where appropriate.
-   Security alerts for unusual activity.
-   Separate administrative frontend access.
-   Least-privilege service accounts.

MFA is strongly recommended for:

``` text
ADMIN
MANAGER
```

especially in production.

------------------------------------------------------------------------

## 50. API Documentation Security

API documentation must not contain real:

-   Passwords.
-   JWT tokens.
-   API keys.
-   Production database URLs.
-   Customer information.
-   Payment credentials.

Example tokens should be clearly fake:

``` text
<ACCESS_TOKEN>
```

The example credentials in documentation must not be valid production
credentials.

------------------------------------------------------------------------

## 51. Dependency Security

The Node.js dependency tree should be regularly scanned.

Recommended practices:

``` bash
npm audit
```

and automated dependency update/scanning tools.

Security maintenance should include:

-   Removing unused packages.
-   Pinning or controlling dependency versions.
-   Reviewing high-severity vulnerabilities.
-   Updating Express, Mongoose, bcryptjs, JWT libraries, and other
    security-sensitive packages.
-   Monitoring transitive dependencies.

Do not blindly deploy vulnerable dependencies without evaluating the
risk.

------------------------------------------------------------------------

## 52. Source-Control Security

Repository security requirements:

-   Never commit `.env`.
-   Never commit JWT secrets.
-   Never commit database passwords.
-   Never commit Gemini keys.
-   Never commit production tokens.
-   Enable secret scanning where available.
-   Review pull requests.
-   Protect the main branch.
-   Require CI checks before production deployment.

If a secret is committed, deleting the commit is not enough. The secret
must be revoked and rotated.

------------------------------------------------------------------------

## 53. CI/CD Security

Production CI/CD should include:

``` text
1. Dependency installation
2. Automated tests
3. Linting
4. Dependency vulnerability scan
5. Secret scan
6. Build
7. Security checks
8. Deployment
```

Production secrets should be injected by the deployment environment
rather than stored in the repository.

Deployments should be traceable to a commit or release version.

------------------------------------------------------------------------

## 54. Environment Separation

Maintain separate environments:

``` text
Development
Testing/Staging
Production
```

Do not reuse production secrets in development.

Do not connect development builds to production databases unless
explicitly required and tightly controlled.

Recommended configuration:

``` text
.env.development
.env.test
.env.production
```

Production secrets should preferably be managed outside local files.

------------------------------------------------------------------------

## 55. MongoDB Backup Security

Backups may contain complete customer and transaction data.

Backups should:

-   Be encrypted at rest.
-   Have restricted access.
-   Use retention policies.
-   Be tested for restoration.
-   Be separated from application credentials.
-   Be protected from accidental public exposure.

A backup is part of the security boundary and must be treated as
sensitive data.

------------------------------------------------------------------------

## 56. Personal Data Protection

D-MartX may process:

-   Name.
-   Email address.
-   Phone number.
-   Delivery address.
-   Order history.
-   Support messages.
-   Return/exchange details.

The application should follow applicable privacy and data-protection
laws.

Recommended principles:

-   Data minimization.
-   Purpose limitation.
-   Access control.
-   Retention limits.
-   Secure deletion where required.
-   Privacy notices.
-   Controlled internal access.
-   Protection of exports and backups.

------------------------------------------------------------------------

## 57. Data Minimization in API Responses

Return only the fields required by the requesting client.

For example, product listing endpoints do not need to return internal
database or operational metadata that the frontend does not use.

Likewise, staff endpoints should not unnecessarily expose customer
information unrelated to the operational task.

Use explicit database projections where practical.

------------------------------------------------------------------------

## 58. Security Testing

Before production release, test at minimum:

### Authentication

-   Invalid credentials.
-   Missing credentials.
-   Expired access tokens.
-   Malformed JWTs.
-   Invalid refresh tokens.
-   Expired refresh tokens.
-   Token algorithm confusion attempts.

### Authorization

-   Customer accessing another customer's order.
-   Customer updating order status.
-   Staff deleting products.
-   Customer accessing AI forecast.
-   Manager performing admin-only operations.
-   User attempting to modify their own role.

### Validation

-   Missing fields.
-   Wrong data types.
-   Invalid ObjectIds.
-   Negative quantities.
-   Negative prices.
-   Invalid enum values.
-   Oversized strings.
-   Oversized arrays.

### Injection

-   NoSQL injection.
-   XSS payloads.
-   Malicious regular expressions.
-   Unexpected MongoDB operators.

### Business Logic

-   Ordering more stock than available.
-   Concurrent orders against the same stock.
-   Client-side price manipulation.
-   Duplicate returns.
-   Invalid order state transitions.
-   Unauthorized refund state changes.

### Infrastructure

-   CORS validation.
-   TLS configuration.
-   Security headers.
-   Rate limiting.
-   Request-size limits.
-   Error-message leakage.

------------------------------------------------------------------------

## 59. Security Test Cases

Example authorization test:

``` text
Given:
  Customer A owns Order A

When:
  Customer B requests GET /orders/Order-A

Then:
  Customer B must not receive Order A.
```

Example price-integrity test:

``` text
Given:
  Product price = ₹100

When:
  Client submits price = ₹1

Then:
  Server calculates the order using the authoritative product price.
```

Example role-escalation test:

``` text
Given:
  User role = CUSTOMER

When:
  User submits:
  {
    "role": "ADMIN"
  }

Then:
  User remains CUSTOMER.
```

------------------------------------------------------------------------

## 60. Security Monitoring

Production systems should monitor:

-   Repeated failed logins.
-   Large numbers of requests from one source.
-   Unusual administrative activity.
-   Frequent authorization failures.
-   High AI endpoint usage.
-   Repeated invalid ObjectIds.
-   Sudden inventory changes.
-   Large volumes of support submissions.
-   Repeated return requests.
-   Database errors.
-   Authentication failures.

Alerts should be configured for significant anomalies.

------------------------------------------------------------------------

## 61. Incident Response

If a security incident occurs:

### Step 1: Contain

-   Disable compromised credentials.
-   Revoke affected sessions/tokens where possible.
-   Restrict suspicious traffic.
-   Isolate affected services.

### Step 2: Investigate

-   Review application logs.
-   Review authentication events.
-   Review database activity.
-   Identify affected users and resources.
-   Determine initial access vector.

### Step 3: Eradicate

-   Remove malicious changes.
-   Patch vulnerabilities.
-   Rotate compromised secrets.
-   Remove unauthorized accounts.

### Step 4: Recover

-   Restore services safely.
-   Verify database integrity.
-   Monitor for recurrence.

### Step 5: Notify

Follow applicable legal, contractual, and organizational
breach-notification requirements.

------------------------------------------------------------------------

## 62. Secret Compromise Procedure

If any of the following are exposed:

``` text
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
MONGODB_URI
GEMINI_API_KEY
Payment credentials
Production access credentials
```

immediately:

1.  Revoke or rotate the secret.
2.  Determine where it was exposed.
3.  Search repository history and deployment logs.
4.  Invalidate affected credentials/tokens where applicable.
5.  Review access logs.
6.  Remove the secret from future source revisions.
7.  Document the incident.

Never assume that deleting the visible secret from the latest commit is
sufficient.

------------------------------------------------------------------------

## 63. Production Security Checklist

### Authentication

-   [ ] HTTPS enabled.
-   [ ] JWT access secret is strong and random.
-   [ ] JWT refresh secret is separate and strong.
-   [ ] Access tokens expire quickly.
-   [ ] Refresh tokens are protected.
-   [ ] Passwords are bcrypt-hashed.
-   [ ] Login rate limiting is enabled.
-   [ ] Registration rate limiting is enabled.
-   [ ] Account enumeration is minimized.
-   [ ] MFA is enabled for privileged users where possible.

### Authorization

-   [ ] Every protected endpoint uses authentication middleware.
-   [ ] Role guards are enforced server-side.
-   [ ] Customer-owned resources enforce ownership.
-   [ ] Client-supplied roles are ignored/rejected.
-   [ ] Administrative operations require explicit authorization.
-   [ ] Order state transitions are validated.
-   [ ] Return/refund operations are authorization-controlled.

### Data Protection

-   [ ] Sensitive fields are excluded from API responses.
-   [ ] Passwords are never logged.
-   [ ] Tokens are never logged.
-   [ ] Payment credentials are not stored.
-   [ ] Database credentials are protected.
-   [ ] Backups are encrypted.
-   [ ] Sensitive data retention is defined.

### API Hardening

-   [ ] CORS allowlist is configured.
-   [ ] Security headers are enabled.
-   [ ] Request body limits are enabled.
-   [ ] Pagination limits are enforced.
-   [ ] Input validation is implemented.
-   [ ] NoSQL injection protections are implemented.
-   [ ] XSS protections are considered.
-   [ ] Rate limiting is enabled.
-   [ ] Error responses do not expose internals.

### Database

-   [ ] MongoDB authentication is enabled.
-   [ ] Database is not publicly exposed.
-   [ ] Least-privilege database credentials are used.
-   [ ] Database TLS is configured where appropriate.
-   [ ] Backups are encrypted.
-   [ ] Restore procedures are tested.

### Secrets

-   [ ] `.env` is excluded from Git.
-   [ ] Production secrets are stored in a secret manager where
    possible.
-   [ ] Secrets are rotated after compromise.
-   [ ] Secret scanning is enabled.
-   [ ] API keys are server-side only.

### AI

-   [ ] Gemini key is server-side only.
-   [ ] AI endpoints have rate limits.
-   [ ] AI payloads have size limits.
-   [ ] AI output is validated.
-   [ ] AI cannot directly override authorization or financial controls.

### Operations

-   [ ] Security events are logged.
-   [ ] Logs do not contain secrets.
-   [ ] Monitoring is enabled.
-   [ ] Dependency scanning is enabled.
-   [ ] Incident response procedures exist.
-   [ ] Security testing is performed before production release.

------------------------------------------------------------------------

## 64. Current Security Limitations

Based on the current API documentation, the following areas are not
explicitly implemented or specified and should be considered security
gaps until verified in the codebase:

1.  Rate limiting is not specified.
2.  MFA is not specified.
3.  Refresh-token revocation/rotation is not specified.
4.  Security headers are not specified.
5.  CSRF strategy is not specified.
6.  Detailed audit logging is not specified.
7.  Payment gateway verification is not specified.
8.  Explicit order-state transition validation is not specified.
9.  Atomic inventory reservation/transaction behavior is not fully
    specified.
10. Explicit object-level authorization behavior is not fully specified.
11. Database network restrictions are not specified.
12. Backup encryption and restoration procedures are not specified.
13. Dependency scanning is not specified.
14. Secret scanning is not specified.
15. AI endpoint abuse controls are not specified.
16. Administrative MFA is not specified.
17. Production TLS configuration is not specified.
18. Security monitoring and alerting are not specified.

These should be treated as implementation tasks rather than assumed
protections.

------------------------------------------------------------------------

## 65. Recommended Security Priority

### Critical

Implement before production:

1.  HTTPS/TLS.
2.  Strong secret management.
3.  Object-level authorization for orders and returns.
4.  Server-side order price calculation.
5.  Atomic inventory handling.
6.  Strict RBAC.
7.  Login and sensitive-endpoint rate limiting.
8.  Secure error handling.
9.  Database network protection.
10. Protection against mass assignment and NoSQL injection.

### High

Implement next:

1.  Security headers.
2.  Refresh-token rotation/revocation.
3.  Admin/manager MFA.
4.  Audit logging.
5.  Dependency and secret scanning.
6.  Security monitoring.
7.  Payment gateway verification.
8.  Valid order/return state machines.
9.  Payload and pagination limits.

### Medium

Improve as the platform grows:

1.  Centralized authorization service.
2.  Advanced anomaly detection.
3.  Automated security regression tests.
4.  Advanced AI abuse controls.
5.  Formal data-retention policies.
6.  Regular penetration testing.

------------------------------------------------------------------------

## 66. Secure Development Guidelines

Developers working on D-MartX should follow these rules:

1.  Never trust client input.
2.  Never trust frontend authorization.
3.  Never trust client-provided prices.
4.  Never trust client-provided roles.
5.  Never expose secrets.
6.  Never log passwords or tokens.
7.  Always validate authorization at the API.
8.  Always validate ownership for customer resources.
9.  Use least privilege.
10. Keep dependencies patched.
11. Prefer explicit field selection over unrestricted object updates.
12. Use transactions for consistency-sensitive operations.
13. Return only necessary data.
14. Fail securely.
15. Add security tests for every privileged endpoint.

------------------------------------------------------------------------

## 67. Security Review Before Release

A production release should not be approved until the security owner
verifies:

``` text
[ ] Authentication tested
[ ] Authorization tested
[ ] Ownership checks tested
[ ] Input validation tested
[ ] Injection testing completed
[ ] Rate limiting verified
[ ] HTTPS verified
[ ] CORS verified
[ ] Security headers verified
[ ] Secrets verified
[ ] Database access restricted
[ ] Error leakage tested
[ ] Dependency scan completed
[ ] Secret scan completed
[ ] Audit logging verified
[ ] Backup/recovery verified
[ ] Incident response contacts documented
```

------------------------------------------------------------------------

## 68. Security Responsibility

Security is a shared responsibility across:

-   Backend developers.
-   Frontend developers.
-   Database administrators.
-   DevOps/infrastructure engineers.
-   Security reviewers.
-   Product owners.
-   Store operations.
-   Administrators.

No single middleware or library can provide complete application
security.

The D-MartX security posture depends on correctly implementing
authentication, authorization, validation, secure infrastructure, secure
development practices, monitoring, and operational controls together.

------------------------------------------------------------------------

## 69. Related Documentation

The following project documentation should be maintained alongside this
file:

-   `README.md` --- Project setup and architecture.
-   `API.md` / API documentation --- REST endpoint reference.
-   `SECURITY.md` --- This security architecture and operational
    security guide.
-   `.env.example` --- Non-secret environment configuration template.
-   Deployment documentation --- Production infrastructure and TLS
    configuration.
-   Database documentation --- MongoDB schema, indexing, backups, and
    recovery.
-   Incident response documentation --- Security incident handling
    procedures.

------------------------------------------------------------------------

## 70. Security Contact

Security vulnerabilities should be reported privately to the project
maintainers rather than disclosed publicly before remediation.

Do not include passwords, API keys, access tokens, or other secrets in
vulnerability reports.

For production deployments, maintain a dedicated security contact such
as:

``` text
security@example.com
```

Replace the placeholder with the project's actual security contact
before publishing this document.

------------------------------------------------------------------------

## 71. Final Security Principle

The D-MartX API must follow the principle:

> **Authenticate every protected request, authorize every sensitive
> operation, validate every untrusted input, minimize every data
> response, and never trust the client with security-critical
> decisions.**

Security controls must be enforced server-side and continuously tested
as the application evolves.
