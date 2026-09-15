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
  seedIfEmpty();

  app.use(cors());

  // 调试日志：记录所有请求
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url} content-type=${req.headers['content-type']}`);
    next();
  });

  // 解析 JSON body，带错误处理
  app.use(express.json());
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON 解析失败' });
    }
    next(err);
  });

  // 测试 POST 端点
  app.post('/api/test', (req, res) => {
    res.json({ ok: true, method: req.method, url: req.url, body: req.body });
  });
  app.post('/test', (req, res) => {
    res.json({ ok: true, method: req.method, url: req.url, body: req.body });
  });

  // 挂载路由到 /api/* 和 /* 两个路径
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

  // 404 兜底
  app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ error: `路由不存在: ${req.method} ${req.url}` });
  });

  // 错误处理
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({ error: '服务器内部错误', detail: err.message });
  });

  return app;
}

export const app = createApp();
