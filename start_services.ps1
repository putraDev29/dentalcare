# Script Peluncur Dental Care Clinic System
$Host.UI.RawUI.WindowTitle = "Dental Care System Launcher"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           DENTAL CARE CLINIC MANAGEMENT SYSTEM" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sedang memulai semua layanan..." -ForegroundColor Yellow

$baseDir = $PSScriptRoot
$beDir = Join-Path $baseDir "be_dentalcare"
$waDir = Join-Path $baseDir "wa_gateway"
$feDir = Join-Path $baseDir "fe_dentalcare"

# 1. Cek MySQL (Port 3306)
$mysqlPort = Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $mysqlPort) {
    $xamppBat = @("C:\xampp\mysql_start.bat", "D:\xampp\mysql_start.bat", "E:\xampp\mysql_start.bat") | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($xamppBat) {
        Start-Process $xamppBat -WindowStyle Minimized
        Start-Sleep -Seconds 3
    }
} else {
    Write-Host "[OK] Database MySQL aktif di port 3306." -ForegroundColor Green
}

# 2. Jalankan Backend Laravel (Port 8000)
$bePort = Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $bePort) {
    Write-Host "[1/3] Menjalankan Backend Laravel di port 8000..." -ForegroundColor White
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c php artisan serve --host=127.0.0.1 --port=8000" -WorkingDirectory $beDir -WindowStyle Minimized
} else {
    Write-Host "[1/3] Backend Laravel sudah berjalan di port 8000." -ForegroundColor Green
}

# 3. Jalankan WhatsApp Gateway (Port 21465)
$waPort = Get-NetTCPConnection -State Listen -LocalPort 21465 -ErrorAction SilentlyContinue
if (-not $waPort) {
    Write-Host "[2/3] Menjalankan WhatsApp Gateway di port 21465..." -ForegroundColor White
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c node server.js" -WorkingDirectory $waDir -WindowStyle Minimized
} else {
    Write-Host "[2/3] WhatsApp Gateway sudah berjalan di port 21465." -ForegroundColor Green
}

# 4. Jalankan Frontend Next.js
Write-Host "[3/3] Menjalankan Frontend Next.js..." -ForegroundColor White
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm run dev" -WorkingDirectory $feDir -WindowStyle Minimized

# 5. Tunggu sampai Frontend Next.js siap (maks 20 detik)
Write-Host ""
Write-Host "Menunggu aplikasi web siap..." -ForegroundColor Yellow
$fePortNumber = $null
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    # Periksa port 3001 dulu (jika 3000 dipakai aplikasi lain), lalu 3000
    if (Get-NetTCPConnection -State Listen -LocalPort 3001 -ErrorAction SilentlyContinue) {
        $fePortNumber = 3001
        break
    }
    if (Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue) {
        # Pastikan bukan process foreign 2460 jika memungkinkan
        $fePortNumber = 3000
    }
}

if (-not $fePortNumber) {
    $fePortNumber = 3001
}

$targetUrl = "http://localhost:$fePortNumber"
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  SEMUA LAYANAN BERHASIL AKTIF!" -ForegroundColor Green
Write-Host "  - Frontend Web : $targetUrl" -ForegroundColor Cyan
Write-Host "  - Backend API  : http://127.0.0.1:8000/api" -ForegroundColor Cyan
Write-Host "  - WA Gateway   : http://127.0.0.1:21465" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Membuka browser ke $targetUrl ..." -ForegroundColor Yellow
Start-Process $targetUrl

Start-Sleep -Seconds 3
