@echo off
title Pasang Shortcut Desktop - OKAY Dental Care
color 0b

echo ================================================================
echo       MEMASANG SHORTCUT DESKTOP - OKAY DENTAL CARE
echo ================================================================
echo.
echo Sedang membuat shortcut di Desktop dan Folder Project...

:: Coba via PowerShell dengan ExecutionPolicy Bypass
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_shortcuts.ps1" >nul 2>&1

:: Jika PowerShell gagal atau dibatasi, gunakan native VBScript
if errorlevel 1 (
    echo Menggunakan metode VBScript Native...
    cscript //nologo "%~dp0setup_shortcuts.vbs"
) else (
    echo Berhasil membuat shortcut Desktop!
)

echo.
echo ================================================================
echo  Selesai! Icon "OKAY Dental Clinic" sudah siap di Desktop Anda.
echo ================================================================
echo.
if not "%~1"=="auto" pause
