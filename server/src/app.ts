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

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LinguaFlow API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/vocabulary', vocabRoutes);
  app.use('/api/grammar', grammarRoutes);
  app.use('/api/listening', listeningRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/recommendations', recommendRoutes);
  app.use('/api/posts', communityRoutes);
  app.use('/api', achievementRoutes);

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
  });

  return app;
}

export const app = createApp();
