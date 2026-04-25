import { useGamification } from '../../hooks/useGamification'
import { Coins, Flame, Trophy, Star, Zap, BookOpen, CheckCircle, Calendar } from 'lucide-react'

const BADGE_META = {
  bronze: { label: 'Bronze',  color: '#CD7F32', bg: '#FDF3E7', emoji: '🥉', coins: 500  },
  silver: { label: 'Silver',  color: '#9CA3AF', bg: '#F3F4F6', emoji: '🥈', coins: 1000 },
  gold:   { label: 'Gold',    color: '#F59E0B', bg: '#FFFBEB', emoji: '🥇', coins: 3000 },
}

function BadgeCard({ id, earned }) {
  const m = BADGE_META[id]
  return (
    <div className={`card text-center transition-all ${earned ? 'shadow-md' : 'opacity-40 grayscale'}`}
      style={{ borderTop: earned ? `3px solid ${m.color}` : '3px solid transparent' }}>
      <div className="text-4xl mb-2">{m.emoji}</div>
      <p className="font-bold text-sm" style={{ color: earned ? m.color : 'var(--text-4)' }}>{m.label}</p>
      <p className="text-xs text-gray-400 mt-1">{m.coins.toLocaleString()} coins</p>
      {earned
        ? <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold mt-2">
            <CheckCircle size={11} /> Earned
          </span>
        : <span className="text-xs text-gray-400 mt-2 block">Locked</span>
      }
    </div>
  )
}

function StreakCalendar({ practiceHistory }) {
  // Show last 28 days
  const days = []
  const today = new Date()
  const practiceDates = new Set(practiceHistory.map(h => h.date))
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const str = d.toISOString().split('T')[0]
    days.push({ str, day: d.getDate(), practiced: practiceDates.has(str) })
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">Last 28 days</p>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium">{d}</div>
        ))}
        {days.map(({ str, day, practiced }) => (
          <div key={str} title={str}
            className="aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all"
            style={{
              background: practiced ? '#2D6A4F' : 'var(--surface-2)',
              color: practiced ? '#fff' : 'var(--text-4)',
            }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentRewards() {
  const {
    coins, totalCoinsEarned, streak, badges,
    practiceHistory, classTestHistory,
    totalPracticeTests, nextBadge,
    COINS_PER_CORRECT, COINS_FULL_MARKS,
    SILVER_THRESHOLD, GOLD_THRESHOLD,
  } = useGamification()

  const progressToNext = nextBadge
    ? Math.min(100, Math.round((totalCoinsEarned / (totalCoinsEarned + nextBadge.needed)) * 100))
    : 100

  return (
    <div className="space-y-6 fade-in" style={{ maxWidth: 860 }}>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" /> Rewards & Progress
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Earn coins by practicing and acing your tests</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Coins',          value: coins.toLocaleString(),        icon: Coins,    bg: '#FEF3C7', color: '#D97706' },
          { label: 'Day Streak',     value: `${streak} 🔥`,               icon: Flame,    bg: '#FEE2E2', color: '#DC2626' },
          { label: 'Practice Tests', value: totalPracticeTests,            icon: BookOpen, bg: '#EFF6FF', color: '#1D4ED8' },
          { label: 'Badges Earned',  value: badges.length,                 icon: Star,     bg: '#F0FDF4', color: '#16A34A' },
        ].map(s => (
          <div key={s.label} className="card text-center pop-in">
            <div className="flex items-center justify-center mx-auto mb-2"
              style={{ width: 36, height: 36, borderRadius: 10, background: s.bg }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress to next badge */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap size={15} style={{ color: '#F59E0B' }} /> Progress to Next Badge
          </p>
          <span className="text-sm text-gray-400">{totalCoinsEarned.toLocaleString()} total coins</span>
        </div>
        {nextBadge ? (
          <>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Current: {totalCoinsEarned.toLocaleString()}</span>
              <span>{nextBadge.name} at {(totalCoinsEarned + nextBadge.needed).toLocaleString()} coins</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressToNext}%`, background: nextBadge.color }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {nextBadge.needed.toLocaleString()} more coins to unlock <strong>{nextBadge.name}</strong> badge
            </p>
          </>
        ) : (
          <p className="text-sm text-yellow-600 font-semibold">🏆 You've unlocked all badges!</p>
        )}
      </div>

      {/* Badges */}
      <div>
        <p className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Trophy size={15} style={{ color: '#F59E0B' }} /> Badges
        </p>
        <div className="grid grid-cols-3 gap-3">
          {['bronze', 'silver', 'gold'].map(id => (
            <BadgeCard key={id} id={id} earned={badges.includes(id)} />
          ))}
        </div>
      </div>

      {/* How to earn */}
      <div className="card" style={{ background: 'var(--surface-2)' }}>
        <p className="font-semibold text-gray-900 dark:text-white mb-3">How to Earn Coins</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Correct answer in practice</p>
              <p className="text-gray-400 text-xs">+{COINS_PER_CORRECT} coins per correct MCQ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Star size={14} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Full marks on class test</p>
              <p className="text-gray-400 text-xs">+{COINS_FULL_MARKS} bonus coins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Flame size={14} className="text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Daily streak</p>
              <p className="text-gray-400 text-xs">Practice every day to keep your streak</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Trophy size={14} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Badge milestones</p>
              <p className="text-gray-400 text-xs">Bronze 500 · Silver {SILVER_THRESHOLD.toLocaleString()} · Gold {GOLD_THRESHOLD.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak calendar */}
      <div className="card">
        <p className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={15} style={{ color: '#2D6A4F' }} /> Practice Streak Calendar
        </p>
        <StreakCalendar practiceHistory={practiceHistory} />
      </div>

      {/* Practice history */}
      <div className="card">
        <p className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen size={15} style={{ color: '#1D4ED8' }} /> Practice History
        </p>
        {practiceHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📚</p>
            <p className="text-sm text-gray-400">No practice tests yet. Head to Online Tests to start earning coins!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {practiceHistory.slice(0, 20).map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--surface-2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#2D6A4F' }}>
                    {h.subject?.[0] || 'T'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{h.testTitle || h.subject}</p>
                    <p className="text-xs text-gray-400">{h.date} · {h.score}/{h.total} · {h.correctCount}/{h.totalQuestions} correct</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                  <Coins size={13} />
                  +{h.coinsEarned}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Class test bonuses */}
      {classTestHistory.length > 0 && (
        <div className="card">
          <p className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star size={15} style={{ color: '#F59E0B' }} /> Full Marks Bonuses
          </p>
          <div className="space-y-2">
            {classTestHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#FFFBEB' }}>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{h.subject} — Full Marks!</p>
                  <p className="text-xs text-gray-400">{h.date} · {h.score}/{h.total}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                  <Coins size={13} />
                  +{h.coinsEarned}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
