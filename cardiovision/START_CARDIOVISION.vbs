Option Explicit
Dim fso, shell, projectDir, cmd, i, ready, req, pythonExe, targetUrl

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
pythonExe = projectDir & "\.venv\Scripts\python.exe"

If Not fso.FileExists(pythonExe) Then
    If fso.FileExists(projectDir & "\..\.venv\Scripts\python.exe") Then
        projectDir = fso.GetParentFolderName(projectDir)
        pythonExe = projectDir & "\.venv\Scripts\python.exe"
    End If
End If

targetUrl = "http://127.0.0.1:8000/"

' 1. Check if Python virtual environment exists
If Not fso.FileExists(pythonExe) Then
    MsgBox "Python virtual environment not found in .venv\Scripts\python.exe." & vbCrLf & _
           "Please ensure the project is fully extracted.", vbExclamation, "CardioVision AI"
    WScript.Quit 1
End If

' 2. Check if server is already running on port 8000
ready = False
On Error Resume Next
Set req = CreateObject("MSXML2.ServerXMLHTTP.6.0")
req.setTimeouts 500, 500, 500, 500
req.open "GET", "http://127.0.0.1:8000/health", False
req.send
If Err.Number = 0 Then
    If req.status = 200 Then ready = True
End If
Err.Clear
On Error GoTo 0

' 3. If not already running, launch the backend server silently in the background
If Not ready Then
    cmd = "cmd.exe /c cd /d """ & projectDir & """ && """ & pythonExe & """ -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
    ' Run completely hidden (0 = hide window, False = don't wait)
    shell.Run cmd, 0, False

    ' 4. Wait for server to become healthy
    For i = 1 To 25
        WScript.Sleep 600
        On Error Resume Next
        Set req = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        req.setTimeouts 500, 500, 500, 500
        req.open "GET", "http://127.0.0.1:8000/health", False
        req.send
        If Err.Number = 0 Then
            If req.status = 200 Then
                ready = True
                Exit For
            End If
        End If
        Err.Clear
        On Error GoTo 0
    Next
End If

' 5. Open CardioVision AI in the default web browser
If ready Then
    shell.Run targetUrl, 1, False
Else
    ' Fallback to opening browser even if check timed out
    shell.Run targetUrl, 1, False
End If
