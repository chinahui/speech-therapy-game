import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Sparkles, Wind } from 'lucide-react'

interface Game3Props {
  onBack: () => void
}

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speed: number
  color: string
}

const BUBBLE_COLORS = ['#FFB8D0', '#A8E6E1', '#FFF5B8', '#C7CEEA', '#FFD93D']

export default function Game3_Bubbles({ onBack }: Game3Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameActive, setGameActive] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [breathIntensity, setBreathIntensity] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)
  
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStream | null>(null)

  // 初始化音频
  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphoneRef.current = stream
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      return true
    } catch (err) {
      console.error('麦克风权限错误:', err)
      return false
    }
  }

  // 检测吹气
  const detectBlow = useCallback(() => {
    if (!analyserRef.current || !gameActive) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // 计算低频能量（吹气主要产生低频声音）
    const lowFreqEnergy = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20
    const normalizedIntensity = Math.min(lowFreqEnergy / 100, 1)
    
    setBreathIntensity(normalizedIntensity)

    // 如果吹气强度超过阈值，吹破泡泡
    if (normalizedIntensity > 0.3) {
      setBubbles((prev) => {
        if (prev.length > 0) {
          // 吹破最下面的泡泡
          const newBubbles = [...prev]
          const bottomBubbleIndex = newBubbles.findIndex(
            (b) => b.y > 200
          )
          if (bottomBubbleIndex !== -1) {
            newBubbles.splice(bottomBubbleIndex, 1)
            setScore((s) => s + 1)
          }
          return newBubbles
        }
        return prev
      })
    }
  }, [gameActive])

  // 游戏循环
  useEffect(() => {
    if (!gameActive) return

    const gameLoop = () => {
      detectBlow()
      
      // 更新泡泡位置
      setBubbles((prev) => {
        return prev
          .map((bubble) => ({
            ...bubble,
            y: bubble.y - bubble.speed,
          }))
          .filter((bubble) => bubble.y > -100)
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameActive, detectBlow])

  // 生成泡泡
  useEffect(() => {
    if (!gameActive) return

    const spawnBubble = () => {
      const newBubble: Bubble = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80, // 10% - 90% 屏幕宽度
        y: window.innerHeight + 50,
        size: 60 + Math.random() * 40,
        speed: 1 + Math.random() * 2,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      }
      setBubbles((prev) => [...prev, newBubble])
    }

    const interval = setInterval(spawnBubble, 1500)
    return () => clearInterval(interval)
  }, [gameActive])

  // 倒计时
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false)
          setGameComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, timeLeft])

  const startGame = async () => {
    const hasPermission = await initAudio()
    if (hasPermission) {
      setShowTutorial(false)
      setGameActive(true)
      setScore(0)
      setTimeLeft(60)
      setBubbles([])
    }
  }

  const stopGame = () => {
    setGameActive(false)
    if (microphoneRef.current) {
      microphoneRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  // 清理
  useEffect(() => {
    return () => {
      stopGame()
    }
  }, [])

  if (showTutorial) {
    return (
      <TutorialScreen
        onStart={startGame}
        onBack={onBack}
      />
    )
  }

  if (gameComplete) {
    return (
      <GameCompleteScreen
        score={score}
        onBack={onBack}
        onReplay={() => {
          setGameComplete(false)
          setShowTutorial(true)
          setScore(0)
          setBubbles([])
        }}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 顶部UI */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)',
        }}
      >
        <button
          onClick={() => {
            stopGame()
            onBack()
          }}
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
          退出
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              background: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Star size={20} fill="#FFE66D" color="#FFE66D" />
            <span style={{ fontWeight: 800, fontSize: '18px' }}>{score}</span>
          </div>
          <div
            style={{
              background: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              fontWeight: 700,
              fontSize: '18px',
              color: timeLeft < 10 ? '#F38181' : '#4A4A4A',
            }}
          >
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* 呼吸强度指示器 */}
      <div
        style={{
          position: 'fixed',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '200px',
            height: '12px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <motion.div
            animate={{ width: `${breathIntensity * 100}%` }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, #4ECDC4, ${breathIntensity > 0.3 ? '#FF6B9D' : '#4ECDC4'})`,
              borderRadius: '10px',
            }}
          />
        </div>
        <p style={{ marginTop: '8px', color: 'white', fontSize: '14px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          {breathIntensity > 0.3 ? '吹气中！💨' : '对着麦克风轻轻吹气'}
        </p>
      </div>

      {/* 泡泡 */}
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            style={{
              position: 'absolute',
              left: `${bubble.x}%`,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${bubble.color}80)`,
              boxShadow: `inset -5px -5px 15px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.1)`,
              border: `2px solid ${bubble.color}`,
            }}
          >
            {/* 高光 */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '25%',
                height: '25%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 底部装饰 - 云朵 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

interface TutorialScreenProps {
  onStart: () => void
  onBack: () => void
}

function TutorialScreen({ onStart, onBack }: TutorialScreenProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🫧</div>
        
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#4A4A4A', marginBottom: '16px' }}>
          泡泡大作战
        </h1>
        
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: 1.6 }}>
          对着麦克风轻轻吹气，吹破飘上来的泡泡！<br />
          练习你的呼吸控制和嘴巴形状 🌬️
        </p>

        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '30px',
            maxWidth: '400px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#4A4A4A' }}>
            游戏说明
          </h3>
          <div style={{ textAlign: 'left', fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
            <p>1️⃣ 允许使用麦克风</p>
            <p>2️⃣ 把嘴巴靠近麦克风</p>
            <p>3️⃣ 轻轻吹气（像吹蜡烛一样）</p>
            <p>4️⃣ 吹破尽可能多的泡泡！</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="btn btn-primary"
          >
            <Wind size={20} />
            开始游戏
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="btn btn-secondary"
          >
            <ArrowLeft size={20} />
            返回
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

interface GameCompleteScreenProps {
  score: number
  onBack: () => void
  onReplay: () => void
}

function GameCompleteScreen({ score, onBack, onReplay }: GameCompleteScreenProps) {
  const getMessage = () => {
    if (score >= 30) return { emoji: '🏆', title: '吹泡泡大师！', desc: '太厉害了！' }
    if (score >= 15) return { emoji: '🌟', title: '吹泡泡高手！', desc: '做得很棒！' }
    return { emoji: '💪', title: '继续加油！', desc: '下次会更好！' }
  }

  const { emoji, title, desc } = getMessage()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
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
        <div style={{ fontSize: '100px', marginBottom: '20px' }}>{emoji}</div>

        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#4A4A4A', marginBottom: '8px' }}>
          {title}
        </h1>

        <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>{desc}</p>

        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px 48px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>吹破泡泡数</p>
          <p style={{ fontSize: '48px', fontWeight: 800, color: '#4ECDC4' }}>{score}</p>
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
