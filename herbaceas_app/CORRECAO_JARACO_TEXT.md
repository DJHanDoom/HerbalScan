# Correção: Erro jaraco.text - FileNotFoundError

## Problema

O aplicativo instalado apresenta o seguinte erro:

```
FileNotFoundError: [Errno 2] No such file or directory: 
'C:\\Users\\diogo\\AppData\\Local\\Programs\\HerbalScan\\_internal\\setuptools\\_vendor\\jaraco\\text\\Lorem ipsum.txt'
```

## Causa

O PyInstaller não está incluindo automaticamente os arquivos de dados do pacote `jaraco.text` que faz parte do `setuptools`. Esses arquivos são necessários para o funcionamento do `pkg_resources`.

## Solução Implementada

### 1. Hook Melhorado (`hooks/hook-jaraco.text.py`)
- Detecta e inclui todos os arquivos `.txt` do `jaraco.text`
- Mantém a estrutura de diretórios correta

### 2. Adição Direta no Spec (`HerbalScan.spec`)
- Inclui os arquivos diretamente na seção `datas`
- Funciona como fallback se o hook não funcionar

### 3. Tratamento de Erro Melhorado (`app.py`)
- Handler de exceções configurado mais cedo
- Logs são criados mesmo quando há erro no início
- Localização dos logs: `C:\Users\diogo\AppData\Local\Programs\HerbalScan\herbalscan_error.log`

## Localização dos Logs

Os logs são criados no diretório de instalação do aplicativo:

**Diretório padrão:**
```
C:\Users\[USUARIO]\AppData\Local\Programs\HerbalScan\
```

**Arquivos de log:**
- `herbalscan.log` - Log geral do aplicativo
- `herbalscan_error.log` - Log de erros fatais

## Como Aplicar a Correção

1. **Recompilar o executável:**
   ```bash
   build.bat
   ```

2. **Recriar o instalador:**
   ```bash
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
   ```

3. **Reinstalar o aplicativo:**
   - Desinstalar a versão anterior
   - Instalar a nova versão
   - Testar

## Verificação

Após reinstalar, verifique se:
1. O aplicativo inicia sem erros
2. Os arquivos de log são criados no diretório de instalação
3. Não há mais erro sobre `Lorem ipsum.txt`

## Se o Problema Persistir

1. Verifique o arquivo `herbalscan_error.log` no diretório de instalação
2. Execute o aplicativo via `HerbalScan_Launcher.bat` para ver erros no console
3. Verifique se o hook está sendo executado durante o build (procure por mensagens `[HOOK]` e `[SPEC]`)

## Notas Técnicas

- O arquivo `Lorem ipsum.txt` é usado pelo `jaraco.text` para gerar texto de exemplo
- O PyInstaller não detecta automaticamente arquivos de dados de pacotes vendorizados
- A solução inclui os arquivos tanto via hook quanto diretamente no spec para garantir compatibilidade


