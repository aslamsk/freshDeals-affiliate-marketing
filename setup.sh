#!/bin/bash

# FreshDeals - Automated Setup Script
# Initializes both backend and frontend

set -e  # Exit on error

echo "🎉 FreshDeals - Automated Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm v7+"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your Firebase credentials${NC}"
    echo "   - FIREBASE_PROJECT_ID"
    echo "   - FIREBASE_PRIVATE_KEY"
    echo "   - FIREBASE_CLIENT_EMAIL"
    echo "   - FIREBASE_DATABASE_URL"
    echo ""
else
    echo ".env file already exists"
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    echo "VITE_API_URL=http://localhost:5000" > .env.local
    echo "VITE_ADMIN_SECRET=dev-secret-key" >> .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
else
    echo ".env.local file already exists"
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ FreshDeals Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Edit backend/.env with Firebase credentials:"
echo "   nano backend/.env"
echo ""
echo "2️⃣  Start Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "3️⃣  Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "4️⃣  Open browser:"
echo "   http://localhost:3000"
echo ""
echo -e "${BLUE}Need help?${NC}"
echo "   Read: docs/QUICK_START.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
