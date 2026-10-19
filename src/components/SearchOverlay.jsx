import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRODUCTS } from '../data/products.js'
import { money } from '../lib/format.js'
import { useStore } from '../store/StoreContext.jsx'
import { Close, Search } from './Icons.jsx'

const SUGGESTIONS = ['linen', 'mug', 'lamp', 'walnut', 'towels']

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore()
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!searchOpen) return
    setQ('')
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [searchOpen, setSearchOpen])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return PRODUCTS.filter((p) =>
      `${p.name} ${p.category} ${p.blurb} ${p.description}`.toLowerCase().includes(term),
    ).slice(0, 5)
  }, [q])

  if (!searchOpen) return null

  const go = (to) => {
    setSearchOpen(false)
    navigate(to)
  }

  return (
    <div className="search-root" role="dialog" aria-modal="true" aria-label="Search">
      <button
        type="button"
        className="search-backdrop"
        aria-label="Close search"
        onClick={() => setSearchOpen(false)}
        tabIndex={-1}
      />
      <form
        className="search-panel"
        onSubmit={(e) => {
          e.preventDefault()
          go(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop')
        }}
      >
        <div className="search-panel__bar">
          <Search size={19} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stoneware, linen, lighting…"
            aria-label="Search products"
            autoComplete="off"
          />
          <button type="button" className="icon-btn" aria-label="Close search" onClick={() => setSearchOpen(false)}>
            <Close />
          </button>
        </div>

        {q.trim().length === 0 ? (
          <div className="search-panel__body">
            <p className="eyebrow">Popular right now</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="search-panel__body">
            <p className="search-panel__empty">
              Nothing matches &ldquo;{q}&rdquo;. Try <em>linen</em>, <em>lamp</em> or <em>mug</em>.
            </p>
          </div>
        ) : (
          <ul className="search-results">
            {results.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(`/product/${p.slug}`)}>
                  <img src={p.image} alt="" width="1024" height="1170" loading="lazy" />
                  <span className="search-results__text">
                    <strong>{p.name}</strong>
                    <em>{p.blurb}</em>
                  </span>
                  <span className="search-results__price">{money(p.price)}</span>
                </button>
              </li>
            ))}
            <li className="search-results__all">
              <button type="button" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>
                See all results for &ldquo;{q.trim()}&rdquo;
              </button>
            </li>
          </ul>
        )}
      </form>
    </div>
  )
}
