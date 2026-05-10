// localStorage 数据持久化封装

// 用户信息
export interface UserInfo {
  username: string
  childName: string
  childAge: number
  createdAt: string
}

// 评估结果
export interface AssessmentResult {
  id: string
  childName: string
  ageGroup: string
  date: string
  scores: {
    understanding: number   // 理解能力 0-100
    expression: number      // 表达能力 0-100
    pronunciation: number   // 发音能力 0-100
    social: number          // 社交能力 0-100
  }
  totalScore: number
  answers: number[]         // 每题得分 0/1
  recommendations: string[]
}

// 训练进度
export interface Progress {
  totalGames: number
  completedGames: number
  stars: number
  consecutiveDays: number
  lastPlayDate: string
  assessmentCount: number
}

const KEYS = {
  USER: 'speech_therapy_user',
  ASSESSMENTS: 'speech_therapy_assessments',
  PROGRESS: 'speech_therapy_progress',
}

// ==================== 用户相关 ====================

export function saveUser(user: UserInfo): void {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user))
  } catch (e) {
    console.error('保存用户信息失败:', e)
  }
}

export function getUser(): UserInfo | null {
  try {
    const data = localStorage.getItem(KEYS.USER)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取用户信息失败:', e)
    return null
  }
}

export function removeUser(): void {
  try {
    localStorage.removeItem(KEYS.USER)
  } catch (e) {
    console.error('删除用户信息失败:', e)
  }
}

// ==================== 评估相关 ====================

export function saveAssessment(assessment: AssessmentResult): void {
  try {
    const assessments = getAssessments()
    assessments.unshift(assessment)
    // 最多保留20条记录
    if (assessments.length > 20) {
      assessments.pop()
    }
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments))
    // 更新进度中的评估次数
    const progress = getProgress()
    progress.assessmentCount += 1
    saveProgress(progress)
  } catch (e) {
    console.error('保存评估结果失败:', e)
  }
}

export function getAssessments(): AssessmentResult[] {
  try {
    const data = localStorage.getItem(KEYS.ASSESSMENTS)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('读取评估结果失败:', e)
    return []
  }
}

export function getLatestAssessment(): AssessmentResult | null {
  const assessments = getAssessments()
  return assessments.length > 0 ? assessments[0] : null
}

export function clearAssessments(): void {
  try {
    localStorage.removeItem(KEYS.ASSESSMENTS)
  } catch (e) {
    console.error('清除评估记录失败:', e)
  }
}

// ==================== 进度相关 ====================

const defaultProgress: Progress = {
  totalGames: 0,
  completedGames: 0,
  stars: 0,
  consecutiveDays: 0,
  lastPlayDate: '',
  assessmentCount: 0,
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress))
  } catch (e) {
    console.error('保存进度失败:', e)
  }
}

export function getProgress(): Progress {
  try {
    const data = localStorage.getItem(KEYS.PROGRESS)
    return data ? JSON.parse(data) : { ...defaultProgress }
  } catch (e) {
    console.error('读取进度失败:', e)
    return { ...defaultProgress }
  }
}

// ==================== 工具函数 ====================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}
