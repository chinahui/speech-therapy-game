import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Volume2, Star, Sparkles } from 'lucide-react'

interface Game1Props {
  onBack: () => void
}

interface Question {
  id: number
  word: string
  correctImage: string
  options: string[]
}

const questions: Question[] = [
  {
    id: 1,
    word: '苹果',
    correctImage: '🍎',
    options: ['🍎', '🍌', '🍇', '🍊'],
  },
  {
    id: 2,
    word: '小猫',
    correctImage: '🐱',
    options: ['🐶', '🐱', '🐰', '🐭'],
  },
  {
    id: 3,
    word: '汽车',
    correctImage: '🚗',
    options: ['✈️', '🚢', '🚗', '🚲'],
  },
  {
    id: 4,
    word: '太阳',
    correctImage: '☀️',
    options: ['🌙', '☀️', '⭐', '☁️'],
  },
  {
    id: 5,
    word: '花朵',
    correctImage: '🌸',
    options: ['🌲', '🌸', '🍀', '🌵'],
  },
]

export default function Game1_Matching({ onBack }: Game1Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]

  const speakWord = useCallback(() => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.word)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }, [currentQuestion])

  useEffect(() => {
    speakWord()
  }, [currentIndex, speakWord])

  const handleSelect = (option: string) => {
    if (showFeedback) return
    
    setSelectedOption(option)
    const isCorrect = option === currentQuestion.correctImage
    
    if (isCorrect) {
      setShowFeedback('correct')
      setScore(score + 1)
    } else {
      setShowFeedback('wrong')
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowFeedback(null)
        setSelectedOption(null)
      } else {
        setGameComplete(true)
      }
    }, 1500)
  }

  if (gameComplete) {
    return (
      <GameCompleteScreen 
        score={score} 
        total={questions.length} 
        onBack={onBack}
        onReplay={() => {
          setCurrentIndex(0)
          setScore(0)
          setGameComplete(false)
          setShowFeedback(null)
          setSelectedOption(null)
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E8F6F5 0%, #FFF5F7 100%)', padding: '20px' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '25px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={20} />
          返回
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Star size={18} fill="#FFE66D" color="#FFE66D" />
            <span style={{ fontWeight: 700 }}>{score}</span>
          </div>
          <div
            style={{
              background: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              fontSize: '14px',
            }}
          >
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar" style={{ marginBottom: '30px', height: '10px' }}>
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目区域 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center' }}
      >
        {/* 语音提示按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={speakWord}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            boxShadow: '0 8px 30px rgba(78, 205, 196, 0.4)',
          }}
        >
          <Volume2 size={48} color="white" />
        </motion.button>

        <h2
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#4A4A4A',
            marginBottom: '40px',
          }}
        >
          {currentQuestion.word}
        </h2>

        {/* 选项网格 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(option)}
              disabled={showFeedback !== null}
              style={{
                aspectRatio: '1',
                borderRadius: '24px',
                border: '4px solid',
                borderColor:
                  showFeedback && option === currentQuestion.correctImage
                    ? '#4ECDC4'
                    : showFeedback && option === selectedOption && option !== currentQuestion.correctImage
                    ? '#F38181'
                    : 'white',
                background: 'white',
                fontSize: '60px',
                cursor: showFeedback ? 'default' : 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                opacity: showFeedback && option !== selectedOption && option !== currentQuestion.correctImage ? 0.5 : 1,
              }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 反馈动画 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '120px',
              zIndex: 100,
              pointerEvents: 'none',
            }}
          >
            {showFeedback === 'correct' ? '🎉' : '💪'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示 */}
      <p
        style={{
          textAlign: 'center',
          marginTop: '40px',
          color: '#888',
          fontSize: '14px',
        }}
      >
        💡 点击喇叭听语音，然后选择正确的图片
      </p>
    </div>
  )
}

interface GameCompleteScreenProps {
  score: number
  total: number
  onBack: () => void
  onReplay: () => void
}

function GameCompleteScreen({ score, total, onBack, onReplay }: GameCompleteScreenProps) {
  const stars = score === total ? 3 : score >= total * 0.6 ? 2 : 1

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5F7 0%, #E8F6F5 50%, #FFFBE8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏆</div>
        
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#4A4A4A', marginBottom: '16px' }}>
          太棒了！
        </h1>
        
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
          你答对了 {score} / {total} 题
        </p>

        {/* 星星 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: star * 0.2 }}
              style={{ fontSize: '48px' }}
            >
              {star <= stars ? '⭐' : '⚫'}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReplay}
            className="btn btn-primary"
          >
            <Sparkles size={20} />
            再玩一次
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="btn btn-secondary"
          >
            <ArrowLeft size={20} />
            返回游戏列表
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
