import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Some Windows systems (with Docker, VMs) always keep navigator.onLine = true.
    // To fix this without heavy pings, we do a very lightweight HEAD request to the current domain.
    const checkActualConnection = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      try {
        // Very optimized lightweight ping to the site's own origin
        await fetch(window.location.origin + '/?ping=' + new Date().getTime(), { 
          method: 'HEAD',
          cache: 'no-store'
        });
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const intervalId = setInterval(checkActualConnection, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline };
};
