import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>THE BESPOKE ATELIER</span>
          <p className={styles.tagline}>The Modern Heirloom</p>
          <address className={styles.address}>
            14 Golden Lane, London EC1Y 0TL<br />
            <a href="tel:+442071234567">+44 207 123 4567</a><br />
            <a href="mailto:hello@bespokeatelier.com">hello@bespokeatelier.com</a>
          </address>
        </div>

        <div className={styles.col}>
          <p className="label" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-4)' }}>Navigation</p>
          <nav className={styles.links}>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/booking">Book Now</Link>
          </nav>
        </div>

        <div className={styles.col}>
          <p className="label" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-4)' }}>Hours</p>
          <dl className={styles.hours}>
            <div><dt>Mon – Fri</dt><dd>09:00 – 19:00</dd></div>
            <div><dt>Saturday</dt><dd>09:00 – 17:00</dd></div>
            <div><dt>Sunday</dt><dd>Closed</dd></div>
          </dl>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className="caption">© {year} The Bespoke Atelier. All rights reserved.</p>
        <div className={styles.legal}>
          <Link to="/privacy" className="caption">Privacy Policy</Link>
          <Link to="/terms" className="caption">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
