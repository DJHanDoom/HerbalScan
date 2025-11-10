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
            "standardize_across_subplots": "moderate"  # none, conservative, moderate, aggressive
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
    
    # Construir prompt base
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

5. **cobertura** - Porcentagem (0-100), soma deve ser ~100%

6. **altura** - Altura média em cm (considere o quadrado de 1x1m como referência)

7. **forma_vida**: "Erva", "Arbusto", "Subarbusto", "Plântula", "Liana", "Trepadeira", ou "-" (para solo/serapilheira)

EXEMPLOS DE RESPOSTA (JSON válido, sem ```json):
{
  "especies": [
    {
      "apelido": "Gramínea Cespitosa Verde-Claro",
      "genero": "",
      "familia": "Poaceae",
      "observacoes": "Crescimento em touceiras densas, folhas lineares muito finas (<2mm largura), caules cilíndricos visíveis, cor verde-claro predominante com leve tonalidade amarelada, textura lisa e glabra, bainhas abertas características de Poaceae, algumas folhas senescentes nas pontas, altura variando 25-35cm",
      "cobertura": 45,
      "altura": 30,
      "forma_vida": "Erva"
    },
    {
      "apelido": "Leguminosa Trifoliolada Pilosa Dourada",
      "genero": "",
      "familia": "Fabaceae",
      "observacoes": "Folhas compostas trifolioladas (3 folíolos por folha), folíolos ovados a elípticos de 8-12mm comprimento, margem inteira, pilosidade densa de coloração dourada cobrindo lâmina e pecíolo, textura aveludada ao toque visual, estípulas pequenas presentes na base do pecíolo, crescimento prostrado a semi-ereto, cor verde-médio, altura 5-8cm",
      "cobertura": 10,
      "altura": 6,
      "forma_vida": "Erva"
    },
    {
      "apelido": "Plântula Dicotiledônea Pilosa Prateada",
      "genero": "",
      "familia": "",
      "observacoes": "Plântula jovem com 2 cotilédones ovados visíveis, 2-4 folhas verdadeiras em desenvolvimento, folhas lanceoladas de 10-15mm, pilosidade densa prateada em toda planta especialmente no hipocótilo e face abaxial das folhas, margem foliar inteira, cor verde-claro, crescimento ereto, altura 3-5cm",
      "cobertura": 5,
      "altura": 4,
      "forma_vida": "Plântula"
    }
  ]
}

REGRAS FINAIS:
"""

    if params['separate_grasses']:
        prompt += "✓ SEPARE Poaceae (caule cilíndrico) de Cyperaceae (caule triangular)\n"
    
    prompt += f"""✓ Crie {params['min_species']}-{params['max_species']} morfotipos baseados em características visuais
✓ Preencha "observacoes" SEMPRE com descrições {detail_desc.get(params['detail_level'], 'detalhadas')}
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
    
    prompt += "✓ Soma de coberturas = ~100%\n"
    
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
- **PRIORIZE PRECISÃO**: Na dúvida entre agrupar ou separar morfotipos, SEPARE!

Retorne APENAS JSON válido sem marcadores markdown."""

    return prompt


def get_template_list():
    """Retorna lista de templates disponíveis"""
    return [
        {
            'id': key,
            'name': value['name'],
            'description': value['description'],
            'objective': value['objective']
        }
        for key, value in PROMPT_TEMPLATES.items()
    ]


def get_template_params(template_name):
    """Retorna parâmetros de um template específico"""
    if template_name in PROMPT_TEMPLATES:
        return PROMPT_TEMPLATES[template_name]['params'].copy()
    return PROMPT_TEMPLATES['default']['params'].copy()
