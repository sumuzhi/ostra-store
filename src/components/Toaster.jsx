import { useStore } from '../store/StoreContext.jsx'
import { Arrow, Check } from './Icons.jsx'

export default function Toaster() {
  const { toasts, dismissToast, setCartOpen, cartOpen, searchOpen } = useStore()

  // The drawer already shows what was just added — a floating toast on top of it
  // only covers the summary. Same for the search overlay.
  if (toasts.length === 0 || cartOpen || searchOpen) return null

  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast__tick" aria-hidden="true">
            <Check size={13} />
          </span>
          <p>{t.message}</p>
          {t.action === 'cart' && (
            <button
              type="button"
              onClick={() => {
                setCartOpen(true)
                dismissToast(t.id)
              }}
            >
              View bag <Arrow size={13} />
            </button>
          )}
          <button type="button" className="toast__close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
