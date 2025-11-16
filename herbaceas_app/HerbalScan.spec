# -*- mode: python ; coding: utf-8 -*-
import sys
from pathlib import Path

block_cipher = None

# Coletar todos os arquivos necessários
added_files = [
    ('templates', 'templates'),
    ('static', 'static'),
    ('reference_species.json', '.'),
    ('prompt_templates.py', '.'),
    ('config_manager.py', '.'),
]

# Adicionar custom_templates se existir
if Path('custom_templates').exists():
    added_files.append(('custom_templates', 'custom_templates'))

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=added_files,
    hiddenimports=[
        'anthropic',
        'openai',
        'google.generativeai',
        'openpyxl',
        'openpyxl.cell._writer',
        'requests',
        'flask',
        'werkzeug',
        'jinja2',
        'prompt_templates',
        'config_manager',
        'tkinter',
        'webbrowser',
        'threading',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'numpy',
        'pandas',
        'pytest',
        'jupyter',
        'notebook',
        'IPython',
        'torch',
        'torchvision',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='HerbalScan',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Manter console para debug; mudar para False na versão final
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Adicione um ícone aqui se desejar: icon='icon.ico'
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='HerbalScan',
)
