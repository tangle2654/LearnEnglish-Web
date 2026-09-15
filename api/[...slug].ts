import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  try {
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
