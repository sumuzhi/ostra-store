import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { PRODUCTS, FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from '../data/products.js'

const STORAGE_KEY = 'ostra.store.v1'

const PROMOS = {
  WELCOME10: { code: 'WELCOME10', label: '10% off your first order', percent: 10 },
  FREESHIP: { code: 'FREESHIP', label: 'Free shipping, no minimum', shipping: true },
}

const initialState = { cart: [], wishlist: [], promo: null }

function loadState() {
  if (typeof window === 'undefined') return initialState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart.filter((l) => l && l.id && l.qty > 0) : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      promo: parsed.promo && PROMOS[parsed.promo] ? parsed.promo : null,
    }
  } catch {
    return initialState
  }
}

const lineKey = (id, color, option) => `${id}|${color || '-'}|${option || '-'}`

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { id, color = '', option = '', qty = 1 } = action.payload
      const key = lineKey(id, color, option)
      const existing = state.cart.find((l) => l.key === key)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((l) =>
            l.key === key ? { ...l, qty: Math.min(l.qty + qty, 12) } : l,
          ),
        }
      }
      return { ...state, cart: [...state.cart, { key, id, color, option, qty }] }
    }
    case 'qty': {
      const { key, qty } = action.payload
      if (qty <= 0) {
        return { ...state, cart: state.cart.filter((l) => l.key !== key) }
      }
      return {
        ...state,
        cart: state.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 12) } : l)),
      }
    }
    case 'remove':
      return { ...state, cart: state.cart.filter((l) => l.key !== action.payload.key) }
    case 'clear':
      return { ...state, cart: [], promo: null }
    case 'wishlist':
      return state.wishlist.includes(action.payload.id)
        ? { ...state, wishlist: state.wishlist.filter((w) => w !== action.payload.id) }
        : { ...state, wishlist: [action.payload.id, ...state.wishlist] }
    case 'promo':
      return { ...state, promo: action.payload.code }
    case 'promo-clear':
      return { ...state, promo: null }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage can be unavailable in private mode — the app still works in memory */
    }
  }, [state])

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, opts = {}) => {
      const id = ++toastId.current
      setToasts((list) => [...list.slice(-2), { id, message, ...opts }])
      window.setTimeout(() => dismissToast(id), opts.duration || 3600)
      return id
    },
    [dismissToast],
  )

  const addToCart = useCallback(
    (product, { color, option, qty = 1, silent = false } = {}) => {
      dispatch({
        type: 'add',
        payload: {
          id: product.id,
          color: color || (product.colors[0] && product.colors[0].name) || '',
          option: option || (product.options && product.options.values[0]) || '',
          qty,
        },
      })
      if (!silent) {
        toast(`${product.name} added to bag`, { action: 'cart' })
      }
    },
    [toast],
  )

  const value = useMemo(() => {
    const lines = state.cart
      .map((line) => {
        const product = PRODUCTS.find((p) => p.id === line.id)
        if (!product) return null
        return { ...line, product, total: product.price * line.qty }
      })
      .filter(Boolean)

    const count = lines.reduce((sum, l) => sum + l.qty, 0)
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0)
    const promo = state.promo ? PROMOS[state.promo] : null
    const discount = promo && promo.percent ? Math.round((subtotal * promo.percent) / 100) : 0
    const freeByThreshold = subtotal - discount >= FREE_SHIPPING_THRESHOLD
    const shipping =
      subtotal === 0 ? 0 : freeByThreshold || (promo && promo.shipping) ? 0 : SHIPPING_FLAT
    const total = subtotal - discount + shipping
    const remainingForFree = Math.max(FREE_SHIPPING_THRESHOLD - (subtotal - discount), 0)

    return {
      ...state,
      lines,
      count,
      subtotal,
      discount,
      shipping,
      total,
      promo,
      remainingForFree,
      freeShippingReached: freeByThreshold,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      toasts,
      toast,
      dismissToast,
      addToCart,
      setQty: (key, qty) => dispatch({ type: 'qty', payload: { key, qty } }),
      removeLine: (key) => dispatch({ type: 'remove', payload: { key } }),
      clearCart: () => dispatch({ type: 'clear' }),
      toggleWishlist: (id) => dispatch({ type: 'wishlist', payload: { id } }),
      isSaved: (id) => state.wishlist.includes(id),
      applyPromo: (code) => {
        const clean = String(code || '').trim().toUpperCase()
        if (!PROMOS[clean]) return { ok: false, message: 'That code is not valid.' }
        if (state.promo === clean) return { ok: false, message: 'That code is already applied.' }
        dispatch({ type: 'promo', payload: { code: clean } })
        return { ok: true, message: PROMOS[clean].label }
      },
      clearPromo: () => dispatch({ type: 'promo-clear' }),
    }
  }, [state, cartOpen, searchOpen, toasts, toast, dismissToast, addToCart])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export { PROMOS }
