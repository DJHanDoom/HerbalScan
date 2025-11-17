@echo off
REM Launcher para HerbalScan.exe
REM Este arquivo garante que o console permaneça aberto para debug

title HerbalScan - Sistema de Analise de Cobertura

echo ====================================
echo HerbalScan - Sistema de Analise
echo ====================================
echo.

REM Obter o diretorio onde o script esta localizado
set SCRIPT_DIR=%~dp0
set EXE_PATH=%SCRIPT_DIR%HerbalScan.exe

REM Verificar se o executavel existe
if not exist "%EXE_PATH%" (
    echo ERRO: HerbalScan.exe nao encontrado em:
    echo %EXE_PATH%
    echo.
    echo Verifique se o arquivo foi instalado corretamente.
    echo.
    pause
    exit /b 1
)

echo Iniciando HerbalScan...
echo Diretorio: %SCRIPT_DIR%
echo Executavel: %EXE_PATH%
echo.
echo ====================================
echo.

REM Executar o aplicativo
"%EXE_PATH%"

REM Capturar codigo de saida
set EXIT_CODE=%ERRORLEVEL%

echo.
echo ====================================
echo.

if %EXIT_CODE% NEQ 0 (
    echo O aplicativo foi encerrado com codigo de erro: %EXIT_CODE%
    echo.
    echo Verifique os arquivos de log:
    echo   - herbalscan.log
    echo   - herbalscan_error.log
    echo.
) else (
    echo Aplicativo encerrado normalmente.
    echo.
)

pause


