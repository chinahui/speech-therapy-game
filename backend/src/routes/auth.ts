import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'speech-therapy-game-secret-key-2024';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, childName, childAge } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: '用户名、邮箱和密码为必填项' });
      return;
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      res.status(409).json({ error: '用户名或邮箱已被注册' });
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        childName: childName || null,
        childAge: childAge || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        childName: true,
        childAge: true,
        createdAt: true,
      },
    });

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: '注册失败', detail: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: '邮箱和密码为必填项' });
      return;
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        childName: user.childName,
        childAge: user.childAge,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: '登录失败', detail: error.message });
  }
});

export default router;
