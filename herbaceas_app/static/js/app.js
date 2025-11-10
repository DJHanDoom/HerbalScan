// Estado global da aplicação
const appState = {
    parcelaNome: 'Parcela_9',
    uploadedFiles: [],
    analysisResults: [],
    especies: {},
    especiesUnificadas: {},
    currentSubparcela: null,
    availableAIs: [],
    selectedAI: 'claude',
    apiKeys: {
        claude: localStorage.getItem('ANTHROPIC_API_KEY') || '',
        gpt4: localStorage.getItem('OPENAI_API_KEY') || '',
        gemini: localStorage.getItem('GOOGLE_API_KEY') || '',
        deepseek: localStorage.getItem('DEEPSEEK_API_KEY') || '',
        qwen: localStorage.getItem('QWEN_API_KEY') || '',
        huggingface: localStorage.getItem('HUGGINGFACE_API_KEY') || ''
    }
};

// Limpar chaves inválidas (com emojis ou caracteres estranhos de erro)
Object.keys(appState.apiKeys).forEach(key => {
    const value = appState.apiKeys[key];
    if (value && (value.includes('⚠️') || value.includes('Tentati'))) {
        console.warn(`🧹 Limpando chave inválida para ${key}: ${value.substring(0, 20)}...`);
        appState.apiKeys[key] = '';
        const storageKeys = {
            'claude': 'ANTHROPIC_API_KEY',
            'gpt4': 'OPENAI_API_KEY',
            'gemini': 'GOOGLE_API_KEY',
            'deepseek': 'DEEPSEEK_API_KEY',
            'qwen': 'QWEN_API_KEY',
            'huggingface': 'HUGGINGFACE_API_KEY'
        };
        localStorage.removeItem(storageKeys[key]);
    }
});

// Função helper para codificar UTF-8 em Base64 (suporta caracteres especiais)
function utf8ToBase64(str) {
    try {
        // Usar TextEncoder para converter UTF-8 para bytes, então Base64
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
        return btoa(binString);
    } catch (e) {
        console.error('Erro ao codificar Base64:', e);
        return str; // Fallback para string original
    }
}

// Debug: Verificar chaves carregadas na inicialização
console.log('🔑 Chaves API carregadas do localStorage:');
console.log('  Claude:', appState.apiKeys.claude ? `Presente (${appState.apiKeys.claude.substring(0,10)}...)` : 'AUSENTE');
console.log('  Gemini:', appState.apiKeys.gemini ? `Presente (${appState.apiKeys.gemini.substring(0,10)}...)` : 'AUSENTE');
console.log('  GPT-4:', appState.apiKeys.gpt4 ? `Presente (${appState.apiKeys.gpt4.substring(0,10)}...)` : 'AUSENTE');

// Elementos DOM
const elements = {
    parcelaName: document.getElementById('parcela-name'),
    imageUpload: document.getElementById('image-upload'),
    fileCount: document.getElementById('file-count'),
    previewContainer: document.getElementById('preview-container'),
    uploadBtn: document.getElementById('upload-btn'),
    aiModel: document.getElementById('ai-model'),
    aiInfo: document.getElementById('ai-info'),
    analyzeBtn: document.getElementById('analyze-btn'),
    manualModeBtn: document.getElementById('manual-mode-btn'),
    addImagesBtn: document.getElementById('add-images-btn'),
    addImagesInput: document.getElementById('add-images-input'),
    analysisSection: document.getElementById('analysis-section'),
    analysisProgress: document.getElementById('analysis-progress'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    analysisResults: document.getElementById('analysis-results'),
    speciesSection: document.getElementById('species-section'),
    speciesTbody: document.getElementById('species-tbody'),
    exportSection: document.getElementById('export-section'),
    exportBtn: document.getElementById('export-btn'),
    exportStatus: document.getElementById('export-status'),
    resultsSummary: document.getElementById('results-summary'),
    subparcelasGrid: document.getElementById('subparcelas-grid')
};

// Event Listeners
elements.imageUpload.addEventListener('change', handleImageSelection);
elements.uploadBtn.addEventListener('click', uploadImages);
elements.aiModel.addEventListener('change', handleAIModelChange);
elements.analyzeBtn.addEventListener('click', analyzeImages);
elements.manualModeBtn.addEventListener('click', startManualMode);
elements.addImagesBtn.addEventListener('click', () => elements.addImagesInput.click());
elements.addImagesInput.addEventListener('change', handleAddImages);
elements.exportBtn.addEventListener('click', exportToExcel);

// Inicialização
document.addEventListener('DOMContentLoaded', initializeApp);

// Inicialização da aplicação
async function initializeApp() {
    // Carregar modelos de IA disponíveis
    await loadAvailableAIs();

    // Verificar se há API keys configuradas
    checkAPIKeys();
    
    // Verificar se há análise carregada na sessão
    await checkLoadedAnalysis();
}

async function checkLoadedAnalysis() {
    try {
        const response = await fetch('/api/parcelas');
        const data = await response.json();
        
        if (data.parcelas && data.parcelas.length > 0) {
            // Há dados carregados, restaurar a interface
            const parcela = data.parcelas[0]; // Pegar a primeira (e única) parcela
            console.log('📂 Análise carregada detectada:', parcela);
            
            // Definir nome da parcela
            appState.parcelaNome = parcela.nome;
            elements.parcelaName.value = parcela.nome;
            
            // Carregar detalhes da parcela
            const detailsResponse = await fetch(`/api/parcela/${parcela.nome}`);
            const detailsData = await detailsResponse.json();
            
            // Carregar espécies unificadas
            const especiesResponse = await fetch('/api/especies');
            const especiesData = await especiesResponse.json();
            
            if (detailsData.subparcelas && Object.keys(detailsData.subparcelas).length > 0) {
                // Adicionar subparcelas ao estado
                appState.analysisResults = Object.entries(detailsData.subparcelas).map(([id, sub]) => ({
                    subparcela_id: id,
                    image_path: sub.image_path,
                    especies: sub.especies || [],
                    analise_completa: true
                }));
                
                console.log(`✓ ${appState.analysisResults.length} subparcelas restauradas`);
                
                // Restaurar espécies unificadas (backend já retorna flat)
                if (especiesData.especies) {
                    appState.especiesUnificadas = especiesData.especies;
                    
                    // Converter para formato appState.especies (usado pela interface)
                    appState.especies = {};
                    Object.entries(appState.especiesUnificadas).forEach(([apelido, espData]) => {
                        appState.especies[apelido] = {
                            apelido_original: apelido,
                            apelido_usuario: espData.apelido_usuario || apelido,
                            genero: espData.genero || '',
                            especie: espData.especie || '',
                            familia: espData.familia || '',
                            ocorrencias: espData.ocorrencias || 0
                        };
                    });
                    
                    console.log(`✓ ${Object.keys(appState.especies).length} espécies unificadas restauradas`);
                }
                
                // Mostrar todas as seções necessárias
                elements.analysisSection.style.display = 'block';
                elements.speciesSection.style.display = 'block';
                elements.exportSection.style.display = 'block';
                
                // Mostrar botão de adicionar imagens
                elements.addImagesBtn.style.display = 'inline-block';
                
                // Renderizar todos os resultados
                displayResults();
                
                showAlert('success', `Análise "${parcela.nome}" carregada com sucesso! ${parcela.num_subparcelas} subparcelas, ${Object.keys(appState.especies).length} espécies.`);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar análise carregada:', error);
    }
}

async function loadAvailableAIs() {
    try {
        const response = await fetch('/api/ai/available');
        const data = await response.json();

        appState.availableAIs = data.ais;
        
        // Garantir que sempre há um AI selecionado válido
        if (data.default && data.ais.find(ai => ai.id === data.default)) {
            appState.selectedAI = data.default;
        } else if (data.ais.length > 0) {
            // Se default não for válido, usar o primeiro disponível
            appState.selectedAI = data.ais[0].id;
            console.log(`⚠️ Default AI inválido, usando ${appState.selectedAI}`);
        } else {
            appState.selectedAI = null;
        }
        
        console.log(`✓ AI selecionada: ${appState.selectedAI}`);

        // Preencher select com opções
        elements.aiModel.innerHTML = '';

        if (data.ais.length === 0) {
            elements.aiModel.innerHTML = '<option value="">Nenhuma IA configurada</option>';
            elements.aiInfo.innerHTML = '<strong>⚠️ Nenhuma IA disponível!</strong> Configure pelo menos uma API key clicando no botão ao lado.';
            elements.analyzeBtn.disabled = true;
            return;
        }

        data.ais.forEach(ai => {
            const option = document.createElement('option');
            option.value = ai.id;
            option.textContent = `${ai.name} (${ai.provider})`;
            if (ai.id === appState.selectedAI) {
                option.selected = true;
            }
            elements.aiModel.appendChild(option);
        });

        updateAIInfo();
        handleAIModelChange(); // Mostrar dropdown do modelo selecionado

    } catch (error) {
        console.error('Erro ao carregar IAs:', error);
        elements.aiInfo.innerHTML = '<strong>Erro ao carregar modelos de IA</strong>';
    }
}

function handleAIModelChange() {
    appState.selectedAI = elements.aiModel.value;
    
    // Recarregar chave do localStorage para o AI selecionado
    const storageKeys = {
        'claude': 'ANTHROPIC_API_KEY',
        'gpt4': 'OPENAI_API_KEY',
        'gemini': 'GOOGLE_API_KEY',
        'deepseek': 'DEEPSEEK_API_KEY',
        'qwen': 'QWEN_API_KEY',
        'huggingface': 'HUGGINGFACE_API_KEY'
    };
    
    const storageKey = storageKeys[appState.selectedAI];
    if (storageKey) {
        const keyFromStorage = localStorage.getItem(storageKey);
        if (keyFromStorage) {
            appState.apiKeys[appState.selectedAI] = keyFromStorage;
            console.log(`🔄 Chave recarregada do localStorage para ${appState.selectedAI}`);
        }
    }
    
    updateAIInfo();

    // Mostrar/ocultar seletor de versão do Gemini
    const geminiModelGroup = document.getElementById('gemini-model-group');
    if (appState.selectedAI === 'gemini') {
        geminiModelGroup.style.display = 'block';
    } else {
        geminiModelGroup.style.display = 'none';
    }
    
    // Mostrar/ocultar seletor de versão do Claude
    const claudeModelGroup = document.getElementById('claude-model-group');
    if (appState.selectedAI === 'claude') {
        claudeModelGroup.style.display = 'block';
    } else {
        claudeModelGroup.style.display = 'none';
    }

    // Verificar se tem API key para este modelo
    const keyName = getAPIKeyName(appState.selectedAI);
    if (!appState.apiKeys[appState.selectedAI]) {
        showAlert('warning', `API key não configurada para ${keyName}. Configure antes de analisar.`);
    }
}

function updateAIInfo() {
    const selectedAI = appState.availableAIs.find(ai => ai.id === appState.selectedAI);
    if (selectedAI) {
        const hasKey = !!appState.apiKeys[appState.selectedAI];
        const keyStatus = hasKey ? '✅ Configurada' : '❌ Não configurada';

        elements.aiInfo.innerHTML = `
            <strong>${selectedAI.name}</strong> por ${selectedAI.provider}
            <br>API Key: ${keyStatus}
            <button class="btn btn-small btn-primary" onclick="configureAPIKey('${selectedAI.id}')" style="margin-left: 10px;">
                ${hasKey ? 'Alterar' : 'Configurar'} API Key
            </button>
        `;
    }
}

function getAPIKeyName(aiId) {
    const names = {
        'claude': 'Claude (Anthropic)',
        'gpt4': 'GPT-4 (OpenAI)',
        'gemini': 'Gemini (Google)',
        'deepseek': 'DeepSeek (Gratuito)',
        'qwen': 'Qwen (Alibaba - Gratuito)',
        'huggingface': 'HuggingFace (Gratuito)'
    };
    return names[aiId] || aiId;
}

function checkAPIKeys() {
    // Verificar se pelo menos uma API key está configurada
    const hasAnyKey = Object.values(appState.apiKeys).some(key => key && key.length > 0);

    if (!hasAnyKey) {
        showConfigurationModal();
    }
}

function configureAPIKey(aiId) {
    // Validar que aiId não é undefined ou null
    if (!aiId) {
        console.error('❌ configureAPIKey chamado com aiId inválido:', aiId);
        showAlert('error', 'Erro ao configurar API key. Selecione uma IA primeiro.');
        return;
    }
    
    console.log(`🔧 Configurando API key para: ${aiId}`);
    
    const keyName = getAPIKeyName(aiId);
    const currentKey = appState.apiKeys[aiId];
    const maskedKey = currentKey ? currentKey.substring(0, 8) + '...' : 'Não configurada';

    // Links para obter API keys
    const apiLinks = {
        'claude': {
            url: 'https://console.anthropic.com/settings/keys',
            text: 'Obter chave da Anthropic',
            placeholder: 'sk-ant-api03-...',
            tier: 'premium',
            note: 'US$ 3.00 por milhão de tokens de entrada'
        },
        'gpt4': {
            url: 'https://platform.openai.com/api-keys',
            text: 'Obter chave da OpenAI',
            placeholder: 'sk-proj-...',
            tier: 'premium',
            note: 'US$ 10.00 por milhão de tokens de entrada'
        },
        'gemini': {
            url: 'https://aistudio.google.com/app/apikey',
            text: 'Obter chave do Google AI Studio',
            placeholder: 'AIzaSy...',
            tier: 'free',
            note: '✓ Grátis até 60 requisições/min'
        },
        'deepseek': {
            url: 'https://platform.deepseek.com/api_keys',
            text: 'Obter chave do DeepSeek (Grátis)',
            placeholder: 'sk-...',
            tier: 'free',
            note: '✓ Totalmente gratuito! US$ 0.14 por milhão de tokens'
        },
        'qwen': {
            url: 'https://dashscope.console.aliyun.com/apiKey',
            text: 'Obter chave do Alibaba DashScope',
            placeholder: 'sk-...',
            tier: 'free',
            note: '✓ Grátis com limites generosos'
        },
        'huggingface': {
            url: 'https://huggingface.co/settings/tokens',
            text: 'Obter token do HuggingFace',
            placeholder: 'hf_...',
            tier: 'free',
            note: '✓ 100% gratuito (modelos open source)'
        }
    };

    const linkInfo = apiLinks[aiId] || { url: '#', text: 'Obter API Key', placeholder: 'sk-...', note: '' };

    // Cor de fundo baseada no tier
    const tierColor = linkInfo.tier === 'free' ? '#c6f6d5' : '#fff3cd';
    const tierBorder = linkInfo.tier === 'free' ? '#48bb78' : '#ed8936';

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Configurar API Key - ${keyName}</h2>

            ${linkInfo.tier === 'free' ? `
                <div style="background: ${tierColor}; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${tierBorder};">
                    <strong style="color: #22543d;">🎉 Modelo Gratuito!</strong>
                    <p style="margin: 5px 0 0 0; color: #22543d; font-size: 0.9rem;">
                        ${linkInfo.note}
                    </p>
                </div>
            ` : `
                <div style="background: ${tierColor}; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${tierBorder};">
                    <strong style="color: #7c2d12;">💰 Modelo Premium</strong>
                    <p style="margin: 5px 0 0 0; color: #7c2d12; font-size: 0.9rem;">
                        ${linkInfo.note}
                    </p>
                </div>
            `}

            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin-bottom: 10px;">
                    <strong>Key atual:</strong> ${maskedKey}
                </p>
                <p style="margin-bottom: 0;">
                    Não tem uma chave?
                    <a href="${linkInfo.url}" target="_blank" style="color: #667eea; font-weight: 600;">
                        ${linkInfo.text} →
                    </a>
                </p>
            </div>

            <form id="api-key-form">
                <div class="form-group">
                    <label>Nova API Key:</label>
                    <input type="password" id="new-api-key" placeholder="${linkInfo.placeholder}" required
                           autocomplete="off"
                           style="font-family: monospace; width: 100%;">
                    <small style="color: #718096; margin-top: 5px; display: block;">
                        A chave será armazenada localmente no seu navegador (localStorage)
                    </small>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="show-key"> Mostrar chave
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    ${currentKey ? '<button type="button" class="btn btn-danger" onclick="removeAPIKey(\'' + aiId + '\')">Remover</button>' : ''}
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const form = modal.querySelector('#api-key-form');
    const keyInput = modal.querySelector('#new-api-key');
    const showKeyCheckbox = modal.querySelector('#show-key');

    if (currentKey) {
        keyInput.value = currentKey;
    }

    showKeyCheckbox.addEventListener('change', (e) => {
        keyInput.type = e.target.checked ? 'text' : 'password';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newKey = keyInput.value.trim();

        if (newKey) {
            console.log(`💾 Salvando chave API para ${aiId}...`);
            saveAPIKey(aiId, newKey);
            console.log(`✅ Chave salva! appState.apiKeys.${aiId} =`, appState.apiKeys[aiId] ? 'DEFINIDA' : 'VAZIA');
            modal.remove();
            showAlert('success', `API Key para ${keyName} salva com sucesso!`);
            loadAvailableAIs(); // Recarregar para atualizar status
            
            // Forçar atualização do estado
            console.log('🔄 Estado atual das chaves:', {
                claude: appState.apiKeys.claude ? 'PRESENTE' : 'AUSENTE',
                gemini: appState.apiKeys.gemini ? 'PRESENTE' : 'AUSENTE',
                selectedAI: appState.selectedAI
            });
        } else {
            showAlert('error', 'Por favor, insira uma chave válida');
        }
    });
}

function saveAPIKey(aiId, key) {
    const storageKeys = {
        'claude': 'ANTHROPIC_API_KEY',
        'gpt4': 'OPENAI_API_KEY',
        'gemini': 'GOOGLE_API_KEY',
        'deepseek': 'DEEPSEEK_API_KEY',
        'qwen': 'QWEN_API_KEY',
        'huggingface': 'HUGGINGFACE_API_KEY'
    };

    const storageKey = storageKeys[aiId];
    if (storageKey) {
        console.log(`💾 Tentando salvar chave para ${aiId} com storageKey: ${storageKey}`);
        
        // Salvar no localStorage
        localStorage.setItem(storageKey, key);
        
        // Verificar imediatamente se foi salvo
        const verificacao = localStorage.getItem(storageKey);
        console.log(`✓ Verificação imediata - Chave salva?`, verificacao ? 'SIM' : 'NÃO');

        // Atualizar estado global
        appState.apiKeys[aiId] = key;

        console.log(`API key salva para ${aiId}:`, key.substring(0, 10) + '...');
        console.log(`Estado appState.apiKeys[${aiId}]:`, appState.apiKeys[aiId] ? 'PRESENTE' : 'AUSENTE');

        // Enviar confirmação para o backend (opcional)
        fetch('/api/config/apikey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ai_model: aiId,
                api_key: 'configured'  // Não enviar a key real, apenas confirmar
            })
        }).catch(err => console.log('Erro ao notificar backend:', err));

        // Recarregar informações de IAs disponíveis
        updateAIInfo();
    }
}

function removeAPIKey(aiId) {
    if (!confirm('Tem certeza que deseja remover esta API Key?')) return;

    const storageKeys = {
        'claude': 'ANTHROPIC_API_KEY',
        'gpt4': 'OPENAI_API_KEY',
        'gemini': 'GOOGLE_API_KEY',
        'deepseek': 'DEEPSEEK_API_KEY',
        'qwen': 'QWEN_API_KEY',
        'huggingface': 'HUGGINGFACE_API_KEY'
    };

    const storageKey = storageKeys[aiId];
    if (storageKey) {
        localStorage.removeItem(storageKey);
        appState.apiKeys[aiId] = '';

        document.querySelector('.modal').remove();
        showAlert('info', 'API Key removida');
        loadAvailableAIs();
    }
}

function showConfigurationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2>🔑 Configuração Inicial</h2>
            <p>Para usar o sistema de análise de vegetação, você precisa configurar pelo menos uma API key de IA.</p>

            <div style="margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">Modelos Disponíveis:</h3>

                <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1em;">🤖 Claude 3.5 Sonnet</strong>
                            <br><small style="color: #718096;">Anthropic - Excelente para análise detalhada de vegetação</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-small btn-primary" onclick="configureAPIKey('claude')">
                            Configurar
                        </button>
                        <a href="https://console.anthropic.com/settings/keys" target="_blank"
                           class="btn btn-small btn-secondary" style="text-decoration: none;">
                            Obter Chave →
                        </a>
                    </div>
                </div>

                <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #48bb78;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1em;">🧠 GPT-4 Vision</strong>
                            <br><small style="color: #718096;">OpenAI - Ótimo reconhecimento de padrões visuais</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-small btn-primary" onclick="configureAPIKey('gpt4')">
                            Configurar
                        </button>
                        <a href="https://platform.openai.com/api-keys" target="_blank"
                           class="btn btn-small btn-secondary" style="text-decoration: none;">
                            Obter Chave →
                        </a>
                    </div>
                </div>

                <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #ed8936;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1em;">✨ Gemini 1.5 Pro</strong>
                            <br><small style="color: #718096;">Google - Análise rápida e eficiente</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-small btn-primary" onclick="configureAPIKey('gemini')">
                            Configurar
                        </button>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank"
                           class="btn btn-small btn-secondary" style="text-decoration: none;">
                            Obter Chave →
                        </a>
                    </div>
                </div>

                <div style="margin: 25px 0 15px 0; padding: 10px; background: #c6f6d5; border-radius: 8px;">
                    <strong style="color: #22543d;">🎉 Modelos Gratuitos (Open Source / Free Tier)</strong>
                </div>

                <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #48bb78;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1em;">🚀 DeepSeek Chat</strong>
                            <br><small style="color: #718096;">DeepSeek - Totalmente gratuito (US$ 0.14/1M tokens)</small>
                            <br><small style="color: #22543d; font-weight: 600;">✓ 100% Grátis!</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-small btn-primary" onclick="configureAPIKey('deepseek')">
                            Configurar
                        </button>
                        <a href="https://platform.deepseek.com/api_keys" target="_blank"
                           class="btn btn-small btn-secondary" style="text-decoration: none;">
                            Obter Chave →
                        </a>
                    </div>
                </div>

                <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #48bb78;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1em;">🌐 Alibaba Qwen VL</strong>
                            <br><small style="color: #718096;">Alibaba DashScope - Grátis com limites generosos</small>
                            <br><small style="color: #22543d; font-weight: 600;">✓ Free Tier Disponível</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-small btn-primary" onclick="configureAPIKey('qwen')">
                            Configurar
                        </button>
                        <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank"
                           class="btn btn-small btn-secondary" style="text-decoration: none;">
                            Obter Chave →
                        </a>
                    </div>
                </div>

                <div style="margin-bottom: 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #48bb78;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.1em;">🤗 HuggingFace LLaVA</strong>
                            <br><small style="color: #718096;">HuggingFace - Modelos open source totalmente gratuitos</small>
                            <br><small style="color: #22543d; font-weight: 600;">✓ 100% Open Source!</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-small btn-primary" onclick="configureAPIKey('huggingface')">
                            Configurar
                        </button>
                        <a href="https://huggingface.co/settings/tokens" target="_blank"
                           class="btn btn-small btn-secondary" style="text-decoration: none;">
                            Obter Token →
                        </a>
                    </div>
                </div>
            </div>

            <p style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 6px; font-size: 0.9rem;">
                💡 <strong>Dica:</strong> As API keys são armazenadas localmente no seu navegador e não são enviadas para servidores externos.
            </p>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Funções principais
function handleImageSelection(e) {
    const files = Array.from(e.target.files);

    if (files.length === 0) {
        elements.fileCount.textContent = 'Nenhum arquivo selecionado';
        elements.uploadBtn.disabled = true;
        elements.previewContainer.innerHTML = '';
        return;
    }

    elements.fileCount.textContent = `${files.length} arquivo(s) selecionado(s)`;
    elements.uploadBtn.disabled = false;
    appState.uploadedFiles = files;

    // Criar previews
    elements.previewContainer.innerHTML = '';
    files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="label">Subparcela ${idx + 1}</div>
            `;
            elements.previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

async function uploadImages() {
    const parcela = elements.parcelaName.value.trim() || 'Parcela_1';
    appState.parcelaNome = parcela;

    const formData = new FormData();
    formData.append('parcela', parcela);

    appState.uploadedFiles.forEach(file => {
        formData.append('images', file);
    });

    try {
        elements.uploadBtn.disabled = true;
        elements.uploadBtn.textContent = 'Enviando...';

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', data.message);
            elements.analysisSection.style.display = 'block';
            elements.analysisSection.scrollIntoView({ behavior: 'smooth' });
            
            // Mostrar botão de modo manual
            elements.manualModeBtn.style.display = 'inline-block';
        } else {
            showAlert('error', data.error || 'Erro ao enviar imagens');
        }
    } catch (error) {
        showAlert('error', 'Erro ao enviar imagens: ' + error.message);
    } finally {
        elements.uploadBtn.disabled = false;
        elements.uploadBtn.textContent = 'Enviar Imagens';
    }
}

// Função para iniciar modo manual (sem IA)
async function startManualMode() {
    if (!appState.parcelaNome) {
        showAlert('error', 'Nenhuma parcela definida');
        return;
    }
    
    try {
        showAlert('info', 'Iniciando modo manual...');
        
        // Buscar lista de imagens enviadas
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/images`);
        const data = await response.json();
        
        if (!data.success || !data.images || data.images.length === 0) {
            showAlert('error', 'Nenhuma imagem encontrada para esta parcela');
            return;
        }
        
        // Criar subparcelas vazias para cada imagem
        appState.analysisResults = data.images.map((img, idx) => ({
            subparcela_id: idx + 1,
            image_path: img.path,
            especies: [],
            analise_completa: false,  // Marcar como incompleta inicialmente
            manual_mode: true  // Flag para indicar modo manual
        }));
        
        // Inicializar espécies vazias
        appState.especies = {};
        appState.especiesUnificadas = {};
        
        // Mostrar seções necessárias
        elements.analysisSection.style.display = 'block';
        elements.speciesSection.style.display = 'block';
        elements.exportSection.style.display = 'block';
        elements.addImagesBtn.style.display = 'inline-block';
        
        // Ocultar botão de análise com IA e modo manual
        elements.analyzeBtn.style.display = 'none';
        elements.manualModeBtn.style.display = 'none';
        
        // Renderizar subparcelas vazias
        displayResults();
        
        showAlert('success', `Modo manual ativado! ${data.images.length} subparcelas prontas para edição. Clique em cada imagem para adicionar espécies.`);
        
        // Scroll para análise
        elements.analysisSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erro ao iniciar modo manual:', error);
        showAlert('error', 'Erro ao iniciar modo manual: ' + error.message);
    }
}

async function handleAddImages(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        return;
    }
    
    console.log(`📸 Adicionando ${files.length} novas imagens à análise existente`);
    
    // Armazenar arquivos temporariamente no appState
    appState.pendingNewImages = files;
    
    // Abrir modal de configuração de prompt
    showAlert('info', `${files.length} imagens selecionadas. Configure os parâmetros de análise.`);
    
    // Abrir o modal de configuração de prompt
    const configButton = document.getElementById('config-prompt-btn');
    if (configButton) {
        configButton.click();
    }
    
    // Limpar o input para permitir selecionar as mesmas imagens novamente se necessário
    event.target.value = '';
}

async function addImagesToExistingAnalysis(files, promptConfig) {
    try {
        // Preparar FormData para upload das novas imagens
        const formData = new FormData();
        formData.append('parcela_nome', appState.parcelaNome);
        
        files.forEach(file => {
            formData.append('images', file);
        });
        
        // Upload das novas imagens
        showAlert('info', 'Enviando novas imagens...');
        const uploadResponse = await fetch('/api/upload-additional-images', {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Erro ao fazer upload das imagens');
        }
        
        const uploadData = await uploadResponse.json();
        const newSubparcelaIds = uploadData.subparcela_ids;
        
        console.log(`✓ ${newSubparcelaIds.length} novas imagens enviadas`);
        
        // Analisar as novas imagens
        showAlert('info', 'Analisando novas imagens...');
        
        const analyzeResponse = await fetch('/api/analyze-additional-images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parcela_nome: appState.parcelaNome,
                subparcela_ids: newSubparcelaIds,
                ai_model: appState.selectedAI,
                api_key: appState.apiKeys[appState.selectedAI],
                prompt_config: promptConfig
            })
        });
        
        if (!analyzeResponse.ok) {
            const errorData = await analyzeResponse.json();
            throw new Error(errorData.error || 'Erro ao analisar novas imagens');
        }
        
        const analyzeData = await analyzeResponse.json();
        
        // Atualizar o estado com os novos resultados
        analyzeData.novas_subparcelas.forEach(novaSub => {
            appState.analysisResults.push(novaSub);
        });
        
        // Atualizar espécies unificadas (agora já vem no formato correto do backend)
        if (analyzeData.especies_atualizadas) {
            appState.especiesUnificadas = analyzeData.especies_atualizadas;
            
            // Converter para formato da interface (especies_atualizadas já está flat)
            appState.especies = {};
            Object.entries(appState.especiesUnificadas).forEach(([apelido, espData]) => {
                appState.especies[apelido] = {
                    apelido_original: apelido,
                    apelido_usuario: espData.apelido_usuario || apelido,
                    genero: espData.genero || '',
                    especie: espData.especie || '',
                    familia: espData.familia || '',
                    ocorrencias: espData.ocorrencias || 0
                };
            });
        }
        
        // Reexibir resultados
        displayResults();
        
        showAlert('success', `✓ ${newSubparcelaIds.length} novas subparcelas adicionadas com sucesso!`);
        
        // Limpar arquivos pendentes
        delete appState.pendingNewImages;
        
    } catch (error) {
        console.error('Erro ao adicionar novas imagens:', error);
        showAlert('error', `Erro: ${error.message}`);
    }
}

async function analyzeImages() {
    // Recarregar chave do localStorage para garantir que está atualizada
    const storageKeys = {
        'claude': 'ANTHROPIC_API_KEY',
        'gpt4': 'OPENAI_API_KEY',
        'gemini': 'GOOGLE_API_KEY',
        'deepseek': 'DEEPSEEK_API_KEY',
        'qwen': 'QWEN_API_KEY',
        'huggingface': 'HUGGINGFACE_API_KEY'
    };
    
    const storageKey = storageKeys[appState.selectedAI];
    if (storageKey) {
        const keyFromStorage = localStorage.getItem(storageKey);
        if (keyFromStorage) {
            appState.apiKeys[appState.selectedAI] = keyFromStorage;
        }
    }
    
    // Verificar se tem API key configurada
    const currentKey = appState.apiKeys[appState.selectedAI];
    
    // Debug detalhado
    console.log('🔍 selectedAI:', appState.selectedAI, '(tipo:', typeof appState.selectedAI, ')');
    console.log('🔍 storageKey:', storageKey);
    console.log('🔍 Verificando API key para', appState.selectedAI, ':', currentKey ? 'Presente ✓' : 'Ausente ✗');
    console.log('📦 localStorage key:', storageKey, '=', localStorage.getItem(storageKey) ? 'EXISTE' : 'NÃO EXISTE');
    
    // Validar que selectedAI não é undefined ou null
    if (!appState.selectedAI) {
        console.error('❌ appState.selectedAI está undefined/null!');
        showAlert('error', 'Nenhuma IA selecionada. Recarregue a página.');
        return;
    }

    if (!currentKey) {
        showAlert('error', 'Configure uma API key antes de analisar!');
        configureAPIKey(appState.selectedAI);
        return;
    }

    try {
        elements.analyzeBtn.disabled = true;
        elements.analysisProgress.style.display = 'block';
        elements.progressText.textContent = `Preparando análise com ${getAPIKeyName(appState.selectedAI)}...`;
        elements.progressFill.style.width = '0%';

        console.log('Iniciando análise com IA:', appState.selectedAI);

        // Obter versão específica do Gemini, se aplicável
        let geminiVersion = null;
        if (appState.selectedAI === 'gemini') {
            const geminiVersionSelect = document.getElementById('gemini-version');
            geminiVersion = geminiVersionSelect ? geminiVersionSelect.value : 'gemini-flash-latest';
            console.log('Usando versão do Gemini:', geminiVersion);
        }
        
        // Obter versão específica do Claude, se aplicável
        let claudeVersion = null;
        if (appState.selectedAI === 'claude') {
            const claudeVersionSelect = document.getElementById('claude-version');
            claudeVersion = claudeVersionSelect ? claudeVersionSelect.value : 'claude-sonnet-4-5-20250929';
            console.log('Usando versão do Claude:', claudeVersion);
        }

        // Obter configuração de prompt salva
        const promptConfig = PromptConfig.getSavedConfig();
        console.log('Usando configuração de prompt:', promptConfig);
        
        // Debug: Log API keys para diagnóstico
        console.log('API Keys disponíveis:', {
            claude: appState.apiKeys.claude ? `${appState.apiKeys.claude.substring(0, 10)}...` : 'VAZIA',
            gemini: appState.apiKeys.gemini ? `${appState.apiKeys.gemini.substring(0, 10)}...` : 'VAZIA',
            selectedAI: appState.selectedAI
        });

        // Construir URL com parâmetros (para EventSource)
        const url = `/api/analyze/${appState.parcelaNome}`;
        
        // EventSource não suporta POST/headers, então usamos fetch primeiro para autenticar
        // Codificar chaves API em Base64 para evitar problemas com caracteres especiais
        const headers = {
            'Content-Type': 'application/json',
            'X-Gemini-Version': geminiVersion || '',
            'X-Claude-Version': claudeVersion || ''
        };
        
        // Adicionar chaves API apenas se existirem (codificadas em Base64 com suporte UTF-8)
        if (appState.apiKeys.claude) headers['X-API-Key-Claude'] = utf8ToBase64(appState.apiKeys.claude);
        if (appState.apiKeys.gpt4) headers['X-API-Key-GPT4'] = utf8ToBase64(appState.apiKeys.gpt4);
        if (appState.apiKeys.gemini) headers['X-API-Key-Gemini'] = utf8ToBase64(appState.apiKeys.gemini);
        if (appState.apiKeys.deepseek) headers['X-API-Key-DeepSeek'] = utf8ToBase64(appState.apiKeys.deepseek);
        if (appState.apiKeys.qwen) headers['X-API-Key-Qwen'] = utf8ToBase64(appState.apiKeys.qwen);
        if (appState.apiKeys.huggingface) headers['X-API-Key-HuggingFace'] = utf8ToBase64(appState.apiKeys.huggingface);
        
        const initResponse = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                ai_model: appState.selectedAI,
                template_config: promptConfig
            })
        });

        // Verificar se é uma resposta de erro imediato
        if (!initResponse.ok && !initResponse.headers.get('content-type')?.includes('text/event-stream')) {
            const error = await initResponse.json();
            throw new Error(error.error || 'Erro ao iniciar análise');
        }

        // Processar stream de eventos
        const reader = initResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // Guardar linha incompleta

            for (const line of lines) {
                if (!line.trim() || !line.startsWith('data: ')) continue;
                
                try {
                    const data = JSON.parse(line.substring(6));
                    console.log('Evento SSE:', data);

                    if (data.type === 'start') {
                        elements.progressText.textContent = `Iniciando análise de ${data.total} subparcelas...`;
                    } 
                    else if (data.type === 'progress') {
                        const percentage = data.percentage;
                        elements.progressFill.style.width = `${percentage}%`;
                        
                        if (data.status === 'analyzing') {
                            elements.progressText.textContent = `Analisando subparcela ${data.subparcela} (${data.current + 1}/${data.total})...`;
                        } 
                        else if (data.status === 'completed') {
                            elements.progressText.textContent = `✓ Subparcela ${data.subparcela}: ${data.especies_count} espécies detectadas (${data.current}/${data.total})`;
                        }
                        else if (data.status === 'summary') {
                            // 📊 Mostrar resumo acumulativo
                            const totalUnicas = data.total_especies_unicas;
                            const resumo = data.especies_resumo || [];
                            
                            // Criar lista de top 5 espécies mais frequentes
                            let topEspecies = '';
                            if (resumo.length > 0) {
                                const top5 = resumo.slice(0, 5);
                                topEspecies = top5.map(e => `${e.apelido} (${e.ocorrencias}x)`).join(', ');
                            }
                            
                            elements.progressText.innerHTML = `
                                ✓ Subparcela ${data.subparcela} processada (${data.current}/${data.total})<br>
                                <small style="font-size: 0.85em;">📊 <strong>${totalUnicas} espécies únicas</strong> detectadas até agora</small><br>
                                <small style="font-size: 0.75em; color: #666;">Top 5: ${topEspecies}</small>
                            `;
                        }
                    }
                    else if (data.type === 'error') {
                        console.error('Erro na subparcela', data.subparcela, ':', data.error);
                        elements.progressText.textContent = `⚠️ Erro na subparcela ${data.subparcela}: ${data.error}`;
                    }
                    else if (data.type === 'complete') {
                        console.log('Análise completa:', data);
                        
                        if (data.success) {
                            appState.analysisResults = data.results;
                            appState.especies = data.especies_unificadas;
                            appState.parcelaNome = data.parcela; // 🔧 FIX: Salvar nome da parcela

                            console.log('Resultados:', appState.analysisResults);
                            console.log('Espécies:', appState.especies);
                            console.log('Parcela:', appState.parcelaNome);

                            elements.progressFill.style.width = '100%';
                            elements.progressText.textContent = '✅ Análise concluída! Processando resultados...';

                            setTimeout(() => {
                                try {
                                    displayResults();
                                    elements.speciesSection.style.display = 'block';
                                    elements.exportSection.style.display = 'block';
                                    elements.speciesSection.scrollIntoView({ behavior: 'smooth' });
                                    showAlert('success', `Análise concluída! ${Object.keys(data.especies_unificadas).length} espécies identificadas.`);
                                } catch (displayError) {
                                    console.error('Erro ao exibir resultados:', displayError);
                                    showAlert('error', 'Erro ao exibir resultados: ' + displayError.message);
                                }
                            }, 500);
                        } else {
                            showAlert('error', data.error || 'Erro na análise');
                        }
                    }
                } catch (parseError) {
                    console.error('Erro ao parsear evento SSE:', parseError, line);
                }
            }
        }

    } catch (error) {
        console.error('Erro na análise:', error);
        showAlert('error', 'Erro na análise: ' + error.message);
        elements.progressText.textContent = '❌ Erro na análise';
    } finally {
        elements.analyzeBtn.disabled = false;
    }
}

function displayResults() {
    // Exibir tabela de espécies
    displaySpeciesTable();

    // Exibir resumo
    displaySummary();

    // Exibir subparcelas
    displaySubparcelas();
    
    // Mostrar botão de adicionar imagens (agora que há resultados)
    if (elements.addImagesBtn) {
        elements.addImagesBtn.style.display = 'inline-block';
    }
}

function displaySpeciesTable() {
    elements.speciesTbody.innerHTML = '';

    const especiesArray = Object.values(appState.especies);

    especiesArray.forEach(esp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${esp.apelido_original}</td>
            <td>${esp.apelido_usuario}</td>
            <td>${esp.genero || '-'}</td>
            <td>${esp.especie || '-'}</td>
            <td>${esp.familia || '-'}</td>
            <td><span class="badge badge-primary">${esp.ocorrencias}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editSpecies('${esp.apelido_original}')">Editar</button>
                <input type="checkbox" class="species-checkbox" value="${esp.apelido_original}">
            </td>
        `;
        elements.speciesTbody.appendChild(row);
    });

    // Remover ações em lote anteriores se existirem
    const existingActions = elements.speciesSection.querySelector('.species-actions');
    if (existingActions) {
        existingActions.remove();
    }

    // Adicionar botões de ações em lote
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'species-actions';
    actionsDiv.innerHTML = `
        <p>Ações em lote:</p>
        <div class="toolbar">
            <button class="btn btn-small btn-success" onclick="mergeSelectedSpecies()">Unificar Selecionadas</button>
        </div>
    `;

    // Inserir antes da tabela
    const tableContainer = elements.speciesTbody.closest('.table-container');
    if (tableContainer) {
        elements.speciesSection.insertBefore(actionsDiv, tableContainer);
    }
}

function displaySummary() {
    const totalEspecies = Object.keys(appState.especies).length;
    const totalSubparcelas = appState.analysisResults.length;

    let totalRegistros = 0;
    appState.analysisResults.forEach(result => {
        totalRegistros += result.especies.length;
    });

    elements.resultsSummary.innerHTML = `
        <div class="summary-item">
            <div class="summary-value">${totalSubparcelas}</div>
            <div class="summary-label">Subparcelas</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${totalEspecies}</div>
            <div class="summary-label">Espécies Únicas</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${totalRegistros}</div>
            <div class="summary-label">Total de Registros</div>
        </div>
    `;
}

function displaySubparcelas() {
    elements.subparcelasGrid.innerHTML = '';

    appState.analysisResults.forEach(result => {
        const card = document.createElement('div');
        card.className = 'subparcela-card';

        // Verificar se há erros
        const hasError = result.especies.some(esp =>
            esp.apelido.includes('Erro') ||
            esp.apelido.includes('não disponível') ||
            esp.apelido.includes('inválida')
        );

        const especiesHTML = result.especies.map(esp => {
            const isError = esp.apelido.includes('Erro') ||
                          esp.apelido.includes('não disponível') ||
                          esp.apelido.includes('inválida');

            if (isError) {
                return `
                    <div class="especie-item" style="background: #fed7d7; border-left-color: #f56565;">
                        <div class="especie-info">
                            <div class="especie-nome" style="color: #c53030;">⚠️ ${esp.apelido}</div>
                            <div class="especie-dados" style="color: #742a2a;">
                                ${esp.erro || 'Erro desconhecido'}
                            </div>
                        </div>
                        <div class="especie-actions">
                            <button class="btn btn-small btn-warning" onclick="retryAnalyze(${result.subparcela})" title="Tentar novamente">
                                🔄
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="especie-item">
                    <div class="especie-info">
                        <div class="especie-nome">
                            ${getDisplayName(esp.apelido)}
                            ${esp.link_fotos ? `<a href="${esp.link_fotos}" target="_blank" class="btn btn-small btn-info" style="margin-left: 8px; padding: 2px 8px; font-size: 0.85rem;" title="Ver fotos de referência">🔗 Fotos</a>` : ''}
                        </div>
                        <div class="especie-dados">
                            ${getDisplayTaxonomy(esp.apelido)}<br>
                            Cobertura: ${esp.cobertura}% | Altura: ${esp.altura}cm | ${esp.forma_vida}
                        </div>
                    </div>
                    <div class="especie-actions">
                        <button class="btn btn-small btn-primary" onclick="editSubparcelaEspecie(${result.subparcela}, '${esp.apelido}')">
                            ✏️
                        </button>
                        <button class="btn btn-small btn-danger" onclick="removeSubparcelaEspecie(${result.subparcela}, '${esp.apelido}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const errorBanner = hasError ? `
            <div style="background: #fff3cd; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #ed8936;">
                <p style="margin: 0; font-size: 0.9rem; color: #7c2d12;">
                    <strong>⚠️ Erro na análise!</strong><br>
                    Tente trocar o modelo de IA ou adicione espécies manualmente.
                </p>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="subparcela-header">
                <span>Subparcela ${result.subparcela}</span>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-small btn-secondary" onclick="openImageViewer(${result.subparcela}, '${result.image || result.filename}')" title="Ver e editar">
                        🖼️ Ver e Editar
                    </button>
                    <button class="btn btn-small btn-warning" onclick="reanalyzeSubparcela(event, ${result.subparcela})" title="Reanalisar com IA">
                        🔄 Reanalisar
                    </button>
                    <button class="btn btn-small btn-success" onclick="addEspecieToSubparcela(${result.subparcela})">+ Adicionar</button>
                </div>
            </div>
            <img src="${result.image_path || '/static/uploads/' + appState.parcelaNome + '/' + (result.image || result.filename)}" class="subparcela-image" alt="Subparcela ${result.subparcela}" onclick="openImageViewer(${result.subparcela}, '${result.image || result.filename}')" style="cursor: pointer;">
            <div class="subparcela-content">
                ${errorBanner}
                ${especiesHTML}
                <button class="btn btn-small btn-warning" style="margin-top: 10px; width: 100%;" onclick="splitSpeciesDialog(${result.subparcela})">
                    Subdividir Espécie
                </button>
            </div>
        `;

        elements.subparcelasGrid.appendChild(card);
    });
    
    // Adicionar botões de visualização/edição (novo modal)
    setTimeout(() => {
        addViewerButtons();
    }, 100);
}

function retryAnalyze(subparcela) {
    showAlert('info', `Para reanalisar, use outro modelo de IA na seção de análise ou adicione espécies manualmente clicando em "+ Adicionar"`);
}

async function reanalyzeSubparcela(event, subparcela) {
    console.log('🔄 Função reanalyzeSubparcela chamada para subparcela:', subparcela);
    console.log('🤖 Modelo selecionado:', appState.selectedAI);
    
    // Recarregar API key do localStorage (sincronização)
    const storageKeys = {
        'claude': 'ANTHROPIC_API_KEY',
        'gpt4': 'OPENAI_API_KEY',
        'gemini': 'GOOGLE_API_KEY',
        'deepseek': 'DEEPSEEK_API_KEY',
        'qwen': 'QWEN_API_KEY',
        'huggingface': 'HUGGINGFACE_API_KEY'
    };
    
    const storageKey = storageKeys[appState.selectedAI];
    if (storageKey) {
        const keyFromStorage = localStorage.getItem(storageKey);
        if (keyFromStorage) {
            appState.apiKeys[appState.selectedAI] = keyFromStorage;
            console.log(`🔄 Chave API recarregada do localStorage para ${appState.selectedAI}`);
        }
    }
    
    // Verificar se temos configuração de API
    const apiKey = appState.apiKeys[appState.selectedAI];
    console.log('🔑 API Key presente:', apiKey ? `Sim (${apiKey.substring(0, 10)}...)` : 'NÃO');
    
    if (!apiKey) {
        console.error('❌ API key não encontrada para:', appState.selectedAI);
        showAlert('error', `Configure a API key para ${appState.selectedAI} antes de reanalisar`);
        return;
    }
    
    // Validar que temos o nome da parcela
    if (!appState.parcelaNome) {
        showAlert('error', 'Erro: Nome da parcela não encontrado. Por favor, recarregue a análise.');
        return;
    }
    
    // 🔧 NOVO: Abrir modal de configuração do prompt ANTES de reanalisar
    // Armazenar referência para continuar após configuração
    window.pendingReanalysis = {
        event,
        subparcela,
        apiKey,
        selectedAI: appState.selectedAI
    };
    
    // Abrir modal de configuração
    PromptConfig.open();
    
    // Informar usuário
    showAlert('info', `Configure ou refine o prompt e clique em "Aplicar e Reanalisar" para prosseguir com a reanálise da subparcela ${subparcela}`);
}

// Executar reanálise após configuração do prompt (chamada pelo PromptConfig)
async function executeReanalysis(subparcela, promptConfig) {
    console.log('▶️ Executando reanálise da subparcela:', subparcela);
    console.log('📝 Configuração do prompt:', promptConfig);
    
    const geminiVersion = localStorage.getItem('geminiVersion') || 'gemini-flash-latest';
    
    // Obter versão do Claude se aplicável
    let claudeVersion = null;
    if (appState.selectedAI === 'claude') {
        const claudeVersionSelect = document.getElementById('claude-version');
        claudeVersion = claudeVersionSelect ? claudeVersionSelect.value : 'claude-sonnet-4-5-20250929';
    }
    
    // Obter API key
    const apiKey = appState.apiKeys[appState.selectedAI];
    
    if (!apiKey) {
        showAlert('error', `API key não encontrada para ${appState.selectedAI}`);
        return false;
    }
    
    // Confirmar ação
    const templateInfo = promptConfig ? ` usando template "${promptConfig.template}"` : '';
    if (!confirm(`Reanalisar subparcela ${subparcela} com ${appState.selectedAI}${templateInfo}?\n\nIsso substituirá todas as espécies atuais desta subparcela.`)) {
        return false;
    }
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Adicionar API keys
        if (appState.selectedAI === 'claude') {
            headers['X-API-Key-Claude'] = apiKey;
            if (claudeVersion) {
                headers['X-Claude-Version'] = claudeVersion;
            }
        } else if (appState.selectedAI === 'gpt4') {
            headers['X-API-Key-GPT4'] = apiKey;
        } else if (appState.selectedAI === 'gemini') {
            headers['X-API-Key-Gemini'] = apiKey;
            headers['X-Gemini-Version'] = geminiVersion;
        } else if (appState.selectedAI === 'deepseek') {
            headers['X-API-Key-DeepSeek'] = apiKey;
        } else if (appState.selectedAI === 'qwen') {
            headers['X-API-Key-Qwen'] = apiKey;
        } else if (appState.selectedAI === 'huggingface') {
            headers['X-API-Key-HuggingFace'] = apiKey;
        }
        
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/subparcela/${subparcela}/reanalyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                ai_model: appState.selectedAI,
                template_config: promptConfig
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro na reanálise');
        }
        
        // Atualizar dados locais
        const idx = appState.analysisResults.findIndex(r => r.subparcela === subparcela);
        if (idx !== -1) {
            appState.analysisResults[idx].especies = result.especies;
        }
        
        appState.especiesUnificadas = result.especies_unificadas || appState.especiesUnificadas;
        
        // Atualizar interface
        displaySubparcelas();
        displayEspecies();
        
        showAlert('success', `Subparcela ${subparcela} reanalisada com sucesso! ${result.especies.length} espécies encontradas.`);
        
        return true;
        
    } catch (error) {
        console.error('Erro na reanálise:', error);
        showAlert('error', `Erro ao reanalisar: ${error.message}`);
        return false;
    }
}

// Funções auxiliares para obter informações da lista unificada
function getDisplayName(apelidoOriginal) {
    // Buscar na lista unificada o apelido de usuário ou retornar o original
    const especieUnificada = appState.especies[apelidoOriginal];
    if (especieUnificada && especieUnificada.apelido_usuario) {
        return especieUnificada.apelido_usuario;
    }
    return apelidoOriginal;
}

function getDisplayTaxonomy(apelidoOriginal) {
    // Buscar informações taxonômicas da lista unificada
    const especieUnificada = appState.especies[apelidoOriginal];
    if (!especieUnificada) {
        return '';
    }
    
    const parts = [];
    if (especieUnificada.genero) {
        parts.push(`<em>${especieUnificada.genero}</em>`);
    }
    if (especieUnificada.especie) {
        parts.push(`<em>${especieUnificada.especie}</em>`);
    }
    if (especieUnificada.familia) {
        parts.push(`(${especieUnificada.familia})`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '';
}

// Editar espécie global
function editSpecies(apelidoOriginal) {
    const especie = appState.especies[apelidoOriginal];

    document.getElementById('edit-apelido-original').value = apelidoOriginal;
    document.getElementById('edit-apelido-original-display').value = apelidoOriginal;
    document.getElementById('edit-apelido-usuario').value = especie.apelido_usuario;
    document.getElementById('edit-genero').value = especie.genero || '';
    document.getElementById('edit-especie').value = especie.especie || '';
    document.getElementById('edit-familia').value = especie.familia || '';

    elements.editModal.classList.add('active');
}

async function handleEditSubmit(e) {
    e.preventDefault();

    const apelidoOriginal = document.getElementById('edit-apelido-original').value;
    const data = {
        apelido_usuario: document.getElementById('edit-apelido-usuario').value,
        genero: document.getElementById('edit-genero').value,
        especie: document.getElementById('edit-especie').value,
        familia: document.getElementById('edit-familia').value
    };

    try {
        const response = await fetch(`/api/especies/${encodeURIComponent(apelidoOriginal)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Atualizar estado local
            appState.especies[apelidoOriginal] = result.especie;
            
            // Buscar dados atualizados do servidor para garantir sincronização completa
            await refreshData();
            
            elements.editModal.classList.remove('active');
            showAlert('success', 'Espécie atualizada com sucesso!');
        } else {
            showAlert('error', result.error || 'Erro ao atualizar espécie');
        }
    } catch (error) {
        showAlert('error', 'Erro ao atualizar: ' + error.message);
    }
}

// Unificar espécies selecionadas
async function mergeSelectedSpecies() {
    const checkboxes = document.querySelectorAll('.species-checkbox:checked');
    const selectedSpecies = Array.from(checkboxes).map(cb => cb.value);

    if (selectedSpecies.length < 2) {
        showAlert('error', 'Selecione pelo menos 2 espécies para unificar');
        return;
    }

    const novoApelido = prompt('Digite o nome para a espécie unificada:');
    if (!novoApelido) return;

    const genero = prompt('Gênero (opcional):') || '';
    const especie = prompt('Espécie (opcional):') || '';
    const familia = prompt('Família (opcional):') || '';

    try {
        const response = await fetch('/api/especies/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                especies_origem: selectedSpecies,
                novo_apelido: novoApelido,
                genero,
                especie,
                familia
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', result.message);
            await refreshData();
        } else {
            showAlert('error', result.error || 'Erro ao unificar espécies');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

// Subdividir espécie com modal adequado
let splitModalState = {
    subparcela: null,
    selectedSpecies: null,
    newSpecies: []
};

async function splitSpeciesDialog(subparcela) {
    const especies = appState.analysisResults.find(r => r.subparcela === subparcela)?.especies || [];
    
    if (especies.length === 0) {
        showAlert('warning', 'Nenhuma espécie encontrada nesta subparcela');
        return;
    }
    
    splitModalState = {
        subparcela: subparcela,
        selectedSpecies: null,
        newSpecies: []
    };
    
    const modal = document.getElementById('split-modal');
    const body = document.getElementById('split-body');
    
    body.innerHTML = `
        <div class="split-section">
            <h3>1. Selecione a espécie a subdividir</h3>
            <div class="species-select-list">
                ${especies.map(esp => `
                    <div class="species-select-item" onclick="selectSpeciesForSplit('${esp.apelido}', ${esp.cobertura}, ${esp.altura}, '${esp.forma_vida}')">
                        <div>
                            <strong>${esp.apelido}</strong>
                            <div style="font-size: 0.9rem; color: #718096;">
                                Cobertura: ${esp.cobertura}% | Altura: ${esp.altura}cm | ${esp.forma_vida}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="split-section" id="split-form-section" style="display: none;">
            <h3>2. Defina as novas espécies</h3>
            <p style="color: #718096; margin-bottom: 15px;">
                Divida "<span id="split-species-name"></span>" em múltiplas espécies. A soma das coberturas deve ser igual a <span id="split-original-coverage"></span>%.
            </p>
            
            <div id="new-species-container"></div>
            
            <button class="btn btn-success" onclick="addNewSpeciesField()" style="width: 100%; margin-top: 10px;">
                + Adicionar Espécie
            </button>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ed8936;">
                <strong>Cobertura atual: <span id="total-coverage">0</span>% / <span id="target-coverage">0</span>%</strong>
            </div>
        </div>
        
        <div class="split-actions">
            <button class="btn btn-secondary" onclick="closeSplitModal()">Cancelar</button>
            <button class="btn btn-success" id="confirm-split-btn" onclick="confirmSplit()" disabled>
                Confirmar Subdivisão
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function selectSpeciesForSplit(apelido, cobertura, altura, formaVida) {
    // Remover seleção anterior
    document.querySelectorAll('.species-select-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Selecionar novo
    event.target.closest('.species-select-item').classList.add('selected');
    
    splitModalState.selectedSpecies = {
        apelido: apelido,
        cobertura: cobertura,
        altura: altura,
        forma_vida: formaVida
    };
    
    splitModalState.newSpecies = [];
    
    // Mostrar formulário
    document.getElementById('split-form-section').style.display = 'block';
    document.getElementById('split-species-name').textContent = apelido;
    document.getElementById('split-original-coverage').textContent = cobertura;
    document.getElementById('target-coverage').textContent = cobertura;
    document.getElementById('new-species-container').innerHTML = '';
    
    // Adicionar 2 campos iniciais
    addNewSpeciesField();
    addNewSpeciesField();
}

function addNewSpeciesField() {
    const container = document.getElementById('new-species-container');
    const index = splitModalState.newSpecies.length;
    
    splitModalState.newSpecies.push({
        apelido: '',
        cobertura: 0,
        altura: splitModalState.selectedSpecies?.altura || 0,
        forma_vida: splitModalState.selectedSpecies?.forma_vida || 'Erva'
    });
    
    const item = document.createElement('div');
    item.className = 'new-species-item';
    item.innerHTML = `
        <button class="remove-species-btn" onclick="removeNewSpeciesField(${index})">×</button>
        <div class="new-species-inputs">
            <div class="form-input-group">
                <label>Nome da Espécie:</label>
                <input type="text" placeholder="Ex: Capim Alto" oninput="updateNewSpecies(${index}, 'apelido', this.value)">
            </div>
            <div class="form-input-group">
                <label>Cobertura (%):</label>
                <input type="number" min="0" max="100" step="0.1" value="0" oninput="updateNewSpecies(${index}, 'cobertura', parseFloat(this.value) || 0)">
            </div>
            <div class="form-input-group">
                <label>Altura (cm):</label>
                <input type="number" min="0" value="${splitModalState.selectedSpecies?.altura || 0}" oninput="updateNewSpecies(${index}, 'altura', parseFloat(this.value) || 0)">
            </div>
            <div class="form-input-group">
                <label>Forma de Vida:</label>
                <select onchange="updateNewSpecies(${index}, 'forma_vida', this.value)">
                    <option value="Erva" ${splitModalState.selectedSpecies?.forma_vida === 'Erva' ? 'selected' : ''}>Erva</option>
                    <option value="Arbusto" ${splitModalState.selectedSpecies?.forma_vida === 'Arbusto' ? 'selected' : ''}>Arbusto</option>
                    <option value="Subarbusto" ${splitModalState.selectedSpecies?.forma_vida === 'Subarbusto' ? 'selected' : ''}>Subarbusto</option>
                    <option value="Plântula" ${splitModalState.selectedSpecies?.forma_vida === 'Plântula' ? 'selected' : ''}>Plântula</option>
                    <option value="Liana" ${splitModalState.selectedSpecies?.forma_vida === 'Liana' ? 'selected' : ''}>Liana</option>
                    <option value="Trepadeira" ${splitModalState.selectedSpecies?.forma_vida === 'Trepadeira' ? 'selected' : ''}>Trepadeira</option>
                    <option value="-" ${splitModalState.selectedSpecies?.forma_vida === '-' ? 'selected' : ''}>-</option>
                </select>
            </div>
        </div>
    `;
    
    container.appendChild(item);
    updateCoverageTotal();
}

function removeNewSpeciesField(index) {
    splitModalState.newSpecies.splice(index, 1);
    renderNewSpeciesFields();
}

function renderNewSpeciesFields() {
    const container = document.getElementById('new-species-container');
    container.innerHTML = '';
    
    splitModalState.newSpecies.forEach((_, index) => {
        addNewSpeciesField();
    });
}

function updateNewSpecies(index, field, value) {
    if (splitModalState.newSpecies[index]) {
        splitModalState.newSpecies[index][field] = value;
        updateCoverageTotal();
    }
}

function updateCoverageTotal() {
    const total = splitModalState.newSpecies.reduce((sum, esp) => sum + (esp.cobertura || 0), 0);
    const target = splitModalState.selectedSpecies?.cobertura || 0;
    
    document.getElementById('total-coverage').textContent = total.toFixed(1);
    
    const confirmBtn = document.getElementById('confirm-split-btn');
    const isValid = Math.abs(total - target) < 0.1 && 
                   splitModalState.newSpecies.length >= 2 &&
                   splitModalState.newSpecies.every(esp => esp.apelido.trim() !== '');
    
    confirmBtn.disabled = !isValid;
    
    // Feedback visual
    const coverageDiv = document.getElementById('total-coverage').parentElement.parentElement;
    if (Math.abs(total - target) < 0.1) {
        coverageDiv.style.background = '#d4edda';
        coverageDiv.style.borderLeftColor = '#28a745';
    } else if (total > target) {
        coverageDiv.style.background = '#f8d7da';
        coverageDiv.style.borderLeftColor = '#dc3545';
    } else {
        coverageDiv.style.background = '#fff3cd';
        coverageDiv.style.borderLeftColor = '#ed8936';
    }
}

async function confirmSplit() {
    if (!splitModalState.selectedSpecies || !splitModalState.subparcela) return;
    
    try {
        const response = await fetch('/api/especies/split', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parcela: appState.parcelaNome,
                subparcela: splitModalState.subparcela,
                apelido_original: splitModalState.selectedSpecies.apelido,
                novas_especies: splitModalState.newSpecies
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', result.message);
            await refreshData();
            closeSplitModal();
        } else {
            showAlert('error', result.error || 'Erro ao subdividir espécie');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

function closeSplitModal() {
    const modal = document.getElementById('split-modal');
    modal.classList.remove('active');
    splitModalState = { subparcela: null, selectedSpecies: null, newSpecies: [] };
}

// Adicionar espécie a subparcela
async function addEspecieToSubparcela(subparcela) {
    const apelido = prompt('Nome da espécie:');
    if (!apelido) return;

    const cobertura = parseFloat(prompt('Cobertura (%):'));
    const altura = parseFloat(prompt('Altura (cm):'));
    const formaVida = prompt('Forma de vida (Erva/Arbusto/-):');

    try {
        const response = await fetch('/api/especies/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parcela: appState.parcelaNome,
                subparcela,
                especie: { apelido, cobertura, altura, forma_vida: formaVida }
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', result.message);
            await refreshData();
        } else {
            showAlert('error', result.error || 'Erro ao adicionar');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

// Remover espécie de subparcela
async function removeSubparcelaEspecie(subparcela, apelido) {
    if (!confirm(`Remover "${apelido}" da subparcela ${subparcela}?`)) return;

    try {
        const response = await fetch('/api/especies/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parcela: appState.parcelaNome,
                subparcela,
                apelido
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', result.message);
            await refreshData();
        } else {
            showAlert('error', result.error || 'Erro ao remover');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

// Editar espécie em subparcela específica
async function editSubparcelaEspecie(subparcela, apelido) {
    const especies = appState.analysisResults.find(r => r.subparcela === subparcela)?.especies || [];
    const especie = especies.find(e => e.apelido === apelido);

    if (!especie) return;

    const novaCobertura = parseFloat(prompt(`Nova cobertura para "${apelido}":`, especie.cobertura));
    const novaAltura = parseFloat(prompt(`Nova altura para "${apelido}":`, especie.altura));

    if (isNaN(novaCobertura) || isNaN(novaAltura)) return;

    try {
        const response = await fetch(`/api/especies/${appState.parcelaNome}/${subparcela}/${encodeURIComponent(apelido)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cobertura: novaCobertura,
                altura: novaAltura
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', 'Espécie atualizada!');
            await refreshData();
        } else {
            showAlert('error', result.error || 'Erro ao atualizar');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

// Atualizar dados
async function refreshData() {
    try {
        // Buscar dados atualizados da parcela
        const parcelaResponse = await fetch(`/api/parcela/${appState.parcelaNome}`);
        const parcelaData = await parcelaResponse.json();

        // Buscar espécies
        const especiesResponse = await fetch('/api/especies');
        const especiesData = await especiesResponse.json();

        // Atualizar estado
        appState.especies = especiesData.especies;

        // Reformatar resultados
        appState.analysisResults = [];
        for (const [subNum, subData] of Object.entries(parcelaData.subparcelas)) {
            appState.analysisResults.push({
                subparcela: parseInt(subNum),
                image: subData.image,
                especies: subData.especies
            });
        }

        // Reexibir
        displayResults();
    } catch (error) {
        console.error('Erro ao atualizar:', error);
    }
}

// Exportar para Excel
async function exportToExcel() {
    try {
        elements.exportBtn.disabled = true;
        elements.exportBtn.textContent = 'Exportando...';

        const response = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parcela: appState.parcelaNome })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Exportado com sucesso!');

            // Download automático
            window.location.href = data.download_url;
        } else {
            showAlert('error', data.error || 'Erro ao exportar');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    } finally {
        elements.exportBtn.disabled = false;
        elements.exportBtn.textContent = 'Exportar para Excel';
    }
}

// Utilitários

// Modal de Visualização + Edição de Subparcela
let imageModal = null;
let currentZoom = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
let currentSubparcela = null;

function createImageModal() {
    if (imageModal) return;
    
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.id = 'image-modal';
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <div class="modal-split-container">
            <!-- Lado esquerdo: Imagem com zoom -->
            <div class="modal-image-side">
                <img id="modal-image" src="" alt="Imagem da subparcela">
                <div class="modal-controls">
                    <button class="modal-control-btn" id="zoom-out">−</button>
                    <div class="zoom-level">
                        <span>🔍</span>
                        <span id="zoom-percentage">100%</span>
                    </div>
                    <button class="modal-control-btn" id="zoom-in">+</button>
                    <button class="modal-control-btn" id="zoom-reset">Reset</button>
                </div>
            </div>
            
            <!-- Lado direito: Edição de espécies -->
            <div class="modal-edit-side">
                <div class="modal-edit-header">
                    <h2 id="modal-subparcela-title">Subparcela 1</h2>
                    <p>Edite as espécies abaixo. Alterações são salvas automaticamente.</p>
                </div>
                
                <div class="modal-especies-list" id="modal-especies-list">
                    <!-- Espécies serão inseridas aqui -->
                </div>
                
                <div class="modal-add-species">
                    <button class="btn btn-success" onclick="addSpeciesInModal()">
                        + Adicionar Nova Espécie
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    imageModal = modal;
    
    // Event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const zoomInBtn = modal.querySelector('#zoom-in');
    const zoomOutBtn = modal.querySelector('#zoom-out');
    const zoomResetBtn = modal.querySelector('#zoom-reset');
    const modalImageSide = modal.querySelector('.modal-image-side');
    const modalImage = modal.querySelector('#modal-image');
    
    // Fechar modal
    closeBtn.addEventListener('click', closeImageModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeImageModal();
    });
    
    // Zoom com botões
    zoomInBtn.addEventListener('click', () => zoomImage(0.2));
    zoomOutBtn.addEventListener('click', () => zoomImage(-0.2));
    zoomResetBtn.addEventListener('click', resetZoom);
    
    // Zoom com scroll do mouse
    modalImageSide.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomImage(delta);
    });
    
    // Arrasto da imagem
    modalImage.addEventListener('mousedown', startDrag);
    modalImageSide.addEventListener('mousemove', drag);
    modalImageSide.addEventListener('mouseup', endDrag);
    modalImageSide.addEventListener('mouseleave', endDrag);
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeImageModal();
        if (e.key === '+' || e.key === '=') zoomImage(0.2);
        if (e.key === '-' || e.key === '_') zoomImage(-0.2);
        if (e.key === '0') resetZoom();
    });
}

function openImageModal(imageSrc, subparcelaNum) {
    if (!imageModal) createImageModal();
    
    currentSubparcela = subparcelaNum;
    
    const modalImage = imageModal.querySelector('#modal-image');
    modalImage.src = imageSrc;
    currentZoom = 1;
    updateZoomDisplay();
    
    // Atualizar título
    imageModal.querySelector('#modal-subparcela-title').textContent = `Subparcela ${subparcelaNum}`;
    
    // Carregar espécies da subparcela
    loadSubparcelaSpecies(subparcelaNum);
    
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove('active');
    document.body.style.overflow = '';
    resetZoom();
    currentSubparcela = null;
    
    // Atualizar display principal
    displayResults();
}

function loadSubparcelaSpecies(subparcelaNum) {
    const result = appState.analysisResults.find(r => r.subparcela === subparcelaNum);
    if (!result) return;
    
    const container = imageModal.querySelector('#modal-especies-list');
    container.innerHTML = '';
    
    result.especies.forEach((esp, idx) => {
        const especieDiv = document.createElement('div');
        especieDiv.className = 'modal-especie-item';
        especieDiv.dataset.index = idx;
        
        especieDiv.innerHTML = `
            <div class="especie-item-header">
                <h4>${esp.apelido}</h4>
                <div class="especie-item-actions">
                    <button class="btn btn-small btn-danger btn-icon" onclick="removeSpeciesInModal(${idx})" title="Remover">
                        ✕
                    </button>
                </div>
            </div>
            <div class="especie-form-grid">
                <div class="form-group-inline">
                    <label>Apelido:</label>
                    <input type="text" value="${esp.apelido}" 
                           onchange="updateSpeciesInModal(${idx}, 'apelido', this.value)">
                </div>
                <div class="form-group-inline">
                    <label>Família:</label>
                    <input type="text" value="${esp.familia || ''}" 
                           onchange="updateSpeciesInModal(${idx}, 'familia', this.value)"
                           placeholder="Ex: Poaceae">
                </div>
                <div class="form-group-inline">
                    <label>Gênero:</label>
                    <input type="text" value="${esp.genero || ''}" 
                           onchange="updateSpeciesInModal(${idx}, 'genero', this.value)"
                           placeholder="Ex: Paspalum">
                </div>
                <div class="form-group-inline">
                    <label>Espécie:</label>
                    <input type="text" value="${esp.especie || ''}" 
                           onchange="updateSpeciesInModal(${idx}, 'especie', this.value)"
                           placeholder="Ex: notatum">
                </div>
                <div class="form-group-inline">
                    <label>Forma de Vida:</label>
                    <select onchange="updateSpeciesInModal(${idx}, 'forma_vida', this.value)">
                        <option value="Erva" ${esp.forma_vida === 'Erva' ? 'selected' : ''}>Erva</option>
                        <option value="Arbusto" ${esp.forma_vida === 'Arbusto' ? 'selected' : ''}>Arbusto</option>
                        <option value="Subarbusto" ${esp.forma_vida === 'Subarbusto' ? 'selected' : ''}>Subarbusto</option>
                        <option value="Plântula" ${esp.forma_vida === 'Plântula' ? 'selected' : ''}>Plântula</option>
                        <option value="Liana" ${esp.forma_vida === 'Liana' ? 'selected' : ''}>Liana</option>
                        <option value="Trepadeira" ${esp.forma_vida === 'Trepadeira' ? 'selected' : ''}>Trepadeira</option>
                        <option value="-" ${esp.forma_vida === '-' ? 'selected' : ''}>-</option>
                    </select>
                </div>
                <div class="form-group-inline">
                    <label>Cobertura (%):</label>
                    <input type="number" min="0" max="100" value="${esp.cobertura}" 
                           onchange="updateSpeciesInModal(${idx}, 'cobertura', parseInt(this.value))">
                </div>
                <div class="form-group-inline">
                    <label>Altura (cm):</label>
                    <input type="number" min="0" value="${esp.altura}" 
                           onchange="updateSpeciesInModal(${idx}, 'altura', parseInt(this.value))">
                </div>
            </div>
        `;
        
        container.appendChild(especieDiv);
    });
}

async function updateSpeciesInModal(especieIndex, field, value) {
    if (!currentSubparcela) return;
    
    try {
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/subparcela/${currentSubparcela}/especie/${especieIndex}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualizar estado local
            const result = appState.analysisResults.find(r => r.subparcela === currentSubparcela);
            if (result && result.especies[especieIndex]) {
                result.especies[especieIndex][field] = value;
            }
            
            // Recarregar dados gerais de espécies
            await loadEspeciesData();
            
            showAlert('success', 'Atualizado!');
        } else {
            showAlert('error', data.error || 'Erro ao atualizar');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

async function removeSpeciesInModal(especieIndex) {
    if (!currentSubparcela) return;
    if (!confirm('Remover esta espécie?')) return;
    
    try {
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/subparcela/${currentSubparcela}/especie/${especieIndex}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualizar estado local
            const result = appState.analysisResults.find(r => r.subparcela === currentSubparcela);
            if (result) {
                result.especies.splice(especieIndex, 1);
            }
            
            // Recarregar lista no modal
            loadSubparcelaSpecies(currentSubparcela);
            
            // Recarregar dados gerais
            await loadEspeciesData();
            
            showAlert('success', 'Espécie removida!');
        } else {
            showAlert('error', data.error || 'Erro ao remover');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

async function addSpeciesInModal() {
    if (!currentSubparcela) return;
    
    // 🔧 FIX: Usar formulário inline ao invés de prompt()
    addEspecieToSubparcela(currentSubparcela);
}

async function loadEspeciesData() {
    try {
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/especies`);
        const data = await response.json();
        
        if (data.success) {
            appState.especies = data.especies;
        }
    } catch (error) {
        console.error('Erro ao carregar espécies:', error);
    }
}

function zoomImage(delta) {
    currentZoom = Math.max(0.5, Math.min(5, currentZoom + delta));
    applyZoom();
}

function resetZoom() {
    currentZoom = 1;
    applyZoom();
    
    // Centralizar imagem
    const modalImageSide = imageModal.querySelector('.modal-image-side');
    modalImageSide.scrollLeft = 0;
    modalImageSide.scrollTop = 0;
}

function applyZoom() {
    const modalImage = imageModal.querySelector('#modal-image');
    modalImage.style.transform = `scale(${currentZoom})`;
    
    if (currentZoom > 1) {
        modalImage.classList.add('zoomed');
    } else {
        modalImage.classList.remove('zoomed');
    }
    
    updateZoomDisplay();
}

function updateZoomDisplay() {
    const zoomPercentage = imageModal.querySelector('#zoom-percentage');
    zoomPercentage.textContent = `${Math.round(currentZoom * 100)}%`;
}

function startDrag(e) {
    if (currentZoom <= 1) return;
    
    isDragging = true;
    const modalImageSide = imageModal.querySelector('.modal-image-side');
    const modalImage = imageModal.querySelector('#modal-image');
    
    modalImage.classList.add('dragging');
    startX = e.pageX - modalImageSide.offsetLeft;
    startY = e.pageY - modalImageSide.offsetTop;
    scrollLeft = modalImageSide.scrollLeft;
    scrollTop = modalImageSide.scrollTop;
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const modalImageSide = imageModal.querySelector('.modal-image-side');
    const x = e.pageX - modalImageSide.offsetLeft;
    const y = e.pageY - modalImageSide.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    
    modalImageSide.scrollLeft = scrollLeft - walkX;
    modalImageSide.scrollTop = scrollTop - walkY;
}

function endDrag() {
    isDragging = false;
    const modalImage = imageModal.querySelector('#modal-image');
    if (modalImage) {
        modalImage.classList.remove('dragging');
    }
}

// Adicionar botões de edição nas subparcelas
function addEditButtons() {
    document.querySelectorAll('.subparcela-card').forEach(card => {
        if (card.dataset.editBtnAdded) return;
        
        const h3 = card.querySelector('h3');
        const subNum = parseInt(h3.textContent.match(/\d+/)[0]);
        const img = card.querySelector('img');
        
        if (!img) return;
        
        // Criar botão de edição
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-subparcela-btn';
        editBtn.innerHTML = '🔍 Ver e Editar';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openImageModal(img.src, subNum);
        };
        
        card.appendChild(editBtn);
        card.dataset.editBtnAdded = 'true';
    });
}

// ====== MODAL DE VISUALIZAÇÃO E EDIÇÃO (NOVO UX) ======
let viewerModal = null;
let currentViewerIndex = 0;
let viewerZoom = 1;
let viewerTranslateX = 0;
let viewerTranslateY = 0;
let viewerIsDragging = false;
let viewerDragStart = {x: 0, y: 0};

function openImageViewer(subparcela, filename) {
    // Encontrar índice da imagem atual
    currentViewerIndex = appState.analysisResults.findIndex(r => r.subparcela === subparcela);
    
    if (currentViewerIndex === -1) {
        showAlert('error', 'Imagem não encontrada');
        return;
    }
    
    createViewerModal();
    updateViewerContent();
    viewerModal.classList.add('active');
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
}

function createViewerModal() {
    if (viewerModal) return;
    
    viewerModal = document.createElement('div');
    viewerModal.className = 'image-viewer-modal';
    viewerModal.innerHTML = `
        <div class="viewer-container">
            <div class="viewer-header">
                <div class="viewer-title">Visualização e Edição</div>
                <div class="viewer-header-controls">
                    <button class="viewer-close-btn" onclick="closeImageViewer()">✕ Fechar</button>
                </div>
            </div>
            
            <div class="viewer-content">
                <!-- Lado da Imagem (60%) -->
                <div class="viewer-image-side">
                    <div class="viewer-position-indicator" id="viewer-position"></div>
                    
                    <div class="viewer-nav-arrows">
                        <button class="viewer-arrow" id="viewer-prev" onclick="navigateViewer(-1)">‹</button>
                        <button class="viewer-arrow" id="viewer-next" onclick="navigateViewer(1)">›</button>
                    </div>
                    
                    <div class="viewer-image-container" id="viewer-img-container">
                        <img id="viewer-image" src="" alt="Subparcela">
                    </div>
                    
                    <div class="viewer-zoom-controls">
                        <button class="viewer-zoom-btn" onclick="zoomViewer(-0.2)" title="Diminuir zoom">−</button>
                        <span id="viewer-zoom-level">100%</span>
                        <button class="viewer-zoom-btn" onclick="zoomViewer(0.2)" title="Aumentar zoom">+</button>
                        <button class="viewer-zoom-btn" onclick="resetViewerZoom()" title="Resetar zoom">⟲</button>
                    </div>
                </div>
                
                <!-- Lado da Edição (40%) -->
                <div class="viewer-edit-side">
                    <div class="viewer-edit-header">
                        <div class="viewer-edit-title">Espécies Detectadas</div>
                        <button class="viewer-add-species-btn" onclick="addSpeciesInViewer()">+ Adicionar Espécie</button>
                    </div>
                    <div class="viewer-species-list" id="viewer-species-list">
                        <!-- Espécies serão carregadas aqui -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(viewerModal);
    
    // Eventos de zoom com scroll do mouse
    const imgContainer = viewerModal.querySelector('#viewer-img-container');
    imgContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        zoomViewer(e.deltaY > 0 ? -0.1 : 0.1);
    });
    
    // Eventos de drag
    const img = viewerModal.querySelector('#viewer-image');
    img.addEventListener('mousedown', startViewerDrag);
    document.addEventListener('mousemove', doViewerDrag);
    document.addEventListener('mouseup', endViewerDrag);
    
    // Teclado
    document.addEventListener('keydown', handleViewerKeyboard);
    
    // Fechar ao clicar fora (no overlay escuro)
    viewerModal.addEventListener('click', (e) => {
        if (e.target === viewerModal) {
            closeImageViewer();
        }
    });
}

function updateViewerContent() {
    if (!viewerModal || currentViewerIndex < 0) return;
    
    const result = appState.analysisResults[currentViewerIndex];
    const total = appState.analysisResults.length;
    
    // Atualizar imagem
    const img = viewerModal.querySelector('#viewer-image');
    img.src = `/static/uploads/${appState.parcelaNome}/${result.image}`;
    
    // Atualizar indicador de posição
    const posIndicator = viewerModal.querySelector('#viewer-position');
    posIndicator.textContent = `Subparcela ${result.subparcela} (${currentViewerIndex + 1}/${total})`;
    
    // Atualizar botões de navegação
    const prevBtn = viewerModal.querySelector('#viewer-prev');
    const nextBtn = viewerModal.querySelector('#viewer-next');
    prevBtn.classList.toggle('disabled', currentViewerIndex === 0);
    nextBtn.classList.toggle('disabled', currentViewerIndex === total - 1);
    
    // Resetar zoom
    resetViewerZoom();
    
    // Carregar espécies
    loadViewerSpecies();
}

function loadViewerSpecies() {
    const result = appState.analysisResults[currentViewerIndex];
    const speciesList = viewerModal.querySelector('#viewer-species-list');
    
    if (!result.especies || result.especies.length === 0) {
        speciesList.innerHTML = `
            <div style="text-align: center; color: #a0aec0; padding: 40px 20px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🌿</div>
                <div style="font-size: 1.1rem;">Nenhuma espécie detectada</div>
                <div style="font-size: 0.9rem; margin-top: 8px;">Clique em "Adicionar Espécie" para começar</div>
            </div>
        `;
        return;
    }
    
    speciesList.innerHTML = result.especies.map((esp, index) => `
        <div class="viewer-species-item" id="viewer-species-${index}">
            <div class="viewer-species-view" id="viewer-species-view-${index}">
                <div class="viewer-species-name">
                    🌿 ${esp.apelido}
                    ${esp.link_fotos ? `<a href="${esp.link_fotos}" target="_blank" class="viewer-photo-link" title="Ver fotos de referência">🔗 Ver Fotos</a>` : ''}
                </div>
                ${esp.genero || esp.familia ? `
                    <div style="color: #a0aec0; font-size: 0.9rem; margin: 8px 0; font-style: italic;">
                        ${esp.genero ? `<strong>${esp.genero}</strong>` : ''}
                        ${esp.genero && esp.familia ? ' - ' : ''}
                        ${esp.familia || ''}
                    </div>
                ` : ''}
                ${esp.observacoes ? `
                    <div style="background: #2d3748; padding: 10px; border-radius: 6px; margin: 10px 0; color: #cbd5e0; font-size: 0.9rem; border-left: 3px solid #667eea;">
                        <strong style="color: #a0aec0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Observações:</strong><br>
                        ${esp.observacoes}
                    </div>
                ` : ''}
                <div class="viewer-species-details">
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">Cobertura</div>
                        <div class="viewer-species-detail-value">${esp.cobertura}%</div>
                    </div>
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">Altura</div>
                        <div class="viewer-species-detail-value">${esp.altura} cm</div>
                    </div>
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">Forma</div>
                        <div class="viewer-species-detail-value">${esp.forma_vida}</div>
                    </div>
                </div>
                <div class="viewer-species-actions">
                    <button class="viewer-edit-btn" onclick="startEditSpeciesInViewer(${index})">✏️ Editar</button>
                    <button class="viewer-split-btn" onclick="splitSpeciesInViewer(${index})">✂️ Dividir</button>
                    <button class="viewer-delete-btn" onclick="deleteSpeciesInViewer(${index})">🗑️ Remover</button>
                </div>
            </div>
            
            <div class="viewer-species-edit" id="viewer-species-edit-${index}" style="display: none;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Nome/Apelido *</label>
                    <input type="text" id="viewer-edit-apelido-${index}" value="${esp.apelido}" 
                           style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Gênero</label>
                        <input type="text" id="viewer-edit-genero-${index}" value="${esp.genero || ''}" 
                               placeholder="Ex: Paspalum"
                               style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Família</label>
                        <input type="text" id="viewer-edit-familia-${index}" value="${esp.familia || ''}" 
                               placeholder="Ex: Poaceae"
                               style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Observações</label>
                    <textarea id="viewer-edit-observacoes-${index}" rows="3" 
                              placeholder="Descrição das características visuais observadas..."
                              style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 0.95rem; resize: vertical;">${esp.observacoes || ''}</textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Cobertura (%)</label>
                        <input type="number" id="viewer-edit-cobertura-${index}" value="${esp.cobertura}" min="0" max="100"
                               style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Altura (cm)</label>
                        <input type="number" id="viewer-edit-altura-${index}" value="${esp.altura}" min="0"
                               style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Forma de Vida</label>
                    <select id="viewer-edit-forma-${index}" 
                            style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                        <option value="Erva" ${esp.forma_vida === 'Erva' ? 'selected' : ''}>Erva</option>
                        <option value="Arbusto" ${esp.forma_vida === 'Arbusto' ? 'selected' : ''}>Arbusto</option>
                        <option value="Plântula" ${esp.forma_vida === 'Plântula' ? 'selected' : ''}>Plântula</option>
                        <option value="Trepadeira" ${esp.forma_vida === 'Trepadeira' ? 'selected' : ''}>Trepadeira</option>
                        <option value="Subarbusto" ${esp.forma_vida === 'Subarbusto' ? 'selected' : ''}>Subarbusto</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">🔗 Link das Fotos (URL)</label>
                    <input type="url" id="viewer-edit-link-fotos-${index}" value="${esp.link_fotos || ''}" 
                           placeholder="https://exemplo.com/fotos-da-especie"
                           style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 0.95rem;">
                    <small style="color: #a0aec0; font-size: 0.8rem; display: block; margin-top: 4px;">Cole o link para fotos de referência da espécie</small>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="viewer-edit-btn" onclick="saveEditSpeciesInViewer(${index})" style="flex: 1;">
                        ✓ Salvar
                    </button>
                    <button class="viewer-delete-btn" onclick="cancelEditSpeciesInViewer(${index})" style="flex: 1;">
                        ✕ Cancelar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll suave para o topo da lista ao carregar
    speciesList.scrollTo({ top: 0, behavior: 'smooth' });
}

function startEditSpeciesInViewer(especieIndex) {
    const viewDiv = document.getElementById(`viewer-species-view-${especieIndex}`);
    const editDiv = document.getElementById(`viewer-species-edit-${especieIndex}`);
    
    viewDiv.style.display = 'none';
    editDiv.style.display = 'block';
    
    // Focus no primeiro input
    document.getElementById(`viewer-edit-apelido-${especieIndex}`).focus();
}

function cancelEditSpeciesInViewer(especieIndex) {
    const viewDiv = document.getElementById(`viewer-species-view-${especieIndex}`);
    const editDiv = document.getElementById(`viewer-species-edit-${especieIndex}`);
    
    viewDiv.style.display = 'block';
    editDiv.style.display = 'none';
}

async function saveEditSpeciesInViewer(especieIndex) {
    const result = appState.analysisResults[currentViewerIndex];
    
    const apelido = document.getElementById(`viewer-edit-apelido-${especieIndex}`).value.trim();
    const genero = document.getElementById(`viewer-edit-genero-${especieIndex}`).value.trim();
    const familia = document.getElementById(`viewer-edit-familia-${especieIndex}`).value.trim();
    const observacoes = document.getElementById(`viewer-edit-observacoes-${especieIndex}`).value.trim();
    const cobertura = parseInt(document.getElementById(`viewer-edit-cobertura-${especieIndex}`).value) || 0;
    const altura = parseInt(document.getElementById(`viewer-edit-altura-${especieIndex}`).value) || 0;
    const forma_vida = document.getElementById(`viewer-edit-forma-${especieIndex}`).value;
    const link_fotos = document.getElementById(`viewer-edit-link-fotos-${especieIndex}`).value.trim();
    
    if (!apelido) {
        showAlert('error', 'Nome da espécie é obrigatório');
        return;
    }
    
    const especieAtualizada = { 
        apelido, 
        genero, 
        familia, 
        observacoes, 
        cobertura, 
        altura, 
        forma_vida,
        link_fotos
    };
    
    try {
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/subparcela/${result.subparcela}/especie/${especieIndex}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(especieAtualizada)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualizar estado local
            result.especies[especieIndex] = especieAtualizada;
            
            // Buscar dados atualizados do servidor para sincronizar completamente
            await refreshData();
            
            // Recarregar visualização do viewer com dados atualizados
            loadViewerSpecies();
            
            showAlert('success', 'Espécie atualizada com sucesso!');
        } else {
            showAlert('error', data.error || 'Erro ao atualizar espécie');
        }
    } catch (error) {
        console.error('Erro ao salvar espécie:', error);
        showAlert('error', 'Erro ao salvar: ' + error.message);
    }
}

function navigateViewer(direction) {
    const total = appState.analysisResults.length;
    const newIndex = currentViewerIndex + direction;
    
    if (newIndex < 0 || newIndex >= total) return;
    
    currentViewerIndex = newIndex;
    updateViewerContent();
}

function zoomViewer(delta) {
    viewerZoom = Math.max(0.5, Math.min(5, viewerZoom + delta));
    applyViewerZoom();
}

function resetViewerZoom() {
    viewerZoom = 1;
    viewerTranslateX = 0;
    viewerTranslateY = 0;
    applyViewerZoom();
}

function applyViewerZoom() {
    const img = viewerModal.querySelector('#viewer-image');
    img.style.transform = `scale(${viewerZoom}) translate(${viewerTranslateX}px, ${viewerTranslateY}px)`;
    
    const zoomDisplay = viewerModal.querySelector('#viewer-zoom-level');
    zoomDisplay.textContent = `${Math.round(viewerZoom * 100)}%`;
    
    // Mudar cursor baseado no zoom
    img.style.cursor = viewerZoom > 1 ? 'grab' : 'default';
}

function startViewerDrag(e) {
    if (viewerZoom <= 1) return;
    
    viewerIsDragging = true;
    viewerDragStart.x = e.clientX - viewerTranslateX;
    viewerDragStart.y = e.clientY - viewerTranslateY;
    
    const img = viewerModal.querySelector('#viewer-image');
    img.style.cursor = 'grabbing';
}

function doViewerDrag(e) {
    if (!viewerIsDragging) return;
    
    e.preventDefault();
    viewerTranslateX = e.clientX - viewerDragStart.x;
    viewerTranslateY = e.clientY - viewerDragStart.y;
    applyViewerZoom();
}

function endViewerDrag() {
    if (!viewerIsDragging) return;
    
    viewerIsDragging = false;
    const img = viewerModal?.querySelector('#viewer-image');
    if (img) {
        img.style.cursor = 'grab';
    }
}

function handleViewerKeyboard(e) {
    if (!viewerModal || !viewerModal.classList.contains('active')) return;
    
    switch(e.key) {
        case 'Escape':
            closeImageViewer();
            break;
        case 'ArrowLeft':
            navigateViewer(-1);
            break;
        case 'ArrowRight':
            navigateViewer(1);
            break;
        case '+':
        case '=':
            zoomViewer(0.2);
            break;
        case '-':
        case '_':
            zoomViewer(-0.2);
            break;
        case '0':
            resetViewerZoom();
            break;
    }
}

function closeImageViewer() {
    if (!viewerModal) return;
    
    viewerModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Limpar eventos
    document.removeEventListener('keydown', handleViewerKeyboard);
}

async function addSpeciesInViewer() {
    const result = appState.analysisResults[currentViewerIndex];
    
    // 🔧 FIX: Usar formulário inline ao invés de prompt()
    addEspecieToSubparcela(result.subparcela);
}

async function deleteSpeciesInViewer(especieIndex) {
    if (!confirm('Remover esta espécie?')) return;
    
    const result = appState.analysisResults[currentViewerIndex];
    
    try {
        const response = await fetch(`/api/parcela/${appState.parcelaNome}/subparcela/${result.subparcela}/especie/${especieIndex}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            result.especies.splice(especieIndex, 1);
            loadViewerSpecies();
            
            // Atualizar visualização principal
            displaySubparcelas();
            displaySpeciesTable();
            
            showAlert('success', 'Espécie removida!');
        } else {
            showAlert('error', data.error || 'Erro ao remover');
        }
    } catch (error) {
        showAlert('error', 'Erro: ' + error.message);
    }
}

function splitSpeciesInViewer(especieIndex) {
    const result = appState.analysisResults[currentViewerIndex];
    const especie = result.especies[especieIndex];
    
    // Fechar o viewer e abrir o modal de split
    closeImageViewer();
    
    // Pequeno delay para suavizar a transição
    setTimeout(() => {
        splitSpeciesDialog(result.subparcela);
        
        // Auto-selecionar a espécie
        setTimeout(() => {
            selectSpeciesForSplit(especie.apelido, especie.cobertura, especie.altura, especie.forma_vida);
        }, 100);
    }, 200);
}

// Atualizar botão nas subparcelas para usar o novo modal
function addViewerButtons() {
    document.querySelectorAll('.subparcela-card').forEach(card => {
        if (card.dataset.viewerBtnAdded) return;
        
        const h3 = card.querySelector('h3');
        const subNum = parseInt(h3.textContent.match(/\d+/)[0]);
        const img = card.querySelector('img');
        
        if (!img) return;
        
        // Adicionar evento de click na imagem
        img.style.cursor = 'pointer';
        img.onclick = () => {
            const result = appState.analysisResults.find(r => r.subparcela === subNum);
            if (result) {
                openImageViewer(subNum, result.filename);
            }
        };
        
        // Criar botão "Ver"
        const viewBtn = document.createElement('button');
        viewBtn.className = 'edit-subparcela-btn';
        viewBtn.innerHTML = '🖼️ Ver e Editar';
        viewBtn.onclick = (e) => {
            e.stopPropagation();
            const result = appState.analysisResults.find(r => r.subparcela === subNum);
            if (result) {
                openImageViewer(subNum, result.filename);
            }
        };
        
        card.appendChild(viewBtn);
        card.dataset.viewerBtnAdded = 'true';
    });
}

// Nova Análise - Limpa todo o sistema
function startNewAnalysis() {
    if (!confirm('⚠️ Tem certeza que deseja iniciar uma nova análise?\n\nTodos os dados da análise atual serão perdidos (espécies, subparcelas, configurações).\n\nRecomendamos exportar um ZIP antes de continuar.')) {
        return;
    }
    
    try {
        // Limpar estado do backend
        fetch('/api/clear-analysis', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✓ Backend limpo');
                }
            })
            .catch(err => console.log('Aviso: não foi possível limpar backend:', err));
        
        // Limpar estado do frontend
        appState.parcelaNome = '';
        appState.uploadedFiles = [];
        appState.analysisResults = [];
        appState.especies = {};
        appState.especiesUnificadas = {};
        appState.pendingNewImages = null;
        
        // Limpar elementos da interface
        elements.parcelaName.value = 'Parcela_1';
        elements.fileCount.textContent = 'Nenhum arquivo selecionado';
        elements.previewContainer.innerHTML = '';
        elements.uploadBtn.disabled = true;
        elements.imageUpload.value = '';
        elements.analysisResults.innerHTML = '';
        elements.speciesTbody.innerHTML = '';
        elements.resultsSummary.innerHTML = '';
        elements.subparcelasGrid.innerHTML = '';
        
        // Ocultar todas as seções exceto upload
        elements.analysisSection.style.display = 'none';
        elements.speciesSection.style.display = 'none';
        elements.exportSection.style.display = 'none';
        elements.addImagesBtn.style.display = 'none';
        elements.manualModeBtn.style.display = 'none';
        
        // Mostrar botões de análise novamente
        elements.analyzeBtn.style.display = 'inline-block';
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showAlert('success', '✨ Nova análise iniciada! Sistema limpo e pronto para uso.');
        
    } catch (error) {
        console.error('Erro ao iniciar nova análise:', error);
        showAlert('error', 'Erro ao limpar sistema: ' + error.message);
    }
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    document.querySelector('.container').insertBefore(alert, document.querySelector('.container').firstChild);

    setTimeout(() => alert.remove(), 5000);
}
