#!/bin/bash

# Project Memory - Quick Deployment Script
# This script helps you deploy to Vercel and set up your custom domain

echo "🚀 Project Memory Deployment Helper"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project-memory-app directory"
    exit 1
fi

echo "📦 Step 1: Committing your code to Git..."
git add .
git status

echo ""
read -p "Ready to commit? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Project Memory MVP - Production ready"
    echo "✅ Code committed!"
else
    echo "⚠️  Skipping commit. Make sure to commit before deploying!"
fi

echo ""
echo "📤 Step 2: Push to GitHub"
echo ""
echo "If you haven't created a GitHub repo yet:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository (e.g., 'project-memory')"
echo "3. Copy the repository URL"
echo ""

read -p "Have you created a GitHub repo? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub repository URL: " repo_url

    # Check if remote already exists
    if git remote | grep -q origin; then
        echo "Remote 'origin' already exists. Updating..."
        git remote set-url origin "$repo_url"
    else
        git remote add origin "$repo_url"
    fi

    echo "Pushing to GitHub..."
    git push -u origin main

    if [ $? -eq 0 ]; then
        echo "✅ Code pushed to GitHub!"
    else
        echo "⚠️  Push failed. You might need to authenticate or check the URL."
    fi
else
    echo "⚠️  Skipping GitHub push. You'll need to do this manually before deploying to Vercel."
fi

echo ""
echo "🌐 Step 3: Deploy to Vercel"
echo ""
echo "Two options:"
echo ""
echo "Option A: Deploy via Vercel Dashboard (Recommended for first time)"
echo "  1. Go to https://vercel.com"
echo "  2. Sign in with GitHub"
echo "  3. Click 'Add New' → 'Project'"
echo "  4. Import your GitHub repository"
echo "  5. Add environment variables (from .env.local)"
echo "  6. Click Deploy!"
echo ""
echo "Option B: Deploy via CLI"
echo "  Run: npm i -g vercel && vercel"
echo ""

read -p "Do you want to install Vercel CLI and deploy now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing Vercel CLI..."
    npm i -g vercel

    echo ""
    echo "Starting Vercel deployment..."
    vercel

    echo ""
    echo "✅ Deployment initiated!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Add environment variables in Vercel Dashboard"
    echo "2. Go to Settings → Domains to add your custom domain"
    echo "3. Update DNS records at your domain registrar"
    echo "4. Add domain to Firebase authorized domains"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo ""
    echo "📋 Manual Deployment Steps:"
    echo "1. Go to https://vercel.com and sign in"
    echo "2. Import your GitHub repository"
    echo "3. Follow the detailed steps in DEPLOYMENT.md"
fi

echo ""
echo "✨ Your shareable link will be:"
echo "   https://your-domain.com/r/amaresh-test-1"
echo ""
echo "💡 Tip: Test with /test-firebase first to verify everything works!"
echo ""
echo "Need help? Check DEPLOYMENT.md for troubleshooting."
