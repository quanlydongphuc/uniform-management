const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React app
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

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

// Lấy tất cả dữ liệu
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

// Lưu tất cả dữ liệu
app.post('/api/save', async (req, res) => {
  try {
    const { products, salesHistory, importHistory, priceHistory } = req.body;
    
    // Xóa dữ liệu cũ và lưu mới
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

// Khởi tạo dữ liệu mẫu
app.post('/api/init', async (req, res) => {
  try {
    const sampleProducts = [
      // Đồng phục Nam
      { id: 1, type: 'nam', size: 2, name: 'ĐP Nam 2', price: 110000, stock: 0, imported: 0, sold: 0 },
      { id: 2, type: 'nam', size: 3, name: 'ĐP Nam 3', price: 110000, stock: 0, imported: 0, sold: 0 },
      // ... (thêm tất cả sản phẩm như trong frontend)
    ];
    
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    
    res.json({ message: 'Dữ liệu mẫu đã được khởi tạo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

// Netlify Functions handler
const handler = require('serverless-http')(app);

module.exports.handler = async (event, context) => {
  return await handler(event, context);
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});