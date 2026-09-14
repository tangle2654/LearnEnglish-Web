import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  const { level, unit_id } = req.query;
  let sql = 'SELECT * FROM grammar_questions WHERE 1=1';
  const params: any[] = [];
  if (level) { sql += ' AND level = ?'; params.push(level); }
  if (unit_id) { sql += ' AND unit_id = ?'; params.push(unit_id); }
  sql += ' ORDER BY id';
  const questions = db.prepare(sql).all(...params).map((q: any) => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
  }));
  res.json({ questions });
});

export default router;
