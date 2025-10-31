import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// PUBLIC_INTERFACE
/**
 * Custom hook to manage focus on route changes
 * Announces route changes to screen readers
 * Improves keyboard navigation experience
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.announcePageTitle - If true, announces page title on route change
 * @returns {Object} - Returns ref to attach to the container element
 */
const useFocusManagement = (options = {}) => {
  const location = useLocation();
  const containerRef = useRef(null);
  const { announcePageTitle = true } = options;

  useEffect(() => {
    // Focus the container on route change
    if (containerRef.current) {
      containerRef.current.focus();
    }

    // Optionally announce page title to screen readers
    if (announcePageTitle) {
      const pageTitle = document.title;
      // Create a temporary announcement element
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.textContent = `Navigated to ${pageTitle}`;
      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [location.pathname, announcePageTitle]);

  return containerRef;
};

export default useFocusManagement;
