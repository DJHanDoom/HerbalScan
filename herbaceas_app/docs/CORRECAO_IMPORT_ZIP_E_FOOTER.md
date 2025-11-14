# Correções: Importação de ZIP e Footer Visível

## Problemas Corrigidos

1. ✅ **Erro ao importar ZIP**: "Arquivo analysis_data.json não encontrado no ZIP"
2. ✅ **Footer de exportação oculto**: Usuário não podia importar projeto sem fazer análise primeiro

## Problema 1: Importação de ZIP Falhando

### Causa

O código de importação procurava `analysis_data.json` apenas no diretório raiz do ZIP:

```python
# ANTES - Procurava só na raiz ❌
json_path = os.path.join(temp_dir, 'analysis_data.json')
if not os.path.exists(json_path):
    return jsonify({'error': 'Arquivo analysis_data.json não encontrado no ZIP'}), 400
```

Alguns programas de compactação podem criar estruturas diferentes ou adicionar pastas extras ao extrair.

### Solução

Busca recursiva do arquivo JSON e diretório de imagens (`app.py:3441-3507`):

#### 1. Logs de Debug do Conteúdo do ZIP

```python
# Listar conteúdo do ZIP
print("📦 Conteúdo do ZIP:")
for name in zip_ref.namelist():
    print(f"   - {name}")

# Listar arquivos extraídos
print(f"\n📁 Arquivos em {temp_dir}:")
for root, dirs, files in os.walk(temp_dir):
    for file in files:
        rel_path = os.path.relpath(os.path.join(root, file), temp_dir)
        print(f"   - {rel_path}")
```

**Benefício**: Permite diagnosticar problemas de estrutura do ZIP

#### 2. Busca Recursiva do JSON

```python
# Procurar em toda árvore de diretórios
if not os.path.exists(json_path):
    print(f"⚠️ analysis_data.json não encontrado em {json_path}")
    # Procurar recursivamente
    for root, dirs, files in os.walk(temp_dir):
        if 'analysis_data.json' in files:
            json_path = os.path.join(root, 'analysis_data.json')
            print(f"✓ Encontrado em: {json_path}")
            break
    else:
        return jsonify({'error': 'Arquivo analysis_data.json não encontrado no ZIP'}), 400
```

#### 3. Busca Recursiva do Diretório de Imagens

```python
# Procurar diretório 'images' (pode estar no temp_dir ou em subdiretório)
images_dir = os.path.join(temp_dir, 'images')

if not os.path.exists(images_dir):
    for root, dirs, files in os.walk(temp_dir):
        if 'images' in dirs:
            images_dir = os.path.join(root, 'images')
            print(f"✓ Diretório de imagens encontrado em: {images_dir}")
            break
```

#### 4. Logs Detalhados de Cópia de Imagens

```python
if os.path.exists(images_dir):
    print(f"📷 Copiando imagens de {images_dir} para {upload_dir}")
    for filename in os.listdir(images_dir):
        src = os.path.join(images_dir, filename)
        if os.path.isfile(src):  # Só copiar arquivos, não diretórios
            dst = os.path.join(upload_dir, filename)
            shutil.copy2(src, dst)
            image_mapping[filename] = dst
            print(f"   ✓ {filename}")
    print(f"✓ {len(image_mapping)} imagens copiadas")
else:
    print(f"⚠️ Diretório de imagens não encontrado")
```

## Problema 2: Footer de Exportação Oculto

### Causa

O footer estava com `display: none` por padrão:

```html
<!-- ANTES ❌ -->
<footer id="export-footer" style="display: none;">
```

Isso impedia o usuário de:
- Importar um projeto existente sem fazer uma nova análise
- Ver os botões de exportação disponíveis

### Solução

Footer visível desde o início (`index.html:147`):

```html
<!-- DEPOIS ✅ -->
<footer id="export-footer" style="display: block;">
```

### Benefícios

✅ **Workflow mais flexível**: Usuário pode importar projeto ZIP logo ao abrir a aplicação

✅ **UX melhorada**: Botões de ação sempre visíveis e acessíveis

✅ **Acesso direto**: Não precisa fazer análise para importar dados

## Estrutura do ZIP Exportado

O ZIP criado tem a seguinte estrutura:

```
parcela_2025-11-13.zip
├── analysis_data.json
├── images/
│   ├── IMG_001.jpg
│   ├── IMG_002.jpg
│   └── IMG_003.jpg
└── README.md
```

### Conteúdo de `analysis_data.json`

```json
{
  "version": "2.0",
  "exported_at": "2025-11-13T10:30:00",
  "parcela": "P09",
  "subparcelas": {
    "1": {
      "nome": "Sub 1",
      "image_path": "...",
      "especies": [
        {
          "apelido": "Ciperáceas Cespitosa Larga",
          "genero": "Cyperus",
          "familia": "Cyperaceae",
          "cobertura": 35,
          "altura": 28,
          "forma_vida": "Erva",
          "indice": 1
        }
      ]
    }
  },
  "especies_unificadas": {
    "Ciperáceas Cespitosa Larga": {
      "apelido_original": "Ciperáceas Cespitosa Larga",
      "apelido_usuario": "Ciperáceas Cespitosa Larga",
      "genero": "Cyperus",
      "familia": "Cyperaceae",
      "ocorrencias": 1
    }
  },
  "metadata": {
    "num_subparcelas": 10,
    "num_especies": 15,
    "num_imagens": 10
  }
}
```

## Fluxo de Importação

### 1. Usuário Seleciona ZIP

```javascript
// Frontend
AnalysisManager.importCompleteZip();
// Abre seletor de arquivo
```

### 2. Backend Processa

```python
# 1. Extrai ZIP
with zipfile.ZipFile(zip_file, 'r') as zip_ref:
    print("📦 Conteúdo do ZIP:")
    for name in zip_ref.namelist():
        print(f"   - {name}")
    zip_ref.extractall(temp_dir)

# 2. Busca JSON (recursivamente se necessário)
json_path = find_json_in_tree(temp_dir)

# 3. Carrega dados
imported_data = json.load(open(json_path))

# 4. Busca e copia imagens
images_dir = find_images_dir(temp_dir)
copy_images(images_dir, upload_dir)

# 5. Restaura estado
analysis_data['parcelas'][parcela_name] = {...}
analysis_data['especies_unificadas'][parcela_name] = {...}
```

### 3. Logs do Servidor

```
📦 Conteúdo do ZIP:
   - analysis_data.json
   - images/IMG_001.jpg
   - images/IMG_002.jpg
   - README.md

📁 Arquivos em temp_import:
   - analysis_data.json
   - images/IMG_001.jpg
   - images/IMG_002.jpg
   - README.md

✓ Diretório de imagens encontrado em: temp_import/images

📷 Copiando imagens de temp_import/images para uploads/P09
   ✓ IMG_001.jpg
   ✓ IMG_002.jpg
✓ 2 imagens copiadas

✓ Análise importada: P09
✓ Subparcelas: 2
✓ Espécies: 5
```

### 4. Frontend Restaura Interface

```javascript
// Recebe dados do backend
const result = await response.json();

// Restaura estado
appState.parcelaNome = result.parcela;
appState.analysisResults = result.analysis_results;
appState.especies = result.especies;

// Atualiza interface
displayResults();
elements.analysisSection.style.display = 'block';
elements.speciesSection.style.display = 'block';
```

## Como Testar

### Teste de Exportação

1. Faça uma análise completa
2. Clique em "📦 ZIP" no footer
3. Salve o arquivo
4. Extraia manualmente e verifique estrutura:
   - ✓ `analysis_data.json` existe
   - ✓ Pasta `images/` existe
   - ✓ Imagens estão na pasta

### Teste de Importação

1. **Abra a aplicação** (página em branco)
2. **Observe**: Footer já está visível! ✅
3. **Clique** "📥 Importar Projeto"
4. **Selecione** o ZIP exportado
5. **Observe no console do servidor**:
   ```
   📦 Conteúdo do ZIP:
   📁 Arquivos em temp_import:
   ✓ Diretório de imagens encontrado
   📷 Copiando imagens...
   ✓ Análise importada
   ```
6. **Resultado**: Projeto carregado completamente!

### Teste de Estrutura Diferente

Para testar a busca recursiva, crie um ZIP com estrutura diferente:

```
projeto.zip
└── pasta_extra/
    ├── analysis_data.json
    └── images/
        └── foto.jpg
```

O código agora encontrará os arquivos mesmo nessa estrutura!

## Footer Visível

### Antes ❌
```
[Página carregada]
(footer oculto - sem opção de importar)
```

### Depois ✅
```
[Página carregada]
┌─────────────────────────────────────────┐
│ 📦 Exportação & Importação              │
│ [📥 Importar] [📊 Excel] [📄 PDF]       │
│ [📦 ZIP] [✨ Nova Análise]              │
└─────────────────────────────────────────┘
```

## Arquivos Modificados

1. **app.py** (linhas 3441-3507):
   - Logs de debug do ZIP
   - Busca recursiva de `analysis_data.json`
   - Busca recursiva de diretório `images/`
   - Logs detalhados de cópia de imagens

2. **templates/index.html** (linha 147):
   - `display: none` → `display: block`

## Data das Correções

13 de novembro de 2025
