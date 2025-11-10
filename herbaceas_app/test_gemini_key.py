"""
Script para testar se a chave API do Gemini está funcionando
"""
import google.generativeai as genai
import os

# Teste 1: Verificar se a biblioteca está instalada
print("✓ Biblioteca google-generativeai instalada")

# Teste 2: Obter chave do ambiente ou solicitar
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    api_key = input("Cole sua chave API do Gemini aqui: ").strip()

print(f"\n🔑 Testando chave: {api_key[:20]}...")
print(f"📏 Tamanho da chave: {len(api_key)} caracteres")

# Teste 3: Validar formato básico
if not api_key.startswith("AIza"):
    print("⚠️ AVISO: Chave não parece estar no formato correto (deveria começar com 'AIza')")
else:
    print("✓ Formato da chave parece correto")

# Teste 4: Fazer uma requisição simples
try:
    genai.configure(api_key=api_key)
    
    print("\n🧪 Testando modelos disponíveis...")
    
    # Listar modelos disponíveis
    models = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
        print(f"✓ Encontrados {len(models)} modelos disponíveis")
        if models:
            print(f"   Exemplos: {', '.join(models[:3])}")
    except Exception as e:
        print(f"⚠️ Não foi possível listar modelos: {e}")
    
    # Teste com modelo flash
    print("\n🧪 Fazendo requisição de teste com gemini-flash-latest...")
    
    generation_config = {
        "temperature": 0.4,
        "max_output_tokens": 50,
    }
    
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE"
        }
    ]
    
    model = genai.GenerativeModel(
        model_name='gemini-flash-latest',
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    
    response = model.generate_content("Responda apenas: funcionando")
    
    print(f"✅ SUCESSO! Gemini respondeu: {response.text}")
    print("\n✓ Sua chave API está funcionando corretamente!")
    
    # Informações sobre limites
    print("\n📊 Informações sobre limites do Gemini:")
    print("   • Versão gratuita: 60 requisições/minuto")
    print("   • gemini-flash-latest: Mais rápido e eficiente")
    print("   • gemini-pro-latest: Mais preciso para tarefas complexas")
    
except Exception as e:
    print(f"\n❌ ERRO: {type(e).__name__}")
    print(f"   {e}")
    print("\n📝 Instruções:")
    print("   1. Acesse: https://aistudio.google.com/app/apikey")
    print("   2. Clique em 'Create API key'")
    print("   3. Copie a chave (começa com 'AIza')")
    print("   4. A chave é GRATUITA com limite de 60 req/min")
