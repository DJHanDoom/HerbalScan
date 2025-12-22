// Estado global da aplicação
const appState = {
    parcelaNome: 'Parcela_9',
    uploadedFiles: [],
    analysisResults: [],
    especies: {},
    especiesUnificadas: {},
    currentSubparcela: null,
    availableAIs: [],
    selectedAI: 'gemini', // Gemini como padrão
    apiKeys: {
        claude: localStorage.getItem('ANTHROPIC_API_KEY') || '',
        gpt4: localStorage.getItem('OPENAI_API_KEY') || '',
        gemini: localStorage.getItem('GOOGLE_API_KEY') || '',
        deepseek: localStorage.getItem('DEEPSEEK_API_KEY') || '',
        qwen: localStorage.getItem('QWEN_API_KEY') || '',
        huggingface: localStorage.getItem('HUGGINGFACE_API_KEY') || ''
    },

    // Método para atualizar espécie (chamado pelo modal)
    updateSpecies: function (oldApelido, newData) {
        console.log(`🔄 appState.updateSpecies: Atualizando '${oldApelido}'`, newData);

        // 1. Atualizar na lista unificada
        if (this.especies[oldApelido]) {
            // Mesclar dados
            Object.assign(this.especies[oldApelido], newData);

            // Verificar renomeação
            if (newData.apelido_usuario && newData.apelido_usuario !== oldApelido) {
                const newName = newData.apelido_usuario;
                console.log(`📝 Renomeando na lista unificada: ${oldApelido} -> ${newName}`);

                // Mover para nova chave
                this.especies[newName] = this.especies[oldApelido];
                delete this.especies[oldApelido];

                // Atualizar referência local para o loop abaixo
                oldApelido = newName;
            }
        }

        // 2. Propagar para todas as ocorrências nos resultados (subparcelas)
        let countUpdated = 0;
        this.analysisResults.forEach(result => {
            if (result.especies) {
                result.especies.forEach(esp => {
                    // Verificar match (pelo apelido atual ou original)
                    if (esp.apelido === oldApelido || esp.apelido_original === oldApelido || esp.apelido === newData.apelido_original) {
                        // Atualizar campos
                        Object.assign(esp, newData);

                        // Se houve renomeação explicita no objeto data
                        if (newData.apelido_usuario) {
                            esp.apelido = newData.apelido_usuario;
                        }
                        countUpdated++;
                    }
                });
            }
        });

        console.log(`✅ ${countUpdated} ocorrências atualizadas no appState.`);
    },

    // Método para atualizar a interface (chamado pelo modal)
    refreshUI: function () {
        console.log('🔄 appState.refreshUI: Re-renderizando interface...');

        // Re-renderizar tabelas e grids
        displayResults();

        // Forçar atualização do gráfico de análise se existir
        if (typeof AdvancedAnalytics !== 'undefined' && this.analysisResults.length > 0) {
            // Pequeno delay para garantir que DOM atualizou
            setTimeout(() => {
                // Recriar dados agregados para analytics
                const especiesWithData = {};

                Object.keys(this.especies).forEach(apelido => {
                    const esp = this.especies[apelido];
                    let totalCobertura = 0;
                    let totalAltura = 0;
                    let count = 0;
                    let totalIndividuos = 0;

                    // Percorrer todas as subparcelas para coletar dados recalculados
                    this.analysisResults.forEach(result => {
                        if (result.especies) {
                            result.especies.forEach(e => {
                                if (e.apelido === apelido) {
                                    totalCobertura += parseFloat(e.cobertura) || 0;
                                    totalAltura += parseFloat(e.altura) || 0;
                                    count++; // Número de subparcelas (frequência)
                                    // Somar indivíduos (se não definido, assume 1 pela presença)
                                    totalIndividuos += parseInt(e.numero_individuos) || 1;
                                }
                            });
                        }
                    });

                    especiesWithData[apelido] = {
                        ...esp,
                        cobertura: totalCobertura,
                        altura_media: count > 0 ? totalAltura / count : 0,
                        ocorrencias: totalIndividuos, // Usado para Densidade e Abundância
                        num_subplots: count // Usado para Frequência (se necessário adaptar)
                    };
                });

                console.log('📊 Re-inicializando AdvancedAnalytics com dados atualizados...');
                AdvancedAnalytics.initialize({
                    especies: especiesWithData,
                    analysisResults: this.analysisResults,
                    subparcelas: this.uploadedFiles.map(f => f.name)
                });
            }, 100);
        }
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
console.log('  Claude:', appState.apiKeys.claude ? `Presente (${appState.apiKeys.claude.substring(0, 10)}...)` : 'AUSENTE');
console.log('  Gemini:', appState.apiKeys.gemini ? `Presente (${appState.apiKeys.gemini.substring(0, 10)}...)` : 'AUSENTE');
console.log('  GPT-4:', appState.apiKeys.gpt4 ? `Presente (${appState.apiKeys.gpt4.substring(0, 10)}...)` : 'AUSENTE');

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
    analyticsSection: document.getElementById('analytics-section'),
    exportFooter: document.getElementById('export-footer'),
    exportBtn: document.getElementById('export-btn'), // Mantém para compatibilidade
    exportExcelBtn: document.getElementById('export-excel-btn'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    exportZipBtn: document.getElementById('export-zip-btn'),
    exportStatus: document.getElementById('export-status'),
    resultsSummary: document.getElementById('results-summary'),
    subparcelasGrid: document.getElementById('subparcelas-grid')
};

// Event Listeners
// Novos event listeners para exportação
elements.imageUpload.addEventListener('change', handleImageSelection);
elements.uploadBtn.addEventListener('click', uploadImages);
elements.aiModel.addEventListener('change', handleAIModelChange);
elements.analyzeBtn.addEventListener('click', analyzeImages);
elements.manualModeBtn.addEventListener('click', startManualMode);
elements.addImagesBtn.addEventListener('click', () => elements.addImagesInput.click());
elements.addImagesInput.addEventListener('change', handleAddImages);

// Sincronizar nome da parcela quando o usuário digita
elements.parcelaName.addEventListener('input', (e) => {
    appState.parcelaNome = e.target.value.trim();
    // console.log('🔄 Nome da parcela atualizado:', appState.parcelaNome);
});

if (elements.exportExcelBtn) {
    elements.exportExcelBtn.addEventListener('click', exportToExcel);
}
if (elements.exportPdfBtn) {
    elements.exportPdfBtn.addEventListener('click', exportToPDF);
}
if (elements.exportZipBtn) {
    elements.exportZipBtn.addEventListener('click', exportToZip);
}

// Fallback para compatibilidade
if (elements.exportBtn && !elements.exportExcelBtn) {
    elements.exportBtn.addEventListener('click', exportToExcel);
}

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
                    subparcela: id, // FIX: Garantir que a propriedade subparcela exista para exibição
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
                if (elements.exportFooter) {
                    elements.exportFooter.style.display = 'block';
                }

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

    // Mostrar/ocultar seletor de versão do GPT
    const gptModelGroup = document.getElementById('gpt-model-group');
    if (appState.selectedAI === 'gpt4') {
        gptModelGroup.style.display = 'block';
    } else {
        gptModelGroup.style.display = 'none';
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
            subparcela: idx + 1,  // CRITICAL FIX: Deve ser "subparcela", não "subparcela_id"
            image_path: img.path,
            image: img.filename,  // Adicionar filename também
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
            geminiVersion = geminiVersionSelect ? geminiVersionSelect.value : 'gemini-2.5-flash';
            console.log('Usando versão do Gemini:', geminiVersion);
        }

        // Obter versão específica do Claude, se aplicável
        let claudeVersion = null;
        if (appState.selectedAI === 'claude') {
            const claudeVersionSelect = document.getElementById('claude-version');
            claudeVersion = claudeVersionSelect ? claudeVersionSelect.value : 'claude-sonnet-4-5-20250929';
            console.log('Usando versão do Claude:', claudeVersion);
        }

        // Obter versão específica do GPT, se aplicável
        let gptVersion = null;
        if (appState.selectedAI === 'gpt4') {
            const gptVersionSelect = document.getElementById('gpt-version');
            gptVersion = gptVersionSelect ? gptVersionSelect.value : 'gpt-4o';
            console.log('Usando versão do GPT:', gptVersion);
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
            'X-Claude-Version': claudeVersion || '',
            'X-GPT-Version': gptVersion || ''
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
        let hasReceivedData = false;

        console.log('🔄 Iniciando leitura do stream SSE...');

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                console.log('✅ Stream finalizado');
                if (!hasReceivedData) {
                    console.warn('⚠️ Stream finalizado sem receber dados!');
                    throw new Error('Análise não retornou dados. Verifique o console do servidor.');
                }
                break;
            }

            hasReceivedData = true;
            buffer += decoder.decode(value, { stream: true });
            console.log('📦 Recebido chunk:', buffer.slice(-100)); // Log dos últimos 100 chars

            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // Guardar linha incompleta

            for (const line of lines) {
                if (!line.trim() || !line.startsWith('data: ')) continue;

                try {
                    const data = JSON.parse(line.substring(6));
                    console.log('📨 Evento SSE:', data.type, data);

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
                        console.error('❌ Erro na subparcela', data.subparcela, ':', data.error);
                        elements.progressText.textContent = `⚠️ Erro na subparcela ${data.subparcela}: ${data.error}`;
                    }
                    else if (data.type === 'complete') {
                        console.log('🎉 Análise completa:', data);

                        if (data.success) {
                            appState.analysisResults = data.results;
                            appState.especies = data.especies_unificadas;
                            appState.parcelaNome = data.parcela; // 🔧 FIX: Salvar nome da parcela

                            console.log('✅ Resultados:', appState.analysisResults);
                            console.log('✅ Espécies:', appState.especies);
                            console.log('✅ Parcela:', appState.parcelaNome);

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
                                    console.error('❌ Erro ao exibir resultados:', displayError);
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

    // Mostrar seções de resultados, analytics e footer de exportação
    if (elements.exportSection) {
        elements.exportSection.style.display = 'block';
    }
    if (elements.analyticsSection) {
        elements.analyticsSection.style.display = 'block';
    }
    if (elements.exportFooter) {
        elements.exportFooter.style.display = 'block';
    }

    // Mostrar botão de adicionar imagens (agora que há resultados)
    if (elements.addImagesBtn) {
        elements.addImagesBtn.style.display = 'inline-block';
    }

    // Renderizar análises avançadas
    if (typeof AdvancedAnalytics !== 'undefined') {
        // Agregar dados de cobertura e altura de todas as subparcelas
        const especiesWithData = {};

        Object.keys(appState.especies).forEach(apelido => {
            const esp = appState.especies[apelido];
            let totalCobertura = 0;
            let totalAltura = 0;
            let count = 0;

            // Percorrer todas as subparcelas para coletar dados
            appState.analysisResults.forEach(result => {
                if (result.especies) {
                    result.especies.forEach(e => {
                        if (e.apelido === apelido) {
                            totalCobertura += parseFloat(e.cobertura) || 0;
                            totalAltura += parseFloat(e.altura) || 0;
                            count++;
                        }
                    });
                }
            });

            especiesWithData[apelido] = {
                ...esp,
                cobertura: totalCobertura,
                altura_media: count > 0 ? totalAltura / count : 0,
                ocorrencias: count
            };
        });

        console.log('📊 Dados agregados para analytics:', especiesWithData);

        AdvancedAnalytics.initialize({
            especies: especiesWithData,
            analysisResults: appState.analysisResults,
            subparcelas: appState.uploadedFiles.map(f => f.name)
        });
    }
}

// Recalcular espécies unificadas baseado nas subparcelas atuais
function recalcularEspeciesUnificadas() {
    console.log('🔄 Recalculando espécies unificadas...');

    const novasEspecies = {};

    // Percorrer todas as subparcelas e contar ocorrências
    appState.analysisResults.forEach(result => {
        if (!result.especies) return;

        result.especies.forEach(esp => {
            const apelido = esp.apelido;

            if (!novasEspecies[apelido]) {
                novasEspecies[apelido] = {
                    apelido_original: apelido,
                    apelido_usuario: apelido,
                    genero: esp.genero || '',
                    especie: esp.especie || '',
                    familia: esp.familia || '',
                    observacoes: esp.observacoes || '',
                    ocorrencias: 0,
                    numero_individuos: 0
                };
            } else {
                // Atualizar dados se estiverem vazios
                if (esp.genero && !novasEspecies[apelido].genero) {
                    novasEspecies[apelido].genero = esp.genero;
                }
                if (esp.familia && !novasEspecies[apelido].familia) {
                    novasEspecies[apelido].familia = esp.familia;
                }
                if (esp.observacoes && !novasEspecies[apelido].observacoes) {
                    novasEspecies[apelido].observacoes = esp.observacoes;
                }
            }

            const countInd = parseInt(esp.numero_individuos) || 1;
            novasEspecies[apelido].numero_individuos += countInd;
            novasEspecies[apelido].ocorrencias++;
        });
    });

    // Atualizar appState
    appState.especies = novasEspecies;

    console.log(`✅ Espécies recalculadas: ${Object.keys(novasEspecies).length} espécies únicas`);
    console.log('   Espécies:', Object.keys(novasEspecies));

    return novasEspecies;
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
                <button class="btn btn-small btn-info" onclick="SpeciesDetailsModal.open('${esp.apelido_original}')" title="Ver detalhes e dashboard">📊 Detalhes</button>
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

    // Calcular estatísticas globais para comparação
    let maxRichness = 0;
    appState.analysisResults.forEach(r => {
        if (r.especies && r.especies.length > maxRichness) maxRichness = r.especies.length;
    });

    appState.analysisResults.forEach(result => {
        const card = document.createElement('div');
        card.className = 'subparcela-card';
        card.setAttribute('data-subparcela', result.subparcela);

        // Métricas da Subparcela
        const richness = result.especies ? result.especies.length : 0;
        const totalCoverage = result.especies ? result.especies.reduce((acc, e) => acc + (parseFloat(e.cobertura) || 0), 0) : 0;

        // Barra de riqueza relativa (visual)
        const richnessPct = maxRichness > 0 ? (richness / maxRichness) * 100 : 0;

        // Verificar erros
        const hasError = result.especies.some(esp =>
            esp.apelido.includes('Erro') || esp.apelido.includes('não disponível') || esp.apelido.includes('inválida')
        );

        const especiesHTML = result.especies.map((esp, index) => {
            const isError = esp.apelido.includes('Erro') || esp.apelido.includes('não disponível') || esp.apelido.includes('inválida');
            if (isError) {
                return `
                    <div class="especie-item error-item" data-species-index="${index}">
                        <div class="especie-info">
                            <div class="especie-nome">⚠️ ${esp.apelido}</div>
                            <div class="especie-dados">${esp.erro || 'Erro desconhecido'}</div>
                        </div>
                        <div class="especie-actions">
                            <button class="btn btn-small btn-warning" onclick="retryAnalyze(${result.subparcela})" title="Tentar novamente">🔄</button>
                        </div>
                    </div>
                `;
            }
            return `
                <div class="especie-item" data-species-index="${index}">
                    <div class="especie-info">
                        <div class="especie-nome-row">
                            <span class="especie-nome-text">${getDisplayName(esp.apelido)}</span>
                            <span class="especie-badge-coverage">${parseFloat(esp.cobertura).toFixed(1)}%</span>
                        </div>
                        <div class="especie-dados-row">
                            <span>📏 ${esp.altura > 100 ? (esp.altura / 100).toFixed(2) + 'm' : esp.altura + 'cm'}</span>
                            <span>🌱 ${esp.forma_vida}</span>
                        </div>
                        <div class="especie-taxo-row">
                            ${getDisplayTaxonomy(esp.apelido)}
                        </div>
                    </div>
                    ${esp.link_fotos ? `<a href="${esp.link_fotos}" target="_blank" class="btn-icon-small" title="Fotos">🔗</a>` : ''}
                </div>
            `;
        }).join('');

        const metricsHTML = `
            <div class="subparcela-metrics">
                <div class="metric-item" title="Riqueza de Espécies">
                    <span class="metric-label">Riqueza</span>
                    <span class="metric-value">${richness}</span>
                </div>
                <div class="metric-item" title="Cobertura Vegetal Total">
                    <span class="metric-label">Cobertura</span>
                    <span class="metric-value">${totalCoverage.toFixed(1)}%</span>
                </div>
                <div class="metric-bar-container" title="Riqueza relativa nesta amostra">
                    <div class="metric-bar-fill" style="width: ${richnessPct}%"></div>
                </div>
            </div>
        `;

        card.innerHTML = `
            <div class="subparcela-header">
                <span class="subparcela-title">Subparcela ${result.subparcela || result.subparcela_id}</span>
                <div class="subparcela-header-actions">
                    <button class="btn btn-xs btn-glass" onclick="openImageViewer(${result.subparcela || result.subparcela_id}, '${result.image || result.filename}')">
                        🖼️ Detalhar
                    </button>
                    <button class="btn btn-xs btn-glass-orange" onclick="reanalyzeSubparcela(event, ${result.subparcela || result.subparcela_id})">
                        🔄
                    </button>
                </div>
            </div>
            
            <div class="subparcela-body">
                <div class="subparcela-image-col">
                    <div class="image-wrapper">
                        <img src="${result.image_path || '/static/uploads/' + appState.parcelaNome + '/' + (result.image || result.filename)}" 
                             class="subparcela-image" 
                             alt="Subparcela ${result.subparcela}" 
                             onclick="openImageViewer(${result.subparcela}, '${result.image || result.filename}')">
                        <div class="image-overlay-hint">🔍 Clique para editar</div>
                    </div>
                    ${metricsHTML}
                </div>
                <div class="subparcela-list-col">
                    ${hasError ? `<div class="warning-banner">⚠️ Erro na análise desta subparcela</div>` : ''}
                    <div class="especies-scroll-list">
                        ${especiesHTML}
                    </div>
                </div>
            </div>
        `;

        elements.subparcelasGrid.appendChild(card);
    });
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

    // Mostrar indicador de progresso
    showAlert('info', `🔄 Reanalisando subparcela ${subparcela}...`);

    // Adicionar indicador visual na UI
    const subparcelaCards = document.querySelectorAll('.subparcela-card');
    let targetCard = null;
    subparcelaCards.forEach(card => {
        const headerText = card.querySelector('.subparcela-header span')?.textContent;
        if (headerText && headerText.includes(`Subparcela ${subparcela}`)) {
            targetCard = card;
            card.style.opacity = '0.6';
            card.style.pointerEvents = 'none';
            const overlay = document.createElement('div');
            overlay.className = 'reanalysis-overlay';
            overlay.innerHTML = `
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 100;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🔄</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Reanalisando...</div>
                    <div style="font-size: 0.9rem; color: #cbd5e0;">Aguarde, processando imagem</div>
                </div>
            `;
            card.style.position = 'relative';
            card.appendChild(overlay);
        }
    });

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
            if (gptVersion) {
                headers['X-GPT-Version'] = gptVersion;
            }
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

        // Recalcular espécies unificadas com base em TODAS as subparcelas
        recalcularEspeciesUnificadas();

        // Atualizar interface completa
        displaySubparcelas();
        displaySpeciesTable();

        // Atualizar analytics se disponível
        if (typeof AdvancedAnalytics !== 'undefined' && typeof AdvancedAnalytics.refreshAnalytics === 'function') {
            AdvancedAnalytics.refreshAnalytics();
        }

        showAlert('success', `Subparcela ${subparcela} reanalisada com sucesso! ${result.especies.length} espécies encontradas.`);

        return true;

    } catch (error) {
        console.error('Erro na reanálise:', error);
        showAlert('error', `Erro ao reanalisar: ${error.message}`);

        // Remover overlay de erro
        if (targetCard) {
            const overlay = targetCard.querySelector('.reanalysis-overlay');
            if (overlay) overlay.remove();
            targetCard.style.opacity = '1';
            targetCard.style.pointerEvents = 'auto';
        }

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
    // Abrir modal de detalhes na aba "Editar"
    if (typeof SpeciesDetailsModal !== 'undefined' && typeof SpeciesDetailsModal.open === 'function') {
        SpeciesDetailsModal.open(apelidoOriginal, 'edit');
    } else {
        // Fallback para o modal antigo se o novo não estiver disponível
        const especie = appState.especies[apelidoOriginal];
        if (!especie) {
            showAlert('error', 'Espécie não encontrada');
            return;
        }

        document.getElementById('edit-apelido-original').value = apelidoOriginal;
        document.getElementById('edit-apelido-original-display').value = apelidoOriginal;
        document.getElementById('edit-apelido-usuario').value = especie.apelido_usuario;
        document.getElementById('edit-genero').value = especie.genero || '';
        document.getElementById('edit-especie').value = especie.especie || '';
        document.getElementById('edit-familia').value = especie.familia || '';

        elements.editModal.classList.add('active');
    }
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
            recalcularEspeciesUnificadas();
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

// Sincronizar com backend antes de exportar
async function syncWithBackend() {
    try {
        console.log('🔄 Buscando dados atualizados do backend...');

        // Buscar dados atualizados da parcela
        const parcelaResponse = await fetch(`/api/parcela/${appState.parcelaNome}`);
        if (!parcelaResponse.ok) {
            throw new Error('Erro ao buscar dados da parcela');
        }
        const parcelaData = await parcelaResponse.json();

        // Atualizar analysisResults com dados mais recentes
        appState.analysisResults = [];
        for (const [subNum, subData] of Object.entries(parcelaData.subparcelas)) {
            appState.analysisResults.push({
                subparcela: parseInt(subNum),
                image: subData.image,
                image_path: subData.image_path,
                filename: subData.filename,
                especies: subData.especies || [],
                area_shape: subData.area_shape
            });
        }

        // Buscar espécies unificadas atualizadas
        const especiesResponse = await fetch(`/api/parcela/${appState.parcelaNome}/especies`);
        if (especiesResponse.ok) {
            const especiesData = await especiesResponse.json();
            appState.especies = especiesData.especies || especiesData;
        }

        console.log('✅ Dados sincronizados com sucesso');
        console.log(`   - ${appState.analysisResults.length} subparcelas`);
        console.log(`   - ${Object.keys(appState.especies).length} espécies únicas`);

        return true;
    } catch (error) {
        console.error('❌ Erro ao sincronizar:', error);
        return false;
    }
}

// Atualizar dados
async function refreshData() {
    try {
        await syncWithBackend();
        // Reexibir
        displayResults();
    } catch (error) {
        console.error('Erro ao atualizar:', error);
    }
}

// Exportar para Excel
async function exportToExcel() {
    try {
        console.log('📊 Iniciando exportação para Excel...');

        // Desabilitar botão durante exportação
        if (elements.exportBtn) {
            elements.exportBtn.disabled = true;
            elements.exportBtn.textContent = 'Exportando...';
        }
        if (elements.exportExcelBtn) {
            elements.exportExcelBtn.disabled = true;
            elements.exportExcelBtn.textContent = 'Exportando...';
        }

        // Buscar dados atualizados do backend antes de exportar
        console.log('🔄 Sincronizando dados com o backend...');
        await syncWithBackend();

        // Preparar dados completos para exportação
        const exportData = {
            parcela: appState.parcelaNome,
            data_analise: new Date().toLocaleDateString('pt-BR'),

            // Dados das subparcelas
            subparcelas: appState.analysisResults.map(result => ({
                numero: result.subparcela,
                imagem: result.image || result.filename,
                especies: result.especies.map(esp => ({
                    apelido: esp.apelido,
                    genero: esp.genero || '',
                    familia: esp.familia || '',
                    cobertura: esp.cobertura || 0,
                    altura: esp.altura || 0,
                    forma_vida: esp.forma_vida || 'Erva',
                    observacoes: esp.observacoes || ''
                }))
            })),

            // Resumo geral das espécies
            especies_unificadas: Object.values(appState.especies).map(esp => ({
                apelido_original: esp.apelido_original,
                apelido_usuario: esp.apelido_usuario,
                genero: esp.genero || '',
                especie: esp.especie || '',
                familia: esp.familia || '',
                ocorrencias: esp.ocorrencias || 0,
                observacoes: esp.observacoes || ''
            })),

            // Estatísticas agregadas
            estatisticas: {
                total_subparcelas: appState.analysisResults.length,
                total_especies_unicas: Object.keys(appState.especies).length,
                cobertura_total: appState.analysisResults.reduce((sum, r) =>
                    sum + r.especies.reduce((s, e) => s + (parseFloat(e.cobertura) || 0), 0), 0
                ),
                altura_media: appState.analysisResults.length > 0 ?
                    appState.analysisResults.reduce((sum, r) =>
                        sum + r.especies.reduce((s, e) => s + (parseFloat(e.altura) || 0), 0) / r.especies.length, 0
                    ) / appState.analysisResults.length : 0
            }
        };

        // Adicionar análises avançadas se disponíveis
        if (typeof AdvancedAnalytics !== 'undefined' && typeof AdvancedAnalytics.getExportData === 'function') {
            console.log('📊 Coletando dados de análises avançadas...');
            try {
                const analyticsData = AdvancedAnalytics.getExportData();
                if (analyticsData && Object.keys(analyticsData).length > 0) {
                    exportData.analises_avancadas = analyticsData;
                    console.log('✅ Dados de análises avançadas incluídos');
                }
            } catch (e) {
                console.warn('⚠️ Não foi possível coletar análises avançadas:', e.message);
            }
        }

        console.log('📦 Dados preparados:', exportData);

        const response = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exportData)
        });

        console.log('📥 Resposta do servidor:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Dados recebidos:', data);

        if (data.success && data.download_url) {
            showAlert('success', '✅ Exportado com sucesso!');

            // Download automático
            console.log('⬇️ Iniciando download:', data.download_url);
            window.location.href = data.download_url;
        } else {
            throw new Error(data.error || 'Erro ao exportar - resposta inválida');
        }
    } catch (error) {
        console.error('❌ Erro na exportação:', error);
        showAlert('error', 'Erro ao exportar: ' + error.message);
    } finally {
        // Reabilitar botão
        if (elements.exportBtn) {
            elements.exportBtn.disabled = false;
            elements.exportBtn.textContent = 'Exportar para Excel';
        }
        if (elements.exportExcelBtn) {
            elements.exportExcelBtn.disabled = false;
            elements.exportExcelBtn.textContent = 'Exportar Excel';
        }
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
let viewerDragStart = { x: 0, y: 0 };

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
                    <button class="viewer-define-area-btn" onclick="startDrawSubparcelaArea()" title="Definir área da subparcela">📐 Definir Área 100%</button>
                    <button class="viewer-define-area-btn" onclick="importAIAreas()" title="Importar áreas detectadas pela IA" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);">🤖 Importar Áreas IA</button>
                    
                    <!-- Novo Botão Exportar com Dropdown -->
                    <div class="dropdown-container" style="position: relative; display: inline-block;">
                        <button class="viewer-define-area-btn" onclick="toggleExportDropdown()" title="Exportar imagem e análise" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                            📤 Exportar ▾
                        </button>
                        <div id="export-dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; background: #1a202c; border: 1px solid #4a5568; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 100; min-width: 180px; margin-top: 5px;">
                            <button onclick="exportViewerImage()" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; background: none; border: none; color: white; text-align: left; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #2d3748;">
                                🖼️ Imagem (PNG)
                            </button>
                            <button onclick="exportViewerPDF()" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; background: none; border: none; color: white; text-align: left; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #2d3748;">
                                📄 Relatório (PDF)
                            </button>
                            <button onclick="exportViewerEditable()" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; background: none; border: none; color: white; text-align: left; cursor: pointer; transition: background 0.2s;">
                                📦 Editável (JSON)
                            </button>
                        </div>
                    </div>

                    <!-- Botão Importar (Novo) -->
                    <button class="viewer-define-area-btn" onclick="importViewerEditable()" title="Importar arquivo de projeto JSON" style="background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); margin-left: 5px;">
                        📂 Importar
                    </button>
                    <!-- Input file oculto para importação -->
                    <input type="file" id="import-json-input" accept=".json" style="display: none;" onchange="handleImportFile(this)">

                    <button class="viewer-define-area-btn" onclick="togglePolygonSettings()" title="Configurações de visualização">⚙️ Configs</button>
                    <button class="viewer-close-btn" onclick="closeImageViewer()">✕ Fechar</button>
                </div>
            </div>

            <!-- Painel de configurações (colapsável) -->
            <div id="polygon-settings-panel" style="display: none; background: #1a202c; padding: 12px 16px; border-bottom: 2px solid #4a5568;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: center;">
                    <!-- Toggle Preenchimento Espécies -->
                    <label style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                        <input type="checkbox" id="polygon-fill-toggle" onchange="updatePolygonDisplay()"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span>🌿 Espécies</span>
                    </label>

                    <!-- Toggle Preenchimento Área Total -->
                    <label style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                        <input type="checkbox" id="subparcela-fill-toggle" onchange="updateSubparcelaDisplay()"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span>📐 Área 100%</span>
                    </label>

                    <!-- Toggle Grid -->
                    <label style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                        <input type="checkbox" id="grid-toggle" onchange="toggleGrid()"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span>⊞ Grid</span>
                    </label>

                    <!-- Opacidade -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="color: white; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
                            Opacidade: <span id="opacity-value">30</span>%
                        </label>
                        <input type="range" id="polygon-opacity" min="0" max="100" value="30"
                               oninput="updatePolygonOpacity(this.value)"
                               style="width: 80px; cursor: pointer;">
                    </div>

                    <!-- Espessura do contorno -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="color: white; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
                            Borda: <span id="stroke-value">3</span>px
                        </label>
                        <input type="range" id="polygon-stroke" min="1" max="10" value="3"
                               oninput="updatePolygonStroke(this.value)"
                               style="width: 80px; cursor: pointer;">
                    </div>

                    <!-- Tamanho das células do grid -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="color: white; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
                            Grid: <span id="grid-size-value">10</span>%
                        </label>
                        <input type="range" id="grid-cell-size" min="5" max="20" value="10"
                               oninput="updateGridCellSize(this.value)"
                               style="width: 80px; cursor: pointer;">
                    </div>

                    <!-- Espessura das linhas do grid -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="color: white; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
                            Linha: <span id="grid-line-value">1</span>px
                        </label>
                        <input type="range" id="grid-line-width" min="1" max="5" value="1"
                               oninput="updateGridLineWidth(this.value)"
                               style="width: 80px; cursor: pointer;">
                    </div>
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
                        <button class="viewer-add-species-btn" onclick="toggleAddSpeciesForm()">+ Adicionar Espécie</button>
                        <button class="btn btn-sm btn-info" onclick="recalculateCoverageWrapper()" title="Recalcular % com base nos desenhos" style="margin-left: 10px; background-color: #17a2b8; border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            🔄 Recalcular
                        </button>
                    </div>

                    <!-- Formulário inline para adicionar espécie -->
                    <div id="viewer-add-species-form" style="display: none; background: #1a202c; padding: 20px; border-bottom: 2px solid #4a5568;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: white; margin: 0; font-size: 1.1rem;">Nova Espécie</h3>
                            <button onclick="toggleAddSpeciesForm()" style="background: none; border: none; color: #cbd5e0; font-size: 1.5rem; cursor: pointer;">×</button>
                        </div>

                        <!-- Tabs: IA ou Manual -->
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <button id="add-tab-ai" class="add-species-tab active" onclick="switchAddSpeciesTab('ai')">
                                🤖 Análise por IA
                            </button>
                            <button id="add-tab-manual" class="add-species-tab" onclick="switchAddSpeciesTab('manual')">
                                ✏️ Manual
                            </button>
                        </div>

                        <!-- Conteúdo aba IA -->
                        <div id="add-species-ai-content" class="add-species-content">
                            <p style="color: #cbd5e0; font-size: 0.9rem; margin-bottom: 15px;">
                                A IA analisará a imagem e sugerirá espécies adicionais que não foram detectadas.
                            </p>
                            <button class="btn btn-primary" onclick="analyzeMoreSpecies()" style="width: 100%;">
                                🔍 Analisar com IA
                            </button>
                        </div>

                        <!-- Conteúdo aba Manual -->
                        <div id="add-species-manual-content" class="add-species-content" style="display: none;">
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div>
                                    <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Apelido/Nome*</label>
                                    <input type="text" id="manual-apelido" placeholder="Ex: Gramínea Verde" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <div>
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Cobertura (%)</label>
                                        <input type="number" id="manual-cobertura" value="10" min="0" max="100" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                    <div>
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Altura (cm)</label>
                                        <input type="number" id="manual-altura" value="10" min="0" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                    <div style="grid-column: span 2;">
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Nº Indivíduos</label>
                                        <input type="number" id="manual-n-indiv" value="1" min="1" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                    
                                    <!-- Biometria (Opcional) -->
                                    <div>
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">DAP (cm)</label>
                                        <input type="number" id="manual-dap" placeholder="-" step="0.1" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                    <div>
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Diâm. Copa (m)</label>
                                        <input type="number" id="manual-diam-copa" placeholder="-" step="0.1" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                </div>

                                <div>
                                    <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Forma de Vida</label>
                                    <select id="manual-forma-vida" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                        <option value="Erva">Erva</option>
                                        <option value="Arbusto">Arbusto</option>
                                        <option value="Subarbusto">Subarbusto</option>
                                        <option value="Plântula">Plântula</option>
                                        <option value="Liana">Liana</option>
                                        <option value="Trepadeira">Trepadeira</option>
                                    </select>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <div>
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Gênero (opcional)</label>
                                        <input type="text" id="manual-genero" placeholder="Ex: Paspalum" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                    <div>
                                        <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Família (opcional)</label>
                                        <input type="text" id="manual-familia" placeholder="Ex: Poaceae" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white;">
                                    </div>
                                </div>

                                <div>
                                    <label style="color: #cbd5e0; font-size: 0.9rem; display: block; margin-bottom: 5px;">Observações (opcional)</label>
                                    <textarea id="manual-observacoes" placeholder="Características visuais, pilosidade, cor..." rows="3" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #4a5568; background: #2d3748; color: white; resize: vertical;"></textarea>
                                </div>

                                <button class="btn btn-success" onclick="saveManualSpecies()" style="width: 100%; margin-top: 5px;">
                                    ✓ Adicionar Espécie
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="viewer-species-list" id="viewer-species-list">
                        <!-- Espécies serão carregadas aqui -->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(viewerModal);

    // Adicionar event listeners para os toggles de preenchimento
    const polygonFillToggle = document.getElementById('polygon-fill-toggle');
    const subparcelaFillToggle = document.getElementById('subparcela-fill-toggle');

    if (polygonFillToggle) {
        console.log('✅ Checkbox polygon-fill-toggle encontrado, adicionando listener');
        polygonFillToggle.addEventListener('change', function () {
            console.log('🌿 Toggle Espécies mudou para:', this.checked);
            updatePolygonDisplay();
        });
    } else {
        console.error('❌ Checkbox polygon-fill-toggle NÃO encontrado no DOM');
    }

    if (subparcelaFillToggle) {
        console.log('✅ Checkbox subparcela-fill-toggle encontrado, adicionando listener');
        subparcelaFillToggle.addEventListener('change', function () {
            console.log('📐 Toggle Área 100% mudou para:', this.checked);
            updateSubparcelaDisplay();
        });
    } else {
        console.error('❌ Checkbox subparcela-fill-toggle NÃO encontrado no DOM');
    }

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
    img.src = result.image_path || `/static/uploads/${appState.parcelaNome}/${result.image || result.filename}`;

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
                        <div class="viewer-species-detail-value">
                            ${(esp.altura > 100)
            ? (esp.altura / 100).toFixed(2) + ' m'
            : esp.altura + ' cm'}
                        </div>
                    </div>
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">Forma</div>
                        <div class="viewer-species-detail-value">${esp.forma_vida}</div>
                    </div>
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">Indivíduos</div>
                        <div class="viewer-species-detail-value">${esp.numero_individuos || 1}</div>
                    </div>
                    ${esp.dap_estimado_cm ? `
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">DAP Est.</div>
                        <div class="viewer-species-detail-value">${esp.dap_estimado_cm} cm</div>
                    </div>` : ''}
                    ${esp.area_copa_estimada_m2 ? `
                    <div class="viewer-species-detail">
                        <div class="viewer-species-detail-label">Área Copa</div>
                        <div class="viewer-species-detail-value">${esp.area_copa_estimada_m2} m²</div>
                    </div>` : ''}
                </div>
                <div class="viewer-species-actions">
                    <button class="viewer-draw-btn" onclick="startDrawCoverageForSpecies(${index})" title="Desenhar áreas de cobertura">📐 Desenhar Área</button>
                    <button class="viewer-clear-areas-btn" onclick="clearSpeciesAreas(${index})" title="Limpar todas as áreas desenhadas desta espécie" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">🗑️ Limpar Áreas</button>
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
                    <label style="display: block; color: #cbd5e0; font-size: 0.85rem; margin-bottom: 5px;">Nº Indivíduos</label>
                    <input type="number" id="viewer-edit-n-indiv-${index}" value="${esp.numero_individuos || 1}" min="1"
                           style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
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
                    </select>
                </div>
                
                <h4 style="color: #cbd5e0; font-size: 0.9rem; margin: 15px 0 10px 0; border-bottom: 1px solid #4a5568; padding-bottom: 5px;">Biometria (Estimada/Real)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.75rem; margin-bottom: 5px;">DAP (cm)</label>
                        <input type="number" id="viewer-edit-dap-${index}" value="${esp.dap_estimado_cm || ''}" step="0.1" min="0" placeholder="-"
                               style="width: 100%; padding: 8px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 0.9rem;">
                    </div>
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.75rem; margin-bottom: 5px;">Diâm. Copa (m)</label>
                        <input type="number" id="viewer-edit-diam-copa-${index}" value="${esp.diametro_copa_m || ''}" step="0.1" min="0" placeholder="-"
                               style="width: 100%; padding: 8px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 0.9rem;">
                    </div>
                    <div>
                        <label style="display: block; color: #cbd5e0; font-size: 0.75rem; margin-bottom: 5px;">Área Copa (m²)</label>
                        <input type="number" id="viewer-edit-area-copa-${index}" value="${esp.area_copa_estimada_m2 || ''}" step="0.1" min="0" placeholder="-"
                               style="width: 100%; padding: 8px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 0.9rem;">
                    </div>
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
    const numero_individuos = parseInt(document.getElementById(`viewer-edit-n-indiv-${especieIndex}`).value) || 1;
    const forma_vida = document.getElementById(`viewer-edit-forma-${especieIndex}`).value;
    const dap_estimado_cm = parseFloat(document.getElementById(`viewer-edit-dap-${especieIndex}`).value) || null;
    const diametro_copa_m = parseFloat(document.getElementById(`viewer-edit-diam-copa-${especieIndex}`).value) || null;
    const area_copa_estimada_m2 = parseFloat(document.getElementById(`viewer-edit-area-copa-${especieIndex}`).value) || null;
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
        numero_individuos,
        forma_vida,
        dap_estimado_cm,
        diametro_copa_m,
        area_copa_estimada_m2,
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

            // Recalcular espécies unificadas localmente
            recalcularEspeciesUnificadas();

            // Recarregar visualização do viewer com dados atualizados
            loadViewerSpecies();

            // Atualizar tabela de gerenciamento
            displaySubparcelas();
            displaySpeciesTable();

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

    if (newIndex >= 0 && newIndex < total) {
        currentViewerIndex = newIndex;
        updateViewerContent();
    }
}

// ===========================================
// FUNCIONALIDADES DE EXPORTAÇÃO (VIEWER)
// ===========================================

function toggleExportDropdown() {
    const dropdown = document.getElementById('export-dropdown-menu');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';

        // Fechar ao clicar fora
        if (dropdown.style.display === 'block') {
            const closeDropdown = (e) => {
                if (!e.target.closest('.dropdown-container')) {
                    dropdown.style.display = 'none';
                    document.removeEventListener('click', closeDropdown);
                }
            };
            // Timeout para evitar clique imediato
            setTimeout(() => document.addEventListener('click', closeDropdown), 0);
        }
    }
}

async function exportViewerImage() {
    try {
        showAlert('info', 'Gerando imagem... Aguarde.');

        const canvas = await generateViewerCanvas();
        if (!canvas) throw new Error('Falha ao gerar canvas');

        // Criar link de download
        const link = document.createElement('a');
        const filename = `${appState.parcelaNome}_subparcela_${appState.analysisResults[currentViewerIndex].subparcela}_analise.png`;

        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAlert('success', 'Imagem exportada com sucesso!');

    } catch (error) {
        console.error('Erro ao exportar imagem:', error);
        showAlert('error', 'Erro ao exportar imagem: ' + error.message);
    }
}

async function exportViewerPDF() {
    try {
        if (typeof jspdf === 'undefined') {
            throw new Error('Biblioteca jsPDF não carregada');
        }

        showAlert('info', 'Gerando PDF otimizado... Aguarde.');

        // 1. Gerar Canvas Original
        const originalCanvas = await generateViewerCanvas();
        if (!originalCanvas) throw new Error('Falha ao gerar canvas');

        // 2. Otimizar Imagem (Resize + Compressão)
        // Redimensionar para largura máx de 1200px (bom balanço entre qualidade e tamanho)
        const maxWidth = 1200;
        let finalCanvas = originalCanvas;

        if (originalCanvas.width > maxWidth) {
            const scale = maxWidth / originalCanvas.width;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = maxWidth;
            tempCanvas.height = originalCanvas.height * scale;

            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(originalCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
            finalCanvas = tempCanvas;
        }

        // Converter para JPEG com qualidade 0.7 (reduz drasticamente o tamanho)
        const imgData = finalCanvas.toDataURL('image/jpeg', 0.7);

        // 3. Criar PDF
        const { jsPDF } = window.jspdf;
        // A4 em portrait por padrão
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const workableWidth = pageWidth - (margin * 2);

        // 4. Adicionar Cabeçalho
        pdf.setFontSize(16);
        pdf.setTextColor(33, 37, 41);
        pdf.text("Relatório de Análise - HerbalScan", margin, 20);

        pdf.setFontSize(10);
        pdf.setTextColor(100);
        const result = appState.analysisResults[currentViewerIndex];
        const dateStr = new Date().toLocaleDateString('pt-BR');
        pdf.text(`Parcela: ${appState.parcelaNome} | Subparcela: ${result.subparcela} | Data: ${dateStr}`, margin, 28);

        // 5. Adicionar Imagem
        // Calcular altura proporcional para caber na largura disponível
        const imgRatio = finalCanvas.height / finalCanvas.width;
        const imgHeight = workableWidth * imgRatio;

        // Se a imagem for muito alta, limitar
        const maxImgHeight = 120;
        let finalImgHeight = imgHeight;
        let finalImgWidth = workableWidth;

        if (imgHeight > maxImgHeight) {
            const scale = maxImgHeight / imgHeight;
            finalImgHeight = maxImgHeight;
            finalImgWidth = workableWidth * scale;
        }

        // Centralizar imagem
        const xOffset = margin + (workableWidth - finalImgWidth) / 2;
        pdf.addImage(imgData, 'JPEG', xOffset, 35, finalImgWidth, finalImgHeight);

        // 6. Adicionar Tabela de Espécies
        let currentY = 35 + finalImgHeight + 15;

        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text("Espécies Identificadas", margin, currentY);
        currentY += 8;

        // Cabeçalho da Tabela
        const cols = [
            { header: 'Apelido', width: 45 },
            { header: 'Nome Científico', width: 60 },
            { header: 'Família', width: 30 },
            { header: 'Cob.', width: 15 },
            { header: 'Alt.', width: 15 },
            { header: 'Forma', width: 25 }
        ];

        const rowHeight = 8;

        // Desenhar fundo do cabeçalho
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, currentY - 6, workableWidth, rowHeight, 'F');

        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');

        let currentX = margin;
        cols.forEach(col => {
            pdf.text(col.header, currentX + 2, currentY);
            currentX += col.width;
        });

        currentY += rowHeight;

        // Dados das linhas
        pdf.setFont(undefined, 'normal');

        // Pegar dados unificados ou diretos
        const speciesList = result.especies || [];

        speciesList.forEach((esp, index) => {
            // Verificar quebra de página
            if (currentY > pageHeight - 20) {
                pdf.addPage();
                currentY = 20;
                // Repetir cabeçalho se desejar, mas vamos simplificar
            }

            // Fundo alternado
            if (index % 2 === 1) {
                pdf.setFillColor(248, 249, 250);
                pdf.rect(margin, currentY - 6, workableWidth, rowHeight, 'F');
            }

            currentX = margin;

            // Apelido
            let apelido = esp.apelido || '-';
            if (apelido.length > 20) apelido = apelido.substring(0, 18) + '...';
            pdf.text(apelido, currentX + 2, currentY);
            currentX += cols[0].width;

            // Nome Científico
            let cientifico = '-';
            if (esp.genero) cientifico = esp.genero;
            if (esp.especie) cientifico += ' ' + esp.especie;
            pdf.setFont(undefined, 'italic');
            pdf.text(cientifico, currentX + 2, currentY);
            pdf.setFont(undefined, 'normal');
            currentX += cols[1].width;

            // Família
            pdf.text(esp.familia || '-', currentX + 2, currentY);
            currentX += cols[2].width;

            // Cobertura
            pdf.text(String(esp.cobertura || 0) + '%', currentX + 2, currentY);
            currentX += cols[3].width;

            // Altura
            pdf.text(String(esp.altura || 0), currentX + 2, currentY);
            currentX += cols[4].width;

            // Forma
            pdf.text(esp.forma_vida || '-', currentX + 2, currentY);

            currentY += rowHeight;
        });

        // Rodapé Simples
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text(`Página ${i} de ${pageCount} - Gerado por HerbalScan`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        // Salvar
        const filename = `${appState.parcelaNome}_sub_${result.subparcela}_relatorio.pdf`;
        pdf.save(filename);

        showAlert('success', 'PDF otimizado exportado com sucesso!');

    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        showAlert('error', 'Erro ao exportar PDF: ' + error.message);
    }
}

async function exportViewerEditable() {
    try {
        const result = appState.analysisResults[currentViewerIndex];

        // Estrutura de arquivo editável (para futuro import, se necessário)
        const editableData = {
            version: "1.0",
            type: "herbalscan_subparcela",
            exported_at: new Date().toISOString(),
            parcela: appState.parcelaNome,
            subparcela_id: result.subparcela,
            image_filename: result.image || result.filename,
            data: {
                especies: result.especies,
                area_shape: SVGCoverageDrawer.subparcelaPolygon, // Captura do estado atual do Drawer seria ideal, mas pegamos do objeto se salvo
                species_shapes: SVGCoverageDrawer.speciesPolygons // Idem
            },
            // Se possível, incluiríamos a imagem em base64 aqui para ser autocontido, 
            // mas pode ficar muito pesado. Por hora, mantemos referência.
        };

        // Tentar capturar o estado mais recente do Drawer se estiver ativo nesta subparcela
        if (SVGCoverageDrawer.currentSubparcela &&
            SVGCoverageDrawer.image &&
            SVGCoverageDrawer.image.src === document.getElementById('viewer-image').src) { // Changed condition to match current image
            editableData.data.area_shape = SVGCoverageDrawer.subparcelaPolygon;
            editableData.data.species_shapes = SVGCoverageDrawer.speciesPolygons;
        }

        const blob = new Blob([JSON.stringify(editableData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `${appState.parcelaNome}_subparcela_${result.subparcela}_projeto.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showAlert('success', 'Arquivo editável exportado com sucesso!');

    } catch (error) {
        console.error('Erro ao exportar arquivo editável:', error);
        showAlert('error', 'Erro ao exportar: ' + error.message);
    }
}

function importViewerEditable() {
    // Acionar o input file oculto
    const input = document.getElementById('import-json-input');
    if (input) {
        input.value = ''; // Reset
        input.click();
    } else {
        showAlert('error', 'Elemento de importação não encontrado');
    }
}

async function handleImportFile(input) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const content = e.target.result;
            const data = JSON.parse(content);

            // Validação básica
            if (!data.version || data.type !== 'herbalscan_subparcela' || !data.data) {
                throw new Error('Formato de arquivo inválido. Use um arquivo exportado pelo HerbalScan (.json).');
            }

            // Confirmar substituição
            if (!confirm(`Deseja importar os dados para a subparcela ${data.subparcela_id}? Isso substituirá as espécies e áreas atuais.`)) {
                return;
            }

            // Validar se estamos na subparcela correta ou se devemos mudar
            // Vamos apenas aplicar se o ID bater com a subparcela atual da visualização, ou avisar
            const currentSub = appState.analysisResults[currentViewerIndex];

            if (String(currentSub.subparcela) !== String(data.subparcela_id)) {
                if (!confirm(`Atenção: O arquivo é da subparcela ${data.subparcela_id}, mas você está visualizando a subparcela ${currentSub.subparcela}. Deseja continuar mesmo assim?`)) {
                    return;
                }
            }

            showAlert('info', 'Importando dados...');

            // 1. Atualizar AppState
            currentSub.especies = data.data.especies;
            currentSub.area_shape = data.data.area_shape;
            // Se houver shapes de especies nos dados, mapear de volta para o objeto especies se necessario, 
            // mas o exportViewerEditable já inclui os shapes DENTRO de data.species_shapes (separado) OU dentro das especies?
            // No exportViewerEditable: species_shapes = SVGCoverageDrawer.speciesPolygons map.

            // O ideal é restaurar o shapes para o SVGCoverageDrawer

            // 2. Atualizar SVGCoverageDrawer
            if (SVGCoverageDrawer) {
                // Atualizar dados do drawer
                SVGCoverageDrawer.subparcelaPolygon = data.data.area_shape;
                SVGCoverageDrawer.speciesPolygons = data.data.species_shapes || {};

                // Garantir que as especies no appState tenham seus shapes atualizados também (para persistência)
                currentSub.especies.forEach((esp, idx) => {
                    if (data.data.species_shapes && data.data.species_shapes[idx]) {
                        esp.area_shapes = data.data.species_shapes[idx];
                    }
                });

                // Renderizar
                SVGCoverageDrawer.render();
                console.log('✅ Drawer atualizado com dados importados');
            }

            // 3. Atualizar UI
            loadViewerSpecies(); // Atualizar lista lateral
            displaySpeciesTable(); // Atualizar tabela principal
            displaySubparcelas(); // Atualizar grid principal

            // Recalcular unificadas
            recalcularEspeciesUnificadas();

            showAlert('success', 'Dados importados com sucesso!');

        } catch (error) {
            console.error('Erro na importação:', error);
            showAlert('error', 'Erro ao importar arquivo: ' + error.message);
        }
    };

    reader.onerror = () => {
        showAlert('error', 'Erro ao ler o arquivo');
    };

    reader.readAsText(file);
}

// Helpers Canvas
function generateViewerCanvas() {
    return new Promise((resolve, reject) => {
        const imgElement = document.getElementById('viewer-image');
        if (!imgElement) return reject(new Error('Imagem não encontrada'));

        // Criar imagem nova para garantir carregamento limpo (sem transforms CSS) e tamanho original
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Importante para evitar taint canvas
        img.src = imgElement.src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            // 1. Desenhar Imagem
            ctx.drawImage(img, 0, 0);

            // 2. Desenhar Polígonos (se o Drawer tiver dados)
            // Precisamos acessar os dados do SVGCoverageDrawer
            // O Drawer usa coordenadas SVG relativas ao tamanho natural da imagem, então é direto.

            // Verificar se o Drawer tem dados carregados para ESTA imagem
            // Se não tiver, tentar carregar dos dados persistidos no appState
            let subparcelaPoly = null;
            let speciesPolys = {};

            if (SVGCoverageDrawer.currentSubparcela &&
                SVGCoverageDrawer.image &&
                SVGCoverageDrawer.image.src === imgElement.src) {
                // Drawer está ativo nesta imagem
                subparcelaPoly = SVGCoverageDrawer.subparcelaPolygon;
                speciesPolys = SVGCoverageDrawer.speciesPolygons;
            } else {
                // Drawer não está ativo ou está em outra imagem, usar dados salvos
                const result = appState.analysisResults[currentViewerIndex];
                if (result.area_shape) subparcelaPoly = result.area_shape;

                // Mapear espécies
                result.especies.forEach((esp, idx) => {
                    if (esp.area_shapes) speciesPolys[idx] = esp.area_shapes;
                });
            }

            // Desenhar Área Subparcela
            if (subparcelaPoly && subparcelaPoly.points) {
                drawPolygonOnContext(ctx, subparcelaPoly.points, SVGCoverageDrawer.colors.subparcela, 0.2, 2);
            }

            // Desenhar Espécies
            Object.keys(speciesPolys).forEach(idx => {
                const polys = speciesPolys[idx];
                const color = SVGCoverageDrawer.colors.species[idx % SVGCoverageDrawer.colors.species.length];

                polys.forEach(poly => {
                    drawPolygonOnContext(ctx, poly.points, color, 0.3, 2);

                    // Desenhar rótulo (centro)
                    const center = getPolygonCenter(poly.points);
                    const result = appState.analysisResults[currentViewerIndex];
                    const speciesName = result.especies[idx] ? (result.especies[idx].apelido || `Espécie ${parseInt(idx) + 1}`) : '';

                    if (speciesName) {
                        drawLabelOnContext(ctx, center.x, center.y, speciesName, color);
                    }
                });
            });

            resolve(canvas);
        };

        img.onerror = (e) => reject(e);
    });
}

function drawPolygonOnContext(ctx, points, color, fillOpacity, strokeWidth) {
    if (!points || points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    // Configurar estilo
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth * 2; // Um pouco mais grosso na exportação
    ctx.stroke(); // Desenhar borda

    // Fill com opacidade
    ctx.globalAlpha = fillOpacity;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1.0; // Reset
}

function drawLabelOnContext(ctx, x, y, text, bgColor) {
    ctx.font = 'bold 24px Arial'; // Fonte legível
    const padding = 8;
    const textMetrics = ctx.measureText(text);
    const w = textMetrics.width + (padding * 2);
    const h = 34; // Altura aproximada

    // Box fundo
    ctx.fillStyle = bgColor;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 6);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Texto
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

function getPolygonCenter(points) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });
    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
    };
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

    switch (e.key) {
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

// Funções para o formulário inline de adicionar espécie

function toggleAddSpeciesForm() {
    const form = document.getElementById('viewer-add-species-form');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        // Limpar campos do formulário manual
        document.getElementById('manual-apelido').value = '';
        document.getElementById('manual-cobertura').value = '10';
        document.getElementById('manual-altura').value = '10';
        document.getElementById('manual-forma-vida').value = 'Erva';
        document.getElementById('manual-genero').value = '';
        document.getElementById('manual-familia').value = '';
        document.getElementById('manual-observacoes').value = '';
    } else {
        form.style.display = 'none';
    }
}

function switchAddSpeciesTab(tab) {
    // Atualizar tabs
    document.getElementById('add-tab-ai').classList.toggle('active', tab === 'ai');
    document.getElementById('add-tab-manual').classList.toggle('active', tab === 'manual');

    // Mostrar/ocultar conteúdo
    document.getElementById('add-species-ai-content').style.display = tab === 'ai' ? 'block' : 'none';
    document.getElementById('add-species-manual-content').style.display = tab === 'manual' ? 'block' : 'none';
}

async function analyzeMoreSpecies() {
    const result = appState.analysisResults[currentViewerIndex];

    if (!appState.selectedAI || !appState.apiKeys[appState.selectedAI]) {
        showAlert('error', 'Configure a API key para o modelo de IA antes de analisar');
        return;
    }

    if (!confirm('A IA analisará a imagem novamente para detectar espécies adicionais. Continuar?')) {
        return;
    }

    showAlert('info', '🤖 Analisando imagem com IA...');

    try {
        const geminiVersion = localStorage.getItem('geminiVersion') || 'gemini-flash-latest';
        const claudeVersion = document.getElementById('claude-version')?.value || 'claude-sonnet-4-5-20250929';
        const gptVersion = document.getElementById('gpt-version')?.value || 'gpt-4o';

        const headers = { 'Content-Type': 'application/json' };

        // Adicionar API keys
        if (appState.selectedAI === 'claude') {
            headers['X-API-Key-Claude'] = appState.apiKeys.claude;
            headers['X-Claude-Version'] = claudeVersion;
        } else if (appState.selectedAI === 'gpt4') {
            headers['X-API-Key-GPT4'] = appState.apiKeys.gpt4;
            if (gptVersion) {
                headers['X-GPT-Version'] = gptVersion;
            }
        } else if (appState.selectedAI === 'gemini') {
            headers['X-API-Key-Gemini'] = appState.apiKeys.gemini;
            headers['X-Gemini-Version'] = geminiVersion;
        } else if (appState.selectedAI === 'deepseek') {
            headers['X-API-Key-DeepSeek'] = appState.apiKeys.deepseek;
        } else if (appState.selectedAI === 'qwen') {
            headers['X-API-Key-Qwen'] = appState.apiKeys.qwen;
        } else if (appState.selectedAI === 'huggingface') {
            headers['X-API-Key-HuggingFace'] = appState.apiKeys.huggingface;
        }

        // Lista de espécies já existentes para evitar duplicatas
        const existingSpecies = result.especies.map(e => e.apelido);

        const response = await fetch(`/api/parcela/${appState.parcelaNome}/subparcela/${result.subparcela}/add-species-ai`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                ai_model: appState.selectedAI,
                existing_species: existingSpecies
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro na análise');
        }

        if (data.new_species && data.new_species.length > 0) {
            // Adicionar novas espécies ao resultado
            result.especies.push(...data.new_species);

            // Recarregar lista
            loadViewerSpecies();

            // Atualizar visualização principal
            displaySubparcelas();
            displayEspecies();

            // Fechar formulário
            toggleAddSpeciesForm();

            showAlert('success', `✅ ${data.new_species.length} nova(s) espécie(s) detectada(s) pela IA!`);
        } else {
            showAlert('info', 'A IA não detectou espécies adicionais nesta imagem.');
        }

    } catch (error) {
        console.error('Erro na análise IA:', error);
        showAlert('error', `Erro: ${error.message}`);
    }
}

async function saveManualSpecies() {
    console.log('='.repeat(60));
    console.log('🌿 saveManualSpecies() INICIO');
    console.log('='.repeat(60));

    try {
        // 1. Verificar elementos do formulário
        const apelidoEl = document.getElementById('manual-apelido');
        const coberturaEl = document.getElementById('manual-cobertura');
        const alturaEl = document.getElementById('manual-altura');
        const nIndivEl = document.getElementById('manual-n-indiv');
        const formaVidaEl = document.getElementById('manual-forma-vida');
        const generoEl = document.getElementById('manual-genero');
        const familiaEl = document.getElementById('manual-familia');
        const observacoesEl = document.getElementById('manual-observacoes');
        // Biometria
        const dapEl = document.getElementById('manual-dap');
        const diamCopaEl = document.getElementById('manual-diam-copa');

        console.log('📋 Verificando elementos do formulário:');
        console.log(`   - manual-apelido: ${apelidoEl ? 'ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
        console.log(`   - manual-cobertura: ${coberturaEl ? 'ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
        console.log(`   - manual-altura: ${alturaEl ? 'ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
        console.log(`   - manual-forma-vida: ${formaVidaEl ? 'ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);

        if (!apelidoEl || !coberturaEl || !alturaEl || !formaVidaEl) {
            throw new Error('Elementos do formulário não encontrados! Verifique os IDs dos campos.');
        }

        // 2. Ler valores
        const apelido = apelidoEl.value.trim();
        const cobertura = parseInt(coberturaEl.value);
        const altura = parseInt(alturaEl.value);
        const numero_individuos = parseInt(nIndivEl.value) || 1;
        const formaVida = formaVidaEl.value;
        const genero = generoEl ? generoEl.value.trim() : '';
        const familia = familiaEl ? familiaEl.value.trim() : '';
        const observacoes = observacoesEl ? observacoesEl.value.trim() : '';
        // Biometria
        const dapEstimado = dapEl && dapEl.value ? parseFloat(dapEl.value) : null;
        const diametroCopa = diamCopaEl && diamCopaEl.value ? parseFloat(diamCopaEl.value) : null;
        const areaCopa = diametroCopa ? Math.PI * Math.pow(diametroCopa / 2, 2) : null; // Calcular área se diâmetro existe

        console.log('📝 Valores lidos do formulário:');
        console.log(`   - Apelido: "${apelido}"`);
        console.log(`   - Cobertura: ${cobertura}%`);
        console.log(`   - Altura: ${altura}cm`);
        console.log(`   - Forma de Vida: ${formaVida}`);
        console.log(`   - Gênero: "${genero}"`);
        console.log(`   - Família: "${familia}"`);
        console.log(`   - Observações: "${observacoes}"`);

        // 3. Validações
        if (!apelido) {
            console.error('❌ ERRO: Apelido vazio');
            showAlert('error', 'Preencha o apelido da espécie');
            return;
        }

        if (isNaN(cobertura) || cobertura < 0 || cobertura > 100) {
            console.error(`❌ ERRO: Cobertura inválida (${cobertura})`);
            showAlert('error', 'Cobertura deve estar entre 0 e 100%');
            return;
        }

        // 4. Verificar estado da aplicação
        console.log('🔍 Verificando estado da aplicação:');
        console.log(`   - appState existe? ${appState ? 'SIM' : '❌ NÃO'}`);
        console.log(`   - appState.analysisResults existe? ${appState && appState.analysisResults ? 'SIM' : '❌ NÃO'}`);
        console.log(`   - currentViewerIndex: ${currentViewerIndex}`);
        console.log(`   - appState.parcelaNome: "${appState ? appState.parcelaNome : 'UNDEFINED'}"`);

        if (!appState || !appState.analysisResults) {
            throw new Error('Estado da aplicação não inicializado');
        }

        const result = appState.analysisResults[currentViewerIndex];

        if (!result) {
            throw new Error(`Resultado não encontrado para currentViewerIndex ${currentViewerIndex}`);
        }

        console.log('📊 Dados do resultado:');
        console.log(`   - result completo:`, result);
        console.log(`   - Subparcela: ${result.subparcela}`);
        console.log(`   - Número de espécies atual: ${result.especies ? result.especies.length : 0}`);
        console.log(`   - Parcela: ${appState.parcelaNome}`);

        // CRITICAL FIX: Verificar se subparcela está definida
        if (!result.subparcela && result.subparcela !== 0) {
            throw new Error(`❌ Campo 'subparcela' está undefined no resultado! Verifique se você abriu o modal "Ver e Editar" de uma subparcela válida.`);
        }

        // 5. Criar objeto da nova espécie
        const novaEspecie = {
            apelido: apelido,
            genero: genero || '',
            familia: familia || '',
            observacoes: observacoes || '',
            cobertura: cobertura,
            altura: altura,
            numero_individuos: numero_individuos,
            forma_vida: formaVida,
            dap_estimado_cm: dapEstimado,
            diametro_copa_m: diametroCopa,
            area_copa_estimada_m2: areaCopa ? parseFloat(areaCopa.toFixed(2)) : null,
            indice: result.especies.length + 1
        };

        console.log('🆕 Nova espécie criada:', JSON.stringify(novaEspecie, null, 2));

        // 6. Enviar para API
        const url = `/api/parcela/${appState.parcelaNome}/subparcela/${result.subparcela}/especie`;
        console.log(`📡 Enviando POST para: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaEspecie)
        });

        console.log(`📥 Resposta HTTP: Status ${response.status} (${response.statusText})`);

        const data = await response.json();
        console.log('📥 Dados da resposta:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            throw new Error(data.error || `Erro HTTP ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'API retornou success=false');
        }

        // 7. Adicionar ao resultado local
        result.especies.push(novaEspecie);
        console.log(`✅ Espécie adicionada localmente. Total de espécies agora: ${result.especies.length}`);

        // 7.5 Recalcular espécies unificadas
        recalcularEspeciesUnificadas();

        // 8. Recarregar visualizações
        console.log('🔄 Atualizando visualizações...');
        if (typeof loadViewerSpecies === 'function') {
            loadViewerSpecies();
            console.log('   ✓ loadViewerSpecies() chamada');
        } else {
            console.warn('   ⚠️ loadViewerSpecies() não está definida');
        }

        if (typeof displaySubparcelas === 'function') {
            displaySubparcelas();
            console.log('   ✓ displaySubparcelas() chamada');
        } else {
            console.warn('   ⚠️ displaySubparcelas() não está definida');
        }

        if (typeof displaySpeciesTable === 'function') {
            displaySpeciesTable();
            console.log('   ✓ displaySpeciesTable() chamada');
        } else {
            console.warn('   ⚠️ displaySpeciesTable() não está definida');
        }

        // 9. Limpar formulário
        console.log('🧹 Limpando formulário...');
        apelidoEl.value = '';
        coberturaEl.value = '10';
        alturaEl.value = '10';
        formaVidaEl.value = 'Erva';
        if (generoEl) generoEl.value = '';
        if (familiaEl) familiaEl.value = '';
        if (observacoesEl) observacoesEl.value = '';
        console.log('   ✓ Formulário limpo');

        // 10. Fechar formulário
        console.log('🚪 Fechando formulário...');
        if (typeof toggleAddSpeciesForm === 'function') {
            toggleAddSpeciesForm();
            console.log('   ✓ Formulário fechado');
        } else {
            console.warn('   ⚠️ toggleAddSpeciesForm() não está definida');
        }

        // 11. Mostrar mensagem de sucesso
        showAlert('success', `✅ Espécie "${apelido}" adicionada com sucesso!`);

        console.log('='.repeat(60));
        console.log('✅ saveManualSpecies() CONCLUÍDA COM SUCESSO');
        console.log('='.repeat(60));

    } catch (error) {
        console.log('='.repeat(60));
        console.error('❌❌❌ ERRO EM saveManualSpecies() ❌❌❌');
        console.error('Tipo do erro:', error.constructor.name);
        console.error('Mensagem:', error.message);
        console.error('Stack trace:', error.stack);
        console.log('='.repeat(60));
        showAlert('error', `Erro: ${error.message}`);
    }
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

            // Recalcular espécies unificadas
            recalcularEspeciesUnificadas();

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

        const headerSpan = card.querySelector('.subparcela-header span');
        if (!headerSpan) return;

        const subNum = parseInt(headerSpan.textContent.match(/\d+/)[0]);
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
    if (!confirm('⚠️ TEM CERTEZA que deseja iniciar uma nova análise?\n\n🚨 ATENÇÃO: Todos os dados serão PERDIDOS!\n- Espécies identificadas\n- Subparcelas analisadas\n- Configurações e estatísticas\n\n💾 IMPORTANTE: Gere um backup ZIP AGORA se quiser preservar esta análise!\n\nClique em CANCELAR para voltar e gerar o backup.\nClique em OK apenas se tiver certeza.')) {
        return;
    }

    // Segunda confirmação
    if (!confirm('❗ Última chance!\n\nVocê gerou o backup ZIP?\n\nClique OK para APAGAR TUDO e começar do zero.')) {
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
        if (elements.analyticsSection) {
            elements.analyticsSection.style.display = 'none';
        }
        // Footer de exportação/importação permanece sempre visível
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

// ====== INTEGRAÇÃO COM COVERAGE DRAWER ======

// Inicializar CoverageDrawer quando o viewer abre
function initializeCoverageDrawer() {
    const img = viewerModal.querySelector('#viewer-image');
    const result = appState.analysisResults[currentViewerIndex];

    if (img && result) {
        // Preparar dados da subparcela para o drawer
        const subparcelaData = {
            id: result.subparcela,
            subparcela: result.subparcela,
            especies: result.especies || [],
            area_shape: result.area_shape || null
        };

        // Aguardar imagem carregar
        if (img.complete) {
            CoverageDrawer.init(img, subparcelaData);
        } else {
            img.onload = () => {
                CoverageDrawer.init(img, subparcelaData);
            };
        }
    }
}

// Função global para desenhar área de cobertura para uma espécie
function startDrawCoverageForSpecies(speciesIndex) {
    CoverageDrawer.startDrawSpecies(speciesIndex, 'polygon'); // Default: Polígono
}

// Função para começar a desenhar a área da subparcela
function startDrawSubparcelaArea() {
    CoverageDrawer.startDrawSubparcela('polygon'); // Default: Polígono
}

function importAIAreas() {
    if (!CoverageDrawer.svg) {
        showAlert('error', 'Sistema de desenho não inicializado. Abra o modal de visualização primeiro.');
        return;
    }

    if (!CoverageDrawer.subparcelaPolygon) {
        showAlert('warning', '⚠️ Primeiro defina a área de 100% da subparcela antes de importar áreas da IA!');
        return;
    }

    if (confirm('Importar áreas detectadas pela IA?\n\nIsso irá adicionar polígonos automaticamente para as espécies que tiverem coordenadas detectadas.')) {
        CoverageDrawer.importAIDetectedAreas();
    }
}

function clearSpeciesAreas(speciesIndex) {
    const result = appState.analysisResults[currentViewerIndex];
    const species = result.especies[speciesIndex];

    if (!CoverageDrawer.svg) {
        showAlert('error', 'Sistema de desenho não inicializado');
        return;
    }

    // Verificar se há áreas para esta espécie
    const hasAreas = CoverageDrawer.speciesPolygons[speciesIndex]?.length > 0;
    if (!hasAreas) {
        showAlert('info', `A espécie "${species.apelido}" não possui áreas desenhadas`);
        return;
    }

    const numAreas = CoverageDrawer.speciesPolygons[speciesIndex].length;
    if (confirm(`Limpar todas as ${numAreas} área(s) desenhada(s) de "${species.apelido}"?`)) {
        // Remover todas as áreas desta espécie
        delete CoverageDrawer.speciesPolygons[speciesIndex];

        // Renderizar e persistir
        CoverageDrawer.render();
        CoverageDrawer.persistSpeciesArea(speciesIndex, []);

        showAlert('success', `Todas as áreas de "${species.apelido}" foram removidas`);
    }
}

// Funções para controlar visualização dos polígonos

function toggleGrid() {
    const gridToggle = document.getElementById('grid-toggle');
    if (gridToggle && typeof CoverageDrawer !== 'undefined' && CoverageDrawer.svg) {
        CoverageDrawer.gridEnabled = gridToggle.checked;
        console.log('⊞ Grid', CoverageDrawer.gridEnabled ? 'ativado' : 'desativado');
        CoverageDrawer.render();
    }
}

function togglePolygonSettings() {
    const panel = document.getElementById('polygon-settings-panel');
    const isOpening = panel.style.display === 'none';

    panel.style.display = isOpening ? 'block' : 'none';

    // Se está abrindo o painel, garantir que os event listeners estão ativos
    if (isOpening) {
        console.log('🔧 Painel de configurações aberto, verificando event listeners...');

        setTimeout(() => {
            const polygonFillToggle = document.getElementById('polygon-fill-toggle');
            const subparcelaFillToggle = document.getElementById('subparcela-fill-toggle');
            const gridToggle = document.getElementById('grid-toggle');

            if (polygonFillToggle) {
                console.log('✅ Checkbox polygon-fill-toggle encontrado no painel');
                // Remover listeners antigos (se existirem) e adicionar novo
                const newCheckbox = polygonFillToggle.cloneNode(true);
                polygonFillToggle.parentNode.replaceChild(newCheckbox, polygonFillToggle);

                newCheckbox.addEventListener('change', function () {
                    console.log('🌿 Toggle Espécies mudou para:', this.checked);
                    updatePolygonDisplay();
                });
            } else {
                console.error('❌ Checkbox polygon-fill-toggle NÃO encontrado no painel');
            }

            if (subparcelaFillToggle) {
                console.log('✅ Checkbox subparcela-fill-toggle encontrado no painel');
                // Remover listeners antigos (se existirem) e adicionar novo
                const newCheckbox = subparcelaFillToggle.cloneNode(true);
                subparcelaFillToggle.parentNode.replaceChild(newCheckbox, subparcelaFillToggle);

                newCheckbox.addEventListener('change', function () {
                    console.log('📐 Toggle Área 100% mudou para:', this.checked);
                    updateSubparcelaDisplay();
                });
            } else {
                console.error('❌ Checkbox subparcela-fill-toggle NÃO encontrado no painel');
            }

            if (gridToggle) {
                console.log('✅ Checkbox grid-toggle encontrado no painel');
                const newCheckbox = gridToggle.cloneNode(true);
                gridToggle.parentNode.replaceChild(newCheckbox, gridToggle);

                newCheckbox.addEventListener('change', function () {
                    console.log('⊞ Toggle Grid mudou para:', this.checked);
                    toggleGrid();
                });
            }
        }, 50);
    }
}

function updatePolygonDisplay() {
    const checkbox = document.getElementById('polygon-fill-toggle');
    console.log('🌿 Toggle Espécies:', checkbox ? `checked=${checkbox.checked}` : 'CHECKBOX NÃO ENCONTRADO');

    if (!checkbox) {
        console.error('❌ Checkbox polygon-fill-toggle não existe no DOM');
        return;
    }

    const fillEnabled = checkbox.checked;
    console.log('🌿 Alterando CoverageDrawer.fillEnabled para:', fillEnabled);
    CoverageDrawer.fillEnabled = fillEnabled;
    CoverageDrawer.render();
}

function updateSubparcelaDisplay() {
    const checkbox = document.getElementById('subparcela-fill-toggle');
    console.log('📐 Toggle Área 100%:', checkbox ? `checked=${checkbox.checked}` : 'CHECKBOX NÃO ENCONTRADO');

    if (!checkbox) {
        console.error('❌ Checkbox subparcela-fill-toggle não existe no DOM');
        return;
    }

    const fillEnabled = checkbox.checked;
    console.log('📐 Alterando CoverageDrawer.subparcelaFillEnabled para:', fillEnabled);
    CoverageDrawer.subparcelaFillEnabled = fillEnabled;
    CoverageDrawer.render();
}

function updatePolygonOpacity(value) {
    document.getElementById('opacity-value').textContent = value;
    CoverageDrawer.fillOpacity = value / 100;
    CoverageDrawer.render();
}

function updatePolygonStroke(value) {
    document.getElementById('stroke-value').textContent = value;
    CoverageDrawer.strokeWidth = parseInt(value);
    CoverageDrawer.render();
}

function updateGridCellSize(value) {
    document.getElementById('grid-size-value').textContent = value;
    CoverageDrawer.gridCellSize = parseInt(value);
    if (CoverageDrawer.gridEnabled) {
        CoverageDrawer.render();
    }
}

function updateGridLineWidth(value) {
    document.getElementById('grid-line-value').textContent = value;
    CoverageDrawer.gridLineWidth = parseInt(value);
    if (CoverageDrawer.gridEnabled) {
        CoverageDrawer.render();
    }
}

// Modal de seleção de forma geométrica
function showShapeSelectionModal(speciesIndex) {
    const result = appState.analysisResults[currentViewerIndex];
    const isSubparcela = speciesIndex === null;

    const title = isSubparcela
        ? 'Definir Área da Subparcela'
        : `Desenhar Área de ${result.especies[speciesIndex].apelido}`;

    const message = isSubparcela
        ? 'Escolha uma forma para definir a área que representa 100% da subparcela:'
        : 'Escolha uma forma para indicar a área ocupada por esta espécie:';

    const modalHTML = `
        <div class="shape-selection-modal" id="shape-selection-modal">
            <div class="shape-selection-overlay" onclick="closeShapeSelectionModal()"></div>
            <div class="shape-selection-content">
                <div class="shape-selection-header">
                    <h3>${title}</h3>
                    <button onclick="closeShapeSelectionModal()" class="shape-close-btn">✕</button>
                </div>
                <div class="shape-selection-body">
                    <p style="margin-bottom: 20px; color: #cbd5e0;">${message}</p>
                    <div class="shape-options">
                        <button class="shape-option-btn" onclick="selectShape(${speciesIndex}, 'rectangle')">
                            <div class="shape-icon">▭</div>
                            <div class="shape-name">Retângulo</div>
                            <div class="shape-desc">Áreas regulares e quadradas</div>
                        </button>
                        <button class="shape-option-btn" onclick="selectShape(${speciesIndex}, 'circle')">
                            <div class="shape-icon">●</div>
                            <div class="shape-name">Círculo</div>
                            <div class="shape-desc">Áreas circulares uniformes</div>
                        </button>
                        <button class="shape-option-btn" onclick="selectShape(${speciesIndex}, 'ellipse')">
                            <div class="shape-icon">⬭</div>
                            <div class="shape-name">Elipse</div>
                            <div class="shape-desc">Áreas ovais alongadas</div>
                        </button>
                        <button class="shape-option-btn" onclick="selectShape(${speciesIndex}, 'polygon')">
                            <div class="shape-icon">⬟</div>
                            <div class="shape-name">Polígono Livre</div>
                            <div class="shape-desc">Áreas irregulares customizadas</div>
                        </button>
                    </div>
                    <div class="shape-instructions">
                        <h4>Instruções:</h4>
                        <ul>
                            <li><strong>Retângulo/Círculo/Elipse:</strong> Clique e arraste para desenhar</li>
                            <li><strong>Polígono:</strong> Clique para adicionar pontos, clique duplo para finalizar</li>
                            <li><strong>Botão direito:</strong> Remove forma ou último ponto do polígono</li>
                            <li>Você pode desenhar múltiplas formas para a mesma espécie</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover modal antigo se existir
    const oldModal = document.getElementById('shape-selection-modal');
    if (oldModal) oldModal.remove();

    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeShapeSelectionModal() {
    const modal = document.getElementById('shape-selection-modal');
    if (modal) modal.remove();
}

function selectShape(speciesIndex, shapeType) {
    closeShapeSelectionModal();

    if (speciesIndex === null) {
        // Desenhar área da subparcela
        CoverageDrawer.startDrawSubparcela(shapeType);
    } else {
        // Desenhar área da espécie
        CoverageDrawer.startDrawSpecies(speciesIndex, shapeType);
    }
}

// Modificar updateViewerContent para inicializar o drawer
const originalUpdateViewerContent = updateViewerContent;
updateViewerContent = function () {
    originalUpdateViewerContent();

    // Inicializar Coverage Drawer após atualizar conteúdo
    setTimeout(() => {
        initializeCoverageDrawer();
    }, 100);
};

// Modificar closeImageViewer para destruir o drawer
const originalCloseImageViewer = closeImageViewer;
closeImageViewer = function () {
    CoverageDrawer.destroy();
    originalCloseImageViewer();
};

// Tornar funções globais
window.startDrawCoverageForSpecies = startDrawCoverageForSpecies;
window.startDrawSubparcelaArea = startDrawSubparcelaArea;
window.showShapeSelectionModal = showShapeSelectionModal;
window.closeShapeSelectionModal = closeShapeSelectionModal;
window.selectShape = selectShape;

// === FUNÇÕES DE EXPORTAÇÃO AVANÇADA ===

async function exportToPDF() {
    const btn = elements.exportPdfBtn;
    const originalText = btn.textContent;

    try {
        btn.disabled = true;
        btn.textContent = '🔄 Renderizando PDF Detalhado...';
        showNotification('📄 Gerando relatório completo com imagens e análises...', 'info');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;
        const contentWidth = pageWidth - (2 * margin);
        let yOffset = margin;
        let pageCount = 1;

        // Helper para nova página
        function checkPageBreak(heightNeeded) {
            if (yOffset + heightNeeded > pageHeight - margin) {
                pdf.addPage();
                pageCount++;
                yOffset = margin;
                return true;
            }
            return false;
        }

        // Helper para cabeçalho de página
        function addPageHeader(title) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(0, 0, pageWidth, 20, 'F');
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(title, margin, 12);
            pdf.text(`Pág. ${pageCount}`, pageWidth - margin - 15, 12);
            yOffset = 25;
        }

        // --- 1. CAPA (Melhorada) ---
        // Fundo Verde
        pdf.setFillColor(46, 125, 50);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Pattern sutil (simulado com linhas)
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.1);
        for (let i = 0; i < pageHeight; i += 50) {
            pdf.line(0, i, pageWidth, i + pageWidth);
        }

        // Caixa Branca Central
        pdf.setFillColor(255, 255, 255);
        const boxMargin = 30;
        pdf.rect(boxMargin, 80, pageWidth - (2 * boxMargin), 140, 'F');

        // Logo e Títulos
        pdf.setTextColor(46, 125, 50);
        pdf.setFontSize(40);
        pdf.setFont(undefined, 'bold');
        pdf.text('RELATÓRIO', pageWidth / 2, 110, { align: 'center' });
        pdf.setFontSize(24);
        pdf.setFont(undefined, 'normal');
        pdf.text('DE ANÁLISE AMBIENTAL', pageWidth / 2, 125, { align: 'center' });

        pdf.setLineWidth(1);
        pdf.setDrawColor(46, 125, 50);
        pdf.line(pageWidth / 2 - 40, 135, pageWidth / 2 + 40, 135);

        // Informações do Projeto
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(16);
        pdf.text(appState.parcelaNome, pageWidth / 2, 150, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        const dateStr = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        pdf.text(dateStr, pageWidth / 2, 160, { align: 'center' });

        // Métricas de Capa
        const totalSpecies = Object.keys(appState.especies || {}).length;
        const totalSubs = appState.analysisResults?.length || 0;
        let globalCover = 0;
        if (typeof AdvancedAnalytics !== 'undefined') {
            globalCover = AdvancedAnalytics.calculateTotalCoverage?.() || 0;
        }

        pdf.setFontSize(11);
        pdf.setTextColor(46, 125, 50);
        pdf.text(`${totalSubs} Subparcelas analisadas`, pageWidth / 2, 190, { align: 'center' });
        pdf.text(`${totalSpecies} Espécies identificadas`, pageWidth / 2, 197, { align: 'center' });
        pdf.text(`${globalCover.toFixed(1)}% Cobertura média`, pageWidth / 2, 204, { align: 'center' });

        // Rodapé Capa
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Gerado por HerbalScan AI', pageWidth / 2, pageHeight - 15, { align: 'center' });


        // --- 2. DASHBOARD DE ANÁLISES (HTML Rendering) ---
        pdf.addPage();
        pageCount++;
        addPageHeader('Dashboard Ecológico');

        const analyticsSection = document.getElementById('advanced-analytics-section');
        if (analyticsSection) {
            // Mostrar todas as abas temporariamente
            const originalStyles = [];
            const tabs = analyticsSection.querySelectorAll('.analytics-tab-content');
            tabs.forEach(t => {
                originalStyles.push({ el: t, display: t.style.display, opacity: t.style.opacity });
                t.style.display = 'block';
                t.style.opacity = '1';
                t.style.position = 'relative'; // Evitar overlap
            });

            // Capturar container inteiro de uma vez para layout consistente
            // Ou capturar por seções para evitar quebras ruins
            const sections = analyticsSection.querySelectorAll('.analytics-section, .analytics-card');

            for (const section of sections) {
                if (section.offsetHeight < 10) continue; // Skip empty

                // Preparar elemento para captura (remover sombras/backgrounds escuros se necessário)
                // Usar html2canvas
                const canvas = await html2canvas(section, {
                    scale: 1.5, // 1.5x para boa qualidade/tamanho
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.85);
                const imgWidth = contentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                checkPageBreak(imgHeight + 10);
                pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight);
                yOffset += imgHeight + 8;
            }

            // Restaurar abas
            originalStyles.forEach(s => {
                s.el.style.display = s.display;
                s.el.style.opacity = s.opacity;
            });
        }

        // --- 3. DETALHAMENTO DE SUBPARCELAS (Com Renderização Visual) ---
        pdf.addPage();
        pageCount++;
        addPageHeader('Detalhamento Visual das Subparcelas');

        // Container off-screen para renderizar imagem + SVG
        const offscreenContainer = document.createElement('div');
        offscreenContainer.style.position = 'absolute';
        offscreenContainer.style.left = '-9999px';
        offscreenContainer.style.width = '800px'; // Largura fixa alta qualidade
        offscreenContainer.style.backgroundColor = '#fff';
        document.body.appendChild(offscreenContainer);

        for (const sub of appState.analysisResults || []) {
            checkPageBreak(120); // Altura estimada do bloco

            // Título
            pdf.setFontSize(14);
            pdf.setTextColor(33, 33, 33);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Subparcela ${sub.subparcela}`, margin, yOffset + 5);
            yOffset += 10;

            // --- A. Renderizar Imagem com Polígonos ---
            // Limpar container
            offscreenContainer.innerHTML = '';

            // Criar elementos DOM simulação
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '100%';

            const imgEl = document.createElement('img');
            imgEl.src = sub.image_path || `/static/uploads/${appState.parcelaNome}/${sub.image || sub.filename}`;
            imgEl.style.width = '100%';
            imgEl.style.display = 'block';

            wrapper.appendChild(imgEl);
            offscreenContainer.appendChild(wrapper);

            // Aguardar imagem carregar
            await new Promise((resolve) => {
                if (imgEl.complete) resolve();
                else imgEl.onload = resolve;
                imgEl.onerror = resolve; // Continue mesmo se falhar
            });

            // Adicionar SVG manuamente (simulado ou via SVGCoverageDrawer se adaptável)
            // Aqui vamos desenhar um SVG simples baseado nos dados
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', `0 0 ${imgEl.naturalWidth} ${imgEl.naturalHeight}`);
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';

            // Polígono 100% (Subparcela)
            if (sub.area_shape?.points) {
                const pts = sub.area_shape.points.map(p => `${p.x},${p.y}`).join(' ');
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('points', pts);
                poly.setAttribute('fill', 'none');
                poly.setAttribute('stroke', '#667eea');
                poly.setAttribute('stroke-width', '5');
                svg.appendChild(poly);
            }

            // Polígonos de Espécies
            if (sub.especies) {
                sub.especies.forEach((esp, idx) => {
                    const color = ['#48bb78', '#ed8936', '#f6e05e', '#ec4899', '#3b82f6'][idx % 5];
                    (esp.area_shapes || []).forEach(shape => {
                        if (shape.points) {
                            const pts = shape.points.map(p => `${p.x},${p.y}`).join(' ');
                            const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                            poly.setAttribute('points', pts);
                            poly.setAttribute('fill', color);
                            poly.setAttribute('fill-opacity', '0.3');
                            poly.setAttribute('stroke', color);
                            poly.setAttribute('stroke-width', '3');
                            svg.appendChild(poly);
                        }
                    });
                });
            }
            wrapper.appendChild(svg);

            // Capturar Imagem Composta
            const subCanvas = await html2canvas(wrapper, {
                scale: 1, backgroundColor: null
            });
            const subImgData = subCanvas.toDataURL('image/jpeg', 0.85);

            // Layout no PDF: Imagem Esquerda (50%), Dados Direita (50%)
            const imgDisplayWidth = 90;
            const imgDisplayHeight = (subCanvas.height * imgDisplayWidth) / subCanvas.width;

            // Verificar quebra de novo com altura real da imagem
            if (checkPageBreak(imgDisplayHeight)) {
                // Se quebrou página, reimprimir título
                pdf.setFontSize(14); pdf.setFont(undefined, 'bold');
                pdf.text(`Subparcela ${sub.subparcela} (cont.)`, margin, yOffset + 5);
                yOffset += 10;
            }

            pdf.addImage(subImgData, 'JPEG', margin, yOffset, imgDisplayWidth, imgDisplayHeight);

            // --- B. Dados Estatísticos ao Lado (EXPANDIDO) ---
            const textX = margin + imgDisplayWidth + 5;
            let textY = yOffset;

            // Riqueza e Cobertura Local
            const richness = sub.especies ? sub.especies.length : 0;
            const localCover = sub.especies ? sub.especies.reduce((acc, e) => acc + (parseFloat(e.cobertura) || 0), 0) : 0;

            pdf.setFontSize(10);
            pdf.setTextColor(46, 125, 50);
            pdf.text('Métricas Locais Detalhadas:', textX, textY + 4);
            textY += 10;

            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            pdf.text(`• Riqueza de Espécies: ${richness}`, textX + 5, textY);
            textY += 6;
            pdf.text(`• Cobertura Vegetal Total: ${localCover.toFixed(1)}%`, textX + 5, textY);
            textY += 6;

            // Dados adicionais se existirem
            if (sub.status) {
                pdf.text(`• Status: ${sub.status}`, textX + 5, textY);
                textY += 6;
            }
            if (sub.timestamp) {
                pdf.text(`• Analisado em: ${new Date(sub.timestamp).toLocaleString()}`, textX + 5, textY);
                textY += 6;
            }
            if (sub.notas) {
                pdf.text(`• Notas: ${sub.notas}`, textX + 5, textY);
                textY += 6;
            }

            textY += 4;
            // Lista de Espécies (Compacta mas completa)
            pdf.setFontSize(10);
            pdf.setTextColor(46, 125, 50);
            pdf.text('Composição Florística:', textX, textY + 4);
            textY += 10;

            pdf.setFontSize(8);
            pdf.setTextColor(0, 0, 0);

            (sub.especies || []).forEach(esp => {
                const nome = (esp.apelido || 'N/A').substring(0, 25);
                const cob = parseFloat(esp.cobertura || 0).toFixed(1);
                const alt = parseFloat(esp.altura || 0).toFixed(0);
                const fv = esp.forma_vida || '-';

                pdf.setFont(undefined, 'bold');
                pdf.text(`${nome}`, textX + 5, textY);
                pdf.setFont(undefined, 'normal');
                pdf.text(`Cob: ${cob}% | Alt: ${alt}cm | FV: ${fv}`, textX + 5, textY + 4);

                textY += 9;

                // Se lista for muito longa, parar
                if (textY > yOffset + imgDisplayHeight) return;
            });

            yOffset += Math.max(imgDisplayHeight, textY - yOffset) + 15;
        }

        // Limpar offscreen
        document.body.removeChild(offscreenContainer);

        // --- 4. CATÁLOGO DE ESPÉCIES DETALHADO ---
        pdf.addPage();
        pageCount++;
        addPageHeader('Catálogo de Espécies Detalhado');

        const especieKeys = Object.keys(appState.especies || {});

        for (const key of especieKeys) {
            const esp = appState.especies[key];
            if (checkPageBreak(60)) addPageHeader('Catálogo de Espécies Detalhado (cont.)');

            // Box da Espécie
            pdf.setDrawColor(230, 230, 230);
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, yOffset, contentWidth, 55, 'FD');

            // Foto Thumbnail (se houver - lógica simplificada de path)
            // Aqui precisaria capturar a URL real ou base64 do objeto especies
            // Assumiremos sem foto por enquanto ou placeholder

            // Dados Texto
            const leftPad = margin + 5;
            let currentY = yOffset + 8;

            // Nome Principal
            pdf.setFontSize(12);
            pdf.setTextColor(33, 33, 33);
            pdf.setFont(undefined, 'bold');
            pdf.text(esp.apelido_usuario || key, leftPad, currentY);

            // Nome Científico
            currentY += 6;
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.setFont(undefined, 'italic');
            const sciName = `${esp.genero || ''} ${esp.especie || ''}`.trim() || 'Espécie não identificada';
            pdf.text(sciName, leftPad, currentY);

            // Família
            currentY += 6;
            pdf.setFont(undefined, 'normal');
            pdf.text(`Família: ${esp.familia || 'Não informada'}`, leftPad, currentY);

            // Descrição (Simulação de texto rico)
            currentY += 8;
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const desc = esp.observacoes || descricoes_ia[sciName] || "Sem descrição disponível.";
            const splitDesc = pdf.splitTextToSize(desc, contentWidth - 10);
            pdf.text(splitDesc, leftPad, currentY);

            yOffset += 65; // Espaço fixo por card
        }

        // --- FINALIZAR ---
        pdf.save(`${appState.parcelaNome}_relatorio_completo_v2.pdf`);
        showNotification('✅ Relatório Detalhado gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro PDF Detalhado:', error);
        showNotification('❌ Erro: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function exportToZip() {
    const btn = elements.exportZipBtn;
    const originalText = btn.textContent;

    try {
        btn.disabled = true;
        btn.textContent = '🔄 Gerando ZIP...';

        const response = await fetch('/export_zip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parcela: appState.parcelaNome,
                especies: appState.especies,
                analysisResults: appState.analysisResults,
                analytics: {
                    diversity: AdvancedAnalytics.calculateShannonDiversity(),
                    richness: AdvancedAnalytics.calculateSpeciesRichness(),
                    eveness: AdvancedAnalytics.calculateEveness(),
                    simpson: AdvancedAnalytics.calculateSimpsonDominance()
                }
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar ZIP');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${appState.parcelaNome}_pacote_completo.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('✅ ZIP exportado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao exportar ZIP:', error);
        showNotification('❌ Erro ao exportar ZIP: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function showNotification(message, type) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 100000;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// PROPAGAÇÃO DE COBERTURA
// ========================================

window.updateSpeciesCoverageInTables = function (subparcelaId, speciesIndex, percentage) {
    console.log(`🔄 Propagando cobertura ${percentage.toFixed(1)}% para subparcela ${subparcelaId}, espécie ${speciesIndex}`);

    // Encontrar resultado da subparcela
    const result = appState.analysisResults.find(r => r.subparcela === subparcelaId);
    if (!result) {
        console.warn(`⚠️ Subparcela ${subparcelaId} não encontrada`);
        return;
    }

    // Atualizar espécie no resultado
    if (result.especies && result.especies[speciesIndex]) {
        result.especies[speciesIndex].cobertura = parseFloat(percentage.toFixed(1));
        console.log(`✅ Cobertura atualizada no resultado da subparcela ${subparcelaId}`);
    }

    // Atualizar card da subparcela na grid
    const subparcelaCard = document.querySelector(`.subparcela-card[data-subparcela="${subparcelaId}"]`);
    if (subparcelaCard) {
        const speciesListItem = subparcelaCard.querySelector(`[data-species-index="${speciesIndex}"]`);
        if (speciesListItem) {
            const coverageSpan = speciesListItem.querySelector('.species-coverage');
            if (coverageSpan) {
                coverageSpan.textContent = `${percentage.toFixed(1)}%`;
            }
        }
    }

    // Atualizar análises avançadas se estiverem visíveis
    if (window.AdvancedAnalytics && typeof window.AdvancedAnalytics.refreshAnalytics === 'function') {
        window.AdvancedAnalytics.refreshAnalytics();
        console.log('✅ Análises avançadas atualizadas');
    }

    // Persistência já é feita automaticamente pelo backend via persistSpeciesArea
    console.log('💾 Dados já persistidos automaticamente no backend');
};

// Wrapper para recalcular cobertura
function recalculateCoverageWrapper() {
    console.log('🔄 Iniciando recálculo de cobertura...');

    if (typeof SVGCoverageDrawer !== 'undefined' && SVGCoverageDrawer.svg) {
        SVGCoverageDrawer.calculateCoverage();
    } else {
        console.error('❌ SVGCoverageDrawer não disponível ou não inicializado');
        if (typeof showAlert === 'function') {
            showAlert('error', 'Editor de polígonos não está ativo');
        }
    }
}
