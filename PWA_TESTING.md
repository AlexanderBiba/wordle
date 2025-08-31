# 🧪 PWA Testing Guide

This guide will help you test all the Progressive Web App (PWA) features of the Wordle game.

## 🚀 Quick Start Testing

### 1. Build and Serve the PWA
```bash
# Generate PWA icons and build
npm run pwa-build

# Serve the built app locally
npx serve -s build
```

### 2. Open in Browser
- Navigate to `http://localhost:3000`
- Open Chrome DevTools (F12)
- Go to **Application** tab
- Check **Manifest** and **Service Workers** sections

## 📱 PWA Feature Testing

### ✅ Web App Manifest
**Test Location**: Chrome DevTools → Application → Manifest

**What to Verify**:
- [ ] App name displays correctly
- [ ] Icons are properly configured
- [ ] Theme colors match the app
- [ ] Display mode is set to "standalone"
- [ ] Start URL is correct

**Expected Result**: All manifest properties should be properly configured and visible.

### ✅ Service Worker Registration
**Test Location**: Chrome DevTools → Application → Service Workers

**What to Verify**:
- [ ] Service worker is registered
- [ ] Status shows "activated and running"
- [ ] No errors in console
- [ ] Cache storage is working

**Expected Result**: Service worker should be active and managing the app.

### ✅ Offline Functionality
**Test Steps**:
1. Load the app completely
2. Go to Chrome DevTools → Network
3. Check "Offline" checkbox
4. Refresh the page
5. Try to play the game

**Expected Result**: App should work offline, showing offline banner.

### ✅ Installation Prompt
**Test Steps**:
1. Use Chrome/Edge browser
2. Look for install icon in address bar
3. Click install icon
4. Follow installation process

**Expected Result**: App should install and appear in app list.

### ✅ App-like Experience
**Test Steps**:
1. Install the PWA
2. Launch from app launcher
3. Check if it opens in standalone mode
4. Verify no browser UI elements

**Expected Result**: App should look and feel like a native app.

## 🔍 Detailed Testing Scenarios

### Scenario 1: First-Time PWA Visit
**Steps**:
1. Clear browser cache and data
2. Visit the app URL
3. Check for install prompt
4. Verify service worker registration

**Expected Results**:
- Install prompt appears (if eligible)
- Service worker registers successfully
- App loads with PWA features

### Scenario 2: Offline Gameplay
**Steps**:
1. Load app completely
2. Go offline
3. Play a game
4. Check offline banner
5. Go back online
6. Verify data sync

**Expected Results**:
- Offline banner appears
- Game functions normally offline
- Data syncs when back online

### Scenario 3: PWA Updates
**Steps**:
1. Install PWA
2. Make code changes
3. Rebuild and deploy
4. Check for update notification
5. Test update process

**Expected Results**:
- Update banner appears
- Update process works smoothly
- App refreshes with new version

### Scenario 4: Cross-Device Testing
**Test on Multiple Devices**:
- [ ] Desktop Chrome
- [ ] Desktop Edge
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)
- [ ] Tablet devices

**Expected Results**:
- Consistent PWA behavior across devices
- Proper responsive design
- Touch-friendly interactions

## 🛠️ Developer Tools

### Chrome DevTools
**Key Tabs**:
- **Application**: Manifest, Service Workers, Storage
- **Network**: Offline simulation, caching
- **Performance**: PWA performance metrics
- **Lighthouse**: PWA audit scores

### Lighthouse PWA Audit
**Run Command**:
```bash
npm run lighthouse
```

**Key Metrics**:
- PWA Score: 90+
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Service Worker Testing
**Debug Commands**:
```javascript
// In console
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations));

// Check cache
caches.keys().then(names => console.log(names));
```

## 🐛 Common Issues & Solutions

### Issue: Service Worker Not Registering
**Symptoms**: No service worker in DevTools
**Solutions**:
- Check if HTTPS (required for service workers)
- Verify sw.js file exists in public folder
- Check browser console for errors
- Ensure proper file paths

### Issue: Install Prompt Not Appearing
**Symptoms**: No install button in address bar
**Solutions**:
- Verify manifest.json is valid
- Check if app meets install criteria
- Test on supported browsers
- Ensure proper icon sizes

### Issue: Offline Functionality Broken
**Symptoms**: App doesn't work offline
**Solutions**:
- Check service worker cache strategies
- Verify static assets are cached
- Test cache-first vs network-first strategies
- Check service worker lifecycle

### Issue: PWA Not Installing
**Symptoms**: Installation fails or app doesn't appear
**Solutions**:
- Verify manifest.json syntax
- Check icon file paths and sizes
- Ensure start_url is correct
- Test on different devices

## 📊 Performance Testing

### Core Web Vitals
**Metrics to Monitor**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### PWA-Specific Metrics
**Key Performance Indicators**:
- Time to First Meaningful Paint
- Service Worker Registration Time
- Offline Functionality Response Time
- App Installation Success Rate

## 🔧 Testing Automation

### Automated PWA Testing
**Tools**:
- **Lighthouse CI**: Automated performance testing
- **Puppeteer**: Headless browser testing
- **Jest**: Unit and integration tests
- **Cypress**: End-to-end testing

### CI/CD Integration
**GitHub Actions Example**:
```yaml
- name: PWA Build Test
  run: npm run pwa-build

- name: Lighthouse Audit
  run: npm run lighthouse

- name: Deploy to Firebase
  run: npm run deploy
```

## 📝 Testing Checklist

### Pre-Launch PWA Testing
- [ ] Manifest validation
- [ ] Service worker functionality
- [ ] Offline capabilities
- [ ] Installation process
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance metrics
- [ ] Accessibility compliance

### Post-Launch Monitoring
- [ ] User installation rates
- [ ] Offline usage statistics
- [ ] Performance metrics
- [ ] Error tracking
- [ ] User feedback collection
- [ ] A/B testing results

## 🎯 Success Criteria

### PWA Readiness
- **Lighthouse Score**: 90+ across all categories
- **Installation Success**: >95% on supported devices
- **Offline Functionality**: 100% core features working
- **Performance**: <3s time to interactive
- **User Experience**: Native app-like feel

### Quality Assurance
- **Cross-Platform**: Works on all major browsers
- **Device Compatibility**: Responsive on all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: HTTPS and secure authentication
- **Reliability**: Consistent offline/online behavior

---

**Happy Testing! 🧪✨**

*Remember: A great PWA provides a seamless, app-like experience across all devices and network conditions.* 