require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dmartx';

// Core Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('[Server] MongoDB connected successfully to', MONGO_URI))
  .catch((err) => console.error('[Server] MongoDB connection error:', err.message));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'D-MartX API Server is running smoothly' });
});

// Safe Route Mount Helper
const safeRouteMount = (path, routeFile) => {
  try {
    app.use(path, require(routeFile));
    console.log(`[Route Loaded] ${path} -> ${routeFile}`);
  } catch (err) {
    console.warn(`[Route Notice] Could not load ${routeFile}:`, err.message);
  }
};

// Mount API Routes (Both with and without /api/v1 prefix for compatibility)
safeRouteMount('/api/v1/auth', './routes/auth.routes');
safeRouteMount('/auth', './routes/auth.routes');

safeRouteMount('/api/v1/products', './routes/product.routes');
safeRouteMount('/products', './routes/product.routes');

safeRouteMount('/api/v1/orders', './routes/order.routes');
safeRouteMount('/orders', './routes/order.routes');

safeRouteMount('/api/v1/inventory', './routes/inventory.routes');
safeRouteMount('/inventory', './routes/inventory.routes');

safeRouteMount('/api/v1/returns-exchanges', './routes/returnExchange.routes');
safeRouteMount('/returns-exchanges', './routes/returnExchange.routes');
safeRouteMount('/api/v1/ai', './routes/ai.routes');
safeRouteMount('/ai', './routes/ai.routes');
safeRouteMount('/api/v1/support', './routes/support.routes');
safeRouteMount('/support', './routes/support.routes');

// Global 404 Handler for Unhandled Routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 [D-MartX Server] Listening on http://localhost:${PORT}`);
  console.log(`📡 [API Endpoint Base] http://localhost:${PORT}/api/v1\n`);
});