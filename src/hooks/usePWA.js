import { useState, useEffect, useCallback } from 'react';

export const usePWA = () => {
  // Detect if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(!isDevelopment);

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      } else if (window.navigator.standalone) {
        setIsInstalled(true);
      }
    };

    checkInstallation();
    window.addEventListener('beforeinstallprompt', () => setIsInstalled(false));
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    // Skip service worker registration in development mode
    if (isDevelopment) {
      console.log('PWA: Skipping service worker registration in development mode');
      return null;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
            }
          });
        });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setHasUpdate(false);
          window.location.reload();
        });

        return reg;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        return null;
      }
    }
    return null;
  }, [isDevelopment]);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (isDevelopment) {
      console.log('PWA: Install functionality disabled in development mode');
      return;
    }
    
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }
      window.deferredPrompt = null;
    }
  }, [isDevelopment]);

  // Skip waiting for service worker update
  const skipWaiting = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
  }, []);

  // Get PWA installation prompt
  useEffect(() => {
    if (isDevelopment) {
      console.log('PWA: Install prompt handling disabled in development mode');
      return;
    }
    
    const handleBeforeInstallPrompt = (e) => {
      window.deferredPrompt = e;
      // Let browser handle install prompt naturally
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isDevelopment]);

  return {
    isOnline,
    isInstalled,
    hasUpdate,
    registration,
    showInstallBanner,
    registerServiceWorker,
    installPWA,
    skipWaiting,
    dismissInstallBanner
  };
}; 