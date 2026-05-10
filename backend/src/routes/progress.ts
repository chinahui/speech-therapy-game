import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/progress/save
router.post('/save', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { gameType, score, stars, duration } = req.body;

    // 验证必填字段
    if (!gameType || score === undefined || stars === undefined || duration === undefined) {
      res.status(400).json({ error: '缺少必填的进度字段 (gameType, score, stars, duration)' });
      return;
    }

    // 保存进度
    const progress = await prisma.progress.create({
      data: {
        userId,
        gameType,
        score,
        stars,
        duration,
      },
    });

    res.status(201).json({ progress });
  } catch (error: any) {
    res.status(500).json({ error: '保存进度失败', detail: error.message });
  }
});

// GET /api/progress/summary
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // 获取所有进度记录
    const records = await prisma.progress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 按游戏类型汇总
    const summaryMap: Record<string, {
      gameType: string;
      totalGames: number;
      totalScore: number;
      avgScore: number;
      totalStars: number;
      avgStars: number;
      totalDuration: number;
      bestScore: number;
      lastPlayed: string | null;
    }> = {};

    for (const record of records) {
      if (!summaryMap[record.gameType]) {
        summaryMap[record.gameType] = {
          gameType: record.gameType,
          totalGames: 0,
          totalScore: 0,
          avgScore: 0,
          totalStars: 0,
          avgStars: 0,
          totalDuration: 0,
          bestScore: 0,
          lastPlayed: null,
        };
      }
      const entry = summaryMap[record.gameType];
      entry.totalGames += 1;
      entry.totalScore += record.score;
      entry.totalStars += record.stars;
      entry.totalDuration += record.duration;
      entry.bestScore = Math.max(entry.bestScore, record.score);
      entry.lastPlayed = record.createdAt.toISOString();
    }

    // 计算平均值
    const summary = Object.values(summaryMap).map((entry) => ({
      ...entry,
      avgScore: Math.round(entry.totalScore / entry.totalGames),
      avgStars: Math.round((entry.totalStars / entry.totalGames) * 10) / 10,
    }));

    res.json({ summary, totalRecords: records.length });
  } catch (error: any) {
    res.status(500).json({ error: '获取进度汇总失败', detail: error.message });
  }
});

export default router;
