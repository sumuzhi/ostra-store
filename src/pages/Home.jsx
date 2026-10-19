import { Link } from 'react-router-dom'
import { CATEGORIES, PRODUCTS, bySlug } from '../data/products.js'
import { money } from '../lib/format.js'
import { useStore } from '../store/StoreContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Rating from '../components/Rating.jsx'
import Reveal from '../components/Reveal.jsx'
import { Arrow, Leaf, Plus, Star, Truck } from '../components/Icons.jsx'

const CATEGORY_IMAGE = {
  kitchen: '/img/plates.jpg',
  textiles: '/img/duvet.jpg',
  lighting: '/img/pendant.jpg',
  desk: '/img/tray.jpg',
  decor: '/img/vase.jpg',
}

const REVIEWS = [
  {
    quote:
      'The plates arrived wrapped in paper, not plastic, and the glaze is even nicer in person. Three months in and they still look new.',
    name: 'Marguerite L.',
    place: 'Brooklyn, NY',
    product: 'Field Dinner Plates',
  },
  {
    quote:
      'I bought one mug to test it and came back for four. It is the only cup I reach for now — the handle actually fits a whole hand.',
    name: 'Tom H.',
    place: 'Bristol, UK',
    product: 'Terra Mug',
  },
  {
    quote:
      'The linen is heavier than I expected in the best way. Washed it five times, it just gets softer. Worth the wait for shipping.',
    name: 'Sofie K.',
    place: 'Copenhagen, DK',
    product: 'Washed Linen Duvet Cover',
  },
]

export default function Home() {
  const { addToCart } = useStore()
  const bestsellers = PRODUCTS.filter((p) => p.tags.includes('bestseller')).slice(0, 4)
  const hero = bySlug('terra-mug')

  return (
    <main id="main">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Autumn 2026 — The quiet hours</p>
          <h1 className="hero__title">
            Objects that get
            <br />
            better with use.
          </h1>
          <p className="hero__lede">
            Stoneware thrown in Portugal, linen woven in Lithuania, brass machined in Sheffield. A
            short list of things for the table, the sofa and the desk — made to be handled daily and
            to look better for it.
          </p>
          <div className="hero__cta">
            <Link to="/shop" className="btn btn--solid">
              Shop the collection <Arrow />
            </Link>
            <a href="#story" className="btn btn--ghost">
              Our story
            </a>
          </div>
          <div className="hero__proof">
            <Rating value={4.9} size={13} showValue={false} />
            <p>
              <strong>4.9 / 5</strong> from 2,418 verified reviews
            </p>
          </div>
        </div>

        <div className="hero__visual">
          <img
            src="/img/corner.jpg"
            alt="A sunlit corner with a stoneware mug, folded linen and an oak stool"
            width="1024"
            height="1240"
            fetchPriority="high"
          />
          {hero && (
            <div className="hero__card">
              <img src={hero.image} alt="" width="1024" height="1170" loading="lazy" />
              <div>
                <p className="hero__card-label">Editor&rsquo;s pick</p>
                <Link to={`/product/${hero.slug}`} className="hero__card-name">
                  {hero.name}
                </Link>
                <p className="hero__card-price">{money(hero.price)}</p>
              </div>
              <button
                type="button"
                className="hero__card-add"
                aria-label={`Add ${hero.name} to bag`}
                onClick={() => addToCart(hero)}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
          <p className="hero__caption">Studio, Lisbon — photographed on a Tuesday.</p>
        </div>
      </section>

      {/* ---------- Value strip ---------- */}
      <section className="strip" aria-label="Why shop with us">
        <ul>
          <li>
            <Truck size={17} />
            Free shipping over $120
          </li>
          <li>
            <Leaf size={17} />
            Plastic-free packaging
          </li>
          <li>
            <Star size={15} />
            30-day returns
          </li>
          <li>Ships to 40+ countries</li>
        </ul>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="section container" aria-labelledby="cat-heading">
        <div className="section__head">
          <h2 id="cat-heading" className="section__title">
            Start where you are
          </h2>
          <Link to="/shop" className="link-arrow">
            All products <Arrow size={14} />
          </Link>
        </div>
        <div className="catgrid">
          {CATEGORIES.filter((c) => c.id !== 'decor').map((cat, i) => (
            <Reveal key={cat.id} delay={i * 60} className="catgrid__cell">
              <Link to={`/shop?cat=${cat.id}`} className="catcard">
                <img src={CATEGORY_IMAGE[cat.id]} alt="" width="1024" height="1170" loading="lazy" />
                <span className="catcard__overlay">
                  <span className="catcard__name">{cat.name}</span>
                  <span className="catcard__blurb">{cat.blurb}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Bestsellers ---------- */}
      <section className="section container" aria-labelledby="best-heading">
        <div className="section__head">
          <div>
            <h2 id="best-heading" className="section__title">
              What people keep buying
            </h2>
            <p className="section__sub">Restocked weekly. Sizes and colours go first.</p>
          </div>
          <Link to="/shop?tag=bestseller" className="link-arrow">
            Shop bestsellers <Arrow size={14} />
          </Link>
        </div>
        <div className="grid-cards">
          {bestsellers.map((p, i) => (
            <Reveal key={p.id} delay={i * 50}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Story band ---------- */}
      <section className="story" id="story" aria-labelledby="story-heading">
        <div className="story__media">
          <img src="/img/table-wide.jpg" alt="A table set for two with stoneware plates and linen" width="1024" height="656" loading="lazy" />
        </div>
        <div className="story__copy">
          <p className="eyebrow">The Sunday table</p>
          <h2 id="story-heading">Fewer things, used more.</h2>
          <p>
            We started in a one-room studio with eleven pieces and a rule: if it does not survive
            daily use, it does not ship. That rule has cost us a few products over the years — and
            kept every one of the others.
          </p>
          <p>
            Everything here is made by people we have met, in batches small enough that we can name
            them. When something sells out, we wait for the next firing rather than find a faster
            factory.
          </p>
          <div className="story__stats">
            <div>
              <strong>12</strong>
              <span>makers in 6 countries</span>
            </div>
            <div>
              <strong>2,418</strong>
              <span>verified reviews</span>
            </div>
            <div>
              <strong>0</strong>
              <span>plastic in the parcel</span>
            </div>
          </div>
          <Link to="/shop" className="btn btn--ghost">
            See what we make <Arrow />
          </Link>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="section container" aria-labelledby="rev-heading">
        <div className="section__head">
          <h2 id="rev-heading" className="section__title">
            In other people&rsquo;s homes
          </h2>
          <Rating value={4.9} reviews={2418} size={13} />
        </div>
        <div className="quotes">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 70} as="figure" className="quote">
              <Rating value={5} size={12} showValue={false} />
              <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>
                  {r.place} · {r.product}
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}
