' ================================================================
'  OKAY DENTAL CLINIC - SILENT LAUNCHER
'  Icon: OKAY Dental (okay_dental.ico - dari Tab & Header Icon)
'  Browser Default: Google Chrome
'  Safe Startup: Menunggu MySQL & Server siap sebelum membuka browser
'  Zero Permission Denied: Menggunakan WMI & WinHttp native Windows
' ================================================================

Option Explicit
On Error Resume Next

Dim WshShell, fso, currentDir, chromeExe

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Fungsi memeriksa apakah proses Windows sedang berjalan (Native WMI)
Function IsProcessRunning(procName)
    On Error Resume Next
    Dim wmiObj, colProcs
    IsProcessRunning = False
    Set wmiObj = GetObject("winmgmts:\\.\root\cimv2")
    If Not wmiObj Is Nothing Then
        Set colProcs = wmiObj.ExecQuery("Select * from Win32_Process Where Name = '" & procName & "'")
        If Not colProcs Is Nothing Then
            If colProcs.Count > 0 Then
                IsProcessRunning = True
            End If
        End If
    End If
    Set colProcs = Nothing
    Set wmiObj = Nothing
End Function

' Fungsi memeriksa apakah URL HTTP melayani respon (Native WinHttp)
Function CheckHttp(url)
    On Error Resume Next
    Dim http
    CheckHttp = False
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    If Not http Is Nothing Then
        http.SetTimeouts 800, 800, 800, 800
        http.Open "GET", url, False
        http.Send
        If Err.Number = 0 Then
            CheckHttp = True
        End If
    End If
    Set http = Nothing
    Err.Clear
End Function

' Menunggu MySQL aktif
Function WaitForMySql(maxSeconds)
    Dim i
    WaitForMySql = False
    For i = 1 To maxSeconds
        If IsProcessRunning("mysqld.exe") Then
            WaitForMySql = True
            Exit Function
        End If
        WScript.Sleep 1000
    Next
End Function

' Menunggu HTTP URL aktif
Function WaitForHttpUrl(url, maxSeconds)
    Dim i
    WaitForHttpUrl = False
    For i = 1 To maxSeconds
        If CheckHttp(url) Then
            WaitForHttpUrl = True
            Exit Function
        End If
        WScript.Sleep 1000
    Next
End Function

' Fungsi mencari Google Chrome
Function GetChromePath()
    Dim paths, p, appData
    appData = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%")
    paths = Array( _
        "C:\Program Files\Google\Chrome\Application\chrome.exe", _
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", _
        appData & "\Google\Chrome\Application\chrome.exe" _
    )
    GetChromePath = ""
    For Each p In paths
        If fso.FileExists(p) Then
            GetChromePath = p
            Exit Function
        End If
    Next
End Function

' 0. Pastikan shortcut di Desktop dan Folder Project selalu sinkron dengan folder saat ini
Dim desktopLnkPath, autoDeskLnk, projLnkPath, autoProjLnk
desktopLnkPath = WshShell.SpecialFolders("Desktop") & "\OKAY Dental Clinic.lnk"
Set autoDeskLnk = WshShell.CreateShortcut(desktopLnkPath)
autoDeskLnk.TargetPath = "wscript.exe"
autoDeskLnk.Arguments = """" & currentDir & "\START_DENTALCARE.vbs"""
autoDeskLnk.WorkingDirectory = currentDir
autoDeskLnk.IconLocation = currentDir & "\START_DENTALCARE.ico, 0"
autoDeskLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
autoDeskLnk.Save
Set autoDeskLnk = Nothing

projLnkPath = currentDir & "\START_DENTALCARE.lnk"
Set autoProjLnk = WshShell.CreateShortcut(projLnkPath)
autoProjLnk.TargetPath = "wscript.exe"
autoProjLnk.Arguments = """" & currentDir & "\START_DENTALCARE.vbs"""
autoProjLnk.WorkingDirectory = currentDir
autoProjLnk.IconLocation = currentDir & "\START_DENTALCARE.ico, 0"
autoProjLnk.Description = "Mulai Aplikasi OKAY Dental Clinic"
autoProjLnk.Save
Set autoProjLnk = Nothing

' 1. Pastikan MySQL XAMPP berjalan sebelum membuka aplikasi
If Not IsProcessRunning("mysqld.exe") Then
    If fso.FileExists("C:\xampp\mysql_start.bat") Then
        WshShell.Run """C:\xampp\mysql_start.bat""", 0, False
    ElseIf fso.FileExists("D:\xampp\mysql_start.bat") Then
        WshShell.Run """D:\xampp\mysql_start.bat""", 0, False
    ElseIf fso.FileExists("E:\xampp\mysql_start.bat") Then
        WshShell.Run """E:\xampp\mysql_start.bat""", 0, False
    End If
    ' Tunggu sampai MySQL siap menerima koneksi (Max 30 detik)
    Call WaitForMySql(30)
    WScript.Sleep 2000
End If

' 2. Jalankan Backend Laravel (Port 8000 - Mode Senyap) jika belum aktif
If Not CheckHttp("http://127.0.0.1:8000/api/whatsapp/status") Then
    WshShell.Run """" & currentDir & "\be_dentalcare\run_backend.bat""", 0, False
End If

' 3. Jalankan WhatsApp Gateway (Port 21465 - Mode Minimized) jika belum aktif
If Not CheckHttp("http://127.0.0.1:21465/api/status") Then
    WshShell.Run """" & currentDir & "\wa_gateway\run_wa_gateway.bat""", 7, False
End If

' 4. Periksa apakah Frontend sudah aktif di port 3001 atau 3000
Dim fePort, isFeRunning
fePort = 3001
isFeRunning = False

If CheckHttp("http://127.0.0.1:3001") Then
    fePort = 3001
    isFeRunning = True
ElseIf CheckHttp("http://127.0.0.1:3000") Then
    fePort = 3000
    isFeRunning = True
Else
    ' Jalankan Frontend Next.js (Port 3001 - Mode Senyap) jika belum aktif
    WshShell.Run """" & currentDir & "\fe_dentalcare\run_frontend.bat""", 0, False
End If

' 5. Tunggu Backend dan Frontend benar-benar siap sebelum membuka browser
Call WaitForHttpUrl("http://127.0.0.1:8000/api/whatsapp/status", 20)

If Not isFeRunning Then
    Dim waitCount
    For waitCount = 1 To 25
        If CheckHttp("http://127.0.0.1:3001") Then
            fePort = 3001
            Exit For
        ElseIf CheckHttp("http://127.0.0.1:3000") Then
            fePort = 3000
            Exit For
        End If
        WScript.Sleep 1000
    Next
End If
WScript.Sleep 1000

' 6. Buka Google Chrome ke port Frontend yang aktif (3001 atau 3000)
chromeExe = GetChromePath()
If chromeExe <> "" Then
    WshShell.Run """" & chromeExe & """ http://localhost:" & fePort, 1, False
Else
    WshShell.Run "http://localhost:" & fePort, 1, False
End If

Set WshShell = Nothing
Set fso = Nothing
