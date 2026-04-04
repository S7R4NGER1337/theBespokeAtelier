import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../api/services';
import { formatPrice } from '../utils/helpers';
import useInView from '../hooks/useInView';
import styles from './Services.module.css';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'haircut', label: 'Haircuts' },
  { value: 'beard', label: 'Beard Care' },
  { value: 'facial', label: 'Facial Treatments' },
];

const TIER_LABELS = { junior: 'Junior', senior: 'Senior', master: 'Master' };

const CATEGORY_NAMES = {
  haircut: 'Haircuts',
  beard:   'Beard Care',
  facial:  'Facial Treatments',
};

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('');

  const { data: services = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['services', activeCategory],
    queryFn: () => fetchServices(activeCategory || undefined),
  });

  const [sectionRef, sectionInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  // Group by category for display
  const grouped = services.reduce((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={`label ${styles.heroEyebrow}`} style={{ color: 'var(--color-primary)' }}>Pricing</p>
          <h1 className={styles.headline}>Services &amp; Pricing</h1>
          <p className={styles.sub}>
            Every service is priced by tier – Junior, Senior, or Master – so you choose
            the level of experience that suits your visit.
          </p>
        </div>
      </section>

      {/* Tier legend */}
      <div className={`container ${styles.tierLegend} ${styles.tierLegendWrap}`}>
        {Object.entries(TIER_LABELS).map(([tier, label]) => (
          <div key={tier} className={styles.tierPill}>
            <span className={`${styles.tierDot} ${styles[`dot_${tier}`]}`} />
            <span className="label">{label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className={`container ${styles.filterRow} ${styles.filterRowWrap}`}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`${styles.filterBtn} ${activeCategory === c.value ? styles.filterActive : ''}`}
            onClick={() => setActiveCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Services */}
      <section ref={sectionRef} className="section" style={{ paddingTop: 'var(--sp-10)' }}>
        <div className="container">
          {isLoading ? (
            <p className="caption" style={{ textAlign: 'center', padding: 'var(--sp-16) 0' }}>Loading…</p>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: 'var(--sp-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-6)' }}>
              <p className="caption">Unable to load services. Please try again.</p>
              <button className="btn btn-outline" onClick={() => refetch()}>Try Again</button>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items], i) => (
              <div
                key={category}
                className={`${styles.categoryBlock} fade-up${sectionInView ? ' in-view' : ''}`}
                style={{ transitionDelay: sectionInView ? `${i * 0.15}s` : '0s' }}
              >
                <h2 className={styles.categoryTitle}>
                  {CATEGORY_NAMES[category] ?? category}
                </h2>
                <div className={styles.serviceTable}>
                  {items.map((svc) => (
                    <div key={svc._id} className={styles.tableRow}>
                      <div>
                        <p className={styles.svcName}>{svc.name}</p>
                        <p className="caption">{svc.description}</p>
                      </div>
                      <span className="caption">{svc.duration} min</span>
                      <div className={styles.priceGroup}>
                        <span className={styles.price} data-tier="Junior">{formatPrice(svc.pricing.junior)}</span>
                        <span className={styles.price} data-tier="Senior">{formatPrice(svc.pricing.senior)}</span>
                        <span className={`${styles.price} ${styles.priceMaster}`} data-tier="Master">{formatPrice(svc.pricing.master)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div
            ref={ctaRef}
            className={`${styles.ctaInner} fade-up${ctaInView ? ' in-view' : ''}`}
          >
            <h2 className={styles.ctaTitle}>
              Ready for your<br /><em>transformation?</em>
            </h2>
            <div className={styles.ctaBtns}>
              <Link to="/booking" className="btn btn-primary">Book Now</Link>
              <a href="tel:+442071234567" className="btn btn-outline">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
