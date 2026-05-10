import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Sparkles, Volume2, VolumeX } from 'lucide-react'

interface Game4Props {
  onBack: () => void
}

interface Obstacle {
  id: number
  x: number
  type: 'low' | 'high'
  passed: boolean
}

export default function Game4_VolumeAdventure({ onBack }: Game4Props) {
  const [balloonY, setBalloonY] = useState(50) // 0-100 百分比
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameActive, setGameActive] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [volume, setVolume] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [showTutorial, setShowTutorial] = useState(true)
  const [targetZone, setTargetZone] = useState<'low' | 'high' | null>(null)
  
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

  // 检测音量
  const detectVolume = useCallback(() => {
    if (!analyserRef.current || !gameActive) return

    // 计算整体音量 - 使用RMS算法更准确反映实际音量
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // 取人声主要频段（100Hz-4000Hz）的能量
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const binSize = sampleRate / analyserRef.current.frequencyBinCount
    const lowBin = Math.floor(100 / binSize)   // 100Hz
    const highBin = Math.floor(4000 / binSize)  // 4000Hz
    
    let sum = 0
    let count = 0
    for (let i = lowBin; i < highBin && i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i] // 能量值
      count++
    }
    const rms = Math.sqrt(sum / Math.max(count, 1))
    // 归一化：RMS范围0-255，阈值设为30（安静环境），最大值180（很大声）
    const normalizedVolume = Math.min(Math.max((rms - 30) / 150, 0), 1)
    
    setVolume(normalizedVolume)

    // 根据音量控制气球高度
    // 音量0 = 高度0（最下面），音量1 = 高度100（最上面）
    const targetY = normalizedVolume * 100
    setBalloonY((prev) => prev + (targetY - prev) * 0.15)
  }, [gameActive])

  // 游戏循环
  useEffect(() => {
    if (!gameActive) return

    const gameLoop = () => {
      detectVolume()
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameActive, detectVolume])

  // 生成障碍物
  useEffect(() => {
    if (!gameActive) return

    const spawnObstacle = () => {
      const types: ('low' | 'high')[] = ['low', 'high']
      const type = types[Math.floor(Math.random() * types.length)]
      
      const newObstacle: Obstacle = {
        id: Date.now(),
        x: 100,
        type,
        passed: false,
      }
      setObstacles((prev) => [...prev, newObstacle])
      setTargetZone(type)
      
      // 3秒后清除目标提示
      setTimeout(() => setTargetZone(null), 3000)
    }

    const interval = setInterval(spawnObstacle, 4000)
    return () => clearInterval(interval)
  }, [gameActive])

  // 移动障碍物并检测碰撞
  useEffect(() => {
    if (!gameActive) return

    const moveObstacles = setInterval(() => {
      setObstacles((prev) => {
        return prev
          .map((obs) => {
            const newX = obs.x - 2
            
            // 检测是否通过障碍物
            if (!obs.passed && newX < 20 && newX > 10) {
              // 检查气球高度是否在正确区域
              const isCorrect = obs.type === 'low' 
                ? balloonY < 40  // 低音量区域
                : balloonY > 60  // 高音量区域
              
              if (isCorrect) {
                setScore((s) => s + 10)
              }
              
              return { ...obs, x: newX, passed: true }
            }
            
            return { ...obs, x: newX }
          })
          .filter((obs) => obs.x > -20)
      })
    }, 50)

    return () => clearInterval(moveObstacles)
  }, [gameActive, balloonY])

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
      setBalloonY(50)
      setObstacles([])
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
    return <TutorialScreen onStart={startGame} onBack={onBack} />
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
          setObstacles([])
        }}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #FFF8E7 100%)',
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

      {/* 音量指示器 */}
      <div
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Volume2 size={24} color="#4A4A4A" />
        <div
          style={{
            width: '12px',
            height: '200px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            position: 'relative',
          }}
        >
          <motion.div
            animate={{ height: `${volume * 100}%`, bottom: 0 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, #4ECDC4, #FFE66D, #FF6B9D)',
              borderRadius: '10px',
            }}
          />
        </div>
        <VolumeX size={24} color="#4A4A4A" />
      </div>

      {/* 目标提示 */}
      <AnimatePresence>
        {targetZone && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              background: targetZone === 'low' ? '#4ECDC4' : '#FF6B9D',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: 700,
              fontSize: '18px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            {targetZone === 'low' ? '🔇 小声飞过低处！' : '🔊 大声飞越高处！'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏区域 - 障碍物 */}
      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          style={{
            position: 'absolute',
            left: `${obstacle.x}%`,
            top: obstacle.type === 'low' ? '70%' : '10%',
            width: '60px',
            height: '100px',
            background: obstacle.type === 'low' ? '#4ECDC4' : '#FF6B9D',
            borderRadius: '10px',
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
          }}
        >
          {obstacle.type === 'low' ? '⛰️' : '☁️'}
        </div>
      ))}

      {/* 气球 */}
      <motion.div
        animate={{ top: `${100 - balloonY}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{
          position: 'absolute',
          left: '15%',
          width: '80px',
          height: '100px',
          marginTop: '-50px',
          zIndex: 5,
        }}
      >
        {/* 气球主体 */}
        <div
          style={{
            width: '80px',
            height: '90px',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: 'linear-gradient(135deg, #FF6B9D 0%, #F06292 50%, #E91E63 100%)',
            boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.2)',
            position: 'relative',
          }}
        >
          {/* 高光 */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '20%',
              width: '20px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              transform: 'rotate(-20deg)',
            }}
          />
        </div>
        {/* 绳子 */}
        <div
          style={{
            width: '2px',
            height: '60px',
            background: '#888',
            margin: '-5px auto 0',
          }}
        />
        {/* 篮子 */}
        <div
          style={{
            width: '24px',
            height: '20px',
            background: '#8D6E63',
            borderRadius: '0 0 5px 5px',
            margin: '0 auto',
          }}
        />
      </motion.div>

      {/* 区域标记 */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: '60%',
          height: '40%',
          background: 'rgba(78, 205, 196, 0.1)',
          pointerEvents: 'none',
          borderTop: '3px dashed #4ECDC4',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#4ECDC4',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          🔇 小声区域
        </span>
      </div>
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          height: '40%',
          background: 'rgba(255, 107, 157, 0.1)',
          pointerEvents: 'none',
          borderBottom: '3px dashed #FF6B9D',
        }}
      >
        <span
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#FF6B9D',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          🔊 大声区域
        </span>
      </div>
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
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #FFF8E7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎈</div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#4A4A4A', marginBottom: '16px' }}>
          音量控制大冒险
        </h1>

        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: 1.6 }}>
          用声音大小控制气球飞高高！<br />
          小声飞过低处，大声飞越高处 🎵
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
            <p>2️⃣ 小声说话 → 气球下降</p>
            <p>3️⃣ 大声说话 → 气球上升</p>
            <p>4️⃣ 根据提示飞入正确区域得分！</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="btn btn-primary"
          >
            <Volume2 size={20} />
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
    if (score >= 100) return { emoji: '🏆', title: '飞行大师！', desc: '完美控制！' }
    if (score >= 50) return { emoji: '🌟', title: '飞行高手！', desc: '做得很棒！' }
    return { emoji: '💪', title: '继续加油！', desc: '多练习会更好！' }
  }

  const { emoji, title, desc } = getMessage()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #FFF8E7 100%)',
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
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>最终得分</p>
          <p style={{ fontSize: '48px', fontWeight: 800, color: '#FF6B9D' }}>{score}</p>
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
