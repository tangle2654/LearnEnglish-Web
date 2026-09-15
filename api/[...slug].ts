import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { app } = require('../server/src/app');
    return app(req, res);
  } catch (err: any) {
    console.error('[Function Error]', err);
    return res.status(500).json({
      error: '函数初始化失败',
      detail: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 5)
    });
  }
}
