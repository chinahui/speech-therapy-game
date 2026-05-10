import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mic, Star, Sparkles, Volume2 } from 'lucide-react'

interface Game2Props {
  onBack: () => void
}

interface WordItem {
  id: number
  word: string
  emoji: string
  hint: string
}

const words: WordItem[] = [
  { id: 1, word: '苹果', emoji: '🍎', hint: '红红的水果' },
  { id: 2, word: '太阳', emoji: '☀️', hint: '白天挂在天上' },
  { id: 3, word: '小猫', emoji: '🐱', hint: '喵喵叫的动物' },
  { id: 4, word: '汽车', emoji: '🚗', hint: '四个轮子的交通工具' },
  { id: 5, word: '花朵', emoji: '🌸', hint: '春天开放' },
]

// @ts-ignore - Web Speech API
export default function Game2_VoiceMagic({ onBack }: Game2Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showHint, setShowHint] = useState(false)
  
  // @ts-ignore
  const recognitionRef = useRef<any>(null)
  const currentWord = words[currentIndex]

  // 初始化语音识别
  useEffect(() => {
    // @ts-ignore
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'zh-CN'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const results = event.results
        if (results.length > 0) {
          const lastResult = results[results.length - 1]
          setTranscript(lastResult[0].transcript)
          
          if (lastResult.isFinal) {
            checkAnswer(lastResult[0].transcript)
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const checkAnswer = (spokenText: string) => {
    const normalizedSpoken = spokenText.replace(/[。，！？\s]/g, '')
    const normalizedTarget = currentWord.word
    
    // 简单匹配：包含目标词或相似度较高
    const isCorrect = normalizedSpoken.includes(normalizedTarget) || 
                      normalizedTarget.includes(normalizedSpoken) ||
                      calculateSimilarity(normalizedSpoken, normalizedTarget) > 0.6

    if (isCorrect) {
      setFeedback('correct')
      setScore(score + 1)
    } else {
      setFeedback('wrong')
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setFeedback(null)
        setTranscript('')
        setShowHint(false)
      } else {
        setGameComplete(true)
      }
    }, 2000)
  }

  // 简单相似度计算
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakWord = useCallback(() => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    }
  }, [currentWord])

  if (gameComplete) {
    return (
      <GameCompleteScreen
        score={score}
        total={words.length}
        onBack={onBack}
        onReplay={() => {
          setCurrentIndex(0)
          setScore(0)
          setGameComplete(false)
          setFeedback(null)
          setTranscript('')
        }}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5F7 0%, #FCE4EC 100%)',
        padding: '20px',
      }}
    >
      {/* 顶部导航 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
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
            {currentIndex + 1} / {words.length}
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar" style={{ marginBottom: '30px', height: '10px' }}>
        <div
          className="progress-fill"
          style={{
            width: `${((currentIndex + 1) / words.length) * 100}%`,
            background: 'linear-gradient(90deg, #FF6B9D, #F06292)',
          }}
        />
      </div>

      {/* 游戏区域 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center' }}
      >
        {/* 魔法精灵 */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ fontSize: '100px', marginBottom: '20px' }}
        >
          🧙‍♀️
        </motion.div>

        {/* 题目卡片 */}
        <div
          style={{
            background: 'white',
            borderRadius: '28px',
            padding: '32px',
            maxWidth: '400px',
            margin: '0 auto 30px',
            boxShadow: '0 8px 30px rgba(255, 107, 157, 0.2)',
          }}
        >
          <div style={{ fontSize: '72px', marginBottom: '16px' }}>{currentWord.emoji}</div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FF6B9D', marginBottom: '8px' }}>
            {currentWord.word}
          </h2>
          
          <button
            onClick={speakWord}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              margin: '0 auto 16px',
              background: '#FFF5F7',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              color: '#FF6B9D',
              fontSize: '14px',
            }}
          >
            <Volume2 size={16} />
            听示范
          </button>

          {showHint && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#888', fontSize: '14px' }}
            >
              💡 提示：{currentWord.hint}
            </motion.p>
          )}
        </div>

        {/* 录音按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stopListening : startListening}
          disabled={feedback !== null}
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? 'linear-gradient(135deg, #F38181 0%, #E74C3C 100%)'
              : 'linear-gradient(135deg, #FF6B9D 0%, #F06292 100%)',
            cursor: feedback ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: isListening
              ? '0 0 0 20px rgba(243, 129, 129, 0.3), 0 8px 30px rgba(255, 107, 157, 0.4)'
              : '0 8px 30px rgba(255, 107, 157, 0.4)',
            transition: 'all 0.3s',
          }}
        >
          <Mic size={56} color="white" />
        </motion.button>

        <p style={{ marginTop: '20px', color: '#666', fontSize: '16px', fontWeight: 600 }}>
          {isListening ? '正在听... 请大声说出词语' : '按住麦克风按钮说话'}
        </p>

        {/* 识别结果 */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: 'white',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            <span style={{ color: '#888' }}>识别到：</span>
            <span style={{ color: '#4A4A4A', fontWeight: 600, marginLeft: '8px' }}>
              {transcript}
            </span>
          </motion.div>
        )}

        {/* 提示按钮 */}
        {!showHint && !feedback && (
          <button
            onClick={() => setShowHint(true)}
            style={{
              marginTop: '20px',
              background: 'none',
              border: 'none',
              color: '#FF6B9D',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            需要提示？
          </button>
        )}
      </motion.div>

      {/* 反馈动画 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 100,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '100px', marginBottom: '10px' }}>
              {feedback === 'correct' ? '🎉' : '💪'}
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: feedback === 'correct' ? '#4ECDC4' : '#F38181',
                background: 'white',
                padding: '12px 24px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              {feedback === 'correct' ? '太棒了！发音正确！' : '再试一次，你可以的！'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        background: 'linear-gradient(135deg, #FFF5F7 0%, #FCE4EC 100%)',
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
        <div style={{ fontSize: '100px', marginBottom: '20px' }}>🧙‍♀️✨</div>

        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#4A4A4A', marginBottom: '16px' }}>
          魔法完成！
        </h1>

        <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
          你说对了 {score} / {total} 个词语
        </p>

        {/* 星星 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ opacity: 0, y: 20, rotate: -180 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: star * 0.2, type: 'spring' }}
              style={{ fontSize: '56px' }}
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
