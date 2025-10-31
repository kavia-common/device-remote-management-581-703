import { useContext } from 'react';
import ToastContext from '../components/ToastProvider';

/**
 * PUBLIC_INTERFACE
 * useToast is a convenience hook that exposes the toast API from ToastProvider.
 * It throws a helpful error if used outside the provider during development.
 */
export default function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // This case shouldn't occur because context has a default, but this helps future refactors.
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
