import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import progressRoutes from './routes/progress';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/progress', progressRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`  语言治疗游戏后端服务已启动`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  API:  http://localhost:${PORT}/api`);
  console.log(`=================================`);
});

export default app;
