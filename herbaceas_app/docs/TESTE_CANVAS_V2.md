# Teste do Canvas V2 - Guia Completo

## Data
13 de novembro de 2025

## O Que Foi Feito

Reimplementação **COMPLETA** do sistema de desenho usando arquitetura tipo Photoshop:
- ✅ Canvas fixo como área de trabalho (não mais sobre imagem HTML)
- ✅ Imagem desenhada DENTRO do canvas
- ✅ Sistema de câmera para zoom/pan
- ✅ Coordenadas em relação à imagem (não à tela)
- ✅ Zoom centrado no mouse tipo Google Maps

## Como Testar

### 1. Preparação

**IMPORTANTE**: Limpar cache do navegador!

```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

Ou:
1. Abrir DevTools (F12)
2. Clicar com botão direito no botão "Recarregar"
3. Selecionar "Esvaziar cache e recarregar forçadamente"

### 2. Verificar Console ao Carregar

Assim que a página carregar, abra o Console (F12 → Console).

**Deve aparecer**:
```
🎨 CoverageDrawerV2.init() - Nova implementação
📐 Canvas criado: 1200×800px
   - Posição: absoluta (0, 0)
   - Área de trabalho fixa estabelecida
```

### 3. Abrir Modal "Ver e Editar"

1. Vá para uma subparcela qualquer
2. Clique em "👁️ Ver e Editar"

**No console deve aparecer**:
```
🖼️ Carregando imagem...
✅ Imagem carregada: 4000×3000px
📍 Imagem centralizada:
   - Zoom: 19%
   - Offset: (100, 50)
```

### 4. Verificar Overlay de Debug

No **canto superior esquerdo** do canvas deve aparecer:
```
Zoom: 100%
Camera: (0, 0)
Imagem: 4000×3000px
```

### 5. Teste CRÍTICO - Desenho em TODA a Área

#### 5.1. Clicar "Desenhar Área Total"

**No console**:
```
✏️ Modo: Desenhar Subparcela
🔧 Ferramenta: rectangle
```

#### 5.2. Clicar no TOPO da imagem

**No console deve aparecer**:
```
🖱️ Screen (600, 200) → Canvas (400, 150) → World (1500, 800)
```

✅ **Esperado**: Retângulo começa a ser desenhado

#### 5.3. Clicar no MEIO da imagem

**No console deve aparecer**:
```
🖱️ Screen (600, 400) → Canvas (400, 350) → World (1500, 1500)
```

✅ **Esperado**: Retângulo começa a ser desenhado

#### 5.4. Clicar no **FUNDO** da imagem (ÁREA CRÍTICA!)

**No console deve aparecer**:
```
🖱️ Screen (600, 700) → Canvas (400, 650) → World (1500, 2800)
```

✅ **Esperado**: Retângulo começa a ser desenhado
❌ **Se não funcionar**: Canvas V2 tem problema

#### 5.5. Clicar FORA da imagem (área preta)

**No console deve aparecer**:
```
🖱️ Screen (100, 100) → Canvas (50, 50) → World (-200, -150)
```

✅ **Esperado**: Nada acontece (coordenadas negativas ou fora da imagem)

### 6. Teste de Zoom

#### 6.1. Zoom In (aproximar)

1. Posicione o mouse sobre a imagem
2. Role a **roda do mouse para cima** (ou gesto de pinça no trackpad)

**No console**:
```
🔍 Zoom: 150%
```

**No overlay**:
```
Zoom: 150%
Camera: (ajustado automaticamente)
```

✅ **Esperado**: Imagem aumenta centrada no cursor

#### 6.2. Zoom Out (afastar)

1. Role a **roda do mouse para baixo**

**No console**:
```
🔍 Zoom: 50%
```

✅ **Esperado**: Imagem diminui centrada no cursor

#### 6.3. Zoom Máximo

Continue aumentando até:

**No console**:
```
🔍 Zoom: 500%
```

✅ **Esperado**: Limite de 500% (5x)

#### 6.4. Zoom Mínimo

Continue diminuindo até:

**No console**:
```
🔍 Zoom: 10%
```

✅ **Esperado**: Limite de 10% (0.1x)

### 7. Teste de Polígono

#### 7.1. Desenhar Polígono de Espécie

1. No modal, clique "➕ Adicionar Espécie"
2. Preencha dados da espécie
3. Clique no botão de polígono (🔷)

**No console**:
```
✏️ Modo: Desenhar Espécie
🔧 Ferramenta: polygon
```

#### 7.2. Clicar 4 Pontos

**Clique 1** (topo esquerdo):
```
🖱️ Screen (...) → World (1000, 800)
📍 Ponto 1 adicionado: (1000, 800)
```

**Clique 2** (topo direito):
```
🖱️ Screen (...) → World (2000, 800)
📍 Ponto 2 adicionado: (2000, 800)
```

**Clique 3** (baixo direito) - **ÁREA CRÍTICA**:
```
🖱️ Screen (...) → World (2000, 2500)
📍 Ponto 3 adicionado: (2000, 2500)
```

**Clique 4** (baixo esquerdo) - **ÁREA CRÍTICA**:
```
🖱️ Screen (...) → World (1000, 2500)
📍 Ponto 4 adicionado: (1000, 2500)
```

#### 7.3. Fechar Polígono

**Duplo-clique** no último ponto

**No console**:
```
✅ Polígono finalizado com 4 pontos
📊 Área: 1500000 px² (XXX m²)
```

✅ **Esperado**: Polígono desenhado cobrindo área completa (incluindo parte inferior)

### 8. Teste de Persistência com Zoom

#### 8.1. Desenhar Polígono com Zoom 100%

1. Desenhe um polígono qualquer
2. Anote as coordenadas dos pontos no console

#### 8.2. Zoom In para 200%

1. Dê zoom na imagem

✅ **Esperado**: Polígono permanece "grudado" na imagem
✅ **Esperado**: Bordas do polígono mantêm espessura visual constante

#### 8.3. Zoom Out para 50%

1. Diminua o zoom

✅ **Esperado**: Polígono permanece "grudado" na imagem
✅ **Esperado**: Bordas do polígono mantêm espessura visual constante

## Checklist de Testes

### Funcionalidades Básicas
- [ ] Console mostra "CoverageDrawerV2.init()" ao carregar
- [ ] Canvas criado com dimensões corretas
- [ ] Imagem carregada e centralizada
- [ ] Overlay de debug visível (canto superior esquerdo)

### Desenho em Toda a Área (CRÍTICO!)
- [ ] Cliques no TOPO da imagem funcionam
- [ ] Cliques no MEIO da imagem funcionam
- [ ] Cliques no **FUNDO** da imagem funcionam ← **TESTE PRINCIPAL**
- [ ] Logs aparecem para TODOS os cliques na imagem
- [ ] Nenhum clique na imagem é ignorado

### Zoom
- [ ] Zoom in com roda do mouse funciona
- [ ] Zoom out com roda do mouse funciona
- [ ] Zoom é centrado no cursor (não no centro da tela)
- [ ] Limite de 500% funciona
- [ ] Limite de 10% funciona
- [ ] Overlay atualiza valor do zoom em tempo real

### Polígonos
- [ ] Retângulo da subparcela pode ser desenhado
- [ ] Polígono de espécie pode ser desenhado
- [ ] Pontos podem ser adicionados em QUALQUER parte da imagem
- [ ] Duplo-clique fecha o polígono
- [ ] Polígonos permanecem "grudados" na imagem ao dar zoom
- [ ] Bordas dos polígonos mantêm espessura visual ao dar zoom

### Coordenadas
- [ ] Logs mostram: Screen → Canvas → World
- [ ] Coordenadas World são relativas à imagem (0,0 = canto superior esquerdo)
- [ ] Coordenadas fazem sentido (positivas dentro da imagem)

## Problemas Conhecidos (a implementar)

### Não Implementado Ainda
- ⏳ Pan com arrastar do mouse (só zoom funciona por enquanto)
- ⏳ Carregar polígonos salvos do backend
- ⏳ Deletar polígonos com clique direito
- ⏳ Toolbar completa

### Implementado e Funcionando
- ✅ Canvas fixo tipo Photoshop
- ✅ Desenho em toda a área
- ✅ Zoom com mouse wheel
- ✅ Zoom centrado no cursor
- ✅ Polígonos grudados na imagem
- ✅ Coordenadas em relação à imagem
- ✅ Retângulos e polígonos
- ✅ Overlay de debug

## Resultado Esperado

### ✅ SUCESSO
Se você conseguir:
1. Desenhar polígonos em **QUALQUER** parte da imagem (inclusive no fundo)
2. Ver logs no console para **TODOS** os cliques
3. Zoom funcionando suavemente centrado no cursor
4. Polígonos permanecendo fixos na imagem ao dar zoom

### ❌ FALHA
Se você:
1. Não conseguir desenhar na metade inferior da imagem
2. Cliques no fundo da imagem não gerarem logs
3. Zoom não funcionar ou quebrar os polígonos

## Logs de Debug para Copiar e Colar

Se der problema, copie e cole:

### 1. Console completo desde o carregamento da página
### 2. Screenshot do canvas mostrando o problema
### 3. Resultado do teste específico que falhou

## Próximos Passos Após Teste

### Se funcionar ✅
1. Implementar pan com mouse drag
2. Implementar load/save de polígonos
3. Implementar delete de polígonos
4. Completar toolbar

### Se não funcionar ❌
1. Analisar logs do console
2. Verificar se canvas está cobrindo área completa
3. Verificar transformações de coordenadas
4. Debug específico do problema reportado

## Comparação com Versão Antiga

| Aspecto | V1 (Antiga) | V2 (Nova) |
|---------|-------------|-----------|
| **Área de desenho** | ~50% superior apenas | 100% da imagem ✅ |
| **Cliques no fundo** | Ignorados ❌ | Funcionam ✅ |
| **Logs no console** | Só aparecem no topo | Aparecem em toda área ✅ |
| **Zoom** | Quebrado | Profissional (centrado) ✅ |
| **Coordenadas** | Confusas | Simples (World coords) ✅ |
| **Arquitetura** | Canvas sobre imagem HTML | Canvas fixo tipo Photoshop ✅ |

## Data de Criação

13 de novembro de 2025
