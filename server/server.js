require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const marketDataRoutes = require('./routes/marketDataRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const listingRoutes = require('./routes/listingRoutes');
const purchaseRequestRoutes = require('./routes/purchaseRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDatabase();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Rural Market Intelligence API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/market-comparison', comparisonRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unexpected server error:', error);
  res.status(500).json({ message: 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
