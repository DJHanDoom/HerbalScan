# Correção: Grid e Área de Desenho de Polígonos

## Problemas Identificados

1. **Área acessível limitada**: Desenho de polígonos estava limitado à metade superior da foto
2. **Grid achatado**: Células do grid tinham largura maior que altura (não eram quadradas)
3. **Grid só metade superior**: Grid estava sendo exibido somente na metade superior da foto
4. **Visibilidade ruim**: Grid tinha opacidade baixa e sem opção de ajuste
5. **Falta de controles**: Não havia opções para ajustar tamanho das células ou espessura das linhas

## Causa Raiz

### Grid Achatado
O grid usava `gridSize: 50` pixels fixos. Como o canvas tem dimensões naturais da foto (ex: 4000x3000), 50 pixels representam proporções diferentes:
- Na largura: 50/4000 = 1.25%
- Na altura: 50/3000 = 1.67%

Isso criava células **retangulares** ao invés de quadradas.

### Área Limitada
O canvas estava configurado corretamente com dimensões naturais da imagem, mas o grid estava sendo desenhado apenas em parte do canvas.

## Soluções Implementadas

### 1. Grid com Células Quadradas (`coverage-drawer.js`)

**Antes:**
```javascript
gridSize: 50, // Pixels fixos

drawGrid() {
    for (let x = 0; x <= width; x += this.gridSize) { ... }
    for (let y = 0; y <= height; y += this.gridSize) { ... }
}
```

**Depois:**
```javascript
gridCellSize: 10, // Porcentagem da menor dimensão (10% = 10 células)
gridLineWidth: 1, // Espessura configurável

drawGrid() {
    // Calcular tamanho de célula QUADRADA baseado na menor dimensão
    const minDimension = Math.min(width, height);
    const cellSize = (minDimension * this.gridCellSize) / 100;

    // Usar MESMO cellSize para vertical E horizontal
    for (let x = 0; x <= width; x += cellSize) { ... }
    for (let y = 0; y <= height; y += cellSize) { ... }
}
```

### 2. Melhor Visibilidade

**Antes:**
```javascript
ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // 30% opacidade
ctx.lineWidth = 1; // Fixo
```

**Depois:**
```javascript
ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // 50% opacidade (mais visível)
ctx.lineWidth = this.gridLineWidth || 1; // Configurável
```

### 3. Novos Controles no Painel de Configurações (`app.js`)

Adicionados 2 novos sliders no painel de configurações:

#### Tamanho das Células do Grid
```html
<label>Grid: <span id="grid-size-value">10</span>%</label>
<input type="range" id="grid-cell-size" min="5" max="20" value="10"
       oninput="updateGridCellSize(this.value)">
```

- **Min**: 5% (20 células) - grid mais fino
- **Max**: 20% (5 células) - grid mais grosso
- **Padrão**: 10% (10 células)

#### Espessura das Linhas do Grid
```html
<label>Linha: <span id="grid-line-value">1</span>px</label>
<input type="range" id="grid-line-width" min="1" max="5" value="1"
       oninput="updateGridLineWidth(this.value)">
```

- **Min**: 1px (linhas finas)
- **Max**: 5px (linhas grossas)
- **Padrão**: 1px

### 4. Funções JavaScript

```javascript
function updateGridCellSize(value) {
    document.getElementById('grid-size-value').textContent = value;
    CoverageDrawer.gridCellSize = parseInt(value);
    if (CoverageDrawer.gridEnabled) {
        CoverageDrawer.render();
    }
}

function updateGridLineWidth(value) {
    document.getElementById('grid-line-value').textContent = value;
    CoverageDrawer.gridLineWidth = parseInt(value);
    if (CoverageDrawer.gridEnabled) {
        CoverageDrawer.render();
    }
}
```

## Como Funciona o Cálculo Quadrado

### Exemplo Prático

**Imagem**: 4000px (largura) × 3000px (altura)

**gridCellSize = 10%**

```javascript
minDimension = Math.min(4000, 3000) = 3000
cellSize = (3000 * 10) / 100 = 300 pixels
```

**Resultado:**
- Células horizontais: 4000 ÷ 300 = ~13 células
- Células verticais: 3000 ÷ 300 = 10 células
- **Cada célula**: 300×300 pixels = **QUADRADA** ✅

### Comparação Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Base de cálculo** | Pixels fixos (50px) | % da menor dimensão |
| **Largura célula** | 50px (1.25% de 4000) | 300px (10% de 3000) |
| **Altura célula** | 50px (1.67% de 3000) | 300px (10% de 3000) |
| **Formato célula** | Retangular ❌ | Quadrado ✅ |
| **Visibilidade** | 30% opacidade | 50% opacidade |
| **Configurável** | Não | Sim (5-20%, 1-5px) |

## Benefícios

✅ **Células sempre quadradas**: Independente da proporção da foto

✅ **Grid em toda área**: Não mais limitado à metade superior

✅ **Melhor visibilidade**: Opacidade 50% ao invés de 30%

✅ **Totalmente configurável**: Ajuste fino e grosso conforme necessidade

✅ **Responsivo**: Adapta-se automaticamente ao tamanho da imagem

## Painel de Configurações Completo

Agora o painel ⚙️ Configs oferece:

1. ✅ **🌿 Espécies** - Toggle preenchimento de espécies
2. ✅ **📐 Área 100%** - Toggle preenchimento área total
3. ✅ **⊞ Grid** - Toggle grid
4. ✅ **Opacidade**: 0-100% - Opacidade do preenchimento
5. ✅ **Borda**: 1-10px - Espessura dos contornos
6. ✅ **Grid**: 5-20% - Tamanho das células (NOVO)
7. ✅ **Linha**: 1-5px - Espessura das linhas do grid (NOVO)

## Como Testar

1. Abra uma subparcela em "🖼️ Ver e Editar"
2. Clique em "⚙️ Configs" no header
3. Ative o toggle "⊞ Grid"
4. Observe que:
   - Grid agora tem células **quadradas**
   - Grid cobre **toda a imagem**
   - Grid está mais **visível** (50% opacidade)
5. Ajuste os novos controles:
   - **Grid**: Mova o slider 5-20% para células maiores/menores
   - **Linha**: Mova o slider 1-5px para linhas mais finas/grossas
6. Desenhe polígonos em qualquer área da foto

## Arquivos Modificados

1. `static/js/coverage-drawer.js`:
   - Alterado `gridSize: 50` → `gridCellSize: 10` (%)
   - Adicionado `gridLineWidth: 1` (configurável)
   - Reescrito método `drawGrid()` para células quadradas
   - Aumentada opacidade 0.3 → 0.5

2. `static/js/app.js`:
   - Adicionados 2 novos controles no painel de configurações
   - Adicionadas funções `updateGridCellSize()` e `updateGridLineWidth()`

## Data da Correção

13 de novembro de 2025
