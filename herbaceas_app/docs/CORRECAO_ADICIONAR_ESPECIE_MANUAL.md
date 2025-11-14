# Correção: Adicionar Espécie no Modo Manual

## Problema

Função "adicionar espécie" não funcionava no modo manual - espécies não eram salvas na subparcela.

## Causa Raiz

O endpoint `/api/parcela/<parcela>/subparcela/<int:subparcela>/especie` tinha 2 problemas:

### 1. Estrutura de Dados Incorreta

**Problema**: Código assumia que `especies_unificadas` era um dicionário plano:
```python
# ERRADO ❌
if apelido not in analysis_data['especies_unificadas']:
    analysis_data['especies_unificadas'][apelido] = {...}
```

**Realidade**: A estrutura é aninhada por parcela (conforme implementação em `analyze_parcela`):
```python
analysis_data['especies_unificadas'][parcela][apelido] = {...}
```

### 2. Campos Faltantes

**Problema**: Espécie criada sem campos importantes:
```python
# ANTES - Campos faltando ❌
nova_especie = {
    'apelido': data.get('apelido', 'Nova Espécie'),
    'cobertura': data.get('cobertura', 0),
    'altura': data.get('altura', 0),
    'forma_vida': data.get('forma_vida', 'Erva'),
    'indice': len(subparcela_data['especies']) + 1
}
# Faltando: genero, familia, observacoes
```

## Soluções Implementadas

### 1. Estrutura Correta de `especies_unificadas` (`app.py:2402-2417`)

```python
# Garantir que especies_unificadas está aninhado por parcela
if parcela not in analysis_data['especies_unificadas']:
    analysis_data['especies_unificadas'][parcela] = {}

if apelido not in analysis_data['especies_unificadas'][parcela]:
    analysis_data['especies_unificadas'][parcela][apelido] = {
        'apelido_original': apelido,
        'apelido_usuario': apelido,
        'genero': data.get('genero', ''),
        'especie': '',
        'familia': data.get('familia', ''),
        'observacoes': data.get('observacoes', ''),
        'ocorrencias': 0
    }

analysis_data['especies_unificadas'][parcela][apelido]['ocorrencias'] += 1
```

**Mudanças**:
- ✅ Verifica se `parcela` existe em `especies_unificadas`
- ✅ Acessa `especies_unificadas[parcela][apelido]`
- ✅ Adiciona campos `genero`, `familia`, `observacoes` do form

### 2. Espécie Completa (`app.py:2389-2398`)

```python
nova_especie = {
    'apelido': data.get('apelido', 'Nova Espécie'),
    'genero': data.get('genero', ''),          # NOVO ✅
    'familia': data.get('familia', ''),        # NOVO ✅
    'observacoes': data.get('observacoes', ''), # NOVO ✅
    'cobertura': data.get('cobertura', 0),
    'altura': data.get('altura', 0),
    'forma_vida': data.get('forma_vida', 'Erva'),
    'indice': len(subparcela_data['especies']) + 1
}
```

**Mudanças**:
- ✅ Adicionado campo `genero`
- ✅ Adicionado campo `familia`
- ✅ Adicionado campo `observacoes`

### 3. Logs de Debug (`app.py:2419-2420`)

```python
print(f"✅ Espécie '{apelido}' adicionada à subparcela {subparcela} da parcela {parcela}")
print(f"   Total de ocorrências: {analysis_data['especies_unificadas'][parcela][apelido]['ocorrencias']}")
```

**Benefício**: Permite verificar no console do servidor se a espécie foi salva

### 4. Mensagem de Sucesso (`app.py:2422-2426`)

```python
return jsonify({
    'success': True,
    'especie': nova_especie,
    'message': f'Espécie {apelido} adicionada com sucesso'  # NOVO ✅
})
```

## Fluxo Completo

### Frontend → Backend

**1. Usuário preenche formulário manual**:
```
Apelido: Gramínea Verde
Gênero: Poaceae
Família: Gramineae
Cobertura: 20%
Altura: 15cm
Forma de Vida: Erva
Observações: Folhas lineares
```

**2. Frontend envia POST**:
```javascript
fetch('/api/parcela/P09/subparcela/1/especie', {
    method: 'POST',
    body: JSON.stringify({
        apelido: 'Gramínea Verde',
        genero: 'Poaceae',
        familia: 'Gramineae',
        cobertura: 20,
        altura: 15,
        forma_vida: 'Erva',
        observacoes: 'Folhas lineares'
    })
})
```

**3. Backend processa**:
```python
# Cria nova_especie com TODOS os campos
nova_especie = {
    'apelido': 'Gramínea Verde',
    'genero': 'Poaceae',       # ✅
    'familia': 'Gramineae',    # ✅
    'observacoes': '...',      # ✅
    'cobertura': 20,
    'altura': 15,
    'forma_vida': 'Erva',
    'indice': 3
}

# Adiciona à subparcela
subparcela_data['especies'].append(nova_especie)

# Atualiza especies_unificadas[parcela][apelido]
analysis_data['especies_unificadas']['P09']['Gramínea Verde'] = {...}
```

**4. Backend retorna**:
```json
{
    "success": true,
    "especie": {...},
    "message": "Espécie Gramínea Verde adicionada com sucesso"
}
```

**5. Frontend atualiza interface**:
```javascript
// Adiciona localmente
result.especies.push(novaEspecie);

// Recarrega visualizações
loadViewerSpecies();
displaySubparcelas();
displaySpeciesTable();

// Fecha formulário
toggleAddSpeciesForm();
```

## Estrutura de Dados

### Antes (Incorreto ❌)

```javascript
analysis_data = {
    'especies_unificadas': {
        'Gramínea Verde': {
            'apelido_original': 'Gramínea Verde',
            'ocorrencias': 1
        }
    }
}
```

### Depois (Correto ✅)

```javascript
analysis_data = {
    'especies_unificadas': {
        'P09': {  // ← Aninhado por parcela
            'Gramínea Verde': {
                'apelido_original': 'Gramínea Verde',
                'apelido_usuario': 'Gramínea Verde',
                'genero': 'Poaceae',
                'familia': 'Gramineae',
                'observacoes': 'Folhas lineares',
                'ocorrencias': 1
            }
        }
    },
    'parcelas': {
        'P09': {
            'subparcelas': {
                1: {
                    'especies': [
                        {
                            'apelido': 'Gramínea Verde',
                            'genero': 'Poaceae',
                            'familia': 'Gramineae',
                            'observacoes': 'Folhas lineares',
                            'cobertura': 20,
                            'altura': 15,
                            'forma_vida': 'Erva',
                            'indice': 1
                        }
                    ]
                }
            }
        }
    }
}
```

## Como Testar

### Teste Manual Completo

1. **Abrir modal "Ver e Editar"**:
   - Clique em "🖼️ Ver e Editar" em qualquer subparcela

2. **Adicionar espécie manual**:
   - Clique "+ Adicionar Espécie"
   - Selecione aba "✏️ Manual"
   - Preencha:
     - Apelido: `Gramínea Teste`
     - Gênero: `Poaceae`
     - Família: `Gramineae`
     - Cobertura: `25`
     - Altura: `20`
     - Forma de Vida: `Erva`
     - Observações: `Teste de adição manual`

3. **Clicar "✓ Adicionar Espécie"**

4. **Verificar no console do navegador**:
   ```
   🌿 saveManualSpecies() chamada
      Dados: Gramínea Teste, 25%, 20cm, Erva
      Subparcela: 1, Parcela: P09
      Enviando para API...
      Resposta da API: {success: true, message: "..."}
      ✅ Espécie adicionada localmente. Total: 4
      Fechando formulário...
   ```

5. **Verificar no console do servidor**:
   ```
   ✅ Espécie 'Gramínea Teste' adicionada à subparcela 1 da parcela P09
      Total de ocorrências: 1
   ```

6. **Confirmar resultados**:
   - [x] Formulário fecha automaticamente
   - [x] Espécie aparece na lista do modal
   - [x] Espécie aparece na tabela de espécies
   - [x] Espécie aparece no card da subparcela
   - [x] Gênero e família estão preenchidos

## Logs de Debug

### Frontend (Console do Navegador)
```
🌿 saveManualSpecies() chamada
   Dados: Gramínea Teste, 25%, 20cm, Erva
   Subparcela: 1, Parcela: P09
   Enviando para API...
   Resposta da API: {success: true, especie: {...}, message: "..."}
   ✅ Espécie adicionada localmente. Total: 4
   Fechando formulário...
```

### Backend (Console do Servidor)
```
✅ Espécie 'Gramínea Teste' adicionada à subparcela 1 da parcela P09
   Total de ocorrências: 1
```

## Arquivos Modificados

**app.py** (linhas 2387-2426):
- Adicionados campos `genero`, `familia`, `observacoes` à `nova_especie`
- Corrigida estrutura de `especies_unificadas` para aninhamento por parcela
- Adicionados logs de debug
- Adicionada mensagem de sucesso no retorno

## Data da Correção

13 de novembro de 2025
