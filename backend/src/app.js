const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const database = require('./utils/database');
const itemRoutes = require('./routes/items');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 请求
  message: '请求过于频繁，请稍后再试'
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/items', itemRoutes);
app.use('/api/backup', backupRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '家庭物品管理系统 API 正常运行' });
});

app.get('/', (req, res) => {
  res.json({ 
    message: '家庭物品管理系统 API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      backup: '/api/backup'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('API 错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: err.message 
  });
});

async function startServer() {
  try {
    await database.initialize();
    console.log('✅ 数据库初始化成功');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📊 API 健康检查: http://0.0.0.0:${PORT}/api/health`);
      console.log(`🌐 本地访问: http://localhost:${PORT}`);
      console.log(`🌐 网络访问: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

startServer();
