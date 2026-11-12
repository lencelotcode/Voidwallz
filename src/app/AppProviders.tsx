import type { ReactNode } from 'react';
import { VisualEffectsProvider } from '../shared/hooks/useVisualEffects';
export default function AppProviders({ children }: { children: ReactNode }) {
  return <VisualEffectsProvider>{children}</VisualEffectsProvider>;
}
