import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let sql = `
    SELECT p.*, u.username, u.avatar
    FROM posts p JOIN users u ON p.user_id = u.id
  `;
  const params: any[] = [];
  if (category && category !== 'all') {
    sql += ' WHERE p.category = ?';
    params.push(category);
  }
  sql += ' ORDER BY p.created_at DESC';
  const posts = db.prepare(sql).all(...params);
  res.json({ posts });
});

router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username, u.avatar
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id) as any;
  if (!post) return res.status(404).json({ error: '帖子不存在' });
  const comments = db.prepare(`
    SELECT c.*, u.username FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at
  `).all(req.params.id);
  res.json({ post, comments });
});

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: '标题和内容不能为空' });
  const result = db.prepare('INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)')
    .run(req.userId, title, content, category || 'general');
  res.status(201).json({ id: result.lastInsertRowid, message: '发布成功' });
});

router.post('/:id/comments', authMiddleware, (req: AuthRequest, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '评论内容不能为空' });
  db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)')
    .run(req.params.id, req.userId, content);
  res.status(201).json({ message: '评论成功' });
});

router.post('/:id/like', authMiddleware, (req: AuthRequest, res) => {
  const postId = req.params.id;
  const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(req.userId, postId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(req.userId, postId);
    db.prepare('UPDATE posts SET likes = likes - 1 WHERE id = ?').run(postId);
    res.json({ liked: false, message: '已取消点赞' });
  } else {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(req.userId, postId);
    db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(postId);
    res.json({ liked: true, message: '点赞成功' });
  }
});

router.get('/:id/liked', authMiddleware, (req: AuthRequest, res) => {
  const liked = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(req.userId, req.params.id);
  res.json({ liked: !!liked });
});

export default router;
