import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/leaderboard
router.get('/', (_req, res) => {
  try {
    const leaderboard = db.getLeaderboard();
    return res.json({ leaderboard });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
