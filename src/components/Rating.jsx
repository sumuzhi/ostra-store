import { Star } from './Icons.jsx'

export default function Rating({ value = 0, reviews, size = 12, showValue = true }) {
  const rounded = Math.round(value)
  return (
    <span className="rating" title={`${value} out of 5`}>
      <span className="rating__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} filled={n <= rounded} />
        ))}
      </span>
      {showValue && (
        <span className="rating__text">
          {value.toFixed(1)}
          {typeof reviews === 'number' && <span className="rating__count"> ({reviews})</span>}
        </span>
      )}
    </span>
  )
}
