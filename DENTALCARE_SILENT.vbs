' Script untuk menjalankan Dental Care System secara senyap (tanpa jendela hitam CMD)
Set WshShell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
batPath = Chr(34) & scriptDir & "\START_DENTALCARE.bat" & Chr(34)
WshShell.Run batPath, 0, False
Set WshShell = Nothing
