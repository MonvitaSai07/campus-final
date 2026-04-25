import { useState } from 'react'
import { MessageCircle, Check, Loader2, AlertCircle } from 'lucide-react'
import { sendWhatsAppAlert, buildAlertPayload } from '../services/whatsapp'

function Toast({ status, message, onDone }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl slide-up"
      style={{
        minWidth: 240, maxWidth: 'calc(100vw - 2rem)',
        background: status === 'success' ? '#2D6A4F' : '#DC2626',
        color: '#fff', fontSize: 13, fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      }}>
      <div className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.2)' }}>
        {status === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
      </div>
      <span className="flex-1">{message}</span>
      <button onClick={onDone} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  )
}

export default function WhatsAppButton({ student, parentPhone, fees=[], exams=[], size='md', variant='button' }) {
  const [status, setStatus] = useState('idle')
  const [toast, setToast]   = useState(null)

  const showToast = (s, msg) => {
    setToast({ status: s, message: msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleClick = async (e) => {
    e.stopPropagation()
    if (!parentPhone) { showToast('error', 'No phone number on file for this parent'); return }
    setStatus('loading')
    try {
      const { alertType, details } = buildAlertPayload(student, fees, exams)
      await sendWhatsAppAlert({ parentPhone, studentName: student.name, alertType, details })
      setStatus('success')
      showToast('success', 'WhatsApp sent to parent! 📱')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      showToast('error', err.message || 'Failed to send WhatsApp')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (variant === 'icon') {
    return (
      <>
        <button onClick={handleClick} disabled={status === 'loading'}
          title="Send WhatsApp alert to parent"
          className="flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            width: size === 'sm' ? 28 : 32, height: size === 'sm' ? 28 : 32,
            background: status === 'success' ? '#D8F3DC' : status === 'error' ? '#FEE2E2' : 'rgba(37,211,102,0.1)',
            color: status === 'success' ? '#2D6A4F' : status === 'error' ? '#DC2626' : '#25D366',
          }}>
          {status === 'loading' ? <Loader2 size={13} className="animate-spin" />
            : status === 'success' ? <Check size={13} />
            : <MessageCircle size={13} />}
        </button>
        {toast && <Toast status={toast.status} message={toast.message} onDone={() => setToast(null)} />}
      </>
    )
  }

  return (
    <>
      <button onClick={handleClick} disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
        style={{
          height: size === 'sm' ? 32 : 40,
          padding: size === 'sm' ? '0 12px' : '0 16px',
          fontSize: size === 'sm' ? 12 : 14,
          background: status === 'success' ? '#2D6A4F' : status === 'error' ? '#DC2626' : '#25D366',
          color: '#fff',
        }}>
        {status === 'loading' ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
          : status === 'success' ? <><Check size={14} /> Sent!</>
          : status === 'error' ? <><AlertCircle size={14} /> Failed</>
          : <><MessageCircle size={14} /> Send WhatsApp Alert</>}
      </button>
      {toast && <Toast status={toast.status} message={toast.message} onDone={() => setToast(null)} />}
    </>
  )
}
