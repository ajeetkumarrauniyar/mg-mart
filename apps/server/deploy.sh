#!/bin/bash

# MG Mart Server Deployment Script
set -e

echo "🚀 Starting MG Mart Server Deployment..."

# Check if environment is provided
if [ -z "$1" ]; then
    echo "❌ Please specify environment: ./deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

echo "📦 Building application..."
pnpm run build

echo "🔧 Setting up environment for $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
    elif [ -f ".env.prod" ]; then
        cp .env.prod .env
    else
        echo "⚠️  No production environment file found, using existing .env"
    fi
elif [ "$ENVIRONMENT" = "staging" ]; then
    if [ -f ".env.staging" ]; then
        cp .env.staging .env
    else
        echo "⚠️  No staging environment file found, using existing .env"
    fi
else
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo "🧪 Running health check..."
if [ "$ENVIRONMENT" = "production" ]; then
    START_COMMAND="start:prod"
else
    START_COMMAND="start:staging"
fi

if pnpm run $START_COMMAND &
then
    SERVER_PID=$!
    sleep 5
    
    if curl -f http://localhost:9000/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        kill $SERVER_PID
    else
        echo "❌ Health check failed!"
        kill $SERVER_PID
        exit 1
    fi
else
    echo "❌ Failed to start server"
    exit 1
fi

echo "🎉 Deployment preparation complete for $ENVIRONMENT!"
echo "📋 Next steps:"
echo "   - Update your Firebase credentials in .env.$ENVIRONMENT"
echo "   - Deploy using your chosen platform (Docker, Railway, Render, etc.)"