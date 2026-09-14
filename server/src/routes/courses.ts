import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses ORDER BY level').all();
  res.json({ courses });
});

router.get('/:id/units', (req, res) => {
  const units = db.prepare('SELECT * FROM units WHERE course_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ units });
});

router.get('/units/:id/lessons', (req, res) => {
  const lessons = db.prepare('SELECT * FROM lessons WHERE unit_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ lessons });
});

router.get('/lessons/:id', (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id) as any;
  if (!lesson) return res.status(404).json({ error: '课时不存在' });
  const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(lesson.unit_id) as any;
  const course = unit ? db.prepare('SELECT * FROM courses WHERE id = ?').get(unit.course_id) : null;
  res.json({ lesson, unit, course });
});

export default router;
