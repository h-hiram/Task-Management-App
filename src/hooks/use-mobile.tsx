
import { useState, useEffect } from 'react';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Initial check
    const checkDeviceType = () => {
      // Check if running in a Capacitor native app
      const isCapacitorNative = 
        typeof (window as any).Capacitor !== 'undefined' && 
        (window as any).Capacitor.isNative;
      
      // Also check for mobile browsers
      const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      
      setIsMobile(isCapacitorNative || isMobileBrowser);
    };
    
    checkDeviceType();
    
    // Add listener for orientation/resize changes
    window.addEventListener('resize', checkDeviceType);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);
  
  return isMobile;
};

export default useIsMobile;
