# 📚 Exemplos de Uso

## Obtendo Chaves de API (Gratuitas)

### Google Gemini (RECOMENDADO - Gratuito)

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave (formato: `AIzaSy...`)

**Limites gratuitos:**
- 60 requisições/minuto
- 1.500 requisições/dia
- Suficiente para análises pequenas e médias

### OpenAI GPT-4 (Pago - $0.01-0.03 por imagem)

1. Acesse: https://platform.openai.com/api-keys
2. Crie uma conta e adicione créditos ($5-10 recomendado)
3. Gere uma nova API key
4. Copie a chave (formato: `sk-...`)

**Custos aproximados:**
- GPT-4o: ~$0.01 por imagem
- GPT-4o-mini: ~$0.003 por imagem

### Anthropic Claude (Pago - $0.015 por imagem)

1. Acesse: https://console.anthropic.com/
2. Crie conta e adicione créditos
3. Vá em Settings → API Keys
4. Copie a chave (formato: `sk-ant-...`)

---

## Casos de Uso

### 1. Análise Rápida (1-3 subparcelas)

**Modelo recomendado:** Gemini Flash (gratuito)

```
Tempo estimado: 30-60 segundos por subparcela
Custo: $0 (gratuito)
Qualidade: Boa para maioria dos casos
```

### 2. Projeto Médio (10-30 subparcelas)

**Modelo recomendado:** Gemini Pro ou GPT-4o-mini

```
Tempo estimado: 5-15 minutos total
Custo: $0 (Gemini) ou $0.03-0.09 (GPT-4o-mini)
Qualidade: Alta precisão
```

### 3. Projeto Grande (50+ subparcelas)

**Modelo recomendado:** GPT-4o ou Claude Sonnet

```
Tempo estimado: 25-60 minutos
Custo: $0.50-1.50 (GPT-4o) ou $0.75-2.25 (Claude)
Qualidade: Máxima precisão e detalhamento
```

---

## Fluxo de Trabalho Recomendado

### Fase 1: Análise Inicial (Gemini - Gratuito)

1. Upload de todas imagens
2. Análise com **Gemini Flash + Template Default**
3. Configurar padronização: **Moderada**
4. Revisar resultados gerais

### Fase 2: Refinamento

1. Editar morfotipos no painel lateral
2. Unificar espécies similares manualmente
3. Adicionar taxonomia (família, gênero, espécie)
4. Complementar observações

### Fase 3: Reanálise Seletiva (Opcional)

Para subparcelas com resultados insatisfatórios:

1. Reconfigurar template (ex: separar gramíneas)
2. Tentar modelo premium (GPT-4o)
3. Ajustar limite de espécies

### Fase 4: Exportação

1. Revisar resumo final
2. Exportar Excel
3. Análises estatísticas externas (R, Python)

---

## Dicas para Melhores Resultados

### Qualidade de Imagens

✅ **BOM:**
- Foto de cima (zenital) a ~1.5m
- Iluminação natural uniforme
- Foco nítido em toda área
- Resolução mínima 2MP (1920x1080)

❌ **EVITAR:**
- Fotos oblíquas ou com perspectiva
- Sombras fortes ou luz direta
- Desfoque ou baixa resolução
- Reflexo de flash

### Configuração de Templates

| Vegetação | Template | Padronização | Solo/Serapilheira |
|-----------|----------|--------------|-------------------|
| **Gramado homogêneo** | Default | Agressiva | Não incluir |
| **Campo diverso** | Default | Moderada | Incluir solo |
| **Sub-bosque** | Regeneração | Conservadora | Incluir serapilheira |
| **Área reflorestada** | Reflorestamento | Moderada | Incluir ambos |
| **Cerrado** | Default | Conservadora | Incluir solo |

### Limite de Espécies

- **3-5**: Vegetação muito homogênea (pasto, gramado)
- **5-8** (padrão): Maioria dos casos
- **8-12**: Alta diversidade (mata, cerrado)
- **12-15**: Diversidade extrema (usar com Claude/GPT-4o)

---

## Solução de Problemas Comuns

### "Espécies muito genéricas"

**Causa:** IA não consegue diferenciar morfotipos
**Solução:**
1. Ativar **"Separar gramíneas e ciperáceas"**
2. Usar padronização **Conservadora**
3. Aumentar limite de espécies para 10-12
4. Tentar modelo mais avançado (Claude, GPT-4o)

### "Muitos morfotipos diferentes"

**Causa:** IA criando espécies para pequenas variações
**Solução:**
1. Usar padronização **Agressiva**
2. Reduzir limite de espécies para 5-6
3. Revisar manualmente e unificar similares

### "Solo exposto detectado como espécie"

**Causa:** Configuração incorreta do template
**Solução:**
1. Abrir modal de configuração (⚙️)
2. Desmarcar **"Incluir solo exposto"**
3. Reanalisar subparcelas afetadas

---

## Exemplos de Análise

### Exemplo 1: Pasto Manejado

**Imagem:** 3 subparcelas, predominância de gramíneas
**Configuração:**
```
Template: Default
Modelo: Gemini Flash
Padronização: Agressiva
Solo/Serapilheira: Não incluir
Limite: 3-5 espécies
```

**Resultado esperado:** 2-4 morfotipos de gramíneas + eventualmente dicotiledôneas

### Exemplo 2: Regeneração Natural

**Imagem:** 8 subparcelas, alta diversidade
**Configuração:**
```
Template: Regeneração
Modelo: Claude Sonnet
Padronização: Moderada
Solo/Serapilheira: Incluir serapilheira
Limite: 8-10 espécies
Separar gramíneas: Sim
```

**Resultado esperado:** 6-10 morfotipos diversos + serapilheira quantificada

---

## Integração com Análises Estatísticas

### Exportar para R

```r
library(readxl)
library(vegan)

# Importar dados
dados <- read_excel("Parcela_X_analise.xlsx", sheet = 1)

# Matriz espécie x subparcela
matriz <- xtabs(cobertura ~ Subparcela + Apelido, data = dados)

# Índices de diversidade
diversidade <- diversity(matriz, index = "shannon")
riqueza <- specnumber(matriz)
```

### Exportar para Python (Pandas)

```python
import pandas as pd

# Importar dados
df = pd.read_excel("Parcela_X_analise.xlsx", sheet_name=0)

# Análise por subparcela
resumo = df.groupby('Subparcela').agg({
    'Apelido': 'nunique',  # Riqueza
    'Cobertura': 'sum',     # Cobertura total
    'Altura': 'mean'        # Altura média
})
```

---

**💡 Dúvidas? Abra uma [Issue](../../issues) no GitHub!**
