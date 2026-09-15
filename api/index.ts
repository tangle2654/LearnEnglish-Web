import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  try {
    // Vercel rewrite 后 req.url 可能变成 /api，需要从 header 获取原始路径
    const originalUrl =
      (req.headers['x-now-original-url'] as string) ||
      (req.headers['x-vercel-original-url'] as string) ||
      req.url;

    // 记录请求信息用于调试
    console.log('[Handler]', req.method, 'url=', req.url, 'original=', originalUrl);

    // 用原始路径替换 req.url，让 Express 能正确路由
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
