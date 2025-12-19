
import sys
import os

# Adapt path to import prompt_templates
sys.path.append(r'c:\LEGACY\HERBAL SCAN\herbaceas_app')

from prompt_templates import build_prompt

def test_normalization():
    print("Testing Prompt Normalization Logic\n")
    
    # Test Case 1: Standard (No normalization forced, No Soil/Litter)
    params_1 = {
        'include_soil': False,
        'include_litter': False,
        'normalize_coverage': False,
        'taxonomic_precision': 'moderate',
        'detail_level': 'medium',
        'min_species': 1,
        'max_species': 8,
        'separate_grasses': True,
        'include_genus': 'when_possible',
        'include_family': 'when_clear',
         'focus_functional': False,
         'focus_succession': False,
         'focus_carbon': False,
    }
    prompt_1 = build_prompt("default", params_1)
    
    if "A soma PODE ser MENOR que 100%" in prompt_1:
         print("✅ Case 1 Passed: Correctly warns sum can be < 100%")
    else:
         print("❌ Case 1 Failed: Should warn sum can be < 100%")

    # Test Case 2: Normalization Enabled
    params_2 = params_1.copy()
    params_2['normalize_coverage'] = True
    
    prompt_2 = build_prompt("default", params_2)
    
    if "Normalização Ativada" in prompt_2 and "soma de coberturas DEVE ser ~100%" in prompt_2:
         print("✅ Case 2 Passed: Correctly instructs to normalize to 100%")
    else:
         print("❌ Case 2 Failed: Did not find normalization instruction")
         print("Snippet found around coverage:")
         start = prompt_2.find("5. **cobertura**")
         print(prompt_2[start:start+300])

if __name__ == "__main__":
    test_normalization()
