import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/assessment/submit
router.post('/submit', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      comprehension,
      expression,
      pronunciation,
      social,
      ageLevel,
      details,
    } = req.body;

    // 验证必填字段
    if (
      comprehension === undefined ||
      expression === undefined ||
      pronunciation === undefined ||
      social === undefined
    ) {
      res.status(400).json({ error: '缺少必填的评估字段' });
      return;
    }

    // 计算总分
    const totalScore = comprehension + expression + pronunciation + social;

    // 保存评估结果
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        comprehension,
        expression,
        pronunciation,
        social,
        totalScore,
        ageLevel: ageLevel || null,
        details: details || null,
      },
    });

    res.status(201).json({ assessment });
  } catch (error: any) {
    res.status(500).json({ error: '提交评估失败', detail: error.message });
  }
});

// GET /api/assessment/history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ assessments });
  } catch (error: any) {
    res.status(500).json({ error: '获取评估历史失败', detail: error.message });
  }
});

export default router;
