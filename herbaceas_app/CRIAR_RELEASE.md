# Como Criar a Release no GitHub

## ✅ Tag já criada e enviada

A tag `v3.0.0-WIN` já foi criada e enviada para o GitHub.

## 📦 Criar Release via Interface Web

### Passo 1: Acessar o GitHub
1. Acesse: https://github.com/DJHanDoom/HerbalScan
2. Clique em **"Releases"** (lado direito da página)
3. Clique em **"Draft a new release"** ou **"Create a new release"**

### Passo 2: Preencher Informações

**Tag version:** `v3.0.0-WIN` (selecione da lista)

**Release title:**
```
v3.0.0 WIN - Aplicativo Standalone Windows
```

**Description:**
```markdown
# 🌿 HerbalScan v3.0.0 WIN - Aplicativo Standalone Windows

## ✨ Principais Funcionalidades

- ✅ **Aplicativo standalone para Windows** - Sem necessidade de instalar Python
- ✅ **Instalador profissional** - Com Inno Setup, wizard em português
- ✅ **Wizard gráfico de configuração** - Configuração automática na primeira execução
- ✅ **Criação automática de .env** - Sem necessidade de copiar arquivos manualmente
- ✅ **Navegador abre automaticamente** - Experiência de usuário otimizada
- ✅ **Suporte a múltiplas IAs** - Gemini, Claude, GPT-4, DeepSeek, Qwen, HuggingFace

## 📦 O que está incluído

- `HerbalScan_Setup_v2.0.0.exe` - Instalador completo (~46 MB)
- Documentação completa de build e instalação
- Scripts automatizados de build

## 🚀 Como Instalar

1. Baixe `HerbalScan_Setup_v2.0.0.exe`
2. Execute o instalador
3. Siga o wizard de instalação
4. Configure suas chaves de API na primeira execução
5. Pronto para usar!

## 🔧 Requisitos

- Windows 10 ou 11
- ~150 MB de espaço em disco
- Conexão com internet (para APIs de IA)

## 📝 Notas

- O instalador cria o arquivo `.env` automaticamente
- Você pode configurar as chaves de API através do wizard gráfico
- O navegador abre automaticamente após iniciar o aplicativo

## 🐛 Problemas Conhecidos

Nenhum problema conhecido nesta versão.

## 📚 Documentação

Consulte os arquivos:
- `BUILD_README.md` - Como criar o executável
- `INSTALADOR_PROFISSIONAL.md` - Guia completo do instalador
- `COMMIT_REPORT_v3_WIN.md` - Relatório completo da sessão

## 🔗 Links

- **Repositório:** https://github.com/DJHanDoom/HerbalScan
- **Issues:** https://github.com/DJHanDoom/HerbalScan/issues

---

**Data de Release:** 16 de Novembro de 2025  
**Versão:** v3.0.0 WIN  
**Branch:** v3-WIN
```

### Passo 3: Fazer Upload do Instalador

1. Na seção **"Attach binaries"**, clique em **"Choose your files"**
2. Navegue até: `installer_output\HerbalScan_Setup_v2.0.0.exe`
3. Selecione o arquivo e aguarde o upload
4. O arquivo aparecerá como anexo na release

### Passo 4: Publicar

1. Marque como **"Set as the latest release"** (se desejar)
2. Clique em **"Publish release"**

## 🎉 Pronto!

A release estará disponível em:
https://github.com/DJHanDoom/HerbalScan/releases/tag/v3.0.0-WIN

---

## 📋 Checklist

- [x] Tag criada e enviada
- [ ] Release criada no GitHub
- [ ] Instalador anexado à release
- [ ] Release publicada

---

## 🔄 Alternativa: Usar GitHub CLI

Se instalar o GitHub CLI (`gh`), pode criar a release via linha de comando:

```bash
gh release create v3.0.0-WIN `
  --title "v3.0.0 WIN - Aplicativo Standalone Windows" `
  --notes-file RELEASE_NOTES.md `
  installer_output\HerbalScan_Setup_v2.0.0.exe
```

