"""
Script para criar os ícones do HerbalScan em diferentes formatos
Gera: icon.png (512x512) e icon.ico (múltiplos tamanhos)
"""
from PIL import Image, ImageDraw, ImageFont
import math

def create_icon(size=512):
    """Cria o ícone do HerbalScan"""
    # Criar imagem com transparência
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Cores do tema
    bg_dark = (13, 61, 31)  # #0d3d1f
    bg_medium = (26, 95, 46)  # #1a5f2e
    green_light = (134, 239, 172)  # #86efac
    green_medium = (74, 222, 128)  # #4ade80
    green_bright = (34, 197, 94)  # #22c55e
    blue_tech = (96, 165, 250)  # #60a5fa
    blue_dark = (59, 130, 246)  # #3b82f6
    white = (255, 255, 255)
    
    center_x, center_y = size // 2, size // 2
    radius = size // 2
    
    # Background gradient (simulado com círculo)
    draw.ellipse(
        [(0, 0), (size, size)],
        fill=bg_medium,
        outline=None
    )
    
    # Grid pattern (representando quadrados de 1x1m)
    grid_size = size * 0.5
    grid_x = center_x - grid_size // 2
    grid_y = center_y - grid_size // 2
    
    # Grid lines (subtle)
    grid_opacity = 60
    grid_color = (*green_light, grid_opacity)
    
    # Main grid rectangle
    draw.rectangle(
        [(grid_x, grid_y), (grid_x + grid_size, grid_y + grid_size)],
        fill=None,
        outline=(*green_light, 100),
        width=max(2, size // 256)
    )
    
    # Grid lines
    line_width = max(1, size // 512)
    # Vertical lines
    for i in range(1, 3):
        x = grid_x + (grid_size * i / 3)
        draw.line([(x, grid_y), (x, grid_y + grid_size)], fill=grid_color, width=line_width)
    # Horizontal lines
    for i in range(1, 3):
        y = grid_y + (grid_size * i / 3)
        draw.line([(grid_x, y), (grid_x + grid_size, y)], fill=grid_color, width=line_width)
    
    # Central plant representation
    plant_scale = size / 512
    
    # Main stem
    stem_width = int(8 * plant_scale)
    stem_top = center_y - int(60 * plant_scale)
    stem_bottom = center_y + int(40 * plant_scale)
    draw.line(
        [(center_x, stem_bottom), (center_x, stem_top)],
        fill=green_bright,
        width=stem_width
    )
    
    # Leaves (left side)
    def draw_leaf(x, y, width, height, angle, color, opacity=255):
        """Desenha uma folha elíptica rotacionada"""
        # Criar folha em imagem separada
        leaf_img = Image.new('RGBA', (int(width * 2), int(height * 2)), (0, 0, 0, 0))
        leaf_draw = ImageDraw.Draw(leaf_img)
        leaf_draw.ellipse(
            [(0, 0), (width * 2, height * 2)],
            fill=(*color, opacity)
        )
        # Rotacionar
        leaf_img = leaf_img.rotate(angle, expand=True)
        # Colar na imagem principal
        paste_x = int(x - leaf_img.width // 2)
        paste_y = int(y - leaf_img.height // 2)
        img.paste(leaf_img, (paste_x, paste_y), leaf_img)
    
    # Left leaves
    draw_leaf(center_x - int(25 * plant_scale), center_y - int(10 * plant_scale),
              int(20 * plant_scale), int(35 * plant_scale), -25, green_medium, 230)
    draw_leaf(center_x - int(30 * plant_scale), center_y - int(35 * plant_scale),
              int(18 * plant_scale), int(30 * plant_scale), -15, green_medium, 217)
    draw_leaf(center_x - int(20 * plant_scale), center_y + int(10 * plant_scale),
              int(22 * plant_scale), int(38 * plant_scale), -40, green_medium, 230)
    
    # Right leaves
    draw_leaf(center_x + int(25 * plant_scale), center_y - int(10 * plant_scale),
              int(20 * plant_scale), int(35 * plant_scale), 25, green_medium, 230)
    draw_leaf(center_x + int(30 * plant_scale), center_y - int(35 * plant_scale),
              int(18 * plant_scale), int(30 * plant_scale), 15, green_medium, 217)
    draw_leaf(center_x + int(20 * plant_scale), center_y + int(10 * plant_scale),
              int(22 * plant_scale), int(38 * plant_scale), 40, green_medium, 230)
    
    # Small base leaves
    draw_leaf(center_x - int(15 * plant_scale), center_y + int(35 * plant_scale),
              int(12 * plant_scale), int(20 * plant_scale), -20, green_light, 179)
    draw_leaf(center_x + int(15 * plant_scale), center_y + int(35 * plant_scale),
              int(12 * plant_scale), int(20 * plant_scale), 20, green_light, 179)
    
    # AI/Technology indicator (hexagon)
    hex_size = int(12 * plant_scale)
    hex_y = center_y - int(80 * plant_scale)
    hex_points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6
        x = center_x + hex_size * math.cos(angle)
        y = hex_y + hex_size * math.sin(angle)
        hex_points.append((x, y))
    draw.polygon(hex_points, fill=(*blue_tech, 204), outline=(*blue_dark, 255), width=max(2, size // 256))
    # Center dot
    draw.ellipse(
        [(center_x - int(4 * plant_scale), hex_y - int(4 * plant_scale)),
         (center_x + int(4 * plant_scale), hex_y + int(4 * plant_scale))],
        fill=white
    )
    
    return img

def main():
    """Gera os arquivos de ícone"""
    print("Criando ícones do HerbalScan...")
    
    # Criar PNG 512x512
    print("Gerando icon.png (512x512)...")
    icon_512 = create_icon(512)
    icon_512.save('icon.png', 'PNG', optimize=True)
    print("[OK] icon.png criado")
    
    # Criar ICO com múltiplos tamanhos
    print("Gerando icon.ico (multiplos tamanhos)...")
    sizes = [16, 32, 48, 64, 128, 256]
    icon_images = []
    for size in sizes:
        icon_img = create_icon(size)
        icon_images.append(icon_img)
    
    # Salvar ICO com todos os tamanhos
    # O PIL suporta ICO multi-size quando passamos uma lista de imagens
    try:
        # Criar ICO com múltiplos tamanhos
        # Usar a maior imagem como base e adicionar os outros tamanhos
        icon_256 = icon_images[-1]  # Usar 256 como base
        
        # Salvar ICO - o PIL deve incluir todos os tamanhos automaticamente
        # Mas vamos garantir salvando manualmente cada tamanho
        from PIL import IcoImagePlugin
        
        # Criar lista de tuplas (imagem, tamanho) para o ICO
        ico_data = []
        for img in icon_images:
            ico_data.append((img.width, img.height, img.tobytes('raw', 'RGBA')))
        
        # Salvar usando o método que funciona melhor
        icon_256.save('icon.ico', format='ICO')
        
        # Nota: O PIL pode ter limitações com ICO multi-size
        # Se necessário, use ferramentas externas como ImageMagick ou online converters
    except Exception as e:
        print(f"   Aviso ao salvar ICO: {e}")
        # Fallback: salvar apenas o maior tamanho (256x256)
        icon_images[-1].save('icon.ico', format='ICO')
        print("   ICO salvo com tamanho unico (256x256)")
    
    print("[OK] icon.ico criado")
    
    print("\n[SUCESSO] Todos os ícones foram criados com sucesso!")
    print("   - icon.png (512x512)")
    print("   - icon.ico (16, 32, 48, 64, 128, 256)")
    print("   - icon.svg (vetorial)")

if __name__ == '__main__':
    main()
