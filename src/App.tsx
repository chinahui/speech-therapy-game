import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Gamepad2, Trophy, User } from 'lucide-react'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import ProfilePage from './pages/ProfilePage'
import Game1_Matching from './games/Game1_Matching'
import Game2_VoiceMagic from './games/Game2_VoiceMagic'
import Game3_Bubbles from './games/Game3_Bubbles'
import Game4_VolumeAdventure from './games/Game4_VolumeAdventure'

type Page = 'home' | 'games' | 'profile' | 'game1' | 'game2' | 'game3' | 'game4'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onStart={() => setCurrentPage('games')} />
      case 'games':
        return (
          <GamesPage
            onGameSelect={(gameId) => {
              if (gameId === 1) setCurrentPage('game1')
              if (gameId === 2) setCurrentPage('game2')
              if (gameId === 3) setCurrentPage('game3')
              if (gameId === 4) setCurrentPage('game4')
            }}
          />
        )
      case 'profile':
        return <ProfilePage />
      case 'game1':
        return <Game1_Matching onBack={() => setCurrentPage('games')} />
      case 'game2':
        return <Game2_VoiceMagic onBack={() => setCurrentPage('games')} />
      case 'game3':
        return <Game3_Bubbles onBack={() => setCurrentPage('games')} />
      case 'game4':
        return <Game4_VolumeAdventure onBack={() => setCurrentPage('games')} />
      default:
        return <HomePage onStart={() => setCurrentPage('games')} />
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 主内容区 */}
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 底部导航 */}
      {!['game1', 'game2', 'game3', 'game4'].includes(currentPage) && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '12px 0',
            zIndex: 100,
          }}
        >
          <NavButton
            icon={<Home size={24} />}
            label="首页"
            active={currentPage === 'home'}
            onClick={() => setCurrentPage('home')}
          />
          <NavButton
            icon={<Gamepad2 size={24} />}
            label="游戏"
            active={currentPage === 'games'}
            onClick={() => setCurrentPage('games')}
          />
          <NavButton
            icon={<Trophy size={24} />}
            label="成就"
            active={false}
            onClick={() => {}}
          />
          <NavButton
            icon={<User size={24} />}
            label="我的"
            active={currentPage === 'profile'}
            onClick={() => setCurrentPage('profile')}
          />
        </nav>
      )}
    </div>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 20px',
        color: active ? '#FF6B9D' : '#888888',
        transition: 'color 0.3s',
      }}
    >
      {icon}
      <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
    </button>
  )
}

export default App
