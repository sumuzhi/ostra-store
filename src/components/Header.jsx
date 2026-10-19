import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext.jsx'
import { Bag, Close, Heart, Menu, Search } from './Icons.jsx'
import { CATEGORIES } from '../data/products.js'

const NAV = [
  { label: 'Shop all', to: '/shop' },
  { label: 'New in', to: '/shop?tag=new' },
  { label: 'Bestsellers', to: '/shop?tag=bestseller' },
  { label: 'Our story', to: '/#story' },
]

export default function Header() {
  const { count, wishlist, setCartOpen, setSearchOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <>
      <div className="topbar">
        <p>
          Free shipping over $120 <span className="dot" aria-hidden="true" /> 30-day returns
          <span className="topbar__more">
            <span className="dot" aria-hidden="true" /> Ships worldwide
          </span>
        </p>
      </div>

      <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="header__inner">
          <button
            type="button"
            className="icon-btn header__menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>

          <Link to="/" className="logo" aria-label="Ostra — home">
            Ostra<span className="logo__mark" aria-hidden="true">.</span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <Link key={item.label} to={item.to} className="nav__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </button>
            <Link
              to="/shop?saved=1"
              className="icon-btn icon-btn--badge"
              aria-label={`Saved items (${wishlist.length})`}
            >
              <Heart />
              {wishlist.length > 0 && <span className="badge-dot">{wishlist.length}</span>}
            </Link>
            <button
              type="button"
              className="icon-btn icon-btn--badge"
              aria-label={`Open bag (${count} items)`}
              onClick={() => setCartOpen(true)}
            >
              <Bag />
              {count > 0 && <span className="badge-dot">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-menu__head">
            <span className="logo logo--sm">Ostra.</span>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <Close />
            </button>
          </div>
          <nav className="mobile-menu__nav" aria-label="Menu">
            {NAV.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate(item.to)
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <p className="eyebrow mobile-menu__label">Collections</p>
          <ul className="mobile-menu__cats">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(`/shop?cat=${c.id}`)
                  }}
                >
                  {c.name}
                  <span>{c.blurb}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
