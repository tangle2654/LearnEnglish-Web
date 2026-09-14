import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  const { level, unit_id } = req.query;
  let sql = 'SELECT * FROM vocabulary WHERE 1=1';
  const params: any[] = [];
  if (level) { sql += ' AND level = ?'; params.push(level); }
  if (unit_id) { sql += ' AND unit_id = ?'; params.push(unit_id); }
  sql += ' ORDER BY id';
  const words = db.prepare(sql).all(...params);
  res.json({ words });
});

router.get('/user-words', authMiddleware, (req: AuthRequest, res) => {
  const words = db.prepare(`
    SELECT v.* FROM vocabulary v
    JOIN user_words uw ON v.id = uw.word_id
    WHERE uw.user_id = ?
    ORDER BY uw.created_at DESC
  `).all(req.userId);
  res.json({ words });
});

router.post('/user-words', authMiddleware, (req: AuthRequest, res) => {
  const { word_id } = req.body;
  if (!word_id) return res.status(400).json({ error: '缺少 word_id' });
  try {
    db.prepare('INSERT OR IGNORE INTO user_words (user_id, word_id) VALUES (?, ?)').run(req.userId, word_id);
    res.json({ message: '已收藏' });
  } catch {
    res.status(500).json({ error: '收藏失败' });
  }
});

router.delete('/user-words/:wordId', authMiddleware, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM user_words WHERE user_id = ? AND word_id = ?').run(req.userId, req.params.wordId);
  res.json({ message: '已取消收藏' });
});

export default router;
