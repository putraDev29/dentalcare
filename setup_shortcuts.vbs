' ================================================================
'  SETUP SHORTCUT OKAY DENTAL CLINIC (NATIVE VBSCRIPT - ZERO PERMISSION ISSUES)
' ================================================================
Option Explicit

Dim WshShell, fso, currentDir, desktopPath, projLnk, deskLnk, iconPath, vbsPath

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
desktopPath = WshShell.SpecialFolders("Desktop")

vbsPath = currentDir & "\START_DENTALCARE.vbs"
iconPath = currentDir & "\START_DENTALCARE.ico"

' 1. Buat Shortcut di Folder Project (START_DENTALCARE.lnk)
Set projLnk = WshShell.CreateShortcut(currentDir & "\START_DENTALCARE.lnk")
projLnk.TargetPath = "wscript.exe"
projLnk.Arguments = """" & vbsPath & """"
projLnk.WorkingDirectory = currentDir
projLnk.IconLocation = iconPath & ", 0"
projLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
projLnk.Save

' 2. Buat Shortcut di Desktop (OKAY Dental Clinic.lnk)
Set deskLnk = WshShell.CreateShortcut(desktopPath & "\OKAY Dental Clinic.lnk")
deskLnk.TargetPath = "wscript.exe"
deskLnk.Arguments = """" & vbsPath & """"
deskLnk.WorkingDirectory = currentDir
deskLnk.IconLocation = iconPath & ", 0"
deskLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
deskLnk.Save

' 3. Refresh icon cache
On Error Resume Next
WshShell.Run "ie4uinit.exe -show", 0, True
Err.Clear

WScript.Echo "Shortcut OKAY Dental Clinic berhasil dipasang di Desktop dan Folder Project!"
