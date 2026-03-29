import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/booking', label: 'Book Now' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          THE BESPOKE ATELIER
        </Link>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/booking"
            className={`btn btn-primary ${styles.cta}`}
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>
        </nav>

        <button
          className={styles.burger}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`${styles.bar} ${open ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${open ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${open ? styles.barOpen3 : ''}`} />
        </button>
      </div>
    </header>
  );
}
