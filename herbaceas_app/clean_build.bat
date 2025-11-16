@echo off
echo ========================================
echo   Limpando arquivos de desenvolvimento
echo ========================================
echo.

REM Limpar uploads de teste
if exist "static\uploads\*" (
    echo Removendo uploads de teste...
    del /Q "static\uploads\*.*" 2>nul
)

REM Limpar exports
if exist "exports\*" (
    echo Removendo exports...
    del /Q "exports\*.*" 2>nul
)

REM Limpar análises salvas
if exist "saved_analyses\*" (
    echo Removendo analises salvas...
    del /Q "saved_analyses\*.*" 2>nul
)

REM Limpar .env (será criado automaticamente)
if exist ".env" (
    echo Removendo .env...
    del /Q ".env" 2>nul
)

REM Limpar __pycache__
if exist "__pycache__" (
    echo Removendo __pycache__...
    rd /s /q "__pycache__" 2>nul
)

echo.
echo ========================================
echo   Limpeza concluida!
echo ========================================
echo.
