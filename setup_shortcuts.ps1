# ================================================================
#  OKAY DENTAL CLINIC - SETUP DESKTOP & PROJECT SHORTCUTS
#  Creates shortcuts with the official OKAY Dental Clinic icon
# ================================================================
$workingDir = $PSScriptRoot
if (-not $workingDir) {
    $workingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $workingDir) {
    $workingDir = (Get-Location).Path
}

# Ensure icons are up to date
$iconPath = Join-Path $workingDir "START_DENTALCARE.ico"
$genScript = Join-Path $workingDir "generate_icon.ps1"
if ((-not (Test-Path $iconPath)) -and (Test-Path $genScript)) {
    Write-Host "Generating latest icons first..."
    & powershell.exe -ExecutionPolicy Bypass -File $genScript
}

$wsh = New-Object -ComObject WScript.Shell
$vbsPath = Join-Path $workingDir "START_DENTALCARE.vbs"

# 1. Project Directory Shortcut (START_DENTALCARE.lnk)
$projLnkPath = Join-Path $workingDir "START_DENTALCARE.lnk"
if (Test-Path $projLnkPath) {
    Remove-Item $projLnkPath -Force -ErrorAction SilentlyContinue
}
$projLnk = $wsh.CreateShortcut($projLnkPath)
$projLnk.TargetPath = "wscript.exe"
$projLnk.Arguments = "`"$vbsPath`""
$projLnk.WorkingDirectory = $workingDir
$projLnk.IconLocation = "$iconPath, 0"
$projLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
$projLnk.Save()
Write-Host "Created Project Shortcut: $projLnkPath"

# 2. Desktop Shortcut (OKAY Dental Clinic.lnk)
$desktopPath = [Environment]::GetFolderPath("Desktop")
$deskLnkPath = Join-Path $desktopPath "OKAY Dental Clinic.lnk"
if (Test-Path $deskLnkPath) {
    Remove-Item $deskLnkPath -Force -ErrorAction SilentlyContinue
}
$deskLnk = $wsh.CreateShortcut($deskLnkPath)
$deskLnk.TargetPath = "wscript.exe"
$deskLnk.Arguments = "`"$vbsPath`""
$deskLnk.WorkingDirectory = $workingDir
$deskLnk.IconLocation = "$iconPath, 0"
$deskLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
$deskLnk.Save()
Write-Host "Created Desktop Shortcut: $deskLnkPath"

# 3. Notify Windows Shell & refresh icon cache immediately
try {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class ShellRefresh {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
'@ -ErrorAction SilentlyContinue
    [ShellRefresh]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
    Write-Host "Windows Shell notified of icon update (SHCNE_ASSOCCHANGED)"
} catch {
    Write-Host "SHChangeNotify skipped"
}

# Also call ie4uinit to force icon cache refresh
Start-Process -FilePath "ie4uinit.exe" -ArgumentList "-show" -NoNewWindow -Wait -ErrorAction SilentlyContinue

Write-Host "SUCCESS: Shortcut and latest OKAY Dental icon refresh completed!"
