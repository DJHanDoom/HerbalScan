# 📦 Instruções para Criar Release no GitHub

## ✅ Status Atual

- [x] Tag `v3.0.0-WIN` criada e enviada para o GitHub
- [x] Instalador compilado: `HerbalScan_Setup_v2.0.0.exe` (44.06 MB)
- [x] Documentação de release criada
- [ ] Release criada no GitHub (próximo passo)

---

## 🚀 Opção 1: Criar Release via Interface Web (Recomendado)

### Passo a Passo:

1. **Acesse o GitHub:**
   - URL: https://github.com/DJHanDoom/HerbalScan/releases/new

2. **Preencha os campos:**
   - **Tag:** Selecione `v3.0.0-WIN` (já existe)
   - **Title:** `v3.0.0 WIN - Aplicativo Standalone Windows`
   - **Description:** Copie o conteúdo de `RELEASE_NOTES.md`

3. **Faça upload do instalador:**
   - Clique em "Attach binaries by dropping them here or selecting them"
   - Selecione: `installer_output\HerbalScan_Setup_v2.0.0.exe`

4. **Publique:**
   - Marque "Set as the latest release" (opcional)
   - Clique em "Publish release"

**Pronto!** A release estará disponível em:
https://github.com/DJHanDoom/HerbalScan/releases/tag/v3.0.0-WIN

---

## 🔧 Opção 2: Criar Release via Script PowerShell (Avançado)

### Pré-requisitos:
- Token de acesso pessoal do GitHub com permissão `repo`

### Como obter o token:
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione a permissão: `repo` (Full control of private repositories)
4. Copie o token gerado

### Executar o script:

**Opção A: Definir variável de ambiente**
```powershell
$env:GITHUB_TOKEN = "seu_token_aqui"
.\criar_release.ps1
```

**Opção B: Passar token como parâmetro**
```powershell
.\criar_release.ps1 -Token "seu_token_aqui"
```

O script irá:
- ✅ Criar a release automaticamente
- ✅ Fazer upload do instalador
- ✅ Publicar a release

---

## 📋 Checklist Final

- [x] Tag criada (`v3.0.0-WIN`)
- [x] Tag enviada para GitHub
- [x] Instalador compilado e verificado
- [x] Documentação de release criada
- [ ] Release criada no GitHub
- [ ] Instalador anexado à release
- [ ] Release publicada

---

## 📝 Informações da Release

**Tag:** v3.0.0-WIN  
**Título:** v3.0.0 WIN - Aplicativo Standalone Windows  
**Instalador:** HerbalScan_Setup_v2.0.0.exe (44.06 MB)  
**Data:** 16 de Novembro de 2025  
**Branch:** v3-WIN

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/DJHanDoom/HerbalScan
- **Criar Release:** https://github.com/DJHanDoom/HerbalScan/releases/new
- **Tags:** https://github.com/DJHanDoom/HerbalScan/tags
- **Token GitHub:** https://github.com/settings/tokens

---

## 💡 Dica

Se preferir, pode usar o GitHub CLI (quando instalado):

```bash
gh release create v3.0.0-WIN `
  --title "v3.0.0 WIN - Aplicativo Standalone Windows" `
  --notes-file RELEASE_NOTES.md `
  installer_output\HerbalScan_Setup_v2.0.0.exe
```


