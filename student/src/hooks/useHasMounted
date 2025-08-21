import { useState, useEffect } from 'react';

/**
 * A simple hook to check if the component has mounted on the client.
 * This is useful for preventing hydration mismatches with components
 * that only work in the browser.
 * @returns {boolean} - True if the component has mounted, false otherwise.
 */
export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};
