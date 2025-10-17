#!/bin/bash

# ========================================
# 🔧 SYSTEM CONFIGURATION SWITCHER
# ========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to enable development mode
enable_development() {
    print_info "Setting up Development Mode..."
    
    # Update rate limiting middleware
    sed -i 's/skip: (req) => appConfig.NODE_ENV === "development"/skip: (req) => true/g' src/middlewares/rate-limit.middleware.ts
    
    # Update Redis service
    sed -i 's/private isConnected: boolean = false/private isConnected: boolean = false/g' src/services/cache/redis.service.ts
    
    # Update product router (ensure cache is disabled)
    sed -i 's/cacheProducts, \/\/ DISABLED/cacheProducts, \/\/ DISABLED/g' src/routers/product.router.ts
    
    print_status "Development mode enabled!"
    print_info "Features disabled:"
    echo "  - Redis caching"
    echo "  - Rate limiting"
    echo "  - Cache middleware"
    echo "  - All advanced features"
}

# Function to enable production mode
enable_production() {
    print_info "Setting up Production Mode..."
    
    # Update rate limiting middleware
    sed -i 's/skip: (req) => true/skip: (req) => appConfig.NODE_ENV === "development"/g' src/middlewares/rate-limit.middleware.ts
    
    # Update Redis service
    sed -i 's/private isConnected: boolean = false/private isConnected: boolean = true/g' src/services/cache/redis.service.ts
    
    # Update product router (enable cache)
    sed -i 's/\/\/ cacheProducts, \/\/ DISABLED/cacheProducts, \/\/ ENABLED/g' src/routers/product.router.ts
    
    print_status "Production mode enabled!"
    print_warning "Make sure Redis is running!"
    print_info "Features enabled:"
    echo "  - Redis caching"
    echo "  - Rate limiting"
    echo "  - Cache middleware"
    echo "  - All advanced features"
}

# Function to show current status
show_status() {
    print_info "Current System Status:"
    
    # Check rate limiting
    if grep -q "skip: (req) => true" src/middlewares/rate-limit.middleware.ts; then
        print_status "Rate Limiting: DISABLED (Development)"
    else
        print_warning "Rate Limiting: ENABLED (Production)"
    fi
    
    # Check Redis
    if grep -q "private isConnected: boolean = false" src/services/cache/redis.service.ts; then
        print_status "Redis: DISABLED (Development)"
    else
        print_warning "Redis: ENABLED (Production)"
    fi
    
    # Check cache
    if grep -q "cacheProducts, \/\/ DISABLED" src/routers/product.router.ts; then
        print_status "Cache: DISABLED (Development)"
    else
        print_warning "Cache: ENABLED (Production)"
    fi
}

# Function to test Redis connection
test_redis() {
    print_info "Testing Redis connection..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_status "Redis is running and accessible!"
        else
            print_error "Redis is not running or not accessible!"
            print_info "Start Redis with: redis-server"
        fi
    else
        print_error "Redis CLI not found!"
        print_info "Install Redis: https://redis.io/download"
    fi
}

# Function to show help
show_help() {
    echo "🔧 System Configuration Switcher"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev, development    Enable development mode (disable Redis, cache, rate limiting)"
    echo "  prod, production     Enable production mode (enable Redis, cache, rate limiting)"
    echo "  status              Show current system status"
    echo "  test-redis          Test Redis connection"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Switch to development mode"
    echo "  $0 prod             # Switch to production mode"
    echo "  $0 status           # Check current status"
    echo "  $0 test-redis       # Test Redis connection"
}

# Main script logic
case "$1" in
    "dev"|"development")
        enable_development
        ;;
    "prod"|"production")
        enable_production
        ;;
    "status")
        show_status
        ;;
    "test-redis")
        test_redis
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        print_info "System Configuration Switcher"
        echo ""
        show_status
        echo ""
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac



