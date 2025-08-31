# 🔧 PWA Troubleshooting Guide

This guide helps you resolve common PWA issues, especially those related to Lighthouse CI testing and deployment.

## 🚨 Common Issues & Solutions

### Issue: Lighthouse CI Fails with "NO_FCP" Error

**Symptoms:**
- Lighthouse fails with "The page did not paint any content"
- Server timeout warnings
- Missing gatherers in Lighthouse output

**Root Causes:**
1. Server not starting properly in CI environment
2. Page not loading within timeout period
3. Chrome flags not configured for CI environment
4. Service worker or manifest issues

**Solutions:**

#### 1. Fix Server Startup Timing
```bash
# Update .lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerReadyPattern": "Accepting connections at http://localhost:3000",
      "startServerReadyTimeout": 60000,
      "numberOfRuns": 1
    }
  }
}
```

#### 2. Use CI-Specific Chrome Flags
```json
{
  "settings": {
    "chromeFlags": "--no-sandbox --disable-dev-shm-usage --disable-gpu --headless --disable-web-security --disable-features=VizDisplayCompositor"
  }
}
```

#### 3. Skip Problematic Audits
```json
{
  "settings": {
    "skipAudits": [
      "uses-http2",
      "uses-passive-event-listeners",
      "meta-description",
      "http-status-code"
    ]
  }
}
```

### Issue: Service Worker Not Registering

**Symptoms:**
- Service worker not appearing in DevTools
- Console errors about service worker registration
- PWA not working offline

**Solutions:**

#### 1. Check Service Worker Path
```javascript
// In usePWA.js
const swPath = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/sw.js` : '/sw.js';
```

#### 2. Verify Service Worker File
```bash
# Check if service worker exists
ls -la build/sw.js

# Verify service worker content
head -10 build/sw.js
```

#### 3. Check HTTPS Requirement
- Service workers require HTTPS in production
- Localhost is allowed for development
- GitHub Pages provides HTTPS automatically

### Issue: Manifest Not Loading

**Symptoms:**
- Install prompt not appearing
- Manifest errors in console
- PWA not installable

**Solutions:**

#### 1. Verify Manifest Path
```html
<!-- In index.html -->
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
```

#### 2. Check Manifest Content
```json
{
  "name": "Wordle - Daily Word Puzzle Game",
  "short_name": "Wordle",
  "start_url": "./",
  "display": "standalone",
  "icons": [
    {
      "src": "logo192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

#### 3. Validate Manifest
```bash
# Use the verification script
npm run verify-pwa
```

### Issue: PWA Not Installing

**Symptoms:**
- Install button not appearing
- Installation fails
- App not appearing in app launcher

**Solutions:**

#### 1. Check Installation Criteria
- HTTPS required
- Valid manifest
- Service worker registered
- User engagement (not first visit)

#### 2. Test Installation Flow
```javascript
// In usePWA.js
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  setShowInstallBanner(true);
});
```

#### 3. Verify Browser Support
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Limited support

## 🧪 Testing Tools

### Local PWA Testing
```bash
# Build and test locally
npm run test-pwa

# Test with Lighthouse
npm run test-pwa-lighthouse

# Verify PWA build
npm run verify-pwa

# Test CI environment locally
npm run test-pwa-ci
```

### Lighthouse Testing
```bash
# Run Lighthouse manually
npx lighthouse http://localhost:3000 --output=html

# Run Lighthouse CI
lhci autorun --config=./.lighthouserc.json

# Run with CI config
lhci autorun --config=./.lighthouserc-ci.json
```

### Browser Testing
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check Manifest and Service Workers
4. Test offline functionality
```

## 🔍 Debugging Steps

### Step 1: Verify Build Output
```bash
# Check build directory
ls -la build/

# Verify PWA files exist
ls -la build/manifest.json build/sw.js build/logo*.png
```

### Step 2: Test Server Locally
```bash
# Start server
npx serve -s build -p 3000

# Test in browser
curl http://localhost:3000
curl http://localhost:3000/manifest.json
curl http://localhost:3000/sw.js
```

### Step 3: Check Browser Console
```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations));

// Check manifest
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => console.log(manifest));
```

### Step 4: Validate PWA Features
```bash
# Run verification script
node scripts/verify-pwa-build.js

# Check Lighthouse scores
npm run lighthouse
```

## 🚀 CI/CD Troubleshooting

### GitHub Actions Issues

#### Issue: Build Fails
```yaml
# Check build step
- name: Build for GitHub Pages
  run: PUBLIC_URL=/wordle/ npm run build
  env:
    CI: false
    REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
```

#### Issue: Lighthouse CI Fails
```yaml
# Use robust PWA testing
- name: Run PWA CI Testing
  run: ./scripts/test-pwa-ci.sh
```

#### Issue: Deployment Fails
```yaml
# Check deployment step
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./build
```

### Environment Variables
```bash
# Required for Firebase
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID
```

## 📱 Platform-Specific Issues

### iOS Safari
- Limited PWA support
- No service worker background sync
- Install via "Add to Home Screen"

### Android Chrome
- Full PWA support
- Native app-like experience
- Background sync available

### Desktop Browsers
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Limited support

## 🔧 Advanced Debugging

### Service Worker Debugging
```javascript
// In service worker
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open('v1').then((cache) => {
      console.log('Cache opened');
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
});
```

### Manifest Debugging
```javascript
// Check manifest loading
fetch('/manifest.json')
  .then(response => {
    console.log('Manifest status:', response.status);
    return response.json();
  })
  .then(manifest => {
    console.log('Manifest content:', manifest);
  })
  .catch(error => {
    console.error('Manifest error:', error);
  });
```

### Lighthouse Debugging
```bash
# Run with verbose output
lhci autorun --config=./.lighthouserc.json --verbose

# Check specific categories
lhci autorun --config=./.lighthouserc.json --onlyCategories=pwa
```

## 📞 Getting Help

### Check Logs
```bash
# GitHub Actions logs
# Check the "Validate PWA" job output

# Local testing logs
npm run test-pwa-ci

# Lighthouse logs
cat .lighthouseci/lhr-*.json
```

### Common Error Messages
- `NO_FCP`: Page not painting content
- `Service worker registration failed`: Path or HTTPS issues
- `Manifest not found`: File path issues
- `Installation failed`: Browser compatibility

### Resources
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) 