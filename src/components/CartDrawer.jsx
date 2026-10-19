import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext.jsx'
import { money, deliveryWindow } from '../lib/format.js'
import { Arrow, Bag, Check, Close, Trash, Truck } from './Icons.jsx'
import QtyStepper from './QtyStepper.jsx'

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Japan',
  'Singapore',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function CartDrawer() {
  const store = useStore()
  const {
    cartOpen,
    setCartOpen,
    lines,
    count,
    subtotal,
    discount,
    shipping,
    total,
    promo,
    remainingForFree,
    applyPromo,
    clearPromo,
    setQty,
    removeLine,
    clearCart,
  } = store

  const [step, setStep] = useState('cart')
  const [code, setCode] = useState('')
  const [promoMsg, setPromoMsg] = useState(null)
  const [form, setForm] = useState({
    email: '',
    first: '',
    last: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
  })
  const [errors, setErrors] = useState({})
  const [placed, setPlaced] = useState(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!cartOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') setCartOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [cartOpen, setCartOpen])

  useEffect(() => {
    if (!cartOpen) {
      setStep('cart')
      setPromoMsg(null)
      setCode('')
    }
  }, [cartOpen])

  const progress = useMemo(() => {
    const threshold = 12000
    return Math.min(100, Math.round(((subtotal - discount) / threshold) * 100))
  }, [subtotal, discount])

  if (!cartOpen) return null

  const submitPromo = (e) => {
    e.preventDefault()
    if (!code.trim()) return
    const res = applyPromo(code)
    setPromoMsg(res)
    if (res.ok) setCode('')
  }

  const submitOrder = (e) => {
    e.preventDefault()
    const next = {}
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.first.trim()) next.first = 'Required'
    if (!form.last.trim()) next.last = 'Required'
    if (!form.address.trim()) next.address = 'Required'
    if (!form.city.trim()) next.city = 'Required'
    if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(form.zip.trim())) next.zip = 'Enter a valid postal code'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0]
      document.getElementById(`co-${firstKey}`)?.focus()
      return
    }
    setPlaced({
      number: `OS-${Math.floor(10000 + Math.random() * 89999)}`,
      email: form.email.trim(),
      lines,
      total,
      date: deliveryWindow(4),
    })
    setStep('done')
    clearCart()
  }

  const field = (name, label, extra = {}) => (
    <label className={`field${errors[name] ? ' has-error' : ''}`} htmlFor={`co-${name}`}>
      <span>{label}</span>
      <input
        id={`co-${name}`}
        name={name}
        value={form[name]}
        autoComplete={extra.autoComplete}
        inputMode={extra.inputMode}
        placeholder={extra.placeholder}
        onChange={(e) => {
          setForm((f) => ({ ...f, [name]: e.target.value }))
          setErrors((prev) => ({ ...prev, [name]: undefined }))
        }}
      />
      {errors[name] && <em className="field__error">{errors[name]}</em>}
    </label>
  )

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close bag"
        onClick={() => setCartOpen(false)}
        tabIndex={-1}
      />
      <aside className="cart" role="dialog" aria-modal="true" aria-label="Your bag">
        <header className="cart__head">
          <h2>
            {step === 'cart' && <>Your bag{count > 0 && <span className="cart__count"> ({count})</span>}</>}
            {step === 'details' && 'Checkout'}
            {step === 'done' && 'Order confirmed'}
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            ref={closeRef}
          >
            <Close />
          </button>
        </header>

        {step === 'cart' && (
          <>
            {lines.length === 0 ? (
              <div className="cart__empty">
                <span className="cart__empty-icon" aria-hidden="true">
                  <Bag size={26} />
                </span>
                <p className="cart__empty-title">Your bag is empty</p>
                <p className="muted">
                  Start with the mug everyone keeps buying, or browse the full collection.
                </p>
                <Link to="/shop" className="btn btn--solid" onClick={() => setCartOpen(false)}>
                  Browse the collection
                </Link>
              </div>
            ) : (
              <>
                <div className="cart__ship">
                  <p>
                    {remainingForFree > 0 ? (
                      <>
                        You&rsquo;re <strong>{money(remainingForFree)}</strong> away from free shipping
                      </>
                    ) : (
                      <>Free shipping unlocked — nice.</>
                    )}
                  </p>
                  <div
                    className="cart__ship-bar"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progress towards free shipping"
                  >
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <ul className="cart__lines">
                  {lines.map((line) => (
                    <li key={line.key} className="line">
                      <Link to={`/product/${line.product.slug}`} onClick={() => setCartOpen(false)} className="line__media">
                        <img src={line.product.image} alt="" width="1024" height="1170" loading="lazy" />
                      </Link>
                      <div className="line__body">
                        <div className="line__top">
                          <Link
                            to={`/product/${line.product.slug}`}
                            className="line__name"
                            onClick={() => setCartOpen(false)}
                          >
                            {line.product.name}
                          </Link>
                          <p className="line__price">{money(line.total)}</p>
                        </div>
                        <p className="line__variant">
                          {[line.color, line.option].filter(Boolean).join(' · ')}
                        </p>
                        <div className="line__bottom">
                          <QtyStepper
                            value={line.qty}
                            onChange={(q) => setQty(line.key, q)}
                            max={12}
                          />
                          <button
                            type="button"
                            className="line__remove"
                            onClick={() => removeLine(line.key)}
                            aria-label={`Remove ${line.product.name} from bag`}
                          >
                            <Trash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="cart__promo">
                  {promo ? (
                    <div className="promo promo--on">
                      <span>
                        <Check size={14} /> {promo.code} · {promo.label}
                      </span>
                      <button type="button" onClick={clearPromo}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={submitPromo}>
                      <label htmlFor="promo" className="sr-only">
                        Promo code
                      </label>
                      <input
                        id="promo"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value)
                          setPromoMsg(null)
                        }}
                        placeholder="Promo code"
                        autoComplete="off"
                      />
                      <button type="submit" className="btn btn--ghost btn--sm">
                        Apply
                      </button>
                    </form>
                  )}
                  {promoMsg && !promoMsg.ok && <p className="promo__msg">{promoMsg.message}</p>}
                  {!promo && !promoMsg && <p className="promo__hint">Try WELCOME10 for 10% off.</p>}
                </div>

                <div className="cart__foot">
                  <dl className="summary">
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{money(subtotal)}</dd>
                    </div>
                    {discount > 0 && (
                      <div className="summary__discount">
                        <dt>Discount</dt>
                        <dd>−{money(discount)}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Shipping</dt>
                      <dd>{shipping === 0 ? 'Free' : money(shipping)}</dd>
                    </div>
                    <div className="summary__total">
                      <dt>Total</dt>
                      <dd>{money(total)}</dd>
                    </div>
                  </dl>
                  <p className="cart__tax">Taxes and duties calculated at checkout.</p>
                  <button type="button" className="btn btn--solid btn--block" onClick={() => setStep('details')}>
                    Checkout <Arrow />
                  </button>
                  <p className="cart__shipnote">
                    <Truck size={16} /> Arrives {deliveryWindow(4)} · carbon-neutral delivery
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {step === 'details' && (
          <form className="checkout" onSubmit={submitOrder} noValidate>
            <button type="button" className="checkout__back" onClick={() => setStep('cart')}>
              <Arrow dir="left" size={14} /> Back to bag
            </button>

            <fieldset>
              <legend className="eyebrow">Contact</legend>
              {field('email', 'Email', { autoComplete: 'email', inputMode: 'email', placeholder: 'you@example.com' })}
            </fieldset>

            <fieldset>
              <legend className="eyebrow">Delivery</legend>
              <div className="grid-2">
                {field('first', 'First name', { autoComplete: 'given-name' })}
                {field('last', 'Last name', { autoComplete: 'family-name' })}
              </div>
              {field('address', 'Address', { autoComplete: 'street-address', placeholder: 'Street and number' })}
              <div className="grid-2">
                {field('city', 'City', { autoComplete: 'address-level2' })}
                {field('zip', 'Postal code', { autoComplete: 'postal-code' })}
              </div>
              <label className="field" htmlFor="co-country">
                <span>Country</span>
                <select
                  id="co-country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </fieldset>

            <div className="checkout__method">
              <span className="eyebrow">Method</span>
              <div className="checkout__method-row">
                <span>Standard · 4–7 business days</span>
                <strong>{shipping === 0 ? 'Free' : money(shipping)}</strong>
              </div>
              <p className="muted">Arrives {deliveryWindow(4)}</p>
            </div>

            <dl className="summary summary--compact">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="summary__discount">
                  <dt>Discount</dt>
                  <dd>−{money(discount)}</dd>
                </div>
              )}
              <div>
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? 'Free' : money(shipping)}</dd>
              </div>
              <div className="summary__total">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>

            <button type="submit" className="btn btn--solid btn--block">
              Place order · {money(total)}
            </button>
            <p className="checkout__fine">
              This is a demo store — no payment is taken and no data leaves your browser.
            </p>
          </form>
        )}

        {step === 'done' && placed && (
          <div className="order-done">
            <span className="order-done__tick" aria-hidden="true">
              <Check size={22} />
            </span>
            <h3>Thank you — it&rsquo;s on its way.</h3>
            <p className="muted">
              Order <strong>{placed.number}</strong> confirmed. A receipt is heading to{' '}
              <strong>{placed.email}</strong>.
            </p>
            <div className="order-done__card">
              <div className="order-done__row">
                <span>Arrives</span>
                <strong>{placed.date}</strong>
              </div>
              <div className="order-done__row">
                <span>Items</span>
                <strong>{placed.lines.reduce((n, l) => n + l.qty, 0)}</strong>
              </div>
              <div className="order-done__row">
                <span>Total paid</span>
                <strong>{money(placed.total)}</strong>
              </div>
            </div>
            <ul className="order-done__items">
              {placed.lines.map((l) => (
                <li key={l.key}>
                  <img src={l.product.image} alt="" width="1024" height="1170" loading="lazy" />
                  <span>
                    {l.product.name}
                    <em>{l.qty} × {money(l.product.price)}</em>
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--solid btn--block" onClick={() => setCartOpen(false)}>
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
