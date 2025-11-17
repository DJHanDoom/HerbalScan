; Script Inno Setup para HerbalScan
; Requer Inno Setup 6.0 ou superior
; Download: https://jrsoftware.org/isdl.php

#define MyAppName "HerbalScan"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "HerbalScan Team"
#define MyAppURL "https://github.com/DJHanDoom/HerbalScan"
#define MyAppExeName "HerbalScan.exe"

[Setup]
; Identificadores únicos do aplicativo
AppId={{8F3D9B2A-1C4E-4B8D-9A7C-2E5F6D8B9C1A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Diretório de instalação padrão
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Licença (opcional - crie um arquivo LICENSE.txt se desejar)
;LicenseFile=LICENSE.txt

; Ícone do instalador
SetupIconFile=icon.ico

; Saída do instalador
OutputDir=installer_output
OutputBaseFilename=HerbalScan_Setup_v{#MyAppVersion}

; Compressão
Compression=lzma2/max
SolidCompression=yes

; Estilo moderno do Windows 11
WizardStyle=modern

; Requer privilégios de administrador (ou permitir instalação por usuário)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; Arquitetura
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

; Desinstalador
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "Criar ícone na Barra de Tarefas"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Arquivos principais do aplicativo
Source: "dist\HerbalScan\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "*.md,*.log,BUILD_README.md,INSTALADOR_PROFISSIONAL.md,docs,tests,legacy,__pycache__,.git,.gitignore,.env,exports\*,saved_analyses\*,static\uploads\*"

; Launcher .bat para debug (opcional)
Source: "HerbalScan_Launcher.bat"; DestDir: "{app}"; Flags: ignoreversion

; Nota: Todos os arquivos necessários em dist\HerbalScan\ serão copiados, exceto arquivos de desenvolvimento

[Icons]
; Atalho no Menu Iniciar
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{group}\{#MyAppName} (Launcher)"; Filename: "{app}\HerbalScan_Launcher.bat"; WorkingDir: "{app}"; Comment: "Inicia o HerbalScan com console visível para debug"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"

; Atalho na Área de Trabalho (se selecionado)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: desktopicon

; Atalho na Barra de Tarefas (se selecionado)
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: quicklaunchicon

[Run]
; Opção de executar o aplicativo após instalação
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent; WorkingDir: "{app}"

[Code]
var
  DefaultAIPage: TInputOptionWizardPage;

procedure InitializeWizard;
begin
  // Página de seleção de IA padrão
  DefaultAIPage := CreateInputOptionPage(wpSelectTasks,
    'Configuração Inicial', 'Escolha a IA padrão para análise',
    'Selecione qual serviço de IA você deseja usar como padrão. Você poderá alterar isso depois.',
    True, False);

  DefaultAIPage.Add('Gemini (Google) - Recomendado');
  DefaultAIPage.Add('Claude (Anthropic)');
  DefaultAIPage.Add('GPT-4 (OpenAI)');
  DefaultAIPage.Add('DeepSeek');
  DefaultAIPage.Add('Qwen (Alibaba)');
  DefaultAIPage.Add('HuggingFace');

  DefaultAIPage.Values[0] := True; // Gemini como padrão
end;

function GetDefaultAI: String;
begin
  if DefaultAIPage.Values[0] then Result := 'gemini'
  else if DefaultAIPage.Values[1] then Result := 'claude'
  else if DefaultAIPage.Values[2] then Result := 'gpt4'
  else if DefaultAIPage.Values[3] then Result := 'deepseek'
  else if DefaultAIPage.Values[4] then Result := 'qwen'
  else if DefaultAIPage.Values[5] then Result := 'huggingface'
  else Result := 'gemini';
end;

procedure CreateEnvFile;
var
  EnvContent: TStringList;
  EnvPath: String;
  DefaultAI: String;
begin
  EnvPath := ExpandConstant('{app}\.env');
  DefaultAI := GetDefaultAI;

  EnvContent := TStringList.Create;
  try
    // Usar apenas caracteres ASCII para evitar problemas de codificacao
    EnvContent.Add('# HerbalScan Configuration');
    EnvContent.Add('# Add your API keys below');
    EnvContent.Add('');
    EnvContent.Add('# Default AI (gemini, claude, gpt4, deepseek, qwen, huggingface)');
    EnvContent.Add('DEFAULT_AI=' + DefaultAI);
    EnvContent.Add('');
    EnvContent.Add('# API Keys (configure via application menu)');
    EnvContent.Add('ANTHROPIC_API_KEY=');
    EnvContent.Add('OPENAI_API_KEY=');
    EnvContent.Add('GOOGLE_API_KEY=');
    EnvContent.Add('DEEPSEEK_API_KEY=');
    EnvContent.Add('QWEN_API_KEY=');
    EnvContent.Add('HUGGINGFACE_API_KEY=');

    EnvContent.SaveToFile(EnvPath);
  finally
    EnvContent.Free;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Criar arquivo .env automaticamente após instalação
    CreateEnvFile;
  end;
end;

[UninstallDelete]
; Remover arquivo .env ao desinstalar (cuidado: apaga as configurações!)
Type: files; Name: "{app}\.env"
Type: filesandordirs; Name: "{app}\exports"
Type: filesandordirs; Name: "{app}\saved_analyses"
Type: filesandordirs; Name: "{app}\static\uploads"

[Messages]
; Mensagens customizadas em português
brazilianportuguese.WelcomeLabel2=Este assistente irá instalar o [name/ver] no seu computador.%n%nO HerbalScan é um sistema de análise de cobertura de plantas herbáceas com suporte a múltiplas IAs.%n%nRecomenda-se fechar todos os outros aplicativos antes de continuar.
brazilianportuguese.FinishedHeadingLabel=Instalação Concluída
brazilianportuguese.FinishedLabel=O [name] foi instalado com sucesso.%n%nPara começar a usar, você precisará configurar pelo menos uma chave de API através do menu de configurações do aplicativo.
