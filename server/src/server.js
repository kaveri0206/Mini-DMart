require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/dmartx';

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',

  // Production Vercel frontend
  'https://mini-d-mart-three.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (Postman, curl, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);

      return callback(new Error('Not allowed by CORS'));
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  })
);

/*
 * Handle CORS preflight requests.
 */
app.options('*', cors());

/* =========================================================
   CORE MIDDLEWARES
   ========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   DATABASE CONNECTION
   ========================================================= */

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[Server] MongoDB connected successfully');
  })
  .catch((err) => {
    console.error(
      '[Server] MongoDB connection error:',
      err.message
    );
  });

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'D-MartX API Server is running smoothly',
  });
});

/* =========================================================
   SAFE ROUTE MOUNT HELPER
   ========================================================= */

const safeRouteMount = (path, routeFile) => {
  try {
    const router = require(routeFile);

    app.use(path, router);

    console.log(
      `[Route Loaded] ${path} -> ${routeFile}`
    );
  } catch (err) {
    console.warn(
      `[Route Notice] Could not load ${routeFile}:`,
      err.message
    );
  }
};

/* =========================================================
   API ROUTES
   ========================================================= */

/*
 * Authentication
 */
safeRouteMount(
  '/api/v1/auth',
  './routes/auth.routes'
);

safeRouteMount(
  '/auth',
  './routes/auth.routes'
);

/*
 * Products
 */
safeRouteMount(
  '/api/v1/products',
  './routes/product.routes'
);

safeRouteMount(
  '/products',
  './routes/product.routes'
);

/*
 * Orders
 */
safeRouteMount(
  '/api/v1/orders',
  './routes/order.routes'
);

safeRouteMount(
  '/orders',
  './routes/order.routes'
);

/*
 * Inventory
 */
safeRouteMount(
  '/api/v1/inventory',
  './routes/inventory.routes'
);

safeRouteMount(
  '/inventory',
  './routes/inventory.routes'
);

/*
 * Returns & Exchanges
 */
safeRouteMount(
  '/api/v1/returns-exchanges',
  './routes/returnExchange.routes'
);

safeRouteMount(
  '/returns-exchanges',
  './routes/returnExchange.routes'
);

/*
 * AI
 */
safeRouteMount(
  '/api/v1/ai',
  './routes/ai.routes'
);

safeRouteMount(
  '/ai',
  './routes/ai.routes'
);

/*
 * Support
 */
safeRouteMount(
  '/api/v1/support',
  './routes/support.routes'
);

safeRouteMount(
  '/support',
  './routes/support.routes'
);

/* =========================================================
   GLOBAL 404 HANDLER
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use((err, req, res, next) => {
  console.error(
    '[Unhandled Server Error]:',
    err
  );

  /*
   * Handle CORS errors gracefully.
   */
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message || 'Internal Server Error',
  });
});

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {
  console.log(
    `\n🚀 [D-MartX Server] Listening on port ${PORT}`
  );

  console.log(
    `📡 [API Endpoint Base] /api/v1`
  );

  console.log(
    `🌐 [Production Frontend] https://mini-d-mart-three.vercel.app\n`
  );
});