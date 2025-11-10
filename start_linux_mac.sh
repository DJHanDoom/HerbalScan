#!/bin/bash

echo "========================================"
echo "  Herbáceas App - Setup Rápido"
echo "========================================"
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "[ERRO] Python3 não encontrado!"
    echo "Por favor, instale Python 3.8+ do gerenciador de pacotes do seu sistema"
    exit 1
fi

echo "[OK] Python encontrado"
echo ""

# Criar ambiente virtual
echo "[1/4] Criando ambiente virtual..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "[OK] Ambiente virtual criado"
else
    echo "[OK] Ambiente virtual já existe"
fi
echo ""

# Ativar ambiente virtual
echo "[2/4] Ativando ambiente virtual..."
source venv/bin/activate
echo ""

# Instalar dependências
echo "[3/4] Instalando dependências..."
cd herbaceas_app
pip install -r requirements.txt
echo ""

# Iniciar aplicação
echo "[4/4] Iniciando aplicação..."
echo ""
echo "========================================"
echo "  Acesse: http://localhost:5000"
echo "  Pressione Ctrl+C para parar"
echo "========================================"
echo ""
python app.py
