import { motion } from 'framer-motion'
import { Volume2, Puzzle, Droplets, TrendingUp } from 'lucide-react'

interface GamesPageProps {
  onGameSelect: (gameId: number) => void
}

const games = [
  {
    id: 1,
    icon: '🧩',
    title: '图片配对大挑战',
    desc: '听语音，选图片，认识新朋友！',
    color: '#4ECDC4',
    age: '2-5岁',
    skill: '词汇认知',
    lucideIcon: Puzzle,
  },
  {
    id: 2,
    icon: '🎤',
    title: '声音魔法师',
    desc: '跟着魔法精灵，一起大声说！',
    color: '#FF6B9D',
    age: '3-6岁',
    skill: '发音练习',
    lucideIcon: Volume2,
  },
  {
    id: 3,
    icon: '🫧',
    title: '泡泡大作战',
    desc: '吹出漂亮泡泡，练习小嘴巴！',
    color: '#95E1D3',
    age: '1-5岁',
    skill: '呼吸训练',
    lucideIcon: Droplets,
  },
  {
    id: 4,
    icon: '🎈',
    title: '音量控制大冒险',
    desc: '大声小声控制气球飞高高！',
    color: '#FFE66D',
    age: '3-8岁',
    skill: '音量控制',
    lucideIcon: TrendingUp,
  },
]

export default function GamesPage({ onGameSelect }: GamesPageProps) {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '24px' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎮</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#4A4A4A' }}>
          选择游戏
        </h1>
        <p style={{ color: '#888', marginTop: '8px' }}>
          今天想玩哪个游戏呢？
        </p>
      </motion.div>

      {/* 游戏网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGameSelect(game.id)}
            className="game-card"
            style={{
              cursor: 'pointer',
              borderTop: `4px solid ${game.color}`,
            }}
          >
            {/* 游戏图标 */}
            <div
              style={{
                fontSize: '56px',
                marginBottom: '16px',
                animation: 'float 3s ease-in-out infinite',
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {game.icon}
            </div>

            {/* 游戏标题 */}
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#4A4A4A',
                marginBottom: '8px',
              }}
            >
              {game.title}
            </h3>

            {/* 游戏描述 */}
            <p
              style={{
                fontSize: '14px',
                color: '#888',
                marginBottom: '16px',
                lineHeight: 1.5,
              }}
            >
              {game.desc}
            </p>

            {/* 标签 */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: `${game.color}30`,
                  color: game.color,
                }}
              >
                {game.age}
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#F0F0F0',
                  color: '#666',
                }}
              >
                {game.skill}
              </span>
            </div>

            {/* 开始按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: '20px',
                padding: '10px 28px',
                borderRadius: '25px',
                border: 'none',
                background: game.color,
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${game.color}60`,
              }}
            >
              开始游戏
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* 提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '30px',
          padding: '20px',
          background: 'linear-gradient(135deg, #FFF5F7 0%, #E8F6F5 100%)',
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', color: '#888' }}>
          💡 小贴士：每天坚持玩 15-20 分钟，进步更快哦！
        </p>
      </motion.div>
    </div>
  )
}
