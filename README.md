# 🌿 HerbalScan - Análise de Vegetação Herbácea facilitada com IA e interface de estimativa de porcentagem de cobertura vegetal por morfotipo.

**Versão 3.0 - Windows Standalone**

Aplicação standalone para Windows para análise automatizada de espécies herbáceas em parcelas de campo utilizando **Inteligência Artificial** (Google Gemini, OpenAI GPT-4, Anthropic Claude, DeepSeek, Qwen, HuggingFace).

> 💡 **Novidade:** Agora disponível como aplicativo standalone para Windows! Não é necessário instalar Python ou configurar ambiente de desenvolvimento.

---

## 🚀 Instalação Rápida (Windows)

### Download do Instalador

📥 **[Baixar HerbalScan v3.0.0 para Windows](https://github.com/DJHanDoom/HerbalScan/releases/download/v3.0.0-WIN/HerbalScan_Setup_v3.0.0.exe)**


## 🌐 Site do Projeto

Visite a página do projeto: **[https://djhandoom.github.io/HerbalScan/](https://djhandoom.github.io/HerbalScan/)**

> **Nota:** O site GitHub Pages serve como uma landing page com documentação. Para executar o sistema completo com análise de IA, você precisa instalar e executar localmente conforme as instruções abaixo.

## Funcionalidades

### 1. Upload e Organização
- Upload de múltiplas imagens de subparcelas
- Preview das imagens antes do envio
- Organização automática por parcela

### 2. Análise Automatizada com IA

**Modelos Premium Suportados:**
- 🤖 **Claude 3.5 Sonnet** (Anthropic) - Excelente para análise detalhada
- 🧠 **GPT-4 Vision** (OpenAI) - Ótimo reconhecimento de padrões
- ✨ **Gemini 1.5 Pro** (Google) - Rápido e eficiente

**Modelos Gratuitos (Free Tier / Open Source):**
- 🚀 **DeepSeek Chat** - Totalmente gratuito (US$ 0.14/1M tokens)
- 🌐 **Alibaba Qwen VL** - Free tier com limites generosos
- 🤗 **HuggingFace LLaVA** - 100% open source e gratuito

**Formas Vegetais Detectadas:**
- Gramíneas (diferentes tipos)
- Leguminosas (folhas compostas)
- Herbáceas de folha larga
- Arbustos jovens
- **Lianas e trepadeiras**
- **Plântulas de espécies arbóreas**
- **Bromélias**
- **Cactáceas**
- **Pteridófitas (samambaias)**
- Solo exposto / Serapilheira

**Métricas Calculadas:**
- Porcentagem de cobertura (0-100%)
- Altura média em centímetros
- Forma de vida (Erva, Arbusto, Liana, Trepadeira, Plântula, Bromélia, Cacto, Pteridófita)

### 3. Gerenciamento de Espécies

#### Edição Individual
- Alterar apelidos personalizados
- Adicionar informações científicas (gênero, espécie, família)
- Visualizar número de ocorrências

#### Unificação (Merge)
- Unir múltiplas espécies identificadas como iguais
- Recalcula coberturas e alturas automaticamente
- Mantém histórico consistente

#### Subdivisão (Split)
- Dividir uma espécie em múltiplas espécies
- Redistribuir porcentagens de cobertura
- Útil quando a IA identifica incorretamente

#### Adição e Remoção
- Adicionar espécies não detectadas pela IA
- Remover espécies identificadas incorretamente
- Editar cobertura e altura por subparcela

### 4. Visualização
- Cards visuais para cada subparcela
- Foto + lista de espécies
- Resumo estatístico
- Edição inline de dados

### 5. Exportação
- Geração de planilha Excel completa
- Aba de dados detalhados (por subparcela)
- Aba de resumo por espécie
- Inclui todas as informações científicas


### Passo a Passo

1. **Baixe o instalador** `HerbalScan_Setup_v3.0.0.exe`
2. **Execute o instalador** como administrador (clique com botão direito → "Executar como administrador")
3. **Siga o assistente de instalação:**
   - Escolha o diretório de instalação
   - Selecione a IA padrão (Gemini recomendado)
   - Opcionalmente, crie atalhos na área de trabalho
4. **Execute o HerbalScan** pelo atalho no Menu Iniciar ou Área de Trabalho
5. **Configure suas chaves de API** na primeira execução (clique no ícone ⚙️)

### Primeiros Passos

1. **Obtenha uma chave de API** (pelo menos uma):
   - **Google Gemini** (gratuito, recomendado): https://aistudio.google.com/app/apikey
   - OpenAI GPT-4: https://platform.openai.com/api-keys
   - Anthropic Claude: https://console.anthropic.com/settings/keys
   - DeepSeek: https://platform.deepseek.com/api_keys
   - Qwen (Alibaba): https://dashscope.console.aliyun.com/apiKey
   - HuggingFace: https://huggingface.co/settings/tokens

2. **Configure a chave** no HerbalScan:
   - Clique no ícone ⚙️ no canto superior direito
   - Cole sua chave de API no campo correspondente
   - Clique em "Salvar"

3. **Comece a usar!** 🎉

---

## 📋 Características

### 🆕 Novidades da Versão 3.0 (Standalone)

- ✨ **Aplicativo Windows Standalone** - Não requer Python instalado
- ✨ **Instalador Profissional** - Setup automático com configuração guiada
- ✨ **Modal de Help Integrado** - Instruções de uso e contatos do criador
- ✨ **Suporte a 6 IAs diferentes** - Gemini, Claude, GPT-4, DeepSeek, Qwen, HuggingFace
- ✨ **Exportação ZIP** - Pacote completo com JSON + imagens das subparcelas
- ✨ **Importação de Projetos** - Carregue análises anteriores salvas em ZIP
- ✨ **Excel Avançado** - 4 novas abas com análises ecológicas detalhadas
- ✨ **Ícone Personalizado** - Visual profissional para o aplicativo

### Recursos Principais

- 📸 **Análise automática de imagens** de vegetação rasteira/herbácea
- 🔬 **Identificação de morfotipos** com características detalhadas
- 🤖 **Múltiplos modelos de IA**: Gemini (gratuito), Claude 4.5, GPT-4, DeepSeek, Qwen, HuggingFace
- 📝 **Templates personalizáveis** para diferentes contextos (regeneração, reflorestamento, carbono)
- ✏️ **Edição inline** de espécies com painel lateral moderno
- 📊 **Exportação para Excel** com 4 abas de análises:
  - **Ranking de Espécies** com destaque ouro/prata/bronze
  - **Formas de Vida** - Distribuição por categoria
  - **Comparação Subparcelas** - Índice de Shannon por subparcela
  - **Índices de Diversidade** - Shannon, Simpson, Pielou
- 📄 **Exportação para PDF** com gráficos e tabelas
- 📦 **Exportação ZIP** completa com imagens
- 🎨 **Interface moderna** com design responsivo
- 🔄 **Padronização configurável** de morfotipos entre subparcelas (4 níveis)
- 📚 **Banco de Espécies de Referência** para padronização automática

---

## 📖 Como Usar

### 1️⃣ Configurar API Keys

Clique no ícone de configuração (⚙️) no canto superior direito e adicione suas chaves de API para os serviços de IA desejados.

### 2️⃣ Criar ou Selecionar Parcela

Digite o nome da parcela no campo "Nome da Parcela" ou selecione uma parcela existente no menu dropdown.

### 3️⃣ Upload de Imagens

Clique em "Escolher Imagens" e selecione as fotos das subparcelas. Você pode fazer upload de múltiplas imagens de uma vez.

**Formato recomendado:**
- **JPG ou PNG**
- Resolução mínima: 1024x1024 pixels
- Nomes descritivos: `Subparcela_1.jpg`, `Subparcela_2.jpg`, etc.

### 4️⃣ Configurar Prompt (Opcional)

Utilize o painel de configuração de prompt para personalizar a análise. Você pode escolher templates predefinidos ou criar templates customizados.

### 5️⃣ Iniciar Análise

Selecione o modelo de IA desejado e clique em "🔍 Analisar". O sistema processará as imagens e identificará as espécies vegetais presentes.

### 6️⃣ Revisar e Editar Resultados

Após a análise, revise os resultados no painel lateral. Você pode editar espécies, coberturas, alturas e formas de vida conforme necessário.

### 7️⃣ Adicionar Espécies de Referência

Use o botão "📚 Espécies de Referência" para adicionar espécies ao banco de dados de referência, facilitando a padronização em análises futuras.

### 8️⃣ Exportar Dados

Utilize os botões no rodapé para exportar seus resultados:

- **📊 Excel:** Planilha completa com 4 abas de análises avançadas, índices de diversidade e rankings
- **📄 PDF:** Relatório visual com gráficos e tabelas
- **📦 ZIP:** Pacote completo incluindo JSON + imagens das subparcelas

### 9️⃣ Importar Projetos

Use "📥 Importar Projeto" para carregar análises anteriores salvas em formato ZIP.

---

## ⚙️ Configuração Avançada

### Templates de Prompt

Acesse o ícone ⚙️ para abrir o modal de configuração e escolher templates:

- **Default**: Análise padrão balanceada
- **Regeneração**: Foco em indicadores de sucessão ecológica
- **Reflorestamento**: Ênfase em espécies nativas
- **Carbono**: Análise para projetos de sequestro de carbono

### Parâmetros Configuráveis

| Parâmetro | Opções | Descrição |
|-----------|--------|-----------|
| **Padronização de Morfotipos** | Independente / Conservadora / Moderada / Agressiva | Controla como morfotipos são unificados entre subparcelas |
| **Solo Exposto** | Sim / Não | Incluir solo nu como categoria |
| **Serapilheira** | Sim / Não | Incluir material vegetal morto |
| **Separar Gramíneas** | Sim / Não | Diferenciar Poaceae de Cyperaceae |
| **Limite de Espécies** | 3-15 | Número máximo de morfotipos por subparcela |

### Níveis de Padronização

- **Independente**: Cada subparcela analisada isoladamente, sem unificação
- **Conservadora**: Unifica apenas morfotipos idênticos (na dúvida, separe)
- **Moderada** (padrão): Equilibra precisão e consistência
- **Agressiva**: Máxima unificação, tolera pequenas variações

---

## 🔧 Solução de Problemas

### Aplicativo não inicia

1. Verifique se possui Windows 10/11 (64-bit)
2. Execute como administrador (botão direito → "Executar como administrador")
3. Verifique o arquivo de log em: `C:\Users\[SeuUsuario]\AppData\Local\Programs\HerbalScan\herbalscan.log`

### Erro: "API key inválida"

- Verifique se copiou a chave completa (geralmente 39+ caracteres)
- Certifique-se de que a chave está ativa no painel do provedor
- Teste a chave diretamente no site do provedor

### Erro: "Quota exceeded" (Gemini)

- API gratuita do Gemini tem limite de requisições por minuto
- Aguarde 60 segundos entre análises ou use outro modelo de IA

### Imagens não aparecem após importar ZIP

- Certifique-se de que as imagens estavam incluídas no ZIP original
- Verifique se o arquivo ZIP não foi corrompido durante transferência
- Tente exportar e importar novamente

### Nenhuma espécie detectada

- Verifique qualidade da imagem (foco, iluminação, resolução)
- Tente template diferente ou modelo de IA alternativo
- Ajuste parâmetros no modal de configuração
- Aumente o limite de espécies detectadas

---

## 🗂️ Estrutura do Projeto (Desenvolvedores)

Para desenvolvedores que desejam modificar o código-fonte:

```
herbaceas_app/
├── app.py                      # Servidor Flask principal
├── config_manager.py           # Wizard de configuração (tkinter)
├── prompt_templates.py         # Sistema de templates de prompt
├── HerbalScan.spec             # Configuração PyInstaller
├── installer.iss               # Script Inno Setup
├── rebuild_all.bat             # Script de recompilação
├── hooks/
│   └── hook-jaraco.text.py    # Hook personalizado PyInstaller
├── static/
│   ├── css/
│   │   ├── style.css          # Estilos principais
│   │   ├── edit-panel.css     # Painel de edição
│   │   ├── help-modal.css     # Modal de Help
│   │   └── ...
│   ├── js/
│   │   ├── app.js             # Lógica principal
│   │   ├── analysis-manager.js # Gerenciamento de análises
│   │   └── ...
│   └── uploads/               # Imagens enviadas (ignoradas no git)
├── templates/
│   └── index.html             # Template HTML principal
└── exports/                    # Arquivos exportados (ignorados no git)
```

### Compilar do Código-Fonte

**Requisitos:**
- Python 3.13+
- PyInstaller 6.0+
- Inno Setup 6.0+

**Comandos:**
```bash
# Instalar dependências
pip install -r requirements.txt

# Compilar executável + instalador
rebuild_all.bat
```

---

## 📝 Changelog

### Versão 3.0.0 (Novembro 2024) - Windows Standalone

- ✨ **NOVO**: Aplicativo standalone para Windows (não requer Python)
- ✨ **NOVO**: Instalador profissional com wizard de configuração
- ✨ **NOVO**: Modal de Help com instruções completas
- ✨ **NOVO**: Exportação/Importação ZIP com imagens
- ✨ **NOVO**: Excel com 4 abas de análises ecológicas avançadas:
  - Ranking de Espécies (ouro/prata/bronze)
  - Distribuição de Formas de Vida
  - Comparação entre Subparcelas
  - Índices de Diversidade (Shannon, Simpson, Pielou)
- ✨ **NOVO**: Suporte a 6 modelos de IA (Gemini, Claude, GPT-4, DeepSeek, Qwen, HuggingFace)
- ✨ **NOVO**: Banco de Espécies de Referência
- 🔧 **FIX**: Correção de encoding UTF-8 em arquivos .env
- 🔧 **FIX**: Correção de exportação ZIP com caminhos de imagem
- 🔧 **FIX**: Hook personalizado para jaraco.text
- 🚀 **MELHORIA**: Interface modernizada e mais responsiva

### Versão 2.0 (Novembro 2024)

- ✨ Sistema de padronização configurável de morfotipos (4 níveis)
- ✨ Painel de edição inline com formulários completos
- ✨ Sincronização automática de edições em todas tabelas
- ✨ Exportação XLSX com taxonomia completa
- 🔧 Correção automática de JSON malformado
- 🚀 Interface mais moderna e responsiva

### Versão 1.0 (Outubro 2024)

- 🎉 Lançamento inicial
- Suporte a Gemini, GPT-4 e Claude
- Sistema de templates customizáveis
- Exportação para Excel

---

## 👨‍💻 Sobre o Criador e Contatos

### Diogo Bueno Kanoute

**Parabotânico e Dendrólogo em Inventário Florestal**

Desenvolvedor especializado em Tecnologias de Inteligência Artificial e Banco de Dados para Inventário Florestal, Ecologia, Botânica, Dendrometria e Dendrologia.

### 🔗 Links e Contatos

- 📸 **Fototeca DBK no SPLink:** [specieslink.net/col/FDBK](https://specieslink.net/col/FDBK)
- 📱 **Instagram Científico:** [@fotografandomato](https://instagram.com/fotografandomato)
- 📚 **Biblioteca Botânica:** [PDFs e Material de Referência](https://drive.google.com/drive/folders/0B4wGMi_KVTvOWm51UzNnNVJjaEk?resourcekey=0-8e69zvcLn2zMXuphNmC56A&usp=drive_link)
- 🌿 **Flora da Reserva Ducke:** [Glossários e Guias Ilustrados](https://drive.google.com/drive/folders/0B4wGMi_KVTvOV2FmV0dnbDFiSzA?resourcekey=0-93UNqXD8Tg4mD0C9p073SA&usp=drive_link)
- 💬 **WhatsApp Científico:** [+55 21 998501623](https://wa.me/5521998501623)
- 📧 **E-mail:** [diogokanoute@gmail.com](mailto:diogokanoute@gmail.com)

Entre em contato para dúvidas sobre o app, cursos de Identificação Botânica, tecnologias de IA aplicadas à Dendrologia ou serviços de Inventário Florestal (Mata Atlântica, Cerrado, Amazônia e Caatinga).

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- Google Generative AI (Gemini API)
- OpenAI (GPT-4 API)
- Anthropic (Claude API)
- DeepSeek AI
- Alibaba Cloud (Qwen)
- HuggingFace
- Flask Framework
- openpyxl para manipulação de Excel
- PyInstaller para empacotamento Windows
- Inno Setup para instalador profissional

---

## 📊 Estatísticas do Projeto

- **Versão Atual:** 3.0.0
- **Plataforma:** Windows 10/11 (64-bit)
- **Linguagem:** Python 3.13
- **Framework Web:** Flask 3.0
- **Modelos de IA:** 6 suportados
- **Formatos de Exportação:** Excel, PDF, ZIP

---

**⭐ Se este projeto foi útil para sua pesquisa ou trabalho, considere dar uma estrela no GitHub!**

**🐛 Encontrou um bug ou tem uma sugestão?** [Abra uma issue](https://github.com/DJHanDoom/HerbalScan/issues)

**📢 Quer ficar por dentro das atualizações?** [Watch este repositório](https://github.com/DJHanDoom/HerbalScan/subscription)
