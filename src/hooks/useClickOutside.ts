import { useEffect, type RefObject } from 'react';

/**
 * Closes a dropdown/menu when the user clicks outside `ref` or presses Escape.
 * Shared by the coding-language switcher and the notifications panel so the
 * same interaction logic isn't duplicated in both places.
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;

    function handlePointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onClose, active]);
}
