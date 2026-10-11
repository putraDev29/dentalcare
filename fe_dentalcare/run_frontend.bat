@echo off
title Dental Care Frontend (Next.js)
cd /d "%~dp0"

if not exist "node_modules" (
    echo Menginstal dependensi Frontend pertama kali...
    call npm install
)

echo Menjalankan Frontend Next.js di port 3001...
npx next dev -p 3001
pause
