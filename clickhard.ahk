Loop
{
    WinGetPos, X, Y, Width, Height, Bike App
    Random, ClickX, X, X+Width
    Random, ClickY, Y+150, Y+Height-150
    ControlClick, x%ClickX% y%ClickY%, Bike App
    Sleep 2
   
    
    ; Check if the "Q" key is pressed
    if GetKeyState("Q", "P")
    {
        MsgBox Exiting the script.
        ExitApp ; Exit the script
    }
}
 





