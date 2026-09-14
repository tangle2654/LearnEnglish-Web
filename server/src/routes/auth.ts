import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { authMiddleware, signToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: '请填写完整信息' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email) as any;
  if (existing) {
    return res.status(409).json({ error: '用户名或邮箱已存在' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashed);
  const token = signToken(result.lastInsertRowid as number);
  const user = db.prepare('SELECT id, username, email, level, points FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, level: user.level, points: user.points } });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, username, email, level, points, avatar FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ user });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: '已退出登录' });
});

export default router;
