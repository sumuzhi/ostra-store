import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext.jsx'
import { hasDiscount, money } from '../lib/format.js'
import { Heart, Plus } from './Icons.jsx'
import Rating from './Rating.jsx'

export default function ProductCard({ product, priority = false }) {
  const { addToCart, toggleWishlist, isSaved } = useStore()
  const saved = isSaved(product.id)
  const low = product.stock <= 5

  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            width="1024"
            height="1170"
          />
        </Link>

        {product.badge && <span className="pill card__badge">{product.badge}</span>}

        <button
          type="button"
          className={`card__wish${saved ? ' is-on' : ''}`}
          aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          aria-pressed={saved}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart size={17} filled={saved} />
        </button>

        <button
          type="button"
          className="card__quick"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to bag`}
        >
          <Plus size={15} />
          <span>Quick add</span>
        </button>
      </div>

      <div className="card__body">
        <div className="card__row">
          <h3 className="card__name">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="card__price">
            {hasDiscount(product) && <s>{money(product.compareAt)}</s>}
            {money(product.price)}
          </p>
        </div>

        <p className="card__blurb">{product.blurb}</p>

        <div className="card__meta">
          <Rating value={product.rating} reviews={product.reviews} size={11} />
          {product.colors.length > 1 && (
            <span className="swatches swatches--sm" aria-label="Available colours">
              {product.colors.map((c) => (
                <span key={c.name} className="swatch" style={{ background: c.hex }} title={c.name} />
              ))}
            </span>
          )}
        </div>

        {low && <p className="card__stock">Only {product.stock} left</p>}
      </div>
    </article>
  )
}
