# -*- coding: utf-8 -*-
"""
Sistema de Templates de Prompt para Análise de Vegetação
Diferentes configurações para diferentes objetivos de estudo
"""

PROMPT_TEMPLATES = {
    "default": {
        "name": "Análise Padrão - Vegetação Herbácea",
        "description": "Template balanceado para análise geral de vegetação rasteira com distinção Poaceae/Cyperaceae",
        "objective": "general",
        "params": {
            "max_species": 8,
            "min_species": 1,
            "detail_level": "medium",
            "taxonomic_precision": "conservative",  # conservative, moderate, aggressive
            "include_genus": "only_obvious",  # never, only_obvious, when_possible
            "include_family": "when_clear",  # never, when_clear, always_attempt
            "separate_grasses": True,
            "include_soil": True,
            "include_litter": True,
            "focus_functional": False,
            "focus_succession": False,
            "focus_carbon": False,
            "standardize_across_subplots": "moderate",  # none, conservative, moderate, aggressive
            "detect_coordinates": True,  # Detectar coordenadas de polígonos das espécies
            "include_polygon_json": True,  # Incluir polígonos no formato JSON de importação
            "include_eco_traits": False,  # Incluir características ecológicas (grupo sucessional, etc.)
            "count_individuals": True  # Contar número de indivíduos (touceiras, rosetas, etc.)
        }
    },
    
    "regeneracao": {
        "name": "Regeneração Natural",
        "description": "Foco em identificar estágios sucessionais e plântulas de espécies arbóreas",
        "objective": "succession",
        "params": {
            "max_species": 10,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": True,
            "include_soil": True,
            "include_litter": True,
            "focus_functional": True,
            "focus_succession": True,
            "focus_carbon": False,
            "special_instructions": [
                "Identifique plântulas e mudas de espécies arbóreas/arbustivas com alta prioridade",
                "Diferencie estágios de desenvolvimento (plântula, jovem, estabelecida)",
                "Observe presença de espécies pioneiras vs secundárias quando possível",
                "Registre abundância de regenerantes lenhosos"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "reflorestamento": {
        "name": "Monitoramento de Reflorestamento",
        "description": "Para áreas em processo de restauração ecológica",
        "objective": "restoration",
        "params": {
            "max_species": 12,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": True,
            "include_soil": True,
            "include_litter": True,
            "focus_functional": True,
            "focus_succession": True,
            "focus_carbon": False,
            "special_instructions": [
                "Identifique espécies invasoras ou exóticas com atenção especial",
                "Diferencie entre vegetação plantada e regeneração espontânea quando possível",
                "Observe cobertura de gramíneas competidoras (Brachiaria, Melinis)",
                "Registre presença de espécies indicadoras de sucessão secundária",
                "Identifique mudas de espécies nativas arbóreas/arbustivas"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "carbono": {
        "name": "Estoque de Carbono",
        "description": "Foco em biomassa e estrutura para estimativas de carbono",
        "objective": "carbon",
        "params": {
            "max_species": 8,
            "min_species": 1,
            "detail_level": "medium",
            "taxonomic_precision": "conservative",
            "include_genus": "only_obvious",
            "include_family": "when_clear",
            "separate_grasses": True,
            "include_soil": False,
            "include_litter": True,
            "focus_functional": True,
            "focus_succession": False,
            "focus_carbon": True,
            "special_instructions": [
                "Estime densidade e biomassa aparente de cada morfotipo",
                "Registre altura média e altura máxima quando possível",
                "Observe proporção de material vivo vs senescente",
                "Para gramíneas cespitosas, note densidade das touceiras",
                "Diferencie entre estratos herbáceo (<50cm) e subarbustivo (50-150cm)"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "diversidade_funcional": {
        "name": "Diversidade Funcional",
        "description": "Classificação por formas de vida e grupos funcionais",
        "objective": "functional",
        "params": {
            "max_species": 10,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "conservative",
            "include_genus": "only_obvious",
            "include_family": "when_clear",
            "separate_grasses": True,
            "include_soil": False,
            "include_litter": False,
            "focus_functional": True,
            "focus_succession": False,
            "focus_carbon": False,
            "special_instructions": [
                "Classifique por formas de vida: Hemicriptófita, Caméfita, Terófita, Geófita",
                "Identifique estratégias de crescimento: cespitoso, estolonífero, roseta, prostrado",
                "Observe fenologia quando possível: floração, frutificação, senescência",
                "Diferencie grupos funcionais: gramíneas C3 vs C4 (quando óbvio pela cor/textura)",
                "Registre presença de estruturas especializadas: estolões, rizomas, bulbos (quando visíveis)"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "cerrado": {
        "name": "Vegetação de Cerrado",
        "description": "Adaptado para vegetação de cerrado sentido restrito",
        "objective": "cerrado",
        "params": {
            "max_species": 10,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": True,
            "include_soil": True,
            "include_litter": True,
            "focus_functional": True,
            "focus_succession": False,
            "focus_carbon": False,
            "special_instructions": [
                "Identifique gramíneas típicas: Paspalum, Axonopus, Trachypogon, Andropogon",
                "Observe presença de Cyperaceae: Bulbostylis, Rhynchospora",
                "Registre subarbustos e sufrutescentes característicos",
                "Identifique xilopódios e estruturas de rebrota quando visíveis",
                "Note presença de espécies indicadoras de queimada recente"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "mata_atlantica": {
        "name": "Mata Atlântica - Sub-bosque",
        "description": "Para análise de vegetação herbácea em sub-bosque florestal",
        "objective": "forest",
        "params": {
            "max_species": 8,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": False,  # Gramíneas menos importantes
            "include_soil": True,
            "include_litter": True,
            "focus_functional": False,
            "focus_succession": True,
            "focus_carbon": False,
            "special_instructions": [
                "Priorize identificação de plântulas arbóreas e arbustivas",
                "Identifique herbáceas de sombra: Marantaceae, Araceae, Commelinaceae",
                "Observe presença de samambaias e licófitas",
                "Registre abundância de serapilheira (importante em ambientes florestais)",
                "Note presença de lianas e trepadeiras jovens"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "pastagem_degradada": {
        "name": "Pastagem Degradada",
        "description": "Avaliação de estado de degradação e potencial de recuperação",
        "objective": "degradation",
        "params": {
            "max_species": 8,
            "min_species": 1,
            "detail_level": "medium",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "when_clear",
            "separate_grasses": True,
            "include_soil": True,
            "include_litter": False,
            "focus_functional": True,
            "focus_succession": True,
            "focus_carbon": False,
            "special_instructions": [
                "Identifique gramíneas forrageiras exóticas: Brachiaria, Panicum maximum, Melinis",
                "Registre proporção de solo exposto (indicador de degradação)",
                "Observe presença de invasoras agressivas",
                "Identifique sinais de regeneração natural (mudas nativas)",
                "Note presença de espécies ruderais e indicadoras de distúrbio",
                "Estime vigor da vegetação (plantas saudáveis vs estressadas/secas)"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "brejo_umido": {
        "name": "Áreas Úmidas/Brejos",
        "description": "Vegetação de ambientes saturados ou alagáveis",
        "objective": "wetland",
        "params": {
            "max_species": 10,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": True,
            "include_soil": False,
            "include_litter": False,
            "focus_functional": True,
            "focus_succession": False,
            "focus_carbon": False,
            "special_instructions": [
                "Priorize identificação de Cyperaceae (família dominante em áreas úmidas)",
                "Identifique gramíneas higrófitas: Panicum, Leersia, Hymenachne",
                "Observe plantas aquáticas/palustres: Pontederiaceae, Alismataceae",
                "Registre presença de juncos e taboas quando presentes",
                "Note adaptações a ambientes alagados (aerênquima, raízes adventícias visíveis)"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "rapida_simplificada": {
        "name": "Análise Rápida Simplificada",
        "description": "Para levantamentos expeditos com menor detalhe taxonômico",
        "objective": "quick",
        "params": {
            "max_species": 6,
            "min_species": 1,
            "detail_level": "low",
            "taxonomic_precision": "conservative",
            "include_genus": "never",
            "include_family": "never",
            "separate_grasses": False,
            "include_soil": True,
            "include_litter": False,
            "focus_functional": True,
            "focus_succession": False,
            "focus_carbon": False,
            "special_instructions": [
                "Agrupe morfotipos similares para acelerar análise",
                "Use categorias amplas: 'Gramíneas', 'Herbáceas de Folha Larga', 'Plantas Lenhosas'",
                "Foque em cobertura e estrutura geral da vegetação",
                "Minimize detalhes taxonômicos"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "detalhada_taxonomica": {
        "name": "Análise Detalhada Taxonômica",
        "description": "Máximo detalhamento taxonômico possível (usa mais tokens)",
        "objective": "taxonomic",
        "params": {
            "max_species": 15,
            "min_species": 1,
            "detail_level": "very_high",
            "taxonomic_precision": "aggressive",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": True,
            "include_soil": False,
            "include_litter": False,
            "focus_functional": True,
            "focus_succession": False,
            "focus_carbon": False,
            "special_instructions": [
                "Tente identificar gênero sempre que houver características diagnósticas",
                "Separe morfotipos com pequenas diferenças quando justificável",
                "Descreva estruturas reprodutivas em detalhe (flores, frutos, inflorescências)",
                "Use características diagnósticas específicas para famílias/gêneros",
                "Para Poaceae: note tipo de inflorescência (panícula, espiga, racemo, digitada)",
                "Para Cyperaceae: observe formato da inflorescência (umbela, espiga, capítulo)"
            ],
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": False
        }
    },
    
    "paisagem_drone": {
        "name": "🛰️ Análise de Paisagem (Drone)",
        "description": "Análise abrangente de imagens de drone: árvores adultas, mudas, solo, erosão, antropização, fauna",
        "objective": "landscape",
        "featured": True,
        "analysis_mode": "landscape",
        "params": {
            "analysis_mode": "landscape",
            "max_species": 30,
            "min_species": 1,
            "detail_level": "high",
            "taxonomic_precision": "moderate",
            "include_genus": "when_possible",
            "include_family": "always_attempt",
            "separate_grasses": False,
            "include_soil": True,
            "include_litter": False,
            "focus_functional": False,
            "focus_succession": True,
            "focus_carbon": True,
            "standardize_across_subplots": "moderate",
            "detect_coordinates": True,
            "include_polygon_json": True,
            "include_eco_traits": True,
            "include_eco_traits": True,
            # Landscape-specific params
            "life_forms": ["trees", "saplings", "shrubs", "grasses", "palms", "bamboo", "herbs", "crops"],
            "include_erosion": True,
            "include_anthropic": True,
            "include_fauna": True,
            "estimate_dbh": True,
            "estimate_crown": True,
            "include_water": False,
            "count_individuals": False
        }
    }
}


def build_prompt(template_name="default", custom_params=None):
    """
    Constrói o prompt baseado em template e parâmetros customizados
    
    Args:
        template_name: nome do template a usar
        custom_params: dict com parâmetros para sobrescrever os do template
    
    Returns:
        str: prompt completo formatado
    """
    if template_name not in PROMPT_TEMPLATES:
        template_name = "default"
    
    template = PROMPT_TEMPLATES[template_name]
    params = template["params"].copy()
    
    # Sobrescrever com parâmetros customizados
    if custom_params:
        params.update(custom_params)
    
    # Verificar se é modo paisagem/drone
    if params.get('analysis_mode') == 'landscape':
        return build_landscape_prompt(template, params)
    
    # Construir prompt base (modo herbáceo original)
    prompt = f"""Você é um botânico especializado em análise de vegetação herbácea e arbustiva do Brasil.

OBJETIVO DA ANÁLISE: {template['description']}

Analise esta imagem de um quadrado de 1x1 metro de vegetação rasteira.

INSTRUÇÕES CRÍTICAS:
1. **SEJA {'MUITO CONSERVADOR' if params['taxonomic_precision'] == 'conservative' else 'MODERADO' if params['taxonomic_precision'] == 'moderate' else 'DETALHISTA'}** - Identifique {'APENAS o que você vê claramente' if params['taxonomic_precision'] == 'conservative' else 'o máximo de detalhes possível'}
2. **SEPARE MORFOTIPOS** - Distingua plantas por características visuais {'óbvias' if params['detail_level'] in ['low', 'medium'] else 'detalhadas'}
"""

    # Adicionar lista de morfotipos existentes para padronização
    standardization = params.get('standardize_across_subplots', 'moderate')
    
    if 'existing_species' in params and params['existing_species'] and standardization != 'none':
        existing = params['existing_species']
        if len(existing) > 0:
            # Definir instruções baseadas no nível de padronização
            if standardization == 'aggressive':
                decisao_instrucao = """
3️⃣ **TERCEIRO: Decida sobre o apelido**
   - ✅ Use apelido existente SE características PRINCIPAIS coincidem (tolere pequenas variações)
   - ❌ Crie apelido NOVO apenas se houver diferenças MUITO significativas
   - ⚠️ **PRIORIZE CONSISTÊNCIA** - Prefira reutilizar apelidos quando morfotipos são similares
"""
                regra_ouro = "🎯 **Na dúvida, UNIFIQUE!** Pequenas variações podem ser toleradas para manter consistência entre subparcelas."
            
            elif standardization == 'conservative':
                decisao_instrucao = """
3️⃣ **TERCEIRO: Decida sobre o apelido**
   - ✅ Use apelido existente APENAS se características coincidem PERFEITAMENTE
   - ❌ Crie apelido NOVO se houver QUALQUER diferença visível relevante
   - ⚠️ **PRIORIZE PRECISÃO máxima** - Melhor separar do que agrupar incorretamente
"""
                regra_ouro = "🎯 **Na dúvida, SEPARE!** Exija correspondência quase perfeita para reutilizar apelidos."
            
            else:  # moderate (default)
                decisao_instrucao = """
3️⃣ **TERCEIRO: Decida sobre o apelido**
   - ✅ Use apelido existente SE todas características principais coincidem
   - ❌ Crie apelido NOVO se houver diferenças significativas em qualquer critério
   - ⚠️ **EQUILIBRE precisão e consistência** - Tolere variações menores mas separe diferenças claras
"""
                regra_ouro = "🎯 **Na dúvida moderada, avalie caso a caso.** Morfotipos claramente diferentes = apelidos novos. Variações sutis = mesmo apelido."
            
            prompt += f"""
⚠️ **PADRONIZAÇÃO DE APELIDOS - MODO: {standardization.upper()}**

Os seguintes morfotipos já foram identificados em outras subparcelas:
{', '.join(f'"{esp}"' for esp in existing)}

**PROTOCOLO DE DECISÃO (siga ESTA ORDEM):**

1️⃣ **PRIMEIRO: Analise a imagem INDEPENDENTEMENTE**
   - Identifique TODOS os morfotipos distintos que você vê
   - NÃO se preocupe ainda com os nomes existentes
   - Use critérios detalhados de diferenciação (cor, textura, forma, tamanho, pilosidade)

2️⃣ **SEGUNDO: Compare características detalhadas**
   - Para cada morfotipo que você identificou, compare com a lista existente
   - Use correspondência SOMENTE se as características coincidirem:
     * MESMA família botânica (Poaceae vs Cyperaceae vs Fabaceae vs outras)
     * MESMA cor predominante
     * MESMA textura e pilosidade
     * MESMO porte de crescimento
     * MESMA largura/forma foliar
     * MESMA altura aproximada

{decisao_instrucao}

**EXEMPLOS DE QUANDO CRIAR APELIDOS NOVOS:**

❌ Lista tem "Gramínea Cespitosa" (verde-claro, glabra, folhas finas)
   Você vê: Gramínea em touceira mas verde-escuro, pilosa, folhas médias
   → Crie: "Gramínea Cespitosa Verde-Escuro Pilosa" (MORFOTIPO DIFERENTE)

❌ Lista tem "Erva de Folha Larga" (genérico)
   Você vê: Erva com folhas cordiformes e outra com folhas lanceoladas
   → Crie: "Erva Cordiforme" E "Erva Lanceolada" (NÃO agrupe em "Folha Larga")

❌ Lista tem "Plântulas Dispersas"
   Você vê: Plântula com pilosidade dourada
   → Crie: "Plântula Pilosa Dourada" (CARACTERÍSTICAS ESPECÍFICAS)

✅ Lista tem "Gramínea Prostrada Verde" (prostrada, verde-médio, lisa)
   Você vê: Gramínea prostrada, verde-médio, lisa, mesmas características
   → Use: "Gramínea Prostrada Verde" (MESMO MORFOTIPO)

**REGRA DE OURO:**
{regra_ouro}

"""
    elif 'existing_species' in params and params['existing_species'] and standardization == 'none':
        # Modo independente - não mencionar espécies existentes
        prompt += """
⚠️ **ANÁLISE INDEPENDENTE - Cada subparcela será analisada de forma autônoma**
- NÃO tente padronizar apelidos com outras subparcelas
- Crie apelidos descritivos baseados APENAS no que você vê nesta imagem
- Cada subparcela terá sua própria nomenclatura independente

"""

    # Adicionar seção de gramíneas se necessário
    if params['separate_grasses']:
        prompt += """3. **ATENÇÃO ESPECIAL ÀS GRAMÍNEAS** - Diferencie Poaceae (gramíneas verdadeiras) de Cyperaceae (tiririca/junco)

GRAMÍNEAS E CIPERÁCEAS - DISTINÇÃO CRÍTICA:

**POACEAE (Gramíneas verdadeiras):**
- Características visuais:
  * Caules CILÍNDRICOS (redondos), geralmente OCOS
  * Folhas com nervuras PARALELAS
  * Bainhas ABERTAS (podem ser desenroladas)
  * Nós visíveis no caule
  * Lígula presente (membrana na junção folha-bainha)
- Morfotipos comuns:
  * "Gramínea Cespitosa" - touceiras densas
  * "Gramínea Prostrada" - crescimento rasteiro
  * "Gramínea Alta" - porte ereto >40cm
  * "Gramínea Fina" - folhas <3mm largura
  * "Gramínea Larga" - folhas >5mm largura
- Gêneros identificáveis: Paspalum, Panicum, Brachiaria, Axonopus, Melinis, Andropogon

**CYPERACEAE (Tiririca/Junco/Ciperáceas):**
- Características visuais:
  * Caules TRIANGULARES (3 quinas), SÓLIDOS
  * "Tiririca tem quina" - palpe o caule mentalmente
  * Folhas dispostas em 3 FILEIRAS (dísticas)
  * Bainhas FECHADAS (formam tubo)
  * Sem nós visíveis, sem lígula
  * Base geralmente mais clara/esbranquiçada
- Morfotipos comuns:
  * "Tiririca" - caule triangular evidente
  * "Junco" - folhas mais rígidas
  * "Ciperáceas Prostradas" - crescimento baixo
- Gêneros identificáveis: Cyperus, Rhynchospora, Bulbostylis, Eleocharis

"""
    else:
        prompt += """3. **GRAMÍNEAS E CIPERÁCEAS** - Podem ser agrupadas como "Gramíneas/Ciperáceas" se distinção não for crítica
"""

    # 🔍 SEÇÃO CRÍTICA: Critérios de diferenciação
    if params['detail_level'] in ['high', 'very_high']:
        prompt += """
🔍 **CRITÉRIOS OBRIGATÓRIOS DE DIFERENCIAÇÃO DE MORFOTIPOS:**

**NÃO AGRUPE plantas que diferem em:**

1. **COR predominante** (verde-claro ≠ verde-escuro ≠ verde-azulado ≠ verde-amarelado)
2. **TEXTURA foliar** (lisa/brilhante ≠ rugosa ≠ pilosa/pubescente ≠ cerosa)
3. **LARGURA das folhas** (<2mm ≠ 2-5mm ≠ 5-10mm ≠ >10mm)
4. **FORMA das folhas** (linear ≠ lanceolada ≠ ovada ≠ cordiforme ≠ lobada)
5. **PORTE de crescimento** (prostrado/rasteiro ≠ cespitoso/touceira ≠ ereto ≠ escandente)
6. **ALTURA** (diferenças >10cm devem gerar morfotipos distintos)
7. **PILOSIDADE** (glabra ≠ levemente pilosa ≠ densamente pilosa/tomentosa)
8. **MARGEM foliar** (inteira ≠ serrada ≠ dentada ≠ ondulada)
9. **ESTRUTURAS ESPECIAIS** (presença de estolões, rizomas visíveis, espinhos, gavinhas, látex)
10. **FAMÍLIA BOTÂNICA** (Poaceae ≠ Cyperaceae ≠ Fabaceae ≠ Asteraceae ≠ outras)

**ATENÇÃO ESPECIAL:**

🔬 **FABACEAE (Leguminosas)** - NUNCA agrupe com outras famílias:
   - Folhas COMPOSTAS (múltiplos folíolos) - característica diagnóstica
   - Folíolos geralmente em número ímpar (3, 5, 7...)
   - Frequentemente com estípulas na base do pecíolo
   - Folíolos podem ter pilosidade dourada, prateada ou ferrugínea
   - Venação pinada ou palmatinérvea evidente
   - Exemplos: Desmodium, Stylosanthes, Arachis, Chamaecrista, Centrosema
   - **OBRIGATÓRIO:** Identifique como morfotipo SEPARADO mesmo se houver apenas 1-2 plantas

🌱 **PLÂNTULAS** - Diferencie por características distintas:
   - Formato e arranjo dos cotilédones
   - Cor e pilosidade específicas
   - Tamanho das primeiras folhas verdadeiras
   - Presença de hipocótilo colorido
   - **NUNCA agrupe** "Plântulas Diversas" - cada tipo de plântula é um morfotipo

🌾 **GRAMÍNEAS** - Separe por múltiplos critérios:
   - Largura foliar (fina <2mm, média 2-5mm, larga >5mm)
   - Hábito (cespitoso, estolonífero, rizomatoso, prostrado)
   - Cor da folhagem (verde-claro, verde-médio, verde-escuro, glauco-azulado)
   - Pilosidade da bainha e lâmina foliar
   - Altura do dossel

🍃 **HERBÁCEAS DE FOLHA LARGA** - SEMPRE separe tipos diferentes:
   - NÃO use "Erva de Folha Larga" genérico se houver >1 tipo
   - Crie morfotipos específicos: "Erva Ovada Pilosa", "Erva Cordiforme Lisa", etc.
   - Diferencie por: forma foliar, margem, textura, tamanho, cor

"""
    elif params['detail_level'] == 'medium':
        prompt += """
🔍 **CRITÉRIOS DE DIFERENCIAÇÃO DE MORFOTIPOS:**

**Separe plantas que diferem em:**
- Cor e textura foliar evidentemente diferentes
- Largura foliar (folhas finas ≠ largas)
- Porte (rasteiro ≠ touceira ≠ ereto)
- Pilosidade marcante
- Família botânica (Poaceae ≠ Cyperaceae ≠ Fabaceae ≠ outras)

**ATENÇÃO:**
- Leguminosas (folhas compostas) sempre em morfotipo separado
- Plântulas distintas não devem ser agrupadas
- Gramíneas com cores/texturas diferentes = morfotipos diferentes

"""

    # Outras categorias
    prompt += """
OUTRAS CATEGORIAS:
- **Herbáceas de Folha Larga** - Não-gramíneas com folhas largas
- **Arbustos Jovens** - Lenhosas em desenvolvimento inicial
- **Plântulas Arbóreas** - Mudas de árvores
- **Trepadeiras** - Plantas volúveis
"""
    
    if params['include_soil']:
        prompt += "- **Solo Exposto** - Solo sem cobertura vegetal\n"
    if params['include_litter']:
        prompt += "- **Serapilheira** - Folhiço e material vegetal morto\n"
    
    # Instruções explícitas sobre o que NÃO incluir
    exclusions = []
    if not params['include_soil']:
        exclusions.append("Solo Exposto")
    if not params['include_litter']:
        exclusions.append("Serapilheira")
    
    if exclusions:
        prompt += f"""
⛔ **NÃO INCLUA AS SEGUINTES CATEGORIAS:**
{', '.join(exclusions)}
- NÃO identifique nem mencione {'esta categoria' if len(exclusions) == 1 else 'estas categorias'} na sua resposta
- Concentre-se APENAS em vegetação viva{' e nas categorias permitidas acima' if params['include_soil'] or params['include_litter'] else ''}
"""
        # Adicionar mensagem específica sobre o que ignorar
        if not params['include_soil'] and not params['include_litter']:
            prompt += "- Se houver solo exposto ou serapilheira, IGNORE-os completamente na análise\n"
        elif not params['include_soil']:
            prompt += "- Se houver solo exposto, IGNORE-o completamente na análise\n"
        elif not params['include_litter']:
            prompt += "- Se houver serapilheira, IGNORE-a completamente na análise\n"

    # Limite de espécies
    prompt += f"""
4. **LIMITE** a análise a {params['min_species']}-{params['max_species']} morfotipos
"""

    # Instruções especiais do template
    if 'special_instructions' in params:
        prompt += "\n**INSTRUÇÕES ESPECÍFICAS PARA ESTE TIPO DE ANÁLISE:**\n"
        for instruction in params['special_instructions']:
            prompt += f"- {instruction}\n"

    # Protocolo de identificação
    prompt += """
PROTOCOLO DE IDENTIFICAÇÃO DE MORFOTIPOS:

Para cada morfotipo CLARAMENTE visível, forneça:

1. **apelido** - Use nomes descritivos baseados em características visuais
"""

    # Instruções para gênero
    if params['include_genus'] == 'never':
        prompt += """
2. **genero** - SEMPRE deixe VAZIO ("")
"""
    elif params['include_genus'] == 'only_obvious':
        prompt += """
2. **genero** - DEIXE VAZIO ("") na maioria dos casos. Preencha APENAS se extremamente óbvio:
   - Poaceae: "Paspalum" (inflorescência digitada), "Panicum" (panícula aberta), "Axonopus"
   - Cyperaceae: "Cyperus" (mais comum)
   - **NA DÚVIDA**: deixe vazio ("")
"""
    else:  # when_possible
        prompt += """
2. **genero** - Tente identificar quando houver características diagnósticas claras:
   - Poaceae: observe tipo de inflorescência, formato das folhas
   - Cyperaceae: formato da inflorescência, estrutura da base
   - Outros: características florais, formato foliar específico
   - **NA DÚVIDA**: deixe vazio ("")
"""

    # Instruções para família
    if params['include_family'] == 'never':
        prompt += """
3. **familia** - SEMPRE deixe VAZIO ("")
"""
    elif params['include_family'] == 'when_clear':
        prompt += """
3. **familia** - Preencha quando características são INCONFUNDÍVEIS:
   - "Poaceae" - SE claramente gramínea (caule cilíndrico, bainha aberta)
   - "Cyperaceae" - SE claramente tiririca (caule triangular)
   - "Bromeliaceae", "Agavaceae", "Arecaceae" - quando muito característico
   - **NA DÚVIDA**: deixe vazio ("")
"""
    else:  # always_attempt
        prompt += """
3. **familia** - Tente identificar família sempre que possível:
   - Use características diagnósticas observáveis
   - Para famílias comuns: Poaceae, Cyperaceae, Fabaceae, Asteraceae, etc.
   - Sempre que houver dúvida, deixe vazio mas tente primeiro
"""

    # Observações
    detail_desc = {
        'low': 'breve',
        'medium': 'detalhada',
        'high': 'muito detalhada',
        'very_high': 'extremamente detalhada com todas características possíveis'
    }
    
    prompt += f"""
4. **observacoes** - DESCRIÇÃO {detail_desc.get(params['detail_level'], 'DETALHADA').upper()} DAS CARACTERÍSTICAS VISUAIS (campo obrigatório):
"""

    if params['focus_carbon']:
        prompt += """   
   FOCO EM BIOMASSA E ESTRUTURA:
   - Estime densidade aparente e vigor da vegetação
   - Registre altura média, mínima e máxima
   - Proporção de material vivo vs senescente
   - Para gramíneas cespitosas: densidade das touceiras
   - Estratificação vertical quando presente
"""
    
    if params['focus_succession']:
        prompt += """
   FOCO EM SUCESSÃO ECOLÓGICA:
   - Identifique estágio sucessional aparente
   - Presença de espécies pioneiras, secundárias
   - Plântulas e jovens de espécies lenhosas
   - Sinais de colonização recente ou vegetação madura
"""
    
    if params['focus_functional']:
        prompt += """
   FOCO EM GRUPOS FUNCIONAIS:
   - Forma de vida e estratégia de crescimento
   - Tipo de sistema radicular (quando visível)
   - Presença de estruturas especializadas
   - Fenologia (floração, frutificação) quando visível
"""

    # Checklist detalhado para níveis altos de detalhe
    if params['detail_level'] in ['high', 'very_high']:
        prompt += """
   
   ⚠️ **CHECKLIST OBRIGATÓRIO - Inclua na descrição:**
   ✓ COR exata (verde-claro/médio/escuro/azulado/amarelado)
   ✓ TEXTURA (lisa, rugosa, cerosa, pilosa/tomentosa)
   ✓ PILOSIDADE - se presente, COR dos pelos (dourada, prateada, ferrugínea)
   ✓ FORMA FOLIAR (linear, lanceolada, ovada, composta para leguminosas)
   ✓ TAMANHO aproximado
   ✓ MARGEM (inteira, serrada, dentada)
   ✓ HÁBITO (prostrado, cespitoso, ereto)
   ✓ ALTURA (min-média-max)
   
   Para leguminosas: nº folíolos, arranjo, estípulas
   Para plântulas: cotilédones, pilosidade específica
"""
    
    prompt += """
   Sempre inclua: cor, textura, tamanho, forma, padrão de crescimento, altura, e qualquer variação observada

"""

    # Instrução de cobertura
    if params['include_soil'] and params['include_litter']:
        prompt += """
5. **cobertura** - Porcentagem (0-100) ocupada no quadrado de 1x1m.
   - A soma de todas as coberturas deve ser ~100% (pois inclui solo e serapilheira).
"""
    elif params.get('normalize_coverage', False):
        prompt += """
5. **cobertura** - Porcentagem (0-100) ocupada no quadrado de 1x1m.
   - ⚠️ **ATENÇÃO:** A soma de coberturas DEVE ser ~100% (Normalização Ativada).
   - Calcule a abundância relativa de cada espécie em relação à área vegetal total.
   - Ignore os espaços vazios na soma final - redistribua para que as espécies somem 100%.
"""
    else:
        prompt += """
5. **cobertura** - Porcentagem (0-100) ocupada no quadrado de 1x1m.
   - ⚠️ **ATENÇÃO:** A soma PODE ser MENOR que 100% (pois solo/serapilheira foram excluídos).
   - Estime a porcentagem REAL que a planta ocupa no 1m².
   - NÃO force a soma para 100% redistribuindo a área vazia.
"""

    prompt += """

7. **numero_individuos** - Conte o número aproximado de indivíduos distintos (touceiras, rosetas ou plantas isoladas) visíveis no quadrado
   - ⚠️ **NÃO confunda com índice/ID!** Queremos a QUANTIDADE (ex: 5, 12, 1).
   - Se for uma touceira grande, conte como 1
   - Se for um tapete contínuo impossível de separar, estime 1 ou use 0 se não aplicável

6. **altura** - Altura média em cm (considere o quadrado de 1x1m como referência)

7. **forma_vida**: "Erva", "Arbusto", "Subarbusto", "Plântula", "Liana", "Trepadeira", ou "-" (para solo/serapilheira)
"""

    # Instruções de coordenadas (condicional) - ALTA PRECISÃO
    if params.get('detect_coordinates', False):
        prompt += """
8. **areas** - COORDENADAS DE LOCALIZAÇÃO (array de polígonos) - ALTA PRECISÃO:
   🎯 **IMPORTANTE: Identifique PRECISAMENTE onde cada espécie está localizada na imagem**

   📏 **SISTEMA DE COORDENADAS (CRÍTICO):**
   - Coordenadas em **PORCENTAGEM (0-100)** relativas à imagem
   - x: 0.00 (borda esquerda) → 100.00 (borda direita)
   - y: 0.00 (borda superior/topo) → 100.00 (borda inferior/fundo)
   - Use **2 casas decimais** para máxima precisão (ex: 45.75, 23.18)
   
   ⚠️ **REGRA FUNDAMENTAL**: Os polígonos devem ABRAÇAR O CONTORNO REAL de cada espécie,
      NÃO formas geométricas genéricas centralizadas aproximadamente sobre o alvo.

   **Requisitos de polígonos:**
   ❌ **PROIBIDO:** Retângulos, quadrados ou hexágonos regulares de 4-8 pontos
   ✅ **OBRIGATÓRIO:** Mínimo **12-16 pontos** para contornos suaves e precisos
   
   🎯 **TÉCNICA DE PRECISÃO:**
   - Observe onde a espécie/touceira realmente começa e termina
   - Trace mentalmente o perímetro antes de definir coordenadas
   - Comece pelo ponto mais ao norte e siga sentido horário
   - Adicione pontos extras em curvas acentuadas
   - Se a espécie ocorre em áreas separadas, use MÚLTIPLOS polígonos
   
   📏 **EXEMPLOS - BOM vs RUIM:**
   
   ❌ RUIM (quadrado genérico de 4 pontos):
   [[10, 15], [30, 15], [30, 40], [10, 40]]
   
   ✅ BOM (contorno real com 12+ pontos e 2 decimais):
   [[12.25, 18.50], [16.80, 15.75], [22.15, 14.20], [27.60, 15.90],
    [31.45, 19.35], [33.10, 25.70], [32.85, 32.40], [29.20, 38.15],
    [23.75, 41.80], [17.30, 42.25], [11.55, 39.60], [8.45, 32.15]]

   **Quando fornecer coordenadas (SEMPRE quando possível):**
   ✅ Espécie tem uma região distinta e visível
   ✅ Use múltiplos polígonos para espécies em áreas descontínuas
   ✅ Para touceiras, siga o contorno circular/irregular real
   ✅ Para espécies dominantes, marque TODAS as manchas/agregações

   **Quando deixar vazio []:**
   ❌ APENAS se espécie muito dispersa/uniforme por toda imagem
   ❌ Impossível determinar limites claros de forma alguma
"""
    else:
        prompt += """
"""


    # Adicionar informações de polígonos se ativado
    if params.get('include_polygon_json', False):
        prompt += """

📐 **FORMATO DE POLÍGONOS (OBRIGATÓRIO quando include_polygon_json=True) - ALTA PRECISÃO:**

📏 **SISTEMA DE COORDENADAS USADO:**
- Coordenadas em PORCENTAGEM (0-100) relativas à imagem
- x: 0.00 (esquerda) → 100.00 (direita)
- y: 0.00 (topo) → 100.00 (fundo)
- Use **2 CASAS DECIMAIS** para precisão (ex: 45.75, 23.18)

Além do array de espécies, você DEVE incluir dois campos adicionais no JSON:

1. **area_shape** - Polígono representando a área total da subparcela (1x1m):
   - Se não conseguir identificar os limites, use: {"points": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}]}

2. **species_shapes** - Objeto mapeando índice de espécie → array de polígonos:
   - Chave = índice da espécie no array (0, 1, 2...)
   - Valor = array de polígonos onde a espécie ocorre
   - Cada polígono: {"points": [{"x": X.XX, "y": Y.YY}, ...]}
   
   ⚠️ **REQUISITOS DE PRECISÃO:**
   - Mínimo **12-16 pontos** por polígono (contornos suaves)
   - Coordenadas com **2 casas decimais** (ex: 45.75, 23.18)
   - Siga o **contorno real** da espécie, NÃO use formas genéricas
   - Múltiplos polígonos se espécie em áreas não-contíguas

"""
    
    # Adicionar informações de traços ecológicos se ativado
    if params.get('include_eco_traits', False):
        prompt += """

🌱 **CARACTERÍSTICAS ECOLÓGICAS (OPCIONAL):**

Para cada espécie, TENTE preencher os seguintes campos ecológicos:

8. **grupo_sucessional** - Classificação sucessional (se identificável):
   - "Pioneira" - Espécies de início de sucessão, tolerantes ao sol
   - "Secundária Inicial" - Transição, crescimento rápido
   - "Secundária Tardia" - Espécies de sombra moderada
   - "Climácica" - Espécies de florestas maduras
   - "" (vazio) - Se não for possível determinar

9. **tolerancia_sombra** - Preferência de luminosidade:
   - "Heliófita" - Exige sol direto
   - "Esciófita" - Tolera/prefere sombra
   - "Indiferente" - Flexível
   - "" (vazio) - Se não for possível determinar

10. **tipo_dispersao** - Mecanismo de dispersão (se identificável):
   - "Anemocórica" - Dispersão pelo vento
   - "Zoocórica" - Dispersão por animais
   - "Autocórica" - Auto-dispersão
   - "Hidrocórica" - Dispersão pela água
   - "" (vazio) - Se não for possível determinar

⚠️ ATENÇÃO: Só preencha campos ecológicos se houver evidências visuais ou conhecimento taxonômico. Na dúvida, deixe vazio ("").

"""


    # Construir exemplo JSON
    prompt += '''
EXEMPLOS DE RESPOSTA (JSON válido, sem ```json):
{
  "especies": [
    {
      "indice": 1,
      "apelido": "Gramínea Cespitosa Verde-Claro",
      "genero": "",
      "familia": "Poaceae",
      "observacoes": "Crescimento em touceiras densas, folhas lineares muito finas (<2mm largura), caules cilíndricos visíveis, cor verde-claro predominante",
      "cobertura": 45,
      "altura": 30,
      "forma_vida": "Erva"'''

    # Adicionar eco_traits ao exemplo se ativado
    if params.get('include_eco_traits', False):
        prompt += ''',
      "grupo_sucessional": "Pioneira",
      "tolerancia_sombra": "Heliófita",
      "tipo_dispersao": "Anemocórica"'''

    prompt += '''
    },
    {
      "indice": 2,
      "apelido": "Leguminosa Trifoliolada Pilosa Dourada",
      "genero": "",
      "familia": "Fabaceae",
      "observacoes": "Folhas compostas trifolioladas, folíolos ovados a elípticos, pilosidade densa dourada, crescimento prostrado",
      "cobertura": 10,
      "altura": 6,
      "forma_vida": "Erva"'''

    if params.get('include_eco_traits', False):
        prompt += ''',
      "grupo_sucessional": "",
      "tolerancia_sombra": "",
      "tipo_dispersao": "Autocórica"'''

    prompt += '''
    }
  ]'''

    # Adicionar area_shape e species_shapes ao exemplo se ativado
    if params.get('include_polygon_json', False):
        prompt += ''',
  "area_shape": {
    "points": [
      {"x": 2.50, "y": 1.75},
      {"x": 97.25, "y": 2.10},
      {"x": 98.80, "y": 97.45},
      {"x": 1.90, "y": 96.80}
    ]
  },
  "species_shapes": {
    "0": [
      {
        "points": [
          {"x": 12.25, "y": 16.50}, {"x": 18.40, "y": 14.75}, {"x": 25.15, "y": 13.20},
          {"x": 32.60, "y": 14.90}, {"x": 38.45, "y": 18.35}, {"x": 42.10, "y": 24.70},
          {"x": 43.85, "y": 32.40}, {"x": 42.20, "y": 40.15}, {"x": 37.75, "y": 46.80},
          {"x": 30.30, "y": 49.25}, {"x": 22.55, "y": 48.60}, {"x": 15.80, "y": 43.90},
          {"x": 11.45, "y": 36.15}, {"x": 10.20, "y": 27.80}
        ]
      },
      {
        "points": [
          {"x": 55.75, "y": 21.25}, {"x": 62.30, "y": 18.90}, {"x": 69.85, "y": 19.45},
          {"x": 76.40, "y": 23.10}, {"x": 81.15, "y": 29.75}, {"x": 83.50, "y": 38.20},
          {"x": 82.85, "y": 47.65}, {"x": 78.20, "y": 55.30}, {"x": 70.75, "y": 59.85},
          {"x": 62.30, "y": 59.20}, {"x": 55.55, "y": 54.45}, {"x": 51.80, "y": 46.70},
          {"x": 51.45, "y": 37.25}, {"x": 52.90, "y": 28.80}
        ]
      }
    ],
    "1": [
      {
        "points": [
          {"x": 18.25, "y": 65.50}, {"x": 24.80, "y": 63.75}, {"x": 31.15, "y": 64.20},
          {"x": 36.60, "y": 67.90}, {"x": 39.45, "y": 74.35}, {"x": 38.85, "y": 81.40},
          {"x": 34.20, "y": 87.15}, {"x": 27.75, "y": 89.80}, {"x": 20.30, "y": 88.25},
          {"x": 14.55, "y": 83.60}, {"x": 12.80, "y": 76.90}, {"x": 14.25, "y": 69.80}
        ]
      }
    ]
  }'''

    prompt += '''
}

REGRAS FINAIS:
'''

    if params['separate_grasses']:
        prompt += "✓ SEPARE Poaceae (caule cilíndrico) de Cyperaceae (caule triangular)\n"
    
    prompt += f"""✓ Crie {params['min_species']}-{params['max_species']} morfotipos baseados em características visuais
"""
    
    if params['include_genus'] != 'never':
        prompt += f"""✓ Preencha "genero" {
            'APENAS quando EXTREMAMENTE óbvio' if params['include_genus'] == 'only_obvious' 
            else 'quando houver características diagnósticas'
        }\n"""
    
    if params['include_family'] != 'never':
        prompt += f"""✓ Preencha "familia" {
            'quando características são INCONFUNDÍVEIS' if params['include_family'] == 'when_clear'
            else 'sempre que possível identificar'
        }\n"""
    
    if params['include_soil'] and params['include_litter']:
        prompt += "✓ Soma de coberturas = ~100%\n"
    else:
        prompt += "✓ Soma de coberturas = Porcentagem REAL (pode ser < 100%)\n"

    if params.get('detect_coordinates', False):
        prompt += "✓ TENTE SEMPRE fornecer coordenadas 'areas' para espécies com localização visível\n"

    if params['include_soil']:
        prompt += "✓ Inclua 'Solo Exposto' se aplicável\n"
    else:
        prompt += "✗ NÃO inclua 'Solo Exposto' - IGNORE solo sem vegetação\n"
    
    if params['include_litter']:
        prompt += "✓ Inclua 'Serapilheira' se aplicável\n"
    else:
        prompt += "✗ NÃO inclua 'Serapilheira' - IGNORE material vegetal morto\n"
    
    if params['separate_grasses']:
        prompt += "✗ NÃO agrupe Poaceae com Cyperaceae\n"
    
    prompt += f"""✗ NÃO use apelidos genéricos demais como "Erva de Folha Larga" ou "Plântulas Dispersas" se houver características específicas
✗ NÃO agrupe morfotipos com cores, texturas ou pilosidades diferentes
✗ NÃO crie morfotipos para variações mínimas
✗ {'NÃO preencha genero/familia - deixe sempre vazio' if params['include_genus'] == 'never' else 'NÃO invente identificações taxonômicas'}
✗ NÃO deixe "observacoes" vazio ou genérico demais
✗ NÃO exceda {params['max_species']} morfotipos
✗ NÃO retorne menos de {params['min_species']} morfotipos (exceto se realmente não houver vegetação)

⚠️ **CRÍTICO - SIGA ESTAS INSTRUÇÕES EXATAMENTE:**
- Número de morfotipos: ENTRE {params['min_species']} e {params['max_species']}
- Solo exposto: {'INCLUIR' if params['include_soil'] else 'NÃO INCLUIR'}
- Serapilheira: {'INCLUIR' if params['include_litter'] else 'NÃO INCLUIR'}
- Separar gramíneas/ciperáceas: {'SIM' if params['separate_grasses'] else 'NÃO NECESSÁRIO'}
- Identificação de gênero: {params['include_genus'].upper().replace('_', ' ')}
- Identificação de família: {params['include_family'].upper().replace('_', ' ')}
- Nível de detalhe nas observações: {params['detail_level'].upper().replace('_', ' ')}
- Coordenadas de localização: {'FORNEÇA SEMPRE QUE POSSÍVEL (campo areas)' if params.get('detect_coordinates', False) else 'NÃO NECESSÁRIO'}
- **PRIORIZE PRECISÃO**: Na dúvida entre agrupar ou separar morfotipos, SEPARE!

📐 **PRECISÃO DE POLÍGONOS (OBRIGATÓRIO):**
- Cada polígono DEVE ter **mínimo 12-16 pontos** (contornos suaves)
- Coordenadas DEVEM ter **2 casas decimais** (ex: 45.75, 23.18)
- Polígonos DEVEM seguir o **contorno real** da vegetação
- ❌ PROIBIDO usar quadrados, retângulos ou formas geométricas simples
- Sistema: x=0-100 (esquerda→direita), y=0-100 (topo→fundo)

Retorne APENAS JSON válido sem marcadores markdown."""

    return prompt


def build_landscape_prompt(template, params):
    """
    Constrói prompt especializado para análise de paisagem/drone
    
    Args:
        template: template dict
        params: parâmetros de configuração
    
    Returns:
        str: prompt formatado para análise de paisagem
    """
    prompt = f"""Você é um especialista em ecologia de paisagem, geoprocessamento e monitoramento ambiental.

🛰️ OBJETIVO DA ANÁLISE: {template['description']}

Analise esta imagem aérea/drone de uma área de paisagem para identificar e mapear as seguintes CATEGORIAS DE ENTIDADES:

"""
    
    # Determine active life forms
    life_forms = params.get('life_forms', [])
    # Backward compatibility fallback
    if not life_forms:
        if params.get('include_trees', True): life_forms.append('trees')
        if params.get('include_seedlings', True): life_forms.append('saplings')

    # Categorias de entidades ativadas
    if 'trees' in life_forms:
        prompt += """
🌳 **ÁRVORES ADULTAS**
   - Identifique cada árvore ou agrupamento visível
   - Estime: diâmetro de copa (metros), altura (metros), DAP aproximado (cm)
   - Para DAP, use a relação aproximada: DAP ≈ diâmetro_copa × 3 a 5 (dependendo da espécie)
   - Classifique por: espécie (se identificável), vigor (excelente/bom/regular/ruim)
   - Use apelidos descritivos: "Árvore Copa Ampla", "Agrupamento de Pioneiras", etc.
"""

    if 'saplings' in life_forms:
        prompt += """
🌱 **MUDAS DE REFLORESTAMENTO**
   - Identifique linhas ou agrupamentos de mudas plantadas
   - Avalie: sobrevivência (viva/morta/estressada), vigor (excelente/bom/regular/ruim)
   - Qualidade do plantio: espaçamento, alinhamento, coroamento
   - Estime: altura média (cm), quantidade aproximada
   - Use apelidos: "Linha de Mudas Nativas", "Área de Replantio", etc.
"""

    if 'shrubs' in life_forms:
         prompt += """
🌿 **ARBUSTOS**
   - Identifique vegetação lenhosa de porte médio (<5m)
   - Diferencie de árvores pelo porte e ramificação desde a base
   - Estime área de cobertura e altura média
   - Use apelidos: "Arbusto Denso", "Macega", "Vegetação Arbustiva"
"""

    if 'grasses' in life_forms:
         prompt += """
🌾 **GRAMÍNEAS (CAPIM)**
   - Identifique manchas ou áreas de gramíneas (nativas ou exóticas)
   - Diferencie: "Touceiras" (isoladas) vs "Pastagem/Gramado" (contínuo)
   - Estime altura da vegetação (baixa/média/alta)
   - Identifique espécies invasoras comuns (Brachiaria, Melinis) se distintiva
   - Use apelidos: "Touceira de Capim", "Mancha de Brachiaria"
"""

    if 'palms' in life_forms:
         prompt += """
🌴 **PALMEIRAS**
   - Identifique Arecaceae (coqueiros, jerivás, macaúbas, tucuns)
   - Note a arquitetura da copa em roseta típica
   - Estime altura e diâmetro da copa
   - Use apelidos: "Palmeira Isolada", "Jerivá", "Indaiá"
"""

    if 'bamboo' in life_forms:
         prompt += """
🎍 **BAMBUZAL**
   - Identifique moitas ou maciços de bambu/taquara
   - Caracterize pela textura fina e arqueada dos colmos/folhas
   - Estime área ocupada pela moita
   - Use apelidos: "Moita de Bambu", "Taquaral"
"""

    if 'herbs' in life_forms:
         prompt += """
🍀 **ERVAS (Vegetação Rasteira)**
   - Identifique cobertura herbácea não-graminóide
   - Plantas de folha larga, rasteiras, flores do campo
   - Estime cobertura do solo
   - Use apelidos: "Tapete Herbáceo", "Ervas de Folha Larga"
"""

    if 'crops' in life_forms:
         prompt += """
🌽 **CULTIVO AGRÍCOLA**
   - Identifique áreas de plantio agrícola (milho, soja, horta, pomar)
   - Note padrões de linhas, uniformidade e monocultura
   - Identifique a cultura se possível
   - Use apelidos: "Lavoura de Milho", "Canteiro de Horta"
"""

    # Exclusion instructions
    all_life_forms_map = {
        "trees": "Árvores Adultas",
        "saplings": "Mudas de Reflorestamento",
        "shrubs": "Arbustos",
        "grasses": "Gramíneas/Capim",
        "palms": "Palmeiras",
        "bamboo": "Bambuzal",
        "herbs": "Ervas/Vegetação Rasteira",
        "crops": "Cultivo Agrícola"
    }
    
    exclusions = []
    for key, label in all_life_forms_map.items():
        if key not in life_forms:
            exclusions.append(label)
            
    if exclusions:
        prompt += f"""
⛔ **ITENS IGNORADOS - NÃO INCLUA NA ANÁLISE:**
   - {', '.join(exclusions)}
   - Concentre-se apenas nas categorias ativadas.
"""

    if params.get('include_erosion', True):
        prompt += """
🟤 **SOLO EXPOSTO E EROSÃO**
   - Identifique áreas de solo sem cobertura vegetal
   - Classifique tipo de erosão: Laminar, Sulcos, Ravinas, Voçoroca
   - Avalie severidade: Leve, Moderada, Severa
   - Estime: área afetada (% da imagem)
   - Use apelidos: "Solo Exposto Compactado", "Erosão em Sulcos Ativos", etc.
"""

    if params.get('include_anthropic', True):
        prompt += """
🔥 **SINAIS DE ANTROPIZAÇÃO**
   - Detecte marcas de fogo (recente/antigo, intensidade)
   - Identifique: estradas, trilhas, construções, cercas, desmate recente
   - Detecte: lixo, poluição, entulho, resíduos
   - Avalie impacto na vegetação circundante
   - Use apelidos: "Área de Queimada Recente", "Trilha de Acesso", "Ponto de Descarte", etc.
"""

    if params.get('include_fauna', True):
        prompt += """
🐾 **FAUNA E PECUÁRIA** (SEMPRE distingua entre nativo e doméstico!)
   
   📍 FAUNA NATIVA:
   - Avistamento direto ou evidências indiretas
   - Tipos de evidência: avistamento, rastros, pegadas, tocas/ninhos, fezes, trilhas
   - Espécies comuns: capivara, tatu, veado, anta, onça, cateto, quati, etc.
   - Use apelidos: "Rastro de Capivara", "Toca de Tatu", "Pegadas de Veado"
   
   🐄 PECUÁRIA (animais domésticos):
   - Bovinos, equinos, suínos, caprinos, ovinos
   - Evidências: animais, trilhas de gado, marcas de pastejo, pisoteio
   - Avalie impacto na vegetação: leve, moderado, severo
   - Use apelidos: "Bovinos em Pastejo", "Trilha de Gado", "Área Pisoteada"
"""

    if params.get('include_water', False):
        prompt += """
💧 **CORPOS D'ÁGUA**
   - Identifique: rios, riachos, lagos, lagoas, represas, áreas alagadas
   - Classifique: tipo (lêntico/lótico), turbidez (clara/turva/barrenta)
   - Avalie: presença de mata ciliar (preservada/degradada/ausente)
   - Use apelidos: "Rio com Mata Ciliar", "Lagoa Artificial", "Área Alagada Sazonal"
"""

    if params.get('count_individuals', False):
        prompt += """
🔢 **CONTAGEM DE INDIVÍDUOS**
   - Para cada entidade biológica (árvores, animais, mudas), forneça uma CONTAGEM ESTIMADA
   - Se for um indivíduo isolado: contagem = 1
   - Se for um grupo/mancha: estime o número de indivíduos visíveis
   - Adicione o campo "contagem" (número inteiro) no JSON para cada entidade
"""

    # Instruções de Geometria (CRÍTICO) - PRECISÃO MÁXIMA
    prompt += """
📐 **INSTRUÇÕES DE GEOMETRIA E FORMAS (CRÍTICO - PRECISÃO MÁXIMA):**

⚠️ **REGRA FUNDAMENTAL**: Os polígonos devem ABRAÇAR O CONTORNO REAL de cada copa/vegetação, 
   NÃO formas geométricas genéricas centralizadas aproximadamente sobre o alvo.

1. **Polígonos de Entidades ("areas") - ALTA PRECISÃO:**
   
   ❌ **ABSOLUTAMENTE PROIBIDO:**
   - Retângulos, quadrados ou hexágonos regulares de 4-8 pontos
   - Polígonos "centrados" genericamente sobre a área
   - Formas simétricas que não seguem o contorno real
   - Coordenadas arredondadas para inteiros (use 2 casas decimais!)
   
   ✅ **OBRIGATÓRIO:**
   - Mínimo **12-16 pontos** por polígono para contornos suaves e precisos
   - Coordenadas com **2 casas decimais** (ex: 45.75, 23.18) para máxima precisão
   - Seguir o **contorno exato** da copa/vegetação como se desenhasse à mão
   - Identificar o **centro de massa real** e desenhar a partir das bordas visíveis
   - Para copas circulares: use 12+ pontos formando um círculo irregular
   - Para copas irregulares: use 16+ pontos seguindo cada reentrância
   
   🎯 **TÉCNICA DE PRECISÃO:**
   - Observe onde a COPA/VEGETAÇÃO realmente começa e termina
   - Trace mentalmente o perímetro antes de definir coordenadas
   - Comece pelo ponto mais ao norte e siga sentido horário
   - Adicione pontos extras em curvas acentuadas
   - Se a entidade for fragmentada, use MÚLTIPLOS polígonos separados

   📏 **EXEMPLOS DE POLÍGONOS - BOM vs RUIM:**
   
   ❌ RUIM (octógono genérico centralizado - NÃO FAÇA ISSO):
   [{"x":40,"y":20},{"x":50,"y":18},{"x":60,"y":20},{"x":62,"y":30},
    {"x":60,"y":40},{"x":50,"y":42},{"x":40,"y":40},{"x":38,"y":30}]
   
   ✅ BOM (contorno real da copa com 14 pontos e 2 decimais):
   [{"x":38.25,"y":21.50},{"x":42.80,"y":18.75},{"x":48.15,"y":17.20},{"x":54.60,"y":18.90},
    {"x":59.45,"y":22.35},{"x":62.10,"y":28.70},{"x":61.85,"y":35.40},{"x":58.20,"y":41.15},
    {"x":52.75,"y":44.80},{"x":46.30,"y":45.25},{"x":40.55,"y":42.60},{"x":36.80,"y":36.90},
    {"x":35.45,"y":29.15},{"x":36.20,"y":23.80}]

2. **Polígono de Área Total ("area_shape"):**
   - ❌ NÃO desenhe um quadrado pequeno num canto.
   - ✅ **OBRIGATÓRIO**: Assuma que a análise cobre TODA a imagem.
   - Use sempre: {"points": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}]}

3. **VERIFICAÇÃO DE QUALIDADE:**
   Antes de retornar, verifique cada polígono:
   - [ ] Tem pelo menos 12 pontos?
   - [ ] Coordenadas têm 2 casas decimais?
   - [ ] Segue o contorno real visível na imagem?
   - [ ] Não é uma forma geométrica regular/simétrica?
   - [ ] Está posicionado EXATAMENTE sobre a entidade?
"""


    # Instruções de formato JSON
    prompt += """

📐 **FORMATO DE RESPOSTA (JSON):**

Retorne um objeto JSON com o array "entidades" contendo todos os elementos detectados:
"""

    # Instruções de formato JSON dinâmico
    json_fields = []
    
    # Campos comuns
    json_fields.append('      "indice": 1,')
    json_fields.append('      "tipo": "arvore",')
    json_fields.append('      "apelido": "Árvore Copa Ampla",')
    json_fields.append('      "especie": "",')
    json_fields.append('      "familia": "",')
    json_fields.append('      "observacoes": "Descrição visual",')
    if params.get('count_individuals', False):
        json_fields.append('      "numero_individuos": 5,  // QUANTIDADE TOTAL de plantas deste morfotipo (NÃO é ID!)')
    json_fields.append('      "cobertura": 5,')
    
    # Campos específicos dinâmicos
    specific_fields = []
    
    if 'trees' in life_forms:
        specific_fields.append('      // Para arvore:')
        specific_fields.append('      "diametro_copa_m": 8.5,')
        specific_fields.append('      "area_copa_estimada_m2": 56.7,')
        specific_fields.append('      "altura_m": 12,')
        specific_fields.append('      "dap_estimado_cm": 35,')
        specific_fields.append('      "vigor": "bom",')
        
    if 'saplings' in life_forms:
        specific_fields.append('      // Para muda:')
        specific_fields.append('      "sobrevivencia": "viva",')
        specific_fields.append('      "vigor": "bom",')
        specific_fields.append('      "altura_cm": 80,')
        specific_fields.append('      "qualidade_plantio": "adequada",')
        
    if params.get('include_erosion', True):
        specific_fields.append('      // Para solo/erosao:')
        specific_fields.append('      "tipo_erosao": "sulcos",')
        specific_fields.append('      "severidade": "moderada",')
        
    if params.get('include_anthropic', True):
        specific_fields.append('      // Para antropico:')
        specific_fields.append('      "tipo_antropico": "fogo",')
        specific_fields.append('      "intensidade": "alta",')
        
    if params.get('include_fauna', True):
        specific_fields.append('      // Para fauna_nativa ou pecuaria:')
        specific_fields.append('      "tipo_animal": "bovino",')
        specific_fields.append('      "tipo_evidencia": "avistamento",')
        specific_fields.append('      "quantidade_estimada": 5,')
        
    # Construir o JSON de exemplo
    json_example = "{\n  \"entidades\": [\n    {\n"
    json_example += "\n".join(json_fields) + "\n"
    json_example += '      "areas": [[{"x":42.25,"y":18.50}, {"x":48.80,"y":16.75}, {"x":55.15,"y":17.20}, {"x":60.60,"y":20.90}, {"x":64.45,"y":27.35}, {"x":65.85,"y":35.40}, {"x":63.20,"y":43.15}, {"x":57.75,"y":49.80}, {"x":50.30,"y":52.25}, {"x":42.55,"y":50.60}, {"x":36.80,"y":44.90}, {"x":35.45,"y":36.15}, {"x":37.20,"y":27.80}, {"x":40.25,"y":22.30}]],\n'
    
    if specific_fields:
        json_example += "\n" + "\n".join(specific_fields) + "\n"
        
    json_example += "    }\n  ],\n"
    json_example += '  "area_shape": {"points": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}]}\n'
    json_example += "}"

    prompt += f"""
📐 **FORMATO DE RESPOSTA (JSON):**

Retorne um objeto JSON com o array "entidades" contendo todos os elementos detectados.
Exemplo de estrutura esperada:

{json_example}
"""

    # Instruções especiais do template
    if 'special_instructions' in params:
        prompt += "\n🎯 **INSTRUÇÕES ESPECIAIS:**\n"
        for instruction in params['special_instructions']:
            prompt += f"- {instruction}\n"

    # Regras finais
    prompt += f"""

⚠️ **REGRAS CRÍTICAS:**
- Identifique entre {params.get('min_species', 1)} e {params.get('max_species', 30)} entidades
- Use apelidos descritivos e específicos
- ⚠️ **REGRA DE AGRUPAMENTO (CRÍTICA)**:
  - SE detectar vários indivíduos da MESMA ESPÉCIE/TIPO:
  - ❌ NÃO crie entradas separadas por localização (ex: "ipe norte", "ipe sul")
  - ✅ CRIE APENAS UMA entrada JSON para essa espécie (ex: "Ipe Amarelo")
  - ✅ SOME todos os indivíduos em "numero_individuos"
  - ✅ Inclua TODOS os polígonos na lista "areas" dessa única entrada
  - Exemplo correto: Uma entrada "Ipe", numero_individuos=5, areas=[5 polígonos]
- Use "area_shape": {{"points":[{{"x":0,"y":0}},{{"x":100,"y":0}},{{"x":100,"y":100}},{{"x":0,"y":100}}]}}
- Mantenha o JSON compacto e válido
- NÃO deixe campos obrigatórios vazios

📐 **PRECISÃO DE POLÍGONOS (OBRIGATÓRIO):**
- Cada polígono DEVE ter **mínimo 12-16 pontos** (contornos suaves e precisos)
- Coordenadas DEVEM ter **2 casas decimais** (ex: 45.75, 23.18)
- Polígonos DEVEM seguir o **contorno real** da copa/vegetação
- ❌ PROIBIDO usar quadrados, retângulos ou hexágonos regulares
- Sistema de coordenadas: x=0-100 (esquerda→direita), y=0-100 (topo→fundo)

Retorne APENAS JSON válido sem marcadores markdown."""

    return prompt


def get_template_list():
    """Retorna lista de templates disponíveis"""
    templates = []
    for key, value in PROMPT_TEMPLATES.items():
        template_info = {
            'id': key,
            'name': value['name'],
            'description': value['description'],
            'objective': value['objective'],
            'featured': value.get('featured', False),
            'analysis_mode': value.get('analysis_mode', 'herbaceous')
        }
        templates.append(template_info)
    
    # Ordenar para que featured apareça primeiro
    templates.sort(key=lambda x: (not x['featured'], x['name']))
    return templates


def get_template_params(template_name):
    """Retorna parâmetros de um template específico"""
    if template_name in PROMPT_TEMPLATES:
        return PROMPT_TEMPLATES[template_name]['params'].copy()
    return PROMPT_TEMPLATES['default']['params'].copy()
