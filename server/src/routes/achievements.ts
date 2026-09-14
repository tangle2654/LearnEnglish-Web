import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/badges', authMiddleware, (req: AuthRequest, res) => {
  const badges = db.prepare('SELECT * FROM badges ORDER BY id').all() as any[];
  const earned = db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(req.userId) as any[];
  const earnedIds = new Set(earned.map(e => e.badge_id));
  const result = badges.map(b => ({ ...b, earned: earnedIds.has(b.id) }));
  res.json({ badges: result });
});

router.get('/leaderboard', (req, res) => {
  const users = db.prepare(`
    SELECT id, username, points, avatar FROM users
    ORDER BY points DESC LIMIT 20
  `).all();
  res.json({ users });
});

router.get('/my-badges', authMiddleware, (req: AuthRequest, res) => {
  const badges = db.prepare(`
    SELECT b.* FROM badges b
    JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = ? ORDER BY ub.earned_at DESC
  `).all(req.userId);
  res.json({ badges });
});

export default router;
