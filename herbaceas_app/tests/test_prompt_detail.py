"""
Script para visualizar o prompt completo e verificar detalhes
"""
from prompt_templates import build_prompt

print("=" * 80)
print("PROMPT COMPLETO - Solo Exposto INCLUÍDO, Serapilheira EXCLUÍDA")
print("=" * 80)

params = {
    'include_soil': True,
    'include_litter': False,
    'max_species': 8,
    'min_species': 3
}

prompt = build_prompt('default', params)
print(prompt)

print("\n\n" + "=" * 80)
print("PROMPT COMPLETO - Ambos INCLUÍDOS")
print("=" * 80)

params2 = {
    'include_soil': True,
    'include_litter': True,
    'max_species': 8,
    'min_species': 3
}

prompt2 = build_prompt('default', params2)
print(prompt2)
