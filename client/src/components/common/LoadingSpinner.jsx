import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ fullscreen = false }) {
  return (
    <div className={fullscreen ? styles.fullscreen : styles.inline}>
      <span className={styles.spinner} aria-label="Loading" />
    </div>
  );
}
