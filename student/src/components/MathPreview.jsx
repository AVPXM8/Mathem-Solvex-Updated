import React from 'react';
import useMathJax from '../hooks/useMathJax';

const MathPreview = ({ latexString = '', className = '', style = {} }) => {
  // Guard: don’t let MathJax mutate during the very first paint
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Your hook should typeset in a useEffect; calling it after "mounted" avoids hydration issues
  useMathJax(mounted ? [latexString] : []);

  // First paint returns the raw HTML (stable). MathJax enhances after mount.
  return (
    <div
      className={className}
      style={style}
      // ensure string to avoid "undefined" in DOM
      dangerouslySetInnerHTML={{ __html: latexString || '' }}
    />
  );
};

export default MathPreview;
