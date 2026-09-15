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

  // 调试：记录实际收到的请求路径（Vercel 函数日志可见）
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // 兼容两种环境：
  // - 本地开发: URL 为 /api/auth/login
  // - Vercel: URL 可能为 /auth/login (Vercel 剥离 /api) 或 /api/auth/login
  // 因此同时挂载到 /api/* 和 /* 两个路径
  const mountRoutes = (prefix: string) => {
    app.get(`${prefix}/health`, (req, res) => {
      res.json({ status: 'ok', message: 'LinguaFlow API is running' });
    });
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/courses`, courseRoutes);
    app.use(`${prefix}/vocabulary`, vocabRoutes);
    app.use(`${prefix}/grammar`, grammarRoutes);
    app.use(`${prefix}/listening`, listeningRoutes);
    app.use(`${prefix}/progress`, progressRoutes);
    app.use(`${prefix}/recommendations`, recommendRoutes);
    app.use(`${prefix}/posts`, communityRoutes);
    app.use(`${prefix}`, achievementRoutes);
  };

  mountRoutes('/api');
  mountRoutes('');

  // 404 兜底，返回实际路径便于排查
  app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ error: `路由不存在: ${req.method} ${req.url}` });
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误', detail: err.message });
  });

  return app;
}

export const app = createApp();
