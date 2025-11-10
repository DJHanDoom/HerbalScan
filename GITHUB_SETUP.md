# 🚀 Guia de Upload para GitHub

## Passo 1: Inicializar Git (se ainda não inicializou)

```bash
cd "C:\Users\diogo\Documents\TRABALHO\dossel"
git init
```

## Passo 2: Adicionar todos os arquivos

```bash
git add .
```

## Passo 3: Primeiro commit

```bash
git commit -m "🎉 feat: Initial commit - Herbáceas App v2.0

- Sistema de análise de vegetação com IA (Gemini, GPT-4, Claude)
- Templates configuráveis de prompt com 4 níveis de padronização
- Painel de edição inline de espécies
- Exportação para Excel com taxonomia completa
- Correção automática de JSON malformado
- Interface moderna e responsiva"
```

## Passo 4: Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `herbaceas-app` (ou outro nome que preferir)
3. Descrição: "🌿 Análise automatizada de vegetação herbácea com IA"
4. **Público ou Privado**: Escolha conforme preferência
5. **NÃO** marque "Add README" (já temos)
6. Clique em **"Create repository"**

## Passo 5: Conectar repositório local ao GitHub

Copie os comandos que o GitHub mostrará, algo como:

```bash
git remote add origin https://github.com/SEU-USUARIO/herbaceas-app.git
git branch -M main
git push -u origin main
```

**OU** se preferir SSH:

```bash
git remote add origin git@github.com:SEU-USUARIO/herbaceas-app.git
git branch -M main
git push -u origin main
```

## Passo 6: Verificar

Acesse `https://github.com/SEU-USUARIO/herbaceas-app` e confirme que tudo foi enviado!

---

## 📝 Commits Futuros

Para commits subsequentes:

```bash
# Verificar alterações
git status

# Adicionar arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "🐛 fix: Descrição da correção"

# Enviar para GitHub
git push
```

### Tipos de Commit (Conventional Commits)

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, CSS
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas gerais (dependências, config)

---

## 🔐 Dica: Armazenar Credenciais

Para não digitar usuário/senha sempre:

```bash
git config credential.helper store
```

Na próxima vez que fizer `git push`, digite suas credenciais e elas serão salvas.

---

## ⚠️ Atenção

O `.gitignore` já está configurado para **NÃO** subir:
- Chaves de API
- Imagens de usuários
- Arquivos temporários
- Diretório venv/

Se precisar subir exemplos de imagens, coloque em pasta separada tipo `examples/`.
