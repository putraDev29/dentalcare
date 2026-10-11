' ================================================================
'  DENTAL CARE CLINIC SYSTEM - SILENT LAUNCHER (100% TANPA JENDELA CMD)
' ================================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Jalankan MySQL XAMPP jika ada (Mode Senyap / Hidden)
If fso.FileExists("C:\xampp\mysql_start.bat") Then
    WshShell.Run """C:\xampp\mysql_start.bat""", 0, False
End If

' 2. Jalankan Apache XAMPP jika ada (Mode Senyap / Hidden)
If fso.FileExists("C:\xampp\apache_start.bat") Then
    WshShell.Run """C:\xampp\apache_start.bat""", 0, False
End If

' 3. Jalankan Backend Laravel di port 8000 (Mode Senyap / Hidden)
WshShell.Run """" & currentDir & "\be_dentalcare\run_backend.bat""", 0, False

' 4. Jalankan WhatsApp Gateway di port 21465 (Mode Senyap / Hidden)
WshShell.Run """" & currentDir & "\wa_gateway\run_wa_gateway.bat""", 0, False

' 5. Jalankan Frontend Next.js di port 3001 (Mode Senyap / Hidden)
WshShell.Run """" & currentDir & "\fe_dentalcare\run_frontend.bat""", 0, False

' 6. Tunggu inisialisasi server (6 detik) lalu buka browser
WScript.Sleep 6000
WshShell.Run "http://localhost:3001"

Set WshShell = Nothing
Set fso = Nothing
