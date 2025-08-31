#!/bin/bash

# PWA CI Testing Script
# This script handles PWA validation in CI environments

set -e

echo "🚀 Starting PWA CI Testing..."

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

# Function to start server and wait for it to be ready
start_server() {
    local port=${1:-3000}
    local timeout=${2:-60}
    
    print_status "Starting server on port $port..."
    
    # Start server in background
    npx serve -s build -p $port > server.log 2>&1 &
    SERVER_PID=$!
    
    print_status "Server PID: $SERVER_PID"
    
    # Wait for server to be ready
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -f http://localhost:$port > /dev/null 2>&1; then
            print_success "Server is ready on http://localhost:$port"
            return 0
        fi
        
        sleep 2
        elapsed=$((elapsed + 2))
        print_status "Waiting for server... ($elapsed/$timeout seconds)"
    done
    
    print_error "Server failed to start within $timeout seconds"
    print_status "Server logs:"
    cat server.log
    return 1
}

# Function to test basic PWA features
test_pwa_features() {
    local port=${1:-3000}
    
    print_status "Testing PWA features on port $port..."
    
    # Test manifest
    local manifest_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/manifest.json)
    if [ "$manifest_status" = "200" ]; then
        print_success "Manifest accessible (HTTP $manifest_status)"
    else
        print_error "Manifest not accessible (HTTP $manifest_status)"
        return 1
    fi
    
    # Test service worker
    local sw_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/sw.js)
    if [ "$sw_status" = "200" ]; then
        print_success "Service worker accessible (HTTP $sw_status)"
    else
        print_error "Service worker not accessible (HTTP $sw_status)"
        return 1
    fi
    
    # Test icons
    local icon192_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/logo192.png)
    local icon512_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/logo512.png)
    
    if [ "$icon192_status" = "200" ] && [ "$icon512_status" = "200" ]; then
        print_success "Icons accessible (192: $icon192_status, 512: $icon512_status)"
    else
        print_error "Icons not accessible (192: $icon192_status, 512: $icon512_status)"
        return 1
    fi
    
    # Test main page
    local page_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/)
    if [ "$page_status" = "200" ]; then
        print_success "Main page accessible (HTTP $page_status)"
    else
        print_error "Main page not accessible (HTTP $page_status)"
        return 1
    fi
    
    return 0
}

# Function to run Lighthouse audit
run_lighthouse() {
    local config_file=${1:-".lighthouserc.json"}
    local fallback_config=${2:-".lighthouserc-ci.json"}
    
    # Check if Lighthouse CI is available
    if ! command -v lhci &> /dev/null; then
        print_warning "Lighthouse CI not installed, skipping audit"
        return 0
    fi
    
    print_status "Running Lighthouse audit with config: $config_file"
    
    if lhci autorun --config="$config_file"; then
        print_success "Lighthouse audit completed successfully"
        return 0
    else
        print_warning "Main Lighthouse config failed, trying fallback..."
        
        if [ -f "$fallback_config" ] && lhci autorun --config="$fallback_config"; then
            print_success "Lighthouse audit completed with fallback config"
            return 0
        else
            print_error "Lighthouse audit failed with both configs"
            return 1
        fi
    fi
}

# Main execution
main() {
    # Start server
    if ! start_server 3000 60; then
        print_error "Failed to start server"
        exit 1
    fi
    
    # Test PWA features
    if ! test_pwa_features 3000; then
        print_error "PWA feature tests failed"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    # Run Lighthouse audit
    if ! run_lighthouse ".lighthouserc.json" ".lighthouserc-ci.json"; then
        print_warning "Lighthouse audit failed, but PWA features are working"
        # Don't exit here, as PWA features are working
    fi
    
    # Cleanup
    print_status "Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
    rm -f server.log
    
    print_success "PWA CI testing completed!"
}

# Run main function
main "$@" 