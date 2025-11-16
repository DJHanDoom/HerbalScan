@echo off
echo ========================================
echo   Build HerbalScan Standalone App
echo ========================================
echo.

REM Limpar arquivos de desenvolvimento primeiro
call clean_build.bat

REM Verificar se PyInstaller está instalado
python -c "import PyInstaller" 2>nul
if errorlevel 1 (
    echo PyInstaller nao encontrado. Instalando...
    pip install pyinstaller
)

echo Limpando builds anteriores...
if exist "build" rd /s /q "build"
if exist "dist" rd /s /q "dist"

echo.
echo Criando executavel...
pyinstaller HerbalScan.spec --clean

if errorlevel 1 (
    echo.
    echo ERRO: Falha ao criar o executavel!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build concluido com sucesso!
echo ========================================
echo.
echo O executavel foi criado em: dist\HerbalScan\
echo.
echo Para executar:
echo   1. Va ate a pasta dist\HerbalScan\
echo   2. Execute HerbalScan.exe
echo   3. Configure suas chaves de API na primeira execucao
echo.
pause
