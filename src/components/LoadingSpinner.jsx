import { BookOpen } from 'lucide-react'

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg)' }}>
        <div className="relative">
          <div className="rounded-full animate-spin"
            style={{
              width: 48, height: 48,
              border: '2px solid var(--border)',
              borderTopColor: '#2D6A4F',
            }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center rounded-lg"
              style={{ width: 24, height: 24, background: '#2D6A4F' }}>
              <BookOpen size={12} className="text-white" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Campus Pocket</p>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>Loading your portal...</p>
        </div>
      </div>
    )
  }

  const sizes = { sm: 20, md: 32, lg: 48 }
  const s = sizes[size] || 32

  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full"
        style={{
          width: s, height: s,
          border: '2px solid var(--border)',
          borderTopColor: '#2D6A4F',
        }} />
    </div>
  )
}
