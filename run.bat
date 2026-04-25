@echo off
echo.
echo ========================================
echo   🍎 Apple Ripeness Detection System
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python tidak terinstall!
    echo Silakan install Python 3.8+ dari https://www.python.org
    pause
    exit /b 1
)

echo ✅ Python terdeteksi

REM Check if requirements are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo.
    echo 📦 Menginstall dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Gagal menginstall dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies terinstall
)

echo.
echo 🚀 Memulai server...
echo.
python server.py

if errorlevel 1 (
    echo.
    echo ❌ Server error!
    pause
    exit /b 1
)
