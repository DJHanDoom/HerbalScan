# Como Criar um Executável Standalone para Windows

Este guia explica como transformar o aplicativo Herbaceas em um executável standalone (.exe) que não requer instalação de Python.

## Pré-requisitos

1. Python 3.8+ instalado no sistema
2. Todas as dependências do projeto instaladas

## Passos para Criar o Executável

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
pip install pyinstaller
```

### 2. Executar o Build

Simplesmente execute o script de build:

```bash
build.bat
```

Ou manualmente:

```bash
pyinstaller herbaceas.spec --clean
```

### 3. Resultado

O executável será criado na pasta `dist/Herbaceas/`

## Estrutura do Executável

```
dist/Herbaceas/
├── Herbaceas.exe          # Executável principal
├── templates/             # Templates HTML
├── static/               # Arquivos CSS, JS, imagens
├── reference_species.json
├── prompt_templates.py
├── .env.example
└── [outras dependências]
```

## Como Distribuir

### Opção 1: Pasta Completa
1. Copie toda a pasta `dist/Herbaceas/` para o usuário final
2. O usuário deve:
   - Copiar `.env.example` para `.env`
   - Configurar as chaves de API no arquivo `.env`
   - Executar `Herbaceas.exe`

### Opção 2: Criar um Instalador
Use ferramentas como:
- **Inno Setup** (gratuito): https://jrsoftware.org/isinfo.php
- **NSIS** (gratuito): https://nsis.sourceforge.io/
- **Advanced Installer** (pago): https://www.advancedinstaller.com/

### Opção 3: Executável Único (One-File)
Para criar um único arquivo .exe, modifique `herbaceas.spec`:

```python
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,      # Adicionar
    a.zipfiles,      # Adicionar
    a.datas,         # Adicionar
    [],
    name='Herbaceas',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

Depois remova a seção `COLLECT`.

**Nota**: O modo one-file é mais lento para iniciar, pois descompacta os arquivos em uma pasta temporária a cada execução.

## Customizações Opcionais

### Adicionar Ícone
1. Crie ou obtenha um arquivo `.ico` (256x256 ou maior)
2. Coloque-o na raiz do projeto (ex: `icon.ico`)
3. Edite `herbaceas.spec` e altere:
   ```python
   icon='icon.ico'
   ```

### Remover Console (Janela Preta)
Para uma versão final sem console, edite `herbaceas.spec`:
```python
console=False  # Era True
```

**Atenção**: Sem o console, você não verá mensagens de erro. Use apenas quando o app estiver 100% funcional.

### Abrir Navegador Automaticamente
Adicione ao final de `app.py` (antes de `app.run()`):

```python
import webbrowser
from threading import Timer

def open_browser():
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == '__main__':
    # Abrir navegador após 1.5 segundos
    Timer(1.5, open_browser).start()
    app.run(debug=False, port=5000)
```

## Solução de Problemas

### Erro: "Módulo não encontrado"
Adicione o módulo em `hiddenimports` no arquivo `herbaceas.spec`

### Executável muito grande
- Remova dependências desnecessárias em `excludes`
- Use UPX compression (já habilitado)
- Considere virtualenv limpo apenas com dependências necessárias

### Antivírus bloqueia o executável
- Normal com PyInstaller
- Assine o executável digitalmente (requer certificado)
- Ou instrua usuários a adicionar exceção

### App não funciona no executável
1. Execute com `console=True` para ver erros
2. Verifique se todos os arquivos estão sendo incluídos em `datas`
3. Teste em uma máquina sem Python instalado

## Tamanho Estimado

O executável final terá aproximadamente:
- **Modo pasta**: 80-150 MB
- **Modo one-file**: 80-150 MB (arquivo único)

## Alternativas ao PyInstaller

Se PyInstaller não funcionar bem, considere:
- **cx_Freeze**: https://cx-freeze.readthedocs.io/
- **py2exe**: http://www.py2exe.org/
- **Nuitka**: https://nuitka.net/ (compila para C, mais rápido)

## Checklist de Distribuição

- [ ] Testar executável em máquina limpa (sem Python)
- [ ] Incluir arquivo `.env.example`
- [ ] Criar documentação de uso
- [ ] Testar todas as funcionalidades
- [ ] Verificar se todas as APIs funcionam
- [ ] Criar arquivo de instruções de configuração
- [ ] Considerar criar instalador
- [ ] Testar em diferentes versões do Windows (10, 11)
