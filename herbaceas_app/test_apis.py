"""
Script de Teste Rápido para APIs de IA
Execute para verificar qual modelo está funcionando
"""

import os
import sys

# Verificar qual modelo testar
print("=" * 60)
print("TESTE DE MODELOS DE IA")
print("=" * 60)
print()

# 1. Verificar Gemini
print("🔍 Testando GEMINI...")
try:
    import google.generativeai as genai
    
    api_key = os.environ.get("GOOGLE_API_KEY") or input("Cole sua API key do Gemini (ou Enter para pular): ").strip()
    
    if api_key:
        genai.configure(api_key=api_key)
        
        # Testar modelos
        modelos = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro']
        
        for modelo in modelos:
            try:
                print(f"  Testando {modelo}...", end=" ")
                model = genai.GenerativeModel(modelo)
                response = model.generate_content("Diga 'ok' se você está funcionando")
                print(f"✅ FUNCIONANDO!")
                print(f"     → Use este modelo: {modelo}")
                break
            except Exception as e:
                error = str(e)[:100]
                print(f"❌ Erro: {error}")
        else:
            print("  ⚠️ Nenhum modelo Gemini funcionou")
    else:
        print("  ⏭️ Pulado (sem API key)")
except Exception as e:
    print(f"  ❌ Erro ao importar: {e}")

print()

# 2. Verificar Claude
print("🔍 Testando CLAUDE...")
try:
    import anthropic
    
    api_key = os.environ.get("ANTHROPIC_API_KEY") or input("Cole sua API key do Claude (ou Enter para pular): ").strip()
    
    if api_key:
        client = anthropic.Anthropic(api_key=api_key)
        
        modelos = [
            "claude-3-5-sonnet-20241022",
            "claude-3-5-sonnet-20240620",
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307"
        ]
        
        for modelo in modelos:
            try:
                print(f"  Testando {modelo}...", end=" ")
                message = client.messages.create(
                    model=modelo,
                    max_tokens=10,
                    messages=[{"role": "user", "content": "Responda apenas 'ok'"}]
                )
                print(f"✅ FUNCIONANDO!")
                print(f"     → Use este modelo: {modelo}")
                break
            except Exception as e:
                error = str(e)[:100]
                print(f"❌ Erro: {error}")
        else:
            print("  ⚠️ Nenhum modelo Claude funcionou")
    else:
        print("  ⏭️ Pulado (sem API key)")
except Exception as e:
    print(f"  ❌ Erro ao importar: {e}")

print()

# 3. Verificar GPT-4
print("🔍 Testando GPT-4...")
try:
    import openai
    
    api_key = os.environ.get("OPENAI_API_KEY") or input("Cole sua API key do OpenAI (ou Enter para pular): ").strip()
    
    if api_key:
        client = openai.OpenAI(api_key=api_key)
        
        modelos = ["gpt-4o", "gpt-4-turbo", "gpt-4"]
        
        for modelo in modelos:
            try:
                print(f"  Testando {modelo}...", end=" ")
                response = client.chat.completions.create(
                    model=modelo,
                    messages=[{"role": "user", "content": "Responda apenas 'ok'"}],
                    max_tokens=10
                )
                print(f"✅ FUNCIONANDO!")
                print(f"     → Use este modelo: {modelo}")
                break
            except Exception as e:
                error = str(e)[:100]
                print(f"❌ Erro: {error}")
        else:
            print("  ⚠️ Nenhum modelo GPT-4 funcionou")
    else:
        print("  ⏭️ Pulado (sem API key)")
except Exception as e:
    print(f"  ❌ Erro ao importar: {e}")

print()
print("=" * 60)
print("RESUMO:")
print("✅ = Modelo funcionando - USE ESTE!")
print("❌ = Modelo com erro")
print("⏭️ = Teste pulado (sem API key)")
print()
print("RECOMENDAÇÃO:")
print("1. Use o primeiro modelo que mostrou ✅")
print("2. Se nenhum funcionou, verifique suas API keys")
print("3. Gemini é GRATUITO - recomendado se funcionou")
print("=" * 60)
