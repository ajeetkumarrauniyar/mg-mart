#!/bin/bash

# 🚀 MG Mart Deployment Checker
echo "🔍 Checking if your backend is ready for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from the apps/server directory"
    exit 1
fi

echo "✅ In correct directory"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo "✅ Dependencies installed"

# Check if build works
echo "🔨 Testing build..."
if pnpm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - fix errors before deploying"
    exit 1
fi

# Check if built files exist
if [ -f "dist/server.js" ] && [ -f "dist/app.js" ]; then
    echo "✅ Built files exist"
else
    echo "❌ Built files missing"
    exit 1
fi

# Check environment files
if [ -f ".env.production" ]; then
    echo "✅ Production environment file exists"
else
    echo "⚠️  .env.production file missing - you'll need to set environment variables in Render"
fi

# Check Firebase key
if [ -f "key.json" ]; then
    echo "✅ Firebase key file exists"
else
    echo "⚠️  key.json missing - make sure to set FIREBASE_SERVICE_ACCOUNT_KEY in Render"
fi

echo ""
echo "🎉 Deployment Readiness Check Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
echo "2. Go to https://render.com and create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Root Directory: apps/server"
echo "   - Build Command: pnpm install --frozen-lockfile && pnpm run build"
echo "   - Start Command: pnpm run start:prod"
echo "5. Add your environment variables (especially Firebase credentials)"
echo "6. Deploy and test!"
echo ""
echo "📚 For detailed instructions, see BEGINNER_DEPLOYMENT_TUTORIAL.md"