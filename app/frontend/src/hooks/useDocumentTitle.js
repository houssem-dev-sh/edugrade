import { useEffect } from 'react';
import { BRAND } from '../config';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} · ${BRAND}`;
  }, [title]);
}
