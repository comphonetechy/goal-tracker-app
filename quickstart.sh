#!/bin/bash

echo "🚀 QuestFlow - Quick Start Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi
echo "✅ Server dependencies installed"
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi
echo "✅ Client dependencies installed"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the app:"
echo "1. Open a terminal and run: cd server && npm start"
echo "2. Open another terminal and run: cd client && npm run dev"
echo "3. Visit http://localhost:3000 in your browser"
echo ""
echo "Happy questing! ⚡"
