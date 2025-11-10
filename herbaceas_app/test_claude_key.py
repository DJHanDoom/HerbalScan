"""
Script para testar se a chave API do Claude está funcionando
"""
import anthropic
import os

# Teste 1: Verificar se a biblioteca está instalada
print("✓ Biblioteca anthropic instalada")

# Teste 2: Obter chave do ambiente ou solicitar
api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    api_key = input("Cole sua chave API do Claude aqui: ").strip()

print(f"\n🔑 Testando chave: {api_key[:15]}...")
print(f"📏 Tamanho da chave: {len(api_key)} caracteres")

# Teste 3: Validar formato básico
if not api_key.startswith("sk-ant-"):
    print("⚠️ AVISO: Chave não parece estar no formato correto (deveria começar com 'sk-ant-')")
else:
    print("✓ Formato da chave parece correto")

# Teste 4: Fazer uma requisição simples
try:
    client = anthropic.Anthropic(api_key=api_key)
    
    print("\n🧪 Fazendo requisição de teste...")
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=50,
        messages=[
            {
                "role": "user",
                "content": "Responda apenas: funcionando"
            }
        ]
    )
    
    response = message.content[0].text
    print(f"✅ SUCESSO! Claude respondeu: {response}")
    print("\n✓ Sua chave API está funcionando corretamente!")
    
except anthropic.AuthenticationError as e:
    print(f"\n❌ ERRO DE AUTENTICAÇÃO:")
    print(f"   Chave API inválida ou expirada")
    print(f"   Detalhes: {e}")
    print("\n📝 Instruções:")
    print("   1. Acesse: https://console.anthropic.com/settings/keys")
    print("   2. Crie uma nova chave API")
    print("   3. Copie a chave (começa com 'sk-ant-')")
    print("   4. Adicione créditos à sua conta Anthropic se necessário")
    
except Exception as e:
    print(f"\n❌ ERRO: {type(e).__name__}")
    print(f"   {e}")
