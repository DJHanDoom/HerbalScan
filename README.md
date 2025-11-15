# Sistema de Análise de Vegetação Herbácea

Sistema web para análise automatizada de cobertura vegetal em quadrados de 1x1m utilizando Inteligência Artificial (Claude).

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

## Instalação

### Pré-requisitos
- Python 3.8+
- Pelo menos uma API key de IA (modelos gratuitos recomendados para começar):

  **Modelos Premium:**
  - **Claude**: API key da Anthropic
  - **GPT-4**: API key da OpenAI
  - **Gemini**: API key do Google

  **Modelos Gratuitos:**
  - **DeepSeek**: API key gratuita do DeepSeek
  - **Qwen**: API key do Alibaba DashScope (free tier)
  - **HuggingFace**: Token gratuito do HuggingFace

### Passos

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. **(Opcional)** Configure API keys via variáveis de ambiente:
```bash
# Windows
set ANTHROPIC_API_KEY=sua_chave_aqui
set OPENAI_API_KEY=sua_chave_aqui
set GOOGLE_API_KEY=sua_chave_aqui

# Linux/Mac
export ANTHROPIC_API_KEY=sua_chave_aqui
export OPENAI_API_KEY=sua_chave_aqui
export GOOGLE_API_KEY=sua_chave_aqui
```

**OU** configure diretamente na interface web (recomendado para facilidade)

3. Execute a aplicação:
```bash
python app.py
```
Ou simplesmente dê duplo clique em `start.bat`

4. Acesse no navegador:
```
http://localhost:5000
```

5. Na primeira vez, você será solicitado a configurar pelo menos uma API key pela interface

### Obter API Keys

#### Modelos Gratuitos (Recomendados para começar)

**DeepSeek (100% Gratuito!):**
- Acesse: https://platform.deepseek.com/api_keys
- Crie uma conta gratuita
- Gere uma API key
- Formato: `sk-xxxxx`
- Custo: **US$ 0.14 por milhão de tokens** (essencialmente grátis!)

**Alibaba Qwen VL (Free Tier):**
- Acesse: https://dashscope.console.aliyun.com/apiKey
- Crie uma conta
- Gere uma API key do DashScope
- Formato: `sk-xxxxx`
- Inclui generoso free tier mensal

**HuggingFace LLaVA (Open Source):**
- Acesse: https://huggingface.co/settings/tokens
- Crie uma conta (100% gratuita)
- Gere um token de acesso
- Formato: `hf_xxxxx`
- Completamente gratuito para modelos open source

#### Modelos Premium

**Claude (Anthropic):**
- Acesse: https://console.anthropic.com/
- Crie uma conta e gere uma API key
- Formato: `sk-ant-xxxxx`

**GPT-4 (OpenAI):**
- Acesse: https://platform.openai.com/api-keys
- Crie uma conta e gere uma API key
- Formato: `sk-xxxxx`

**Gemini (Google):**
- Acesse: https://aistudio.google.com/app/apikey
- Crie uma API key
- Formato: `xxxxx`

## Uso

### Workflow Completo

1. **Upload de Imagens**
   - Digite o nome da parcela
   - Selecione as imagens das subparcelas (1x1m)
   - Clique em "Enviar Imagens"

2. **Análise Automatizada**
   - Clique em "Analisar Imagens"
   - Aguarde a IA processar cada subparcela
   - Visualize os resultados preliminares

3. **Refinamento Manual**

   **Unificar espécies semelhantes:**
   - Marque as checkboxes das espécies a unificar
   - Clique em "Unificar Selecionadas"
   - Digite o novo nome
   - Confirme

   **Subdividir espécie:**
   - No card da subparcela, clique em "Subdividir Espécie"
   - Selecione a espécie
   - Informe quantas espécies diferentes são
   - Atribua nomes, coberturas e alturas

   **Adicionar espécie:**
   - No card da subparcela, clique em "+ Adicionar"
   - Preencha os dados da espécie
   - Confirme

   **Remover espécie:**
   - Clique no ícone 🗑️ ao lado da espécie
   - Confirme a remoção

   **Editar valores:**
   - Clique no ícone ✏️ para editar cobertura/altura
   - Ou clique em "Editar" na tabela de espécies para informações científicas

4. **Exportação**
   - Revise os dados finais
   - Clique em "Exportar para Excel"
   - Baixe a planilha gerada

## Estrutura de Dados

### Dados Exportados

**Aba "Dados Detalhados":**
| Parcela | Subparcela | Índice | Apelido Original | Apelido Usuário | Gênero | Espécie | Família | Cobertura (%) | Altura (cm) | Forma de Vida |
|---------|------------|--------|------------------|-----------------|--------|---------|---------|---------------|-------------|---------------|

**Aba "Resumo por Espécie":**
| Apelido Original | Apelido Usuário | Gênero | Espécie | Família | Nº Ocorrências | Forma de Vida |
|------------------|-----------------|--------|---------|---------|----------------|---------------|

## Tecnologias

- **Backend:** Flask (Python)
- **IA:** Claude 3.5 Sonnet (Anthropic)
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Exportação:** OpenPyXL
- **Análise:** Visão computacional com Claude

## Arquitetura

```
herbaceas_app/
├── app.py                 # Backend Flask
├── requirements.txt       # Dependências
├── README.md             # Documentação
├── static/
│   ├── css/
│   │   └── style.css     # Estilos
│   ├── js/
│   │   └── app.js        # Lógica frontend
│   └── uploads/          # Imagens enviadas
├── templates/
│   └── index.html        # Interface principal
└── exports/              # Planilhas exportadas
```

## API Endpoints

### Upload
- `POST /api/upload` - Upload de imagens

### Análise
- `POST /api/analyze/<parcela>` - Analisar imagens

### Espécies
- `GET /api/especies` - Listar espécies unificadas
- `PUT /api/especies/<apelido>` - Atualizar espécie
- `POST /api/especies/merge` - Unificar espécies
- `POST /api/especies/split` - Subdividir espécie
- `POST /api/especies/add` - Adicionar espécie
- `POST /api/especies/remove` - Remover espécie
- `PUT /api/especies/<parcela>/<subparcela>/<apelido>` - Editar em subparcela

### Dados
- `GET /api/parcelas` - Listar parcelas
- `GET /api/parcela/<nome>` - Detalhes da parcela

### Exportação
- `POST /api/export` - Exportar para Excel
- `GET /api/download/<filename>` - Download do arquivo

## Dicas de Uso

1. **Qualidade das Fotos**
   - Use fotos nítidas e bem iluminadas
   - Mantenha o quadrado de 1x1m bem visível
   - Evite sombras excessivas

2. **Refinamento**
   - Sempre revise os resultados da IA
   - Unifique espécies com nomes diferentes mas mesma planta
   - Subdivida quando a IA agrupar espécies diferentes

3. **Nomenclatura**
   - Use apelidos descritivos e consistentes
   - Adicione informações científicas quando disponíveis
   - Mantenha padrão de nomenclatura entre parcelas

4. **Exportação**
   - Exporte após cada sessão de análise
   - Mantenha backup das planilhas
   - Use a planilha para análises estatísticas posteriores

## Limitações

- Requer conexão com internet (API Claude)
- Análise depende da qualidade das imagens
- IA pode precisar de correções manuais
- Limite de 50MB por upload

## Suporte

Para dúvidas ou problemas, consulte a documentação do projeto.

## Licença

Uso acadêmico e científico.
