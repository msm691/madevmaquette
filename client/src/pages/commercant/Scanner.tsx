import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../../api/client'

interface Feedback {
  ok: boolean
  title: string
  message: string
}

function Corner({ pos, sides }: {
  pos: React.CSSProperties
  sides: ('top' | 'right' | 'bottom' | 'left')[]
}) {
  return (
    <span style={{
      position: 'absolute',
      width: 28,
      height: 28,
      borderTop: sides.includes('top') ? '3px solid #6366f1' : 'none',
      borderRight: sides.includes('right') ? '3px solid #6366f1' : 'none',
      borderBottom: sides.includes('bottom') ? '3px solid #6366f1' : 'none',
      borderLeft: sides.includes('left') ? '3px solid #6366f1' : 'none',
      ...pos,
    }} />
  )
}

export default function Scanner() {
  const navigate = useNavigate()
  const qrRef = useRef<Html5Qrcode | null>(null)
  const processing = useRef(false)
  const [cameraErr, setCameraErr] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraErr("Votre navigateur ne supporte pas l'accès à la caméra.")
      return
    }

    const style = document.createElement('style')
    style.textContent = [
      '#qr-reader { width: 100% !important; height: 100% !important; border: none !important; background: transparent !important; }',
      '#qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; position: absolute !important; top: 0 !important; left: 0 !important; }',
      '#qr-reader canvas { position: absolute !important; top: 0 !important; left: 0 !important; opacity: 0 !important; pointer-events: none !important; }',
      '#qr-reader__scan_region { border: none !important; background: transparent !important; box-shadow: none !important; }',
      '#qr-reader__scan_region img { display: none !important; }',
      '#qr-reader__dashboard { display: none !important; }',
      '#qr-reader__header_message { display: none !important; }',
    ].join('\n')
    document.head.appendChild(style)

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        stream.getTracks().forEach(t => t.stop())

        const qr = new Html5Qrcode('qr-reader')
        qrRef.current = qr

        await qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => {},
        )
      } catch (err: unknown) {
        const name = (err as DOMException)?.name ?? ''
        const msg = String(err)
        if (name === 'NotAllowedError' || msg.includes('NotAllowed') || msg.includes('Permission')) {
          setCameraErr("Accès caméra refusé. Autorisez-le dans les réglages du navigateur.")
        } else if (name === 'NotFoundError' || msg.includes('NotFound')) {
          setCameraErr("Aucune caméra détectée sur cet appareil.")
        } else {
          setCameraErr("Impossible d'accéder à la caméra.")
        }
      }
    }

    init()

    return () => {
      style.remove()
      const q = qrRef.current
      if (q) {
        q.stop().catch(() => {}).finally(() => { try { q.clear() } catch { /* already cleared */ } })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleScan(token: string) {
    if (processing.current) return
    processing.current = true

    try {
      const { data } = await api.post<{ message?: string; etudiant?: string }>('/passages/scan', { qrToken: token })
      setFeedback({
        ok: true,
        title: data.etudiant ?? 'Passage validé',
        message: data.message ?? 'Accès accordé avec succès.',
      })
    } catch (err: unknown) {
      const e = err as { response?: { status: number; data?: { message?: string } } }
      const status = e.response?.status ?? 0
      const msg = e.response?.data?.message ?? ''

      const map: Record<number, [string, string]> = {
        400: ['QR invalide', msg || 'QR code expiré ou invalide.'],
        403: ['Non autorisé', msg || "Ce QR n'est pas rattaché à votre commerce."],
        404: ['Introuvable', msg || 'Étudiant ou offre introuvable.'],
      }
      const [title, message] = map[status] ?? ['Erreur', msg || 'Erreur serveur. Réessayez.']
      setFeedback({ ok: false, title, message })
    }
  }

  function dismiss() {
    setFeedback(null)
    processing.current = false
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/commercant')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span style={s.title}>Scanner QR</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={s.camera}>
        <div id="qr-reader" style={{ position: 'absolute', inset: 0 }} />

        {cameraErr ? (
          <div style={s.permErr}>
            <span style={{ fontSize: 52 }}>📷</span>
            <p style={s.permText}>{cameraErr}</p>
            <button style={s.retryBtn} onClick={() => navigate('/commercant')}>
              Retour
            </button>
          </div>
        ) : (
          <div style={s.overlayWrap} aria-hidden="true">
            <div style={s.focusBox}>
              <Corner pos={{ top: -2, left: -2 }} sides={['top', 'left']} />
              <Corner pos={{ top: -2, right: -2 }} sides={['top', 'right']} />
              <Corner pos={{ bottom: -2, left: -2 }} sides={['bottom', 'left']} />
              <Corner pos={{ bottom: -2, right: -2 }} sides={['bottom', 'right']} />
            </div>
            <p style={s.hint}>Pointez la caméra sur le QR code étudiant</p>
          </div>
        )}
      </div>

      {feedback && (
        <div style={s.backdrop} onClick={dismiss}>
          <div
            style={{ ...s.modal, borderTopColor: feedback.ok ? '#22c55e' : '#ef4444' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              ...s.iconWrap,
              background: feedback.ok ? '#dcfce7' : '#fee2e2',
              color: feedback.ok ? '#16a34a' : '#dc2626',
            }}>
              {feedback.ok ? '✓' : '✗'}
            </div>
            <p style={s.feedbackTitle}>{feedback.title}</p>
            <p style={s.feedbackMsg}>{feedback.message}</p>
            <button
              style={{ ...s.modalBtn, background: feedback.ok ? '#22c55e' : '#ef4444' }}
              onClick={dismiss}
            >
              {feedback.ok ? 'Scan suivant' : 'Réessayer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    position: 'fixed',
    inset: 0,
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
    flexShrink: 0,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    border: 'none',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: '-0.2px',
  },
  camera: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  overlayWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    pointerEvents: 'none',
    zIndex: 5,
  },
  focusBox: {
    width: 260,
    height: 260,
    position: 'relative',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
    borderRadius: 4,
  },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
    margin: 0,
    padding: '0 32px',
  },
  permErr: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    background: '#111',
    zIndex: 5,
  },
  permText: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    padding: '0 32px',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: 300,
  },
  retryBtn: {
    marginTop: 8,
    padding: '12px 32px',
    background: '#1e3a8a',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 50,
  },
  modal: {
    background: '#fff',
    borderRadius: '20px 20px 0 0',
    padding: '32px 28px 44px',
    width: '100%',
    maxWidth: 480,
    borderTop: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 4,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  feedbackMsg: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6,
  },
  modalBtn: {
    marginTop: 8,
    width: '100%',
    padding: '15px',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    letterSpacing: '0.2px',
  },
}
