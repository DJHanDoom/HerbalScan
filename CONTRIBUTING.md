# Guia de Contribuição

Obrigado por considerar contribuir para o Herbáceas App! 🌿

## Como Contribuir

### 1. Reportar Bugs

Abra uma [Issue](../../issues/new) com:
- **Título claro** descrevendo o problema
- **Passos para reproduzir** o erro
- **Comportamento esperado** vs comportamento atual
- **Screenshots** se aplicável
- **Ambiente**: SO, versão Python, modelo de IA usado

### 2. Sugerir Funcionalidades

Abra uma [Issue](../../issues/new) com tag `enhancement`:
- Descreva a funcionalidade desejada
- Explique o caso de uso
- Sugira implementação (opcional)

### 3. Submeter Pull Requests

#### Setup de Desenvolvimento

```bash
# Fork o projeto e clone
git clone https://github.com/seu-usuario/herbaceas-app.git
cd herbaceas-app

# Crie branch para sua feature
git checkout -b feature/minha-feature

# Instale dependências
cd herbaceas_app
pip install -r requirements.txt

# Faça suas alterações e teste
python test_prompt_consistency.py
```

#### Padrões de Código

- **Python**: PEP 8
- **JavaScript**: ESLint padrão
- **Commits**: Mensagens claras e descritivas
  - ✨ `feat: Adiciona funcionalidade X`
  - 🐛 `fix: Corrige erro em Y`
  - 📝 `docs: Atualiza README`
  - 🎨 `style: Melhora CSS do modal`
  - ♻️ `refactor: Refatora função Z`

#### Checklist do PR

- [ ] Código testado localmente
- [ ] Testes automatizados passando (se aplicável)
- [ ] Documentação atualizada
- [ ] Sem warnings no console
- [ ] Commits organizados e bem descritos

### 4. Áreas que Precisam de Ajuda

- 📸 **Processamento de imagens**: Melhorar pré-processamento
- 🤖 **Prompts de IA**: Otimizar templates para diferentes vegetações
- 🎨 **UI/UX**: Melhorar interface e responsividade
- 📊 **Exportação**: Adicionar formatos (CSV, PDF)
- 🧪 **Testes**: Aumentar cobertura de testes
- 🌍 **i18n**: Internacionalização (inglês, espanhol)

## Estrutura do Código

### Backend (Python/Flask)

- **app.py**: Rotas principais, análise com APIs de IA
- **prompt_templates.py**: Sistema de templates configuráveis

### Frontend (JavaScript)

- **app.js**: Lógica principal, upload, exibição
- **edit-panel.js**: Sistema de edição inline
- **prompt-config.js**: Modal de configuração de templates

### Estilos (CSS)

- **style.css**: Estilos globais
- **edit-panel.css**: Painel lateral de edição
- **prompt-config.css**: Modal de configuração

## Dúvidas?

Abra uma [Discussion](../../discussions) ou entre em contato via Issues.

---

**Obrigado por contribuir! 🙏**
