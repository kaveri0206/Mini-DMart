const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

class AIService {
  static async generateSmartBasket(userQuery = '') {
    // 1. Fetch products and filter out non-edible categories
    const products = await Product.find({ isActive: true })
      .populate('category')
      .lean();

    // Whitelist only edible grocery categories & items
    const edibleCategories = ['dairy-breakfast', 'atta-rice-dal', 'fresh-fruits-veggies', 'snacks-munchies'];
    const nonEdibleKeywords = [
      'detergent', 'dishwash', 'cleaner', 'soap', 'shampoo', 
      'toothpaste', 'towel', 'agarbatti', 'camphor', 'batti', 
      'ghanti', 'diya', 'paper towel', 'floor cleaner'
    ];

    const edibleProducts = products.filter((p) => {
      const catSlug = p.category?.slug || '';
      const name = p.name.toLowerCase();

      // Ensure it is in an edible category and has no non-edible keywords
      const isCategoryEdible = edibleCategories.includes(catSlug);
      const isNotNonEdible = !nonEdibleKeywords.some((kw) => name.includes(kw));

      return isCategoryEdible && isNotNonEdible;
    });

    // 2. Attach real-time stock
    const productIds = edibleProducts.map((p) => p._id);
    const inventories = await Inventory.find({ product: { $in: productIds } }).lean();
    const stockMap = new Map(inventories.map((i) => [i.product.toString(), i.availableStock]));

    const availableEdibles = edibleProducts.map((p) => ({
      ...p,
      availableStock: stockMap.get(p._id.toString()) || 0,
    }));

    // 3. Select balanced daily food essentials (Staples, Dairy, Produce, Healthy Snacks)
    const essentialItems = availableEdibles
      .filter((p) => (p.availableStock || 0) > 0)
      .slice(0, 8); // Top 8 daily edible essentials

    return {
      title: 'Daily Edible Essentials Basket',
      description: 'Handpicked fresh kitchen foods, whole grains, dairy, and daily produce.',
      suggestedItems: essentialItems,
    };
  }
}

module.exports = AIService;