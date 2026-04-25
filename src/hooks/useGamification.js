import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

const COINS_PER_CORRECT   = 5
const COINS_FULL_MARKS    = 50   // bonus for 100% on a class test
const SILVER_THRESHOLD    = 1000
const GOLD_THRESHOLD      = 3000

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getKey(userId) {
  return `gamification_${userId}`
}

function defaultState() {
  return {
    coins: 0,
    totalCoinsEarned: 0,
    streak: 0,
    lastPracticeDate: null,
    practiceHistory: [],   // [{ date, testId, testTitle, subject, score, total, coinsEarned }]
    classTestHistory: [],  // [{ date, subject, score, total, coinsEarned }]
    badges: [],            // ['bronze','silver','gold']
  }
}

export function useGamification() {
  const { profile } = useAuth()
  const [state, setState] = useState(defaultState)

  // Load from localStorage
  useEffect(() => {
    if (!profile?.id) return
    const saved = localStorage.getItem(getKey(profile.id))
    if (saved) {
      try { setState(JSON.parse(saved)) } catch { setState(defaultState()) }
    } else {
      setState(defaultState())
    }
  }, [profile?.id])

  // Persist to localStorage
  const save = useCallback((newState) => {
    if (!profile?.id) return
    localStorage.setItem(getKey(profile.id), JSON.stringify(newState))
    setState(newState)
  }, [profile?.id])

  // Compute badges based on total coins earned
  function computeBadges(totalCoins) {
    const badges = []
    if (totalCoins >= 500)           badges.push('bronze')
    if (totalCoins >= SILVER_THRESHOLD) badges.push('silver')
    if (totalCoins >= GOLD_THRESHOLD)   badges.push('gold')
    return badges
  }

  // Update streak
  function updateStreak(current, lastDate) {
    const today = todayStr()
    if (lastDate === today) return { streak: current, lastPracticeDate: today }
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]
    if (lastDate === yStr) return { streak: current + 1, lastPracticeDate: today }
    return { streak: 1, lastPracticeDate: today }
  }

  // Award coins for a practice test
  const awardPracticeCoins = useCallback((testId, testTitle, subject, correctCount, totalQuestions, score, totalMarks) => {
    setState(prev => {
      const coinsEarned = correctCount * COINS_PER_CORRECT
      const newTotal    = prev.totalCoinsEarned + coinsEarned
      const { streak, lastPracticeDate } = updateStreak(prev.streak, prev.lastPracticeDate)

      const entry = {
        date: todayStr(),
        testId,
        testTitle,
        subject,
        score,
        total: totalMarks,
        correctCount,
        totalQuestions,
        coinsEarned,
      }

      const next = {
        ...prev,
        coins: prev.coins + coinsEarned,
        totalCoinsEarned: newTotal,
        streak,
        lastPracticeDate,
        practiceHistory: [entry, ...prev.practiceHistory].slice(0, 100),
        badges: computeBadges(newTotal),
      }
      save(next)
      return next
    })
  }, [save])

  // Award coins for a class test (full marks bonus)
  const awardClassTestCoins = useCallback((subject, score, totalMarks) => {
    setState(prev => {
      const isFullMarks = score === totalMarks
      const coinsEarned = isFullMarks ? COINS_FULL_MARKS : 0
      if (coinsEarned === 0) return prev

      const newTotal = prev.totalCoinsEarned + coinsEarned
      const entry = {
        date: todayStr(),
        subject,
        score,
        total: totalMarks,
        coinsEarned,
        isFullMarks: true,
      }

      const next = {
        ...prev,
        coins: prev.coins + coinsEarned,
        totalCoinsEarned: newTotal,
        classTestHistory: [entry, ...prev.classTestHistory].slice(0, 50),
        badges: computeBadges(newTotal),
      }
      save(next)
      return next
    })
  }, [save])

  // Stats helpers
  const practiceDaysSet = new Set((state.practiceHistory || []).map(h => h.date))
  const totalPracticeTests = (state.practiceHistory || []).length
  const nextBadge = state.totalCoinsEarned < 500
    ? { name: 'Bronze', needed: 500 - state.totalCoinsEarned, color: '#CD7F32' }
    : state.totalCoinsEarned < SILVER_THRESHOLD
    ? { name: 'Silver', needed: SILVER_THRESHOLD - state.totalCoinsEarned, color: '#C0C0C0' }
    : state.totalCoinsEarned < GOLD_THRESHOLD
    ? { name: 'Gold',   needed: GOLD_THRESHOLD - state.totalCoinsEarned,   color: '#FFD700' }
    : null

  return {
    coins: state.coins,
    totalCoinsEarned: state.totalCoinsEarned,
    streak: state.streak,
    badges: state.badges,
    practiceHistory: state.practiceHistory || [],
    classTestHistory: state.classTestHistory || [],
    totalPracticeTests,
    practiceDaysSet,
    nextBadge,
    COINS_PER_CORRECT,
    COINS_FULL_MARKS,
    SILVER_THRESHOLD,
    GOLD_THRESHOLD,
    awardPracticeCoins,
    awardClassTestCoins,
  }
}
