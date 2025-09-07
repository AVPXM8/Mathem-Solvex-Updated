import { useEffect } from 'react';

const useMathJax = (dependencies) => {
  useEffect(() => {
    if (typeof window?.MathJax?.typesetPromise === 'function') {
      window.MathJax.typesetPromise();
    }
  }, [JSON.stringify(dependencies)]); // A robust way to check for deep changes
};

export default useMathJax;