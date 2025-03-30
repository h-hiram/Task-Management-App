
import { useEffect, useState } from 'react';

interface CapacitorState {
  isCapacitorApp: boolean;
}

export function useCapacitor(): CapacitorState {
  const [state, setState] = useState<CapacitorState>({
    isCapacitorApp: false,
  });

  useEffect(() => {
    async function checkCapacitor() {
      try {
        // Check if we're running in a Capacitor app
        const isCapacitorApp = 
          typeof window !== 'undefined' && 
          window.Capacitor !== undefined && 
          window.Capacitor.isNativePlatform();
          
        setState({ isCapacitorApp: !!isCapacitorApp });
      } catch (error) {
        console.error('Error checking Capacitor status:', error);
        setState({ isCapacitorApp: false });
      }
    }

    checkCapacitor();
  }, []);

  return state;
}
