@echo off
echo ====================================
echo Sistema de Analise de Vegetacao
echo ====================================
echo.

REM Verificar se ANTHROPIC_API_KEY está configurada
if "%ANTHROPIC_API_KEY%"=="" (
    echo ERRO: Variavel de ambiente ANTHROPIC_API_KEY nao configurada!
    echo.
    echo Configure sua chave com:
    echo set ANTHROPIC_API_KEY=sua_chave_aqui
    echo.
    pause
    exit /b 1
)

echo Iniciando servidor Flask...
echo.
echo Acesse a aplicacao em: http://localhost:5000
echo.
echo Pressione Ctrl+C para encerrar
echo.

python app.py

pause
