import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, PRODUCTS, bySlug, byId } from '../data/products.js'
import { deliveryWindow, hasDiscount, money } from '../lib/format.js'
import { useStore } from '../store/StoreContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Rating from '../components/Rating.jsx'
import QtyStepper from '../components/QtyStepper.jsx'
import { Arrow, Check, Chevron, Heart, Leaf, Truck } from '../components/Icons.jsx'
import NotFound from './NotFound.jsx'

const VIEWS = [
  { id: 'full', label: 'Full view' },
  { id: 'detail', label: 'Glaze detail' },
  { id: 'close', label: 'Close-up' },
]

const ACCORDIONS = [
  {
    id: 'details',
    title: 'Details',
    render: (p) => (
      <ul className="bullet">
        {p.details.map((d) => (
          <li key={d}>{d}</li>
        ))}
        <li>Dimensions: {p.dims}</li>
      </ul>
    ),
  },
  {
    id: 'care',
    title: 'Materials & care',
    render: (p) => (
      <p>
        Made from natural materials that are meant to show their age. Small variations in glaze,
        grain and weave are part of the piece, not a defect. For {p.name.toLowerCase()}, we
        recommend hand washing where you can and avoiding sudden temperature changes.
      </p>
    ),
  },
  {
    id: 'shipping',
    title: 'Shipping & returns',
    render: () => (
      <div className="stack">
        <p>
          Ships within 1–2 business days from our warehouse in New Jersey. Free over $120, otherwise
          $8 flat. Carbon-neutral delivery on every order.
        </p>
        <p>
          30 days to change your mind — we cover return shipping on orders over $120. Pieces must
          come back unused, in the original paper wrap.
        </p>
      </div>
    ),
  },
]

export default function Product() {
  const { slug } = useParams()
  const product = bySlug(slug)
  const { addToCart, toggleWishlist, isSaved } = useStore()
  const [color, setColor] = useState('')
  const [option, setOption] = useState('')
  const [qty, setQty] = useState(1)
  const [view, setView] = useState('full')
  const [open, setOpen] = useState('details')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return
    setColor(product.colors[0]?.name || '')
    setOption(product.options?.values[0] || '')
    setQty(1)
    setView('full')
    setAdded(false)
  }, [product])

  const pairs = useMemo(() => {
    if (!product) return []
    return product.pairs.map((id) => byId(id)).filter(Boolean).slice(0, 3)
  }, [product])

  if (!product) return <NotFound />

  const saved = isSaved(product.id)
  const low = product.stock <= 5

  const handleAdd = () => {
    addToCart(product, { color, option, qty })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <main id="main" className="pdp">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop?cat=${product.category}`}>
            {CATEGORIES.find((c) => c.id === product.category)?.name || 'Shop'}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pdp__grid">
          <div className="pdp__gallery">
            <div className={`pdp__main pdp__main--${view}`}>
              <img src={product.image} alt={`${product.name} in ${color || 'natural'}`} width="1024" height="1170" />
              {product.badge && <span className="pill pdp__badge">{product.badge}</span>}
            </div>
            <div className="pdp__thumbs" role="tablist" aria-label="Product images">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={view === v.id}
                  className={`pdp__thumb pdp__thumb--${v.id}${view === v.id ? ' is-active' : ''}`}
                  onClick={() => setView(v.id)}
                  aria-label={v.label}
                >
                  <img src={product.image} alt="" width="1024" height="1170" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="pdp__info">
            <p className="eyebrow">{product.category} — small batch</p>
            <h1 className="pdp__title">{product.name}</h1>
            <div className="pdp__rating">
              <Rating value={product.rating} reviews={product.reviews} size={13} />
              <a href="#reviews" className="pdp__rating-link">
                Read reviews
              </a>
            </div>

            <div className="pdp__price">
              <span className="pdp__price-now">{money(product.price)}</span>
              {hasDiscount(product) && (
                <>
                  <s>{money(product.compareAt)}</s>
                  <span className="pill pill--clay">
                    Save {money(product.compareAt - product.price)}
                  </span>
                </>
              )}
            </div>

            <p className="pdp__blurb">{product.description}</p>

            {product.colors.length > 0 && (
              <div className="pdp__option">
                <div className="pdp__option-head">
                  <span className="eyebrow">Colour</span>
                  <span className="pdp__option-value">{color}</span>
                </div>
                <div className="swatches">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`swatch swatch--lg${color === c.name ? ' is-active' : ''}`}
                      style={{ background: c.hex }}
                      onClick={() => setColor(c.name)}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.options && (
              <div className="pdp__option">
                <div className="pdp__option-head">
                  <span className="eyebrow">{product.options.label}</span>
                  <span className="pdp__option-value">{option}</span>
                </div>
                <div className="pills">
                  {product.options.values.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`pill pill--select${option === v ? ' is-active' : ''}`}
                      onClick={() => setOption(v)}
                      aria-pressed={option === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp__buy">
              <QtyStepper value={qty} onChange={setQty} max={Math.min(product.stock, 12)} />
              <button type="button" className={`btn btn--solid btn--grow${added ? ' is-added' : ''}`} onClick={handleAdd}>
                {added ? (
                  <>
                    <Check /> Added to bag
                  </>
                ) : (
                  <>Add to bag · {money(product.price * qty)}</>
                )}
              </button>
              <button
                type="button"
                className={`btn btn--icon${saved ? ' is-on' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from saved' : 'Save for later'}
              >
                <Heart filled={saved} size={19} />
              </button>
            </div>

            <p className={`pdp__stock${low ? ' is-low' : ''}`}>
              {low ? `Only ${product.stock} left in this batch` : 'In stock — ships within 2 days'}
            </p>

            <div className="pdp__assure">
              <p>
                <Truck size={17} /> Free shipping over $120 · arrives {deliveryWindow(4)}
              </p>
              <p>
                <Leaf size={17} /> Plastic-free packaging · 30-day returns
              </p>
            </div>

            <div className="accordion">
              {ACCORDIONS.map((item) => {
                const isOpen = open === item.id
                return (
                  <div key={item.id} className={`acc${isOpen ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="acc__trigger"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? '' : item.id)}
                    >
                      <span>{item.title}</span>
                      <Chevron open={isOpen} />
                    </button>
                    {isOpen && (
                      <div className="acc__panel">
                        {item.render(product)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <section className="pdp__reviews" id="reviews" aria-labelledby="rev-title">
          <div className="pdp__reviews-head">
            <div>
              <h2 id="rev-title">What buyers say</h2>
              <Rating value={product.rating} reviews={product.reviews} size={14} />
            </div>
            <p className="muted">
              Reviews are collected after delivery and never edited. We publish the three-star ones
              too.
            </p>
          </div>
          <div className="quotes quotes--tight">
            <figure className="quote">
              <Rating value={5} size={12} showValue={false} />
              <blockquote>
                &ldquo;Better in person. The weight of it is the thing — it does not slide around
                when you use it.&rdquo;
              </blockquote>
              <figcaption>
                <strong>Hannah R.</strong>
                <span>Verified buyer · 3 weeks ago</span>
              </figcaption>
            </figure>
            <figure className="quote">
              <Rating value={5} size={12} showValue={false} />
              <blockquote>
                &ldquo;Arrived in three days, wrapped in paper. Bought a second one as a gift and
                now I want a third.&rdquo;
              </blockquote>
              <figcaption>
                <strong>Daniel O.</strong>
                <span>Verified buyer · 1 month ago</span>
              </figcaption>
            </figure>
            <figure className="quote">
              <Rating value={4} size={12} showValue={false} />
              <blockquote>
                &ldquo;Slightly warmer in tone than the photos, which I ended up preferring. Would
                buy again.&rdquo;
              </blockquote>
              <figcaption>
                <strong>Ines M.</strong>
                <span>Verified buyer · 2 months ago</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {pairs.length > 0 && (
          <section className="pdp__pairs" aria-labelledby="pairs-title">
            <div className="section__head">
              <h2 id="pairs-title" className="section__title">
                Pairs well with
              </h2>
              <Link to={`/shop?cat=${product.category}`} className="link-arrow">
                More in {CATEGORIES.find((c) => c.id === product.category)?.name || 'Shop'} <Arrow size={14} />
              </Link>
            </div>
            <div className="grid-cards">
              {pairs.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <section className="more">
          <h2 className="section__title">Keep looking</h2>
          <div className="more__links">
            {PRODUCTS.filter((p) => p.id !== product.id)
              .slice(0, 6)
              .map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="more__link">
                  {p.name}
                  <span>{money(p.price)}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>

      <div className="pdp__sticky">
        <div>
          <p className="pdp__sticky-name">{product.name}</p>
          <p className="pdp__sticky-price">{money(product.price * qty)}</p>
        </div>
        <button type="button" className="btn btn--solid" onClick={handleAdd}>
          {added ? <><Check /> Added</> : 'Add to bag'}
        </button>
      </div>
    </main>
  )
}
