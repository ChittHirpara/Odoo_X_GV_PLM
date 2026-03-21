const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// ── DB Layer ──────────────────────────────────────
// ── DB Layer ──────────────────────────────────────
const { initDatabases } = require('./src/config/database');
const dbMiddleware = require('./src/middleware/dbMiddleware');

// ── Route imports ─────────────────────────────────
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
const impactRouter = require('./src/routes/impact');
const slaRouter = require('./src/routes/sla');
const exportRouter = require('./src/routes/export');
const searchRouter = require('./src/routes/search');
const dbStatusRoute = require('./src/routes/dbStatus');
const generateRoute = require('./src/routes/generate');
const riskRoute = require('./src/routes/risk');
const { startSLAMonitor } = require('./src/services/slaService');
const { startHealthCheck } = require('./src/utils/dbHealth');
const readOnlyMiddleware = require('./src/middleware/readOnly');

const app = express();

// ── Middleware ─────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(dbMiddleware);
app.use(readOnlyMiddleware); // Global read-only protection

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ────────────────────────────────────────
const publicRoute = require('./src/routes/public');
app.use('/api/public', publicRoute);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/ecos', ecoRoutes);
app.use('/api/ecos', impactRouter);
app.use('/api/ecos', slaRouter);
app.use('/api/ecos', exportRouter);
app.use('/api', searchRouter);
app.use('/api/db', dbStatusRoute);
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences', require('./src/routes/preferences'));
app.use('/api/users', userRoutes);
app.use('/api/approval-rules', approvalRuleRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/generate', generateRoute);
app.use('/api/ecos', riskRoute);

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

// ── Graceful shutdown ─────────────────────────────
process.on('SIGTERM', () => { process.exit(0); });
process.on('SIGINT', () => { process.exit(0); });

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  const startServer = async () => {
    try {
      await initDatabases();
      startSLAMonitor();
      startHealthCheck(15000); // Check DB every 15s
      app.listen(PORT, () => {
        console.log(`\n[SERVER] PLM Flow running on http://localhost:${PORT}`);
        console.log(`[SERVER] CORS enabled for localhost:5173/5174`);
        console.log(`\nAvailable API Routes:`);
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
        console.log('  GET    /api/db/status');
        console.log('  GET    /api/search?q=...');
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
