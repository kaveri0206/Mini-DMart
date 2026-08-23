const Product = require('../models/Product');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');

const getProducts = async (req, res) => {
  try {
    const { search, limit = 150 } = req.query;
    let filter = { isActive: { $ne: false } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('category')
      .limit(Number(limit))
      .lean();

    if (!products || products.length === 0) {
      return res.status(200).json({ success: true, products: [], total: 0 });
    }

    const productIds = products.map((p) => p._id);
    let stockMap = new Map();

    try {
      const inventories = await Inventory.find({ product: { $in: productIds } }).lean();
      inventories.forEach((inv) => {
        if (inv && inv.product) {
          stockMap.set(inv.product.toString(), inv.availableStock ?? 50);
        }
      });
    } catch (e) {
      console.warn('[Inventory warning]:', e.message);
    }

    const mappedProducts = products.map((p) => ({
      ...p,
      availableStock: stockMap.get(p._id.toString()) ?? 50,
    }));

    return res.status(200).json({
      success: true,
      products: mappedProducts,
      total: mappedProducts.length,
    });
  } catch (err) {
    console.error('[getProducts Error]:', err);
    return res.status(200).json({
      success: true,
      products: [],
      total: 0,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const inventory = await Inventory.findOne({ product: id }).lean();
    product.availableStock = inventory?.availableStock ?? 0;
    return res.status(200).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.status(200).json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};