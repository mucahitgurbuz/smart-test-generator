#!/bin/bash

# Smart Test Generator - Quick Setup Script
# This script helps you get started with Smart Test Generator quickly

set -e

echo "🧠 Smart Test Generator - Quick Setup"
echo "======================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. You have version $NODE_VERSION."
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🔨 Building packages..."
npm run build

echo "🎉 Setup complete!"
echo
echo "Quick Start:"
echo "  cd your-project"
echo "  test-gen init"
echo "  test-gen analyze src/"
echo "  test-gen generate"
echo
echo "For more information:"
echo "  npm run demo     # Run example projects"
echo "  test-gen --help  # Show all commands"
echo
echo "Happy testing! 🚀"
