!macro customInit
  ; Kill any running instance of the app
  nsExec::Exec 'taskkill /F /IM "QBMS Suite.exe"'
  Pop $0
  ${If} $0 != 0
    ; Process wasn't running or couldn't be killed, but continue anyway
    DetailPrint "Note: QBMS Suite was not running or could not be terminated."
  ${EndIf}
  ; Wait a moment to ensure process is fully terminated
  Sleep 1000
!macroend

!macro customUnInit
  ; Kill any running instance of the app before uninstall
  nsExec::Exec 'taskkill /F /IM "QBMS Suite.exe"'
  Pop $0
  ${If} $0 != 0
    DetailPrint "Note: QBMS Suite was not running or could not be terminated."
  ${EndIf}
  Sleep 1000
!macroend

!macro preInit
  ExecWait 'taskkill /F /IM "QBMS Suite.exe" /T'
!macroend
