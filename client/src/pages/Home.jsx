import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBarbers } from '../api/barbers';
import { fetchServices } from '../api/services';
import { formatPrice } from '../utils/helpers';
import styles from './Home.module.css';

export default function Home() {
  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: fetchBarbers });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: fetchServices });

  const featured = services.slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={`container ${styles.heroContent}`}>
          <p className={`label ${styles.eyebrow}`}>Est. London</p>
          <h1 className={styles.headline}>
            The Modern<br />
            <em>Heirloom</em>
          </h1>
          <p className={styles.sub}>
            Precision craft. Traditional ritual. Contemporary edge.
          </p>
          <div className={styles.heroCta}>
            <Link to="/booking" className="btn btn-primary">Book Appointment</Link>
            <Link to="/services" className="btn btn-outline">Our Services</Link>
          </div>
        </div>
        <div className={styles.heroScroll} aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ── Services preview ──────────────────────────────────────── */}
      <section className={`section ${styles.servicesSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className="label" style={{ color: 'var(--color-primary)' }}>Our Craft</p>
            <h2 className={styles.sectionTitle}>Services</h2>
          </div>
          <div className={styles.servicesGrid}>
            {featured.map((svc) => (
              <div key={svc._id} className={`card-gilded ${styles.serviceCard}`}>
                <p className="label" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {svc.category}
                </p>
                <h3 className={styles.serviceTitle}>{svc.name}</h3>
                <p className={styles.serviceDesc}>{svc.description}</p>
                <div className={styles.serviceMeta}>
                  <span className={styles.servicePrice}>
                    From {formatPrice(svc.pricing.junior)}
                  </span>
                  <span className="caption">{svc.duration} min</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--sp-12)' }}>
            <Link to="/services" className="btn btn-outline">View All Services</Link>
          </div>
        </div>
      </section>

      {/* ── Barbers ───────────────────────────────────────────────── */}
      <section className={`section ${styles.barbersSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className="label" style={{ color: 'var(--color-primary)' }}>The Team</p>
            <h2 className={styles.sectionTitle}>Master Barbers</h2>
          </div>
          <div className={styles.barbersGrid}>
            {barbers.map((b) => (
              <div key={b._id} className={styles.barberCard}>
                <div className={styles.barberAvatar}>
                  {b.image ? (
                    <img src={b.image} alt={b.name} />
                  ) : (
                    <span className={styles.barberInitial}>
                      {b.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={styles.barberInfo}>
                  <h3 className={styles.barberName}>{b.name}</h3>
                  <p className="label" style={{ color: 'var(--color-primary)', fontSize: '0.625rem' }}>
                    {b.title}
                  </p>
                  <p className={styles.barberBio}>{b.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <h2 className={styles.ctaTitle}>
            It's time for your<br /><em>new look</em>
          </h2>
          <Link to="/booking" className="btn btn-primary" style={{ marginTop: 'var(--sp-8)' }}>
            Book Now
          </Link>
        </div>
      </section>
    </>
  );
}
