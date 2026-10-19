import { Link } from 'react-router-dom'
import { Arrow } from '../components/Icons.jsx'

export default function NotFound() {
  return (
    <main id="main" className="container notfound">
      <p className="eyebrow">404</p>
      <h1>This shelf is empty.</h1>
      <p className="muted">
        The page you were after has moved, or the piece has sold out and been retired. There is
        plenty else to look at.
      </p>
      <div className="notfound__actions">
        <Link to="/shop" className="btn btn--solid">
          Back to the collection <Arrow />
        </Link>
        <Link to="/" className="btn btn--ghost">
          Home
        </Link>
      </div>
    </main>
  )
}
