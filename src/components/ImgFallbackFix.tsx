'use client';

import { useEffect } from 'react';

/**
 * Hides broken remote token images (e.g. expired googleusercontent URLs)
 * so their alt text doesn't render as a duplicated "$PONY / $PONY" line.
 */
export function ImgFallbackFix() {
  useEffect(() => {
    const onError = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === 'IMG') {
        (t as HTMLImageElement).style.display = 'none';
      }
    };
    document.addEventListener('error', onError, true);
    return () => document.removeEventListener('error', onError, true);
  }, []);
  return null;
}
