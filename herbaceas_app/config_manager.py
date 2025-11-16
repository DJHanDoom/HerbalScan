"""
Gerenciador de configuração para o aplicativo HerbalScan.
Cria e gerencia o arquivo .env automaticamente.
"""
import os
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox
import webbrowser


def get_app_data_dir():
    """Retorna o diretório de dados do aplicativo."""
    if getattr(sys, 'frozen', False):
        # Se está rodando como executável
        app_dir = Path(os.path.dirname(sys.executable))
    else:
        # Se está rodando como script Python
        app_dir = Path(__file__).parent
    return app_dir


def get_env_path():
    """Retorna o caminho do arquivo .env"""
    return get_app_data_dir() / '.env'


def env_exists():
    """Verifica se o arquivo .env existe."""
    return get_env_path().exists()


def load_env():
    """Carrega as variáveis do arquivo .env."""
    env_path = get_env_path()
    if not env_path.exists():
        return {}

    env_vars = {}
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    except Exception as e:
        print(f"Erro ao ler .env: {e}")

    return env_vars


def save_env(config):
    """Salva as configurações no arquivo .env"""
    env_path = get_env_path()

    content = """# Configuração do HerbalScan
# Adicione suas chaves de API abaixo

# IA Padrão (gemini, claude, gpt4, deepseek, qwen, huggingface)
DEFAULT_AI={default_ai}

# Chaves de API
ANTHROPIC_API_KEY={anthropic_key}
OPENAI_API_KEY={openai_key}
GOOGLE_API_KEY={google_key}
DEEPSEEK_API_KEY={deepseek_key}
QWEN_API_KEY={qwen_key}
HUGGINGFACE_API_KEY={huggingface_key}
""".format(
        default_ai=config.get('DEFAULT_AI', 'gemini'),
        anthropic_key=config.get('ANTHROPIC_API_KEY', ''),
        openai_key=config.get('OPENAI_API_KEY', ''),
        google_key=config.get('GOOGLE_API_KEY', ''),
        deepseek_key=config.get('DEEPSEEK_API_KEY', ''),
        qwen_key=config.get('QWEN_API_KEY', ''),
        huggingface_key=config.get('HUGGINGFACE_API_KEY', '')
    )

    try:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Erro ao salvar .env: {e}")
        return False


class ConfigWizard:
    """Interface gráfica de configuração inicial."""

    def __init__(self):
        self.root = tk.Tk()
        self.root.title("HerbalScan - Configuração Inicial")
        self.root.geometry("700x650")
        self.root.resizable(False, False)

        # Centralizar janela
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (700 // 2)
        y = (self.root.winfo_screenheight() // 2) - (650 // 2)
        self.root.geometry(f"700x650+{x}+{y}")

        self.config = load_env()
        self.entries = {}

        self.create_widgets()

    def create_widgets(self):
        """Cria os widgets da interface."""
        # Header
        header = ttk.Frame(self.root)
        header.pack(fill='x', padx=20, pady=20)

        title = ttk.Label(
            header,
            text="🌿 Bem-vindo ao HerbalScan",
            font=('Segoe UI', 18, 'bold')
        )
        title.pack()

        subtitle = ttk.Label(
            header,
            text="Configure suas chaves de API para começar",
            font=('Segoe UI', 10)
        )
        subtitle.pack(pady=(5, 0))

        # Separator
        ttk.Separator(self.root, orient='horizontal').pack(fill='x', padx=20)

        # Main content
        content = ttk.Frame(self.root)
        content.pack(fill='both', expand=True, padx=20, pady=20)

        # IA Padrão
        default_ai_frame = ttk.LabelFrame(content, text="IA Padrão", padding=10)
        default_ai_frame.pack(fill='x', pady=(0, 15))

        self.ai_var = tk.StringVar(value=self.config.get('DEFAULT_AI', 'gemini'))

        ai_options = [
            ('Gemini (Google)', 'gemini'),
            ('Claude (Anthropic)', 'claude'),
            ('GPT-4 (OpenAI)', 'gpt4'),
            ('DeepSeek', 'deepseek'),
            ('Qwen (Alibaba)', 'qwen'),
            ('HuggingFace', 'huggingface')
        ]

        for text, value in ai_options:
            ttk.Radiobutton(
                default_ai_frame,
                text=text,
                value=value,
                variable=self.ai_var
            ).pack(anchor='w', pady=2)

        # API Keys
        keys_frame = ttk.LabelFrame(content, text="Chaves de API (opcional - configure quando necessário)", padding=10)
        keys_frame.pack(fill='both', expand=True)

        # Criar canvas com scrollbar
        canvas = tk.Canvas(keys_frame, height=250)
        scrollbar = ttk.Scrollbar(keys_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        api_keys = [
            ('GOOGLE_API_KEY', 'Google (Gemini)', 'https://aistudio.google.com/apikey'),
            ('ANTHROPIC_API_KEY', 'Anthropic (Claude)', 'https://console.anthropic.com/'),
            ('OPENAI_API_KEY', 'OpenAI (GPT)', 'https://platform.openai.com/api-keys'),
            ('DEEPSEEK_API_KEY', 'DeepSeek', 'https://platform.deepseek.com/'),
            ('QWEN_API_KEY', 'Qwen (Alibaba)', 'https://dashscope.aliyun.com/'),
            ('HUGGINGFACE_API_KEY', 'HuggingFace', 'https://huggingface.co/settings/tokens'),
        ]

        for i, (key, label, url) in enumerate(api_keys):
            frame = ttk.Frame(scrollable_frame)
            frame.pack(fill='x', pady=5)

            label_frame = ttk.Frame(frame)
            label_frame.pack(fill='x')

            ttk.Label(label_frame, text=label, font=('Segoe UI', 9, 'bold')).pack(side='left')

            link_btn = ttk.Button(
                label_frame,
                text="Obter chave",
                command=lambda u=url: webbrowser.open(u),
                width=12
            )
            link_btn.pack(side='right')

            entry = ttk.Entry(frame, show='*', width=60)
            entry.pack(fill='x', pady=(2, 0))
            entry.insert(0, self.config.get(key, ''))
            self.entries[key] = entry

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Buttons
        button_frame = ttk.Frame(self.root)
        button_frame.pack(fill='x', padx=20, pady=(0, 20))

        ttk.Button(
            button_frame,
            text="Pular (configurar depois)",
            command=self.skip_config
        ).pack(side='left')

        ttk.Button(
            button_frame,
            text="Salvar e Continuar",
            command=self.save_config,
            style='Accent.TButton'
        ).pack(side='right')

    def save_config(self):
        """Salva a configuração e fecha o wizard."""
        config = {
            'DEFAULT_AI': self.ai_var.get()
        }

        for key, entry in self.entries.items():
            value = entry.get().strip()
            config[key] = value

        if save_env(config):
            messagebox.showinfo(
                "Sucesso",
                "Configuração salva com sucesso!\n\nO aplicativo será iniciado agora."
            )
            self.root.quit()
        else:
            messagebox.showerror(
                "Erro",
                "Erro ao salvar configuração. Verifique as permissões do arquivo."
            )

    def skip_config(self):
        """Pula a configuração e cria .env vazio."""
        if not env_exists():
            save_env({'DEFAULT_AI': 'gemini'})

        result = messagebox.askokcancel(
            "Configuração Posterior",
            "Você pode configurar as chaves de API depois através do menu do aplicativo.\n\nDeseja continuar?"
        )

        if result:
            self.root.quit()

    def run(self):
        """Executa o wizard."""
        self.root.mainloop()
        self.root.destroy()


def ensure_config():
    """
    Garante que a configuração existe.
    Se não existir, abre o wizard de configuração.
    """
    if not env_exists():
        wizard = ConfigWizard()
        wizard.run()

    # Carregar as variáveis de ambiente
    env_vars = load_env()
    for key, value in env_vars.items():
        os.environ[key] = value


if __name__ == '__main__':
    import sys
    ensure_config()
