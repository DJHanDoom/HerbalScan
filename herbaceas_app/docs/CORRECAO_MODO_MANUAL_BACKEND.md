# Correção: Modo Manual - Backend

## Data
13 de novembro de 2025

## Problema

Adição de espécies no modo manual retornava erro 404:

```
POST /api/parcela/Parcela_1/subparcela/1/especie HTTP/1.1" 404
{
  "error": "Subparcela não encontrada"
}
```

## Causa Raiz

O backend esperava que as subparcelas existissem em `analysis_data['parcelas'][parcela]['subparcelas']`, mas no **modo manual** essa estrutura NÃO estava sendo criada.

### Fluxo do Modo Manual (ANTES - Quebrado)

1. **Frontend**: Usuário clica "Modo Manual"
2. **Frontend**: Chama `GET /api/parcela/Parcela_1/images`
3. **Backend**: Retorna lista de imagens
4. **Frontend**: Cria `appState.analysisResults` com subparcelas
5. **Frontend**: Usuário tenta adicionar espécie
6. **Frontend**: Chama `POST /api/parcela/Parcela_1/subparcela/1/especie`
7. **Backend**: ❌ Verifica `if subparcela not in parcela_data.get('subparcelas', {})`
8. **Backend**: ❌ Retorna 404 "Subparcela não encontrada"

**Problema**: O backend nunca criou as subparcelas, apenas o frontend tinha essa informação!

## Solução

Modificar o endpoint `/api/parcela/<parcela_nome>/images` para **criar as subparcelas vazias no backend** quando retornar a lista de imagens.

### Código Modificado

**Arquivo**: `app.py` (linhas 2972-3004)

```python
@app.route('/api/parcela/<parcela_nome>/images', methods=['GET'])
def get_parcela_images(parcela_nome):
    """Retorna lista de imagens de uma parcela para modo manual"""
    if parcela_nome not in analysis_data['parcelas']:
        return jsonify({'error': 'Parcela não encontrada'}), 404

    parcela = analysis_data['parcelas'][parcela_nome]
    images_list = []

    # CRITICAL FIX: Criar estrutura de subparcelas para modo manual
    if 'subparcelas' not in parcela:
        parcela['subparcelas'] = {}

    # Processar lista de imagens
    for idx, img_info in enumerate(parcela.get('images', []), 1):
        if isinstance(img_info, dict):
            img_path = img_info.get('path', '')
        else:
            img_path = str(img_info)

        if img_path and os.path.exists(img_path):
            images_list.append({
                'subparcela': idx,
                'path': img_path,
                'filename': os.path.basename(img_path)
            })

            # CRITICAL FIX: Criar subparcela vazia no backend se não existir
            if idx not in parcela['subparcelas']:
                parcela['subparcelas'][idx] = {
                    'nome': f'Subparcela {idx}',
                    'image': os.path.basename(img_path),
                    'especies': [],
                    'manual_mode': True
                }
                print(f"✅ Subparcela {idx} criada no backend para modo manual")

    # Garantir que especies_unificadas existe para esta parcela
    if parcela_nome not in analysis_data['especies_unificadas']:
        analysis_data['especies_unificadas'][parcela_nome] = {}

    print(f"📊 Modo manual: {len(images_list)} subparcelas preparadas para parcela {parcela_nome}")

    return jsonify({
        'success': True,
        'images': images_list,
        'total': len(images_list)
    })
```

### Mudanças Chave

1. **Criar dicionário de subparcelas**:
   ```python
   if 'subparcelas' not in parcela:
       parcela['subparcelas'] = {}
   ```

2. **Criar cada subparcela vazia**:
   ```python
   if idx not in parcela['subparcelas']:
       parcela['subparcelas'][idx] = {
           'nome': f'Subparcela {idx}',
           'image': os.path.basename(img_path),
           'especies': [],
           'manual_mode': True
       }
   ```

3. **Garantir especies_unificadas**:
   ```python
   if parcela_nome not in analysis_data['especies_unificadas']:
       analysis_data['especies_unificadas'][parcela_nome] = {}
   ```

## Fluxo do Modo Manual (DEPOIS - Corrigido)

1. **Frontend**: Usuário clica "Modo Manual"
2. **Frontend**: Chama `GET /api/parcela/Parcela_1/images`
3. **Backend**: ✅ Cria `parcela['subparcelas']` se não existir
4. **Backend**: ✅ Para cada imagem, cria `parcela['subparcelas'][idx]` vazia
5. **Backend**: ✅ Garante que `especies_unificadas[parcela]` existe
6. **Backend**: Retorna lista de imagens
7. **Frontend**: Cria `appState.analysisResults` com subparcelas
8. **Frontend**: Usuário tenta adicionar espécie
9. **Frontend**: Chama `POST /api/parcela/Parcela_1/subparcela/1/especie`
10. **Backend**: ✅ Verifica `if subparcela not in parcela_data.get('subparcelas', {})`
11. **Backend**: ✅ Encontra a subparcela criada anteriormente
12. **Backend**: ✅ Adiciona espécie com sucesso
13. **Backend**: ✅ Retorna 200 OK

## Estrutura de Dados Criada

Quando o modo manual é ativado com 3 imagens:

```python
analysis_data = {
    'parcelas': {
        'Parcela_1': {
            'images': [
                {'path': '/uploads/Parcela_1/IMG_001.jpg'},
                {'path': '/uploads/Parcela_1/IMG_002.jpg'},
                {'path': '/uploads/Parcela_1/IMG_003.jpg'}
            ],
            'subparcelas': {  # ✅ CRIADO pelo endpoint
                1: {
                    'nome': 'Subparcela 1',
                    'image': 'IMG_001.jpg',
                    'especies': [],
                    'manual_mode': True
                },
                2: {
                    'nome': 'Subparcela 2',
                    'image': 'IMG_002.jpg',
                    'especies': [],
                    'manual_mode': True
                },
                3: {
                    'nome': 'Subparcela 3',
                    'image': 'IMG_003.jpg',
                    'especies': [],
                    'manual_mode': True
                }
            }
        }
    },
    'especies_unificadas': {
        'Parcela_1': {}  # ✅ CRIADO pelo endpoint
    }
}
```

## Logs do Servidor

Quando o modo manual é ativado:

```
✅ Subparcela 1 criada no backend para modo manual
✅ Subparcela 2 criada no backend para modo manual
✅ Subparcela 3 criada no backend para modo manual
📊 Modo manual: 3 subparcelas preparadas para parcela Parcela_1
```

Quando uma espécie é adicionada:

```
✅ Espécie 'Gramínea Teste' adicionada à subparcela 1 da parcela Parcela_1
   Total de ocorrências: 1
```

## Como Testar

1. **Reiniciar o servidor Flask**:
   ```bash
   # Parar o servidor (Ctrl+C)
   # Iniciar novamente
   python app.py
   ```

2. **No navegador**:
   - Upload de imagens
   - Clicar "📝 Modo Manual (sem IA)"
   - **Verificar console do servidor**:
     ```
     ✅ Subparcela 1 criada no backend para modo manual
     ✅ Subparcela 2 criada no backend para modo manual
     📊 Modo manual: 2 subparcelas preparadas
     ```

3. **Adicionar espécie**:
   - Abrir modal "Ver e Editar"
   - "+ Adicionar Espécie" → aba "Manual"
   - Preencher e clicar "✓ Adicionar Espécie"
   - **Verificar console do servidor**:
     ```
     ✅ Espécie 'Nome' adicionada à subparcela 1 da parcela Parcela_1
     ```
   - **Verificar console do navegador**:
     ```
     📥 Resposta HTTP: Status 200 (OK)
     ✅ saveManualSpecies() CONCLUÍDA COM SUCESSO
     ```

## Comparação

| Aspecto | ANTES ❌ | DEPOIS ✅ |
|---------|----------|-----------|
| Subparcelas criadas no backend | NÃO | SIM |
| especies_unificadas inicializada | NÃO | SIM |
| POST /especie | 404 | 200 OK |
| Espécies salvas | NÃO | SIM |

## Arquivos Modificados

1. **app.py** (linhas 2972-3004):
   - Criar `parcela['subparcelas']` se não existir
   - Criar cada `parcela['subparcelas'][idx]` vazia
   - Garantir `especies_unificadas[parcela]` existe
   - Logs de debug

## IMPORTANTE

⚠️ **É necessário reiniciar o servidor Flask** após essa modificação para que o código atualizado seja carregado!

```bash
# No terminal onde o Flask está rodando:
# 1. Parar (Ctrl+C)
# 2. Iniciar novamente
python app.py
```

## Data de Implementação

13 de novembro de 2025
