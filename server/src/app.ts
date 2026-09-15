import express from 'express';
import cors from 'cors';
import { initSchema, seedIfEmpty } from './db';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import vocabRoutes from './routes/vocabulary';
import grammarRoutes from './routes/grammar';
import listeningRoutes from './routes/listening';
import progressRoutes from './routes/progress';
import recommendRoutes from './routes/recommendations';
import communityRoutes from './routes/community';
import achievementRoutes from './routes/achievements';

export function createApp() {
  const app = express();

  initSchema();
  seedIfEmpty(); // Vercel /tmp 冷启动时自动灌入种子数据

  app.use(cors());
  app.use(express.json());

  // 统一处理路径前缀：本地请求带 /api，Vercel 会剥离 /api
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      req.url = req.url.slice(4) || '/';
    }
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LinguaFlow API is running' });
  });

  // 路由挂载在根路径（不带 /api 前缀）
  app.use('/auth', authRoutes);
  app.use('/courses', courseRoutes);
  app.use('/vocabulary', vocabRoutes);
  app.use('/grammar', grammarRoutes);
  app.use('/listening', listeningRoutes);
  app.use('/progress', progressRoutes);
  app.use('/recommendations', recommendRoutes);
  app.use('/posts', communityRoutes);
  app.use('/', achievementRoutes);

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
  });

  return app;
}

export const app = createApp();
