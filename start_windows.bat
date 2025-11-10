@echo off
echo ========================================
echo   Herbaceas App - Setup Rapido
echo ========================================
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale Python 3.8+ de: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Criar ambiente virtual
echo [1/4] Criando ambiente virtual...
if not exist "venv" (
    python -m venv venv
    echo [OK] Ambiente virtual criado
) else (
    echo [OK] Ambiente virtual ja existe
)
echo.

REM Ativar ambiente virtual
echo [2/4] Ativando ambiente virtual...
call venv\Scripts\activate.bat
echo.

REM Instalar dependencias
echo [3/4] Instalando dependencias...
cd herbaceas_app
pip install -r requirements.txt
echo.

REM Iniciar aplicacao
echo [4/4] Iniciando aplicacao...
echo.
echo ========================================
echo   Acesse: http://localhost:5000
echo   Pressione Ctrl+C para parar
echo ========================================
echo.
python app.py

pause
