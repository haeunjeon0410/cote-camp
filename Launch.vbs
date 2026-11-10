' 더블클릭하면 오박사의 코테 캠프가 실행돼요 (콘솔 창 없이)
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run """node_modules\electron\dist\electron.exe"" .", 0, False
