require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const ReturnModel = require('../models/Return');
const DeliveryZone = require('../models/DeliveryZone');
const PickupSlot = require('../models/PickupSlot');
const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../config/constants');

// Resolve model export whether default or named
const Return = ReturnModel.Return || ReturnModel;

const DEMO_PASSWORD = 'Password@123';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dmartx');
  console.log('[Seed] Purging collections for fresh catalog insertion...');

  const purgeList = [
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Inventory.deleteMany({}),
    Order.deleteMany({}),
  ];

  if (Return && typeof Return.deleteMany === 'function') {
    purgeList.push(Return.deleteMany({}));
  }
  if (DeliveryZone && typeof DeliveryZone.deleteMany === 'function') {
    purgeList.push(DeliveryZone.deleteMany({}));
  }
  if (PickupSlot && typeof PickupSlot.deleteMany === 'function') {
    purgeList.push(PickupSlot.deleteMany({}));
  }
  if (AuditLog && typeof AuditLog.deleteMany === 'function') {
    purgeList.push(AuditLog.deleteMany({}));
  }

  await Promise.all(purgeList);

  console.log('[Seed] Creating core authorization accounts...');
  const users = [
    { name: 'Administrator', email: 'admin@dmartx.demo', role: ROLES.ADMIN, isActive: true },
    { name: 'Operations Manager', email: 'manager@dmartx.demo', role: ROLES.MANAGER, isActive: true },
    { name: 'Store Staff', email: 'staff@dmartx.demo', role: ROLES.STAFF, isActive: true },
    { name: 'Demo Customer', email: 'customer@dmartx.demo', role: ROLES.CUSTOMER, isActive: true },
  ];

  for (const u of users) {
    const user = new User({ ...u, password: DEMO_PASSWORD, tokenVersion: 0 });
    await user.save();
  }

  console.log('[Seed] Generating supermarket departments...');
  const catPooja = await Category.create({ name: 'Pooja & Botanicals', slug: 'pooja-botanicals' });
  const catDairy = await Category.create({ name: 'Dairy, Bread & Eggs', slug: 'dairy-breakfast' });
  const catStaples = await Category.create({ name: 'Atta, Rice, Dal & Oils', slug: 'atta-rice-dal' });
  const catFresh = await Category.create({ name: 'Fresh Fruits & Veggies', slug: 'fresh-fruits-veggies' });
  const catSnacks = await Category.create({ name: 'Snacks & Beverages', slug: 'snacks-munchies' });
  const catHome = await Category.create({ name: 'Household & Cleaning', slug: 'household-kitchen' });

  const rawCatalog = [
    // --- 1. POOJA & BOTANICALS ---
    { 
      name: 'Fresh Sacred Bel Patra (Pack of 21 Leaves)', 
      cat: catPooja._id, unit: '21 pcs', reg: 25, disc: 20, shelf: 1, ultra: true, 
      warn: 'Ultra-perishable: Stays fresh for only 24 hours. Procured daily at sunrise.',
      img: 'https://tse3.mm.bing.net/th/id/OIP.6sffvqw-5Ajp0YMOhYOxWwHaF4?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Fragrant Green Tulsi Leaves Bunch', 
      cat: catPooja._id, unit: '50 g', reg: 20, disc: 15, shelf: 1, ultra: true, 
      warn: 'Delicate botanical: Expires within 1 day.',
      img: 'https://i.pinimg.com/originals/c6/f5/9e/c6f59ef66221dd2a3d46b73d4ee83c95.jpg'
    },
    { 
      name: 'Fresh Golden Marigold Garland (Genda Phool)', 
      cat: catPooja._id, unit: '1 String', reg: 60, disc: 45, shelf: 2, ultra: true, 
      warn: 'Fresh flowers: Best used within 24-48 hours.',
      img: 'https://tse4.mm.bing.net/th/id/OIP.J7Rux7zuXah6xAKDXD018wAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Sacred Durva Grass Bunch (Ganesh Pooja)', 
      cat: catPooja._id, unit: '21 Stems', reg: 15, disc: 10, shelf: 1, ultra: true, 
      warn: 'Perishes within 24 hours.',
      img: 'https://tse3.mm.bing.net/th/id/OIP.-ZQEFNzWhG4xiFi0S2wJJwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Green Betel Leaves (Paan Ke Patte)', 
      cat: catPooja._id, unit: '10 pcs', reg: 30, disc: 25, shelf: 2, ultra: false, 
      warn: 'Keep refrigerated in damp cloth.',
      img: 'https://tse4.mm.bing.net/th/id/OIP.-FNHuQZPU76jfSiob08ZawHaFx?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Mangaldeep Sandalwood Agarbatti 100 Sticks', 
      cat: catPooja._id, unit: '100 pcs', reg: 90, disc: 75, shelf: 730, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.fBQ2lMomKm6Q_t8FBrgZ-QHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Pure Cow Ghee Pooja Diya Batti (Pack of 50)', 
      cat: catPooja._id, unit: '50 pcs', reg: 120, disc: 99, shelf: 365, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.nhmBur2D9YjRKR3X1_fbVwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Pure Camphor Tablets (Bhimseni Kapoor) 100g', 
      cat: catPooja._id, unit: '100 g', reg: 150, disc: 129, shelf: 730, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.d2Uh6Dzck4l8MGyTZ5h_wwHaE6?pid=Api&w=500&h=500&c=7'
    },

    // --- 2. DAIRY, BREAD & EGGS ---
    { 
      name: 'Amul Taaza Homogenised Toned Milk 1L', 
      cat: catDairy._id, unit: '1 Litre', reg: 75, disc: 68, shelf: 4, ultra: false, 
      warn: 'Keep refrigerated below 4°C.',
      img: 'https://tse2.mm.bing.net/th/id/OIP.9XlPoInYvqBh1UddWDD75AHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Mother Dairy Full Cream Fresh Milk 1L', 
      cat: catDairy._id, unit: '1 Litre', reg: 68, disc: 66, shelf: 2, ultra: false, 
      warn: 'Short shelf life: Consume within 48 hours.',
      img: 'https://tse1.mm.bing.net/th/id/OIP.Mfo3rUITCJBWAKfBgwbcEAHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Farm Fresh Organic Brown Eggs (Pack of 12)', 
      cat: catDairy._id, unit: '12 pcs', reg: 140, disc: 119, shelf: 14, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.XMz9xf0L2vE7rjzm-nRR8gHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Classic White Table Eggs (Tray of 30)', 
      cat: catDairy._id, unit: '30 pcs', reg: 240, disc: 199, shelf: 14, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.joSa-ETmH7nMuwzDKV9RFwHaHZ?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Amul Salted Creamy Butter 500g Tub', 
      cat: catDairy._id, unit: '500 g', reg: 275, disc: 260, shelf: 180, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.1tn7CzBKlWN2-DHDijBZAgHaE3?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Milky Mist Fresh Malai Paneer 200g', 
      cat: catDairy._id, unit: '200 g', reg: 110, disc: 95, shelf: 15, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.WfAoM-Y6dJVPvTmy54XlkQHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Epigamia Greek Yogurt Blueberry 120g', 
      cat: catDairy._id, unit: '120 g', reg: 60, disc: 52, shelf: 20, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.sxb-bDwOxmYDs0vGUSZGHAHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Artisan Whole Wheat Sourdough Loaf 400g', 
      cat: catDairy._id, unit: '400 g', reg: 95, disc: 85, shelf: 3, ultra: false, 
      warn: 'Fresh baked daily: Consume in 3 days.',
      img: 'https://tse1.mm.bing.net/th/id/OIP._sW6zn_dqT6Aj-3lBMsrqQHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Britannia 100% Whole Wheat Bread 400g', 
      cat: catDairy._id, unit: '400 g', reg: 55, disc: 50, shelf: 5, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.2iJqL6JrrbYRgRIof9qVYgHaM4?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Gowardhan Pure Cow Desi Ghee Jar 1L', 
      cat: catDairy._id, unit: '1 Litre', reg: 690, disc: 599, shelf: 270, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.2YQ9M5F9-J8v5WvL_R4y4gHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Mother Dairy Fresh Curd Tub (Dahi) 400g', 
      cat: catDairy._id, unit: '400 g', reg: 45, disc: 40, shelf: 7, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.t8r5JQulCAlfv46cMX0qtgHaEo?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Amul Processed Cheese Slices 200g (10 Slices)', 
      cat: catDairy._id, unit: '200 g', reg: 150, disc: 138, shelf: 180, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.KPls3VPKPO1CJdtapMXFDQHaES?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Amul Kool Kesar Flavoured Milk Bottle 200ml', 
      cat: catDairy._id, unit: '200 ml', reg: 35, disc: 30, shelf: 90, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.cc8wXdr_J880vdlnRl6w8wHaHa?pid=Api&w=500&h=500&c=7'
    },

    // --- 3. ATTA, RICE, DAL & OILS ---
    { 
      name: 'Aashirvaad Superior MP Sharbati Atta 10kg', 
      cat: catStaples._id, unit: '10 kg', reg: 590, disc: 520, shelf: 180, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.2ZXyp39awXwuFNFh_nQnGQHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fortune Chakki Fresh Whole Wheat Atta 5kg', 
      cat: catStaples._id, unit: '5 kg', reg: 260, disc: 225, shelf: 180, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.gRADpeVbtEQ7Mk_MvFUB0QHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Daawat Rozana Super Basmati Rice 5kg', 
      cat: catStaples._id, unit: '5 kg', reg: 499, disc: 389, shelf: 730, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.c1vzzuSldtCo8j5mbW6hewHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'India Gate Classic Aged Basmati Rice 1kg', 
      cat: catStaples._id, unit: '1 kg', reg: 215, disc: 175, shelf: 730, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.lI-yoYwwPm7HvQk-AkL4CQHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Cold Pressed Pure Mustard Oil 1L Bottle', 
      cat: catStaples._id, unit: '1 Litre', reg: 185, disc: 155, shelf: 365, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.oTZF7T5KtgDs9v1ASzW4OgAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fortune Sunlite Refined Sunflower Oil 1L', 
      cat: catStaples._id, unit: '1 Litre', reg: 165, disc: 139, shelf: 270, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.XxgcLWMWiulNMPzt6NRUPwHaK7?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Tata Sampann Unpolished Toor Dal 1kg', 
      cat: catStaples._id, unit: '1 kg', reg: 195, disc: 168, shelf: 365, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.pBh4XuSn2fzfiJpSRUzJBwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Tata Sampann Yellow Moong Dal 1kg', 
      cat: catStaples._id, unit: '1 kg', reg: 170, disc: 145, shelf: 365, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.Ss-vXo6y_gl_PcJXW8IYewAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Organic Tattva Kabuli White Chana 1kg', 
      cat: catStaples._id, unit: '1 kg', reg: 180, disc: 155, shelf: 365, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.7vnBx2_6RWiyaa-3_zp7iQAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Tata Salt Vacuum Evaporated Iodized Salt 1kg', 
      cat: catStaples._id, unit: '1 kg', reg: 28, disc: 24, shelf: 730, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.YsGz97FhHWm_9g8pJHtPPwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Madhur Pure Refined White Sugar 5kg', 
      cat: catStaples._id, unit: '5 kg', reg: 260, disc: 228, shelf: 730, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.Fma-6LDMBpHmKVzS55XJiwAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Everest Turmeric Powder (Haldi) 500g', 
      cat: catStaples._id, unit: '500 g', reg: 145, disc: 125, shelf: 365, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.7moyMCkIHeKc8_nVjYPiwgHaK3?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'MDH Deggi Mirch Spicy Red Chilli Powder 100g', 
      cat: catStaples._id, unit: '100 g', reg: 92, disc: 78, shelf: 365, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.nrPfZ8ZSPjzBpdcIZEP2kQHaFj?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Catch Fresh Coriander Powder (Dhaniya) 200g', 
      cat: catStaples._id, unit: '200 g', reg: 65, disc: 54, shelf: 365, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.NDb6SP3tnRb4fAQuhgGGhAHaHZ?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'MTR Instant Soft Rava Idli Mix 500g', 
      cat: catStaples._id, unit: '500 g', reg: 125, disc: 102, shelf: 180, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.v50zCSEG89fpAvqAN4HtbAHaHa?pid=Api&w=500&h=500&c=7'
    },

    // --- 4. FRESH FRUITS & VEGGIES ---
    { 
      name: 'Fresh Hydroponic Vine Red Tomatoes 1kg', 
      cat: catFresh._id, unit: '1 kg', reg: 50, disc: 36, shelf: 5, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.Y67tvXpOwjaw7p-TTl9uTQHaFo?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Crisp Green Shimla Capsicum 500g', 
      cat: catFresh._id, unit: '500 g', reg: 55, disc: 42, shelf: 6, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.WQMPetK_NKaxDnCRtDw1FgHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Shimla Royal Delicious Apples 1kg', 
      cat: catFresh._id, unit: '1 kg', reg: 180, disc: 145, shelf: 10, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.UbfRrJUknQWEwSjqc1OnswHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Robusta Golden Bananas (1 Dozen)', 
      cat: catFresh._id, unit: '12 pcs', reg: 70, disc: 55, shelf: 4, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.bdDRNXURwEY8qCecxrlEjwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Nashik Red Onions (Pyaaz) 2kg', 
      cat: catFresh._id, unit: '2 kg', reg: 90, disc: 72, shelf: 20, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.Ah8FLWT9vvH0xD7GCMiLqwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Farm Russet Potatoes (Aloo) 2kg', 
      cat: catFresh._id, unit: '2 kg', reg: 80, disc: 64, shelf: 25, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.qRqqfraeTGsIZNaV-dE2LAHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Crisp Green Broccoli Florets 500g', 
      cat: catFresh._id, unit: '500 g', reg: 95, disc: 75, shelf: 4, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.UNFi0iEx3brvz1f-fNXFZAHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Tender Fresh Spinach Bunch (Palak)', 
      cat: catFresh._id, unit: '250 g', reg: 30, disc: 22, shelf: 2, ultra: true, 
      warn: 'Leafy green: Best consumed within 48 hours.',
      img: 'https://tse2.mm.bing.net/th/id/OIP.YxWJioY5tmgRvnAQtE9nhQHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Fresh Green Seedless Sweet Grapes 500g', 
      cat: catFresh._id, unit: '500 g', reg: 130, disc: 99, shelf: 5, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.sAGI9U6AWRj_ZnizsNaJEwHaHa?pid=Api&w=500&h=500&c=7'
    },

    // --- 5. SNACKS, NUTS, SWEETS & BEVERAGES ---
    { 
      name: 'Premium California Almonds (Badam) 500g', 
      cat: catSnacks._id, unit: '500 g', reg: 520, disc: 440, shelf: 270, ultra: false, warn: '',
      img: 'https://sp.yimg.com/ib/th?id=OPAC.hEXrYUyX1ItOCQ474C474&o=5&pid=21.1&w=500&h=500&c=7'
    },
    { 
      name: 'Whole Cashews Grade W240 (Kaju) 500g', 
      cat: catSnacks._id, unit: '500 g', reg: 580, disc: 495, shelf: 270, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.Ia-Ehszf-maaUDhSGZDIVQAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Golden Afghan Sweet Raisins (Kismis) 500g', 
      cat: catSnacks._id, unit: '500 g', reg: 240, disc: 190, shelf: 270, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.v2XgGo9_QOH9RuhRfjLiNwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'California Walnuts Kernels (Akhrot) 250g', 
      cat: catSnacks._id, unit: '250 g', reg: 380, disc: 315, shelf: 270, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.83yKfvwQhWFnM62-vhmxPgHaIY?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Pintola All-Natural Peanut Butter Crunchy 1kg', 
      cat: catSnacks._id, unit: '1 kg', reg: 450, disc: 379, shelf: 365, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.sOToZSAzmZBjlJKe941YpQHaLN?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Cadbury Dairy Milk Silk Chocolate 150g', 
      cat: catSnacks._id, unit: '150 g', reg: 185, disc: 165, shelf: 365, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.V4LcEHWhRco-AEgbzDTXrgHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Tata Tea Gold Premium Black Tea 1kg', 
      cat: catSnacks._id, unit: '1 kg', reg: 650, disc: 540, shelf: 365, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.fAxmfCtg9c5CFVjDmPuEWQAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Nescafe Classic Instant Coffee Jar 200g', 
      cat: catSnacks._id, unit: '200 g', reg: 490, disc: 415, shelf: 730, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.9_K15WDenozgTyZDu42KTwHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Haldirams Soft Gulab Jamun Tin 1kg', 
      cat: catSnacks._id, unit: '1 kg', reg: 260, disc: 210, shelf: 180, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.iq99zXGZDeH3aQKRHevXGAHaIb?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Dabur 100% Pure Honey Squeezy Bottle 400g', 
      cat: catSnacks._id, unit: '400 g', reg: 230, disc: 185, shelf: 365, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.BAvL6z57-8-WP4nz1kP0DwHaHa?pid=Api&w=500&h=500&c=7'
    },

    // --- 6. HOUSEHOLD & CLEANING ---
    { 
      name: 'Surf Excel Matic Front Load Detergent 2kg', 
      cat: catHome._id, unit: '2 kg', reg: 480, disc: 410, shelf: 730, ultra: false, warn: '',
      img: 'https://tse3.mm.bing.net/th/id/OIP.9ceBqosyxq40FC_PtBav8AHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Vim Dishwash Gel Lemon Refill Pouch 2L', 
      cat: catHome._id, unit: '2 Litre', reg: 390, disc: 320, shelf: 730, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.dLqixu8OXo2zwO2Ypqtb1gHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Lizol Disinfectant Floor Cleaner Citrus 2L', 
      cat: catHome._id, unit: '2 Litre', reg: 385, disc: 315, shelf: 730, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.zpEm4DwItIw3mgHs0Q0MqAHaLt?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Dettol Original Liquid Handwash Refill 1.5L', 
      cat: catHome._id, unit: '1.5 Litre', reg: 299, disc: 245, shelf: 730, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.2LPWxhqy3rnb2OCRZHqWTQAAAA?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Dove Cream Beauty Bathing Bar (Pack of 3)', 
      cat: catHome._id, unit: '300 g', reg: 210, disc: 175, shelf: 730, ultra: false, warn: '',
      img: 'https://tse2.mm.bing.net/th/id/OIP.6mOPtpxnVew2NcbJoGrlqgHaHa?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Colgate Strong Teeth Toothpaste (Saver Pack)', 
      cat: catHome._id, unit: '500 g', reg: 280, disc: 225, shelf: 730, ultra: false, warn: '',
      img: 'https://tse1.mm.bing.net/th/id/OIP.7eCmN72v6ZGTjW6leK5IXwHaHg?pid=Api&w=500&h=500&c=7'
    },
    { 
      name: 'Origami 3-Ply Kitchen Paper Towels (Pack of 4)', 
      cat: catHome._id, unit: '4 Rolls', reg: 240, disc: 195, shelf: 1095, ultra: false, warn: '',
      img: 'https://tse4.mm.bing.net/th/id/OIP.FD5aENW4OWpKd0b4LDy57wHaHa?pid=Api&w=500&h=500&c=7'
    }
  ];

  const distinctTemplates = [
    { n: 'Fortune Sunlite 100% Refined Sunflower Oil 5L Can', c: catStaples._id, u: '5 Litre', r: 750, d: 660, img: 'https://tse2.mm.bing.net/th/id/OIP.p7rX9Zuxsu98EHxygTUFpwHaHa?pid=Api&w=500&h=500&c=7' },
    { n: 'Organic Tattva Cold Pressed Mustard Oil 1L Bottle', c: catStaples._id, u: '1 Litre', r: 210, d: 180, img: 'https://tse1.mm.bing.net/th/id/OIP.Cvb2F45AcgzBBn-YhFRtrQHaHa?pid=Api&w=500&h=500&c=7' },
    { n: 'Tata Sampann High Protein Masoor Malka Dal 1kg', c: catStaples._id, u: '1 kg', r: 160, d: 138, img: 'https://tse3.mm.bing.net/th/id/OIP.BPeF4frQ4gm6Es8ZYYmhUQHaIq?pid=Api&w=500&h=500&c=7' },
    { n: 'Organic Tattva Whole Black Urad Dal 1kg', c: catStaples._id, u: '1 kg', r: 190, d: 165, img: 'https://tse2.mm.bing.net/th/id/OIP.y-qUDjYPQ3h8dHonRSm1CAAAAA?pid=Api&w=500&h=500&c=7' },
    { n: 'India Gate Super Daily Basmati Rice 10kg Saver Bag', c: catStaples._id, u: '10 kg', r: 850, d: 740, img: 'https://tse4.mm.bing.net/th/id/OIP.QrqK2dVmeyf3T78LXdszBgHaJL?pid=Api&w=500&h=500&c=7' },
    { n: 'Tata Salt Lite Low Sodium Iodized Salt 1kg', c: catStaples._id, u: '1 kg', r: 42, d: 36, img: 'https://tse1.mm.bing.net/th/id/OIP.j1--O6F3bY8cx-QLmiboOwHaHa?pid=Api&w=500&h=500&c=7' },
    { n: 'Organic Certified Raw Jaggery (Gur) 1kg Block', c: catStaples._id, u: '1 kg', r: 110, d: 92, img: 'https://m.media-amazon.com/images/I/61RGcQ1-Q3L._SL1024_.jpg' },
    { n: 'Everest Shahi Biryani Masala Spice Mix 100g', c: catStaples._id, u: '100 g', r: 85, d: 72, img: 'https://m.media-amazon.com/images/I/81cScH9fO9L._AC_SL1500_.jpg' },
    { n: 'Catch Pure Black Pepper Whole (Kali Mirch) 100g', c: catStaples._id, u: '100 g', r: 130, d: 110, img: 'https://tse2.mm.bing.net/th/id/OIP.OuTI25sVfaJ5LNXBbmmiDQHaHa?pid=Api&w=500&h=500&c=7' },
    { n: 'Tata Sampann Thick Poha (Flaked Rice) 1kg', c: catStaples._id, u: '1 kg', r: 90, d: 76, img: 'https://5.imimg.com/data5/SELLER/Default/2023/6/317555780/ZR/WU/LL/96558411/white-poha-500x500.jpeg' },
    { n: 'Fresh Shimla Golden Delicious Pears 1kg', c: catFresh._id, u: '1 kg', r: 160, d: 130, img: 'https://tse2.mm.bing.net/th/id/OIP.33nD_jZpYZ_IlY4PFbwrnQHaHa?pid=Api&w=500&h=500&c=7' },
    { n: 'Sweet Seedless Nagpur Kinnow Oranges 1kg', c: catFresh._id, u: '1 kg', r: 110, d: 89, img: 'https://tse3.mm.bing.net/th/id/OIP.3kw0MrGk5e-OYg4K0GVRPwHaIM?pid=Api&w=500&h=500&c=7' },
    { n: 'Fresh Crisp Hybrid Salad Cucumber (Kheera) 1kg', c: catFresh._id, u: '1 kg', r: 45, d: 35, img: 'https://i1.zopping.com/zopsmart-media/25343/images/originals/20250604/eea285e2-f56b-4f76-9fb4-e255d507bf8b-cucumberhybrid.webp' },
    { n: 'Fresh Desi Garlic Pearls (Peeled Lehsun) 250g', c: catFresh._id, u: '250 g', r: 95, d: 78, img: 'https://tse3.mm.bing.net/th/id/OIP.FXkXkI92AtfiJEI9sdhBPwHaE7?pid=Api&w=500&h=500&c=7' },
    { n: 'Fresh Tender Green Ginger (Adrak) 250g', c: catFresh._id, u: '250 g', r: 50, d: 38, img: 'https://tse3.mm.bing.net/th/id/OIP.ZcKqIL7quFX9VPuezTCBbgHaHa?pid=Api&w=500&h=500&c=7' },
    { n: 'Amul Masti Spiced Buttermilk Tetrapack 200ml (Pack of 6)', c: catDairy._id, u: '1.2 Litre', r: 90, d: 78, img: 'https://tse4.mm.bing.net/th/id/OIP.2JTb2eRRZjfcvySB73ryiwHaEp?pid=Api&w=500&h=500&c=7' },
    { n: 'Nestle Everyday Dairy Whitener Milk Powder 1kg', c: catDairy._id, u: '1 kg', r: 460, d: 410, img: 'https://tse2.mm.bing.net/th/id/OIP.qKMkxY14JoVc3sLCTJr_uQHaJ4?pid=Api&w=500&h=500&c=7' },
    { n: 'Britannia Cheese Cubes Box 200g (8 Cubes)', c: catDairy._id, u: '200 g', r: 145, d: 130, img: 'https://tse1.mm.bing.net/th/id/OIP.huzihH6eLQOATQRRFcv-jAAAAA?pid=Api&w=500&h=500&c=7' },
    { n: 'Bikaji Sub Kuch Festive All-in-One Mixture 1kg', c: catSnacks._id, u: '1 kg', r: 270, d: 220, img: 'https://tse1.mm.bing.net/th/id/OIP._I5QLMaTy4l2sCcdOXen7wAAAA?pid=Api&w=500&h=500&c=7' },
    { n: 'Paper Boat Aamras Alphonso Mango Drink 1L Tetrapack', c: catSnacks._id, u: '1 Litre', r: 120, d: 99, img: 'https://tse2.mm.bing.net/th/id/OIP.U2pvA6buvtsDAMVvvN0iMAHaHa?pid=Api&w=500&h=500&c=7' }
  ];

  let itemIdx = 0;
  while (rawCatalog.length < 105) {
    const t = distinctTemplates[itemIdx % distinctTemplates.length];
    const iteration = Math.floor(rawCatalog.length / distinctTemplates.length) + 1;
    rawCatalog.push({
      name: `${t.n} (Stock Pack ${iteration})`,
      cat: t.c,
      unit: t.u,
      reg: t.r + (iteration * 5),
      disc: t.d + (iteration * 4),
      shelf: 180,
      ultra: false,
      warn: '',
      img: t.img
    });
    itemIdx++;
  }

  for (let i = 0; i < rawCatalog.length; i++) {
    const item = rawCatalog[i];
    const skuCode = `DMX-PROD-${String(i + 1).padStart(4, '0')}`;

    const prod = await Product.create({
      name: item.name,
      sku: skuCode,
      description: `Premium supermarket catalog verified: ${item.name}`,
      category: item.cat,
      unit: item.unit,
      regularPrice: item.reg,
      discountPrice: item.disc,
      images: [item.img],
      shelfLifeDays: item.shelf,
      isUltraPerishable: item.ultra,
      expiryWarningNote: item.warn,
    });

    await Inventory.create({
      product: prod._id,
      availableStock: 50,
      reservedStock: 0,
      lowStockThreshold: 10,
    });
  }

  if (DeliveryZone && typeof DeliveryZone.create === 'function') {
    await DeliveryZone.create([
      { name: 'HyperLocal Zone', minDistanceKm: 0, maxDistanceKm: 5, fee: 0 },
      { name: 'Express City Zone', minDistanceKm: 5, maxDistanceKm: 15, fee: 50 },
    ]);
  }

  const today = new Date().toISOString().split('T')[0];
  if (PickupSlot && typeof PickupSlot.create === 'function') {
    await PickupSlot.create([
      { date: today, startTime: '09:00', endTime: '12:00', capacity: 40 },
      { date: today, startTime: '14:00', endTime: '17:00', capacity: 40 },
      { date: today, startTime: '18:00', endTime: '21:00', capacity: 40 },
    ]);
  }

  console.log(`[Seed] Catalog initialized with ${rawCatalog.length} matched items.`);
  
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});