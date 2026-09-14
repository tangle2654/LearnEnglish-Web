import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const { lesson_id, type, correct, total, duration } = req.body;
  db.prepare(`INSERT INTO progress (user_id, lesson_id, type, correct, total, duration) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(req.userId, lesson_id || null, type, correct || 0, total || 0, duration || 0);

  if (type === 'lesson') {
    db.prepare('INSERT OR IGNORE INTO completed_lessons (user_id, lesson_id) VALUES (?, ?)').run(req.userId, lesson_id);
  }

  const gained = (correct || 0) * 2 + (type === 'lesson' ? 10 : 0);
  if (gained > 0) {
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(gained, req.userId);
  }

  // Check badges
  checkAndAwardBadges(req.userId!);

  res.json({ message: '进度已记录', pointsGained: gained });
});

router.get('/stats', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.userId;
  const completedLessons = db.prepare('SELECT COUNT(*) as count FROM completed_lessons WHERE user_id = ?').get(userId) as any;
  const totalProgress = db.prepare('SELECT SUM(correct) as correct, SUM(total) as total, SUM(duration) as duration FROM progress WHERE user_id = ?').get(userId) as any;
  const accuracy = totalProgress.total > 0 ? Math.round((totalProgress.correct / totalProgress.total) * 100) : 0;
  const user = db.prepare('SELECT points, level FROM users WHERE id = ?').get(userId) as any;

  // Weekly activity
  const weekly = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count, SUM(duration) as duration
    FROM progress WHERE user_id = ? AND created_at >= date('now', '-7 days')
    GROUP BY DATE(created_at) ORDER BY date
  `).all(userId);

  res.json({
    completedLessons: completedLessons.count,
    correct: totalProgress.correct || 0,
    total: totalProgress.total || 0,
    accuracy,
    duration: totalProgress.duration || 0,
    points: user.points,
    level: user.level,
    weekly,
  });
});

router.get('/completed-lessons', authMiddleware, (req: AuthRequest, res) => {
  const lessons = db.prepare(`
    SELECT l.* FROM lessons l
    JOIN completed_lessons cl ON l.id = cl.lesson_id
    WHERE cl.user_id = ? ORDER BY cl.completed_at DESC
  `).all(req.userId);
  res.json({ lessons });
});

function checkAndAwardBadges(userId: number) {
  const badges = db.prepare('SELECT * FROM badges').all() as any[];
  const stats = db.prepare('SELECT COUNT(*) as completed FROM completed_lessons WHERE user_id = ?').get(userId) as any;
  const progressStats = db.prepare('SELECT SUM(correct) as correct FROM progress WHERE user_id = ?').get(userId) as any;

  for (const badge of badges) {
    const earned = db.prepare('SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?').get(userId, badge.id);
    if (earned) continue;

    let shouldAward = false;
    if (badge.condition_type === 'completed_lessons' && stats.completed >= badge.condition_value) {
      shouldAward = true;
    } else if (badge.condition_type === 'correct_answers' && (progressStats.correct || 0) >= badge.condition_value) {
      shouldAward = true;
    } else if (badge.condition_type === 'points') {
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
      if (user.points >= badge.condition_value) shouldAward = true;
    }

    if (shouldAward) {
      db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badge.id);
      if (badge.points > 0) {
        db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(badge.points, userId);
      }
    }
  }
}

export default router;
