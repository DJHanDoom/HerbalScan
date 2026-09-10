# -*- mode: python ; coding: utf-8 -*-
import sys
from pathlib import Path
from PyInstaller.utils.hooks import collect_all

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

# BUGFIX: "AttributeError: module 'aiohttp' has no attribute 'ClientResponse'"
# ao abrir o .exe instalado numa maquina diferente (nunca aconteceu nos
# nossos testes, so em instalacao limpa de terceiro - herbalscan_error.log).
# google.generativeai importa, no proprio __init__.py, uma cadeia ate
# google.auth.aio.transport.aiohttp - e essa cadeia (aiohttp, google.auth,
# google.api_core, generativelanguage_v1beta, grpc, proto-plus) e formada
# por pacotes com imports dinamicos/C-extensions que a analise ESTATICA do
# PyInstaller frequentemente coleta PELA METADE (alguns .py chegam, outros
# nao) sem lancar erro nenhum durante o build - o pacote so aparenta estar
# quebrado em runtime, numa maquina sem cache de import "vazando" de uma
# instalacao Python do sistema pra mascarar o problema (o que explica
# funcionar em algumas maquinas e nao em outras). collect_all() força a
# coleta COMPLETA (.py + binarios compilados + dados) de cada pacote,
# em vez de confiar so na analise estatica de import.
_full_collect_packages = [
    'aiohttp',
    'google.generativeai',
    'google.auth',
    'google.api_core',
    'google.ai.generativelanguage_v1beta',
    'grpc',
    'proto',
    'google.protobuf',
]
_collected_binaries = []
_collected_hiddenimports = []
for _pkg in _full_collect_packages:
    try:
        _pkg_datas, _pkg_binaries, _pkg_hiddenimports = collect_all(_pkg)
        added_files += _pkg_datas
        _collected_binaries += _pkg_binaries
        _collected_hiddenimports += _pkg_hiddenimports
    except Exception as _e:
        print(f"[HerbalScan.spec] Aviso: collect_all falhou para {_pkg}: {_e}")

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=_collected_binaries,
    datas=added_files,
    hiddenimports=_collected_hiddenimports + [
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
        # Adicionados: usados por app.py (import local dentro de função) mas
        # nao detectados de forma confiavel pela analise estatica do PyInstaller.
        'polygon_utils',
        'shapely',
        'shapely.geometry',
        'shapely.geos',
        'PIL',
        'PIL.Image',
        'PIL.ImageDraw',
        'PIL.ImageFont',
        'reportlab',
        'reportlab.pdfgen',
        'reportlab.pdfgen.canvas',
        'reportlab.lib',
        'reportlab.lib.pagesizes',
        'reportlab.lib.styles',
        'reportlab.lib.units',
        'reportlab.lib.enums',
        'reportlab.lib.utils',
        'reportlab.platypus',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        # numpy NAO pode ser excluido: shapely (Camada 3 - calculo de
        # cobertura) depende dele internamente. Excluir causava
        # "ModuleNotFoundError: No module named 'numpy'" ao chamar
        # /api/recalculate-coverage no .exe empacotado (confirmado em teste
        # real do build 2026-09-03).
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
    icon='icon.ico',
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
