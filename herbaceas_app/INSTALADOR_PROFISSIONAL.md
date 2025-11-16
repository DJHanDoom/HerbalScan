# Guia Completo: Instalador Profissional HerbalScan

## 🎯 Visão Geral

Este projeto agora está configurado para criar um **instalador profissional** do HerbalScan para Windows, sem necessidade do usuário instalar Python.

### Principais Características

✅ **Configuração automática** - Wizard gráfico na primeira execução
✅ **Sem .env manual** - Arquivo criado automaticamente
✅ **Navegador automático** - Abre o app automaticamente
✅ **Instalador profissional** - Com Inno Setup
✅ **Renomeado para HerbalScan** - Nome correto em todo o projeto

---

## 📋 Pré-requisitos

1. **Python 3.8+** instalado
2. **PyInstaller** (será instalado automaticamente)
3. **Inno Setup 6.0+** (apenas para criar instalador) - [Download](https://jrsoftware.org/isdl.php)

---

## 🚀 Passo 1: Criar o Executável

### Opção A: Usar o script automático (Recomendado)

```bash
build.bat
```

Isso irá:
- Instalar PyInstaller (se necessário)
- Limpar builds anteriores
- Criar o executável em `dist\HerbalScan\`

### Opção B: Manualmente

```bash
pip install pyinstaller
pyinstaller HerbalScan.spec --clean
```

### Resultado

```
dist/HerbalScan/
├── HerbalScan.exe          # Executável principal
├── templates/              # Templates HTML
├── static/                 # Arquivos CSS, JS, imagens
├── config_manager.py       # Gerenciador de configuração
├── reference_species.json
├── prompt_templates.py
└── [DLLs e dependências]
```

---

## 📦 Passo 2: Criar o Instalador (Inno Setup)

### 1. Instalar Inno Setup

Baixe e instale: https://jrsoftware.org/isdl.php

### 2. Compilar o Instalador

**Opção A: Via Interface Gráfica**
1. Abra o Inno Setup Compiler
2. File → Open → Selecione `installer.iss`
3. Build → Compile
4. O instalador será criado em `installer_output\HerbalScan_Setup_v2.0.0.exe`

**Opção B: Linha de Comando**
```bash
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
```

### Resultado

```
installer_output/
└── HerbalScan_Setup_v2.0.0.exe  (~100-150 MB)
```

---

## 🎨 Passo 3: Adicionar Ícone (Opcional)

### Converter SVG para ICO

O arquivo `icon.svg` já foi criado. Para usar como ícone:

**Opção A: Usando site online**
1. Acesse: https://convertio.co/svg-ico/
2. Upload `icon.svg`
3. Escolha tamanho: 256x256
4. Download como `icon.ico`

**Opção B: Usando ImageMagick**
```bash
magick convert -density 256x256 -background transparent icon.svg -define icon:auto-resize -colors 256 icon.ico
```

### Configurar o Ícone

1. Salve `icon.ico` na raiz do projeto
2. Edite `HerbalScan.spec`:
```python
icon='icon.ico'  # Remover o comentário
```

3. Edite `installer.iss`:
```ini
SetupIconFile=icon.ico  # Remover o comentário
```

4. Rebuild tudo

---

## 🔧 Como Funciona

### Primeira Execução

1. Usuário executa `HerbalScan.exe`
2. **Wizard de configuração** aparece automaticamente:
   - Seleção da IA padrão (Gemini, Claude, GPT, etc.)
   - Links para obter chaves de API
   - Campos para inserir as chaves (opcionais)
3. Arquivo `.env` é criado automaticamente
4. Navegador abre em `http://127.0.0.1:5000`
5. Aplicativo está pronto para usar!

### Execuções Seguintes

- `.env` já existe → Pula o wizard
- Navegador abre automaticamente
- Tudo funciona normalmente

---

## 📤 Distribuição

### Método 1: Apenas o Executável (Para Testes)

Distribua a pasta completa `dist\HerbalScan\`

**Instruções para o usuário:**
1. Extrair a pasta
2. Executar `HerbalScan.exe`
3. Configurar na primeira execução

### Método 2: Instalador Profissional (Recomendado)

Distribua apenas: `HerbalScan_Setup_v2.0.0.exe`

**Vantagens:**
- ✅ Instalação com wizard profissional
- ✅ Cria atalhos automaticamente (Desktop, Menu Iniciar)
- ✅ Desinstalador incluso
- ✅ Configuração da IA padrão durante instalação
- ✅ Arquivo `.env` criado automaticamente
- ✅ Aparência Windows 11 moderna

**Experiência do usuário:**
1. Download do instalador
2. Execute `HerbalScan_Setup_v2.0.0.exe`
3. Wizard de instalação:
   - Aceitar termos
   - Escolher pasta de instalação
   - **Selecionar IA padrão**
   - Criar atalhos (Desktop/Menu)
4. Instalação concluída
5. Executar HerbalScan
6. Configurar chaves de API (via interface gráfica)
7. Começar a usar!

---

## 🎯 Personalizações Avançadas

### Remover Console (Versão Final)

Edite `HerbalScan.spec`:
```python
console=False  # Era True
```

**⚠️ Atenção:** Sem console, não verá erros. Use apenas quando 100% funcional.

### Criar Executável Único (One-File)

Edite `HerbalScan.spec` e substitua `exe` e remova `coll`:
```python
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='HerbalScan',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
)
# REMOVA toda a seção COLLECT
```

**Nota:** One-file é mais lento para iniciar (descompacta em temp a cada execução).

### Assinatura Digital (Evitar avisos de antivírus)

Requer certificado de assinatura de código:
```bash
signtool sign /f certificado.pfx /p senha /t http://timestamp.digicert.com HerbalScan.exe
```

---

## 🧪 Checklist de Qualidade

Antes de distribuir, teste:

- [ ] Executável roda em máquina SEM Python instalado
- [ ] Wizard de configuração aparece na primeira execução
- [ ] Arquivo `.env` é criado corretamente
- [ ] Navegador abre automaticamente
- [ ] Todas as funcionalidades do app funcionam
- [ ] Uploads de imagem funcionam
- [ ] Export de Excel funciona
- [ ] Salvar/carregar análises funciona
- [ ] Todas as APIs (Gemini, Claude, GPT, etc.) funcionam
- [ ] Instalador cria atalhos corretamente
- [ ] Desinstalador remove tudo (exceto dados do usuário, se desejar)
- [ ] Testado em Windows 10 e 11
- [ ] Testado em máquina limpa (sem dependências instaladas)

---

## 🐛 Solução de Problemas

### PyInstaller não encontra módulo

Adicione em `HerbalScan.spec` → `hiddenimports`:
```python
hiddenimports=[
    'seu_modulo_aqui',
    # ...
],
```

### Executável muito grande

Já otimizado com `excludes`. Tamanho normal: 80-150 MB

### Antivírus bloqueia

- Normal com PyInstaller (falso positivo)
- Solução: Assinatura digital (requer certificado)
- Ou: Usuários adicionam exceção

### Erro ao executar

1. Execute com `console=True` para ver erros
2. Verifique se todos os arquivos estão em `datas`
3. Teste em ambiente limpo

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Instalação Python | ✅ Necessário | ❌ Não necessário |
| Configurar .env | ✅ Manual | ❌ Automático |
| Abrir navegador | ✅ Manual | ❌ Automático |
| Instalador | ❌ Não tinha | ✅ Profissional |
| Primeira execução | Complexa | Simples (wizard) |
| Distribuição | Pasta zip | Instalador .exe |

---

## 📚 Recursos Adicionais

- **PyInstaller Docs:** https://pyinstaller.org/
- **Inno Setup Docs:** https://jrsoftware.org/ishelp/
- **Código fonte:** https://github.com/DJHanDoom/HerbalScan

---

## 🎉 Pronto!

Agora você tem um aplicativo Windows profissional e standalone do HerbalScan!

Para criar o instalador completo:
```bash
# 1. Criar executável
build.bat

# 2. Criar instalador (após instalar Inno Setup)
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss

# 3. Distribuir
installer_output\HerbalScan_Setup_v2.0.0.exe
```

🌿 **HerbalScan** - Sistema de Análise de Cobertura de Plantas Herbáceas
