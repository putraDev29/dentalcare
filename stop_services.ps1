# Script Penghenti Layanan Dental Care System
$Host.UI.RawUI.WindowTitle = "Hentikan Dental Care System"
Write-Host "================================================================" -ForegroundColor Red
Write-Host "           MENGHENTIKAN DENTAL CARE SYSTEM" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host ""

function Kill-PortProcess($port, $name) {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            $pId = $c.OwningProcess
            if ($pId -gt 0) {
                Write-Host "Menghentikan $name (Port $port, PID $pId)..." -ForegroundColor Yellow
                Stop-Process -Id $pId -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "$name (Port $port) sudah tidak aktif." -ForegroundColor Gray
    }
}

Kill-PortProcess 8000 "Backend Laravel"
Kill-PortProcess 21465 "WhatsApp Gateway"
Kill-PortProcess 3001 "Frontend Next.js"

# Tutup window cmd Next.js jika ada
Get-Process cmd -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*npm run dev*" -or $_.MainWindowTitle -like "*DentalCare*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Semua layanan Dental Care telah dihentikan!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Start-Sleep -Seconds 3
