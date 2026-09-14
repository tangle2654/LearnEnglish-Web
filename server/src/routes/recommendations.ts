import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.userId;
  const user = db.prepare('SELECT level FROM users WHERE id = ?').get(userId) as any;
  const userLevel = user.level;

  // Get completed lesson ids
  const completedRows = db.prepare('SELECT lesson_id FROM completed_lessons WHERE user_id = ?').all(userId) as any[];
  const completedIds = new Set(completedRows.map(r => r.lesson_id));

  // Get user's accuracy per level (JOIN through lessons -> units -> courses)
  const levelAccuracy = db.prepare(`
    SELECT c.level, AVG(CAST(p.correct AS FLOAT)/NULLIF(p.total,0)) as acc
    FROM progress p
    LEFT JOIN lessons l ON p.lesson_id = l.id
    LEFT JOIN units u ON l.unit_id = u.id
    LEFT JOIN courses c ON u.course_id = c.id
    WHERE p.user_id = ? AND c.level IS NOT NULL
    GROUP BY c.level
  `).all(userId) as any[];
  const lowAccuracyLevels = levelAccuracy.filter(r => r.acc < 0.6).map(r => r.level);

  // Find recommended lessons: user's current level, not completed
  const recommendedLessons = db.prepare(`
    SELECT l.*, u.title as unit_title, c.level, c.title as course_title
    FROM lessons l
    JOIN units u ON l.unit_id = u.id
    JOIN courses c ON u.course_id = c.id
    WHERE c.level = ?
    ORDER BY u.sort_order, l.sort_order
    LIMIT 6
  `).all(userLevel) as any[];

  const nextLessons = recommendedLessons.filter(l => !completedIds.has(l.id));

  // Review suggestions for low accuracy levels
  const reviewLessons = lowAccuracyLevels.length > 0 ? db.prepare(`
    SELECT l.*, u.title as unit_title, c.level, c.title as course_title
    FROM lessons l
    JOIN units u ON l.unit_id = u.id
    JOIN courses c ON u.course_id = c.id
    WHERE c.level IN (${lowAccuracyLevels.map(() => '?').join(',')})
    ORDER BY u.sort_order, l.sort_order
    LIMIT 4
  `).all(...lowAccuracyLevels) : [];

  res.json({
    currentLevel: userLevel,
    nextLessons: nextLessons.slice(0, 4),
    reviewLessons,
    message: nextLessons.length > 0 ? '继续你当前等级的学习吧！' : '太棒了！尝试挑战更高等级',
  });
});

export default router;
