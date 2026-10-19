import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CATEGORIES, PRODUCTS, SORT_OPTIONS } from '../data/products.js'
import { money } from '../lib/format.js'
import { useStore } from '../store/StoreContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { Arrow, Close, Sliders } from '../components/Icons.jsx'

const PRICE_BANDS = [
  { id: 'u50', label: 'Under $50', test: (p) => p.price < 5000 },
  { id: '50-100', label: '$50 – $100', test: (p) => p.price >= 5000 && p.price <= 10000 },
  { id: 'o100', label: 'Over $100', test: (p) => p.price > 10000 },
]

function FilterPanel({ cats, price, inStock, onToggleCat, onSetPrice, onToggleStock, onClear, counts }) {
  return (
    <div className="filters">
      <div className="filters__group">
        <p className="eyebrow">Category</p>
        <ul className="checklist">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={cats.includes(c.id)}
                  onChange={() => onToggleCat(c.id)}
                />
                <span className="check__box" aria-hidden="true" />
                <span className="check__label">{c.name}</span>
                <span className="check__count">{counts[c.id] || 0}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filters__group">
        <p className="eyebrow">Price</p>
        <ul className="checklist">
          <li>
            <label className="check">
              <input type="radio" name="price" checked={!price} onChange={() => onSetPrice('')} />
              <span className="check__box check__box--round" aria-hidden="true" />
              <span className="check__label">Any price</span>
            </label>
          </li>
          {PRICE_BANDS.map((band) => (
            <li key={band.id}>
              <label className="check">
                <input
                  type="radio"
                  name="price"
                  checked={price === band.id}
                  onChange={() => onSetPrice(band.id)}
                />
                <span className="check__box check__box--round" aria-hidden="true" />
                <span className="check__label">{band.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filters__group">
        <p className="eyebrow">Availability</p>
        <label className="check">
          <input type="checkbox" checked={inStock} onChange={onToggleStock} />
          <span className="check__box" aria-hidden="true" />
          <span className="check__label">In stock only</span>
        </label>
      </div>

      <button type="button" className="filters__clear" onClick={onClear}>
        Clear all filters
      </button>
    </div>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const { wishlist } = useStore()
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const cats = useMemo(
    () => (params.get('cat') || '').split(',').filter(Boolean),
    [params],
  )
  const q = params.get('q') || ''
  const tag = params.get('tag') || ''
  const savedOnly = params.get('saved') === '1'
  const price = params.get('price') || ''
  const inStock = params.get('stock') === '1'
  const sort = params.get('sort') || 'featured'

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const toggleCat = (id) => {
    const next = cats.includes(id) ? cats.filter((c) => c !== id) : [...cats, id]
    update('cat', next.join(','))
  }

  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 260)
    return () => window.clearTimeout(t)
  }, [params])

  useEffect(() => {
    if (!sheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen])

  const counts = useMemo(() => {
    const map = {}
    PRODUCTS.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [])

  const results = useMemo(() => {
    let list = PRODUCTS.slice()
    if (cats.length > 0) list = list.filter((p) => cats.includes(p.category))
    if (savedOnly) list = list.filter((p) => wishlist.includes(p.id))
    if (tag) list = list.filter((p) => p.tags.includes(tag))
    if (inStock) list = list.filter((p) => p.stock > 0)
    if (price) {
      const band = PRICE_BANDS.find((b) => b.id === price)
      if (band) list = list.filter(band.test)
    }
    if (q) {
      const term = q.toLowerCase()
      list = list.filter((p) =>
        `${p.name} ${p.category} ${p.blurb} ${p.description}`.toLowerCase().includes(term),
      )
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return list
  }, [cats, savedOnly, wishlist, tag, inStock, price, q, sort])

  const heading = savedOnly
    ? 'Saved items'
    : q
      ? `Results for “${q}”`
      : cats.length === 1
        ? CATEGORIES.find((c) => c.id === cats[0])?.name || 'The collection'
        : tag === 'new'
          ? 'New in'
          : tag === 'bestseller'
            ? 'Bestsellers'
            : 'The collection'

  const activeChips = [
    ...cats.map((c) => ({
      key: `cat-${c}`,
      label: CATEGORIES.find((x) => x.id === c)?.name || c,
      clear: () => toggleCat(c),
    })),
    ...(price
      ? [{ key: 'price', label: PRICE_BANDS.find((b) => b.id === price)?.label, clear: () => update('price', '') }]
      : []),
    ...(inStock ? [{ key: 'stock', label: 'In stock', clear: () => update('stock', '') }] : []),
    ...(q ? [{ key: 'q', label: `“${q}”`, clear: () => update('q', '') }] : []),
    ...(savedOnly ? [{ key: 'saved', label: 'Saved', clear: () => update('saved', '') }] : []),
    ...(tag ? [{ key: 'tag', label: tag === 'new' ? 'New in' : 'Bestsellers', clear: () => update('tag', '') }] : []),
  ]

  const filterProps = {
    cats,
    price,
    inStock,
    onToggleCat: toggleCat,
    onSetPrice: (v) => update('price', v),
    onToggleStock: () => update('stock', inStock ? '' : '1'),
    onClear: clearAll,
    counts,
  }

  return (
    <main id="main" className="shop">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{savedOnly ? 'Saved' : 'Shop'}</span>
        </nav>

        <header className="shop__head">
          <div>
            <p className="eyebrow">{tag === 'new' ? 'Just landed' : 'Small-batch homeware'}</p>
            <h1 className="shop__title">{heading}</h1>
            <p className="shop__sub">
              {loading ? 'Filtering…' : `${results.length} ${results.length === 1 ? 'piece' : 'pieces'}`}
              {!loading && results.length > 0 && (
                <>
                  {' '}· from {money(Math.min(...results.map((r) => r.price)))}
                </>
              )}
            </p>
          </div>

          <div className="shop__tools">
            <button type="button" className="btn btn--ghost btn--sm shop__filter-btn" onClick={() => setSheetOpen(true)}>
              <Sliders size={15} /> Filters
              {activeChips.length > 0 && <span className="shop__filter-count">{activeChips.length}</span>}
            </button>
            <label className="sort">
              <span className="sr-only">Sort by</span>
              <select value={sort} onChange={(e) => update('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {activeChips.length > 0 && (
          <div className="active-chips">
            {activeChips.map((chip) => (
              <button key={chip.key} type="button" className="chip chip--on" onClick={chip.clear}>
                {chip.label} <Close size={12} />
              </button>
            ))}
            <button type="button" className="active-chips__clear" onClick={clearAll}>
              Clear
            </button>
          </div>
        )}

        <div className="shop__body">
          <aside className="shop__side" aria-label="Filters">
            <FilterPanel {...filterProps} />
          </aside>

          <section aria-live="polite" aria-busy={loading}>
            {loading ? (
              <div className="grid-cards grid-cards--shop">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card card--skeleton" aria-hidden="true">
                    <div className="sk sk--media" />
                    <div className="sk sk--line" />
                    <div className="sk sk--line sk--short" />
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="empty">
                <p className="empty__title">
                  {savedOnly ? 'Nothing saved yet' : 'No pieces match those filters'}
                </p>
                <p className="muted">
                  {savedOnly
                    ? 'Tap the heart on any product and it will wait for you here.'
                    : 'Try widening the price range or clearing a category.'}
                </p>
                <div className="empty__actions">
                  {savedOnly ? (
                    <Link to="/shop" className="btn btn--solid">
                      Browse the collection
                    </Link>
                  ) : (
                    <button type="button" className="btn btn--solid" onClick={clearAll}>
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid-cards grid-cards--shop">
                {results.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 3} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="shop__note">
          <p>
            Every piece is made in small batches — if something is sold out, join the waitlist and
            we&rsquo;ll write when the next firing lands.
          </p>
          <Link to="/#story" className="link-arrow">
            How we make things <Arrow size={14} />
          </Link>
        </div>
      </div>

      {sheetOpen && (
        <div className="sheet-root" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
            tabIndex={-1}
          />
          <div className="sheet">
            <header className="sheet__head">
              <h2>Filters</h2>
              <button type="button" className="icon-btn" onClick={() => setSheetOpen(false)} aria-label="Close filters">
                <Close />
              </button>
            </header>
            <div className="sheet__body">
              <FilterPanel {...filterProps} />
            </div>
            <footer className="sheet__foot">
              <button type="button" className="btn btn--solid btn--block" onClick={() => setSheetOpen(false)}>
                Show {results.length} {results.length === 1 ? 'piece' : 'pieces'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  )
}
