"""
Teste para verificar se o endpoint /api/templates/custom/list retorna os params
"""
import json
import os

custom_templates_dir = 'custom_templates'

if not os.path.exists(custom_templates_dir):
    print("❌ Diretório custom_templates não existe")
    exit(1)

templates = []
for filename in os.listdir(custom_templates_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(custom_templates_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                template_data = json.load(f)
                templates.append({
                    'filename': filename,
                    'name': template_data.get('name', filename),
                    'description': template_data.get('description', ''),
                    'created_at': template_data.get('created_at'),
                    'params': template_data.get('params', {}),
                    'params_count': len(template_data.get('params', {}))
                })
                
                print(f"\n✅ Template: {filename}")
                print(f"   Nome: {template_data.get('name')}")
                print(f"   Params incluídos: {len(template_data.get('params', {}))} parâmetros")
                print(f"   Params: {json.dumps(template_data.get('params', {}), indent=2)}")
                
        except Exception as e:
            print(f"❌ Erro ao ler template {filename}: {e}")
            continue

print(f"\n📋 Total de templates: {len(templates)}")
print(f"\n🔍 Resposta do endpoint (simulada):")
print(json.dumps({'templates': templates}, indent=2))
