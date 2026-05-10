import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  RotateCcw,
  Home,
  Volume2,
  MessageCircle,
  Eye,
  Users,
} from 'lucide-react'
import { saveAssessment, getLatestAssessment, getUser, generateId, formatDate, type AssessmentResult } from '../services/storage'

interface AssessmentPageProps {
  onBack: () => void
  onHome: () => void
}

// ==================== 题目数据 ====================

type Dimension = 'understanding' | 'expression' | 'pronunciation' | 'social'

interface Question {
  id: number
  dimension: Dimension
  dimensionLabel: string
  type: 'image-select' | 'naming' | 'repeat' | 'scenario'
  prompt: string
  emoji: string
  options?: { label: string; emoji: string; correct: boolean }[]
  correctAnswer?: string
}

const questions: Question[] = [
  // 理解能力 (5题) - 听指令选择图片
  {
    id: 1,
    dimension: 'understanding',
    dimensionLabel: '理解能力',
    type: 'image-select',
    prompt: '请点击红色的苹果',
    emoji: '🍎',
    options: [
      { label: '红苹果', emoji: '🍎', correct: true },
      { label: '绿苹果', emoji: '🍏', correct: false },
      { label: '黄香蕉', emoji: '🍌', correct: false },
      { label: '紫葡萄', emoji: '🍇', correct: false },
    ],
  },
  {
    id: 2,
    dimension: 'understanding',
    dimensionLabel: '理解能力',
    type: 'image-select',
    prompt: '请找到最大的动物',
    emoji: '🐘',
    options: [
      { label: '小猫', emoji: '🐱', correct: false },
      { label: '大象', emoji: '🐘', correct: true },
      { label: '小鸟', emoji: '🐦', correct: false },
      { label: '小鱼', emoji: '🐟', correct: false },
    ],
  },
  {
    id: 3,
    dimension: 'understanding',
    dimensionLabel: '理解能力',
    type: 'image-select',
    prompt: '哪个是可以在天上飞的？',
    emoji: '✈️',
    options: [
      { label: '飞机', emoji: '✈️', correct: true },
      { label: '汽车', emoji: '🚗', correct: false },
      { label: '轮船', emoji: '🚢', correct: false },
      { label: '火车', emoji: '🚂', correct: false },
    ],
  },
  {
    id: 4,
    dimension: 'understanding',
    dimensionLabel: '理解能力',
    type: 'image-select',
    prompt: '哪个是用来喝水的？',
    emoji: '🥤',
    options: [
      { label: '杯子', emoji: '🥤', correct: true },
      { label: '帽子', emoji: '🎩', correct: false },
      { label: '鞋子', emoji: '👟', correct: false },
      { label: '书本', emoji: '📖', correct: false },
    ],
  },
  {
    id: 5,
    dimension: 'understanding',
    dimensionLabel: '理解能力',
    type: 'image-select',
    prompt: '请找到圆圆的东西',
    emoji: '⚽',
    options: [
      { label: '足球', emoji: '⚽', correct: true },
      { label: '铅笔', emoji: '✏️', correct: false },
      { label: '剪刀', emoji: '✂️', correct: false },
      { label: '雨伞', emoji: '☂️', correct: false },
    ],
  },

  // 表达能力 (5题) - 看图命名
  {
    id: 6,
    dimension: 'expression',
    dimensionLabel: '表达能力',
    type: 'naming',
    prompt: '这是什么动物？',
    emoji: '🐶',
    options: [
      { label: '小狗', emoji: '🐶', correct: true },
      { label: '小猫', emoji: '🐱', correct: false },
      { label: '兔子', emoji: '🐰', correct: false },
      { label: '小鸡', emoji: '🐥', correct: false },
    ],
  },
  {
    id: 7,
    dimension: 'expression',
    dimensionLabel: '表达能力',
    type: 'naming',
    prompt: '这是什么水果？',
    emoji: '🍓',
    options: [
      { label: '苹果', emoji: '🍎', correct: false },
      { label: '草莓', emoji: '🍓', correct: true },
      { label: '西瓜', emoji: '🍉', correct: false },
      { label: '桃子', emoji: '🍑', correct: false },
    ],
  },
  {
    id: 8,
    dimension: 'expression',
    dimensionLabel: '表达能力',
    type: 'naming',
    prompt: '这是什么颜色？',
    emoji: '🔵',
    options: [
      { label: '红色', emoji: '🔴', correct: false },
      { label: '蓝色', emoji: '🔵', correct: true },
      { label: '绿色', emoji: '🟢', correct: false },
      { label: '黄色', emoji: '🟡', correct: false },
    ],
  },
  {
    id: 9,
    dimension: 'expression',
    dimensionLabel: '表达能力',
    type: 'naming',
    prompt: '这个小朋友在做什么？',
    emoji: '📚',
    options: [
      { label: '在睡觉', emoji: '😴', correct: false },
      { label: '在吃饭', emoji: '🍽️', correct: false },
      { label: '在看书', emoji: '📚', correct: true },
      { label: '在跑步', emoji: '🏃', correct: false },
    ],
  },
  {
    id: 10,
    dimension: 'expression',
    dimensionLabel: '表达能力',
    type: 'naming',
    prompt: '这是什么天气？',
    emoji: '☀️',
    options: [
      { label: '下雨天', emoji: '🌧️', correct: false },
      { label: '下雪天', emoji: '❄️', correct: false },
      { label: '晴天', emoji: '☀️', correct: true },
      { label: '大风天', emoji: '💨', correct: false },
    ],
  },

  // 发音能力 (5题) - 跟读词语
  {
    id: 11,
    dimension: 'pronunciation',
    dimensionLabel: '发音能力',
    type: 'repeat',
    prompt: '请跟读：苹果',
    emoji: '🍎',
    options: [
      { label: '苹果', emoji: '🍎', correct: true },
      { label: '平果', emoji: '🍏', correct: false },
      { label: '果苹', emoji: '🍇', correct: false },
      { label: '苹朵', emoji: '🌸', correct: false },
    ],
  },
  {
    id: 12,
    dimension: 'pronunciation',
    dimensionLabel: '发音能力',
    type: 'repeat',
    prompt: '请跟读：大象',
    emoji: '🐘',
    options: [
      { label: '大象', emoji: '🐘', correct: true },
      { label: '大像', emoji: '🖼️', correct: false },
      { label: '大巷', emoji: '🏘️', correct: false },
      { label: '大向', emoji: '🧭', correct: false },
    ],
  },
  {
    id: 13,
    dimension: 'pronunciation',
    dimensionLabel: '发音能力',
    type: 'repeat',
    prompt: '请跟读：蝴蝶',
    emoji: '🦋',
    options: [
      { label: '蝴蝶', emoji: '🦋', correct: true },
      { label: '湖蝶', emoji: '🌊', correct: false },
      { label: '蝴爹', emoji: '🦗', correct: false },
      { label: '蝴铁', emoji: '🔩', correct: false },
    ],
  },
  {
    id: 14,
    dimension: 'pronunciation',
    dimensionLabel: '发音能力',
    type: 'repeat',
    prompt: '请跟读：西瓜',
    emoji: '🍉',
    options: [
      { label: '西瓜', emoji: '🍉', correct: true },
      { label: '西爪', emoji: '🦀', correct: false },
      { label: '希瓜', emoji: '🎃', correct: false },
      { label: '细瓜', emoji: '🥒', correct: false },
    ],
  },
  {
    id: 15,
    dimension: 'pronunciation',
    dimensionLabel: '发音能力',
    type: 'repeat',
    prompt: '请跟读：彩虹',
    emoji: '🌈',
    options: [
      { label: '彩虹', emoji: '🌈', correct: true },
      { label: '菜虹', emoji: '🥬', correct: false },
      { label: '彩红', emoji: '❤️', correct: false },
      { label: '猜虹', emoji: '🤔', correct: false },
    ],
  },

  // 社交能力 (5题) - 情景选择
  {
    id: 16,
    dimension: 'social',
    dimensionLabel: '社交能力',
    type: 'scenario',
    prompt: '见到朋友应该说什么？',
    emoji: '👋',
    options: [
      { label: '你好！', emoji: '👋', correct: true },
      { label: '走开！', emoji: '😤', correct: false },
      { label: '不说话', emoji: '🤐', correct: false },
      { label: '给我！', emoji: '🖐️', correct: false },
    ],
  },
  {
    id: 17,
    dimension: 'social',
    dimensionLabel: '社交能力',
    type: 'scenario',
    prompt: '朋友把玩具给你玩，应该说什么？',
    emoji: '🧸',
    options: [
      { label: '还要！', emoji: '🤲', correct: false },
      { label: '谢谢！', emoji: '😊', correct: true },
      { label: '不要！', emoji: '🙅', correct: false },
      { label: '我的！', emoji: '💪', correct: false },
    ],
  },
  {
    id: 18,
    dimension: 'social',
    dimensionLabel: '社交能力',
    type: 'scenario',
    prompt: '不小心撞到别人了，应该怎么做？',
    emoji: '😅',
    options: [
      { label: '跑掉', emoji: '🏃', correct: false },
      { label: '笑一笑', emoji: '😄', correct: false },
      { label: '说对不起', emoji: '🙏', correct: true },
      { label: '假装没发生', emoji: '🙈', correct: false },
    ],
  },
  {
    id: 19,
    dimension: 'social',
    dimensionLabel: '社交能力',
    type: 'scenario',
    prompt: '看到小朋友在哭，应该怎么做？',
    emoji: '😢',
    options: [
      { label: '走开', emoji: '🚶', correct: false },
      { label: '问他怎么了', emoji: '🤗', correct: true },
      { label: '跟着哭', emoji: '😭', correct: false },
      { label: '笑他', emoji: '😂', correct: false },
    ],
  },
  {
    id: 20,
    dimension: 'social',
    dimensionLabel: '社交能力',
    type: 'scenario',
    prompt: '想加入小朋友们的游戏，应该怎么说？',
    emoji: '🎮',
    options: [
      { label: '我可以一起玩吗？', emoji: '😊', correct: true },
      { label: '给我玩！', emoji: '😤', correct: false },
      { label: '抢过来', emoji: '🏃', correct: false },
      { label: '在旁边看着', emoji: '👀', correct: false },
    ],
  },
]

// ==================== 维度配置 ====================

const dimensionConfig: Record<Dimension, { icon: React.ReactNode; color: string; label: string }> = {
  understanding: { icon: <Eye size={20} />, color: '#4ECDC4', label: '理解能力' },
  expression: { icon: <MessageCircle size={20} />, color: '#FF6B9D', label: '表达能力' },
  pronunciation: { icon: <Volume2 size={20} />, color: '#FFE66D', label: '发音能力' },
  social: { icon: <Users size={20} />, color: '#C7CEEA', label: '社交能力' },
}

// ==================== 主组件 ====================

type Step = 'welcome' | 'test' | 'result'

export default function AssessmentPage({ onBack, onHome }: AssessmentPageProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [ageGroup, setAgeGroup] = useState<string>('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([]) // 0=错 1=对
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)

  const user = getUser()
  const lastAssessment = getLatestAssessment()

  // 计算各维度得分
  const dimensionScores = useMemo(() => {
    if (answers.length === 0) return null
    const scores = { understanding: 0, expression: 0, pronunciation: 0, social: 0 }
    questions.forEach((q, i) => {
      if (i < answers.length) {
        scores[q.dimension] += answers[i]
      }
    })
    return {
      understanding: Math.round((scores.understanding / 5) * 100),
      expression: Math.round((scores.expression / 5) * 100),
      pronunciation: Math.round((scores.pronunciation / 5) * 100),
      social: Math.round((scores.social / 5) * 100),
    }
  }, [answers])

  // 生成个性化推荐
  const getRecommendations = (scores: { understanding: number; expression: number; pronunciation: number; social: number }) => {
    const recs: string[] = []
    if (scores.understanding < 60) recs.push('建议多玩"图片配对大挑战"游戏，提升听指令和理解能力')
    if (scores.expression < 60) recs.push('可以尝试看图说话练习，每天描述3张图片来提升表达能力')
    if (scores.pronunciation < 60) recs.push('推荐"声音魔法师"游戏，帮助改善发音准确性')
    if (scores.social < 60) recs.push('建议通过角色扮演游戏，练习日常社交对话')
    if (scores.understanding >= 80) recs.push('理解能力很棒！可以尝试更复杂的指令练习')
    if (scores.expression >= 80) recs.push('表达能力优秀！试试用完整句子描述故事吧')
    if (scores.pronunciation >= 80) recs.push('发音很标准！可以挑战更长的词语和句子')
    if (scores.social >= 80) recs.push('社交能力很好！继续保持积极的交流态度')
    if (recs.length === 0) recs.push('整体表现不错！坚持每天训练，会越来越棒的！')
    return recs
  }

  // 处理选择答案
  const handleSelectOption = (optionIndex: number) => {
    if (showFeedback) return

    const question = questions[currentQuestion]
    const isCorrect = question.options![optionIndex].correct

    setSelectedOption(optionIndex)
    setShowFeedback(true)
    setFeedbackCorrect(isCorrect)

    const newAnswers = [...answers, isCorrect ? 1 : 0]
    setAnswers(newAnswers)
  }

  // 下一题
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
      setShowFeedback(false)
    } else {
      // 完成评估
      const scores = dimensionScores!
      const totalScore = Math.round(
        (scores.understanding + scores.expression + scores.pronunciation + scores.social) / 4
      )
      const recommendations = getRecommendations(scores)

      const assessmentResult: AssessmentResult = {
        id: generateId(),
        childName: user?.childName ?? '小朋友',
        ageGroup,
        date: new Date().toISOString(),
        scores,
        totalScore,
        answers,
        recommendations,
      }

      saveAssessment(assessmentResult)
      setResult(assessmentResult)
      setStep('result')
    }
  }

  // 重新开始
  const handleRestart = () => {
    setStep('welcome')
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedOption(null)
    setShowFeedback(false)
    setResult(null)
  }

  // 获取当前维度进度
  const getDimensionProgress = () => {
    const q = questions[currentQuestion]
    const dimIndex = questions
      .slice(0, currentQuestion)
      .filter((item) => item.dimension === q.dimension).length
    return { current: dimIndex + 1, total: 5 }
  }

  // ==================== SVG 雷达图 ====================

  function RadarChart({ scores }: { scores: { understanding: number; expression: number; pronunciation: number; social: number } }) {
    const size = 240
    const center = size / 2
    const maxRadius = 90
    const dimensions: { key: Dimension; label: string; angle: number }[] = [
      { key: 'understanding', label: '理解', angle: -Math.PI / 2 },
      { key: 'expression', label: '表达', angle: 0 },
      { key: 'pronunciation', label: '发音', angle: Math.PI / 2 },
      { key: 'social', label: '社交', angle: Math.PI },
    ]

    const getPoint = (angle: number, value: number) => {
      const r = (value / 100) * maxRadius
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    }

    // 背景网格
    const gridLevels = [25, 50, 75, 100]
    const gridPolygons = gridLevels.map((level) => {
      const points = dimensions
        .map((d) => {
          const p = getPoint(d.angle, level)
          return `${p.x},${p.y}`
        })
        .join(' ')
      return points
    })

    // 数据多边形
    const dataPoints = dimensions
      .map((d) => {
        const p = getPoint(d.angle, scores[d.key])
        return `${p.x},${p.y}`
      })
      .join(' ')

    // 数据点圆点
    const dataDots = dimensions.map((d) => getPoint(d.angle, scores[d.key]))

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景网格 */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#E8E8E8"
            strokeWidth="1"
          />
        ))}

        {/* 轴线 */}
        {dimensions.map((d, i) => {
          const p = getPoint(d.angle, 100)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="#E8E8E8"
              strokeWidth="1"
            />
          )
        })}

        {/* 数据区域 */}
        <motion.polygon
          points={dataPoints}
          fill="rgba(255, 107, 157, 0.2)"
          stroke="#FF6B9D"
          strokeWidth="2.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* 数据点 */}
        {dataDots.map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r="5"
            fill="#FF6B9D"
            stroke="white"
            strokeWidth="2"
            initial={{ r: 0 }}
            animate={{ r: 5 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
          />
        ))}

        {/* 标签 */}
        {dimensions.map((d, i) => {
          const labelR = maxRadius + 24
          const lx = center + labelR * Math.cos(d.angle)
          const ly = center + labelR * Math.sin(d.angle)
          const score = scores[d.key]
          return (
            <g key={i}>
              <text
                x={lx}
                y={ly - 6}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#4A4A4A"
              >
                {d.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={dimensionConfig[d.key].color}
              >
                {score}分
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  // ==================== 渲染 ====================

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        {/* ===== 欢迎步骤 ===== */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {/* 返回按钮 */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                fontSize: '20px',
              }}
            >
              ←
            </motion.button>

            {/* 标题区 */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{ fontSize: '72px', marginBottom: '12px' }}
              >
                📋
              </motion.div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                }}
              >
                语言能力评估
              </h1>
              <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.6 }}>
                通过有趣的测试，了解孩子的语言发展水平
              </p>
            </div>

            {/* 评估介绍卡片 */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#4A4A4A' }}>
                评估包含以下内容：
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(dimensionConfig).map(([key, config]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '14px',
                      background: `${config.color}15`,
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: `${config.color}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: config.color,
                      }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#4A4A4A' }}>
                        {config.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>5道趣味题目</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 选择年龄段 */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#4A4A4A' }}>
                选择孩子的年龄段
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { label: '3-5岁', value: '3-5', emoji: '🧒' },
                  { label: '5-8岁', value: '5-8', emoji: '👦' },
                  { label: '8-12岁', value: '8-12', emoji: '🧑' },
                ].map((age) => (
                  <motion.button
                    key={age.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAgeGroup(age.value)}
                    style={{
                      padding: '16px 8px',
                      borderRadius: '16px',
                      border: ageGroup === age.value ? '2px solid #FF6B9D' : '2px solid #E8E8E8',
                      background: ageGroup === age.value ? '#FFF0F5' : '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>{age.emoji}</div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: ageGroup === age.value ? '#FF6B9D' : '#666',
                      }}
                    >
                      {age.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 上次评估记录 */}
            {lastAssessment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="card"
                style={{
                  marginBottom: '20px',
                  background: 'linear-gradient(135deg, #FFF5F7 0%, #E8F6F5 100%)',
                  border: '2px dashed #FFB8D0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Star size={18} color="#FFE66D" fill="#FFE66D" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#4A4A4A' }}>
                    上次评估
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  {formatDate(lastAssessment.date)} - 总分 {lastAssessment.totalScore}分
                </div>
              </motion.div>
            )}

            {/* 开始按钮 */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!ageGroup) {
                  setAgeGroup('3-5')
                }
                setStep('test')
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '18px',
                padding: '18px',
              }}
            >
              <Sparkles size={22} />
              开始评估（共20题）
            </motion.button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#AAA',
                marginTop: '12px',
              }}
            >
              大约需要 5-10 分钟，可以随时中断
            </p>
          </motion.div>
        )}

        {/* ===== 测试步骤 ===== */}
        {step === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* 顶部信息栏 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1)
                    setAnswers(answers.slice(0, -1))
                    setSelectedOption(null)
                    setShowFeedback(false)
                  } else {
                    setStep('welcome')
                  }
                }}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  fontSize: '18px',
                }}
              >
                <ArrowLeft size={18} />
              </motion.button>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  {currentQuestion + 1} / {questions.length}
                </div>
              </div>

              {/* 维度标签 */}
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: `${dimensionConfig[questions[currentQuestion].dimension].color}20`,
                  color: dimensionConfig[questions[currentQuestion].dimension].color,
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {dimensionConfig[questions[currentQuestion].dimension].icon}
                {questions[currentQuestion].dimensionLabel}
              </div>
            </div>

            {/* 总进度条 */}
            <div className="progress-bar" style={{ marginBottom: '8px', height: '8px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  background: `linear-gradient(90deg, ${dimensionConfig[questions[currentQuestion].dimension].color}, ${dimensionConfig[questions[currentQuestion].dimension].color}CC)`,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#AAA', marginBottom: '20px' }}>
              <span>当前维度：第 {getDimensionProgress().current}/{getDimensionProgress().total} 题</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>

            {/* 题目卡片 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="card"
                style={{ padding: '32px 24px', marginBottom: '20px' }}
              >
                {/* 题目 emoji */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                  style={{
                    fontSize: '64px',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  {questions[currentQuestion].emoji}
                </motion.div>

                {/* 题目文字 */}
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#4A4A4A',
                    textAlign: 'center',
                    marginBottom: '24px',
                    lineHeight: 1.4,
                  }}
                >
                  {questions[currentQuestion].prompt}
                </h2>

                {/* 选项 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                  }}
                >
                  {questions[currentQuestion].options!.map((option, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrectOption = option.correct
                    let borderColor = '#E8E8E8'
                    let bgColor = '#FAFAFA'
                    let extraStyle: React.CSSProperties = {}

                    if (showFeedback) {
                      if (isCorrectOption) {
                        borderColor = '#95E1D3'
                        bgColor = '#E8F6F5'
                      } else if (isSelected && !isCorrectOption) {
                        borderColor = '#F38181'
                        bgColor = '#FFF0F0'
                      } else {
                        extraStyle = { opacity: 0.5 }
                      }
                    } else if (isSelected) {
                      borderColor = '#FF6B9D'
                      bgColor = '#FFF0F5'
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!showFeedback ? { scale: 1.03 } : undefined}
                        whileTap={!showFeedback ? { scale: 0.97 } : undefined}
                        onClick={() => handleSelectOption(idx)}
                        style={{
                          padding: '16px 12px',
                          borderRadius: '16px',
                          border: `2px solid ${borderColor}`,
                          background: bgColor,
                          cursor: showFeedback ? 'default' : 'pointer',
                          transition: 'all 0.3s',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          ...extraStyle,
                        }}
                      >
                        <span style={{ fontSize: '32px' }}>{option.emoji}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A4A4A' }}>
                          {option.label}
                        </span>
                        {showFeedback && isCorrectOption && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <CheckCircle2 size={20} color="#95E1D3" />
                          </motion.div>
                        )}
                        {showFeedback && isSelected && !isCorrectOption && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <XCircle size={20} color="#F38181" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 即时反馈 */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: feedbackCorrect
                      ? 'linear-gradient(135deg, #E8F6F5 0%, #D4F5F0 100%)'
                      : 'linear-gradient(135deg, #FFF0F0 0%, #FFE0E0 100%)',
                  }}
                >
                  <motion.div
                    animate={
                      feedbackCorrect
                        ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                        : { x: [0, -8, 8, -8, 8, 0] }
                    }
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: '36px', marginBottom: '8px' }}
                  >
                    {feedbackCorrect ? '🎉' : '💪'}
                  </motion.div>
                  <p
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: feedbackCorrect ? '#2A9D8F' : '#E74C3C',
                    }}
                  >
                    {feedbackCorrect ? '回答正确！太棒了！' : '没关系，继续加油！'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 下一题按钮 */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '17px',
                      padding: '16px',
                    }}
                  >
                    {currentQuestion < questions.length - 1 ? (
                      <>
                        下一题
                        <ArrowRight size={20} />
                      </>
                    ) : (
                      <>
                        查看结果
                        <Sparkles size={20} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== 结果步骤 ===== */}
        {step === 'result' && result && dimensionScores && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            {/* 标题 */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{ fontSize: '64px', marginBottom: '8px' }}
              >
                🏆
              </motion.div>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px',
                }}
              >
                评估完成！
              </h1>
              <p style={{ fontSize: '14px', color: '#888' }}>
                {result.childName}的评估报告
              </p>
            </div>

            {/* 总分卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
              style={{
                textAlign: 'center',
                padding: '28px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px' }}>
                综合得分
              </p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                style={{
                  fontSize: '56px',
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                {result.totalScore}
              </motion.div>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                {result.totalScore >= 80
                  ? '表现优秀！继续保持！'
                  : result.totalScore >= 60
                    ? '表现不错！还有进步空间！'
                    : '加油！坚持训练会越来越好！'}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '12px',
                }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    color="#FFE66D"
                    fill={i < Math.ceil(result.totalScore / 20) ? '#FFE66D' : 'transparent'}
                  />
                ))}
              </div>
            </motion.div>

            {/* 雷达图 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
              style={{
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#4A4A4A' }}>
                能力分布
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RadarChart scores={dimensionScores} />
              </div>
            </motion.div>

            {/* 各维度得分详情 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
              style={{ marginBottom: '20px' }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#4A4A4A' }}>
                各维度详情
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(Object.entries(dimensionScores) as [Dimension, number][]).map(([key, score]) => {
                  const config = dimensionConfig[key]
                  return (
                    <div key={key}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: `${config.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: config.color,
                          }}
                        >
                          {config.icon}
                        </div>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: '#4A4A4A' }}>
                          {config.label}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: config.color }}>
                          {score}分
                        </span>
                      </div>
                      <div className="progress-bar" style={{ height: '10px' }}>
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          style={{ background: config.color }}
                        />
                      </div>
                      <p style={{ fontSize: '12px', color: '#AAA', marginTop: '4px' }}>
                        {score >= 80
                          ? '表现优秀'
                          : score >= 60
                            ? '表现良好'
                            : score >= 40
                              ? '需要加强'
                              : '建议重点练习'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* 个性化推荐 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
              style={{
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #FFF5F7 0%, #E8F6F5 100%)',
                border: '2px dashed #FFB8D0',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#4A4A4A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={18} color="#FF6B9D" />
                个性化推荐
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: '#FF6B9D', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}.
                    </span>
                    {rec}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRestart}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <RotateCcw size={18} />
                重新评估
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onHome}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Home size={18} />
                返回首页
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
