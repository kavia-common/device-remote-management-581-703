import { useEffect, useState, useRef, useCallback } from 'react';

// PUBLIC_INTERFACE
/**
 * Custom hook for debouncing a value
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @param {Object} options - Configuration options
 * @param {boolean} options.leading - Execute on the leading edge (default: false)
 * @param {boolean} options.trailing - Execute on the trailing edge (default: true)
 * @returns {any} The debounced value
 * 
 * @example
 * const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
 * // Use debouncedSearchTerm in your API calls
 * 
 * @example
 * // With leading edge execution
 * const debouncedValue = useDebouncedValue(value, 500, { leading: true, trailing: false });
 */
const useDebouncedValue = (value, delay = 500, options = {}) => {
  const { leading = false, trailing = true } = options;
  
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);
  const isFirstRun = useRef(true);
  const previousValue = useRef(value);

  useEffect(() => {
    // Handle leading edge
    if (leading && isFirstRun.current) {
      setDebouncedValue(value);
      isFirstRun.current = false;
      previousValue.current = value;
      return;
    }

    // Only debounce if value has actually changed
    if (previousValue.current === value) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        previousValue.current = value;
      }, delay);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
};

// PUBLIC_INTERFACE
/**
 * Custom hook for debouncing a callback function
 * Returns a memoized debounced function
 * 
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @param {Object} options - Configuration options
 * @param {boolean} options.leading - Execute on the leading edge (default: false)
 * @param {boolean} options.trailing - Execute on the trailing edge (default: true)
 * @returns {Function} The debounced callback function
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((term) => {
 *   fetchData(term);
 * }, 300);
 */
export const useDebouncedCallback = (callback, delay = 500, options = {}) => {
  const { leading = false, trailing = true } = options;
  const timeoutRef = useRef(null);
  const isFirstRun = useRef(true);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args) => {
      // Handle leading edge
      if (leading && isFirstRun.current) {
        callbackRef.current(...args);
        isFirstRun.current = false;
        return;
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for trailing edge
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delay);
      }
    },
    [delay, leading, trailing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export default useDebouncedValue;
