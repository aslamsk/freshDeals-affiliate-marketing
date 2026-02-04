@echo off
REM FreshDeals - Automated Setup Script (Windows)
REM Initializes both backend and frontend

echo.
echo ========================================
echo FreshDeals - Automated Setup
echo ========================================
echo.

REM Check Node.js
echo Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js v16+
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm v7+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo [OK] Node.js %NODE_VERSION%
echo [OK] npm %NPM_VERSION%
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed
)

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env with your Firebase credentials
    echo.
    echo Required fields:
    echo   - FIREBASE_PROJECT_ID
    echo   - FIREBASE_PRIVATE_KEY
    echo   - FIREBASE_CLIENT_EMAIL
    echo   - FIREBASE_DATABASE_URL
    echo.
) else (
    echo .env file already exists
)

echo [OK] Backend setup complete
echo.

REM Frontend Setup
echo Setting up Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed
)

if not exist ".env.local" (
    echo Creating .env.local file...
    (
        echo VITE_API_URL=http://localhost:5000
        echo VITE_ADMIN_SECRET=dev-secret-key
    ) > .env.local
    echo [OK] Created .env.local
) else (
    echo .env.local file already exists
)

echo [OK] Frontend setup complete
echo.

REM Summary
echo ========================================
echo   FreshDeals Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Edit backend\.env with Firebase credentials
echo.
echo 2. Start Backend (Command Prompt 1):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start Frontend (Command Prompt 2):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open browser:
echo    http://localhost:3000
echo.
echo Need help?
echo   Read: docs\QUICK_START.md
echo.
echo Happy coding!
echo.
pause
