#!/bin/bash

# Simple PWA Testing Script
# This script manually manages the server and runs Lighthouse

set -e

echo "🚀 Starting Simple PWA Testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if build directory exists
if [ ! -d "build" ]; then
    print_error "Build directory not found. Please run 'npm run build' first."
    exit 1
fi

print_status "Build directory found. Contents:"
ls -la build/

# Install serve globally if not present
if ! command -v serve &> /dev/null; then
    print_status "Installing serve globally..."
    npm install -g serve@14.2.4
fi

# Start server manually
print_status "Starting server on port 3000..."
npx serve -s build -p 3000 > server.log 2>&1 &
SERVER_PID=$!

print_status "Server PID: $SERVER_PID"

# Wait for server to be ready
print_status "Waiting for server to be ready..."
sleep 10

# Test if server is responding
if curl -f http://localhost:3000/wordle/ > /dev/null 2>&1; then
    print_success "Server is ready on http://localhost:3000/wordle/"
else
    print_error "Server failed to start properly"
    print_status "Server logs:"
    cat server.log
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test PWA features
print_status "Testing PWA features..."

# Test manifest
MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/wordle/manifest.json)
if [ "$MANIFEST_STATUS" = "200" ]; then
    print_success "Manifest accessible (HTTP $MANIFEST_STATUS)"
else
    print_error "Manifest not accessible (HTTP $MANIFEST_STATUS)"
fi

# Test service worker
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/wordle/sw.js)
if [ "$SW_STATUS" = "200" ]; then
    print_success "Service worker accessible (HTTP $SW_STATUS)"
else
    print_error "Service worker not accessible (HTTP $SW_STATUS)"
fi

# Test icons
ICON192_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/wordle/logo192.png)
ICON512_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/wordle/logo512.png)
if [ "$ICON192_STATUS" = "200" ] && [ "$ICON512_STATUS" = "200" ]; then
    print_success "Icons accessible (192: $ICON192_STATUS, 512: $ICON512_STATUS)"
else
    print_error "Icons not accessible (192: $ICON192_STATUS, 512: $ICON512_STATUS)"
fi

# Test main page
PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/wordle/)
if [ "$PAGE_STATUS" = "200" ]; then
    print_success "Main page accessible (HTTP $PAGE_STATUS)"
else
    print_error "Main page not accessible (HTTP $PAGE_STATUS)"
fi

# Run Lighthouse manually if available
if command -v lighthouse &> /dev/null; then
    print_status "Running Lighthouse audit..."
    
    # Create a simple Lighthouse config
    cat > lighthouse-config.json << EOF
{
  "extends": "lighthouse:default",
  "settings": {
    "onlyCategories": ["pwa"],
    "skipAudits": [
      "uses-http2",
      "uses-passive-event-listeners",
      "meta-description",
      "http-status-code",
      "font-size",
      "link-text",
      "crawlable-anchors",
      "is-crawlable",
      "robots-txt",
      "tap-targets",
      "hreflang",
      "plugins",
      "canonical",
      "bf-cache"
    ]
  }
}
EOF
    
    if lighthouse http://localhost:3000/wordle/ --config-path=lighthouse-config.json --output=json --output-path=./lighthouse-report.json --chrome-flags="--no-sandbox --disable-dev-shm-usage --disable-gpu --headless"; then
        print_success "Lighthouse audit completed"
        
        # Extract PWA score
        PWA_SCORE=$(node -e "
            try {
                const report = JSON.parse(require('fs').readFileSync('./lighthouse-report.json', 'utf8'));
                const pwaScore = report.categories.pwa.score * 100;
                console.log('PWA Score:', Math.round(pwaScore));
                process.exit(pwaScore >= 60 ? 0 : 1);
            } catch (e) {
                console.log('Error parsing Lighthouse report:', e.message);
                process.exit(1);
            }
        ")
        
        if [ $? -eq 0 ]; then
            print_success "PWA score: $PWA_SCORE"
        else
            print_warning "PWA score below threshold"
        fi
    else
        print_warning "Lighthouse audit failed"
    fi
    
    # Cleanup
    rm -f lighthouse-config.json lighthouse-report.json
else
    print_warning "Lighthouse not installed, skipping audit"
fi

# Cleanup
print_status "Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
rm -f server.log

print_success "Simple PWA testing completed!" 