# Solução: HerbalScan.exe não abre após instalação

## Problema
O `herbalscan.exe` instalado através do instalador InnoSetup não abre - apenas "pisca" o terminal mas não exibe a interface nem inicia o servidor.

## Soluções Implementadas

### 1. Tratamento de Erro Robusto
- Adicionado handler global de exceções que captura todos os erros
- Erros são salvos em `herbalscan_error.log` no diretório de instalação
- Console permanece aberto para exibir erros

### 2. Launcher .bat para Debug
- Criado `HerbalScan_Launcher.bat` que executa o .exe e mantém o console aberto
- Útil para ver mensagens de erro que aparecem rapidamente

### 3. Melhorias no Logging
- Logs detalhados em `herbalscan.log`
- Logs de erro em `herbalscan_error.log`
- Informações sobre caminhos, diretórios e configuração

### 4. Correções no Instalador
- Adicionado `WorkingDir` em todos os atalhos
- Incluído launcher .bat no instalador
- Criado atalho adicional "HerbalScan (Launcher)" no menu Iniciar

## Como Diagnosticar o Problema

### Passo 1: Verificar Arquivos de Log
Após tentar executar o aplicativo, verifique os arquivos de log no diretório de instalação:
- `C:\Program Files\HerbalScan\herbalscan.log`
- `C:\Program Files\HerbalScan\herbalscan_error.log`

### Passo 2: Usar o Launcher .bat
1. Navegue até o diretório de instalação (geralmente `C:\Program Files\HerbalScan`)
2. Execute `HerbalScan_Launcher.bat` (duplo clique)
3. O console permanecerá aberto e mostrará qualquer erro

### Passo 3: Executar Diretamente do Terminal
1. Abra o PowerShell ou CMD como Administrador
2. Navegue até o diretório de instalação:
   ```powershell
   cd "C:\Program Files\HerbalScan"
   ```
3. Execute o .exe:
   ```powershell
   .\HerbalScan.exe
   ```

### Passo 4: Verificar Permissões
O aplicativo precisa de permissões para:
- Ler arquivos no diretório de instalação
- Criar diretórios (exports, saved_analyses, static/uploads)
- Escrever arquivos de log

Se houver problemas de permissão, tente:
1. Executar como Administrador
2. Verificar se o antivírus está bloqueando

## Possíveis Causas e Soluções

### Causa 1: Erro na Importação de Módulos
**Sintoma:** Console fecha imediatamente sem mensagem

**Solução:**
- Verifique `herbalscan_error.log` para ver qual módulo está faltando
- Recompile o executável com `build.bat`
- Verifique se todos os módulos estão em `hiddenimports` no `HerbalScan.spec`

### Causa 2: Problema com Caminhos
**Sintoma:** Erro sobre arquivos não encontrados

**Solução:**
- Verifique se `templates` e `static` estão sendo copiados corretamente
- Verifique o log para ver os caminhos detectados
- Certifique-se de que o instalador está copiando todos os arquivos necessários

### Causa 3: Porta 5000 já em uso
**Sintoma:** Erro ao iniciar o servidor Flask

**Solução:**
- Feche outros aplicativos que possam estar usando a porta 5000
- Ou modifique a porta no `app.py` (linha ~5282)

### Causa 4: Antivírus Bloqueando
**Sintoma:** Executável não inicia ou fecha imediatamente

**Solução:**
- Adicione exceção no antivírus para o diretório de instalação
- Ou desative temporariamente para testar

### Causa 5: Dependências Faltando
**Sintoma:** Erro sobre DLLs ou bibliotecas não encontradas

**Solução:**
- Instale Visual C++ Redistributable (x64)
- Verifique se todas as dependências Python estão incluídas no build

## Próximos Passos

1. **Recompilar o executável:**
   ```bash
   build.bat
   ```

2. **Recriar o instalador:**
   ```bash
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
   ```

3. **Testar em máquina limpa:**
   - Instale em uma máquina sem Python
   - Teste todas as funcionalidades
   - Verifique os logs

## Melhorias Futuras

- [ ] Adicionar verificação de dependências no início
- [ ] Criar script de diagnóstico automático
- [ ] Adicionar modo de instalação "portable" (sem instalação)
- [ ] Melhorar mensagens de erro para o usuário final

## Contato

Se o problema persistir, forneça:
1. Conteúdo de `herbalscan_error.log`
2. Conteúdo de `herbalscan.log`
3. Versão do Windows
4. Mensagens de erro do console (se visíveis)


