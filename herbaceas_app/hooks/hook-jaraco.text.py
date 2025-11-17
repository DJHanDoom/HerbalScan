# Hook for setuptools._vendor.jaraco.text to include data files
from PyInstaller.utils.hooks import collect_data_files
from pathlib import Path

# O jaraco.text está em setuptools/_vendor
datas = []
hiddenimports = []

try:
    # Tentar coletar do setuptools._vendor.jaraco.text
    import setuptools
    setuptools_path = Path(setuptools.__file__).parent
    jaraco_text_path = setuptools_path / '_vendor' / 'jaraco' / 'text'

    if jaraco_text_path.exists():
        # Adicionar todos os arquivos .txt (incluindo "Lorem ipsum.txt")
        # O caminho de destino deve ser: setuptools/_vendor/jaraco/text
        for txt_file in jaraco_text_path.glob('*.txt'):
            # Caminho de destino: setuptools/_vendor/jaraco/text (sem o nome do arquivo)
            dest_dir = 'setuptools/_vendor/jaraco/text'
            datas.append((str(txt_file), dest_dir))
            print(f"[HOOK] Adicionado: {txt_file.name} -> {dest_dir}")
            
        print(f"[HOOK] Total de {len(datas)} arquivos de dados de jaraco.text adicionados")
    else:
        print(f"[HOOK] AVISO: jaraco_text_path nao existe: {jaraco_text_path}")
        
except Exception as e:
    print(f"[HOOK] Erro ao coletar jaraco.text: {e}")
    import traceback
    traceback.print_exc()
