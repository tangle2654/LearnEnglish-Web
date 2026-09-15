import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  try {
    // Vercel rewrite 到 /api 后，需从 header 恢复原始路径
    const originalUrl =
      (req.headers['x-now-original-url'] as string) ||
      (req.headers['x-vercel-original-url'] as string) ||
      req.url;

    if (originalUrl && originalUrl !== req.url) {
      req.url = originalUrl;
    }

    const { app } = require('../server/src/app');
    return app(req, res);
  } catch (err: any) {
    console.error('[Function Error]', err);
    return res.status(500).json({
      error: '函数初始化失败',
      detail: err?.message || String(err),
    });
  }
}
