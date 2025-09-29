// THÊM DÒNG NÀY Ở ĐẦU FILE
console.log('Function started - Environment:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema và Model
const productSchema = new mongoose.Schema({
  id: Number,
  type: String,
  size: Number,
  name: String,
  price: Number,
  stock: Number,
  imported: Number,
  sold: Number
});

const saleHistorySchema = new mongoose.Schema({
  id: Number,
  date: String,
  items: [{
    productId: Number,
    name: String,
    price: Number,
    quantity: Number,
    note: String,
    total: Number
  }],
  totalAmount: Number
});

const importHistorySchema = new mongoose.Schema({
  id: Number,
  date: String,
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  total: Number,
  totalAmount: Number
});

const priceHistorySchema = new mongoose.Schema({
  date: String,
  product: String,
  oldPrice: Number,
  newPrice: Number,
  change: Number
});

const Product = mongoose.model('Product', productSchema);
const SaleHistory = mongoose.model('SaleHistory', saleHistorySchema);
const ImportHistory = mongoose.model('ImportHistory', importHistorySchema);
const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

// API Routes
app.get('/api/data', async (req, res) => {
  try {
    const products = await Product.find();
    const salesHistory = await SaleHistory.find();
    const importHistory = await ImportHistory.find();
    const priceHistory = await PriceHistory.find();
    
    res.json({
      products,
      salesHistory,
      importHistory,
      priceHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const { products, salesHistory, importHistory, priceHistory } = req.body;
    
    await Product.deleteMany({});
    await Product.insertMany(products);
    
    await SaleHistory.deleteMany({});
    if (salesHistory.length > 0) {
      await SaleHistory.insertMany(salesHistory);
    }
    
    await ImportHistory.deleteMany({});
    if (importHistory.length > 0) {
      await ImportHistory.insertMany(importHistory);
    }
    
    await PriceHistory.deleteMany({});
    if (priceHistory.length > 0) {
      await PriceHistory.insertMany(priceHistory);
    }
    
    res.json({ message: 'Dữ liệu đã được lưu thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/init', async (req, res) => {
  try {
    const sampleProducts = [
      { id: 1, type: 'nam', size: 2, name: 'ĐP Nam 2', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 2, type: 'nam', size: 3, name: 'ĐP Nam 3', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 3, type: 'nam', size: 4, name: 'ĐP Nam 4', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 4, type: 'nam', size: 5, name: 'ĐP Nam 5', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 5, type: 'nam', size: 6, name: 'ĐP Nam 6', price: 115000, stock: 0, imported: 0, sold: 0 },
      { id: 6, type: 'nam', size: 7, name: 'ĐP Nam 7', price: 120000, stock: 0, imported: 0, sold: 0 },
      { id: 7, type: 'nam', size: 8, name: 'ĐP Nam 8', price: 120000, stock: 0, imported: 0, sold: 0 },
      { id: 8, type: 'nam', size: 10, name: 'ĐP Nam 10', price: 120000, stock: 0, imported: 0, sold: 0 },
      { id: 9, type: 'nu', size: 2, name: 'ĐP Nữ 2', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 10, type: 'nu', size: 3, name: 'ĐP Nữ 3', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 11, type: 'nu', size: 4, name: 'ĐP Nữ 4', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 12, type: 'nu', size: 5, name: 'ĐP Nữ 5', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 13, type: 'nu', size: 6, name: 'ĐP Nữ 6', price: 115000, stock: 0, imported: 0, sold: 0 },
      { id: 14, type: 'nu', size: 7, name: 'ĐP Nữ 7', price: 120000, stock: 0, imported: 0, sold: 0 },
      { id: 15, type: 'nu', size: 8, name: 'ĐP Nữ 8', price: 120000, stock: 0, imported: 0, sold: 0 },
      { id: 16, type: 'nu', size: 10, name: 'ĐP Nữ 10', price: 120000, stock: 0, imported: 0, sold: 0 },
      { id: 17, type: 'the_duc', size: 2, name: 'Thể dục 2', price: 65000, stock: 0, imported: 0, sold: 0 },
      { id: 18, type: 'the_duc', size: 3, name: 'Thể dục 3', price: 65000, stock: 0, imported: 0, sold: 0 },
      { id: 19, type: 'the_duc', size: 4, name: 'Thể dục 4', price: 65000, stock: 0, imported: 0, sold: 0 },
      { id: 20, type: 'the_duc', size: 5, name: 'Thể dục 5', price: 65000, stock: 0, imported: 0, sold: 0 },
      { id: 21, type: 'the_duc', size: 6, name: 'Thể dục 6', price: 70000, stock: 0, imported: 0, sold: 0 },
      { id: 22, type: 'the_duc', size: 7, name: 'Thể dục 7', price: 70000, stock: 0, imported: 0, sold: 0 },
      { id: 23, type: 'the_duc', size: 8, name: 'Thể dục 8', price: 75000, stock: 0, imported: 0, sold: 0 },
      { id: 24, type: 'the_duc', size: 10, name: 'Thể dục 10', price: 75000, stock: 0, imported: 0, sold: 0 }
    ];
    
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    
    res.json({ message: 'Dữ liệu mẫu đã được khởi tạo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Netlify Functions handler
module.exports.handler = serverless(app);
