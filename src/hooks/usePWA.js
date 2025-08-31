import { useState, useEffect, useCallback } from 'react';

export const usePWA = () => {
  // Detect if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      // Check if running in standalone mode (installed PWA)
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setShowInstallBanner(false);
        return true;
      }
      
      // Check for iOS standalone mode
      if (window.navigator.standalone) {
        setIsInstalled(true);
        setShowInstallBanner(false);
        return true;
      }
      
      // Check if app is installed via other means
      if (window.location.search.includes('source=pwa') || 
          document.referrer.includes('android-app://') ||
          window.navigator.userAgent.includes('Mobile') && window.navigator.userAgent.includes('Safari')) {
        setIsInstalled(true);
        setShowInstallBanner(false);
        return true;
      }
      
      return false;
    };

    const isAlreadyInstalled = checkInstallation();
    
    // Listen for app installation event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Only set up install prompt if not already installed
    if (!isAlreadyInstalled) {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Only show banner if we have a deferred prompt, app is not installed, and user hasn't dismissed it
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallBanner(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
    
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [isInstalled]);

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
        // Use the correct path for the service worker based on deployment
        const swPath = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/sw.js` : '/sw.js';
        const reg = await navigator.serviceWorker.register(swPath);
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
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isDevelopment]);

  // Skip waiting for service worker update
  const skipWaiting = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
    // Remember that user dismissed the banner
    localStorage.setItem('pwa-install-dismissed', 'true');
  }, []);

  // Reset dismissed state (for testing)
  const resetInstallBanner = useCallback(() => {
    localStorage.removeItem('pwa-install-dismissed');
    if (deferredPrompt && !isInstalled) {
      setShowInstallBanner(true);
    }
  }, [deferredPrompt, isInstalled]);

  return {
    isOnline,
    isInstalled,
    hasUpdate,
    registration,
    showInstallBanner,
    registerServiceWorker,
    installPWA,
    skipWaiting,
    dismissInstallBanner,
    resetInstallBanner
  };
}; 