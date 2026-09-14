import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  const { level } = req.query;
  let sql = 'SELECT * FROM listening_questions WHERE 1=1';
  const params: any[] = [];
  if (level) { sql += ' AND level = ?'; params.push(level); }
  sql += ' ORDER BY id';
  const questions = db.prepare(sql).all(...params).map((q: any) => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
  }));
  res.json({ questions });
});

router.get('/sentences', (req, res) => {
  const { level } = req.query;
  let sql = 'SELECT * FROM speaking_sentences WHERE 1=1';
  const params: any[] = [];
  if (level) { sql += ' AND level = ?'; params.push(level); }
  sql += ' ORDER BY id';
  const sentences = db.prepare(sql).all(...params);
  res.json({ sentences });
});

export default router;
