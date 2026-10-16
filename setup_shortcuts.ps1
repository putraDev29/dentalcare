$wsh = New-Object -ComObject WScript.Shell
$iconPath = "C:\project\dental care\okay_dental.ico"
$vbsPath = "C:\project\dental care\START_DENTALCARE.vbs"
$workingDir = "C:\project\dental care"

# 1. Project Directory Shortcut
$projLnkPath = "C:\project\dental care\START_DENTALCARE.lnk"
$projLnk = $wsh.CreateShortcut($projLnkPath)
$projLnk.TargetPath = "wscript.exe"
$projLnk.Arguments = "`"$vbsPath`""
$projLnk.WorkingDirectory = $workingDir
$projLnk.IconLocation = "$iconPath, 0"
$projLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
$projLnk.Save()
Write-Host "Created Project Shortcut: $projLnkPath"

# 2. Desktop Shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$deskLnkPath = Join-Path $desktopPath "OKAY Dental Clinic.lnk"
$deskLnk = $wsh.CreateShortcut($deskLnkPath)
$deskLnk.TargetPath = "wscript.exe"
$deskLnk.Arguments = "`"$vbsPath`""
$deskLnk.WorkingDirectory = $workingDir
$deskLnk.IconLocation = "$iconPath, 0"
$deskLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
$deskLnk.Save()
Write-Host "Created Desktop Shortcut: $deskLnkPath"

# Verify Icon
if (Test-Path $iconPath) {
    $size = (Get-Item $iconPath).Length
    Write-Host "Icon file exists ($size bytes)"
} else {
    Write-Host "WARNING: Icon file not found at $iconPath"
}
