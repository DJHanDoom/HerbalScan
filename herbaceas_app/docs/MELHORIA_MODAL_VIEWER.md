# Melhoria: Modal "Ver e Editar" Maximizado

## Objetivo

Melhorar o modal "Ver e Editar" para ocupar melhor a tela e exibir a foto no maior tamanho possível, inspirado no layout do Pivotal.

## Mudanças Implementadas

### 1. Modal Maximizado (`style.css`)

**Antes:**
- Largura: 95vw
- Altura: 92vh
- Max-width: 1800px

**Depois:**
- Largura: **98vw** (quase tela cheia)
- Altura: **98vh** (quase tela cheia)
- Max-width: **none** (sem limite de largura)
- Border-radius reduzido de 16px para 8px

### 2. Proporção Imagem vs Lista

**Antes:**
- Imagem: 60% (flex: 6)
- Painel de edição: 40% (flex: 4)

**Depois:**
- Imagem: **75%** (flex: 7.5)
- Painel de edição: **25%** (flex: 2.5)
- Min-width painel: 320px (garante usabilidade)

### 3. Imagem em Tamanho Máximo

**Antes:**
```css
#viewer-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
```

**Depois:**
```css
#viewer-image {
    width: 100%;              /* Ocupa largura completa */
    height: 100%;             /* Ocupa altura completa */
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;      /* Mantém proporção */
}

.viewer-image-container {
    width: 100%;
    height: 100%;
}
```

### 4. Header Mais Compacto

**Antes:**
- Padding: 20px 25px
- Font-size título: 1.4rem

**Depois:**
- Padding: **12px 20px** (40% menor)
- Font-size título: **1.2rem**
- Border reduzido de 3px para 2px

### 5. Controles Otimizados

#### Zoom Controls
- Padding reduzido: 10px → **6px 8px**
- Bottom: 20px → **12px**
- Right: 20px → **12px**
- Botões: 40px → **32px**
- Font-size: 1.3rem → **1.1rem**
- Background: rgba(0,0,0,0.7) → **rgba(0,0,0,0.8)** (mais opaco)

#### Setas de Navegação
- Tamanho: 60px → **50px**
- Border: 3px → **2px**
- Font-size: 2rem → **1.8rem**
- Padding: 20px → **12px**

#### Indicador de Posição
- Top: 20px → **12px**
- Padding: 10px 20px → **6px 16px**
- Font-size: 1.1rem → **0.95rem**

#### Painel de Edição Header
- Padding: 20px → **12px 16px**

## Benefícios

✅ **Mais espaço para visualização**: Modal ocupa 98% da tela ao invés de 95%

✅ **Imagem maior**: 75% da largura ao invés de 60% (25% mais espaço)

✅ **Melhor aproveitamento**: Controles compactos liberam mais área útil

✅ **Visual limpo**: Inspirado no Pivotal - foco na imagem

✅ **Usabilidade mantida**: Painel lateral ainda tem min-width de 320px

## Layout Final

```
┌─────────────────────────────────────────────────────────┐
│ Header Compacto (12px padding)                          │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│                              │                          │
│                              │   Lista de Espécies      │
│        IMAGEM                │   (25% - min 320px)      │
│        (75%)                 │                          │
│                              │                          │
│                              │                          │
└──────────────────────────────┴──────────────────────────┘
```

## Como Testar

1. Abra a aplicação
2. Clique em "🖼️ Ver e Editar" em qualquer subparcela
3. Observe que:
   - O modal agora ocupa quase toda a tela
   - A imagem está muito maior
   - Os controles são mais compactos
   - O layout é similar ao Pivotal

## Arquivos Modificados

- `static/css/style.css`: Estilos do modal viewer otimizados

## Data da Melhoria

13 de novembro de 2025
