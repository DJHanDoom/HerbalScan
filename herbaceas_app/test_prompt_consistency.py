"""
Script para testar a consistência dos prompts gerados
Verifica se as instruções de inclusão/exclusão são consistentes
"""
from prompt_templates import build_prompt

def test_solo_exposto():
    print("=" * 80)
    print("TESTE 1: Solo Exposto INCLUÍDO, Serapilheira EXCLUÍDA")
    print("=" * 80)
    
    params = {
        'include_soil': True,
        'include_litter': False,
        'max_species': 8,
        'min_species': 3
    }
    
    prompt = build_prompt('default', params)
    
    # Verificar seções do prompt
    print("\n✅ Verificando se 'Solo Exposto' está nas OUTRAS CATEGORIAS:")
    if "Solo Exposto" in prompt and "- **Solo Exposto**" in prompt:
        print("   CORRETO: Solo Exposto listado como categoria válida")
    else:
        print("   ❌ ERRO: Solo Exposto não listado!")
    
    print("\n✅ Verificando se 'Serapilheira' está nas EXCLUSÕES:")
    if "⛔" in prompt and "Serapilheira" in prompt and "NÃO INCLUA" in prompt:
        print("   CORRETO: Serapilheira nas exclusões")
    else:
        print("   ❌ ERRO: Serapilheira deveria estar nas exclusões!")
    
    print("\n✅ Verificando instrução de IGNORAR:")
    if "Se houver serapilheira, IGNORE-a" in prompt and "solo exposto" not in prompt.lower().split("ignore")[1]:
        print("   CORRETO: Instrução específica para ignorar apenas serapilheira")
    else:
        print("   ⚠️ AVISO: Instrução de ignorar pode estar ambígua")
    
    print("\n✅ Verificando seção CRÍTICO:")
    if "Solo exposto: INCLUIR" in prompt and "Serapilheira: NÃO INCLUIR" in prompt:
        print("   CORRETO: Seção CRÍTICO consistente")
    else:
        print("   ❌ ERRO: Seção CRÍTICO inconsistente!")


def test_ambos_incluidos():
    print("\n" + "=" * 80)
    print("TESTE 2: Solo Exposto E Serapilheira INCLUÍDOS")
    print("=" * 80)
    
    params = {
        'include_soil': True,
        'include_litter': True,
        'max_species': 8,
        'min_species': 3
    }
    
    prompt = build_prompt('default', params)
    
    print("\n✅ Verificando se ambos estão nas OUTRAS CATEGORIAS:")
    if "Solo Exposto" in prompt and "Serapilheira" in prompt:
        print("   CORRETO: Ambos listados como categorias válidas")
    else:
        print("   ❌ ERRO: Alguma categoria não listada!")
    
    print("\n✅ Verificando se NÃO há seção de EXCLUSÕES:")
    if "⛔" not in prompt or "NÃO INCLUA AS SEGUINTES CATEGORIAS" not in prompt:
        print("   CORRETO: Nenhuma exclusão (ambos permitidos)")
    else:
        print("   ❌ ERRO: Não deveria haver exclusões!")
    
    print("\n✅ Verificando se NÃO há instrução de IGNORAR:")
    ignore_section = prompt[prompt.find("OUTRAS CATEGORIAS"):prompt.find("4. **LIMITE**")] if "4. **LIMITE**" in prompt else prompt
    if "IGNORE" not in ignore_section:
        print("   CORRETO: Nenhuma instrução de ignorar")
    else:
        print("   ⚠️ AVISO: Há instrução de ignorar quando não deveria!")


def test_ambos_excluidos():
    print("\n" + "=" * 80)
    print("TESTE 3: Solo Exposto E Serapilheira EXCLUÍDOS")
    print("=" * 80)
    
    params = {
        'include_soil': False,
        'include_litter': False,
        'max_species': 8,
        'min_species': 3
    }
    
    prompt = build_prompt('default', params)
    
    print("\n✅ Verificando se ambos estão nas EXCLUSÕES:")
    if "⛔" in prompt and "Solo Exposto" in prompt and "Serapilheira" in prompt and "NÃO INCLUA" in prompt:
        print("   CORRETO: Ambos nas exclusões")
    else:
        print("   ❌ ERRO: Exclusões não configuradas corretamente!")
    
    print("\n✅ Verificando instrução de IGNORAR ambos:")
    if "solo exposto ou serapilheira, IGNORE-os" in prompt.lower():
        print("   CORRETO: Instrução para ignorar ambos")
    else:
        print("   ⚠️ AVISO: Instrução de ignorar pode estar incompleta")
    
    print("\n✅ Verificando seção CRÍTICO:")
    if "Solo exposto: NÃO INCLUIR" in prompt and "Serapilheira: NÃO INCLUIR" in prompt:
        print("   CORRETO: Seção CRÍTICO consistente")
    else:
        print("   ❌ ERRO: Seção CRÍTICO inconsistente!")


if __name__ == "__main__":
    print("\n🧪 TESTANDO CONSISTÊNCIA DE PROMPTS\n")
    
    test_solo_exposto()
    test_ambos_incluidos()
    test_ambos_excluidos()
    
    print("\n" + "=" * 80)
    print("✅ TESTES CONCLUÍDOS")
    print("=" * 80)
