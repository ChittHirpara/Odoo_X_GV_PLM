const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const bomRoutes = require('./src/routes/boms');
const ecoRoutes = require('./src/routes/ecos');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/users');
const approvalRuleRoutes = require('./src/routes/approvalRules');
const activityRoutes = require('./src/routes/activities');
const dashboardRoutes = require('./src/routes/dashboard');
const settingsRoutes = require('./src/routes/settings');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/ecos', ecoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/approval-rules', approvalRuleRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date() } });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`PLM Backend running on http://localhost:${PORT}`);
        console.log(`CORS enabled for http://localhost:5173`);
        console.log(`MongoDB connected\n`);
        console.log('Available API Routes:');
        console.log('  POST   /api/auth/login');
        console.log('  GET    /api/auth/me');
        console.log('  GET    /api/products');
        console.log('  GET    /api/products/:id');
        console.log('  GET    /api/boms');
        console.log('  GET    /api/boms/:id');
        console.log('  POST   /api/boms');
        console.log('  GET    /api/ecos');
        console.log('  GET    /api/ecos/:id');
        console.log('  POST   /api/ecos');
        console.log('  PATCH  /api/ecos/:id/stage');
        console.log('  POST   /api/ecos/:id/reject');
        console.log('  PATCH  /api/ecos/:id/images');
        console.log('  PATCH  /api/ecos/:id/images/review/:imageChangeId');
        console.log('  GET    /api/notifications');
        console.log('  PATCH  /api/notifications/:id/read');
        console.log('  POST   /api/notifications');
        console.log('  GET    /api/users');
        console.log('  GET    /api/users/:id');
        console.log('  POST   /api/users');
        console.log('  PUT    /api/users/:id');
        console.log('  GET    /api/approval-rules');
        console.log('  POST   /api/approval-rules');
        console.log('  PUT    /api/approval-rules/:id');
        console.log('  DELETE /api/approval-rules/:id');
        console.log('  GET    /api/activities');
        console.log('  POST   /api/activities');
        console.log('  GET    /api/dashboard/stats');
        console.log('  GET    /api/settings/eco-stages');
        console.log('  PUT    /api/settings/eco-stages');
        console.log('  GET    /api/settings/rules');
        console.log('  PUT    /api/settings/rules');
        console.log('  GET    /api/health');
        console.log('');
      });
    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  };

  startServer();
}
