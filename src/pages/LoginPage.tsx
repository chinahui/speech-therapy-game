import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Baby, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { saveUser, getUser, type UserInfo } from '../services/storage'

interface LoginPageProps {
  onLogin: (user: UserInfo) => void
  onBack: () => void
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const existingUser = getUser()
  const [username, setUsername] = useState(existingUser?.username ?? '')
  const [childName, setChildName] = useState(existingUser?.childName ?? '')
  const [childAge, setChildAge] = useState(existingUser?.childAge?.toString() ?? '')
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (!username.trim()) {
      setError('请输入您的称呼')
      return
    }
    if (!childName.trim()) {
      setError('请输入孩子的姓名')
      return
    }
    const age = parseInt(childAge)
    if (!childAge || isNaN(age) || age < 2 || age > 15) {
      setError('请输入孩子的年龄（2-15岁）')
      return
    }

    const user: UserInfo = {
      username: username.trim(),
      childName: childName.trim(),
      childAge: age,
      createdAt: new Date().toISOString(),
    }

    saveUser(user)
    setStep('success')

    setTimeout(() => {
      onLogin(user)
    }, 1500)
  }

  const ageOptions = [
    { label: '3-5岁', value: '3' },
    { label: '5-8岁', value: '5' },
    { label: '8-12岁', value: '8' },
  ]

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
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

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {/* 标题 */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{ fontSize: '64px', marginBottom: '12px' }}
              >
                👋
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
                欢迎加入
              </h1>
              <p style={{ fontSize: '15px', color: '#888' }}>
                填写信息，开启语言训练之旅！
              </p>
            </div>

            {/* 表单卡片 */}
            <div className="card" style={{ padding: '28px 24px' }}>
              {/* 用户名 */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#4A4A4A',
                    marginBottom: '8px',
                  }}
                >
                  <User size={16} color="#FF6B9D" />
                  您的称呼
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例如：妈妈、老师"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '2px solid #E8E8E8',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    fontFamily: 'inherit',
                    background: '#FAFAFA',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#FF6B9D')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E8E8')}
                />
              </div>

              {/* 孩子姓名 */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#4A4A4A',
                    marginBottom: '8px',
                  }}
                >
                  <Baby size={16} color="#4ECDC4" />
                  孩子的姓名
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="请输入孩子的昵称"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '2px solid #E8E8E8',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    fontFamily: 'inherit',
                    background: '#FAFAFA',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#FF6B9D')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E8E8')}
                />
              </div>

              {/* 年龄段选择 */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#4A4A4A',
                    marginBottom: '10px',
                  }}
                >
                  <Calendar size={16} color="#FFE66D" />
                  孩子的年龄段
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {ageOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setChildAge(opt.value)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '14px',
                        border: childAge === opt.value ? '2px solid #FF6B9D' : '2px solid #E8E8E8',
                        background: childAge === opt.value ? '#FFF0F5' : '#FAFAFA',
                        color: childAge === opt.value ? '#FF6B9D' : '#666',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontFamily: 'inherit',
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 错误提示 */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      color: '#F38181',
                      fontSize: '13px',
                      textAlign: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* 提交按钮 */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '17px',
                  padding: '16px',
                }}
              >
                开始旅程
                <ArrowRight size={20} />
              </motion.button>
            </div>

            {/* 底部提示 */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#AAA',
                marginTop: '16px',
              }}
            >
              信息仅保存在本地，不会上传到服务器
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{ textAlign: 'center', paddingTop: '60px' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
              style={{ fontSize: '80px', marginBottom: '20px' }}
            >
              🎉
            </motion.div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#4A4A4A',
                marginBottom: '8px',
              }}
            >
              欢迎，{childName}！
            </h2>
            <p style={{ fontSize: '16px', color: '#888' }}>
              <Sparkles size={16} color="#FFE66D" style={{ verticalAlign: 'middle' }} />
              {' '}正在为你准备精彩内容...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
