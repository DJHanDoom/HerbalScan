# 🌿 Herbáceas App - Análise de Vegetação com IA

Aplicação web para análise automatizada de espécies herbáceas em parcelas de campo utilizando **Inteligência Artificial** (Google Gemini, OpenAI GPT-4, Anthropic Claude).

## 📋 Características

- **Análise automática de imagens** de vegetação rasteira/herbácea
- **Identificação de morfotipos** com características detalhadas
- **Múltiplos modelos de IA**: Gemini (gratuito), GPT-4o, Claude 3.5 Sonnet
- **Templates personalizáveis** para diferentes contextos (regeneração, reflorestamento, carbono)
- **Edição inline** de espécies com painel lateral moderno
- **Exportação para Excel** com dados detalhados e resumo por espécie
- **Padronização configurável** de morfotipos entre subparcelas (4 níveis)
- **Interface moderna** com design responsivo

## 🖼️ Screenshots

### Tela Principal
Interface para upload de imagens e visualização de resultados por subparcela.

### Configuração de Prompts
Sistema avançado de templates com parâmetros configuráveis:
- Inclusão/exclusão de solo exposto e serapilheira
- Controle de padronização de morfotipos (independente, conservadora, moderada, agressiva)
- Diferenciação de gramíneas e ciperáceas
- Limites de espécies detectadas

### Painel de Edição
Edição inline de espécies com campos para taxonomia (família, gênero, espécie), características morfológicas e observações.

## 🚀 Instalação

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Chave de API de pelo menos um provedor de IA:
  - **Google Gemini** (recomendado para uso gratuito): https://aistudio.google.com/app/apikey
  - OpenAI GPT-4: https://platform.openai.com/api-keys
  - Anthropic Claude: https://console.anthropic.com/settings/keys

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/herbaceas-app.git
cd herbaceas-app
```

2. **Crie um ambiente virtual (recomendado)**

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

3. **Instale as dependências**
```bash
cd herbaceas_app
pip install -r requirements.txt
```

4. **Configure sua chave de API**

A aplicação solicitará a chave na primeira execução, ou você pode configurar via interface web.

5. **Inicie o servidor**
```bash
python app.py
```

6. **Acesse a aplicação**

Abra seu navegador em: **http://localhost:5000**

## 📖 Como Usar

### 1. Preparar Imagens

Organize suas fotos de subparcelas em uma pasta. Formato recomendado:
- **JPG ou PNG**
- Resolução mínima: 1024x1024 pixels
- Nomes descritivos: `Subparcela_1.jpg`, `Subparcela_2.jpg`, etc.

### 2. Upload e Análise

1. Clique em **"Selecionar Pasta"** e escolha a pasta com as imagens
2. Digite o nome da parcela
3. Selecione o modelo de IA desejado
4. (Opcional) Configure o template de prompt
5. Clique em **"Analisar"**

### 3. Revisar Resultados

- **Tabela de Subparcelas**: Visualize espécies detectadas em cada foto
- **Tabela de Espécies**: Gerencie morfotipos globais, edite taxonomia
- **Resumo**: Veja estatísticas gerais da análise

### 4. Editar Espécies

- Clique em **"Editar"** em qualquer espécie
- Painel lateral abre com formulário completo
- Adicione/edite: família, gênero, espécie, observações
- Alterações sincronizam automaticamente em todas as tabelas

### 5. Exportar Dados

Clique em **"Exportar Excel"** para gerar planilha com:
- **Aba 1 - Dados Detalhados**: Todas ocorrências por subparcela
- **Aba 2 - Resumo por Espécie**: Totalizações e médias

## ⚙️ Configuração Avançada

### Templates de Prompt

Acesse o ícone ⚙️ para abrir o **modal de configuração** e escolher templates:

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

## 🗂️ Estrutura do Projeto

```
herbaceas_app/
├── app.py                      # Servidor Flask principal
├── prompt_templates.py         # Sistema de templates de prompt
├── requirements.txt            # Dependências Python
├── static/
│   ├── css/
│   │   ├── style.css          # Estilos principais
│   │   ├── edit-panel.css     # Estilos do painel de edição
│   │   └── prompt-config.css  # Estilos do modal de config
│   ├── js/
│   │   ├── app.js             # Lógica principal do frontend
│   │   ├── edit-panel.js      # Sistema de edição inline
│   │   └── prompt-config.js   # Configuração de templates
│   └── uploads/               # Imagens enviadas pelo usuário
├── templates/
│   └── index.html             # Template HTML principal
└── exports/                    # Planilhas Excel geradas
```

## 🧪 Testes

Execute os testes de consistência de prompts:

```bash
python test_prompt_consistency.py
```

Valida:
- ✅ Inclusão/exclusão de categorias
- ✅ Instruções consistentes em todos templates
- ✅ Lógica de padronização de morfotipos

## 🔧 Solução de Problemas

### Erro: "API key inválida"
- Verifique se copiou a chave completa (geralmente 39 caracteres)
- Certifique-se de que a chave está ativa no painel do provedor

### Erro: "Quota exceeded" (Gemini)
- API gratuita do Gemini tem limite de requisições por minuto
- Aguarde 60 segundos ou use GPT-4/Claude

### Erro: "JSON inválido"
- Aplicação tenta correção automática
- Se persistir, troque o modelo de IA ou ajuste o template

### Nenhuma espécie detectada
- Verifique qualidade da imagem (foco, iluminação)
- Tente template diferente ou modelo de IA alternativo
- Ajuste parâmetros no modal de configuração

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Changelog

### Versão 2.0 (Novembro 2025)
- ✨ **NOVO**: Sistema de padronização configurável de morfotipos (4 níveis)
- ✨ **NOVO**: Painel de edição inline com formulários completos
- ✨ **NOVO**: Sincronização automática de edições em todas tabelas
- ✨ **NOVO**: Exportação XLSX com taxonomia completa (família, gênero, espécie)
- 🔧 **FIX**: Correção automática de JSON malformado do Gemini
- 🔧 **FIX**: Aumento de max_output_tokens para evitar truncamento
- 🚀 **MELHORIA**: Interface mais moderna e responsiva

### Versão 1.0 (Outubro 2025)
- 🎉 Lançamento inicial
- Suporte a Gemini, GPT-4 e Claude
- Sistema de templates customizáveis
- Exportação para Excel

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

**Diogo** - Pesquisador em Ecologia

## 🙏 Agradecimentos

- Google Generative AI (Gemini API)
- OpenAI (GPT-4 API)
- Anthropic (Claude API)
- Flask Framework
- openpyxl para manipulação de Excel

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
