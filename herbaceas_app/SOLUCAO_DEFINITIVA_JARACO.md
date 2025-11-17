# Solução Definitiva: Erro jaraco.text

## Problema

O aplicativo falha ao iniciar com o erro:
```
FileNotFoundError: [Errno 2] No such file or directory: 
'C:\\Users\\diogo\\AppData\\Local\\Programs\\HerbalScan\\_internal\\setuptools\\_vendor\\jaraco\\text\\Lorem ipsum.txt'
```

## Causa Raiz

O PyInstaller não inclui automaticamente arquivos de dados de pacotes vendorizados como `setuptools._vendor.jaraco.text`. O arquivo `Lorem ipsum.txt` é necessário para o funcionamento do `pkg_resources`.

## Solução Implementada

### 1. Hook Corrigido (`hooks/hook-jaraco.text.py`)
- Detecta o arquivo `Lorem ipsum.txt` no caminho correto
- Adiciona ao `datas` com o caminho de destino: `setuptools/_vendor/jaraco/text`
- O PyInstaller copiará o arquivo para `_internal/setuptools/_vendor/jaraco/text/`

### 2. Spec Atualizado (`HerbalScan.spec`)
- Inclui os arquivos diretamente na seção `datas` como fallback
- Garante que os arquivos sejam incluídos mesmo se o hook falhar

### 3. Estrutura de Caminhos

**Durante o build:**
- Arquivo fonte: `C:\...\site-packages\setuptools\_vendor\jaraco\text\Lorem ipsum.txt`
- Destino no spec: `setuptools/_vendor/jaraco/text`

**No executável:**
- Caminho final: `_internal\setuptools\_vendor\jaraco\text\Lorem ipsum.txt`

## Como Aplicar

1. **Limpar builds anteriores:**
   ```bash
   clean_build.bat
   ```

2. **Recompilar o executável:**
   ```bash
   build.bat
   ```
   
   Durante o build, você deve ver mensagens como:
   ```
   [HOOK] Adicionado: Lorem ipsum.txt -> setuptools/_vendor/jaraco/text
   [SPEC] Adicionado arquivo de dados: Lorem ipsum.txt -> setuptools/_vendor/jaraco/text
   ```

3. **Verificar se o arquivo foi incluído:**
   Após o build, verifique se o arquivo existe em:
   ```
   dist\HerbalScan\_internal\setuptools\_vendor\jaraco\text\Lorem ipsum.txt
   ```

4. **Recriar o instalador:**
   ```bash
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
   ```

5. **Reinstalar:**
   - Desinstalar versão anterior
   - Instalar nova versão
   - Testar

## Verificação Pós-Instalação

Após instalar, verifique se o arquivo existe em:
```
C:\Users\[USUARIO]\AppData\Local\Programs\HerbalScan\_internal\setuptools\_vendor\jaraco\text\Lorem ipsum.txt
```

## Se o Problema Persistir

1. **Verificar se o hook está sendo executado:**
   - Procure por mensagens `[HOOK]` e `[SPEC]` durante o build
   - Se não aparecerem, o hook não está sendo carregado

2. **Verificar manualmente:**
   - Abra `dist\HerbalScan\_internal\setuptools\_vendor\jaraco\text\`
   - Deve conter o arquivo `Lorem ipsum.txt`

3. **Alternativa: Excluir pkg_resources (não recomendado):**
   Se nada funcionar, você pode tentar excluir o uso de `pkg_resources`, mas isso pode quebrar outras funcionalidades.

## Notas Técnicas

- O PyInstaller usa `_internal` como diretório para arquivos empacotados
- O caminho de destino no spec deve usar `/` (barra normal) mesmo no Windows
- O PyInstaller converte automaticamente para a estrutura correta no executável
- O hook é executado durante a análise do PyInstaller, antes do build

## Debug

Para verificar se o arquivo está sendo incluído, adicione este código temporário no `app.py`:

```python
if getattr(sys, 'frozen', False):
    import setuptools
    from pathlib import Path
    test_path = Path(sys._MEIPASS) / 'setuptools' / '_vendor' / 'jaraco' / 'text' / 'Lorem ipsum.txt'
    print(f"Testando caminho: {test_path}")
    print(f"Existe: {test_path.exists()}")
```


