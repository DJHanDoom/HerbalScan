"""
Script para converter o icon.png em icon.ico e outros formatos necessários
"""
from PIL import Image
import os

def convert_png_to_ico():
    """Converte icon.png para icon.ico com múltiplos tamanhos"""
    print("Convertendo icon.png para icon.ico...")
    
    # Verificar se icon.png existe
    if not os.path.exists('icon.png'):
        print("ERRO: icon.png nao encontrado!")
        return False
    
    # Carregar o PNG original
    try:
        original = Image.open('icon.png')
        print(f"PNG carregado: {original.size}, Modo: {original.mode}")
    except Exception as e:
        print(f"ERRO ao carregar icon.png: {e}")
        return False
    
    # Converter para RGBA se necessário
    if original.mode != 'RGBA':
        print(f"Convertendo de {original.mode} para RGBA...")
        original = original.convert('RGBA')
    
    # Tamanhos necessários para ICO
    sizes = [16, 32, 48, 64, 128, 256]
    icon_images = []
    
    print("Gerando tamanhos para ICO:")
    for size in sizes:
        # Redimensionar mantendo qualidade
        resized = original.resize((size, size), Image.Resampling.LANCZOS)
        icon_images.append(resized)
        print(f"  - {size}x{size} OK")
    
    # Salvar ICO
    try:
        # Usar a maior imagem como base
        icon_images[-1].save(
            'icon.ico',
            format='ICO',
            sizes=[(img.width, img.height) for img in icon_images]
        )
        print("[OK] icon.ico criado com sucesso!")
    except Exception as e:
        print(f"AVISO: Erro ao salvar ICO multi-size: {e}")
        # Fallback: salvar apenas o maior tamanho
        icon_images[-1].save('icon.ico', format='ICO')
        print("[OK] icon.ico criado (tamanho unico 256x256)")
    
    return True

def create_svg_from_png():
    """Cria um SVG simples referenciando o PNG (ou cria um placeholder)"""
    print("\nCriando icon.svg...")
    
    # Criar SVG que referencia o PNG
    svg_content = f'''<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <pattern id="iconPattern" patternUnits="userSpaceOnUse" width="512" height="512">
      <image xlink:href="icon.png" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="url(#iconPattern)"/>
</svg>'''
    
    try:
        with open('icon.svg', 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print("[OK] icon.svg criado")
        return True
    except Exception as e:
        print(f"ERRO ao criar icon.svg: {e}")
        return False

def verify_files():
    """Verifica se todos os arquivos necessários existem"""
    print("\nVerificando arquivos...")
    files = {
        'icon.png': 'PNG principal',
        'icon.ico': 'ICO para Windows',
        'icon.svg': 'SVG vetorial'
    }
    
    all_ok = True
    for filename, description in files.items():
        if os.path.exists(filename):
            size = os.path.getsize(filename)
            print(f"  [OK] {filename} - {description} ({size:,} bytes)")
        else:
            print(f"  [FALTA] {filename} - {description}")
            all_ok = False
    
    return all_ok

def main():
    """Função principal"""
    print("=" * 60)
    print("Conversao de Icones - HerbalScan")
    print("=" * 60)
    print()
    
    # Converter PNG para ICO
    if not convert_png_to_ico():
        print("\nFALHA na conversao!")
        return
    
    # Criar SVG
    create_svg_from_png()
    
    # Verificar arquivos
    print()
    verify_files()
    
    print("\n" + "=" * 60)
    print("[SUCESSO] Conversao concluida!")
    print("=" * 60)
    print("\nArquivos prontos:")
    print("  - icon.png (1024x1024) - Imagem principal")
    print("  - icon.ico - Para Windows/instalador")
    print("  - icon.svg - Versao vetorial")
    print("\nOs arquivos estao prontos para uso no instalador!")

if __name__ == '__main__':
    main()


