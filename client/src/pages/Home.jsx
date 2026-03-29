import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBarbers } from '../api/barbers';
import { fetchServices } from '../api/services';
import { formatPrice } from '../utils/helpers';
import styles from './Home.module.css';

const FALLBACK_SERVICES = [
  {
    _id: 'f1',
    name: 'Classic Haircut',
    category: 'haircut',
    description: 'Precision cut tailored to your style with a hot towel finish.',
    duration: 45,
    pricing: { junior: 3000, senior: 4500, master: 6000 },
  },
  {
    _id: 'f2',
    name: 'Straight Razor Shave',
    category: 'beard',
    description: 'Traditional hot-lather straight-razor shave with skin treatment.',
    duration: 60,
    pricing: { junior: 2500, senior: 3500, master: 4500 },
  },
  {
    _id: 'f3',
    name: 'Atelier VIP Experience',
    category: 'haircut',
    description: 'Full grooming ritual – cut, scalp treatment, styling, and hot towel.',
    duration: 90,
    pricing: { junior: 6500, senior: 8500, master: 11000 },
  },
];

const FALLBACK_BARBERS = [
  { _id: 'b1', name: 'Viktor S.', title: 'Master Barber', bio: 'Over 15 years of precision cutting and traditional straight-razor shaving.' },
  { _id: 'b2', name: 'Martin K.', title: 'Senior Stylist', bio: 'Specialist in modern scissor techniques and textured finishes.' },
  { _id: 'b3', name: 'Daniel T.', title: 'Senior Stylist', bio: 'Expert in beard sculpting and classic barbershop services.' },
  { _id: 'b4', name: 'Alexander D.', title: 'Barber', bio: 'Dedicated to clean lines and contemporary styles.' },
];

const CATEGORY_LABELS = { haircut: 'Haircut', beard: 'Beard Care', facial: 'Facial' };

export default function Home() {
  const { data: barbers } = useQuery({ queryKey: ['barbers'], queryFn: fetchBarbers });
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: fetchServices });

  const featured = (services?.length ? services : FALLBACK_SERVICES).slice(0, 3);
  const teamList = barbers?.length ? barbers : FALLBACK_BARBERS;

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
                  {CATEGORY_LABELS[svc.category] ?? svc.category}
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
            {teamList.map((b) => (
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
