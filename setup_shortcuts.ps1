$wsh = New-Object -ComObject WScript.Shell
$workingDir = $PSScriptRoot
$iconPath = Join-Path $workingDir "START_DENTALCARE.ico"
$vbsPath = Join-Path $workingDir "START_DENTALCARE.vbs"

# 1. Project Directory Shortcut (START_DENTALCARE.lnk)
$projLnkPath = Join-Path $workingDir "START_DENTALCARE.lnk"
if (Test-Path $projLnkPath) {
    Remove-Item $projLnkPath -Force
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
    Remove-Item $deskLnkPath -Force
}
$deskLnk = $wsh.CreateShortcut($deskLnkPath)
$deskLnk.TargetPath = "wscript.exe"
$deskLnk.Arguments = "`"$vbsPath`""
$deskLnk.WorkingDirectory = $workingDir
$deskLnk.IconLocation = "$iconPath, 0"
$deskLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
$deskLnk.Save()
Write-Host "Created Desktop Shortcut: $deskLnkPath"

# 3. Notify Windows Shell to refresh icon cache immediately
try {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class ShellRefresh {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
'@
    [ShellRefresh]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
    Write-Host "Windows Shell notified of icon update"
} catch {
    Write-Host "SHChangeNotify skipped"
}

# Also call ie4uinit to force icon cache refresh
Start-Process -FilePath "ie4uinit.exe" -ArgumentList "-show" -NoNewWindow -Wait -ErrorAction SilentlyContinue

Write-Host "Shortcut and Icon refresh completed!"
