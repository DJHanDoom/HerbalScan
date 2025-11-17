@echo off
REM ========================================
REM   Rebuild HerbalScan - Completo
REM   Executavel + Instalador
REM ========================================
echo.
echo ========================================
echo   Rebuild HerbalScan - Completo
echo ========================================
echo.

REM Fechar processos em execucao
echo [1/4] Fechando processos HerbalScan em execucao...
taskkill /F /IM HerbalScan.exe 2>nul
if errorlevel 1 (
    echo   Nenhum processo HerbalScan em execucao
) else (
    echo   Processos fechados com sucesso
)

REM Limpar logs antigos
echo.
echo [2/4] Limpando logs antigos...
del /Q dist\HerbalScan\*.log 2>nul

REM Recompilar executavel
echo.
echo [3/4] Recompilando executavel com PyInstaller...
pyinstaller HerbalScan.spec --clean -y
if errorlevel 1 (
    echo.
    echo ERRO: Falha ao recompilar o executavel!
    pause
    exit /b 1
)

REM Compilar instalador
echo.
echo [4/4] Compilando instalador com Inno Setup...
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
if errorlevel 1 (
    echo.
    echo ERRO: Falha ao compilar o instalador!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Rebuild concluido com sucesso!
echo ========================================
echo.
echo Arquivos gerados:
echo   Executavel: dist\HerbalScan\HerbalScan.exe
echo   Instalador: installer_output\HerbalScan_Setup_v2.0.0.exe
echo.
pause
