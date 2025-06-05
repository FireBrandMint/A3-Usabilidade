

call w_int_build
rmdir /S /Q bin\export-win32-x64
Xcopy .\export-win32-x64 .\bin\export-win32-x64 /E /H /C /I
rmdir /S /Q export-win32-x64

PAUSE