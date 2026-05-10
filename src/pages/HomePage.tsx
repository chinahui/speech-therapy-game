import { motion } from 'framer-motion'
import { Sparkles, Star, Heart, Zap, ClipboardList } from 'lucide-react'

interface HomePageProps {
  onStart: () => void
  onAssessment: () => void
}

export default function HomePage({ onStart, onAssessment }: HomePageProps) {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 装饰元素 */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          background: '#FFB8D0',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '30%',
          right: '5%',
          width: '120px',
          height: '120px',
          background: '#A8E6E1',
          borderRadius: '50%',
          filter: 'blur(50px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          style={{ fontSize: '80px', marginBottom: '20px' }}
        >
          🌈
        </motion.div>
        
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}
        >
          语乐小天地
        </h1>
        
        <p
          style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '30px',
            lineHeight: 1.6,
          }}
        >
          和小伙伴们一起，快乐学说话！ 🎈
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="btn btn-primary"
            style={{ fontSize: '18px', padding: '16px 36px' }}
          >
            <Sparkles size={22} />
            开始游戏
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAssessment}
            className="btn btn-secondary"
            style={{ fontSize: '18px', padding: '16px 36px' }}
          >
            <ClipboardList size={22} />
            开始评估
          </motion.button>
        </div>
      </motion.div>

      {/* 今日进度卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="card"
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Zap size={24} color="#FF6B9D" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>今日训练进度</h3>
        </div>
        
        <div className="progress-bar" style={{ marginBottom: '12px' }}>
          <div className="progress-fill" style={{ width: '60%' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#888' }}>
          <span>已完成 3/5 个游戏</span>
          <span style={{ color: '#FF6B9D', fontWeight: 600 }}>60%</span>
        </div>
      </motion.div>

      {/* 成就展示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="card"
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Star size={24} color="#FFE66D" fill="#FFE66D" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>我的成就</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <AchievementBadge icon="🏆" title="发音小达人" color="#FFD93D" />
          <AchievementBadge icon="🎯" title="词汇小能手" color="#4ECDC4" />
          <AchievementBadge icon="❤️" title="坚持之星" color="#FF6B9D" />
          <AchievementBadge icon="🔒" title="???" color="#E0E0E0" locked />
        </div>
      </motion.div>

      {/* 每日鼓励 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #FFF5F7 0%, #E8F6F5 100%)',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          border: '2px dashed #FFB8D0',
        }}
      >
        <Heart size={32} color="#FF6B9D" style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '16px', color: '#666', fontStyle: 'italic' }}>
          "每一次开口都是进步，你是最棒的小勇士！"
        </p>
      </motion.div>
    </div>
  )
}

interface AchievementBadgeProps {
  icon: string
  title: string
  color: string
  locked?: boolean
}

function AchievementBadge({ icon, title, color, locked }: AchievementBadgeProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: locked ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: locked ? 'none' : `0 4px 15px ${color}80`,
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: locked ? '#999' : '#666' }}>
        {title}
      </span>
    </div>
  )
}
