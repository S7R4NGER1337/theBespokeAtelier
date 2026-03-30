import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Handles scroll behaviour across navigation:
 * - PUSH / REPLACE  → scroll to top immediately
 * - POP (back/fwd)  → restore the saved scroll position for that entry
 *
 * Positions are stored in sessionStorage keyed by the router's location.key
 * so they survive soft refreshes but not hard reloads (expected behaviour).
 */
export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') {
      const saved = sessionStorage.getItem(`scroll:${location.key}`);
      if (saved) {
        const { x, y } = JSON.parse(saved);
        // rAF lets the page paint before jumping to the saved position
        requestAnimationFrame(() => window.scrollTo(x, y));
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      sessionStorage.setItem(
        `scroll:${location.key}`,
        JSON.stringify({ x: window.scrollX, y: window.scrollY })
      );
    };
  }, [location.key, navType]);

  return null;
}
