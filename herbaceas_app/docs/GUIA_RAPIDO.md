# Guia Rápido de Uso

## Instalação e Configuração

### 1. Instalar dependências
```bash
pip install -r requirements.txt
```

### 2. Configurar chave da API
```bash
set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. Iniciar aplicação
```bash
python app.py
```
Ou dê duplo clique em `start.bat`

### 4. Acessar
Abra o navegador em: http://localhost:5000

---

## Workflow de Análise

### PASSO 1: Upload
1. Digite o nome da parcela (ex: "Parcela_9")
2. Clique em "Selecionar Imagens"
3. Escolha todas as fotos das subparcelas
4. Clique em "Enviar Imagens"

### PASSO 2: Análise Automática
1. Clique em "Analisar Imagens"
2. Aguarde a IA processar (pode levar alguns minutos)
3. Visualize os resultados preliminares

### PASSO 3: Refinamento Manual

#### 3.1. Unificar Espécies (quando a IA identificou a mesma planta com nomes diferentes)

Exemplo: "Gramínea Verde" e "Capim Verde" são a mesma espécie

**Como fazer:**
1. Vá até a seção "Gerenciamento de Espécies"
2. Marque as checkboxes das espécies a unificar
3. Clique em "Unificar Selecionadas"
4. Digite o novo nome (ex: "Capim Verde")
5. Confirme

**O que acontece:**
- As coberturas são somadas
- As alturas são recalculadas (média ponderada)
- Todas as ocorrências nas subparcelas são atualizadas

---

#### 3.2. Subdividir Espécie (quando a IA agrupou plantas diferentes)

Exemplo: IA identificou "Gramínea Mista" mas você vê duas espécies distintas

**Como fazer:**
1. No card da subparcela específica, clique em "Subdividir Espécie"
2. Digite o nome da espécie a subdividir
3. Informe em quantas espécies dividir (ex: 2)
4. Para cada nova espécie:
   - Nome (ex: "Capim Colonião")
   - Cobertura (ex: 15%)
   - Altura (ex: 45cm)
   - Forma de vida (ex: "Erva")

**O que acontece:**
- Espécie original é removida da subparcela
- Novas espécies são criadas com os valores informados
- Lista unificada é atualizada

---

#### 3.3. Adicionar Espécie (quando a IA não detectou)

Exemplo: Há uma leguminosa que a IA não identificou

**Como fazer:**
1. No card da subparcela, clique em "+ Adicionar"
2. Preencha:
   - Nome (ex: "Leguminosa Rasteira")
   - Cobertura (ex: 5%)
   - Altura (ex: 12cm)
   - Forma de vida (ex: "Erva")
3. Confirme

**O que acontece:**
- Espécie é adicionada à subparcela
- Aparece na lista unificada
- Você pode editar informações científicas depois

---

#### 3.4. Remover Espécie (quando a IA detectou algo incorreto)

Exemplo: IA detectou "Solo Exposto" mas é na verdade serapilheira

**Como fazer:**
1. No card da subparcela, localize a espécie
2. Clique no ícone 🗑️
3. Confirme a remoção

**O que acontece:**
- Espécie é removida apenas daquela subparcela
- Se era a última ocorrência, sai da lista unificada

---

#### 3.5. Editar Valores (cobertura/altura em subparcela específica)

Exemplo: Ajustar porcentagem de cobertura

**Como fazer:**
1. No card da subparcela, localize a espécie
2. Clique no ícone ✏️
3. Digite nova cobertura e/ou altura
4. Confirme

---

#### 3.6. Adicionar Informações Científicas

Exemplo: Identificou a espécie botanicamente

**Como fazer:**
1. Na tabela "Gerenciamento de Espécies"
2. Clique em "Editar" na linha da espécie
3. Preencha:
   - Apelido Personalizado
   - Gênero (ex: "Paspalum")
   - Espécie (ex: "notatum")
   - Família (ex: "Poaceae")
4. Clique em "Salvar"

**O que acontece:**
- Informações são atualizadas em TODAS as ocorrências
- Aparecem na planilha exportada

---

### PASSO 4: Exportação

1. Revise todos os dados
2. Clique em "Exportar para Excel"
3. Baixe a planilha gerada

**A planilha contém:**
- **Aba 1:** Dados detalhados (cada linha = uma espécie em uma subparcela)
- **Aba 2:** Resumo (consolidado por espécie única)

---

## Dicas Importantes

### ✅ Faça
- Sempre revise os resultados da IA
- Use nomes descritivos e consistentes
- Unifique espécies iguais antes de exportar
- Adicione informações científicas quando souber
- Exporte e salve backup da planilha

### ❌ Evite
- Confiar 100% na IA sem revisar
- Usar nomes muito genéricos
- Deixar espécies duplicadas
- Esquecer de somar coberturas (devem totalizar ~100%)
- Perder dados (sempre exporte!)

---

## Atalhos e Truques

### Seleção Múltipla
- Use Ctrl+Click para selecionar múltiplas espécies para unificar

### Validação de Cobertura
- Some mentalmente as coberturas de cada subparcela
- Deve dar aproximadamente 100%
- Se muito diferente, algo está errado

### Padrão de Nomenclatura
Sugestão de padrão:
- Gramíneas: "Capim [característica]" (ex: Capim Verde Alto)
- Leguminosas: "Leguminosa [característica]" (ex: Leguminosa Rasteira)
- Arbustos: "Arbusto [característica]" (ex: Arbusto Jovem)
- Outras: Nome descritivo (ex: Erva Folha Larga)

---

## Solução de Problemas

### "Erro ao analisar"
- Verifique sua chave API
- Verifique conexão com internet
- Tente novamente

### "Análise muito lenta"
- Normal para muitas imagens
- Claude processa uma por vez
- Aguarde alguns minutos

### "Espécie não aparece na lista"
- Pode ter sido removida por ter 0 ocorrências
- Adicione novamente se necessário

### "Cobertura total > 100%"
- Revise os valores
- Ajuste manualmente
- Considere sobreposição de vegetação

---

## Exemplo Prático

### Situação Real:
Você tem 10 subparcelas da Parcela 9, cada com foto de 1x1m de vegetação de campo.

### Workflow:
1. Upload das 10 fotos ✓
2. Análise automática ✓
3. IA detecta: "Gramínea Alta", "Capim Verde", "Gramínea Baixa", "Solo Exposto", etc.
4. **Você percebe:** "Gramínea Alta" e "Capim Verde" são a mesma coisa
   - Unifica → "Capim Verde Alto"
5. **Você percebe:** Há uma leguminosa em 3 subparcelas que não foi detectada
   - Adiciona "Leguminosa Folha Composta" manualmente nas 3
6. **Você identifica:** O "Capim Verde Alto" é *Paspalum notatum*
   - Edita e adiciona: Gênero: Paspalum, Espécie: notatum, Família: Poaceae
7. Exporta planilha final ✓

### Resultado:
Planilha Excel completa, refinada, com informações científicas, pronta para análise estatística!

---

## Suporte

Problemas? Consulte o README.md completo ou a documentação técnica.
