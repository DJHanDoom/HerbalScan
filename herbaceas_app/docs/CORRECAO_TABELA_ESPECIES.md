# Correção: Tabela de Gerenciamento de Espécies Não Atualizada

## Data
13 de novembro de 2025

## Problema

Após adicionar uma espécie manualmente no modal "Ver e Editar", a espécie aparecia:
- ✅ Na lista do modal
- ✅ No card da subparcela
- ❌ **NÃO aparecia na tabela "Gerenciamento de Espécies"**

## Causa

A função `displaySpeciesTable()` usa `appState.especies` para popular a tabela:

```javascript
function displaySpeciesTable() {
    elements.speciesTbody.innerHTML = '';
    const especiesArray = Object.values(appState.especies);  // ← Lê daqui
    especiesArray.forEach(esp => {
        // Renderiza cada espécie
    });
}
```

Porém, a função `saveManualSpecies()` **não estava atualizando** `appState.especies`, apenas:
- ✅ `result.especies` (lista local do modal)
- ✅ Backend via API

## Solução

Adicionar atualização de `appState.especies` após adicionar a espécie.

**Arquivo**: `static/js/app.js` (linhas 3315-3330)

```javascript
// 7. Adicionar ao resultado local
result.especies.push(novaEspecie);
console.log(`✅ Espécie adicionada localmente. Total de espécies agora: ${result.especies.length}`);

// 7.5 CRITICAL FIX: Atualizar appState.especies para tabela de gerenciamento
if (!appState.especies[apelido]) {
    appState.especies[apelido] = {
        apelido_original: apelido,
        apelido_usuario: apelido,
        genero: genero || '',
        especie: '',
        familia: familia || '',
        observacoes: observacoes || '',
        ocorrencias: 1
    };
    console.log(`✅ Espécie "${apelido}" adicionada ao appState.especies`);
} else {
    // Se a espécie já existe (adicionada em outra subparcela), incrementar ocorrências
    appState.especies[apelido].ocorrencias++;
    console.log(`✅ Ocorrências de "${apelido}" incrementadas: ${appState.especies[apelido].ocorrencias}`);
}
```

## Resultado

Agora quando uma espécie é adicionada manualmente:

### Console do Navegador
```
✅ Espécie adicionada localmente. Total de espécies agora: 2
✅ Espécie "Gramínea Teste" adicionada ao appState.especies
🔄 Atualizando visualizações...
   ✓ loadViewerSpecies() chamada
   ✓ displaySubparcelas() chamada
   ✓ displaySpeciesTable() chamada  ← Agora tem dados!
```

### Interface
- ✅ Espécie aparece na lista do modal
- ✅ Espécie aparece no card da subparcela
- ✅ **Espécie aparece na tabela "Gerenciamento de Espécies"** ← CORRIGIDO!

## Casos de Uso

### Caso 1: Primeira ocorrência da espécie
```javascript
// Usuário adiciona "Gramínea Verde" pela primeira vez
appState.especies["Gramínea Verde"] = {
    apelido_original: "Gramínea Verde",
    apelido_usuario: "Gramínea Verde",
    genero: "Poaceae",
    familia: "Gramineae",
    observacoes: "",
    ocorrencias: 1  // ← Primeira vez
};
```

### Caso 2: Espécie já existe (em outra subparcela)
```javascript
// Usuário adiciona "Gramínea Verde" novamente em outra subparcela
appState.especies["Gramínea Verde"].ocorrencias++;  // 1 → 2
```

## Estrutura de Dados

### appState.especies
```javascript
{
    "Gramínea Verde": {
        apelido_original: "Gramínea Verde",
        apelido_usuario: "Gramínea Verde",
        genero: "Poaceae",
        familia: "Gramineae",
        observacoes: "",
        ocorrencias: 2  // Total em todas as subparcelas
    },
    "Ciperáceas": {
        apelido_original: "Ciperáceas",
        apelido_usuario: "Ciperáceas",
        genero: "Cyperus",
        familia: "Cyperaceae",
        observacoes: "",
        ocorrencias: 1
    }
}
```

### result.especies (lista local da subparcela)
```javascript
[
    {
        apelido: "Gramínea Verde",
        genero: "Poaceae",
        familia: "Gramineae",
        cobertura: 25,
        altura: 20,
        forma_vida: "Erva",
        indice: 1
    },
    {
        apelido: "Ciperáceas",
        genero: "Cyperus",
        familia: "Cyperaceae",
        cobertura: 15,
        altura: 10,
        forma_vida: "Erva",
        indice: 2
    }
]
```

## Como Testar

1. **Ativar modo manual**
2. **Abrir modal "Ver e Editar"**
3. **Adicionar espécie manual**:
   - Apelido: `Teste Tabela`
   - Gênero: `Testus`
   - Família: `Testaceae`
4. **Verificar console**:
   ```
   ✅ Espécie "Teste Tabela" adicionada ao appState.especies
   ✓ displaySpeciesTable() chamada
   ```
5. **Fechar modal**
6. **Ir para seção "3. Gerenciamento de Espécies"**
7. **Verificar**: Espécie "Teste Tabela" deve aparecer na tabela! ✅

## Arquivos Modificados

**static/js/app.js** (linhas 3315-3330):
- Adicionar espécie a `appState.especies` se não existir
- Incrementar `ocorrencias` se já existir
- Logs de debug

## Data de Implementação

13 de novembro de 2025
