import { motion } from 'framer-motion'
import { Award, Settings, ChevronRight } from 'lucide-react'

export default function ProfilePage() {
  const stats = [
    { label: '游戏天数', value: '12', icon: '📅', color: '#4ECDC4' },
    { label: '完成游戏', value: '48', icon: '🎮', color: '#FF6B9D' },
    { label: '获得星星', value: '156', icon: '⭐', color: '#FFE66D' },
    { label: '连续打卡', value: '5', icon: '🔥', color: '#F38181' },
  ]

  const achievements = [
    { icon: '🏆', title: '发音小达人', desc: '完成10次发音练习', progress: 80, color: '#FFD93D' },
    { icon: '🎯', title: '词汇小能手', desc: '认识50个新词汇', progress: 60, color: '#4ECDC4' },
    { icon: '🌟', title: '坚持之星', desc: '连续打卡7天', progress: 71, color: '#FF6B9D' },
    { icon: '🎨', title: '创意大师', desc: '完成5个句子构建', progress: 40, color: '#C7CEEA' },
  ]

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          textAlign: 'center',
          padding: '32px 24px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'white',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '50px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          🐻
        </div>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
          小勇士
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
          已加入语乐小天地 12 天
        </p>
      </motion.div>

      {/* 数据统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="card"
            style={{
              textAlign: 'center',
              padding: '20px 16px',
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: stat.color,
                marginBottom: '4px',
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: '#888' }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* 成就进度 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Award size={24} color="#FFE66D" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>成就进度</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {achievements.map((achievement, index) => (
            <div key={index}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${achievement.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  {achievement.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{achievement.desc}</div>
                </div>
                <div style={{ fontWeight: 700, color: achievement.color, fontSize: '14px' }}>
                  {achievement.progress}%
                </div>
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${achievement.progress}%`,
                    background: achievement.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 设置菜单 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Settings size={24} color="#888" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>设置</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MenuItem icon="👤" title="编辑资料" />
          <MenuItem icon="🔔" title="通知设置" />
          <MenuItem icon="🔒" title="隐私设置" />
          <MenuItem icon="❓" title="帮助与反馈" />
          <MenuItem icon="ℹ️" title="关于我们" />
        </div>
      </motion.div>
    </div>
  )
}

interface MenuItemProps {
  icon: string
  title: string
}

function MenuItem({ icon, title }: MenuItemProps) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '12px',
        transition: 'background 0.2s',
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: '15px', color: '#4A4A4A' }}>{title}</span>
      <ChevronRight size={20} color="#CCC" />
    </button>
  )
}
