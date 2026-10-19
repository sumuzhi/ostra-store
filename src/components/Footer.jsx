import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/products.js'
import { Arrow } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <p className="logo logo--footer">Ostra.</p>
          <p className="footer__pitch">
            A small homeware studio working with makers in Portugal, Japan and Türkiye. We make
            fewer things, and we make them to be used.
          </p>
          <form
            className="subscribe"
            onSubmit={(e) => {
              e.preventDefault()
              e.currentTarget.reset()
            }}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input id="footer-email" type="email" required placeholder="Email address" />
            <button type="submit" aria-label="Subscribe">
              <Arrow />
            </button>
          </form>
          <p className="footer__fine">One letter a month. Unsubscribe whenever.</p>
        </div>

        <div className="footer__cols">
          <div>
            <p className="eyebrow">Shop</p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?cat=${c.id}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/shop">Gift cards</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Help</p>
            <ul>
              <li><Link to="/shop">Shipping &amp; delivery</Link></li>
              <li><Link to="/shop">Returns (30 days)</Link></li>
              <li><Link to="/shop">Care guide</Link></li>
              <li><Link to="/shop">Contact us</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Studio</p>
            <ul>
              <li><Link to="/#story">Our story</Link></li>
              <li><Link to="/#story">Makers</Link></li>
              <li><Link to="/#story">Materials</Link></li>
              <li><Link to="/#story">Stockists</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Ostra Studio. All rights reserved.</p>
        <div className="footer__meta">
          <span>Prices in USD</span>
          <span>Visa · Mastercard · Amex · Apple Pay</span>
        </div>
      </div>
    </footer>
  )
}
