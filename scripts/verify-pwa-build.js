#!/usr/bin/env node

/**
 * PWA Build Verification Script
 * Verifies that all PWA files are built correctly
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}[PWA Verify]${colors.reset} ${message}`);
}

function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      log(`✅ ${description}: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)}KB)`, 'green');
      return true;
    } else {
      log(`❌ ${description}: ${filePath} not found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Error checking ${filePath} - ${error.message}`, 'red');
    return false;
  }
}

function validateManifest(manifestPath) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      log(`❌ Manifest missing required fields: ${missingFields.join(', ')}`, 'red');
      return false;
    }
    
    // Check icons
    const icons = manifest.icons || [];
    const has192Icon = icons.some(icon => icon.sizes && icon.sizes.includes('192'));
    const has512Icon = icons.some(icon => icon.sizes && icon.sizes.includes('512'));
    
    if (!has192Icon || !has512Icon) {
      log(`❌ Manifest missing required icon sizes (192x192 and 512x512)`, 'red');
      return false;
    }
    
    log(`✅ Manifest validation passed`, 'green');
    return true;
  } catch (error) {
    log(`❌ Manifest validation failed: ${error.message}`, 'red');
    return false;
  }
}

function validateServiceWorker(swPath) {
  try {
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for essential service worker features
    const hasInstallEvent = swContent.includes('install');
    const hasFetchEvent = swContent.includes('fetch');
    const hasCache = swContent.includes('cache');
    
    if (!hasInstallEvent || !hasFetchEvent || !hasCache) {
      log(`❌ Service worker missing essential features`, 'red');
      return false;
    }
    
    log(`✅ Service worker validation passed`, 'green');
    return true;
  } catch (error) {
    log(`❌ Service worker validation failed: ${error.message}`, 'red');
    return false;
  }
}

function validateIndexHtml(indexPath) {
  try {
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for PWA-related meta tags and links
    const hasManifestLink = htmlContent.includes('manifest.json');
    const hasServiceWorker = htmlContent.includes('sw.js') || htmlContent.includes('service-worker');
    const hasViewport = htmlContent.includes('viewport');
    const hasThemeColor = htmlContent.includes('theme-color');
    
    if (!hasManifestLink || !hasViewport) {
      log(`❌ index.html missing essential PWA elements`, 'red');
      return false;
    }
    
    log(`✅ index.html validation passed`, 'green');
    return true;
  } catch (error) {
    log(`❌ index.html validation failed: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('Starting PWA build verification...', 'blue');
  
  const buildDir = path.join(process.cwd(), 'build');
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run "npm run build" first.', 'red');
    process.exit(1);
  }
  
  log(`Build directory found: ${buildDir}`, 'blue');
  
  // Check essential PWA files
  const checks = [
    { path: path.join(buildDir, 'manifest.json'), description: 'Web App Manifest', validator: validateManifest },
    { path: path.join(buildDir, 'sw.js'), description: 'Service Worker', validator: validateServiceWorker },
    { path: path.join(buildDir, 'index.html'), description: 'Index HTML', validator: validateIndexHtml },
    { path: path.join(buildDir, 'logo192.png'), description: '192x192 Icon' },
    { path: path.join(buildDir, 'logo512.png'), description: '512x512 Icon' },
    { path: path.join(buildDir, 'favicon.ico'), description: 'Favicon' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (check.validator) {
      const result = check.validator(check.path);
      if (!result) allPassed = false;
    } else {
      const result = checkFile(check.path, check.description);
      if (!result) allPassed = false;
    }
  }
  
  // Summary
  log('', 'blue');
  if (allPassed) {
    log('🎉 All PWA build checks passed!', 'green');
    log('Your PWA is ready for deployment.', 'green');
  } else {
    log('❌ Some PWA build checks failed.', 'red');
    log('Please fix the issues above before deploying.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkFile, validateManifest, validateServiceWorker, validateIndexHtml }; 