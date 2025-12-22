// Configuração de Prompt - Gerenciamento de Templates e Parâmetros

const PromptConfig = {
    templates: [],
    currentTemplate: 'default',
    customParams: {},
    previewTimer: null,

    async init() {
        await this.loadTemplates();
        this.createModal();
        this.attachEvents();
        this.loadSavedConfig();
    },

    async loadTemplates() {
        try {
            // Carregar templates padrão
            const response = await fetch('/api/templates');
            const data = await response.json();
            this.templates = data.templates;

            // Carregar templates customizados
            const customResponse = await fetch('/api/templates/custom/list');
            const customData = await customResponse.json();

            if (customData.templates && customData.templates.length > 0) {
                // Adicionar templates customizados à lista com flag 'custom'
                customData.templates.forEach(t => {
                    this.templates.push({
                        id: `custom_${t.filename}`,
                        name: t.name,
                        description: t.description || 'Template personalizado',
                        objective: 'custom',
                        custom: true,
                        filename: t.filename,
                        created_at: t.created_at,
                        params: t.params,
                        // Extrair analysis_mode dos params para exibir badge de drone
                        analysis_mode: t.params?.analysis_mode || 'herbaceous'
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            alert('Erro ao carregar templates de prompt');
        }
    },

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'prompt-config-modal';
        modal.className = 'prompt-config-modal';
        modal.innerHTML = `
            <div class="prompt-config-container">
                <div class="prompt-config-header">
                    <h2>⚙️ Configuração do Prompt de Análise</h2>
                    <button class="prompt-config-close" onclick="PromptConfig.close()">×</button>
                </div>
                
                <div class="prompt-config-body">
                    <div class="prompt-config-sidebar">
                        <div class="template-section">
                            <h3>📋 Templates Disponíveis</h3>
                            <div id="template-list"></div>
                        </div>
                    </div>
                    
                    <div class="prompt-config-main">
                        <div class="param-group">
                            <h4>🎯 Parâmetros de Análise</h4>
                            <div class="param-item">
                                <label>Número de Morfotipos</label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="number" id="param-min-species" min="1" max="20" value="1" style="width: 48%;">
                                    <input type="number" id="param-max-species" min="1" max="20" value="8" style="width: 48%;">
                                </div>
                                <small style="color: #94a3b8; font-size: 0.8rem;">Mínimo e máximo de espécies</small>
                            </div>
                            
                            <div class="param-item">
                                <label>Nível de Detalhe</label>
                                <select id="param-detail-level">
                                    <option value="low">Baixo - Análise rápida</option>
                                    <option value="medium" selected>Médio - Balanceado</option>
                                    <option value="high">Alto - Detalhado</option>
                                    <option value="very_high">Muito Alto - Máximo detalhe</option>
                                </select>
                            </div>
                            
                            <div class="param-item">
                                <label>Precisão Taxonômica</label>
                                <select id="param-taxonomic-precision">
                                    <option value="conservative" selected>Conservador - Apenas óbvio</option>
                                    <option value="moderate">Moderado - Balanceado</option>
                                    <option value="aggressive">Agressivo - Tenta sempre</option>
                                </select>
                            </div>
                            
                            <div class="param-item">
                                <label>Identificar Gênero</label>
                                <select id="param-include-genus">
                                    <option value="never">Nunca</option>
                                    <option value="only_obvious" selected>Apenas óbvio</option>
                                    <option value="when_possible">Quando possível</option>
                                </select>
                            </div>
                            
                            <div class="param-item">
                                <label>Identificar Família</label>
                                <select id="param-include-family">
                                    <option value="never">Nunca</option>
                                    <option value="when_clear" selected>Quando claro</option>
                                    <option value="always_attempt">Sempre tentar</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="param-group herbaceous-mode-group">
                            <h4>🔍 Opções de Análise (Herbáceas)</h4>
                            <div class="param-item">
                                <label>Padronização entre Subparcelas</label>
                                <select id="param-standardize-subplots">
                                    <option value="none">Independente - Sem padronização</option>
                                    <option value="conservative">Conservadora - Apenas idênticos</option>
                                    <option value="moderate" selected>Moderada - Balanceada</option>
                                    <option value="aggressive">Agressiva - Máxima unificação</option>
                                </select>
                                <small style="color: #94a3b8; font-size: 0.8rem;">Como unificar morfotipos entre subparcelas</small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-separate-grasses" checked>
                                <label for="param-separate-grasses">Separar Poaceae e Cyperaceae</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-soil" checked>
                                <label for="param-include-soil">Incluir solo exposto</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-litter" checked>
                                <label for="param-include-litter">Incluir serapilheira</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-normalize-coverage">
                                <label for="param-normalize-coverage">Normalizar cobertura para 100%</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Ajusta proporcionalmente as coberturas para somar 100% (desativado: mantém valores reais)
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-focus-functional">
                                <label for="param-focus-functional">Foco em grupos funcionais</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-focus-succession">
                                <label for="param-focus-succession">Foco em sucessão ecológica</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-focus-carbon">
                                <label for="param-focus-carbon">Foco em biomassa/carbono</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-polygon-json" checked>
                                <label for="param-include-polygon-json">📐 Incluir polígonos de cobertura</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    IA retorna áreas de cada espécie em formato de polígonos JSON
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-eco-traits">
                                <label for="param-include-eco-traits">🌱 Incluir características ecológicas</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Grupo sucessional, tolerância à sombra, tipo de dispersão
                                </small>
                            </div>
                        </div>
                        
                        <!-- Landscape Mode Parameters -->
                        <div class="param-group landscape-mode-group" style="display: none;">
                            <h4>🛰️ Entidades de Paisagem (Drone)</h4>
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-trees" checked>
                                <label for="param-include-trees">🌳 Detectar árvores adultas</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Estimar copa (m), altura (m) e DAP (cm)
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-seedlings" checked>
                                <label for="param-include-seedlings">🌱 Detectar mudas de reflorestamento</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Sobrevivência, vigor, qualidade do plantio
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-erosion" checked>
                                <label for="param-include-erosion">🟤 Detectar erosão e solo exposto</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Laminar, sulcos, ravinas, voçoroca
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-anthropic" checked>
                                <label for="param-include-anthropic">🔥 Detectar sinais de antropização</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Fogo, estradas, construções, lixo, poluição
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-fauna" checked>
                                <label for="param-include-fauna">🐾 Detectar fauna e pecuária</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Fauna nativa vs doméstica: rastros, tocas, pastejo
                                </small>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-estimate-dbh" checked>
                                <label for="param-estimate-dbh">📏 Estimar DAP das árvores</label>
                            </div>
                            
                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-estimate-crown" checked>
                                <label for="param-estimate-crown">🌿 Estimar diâmetro de copa</label>
                            </div>

                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-include-water">
                                <label for="param-include-water">💧 Detectar corpos d'água</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Rios, lagos, áreas alagadas, mata ciliar
                                </small>
                            </div>

                            <div class="param-item checkbox-group">
                                <input type="checkbox" id="param-count-individuals">
                                <label for="param-count-individuals">🔢 Contar indivíduos</label>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
                                    Estimar contagem numérica para cada entidade
                                </small>
                            </div>
                        </div>
                        
                        <div class="prompt-preview">
                            <div class="prompt-preview-header">
                                <span class="prompt-preview-title">� Preview do Prompt (Editável)</span>
                                <span class="prompt-preview-length" id="prompt-length">0 caracteres</span>
                            </div>
                            <textarea class="prompt-preview-content" id="prompt-preview-text" 
                                      placeholder="Carregando..."
                                      oninput="PromptConfig.onPromptEdit()">Carregando...</textarea>
                            <div class="prompt-preview-hint">
                                💡 <strong>Dica:</strong> Edite o prompt diretamente aqui. Suas alterações manuais serão preservadas até você alterar as configurações acima.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="prompt-config-footer">
                    <div class="config-actions-left">
                        <button class="btn-config btn-config-secondary" onclick="PromptConfig.resetToDefault()">
                            🔄 Resetar
                        </button>
                        <button class="btn-config btn-config-info" onclick="PromptConfig.saveTemplate()">
                            💾 Salvar como Novo Template
                        </button>
                        <button class="btn-config btn-config-primary" onclick="ReferenceSpeciesManager.open()" title="Gerenciar lista de espécies de referência para padronização">
                            📚 Gerenciar Referências
                        </button>
                    </div>
                    <div class="config-actions-right">
                        <button class="btn-config btn-config-secondary" onclick="PromptConfig.close()">
                            Cancelar
                        </button>
                        <button class="btn-config btn-config-success" onclick="PromptConfig.saveAndClose()">
                            ✓ Aplicar e Fechar
                        </button>
                        <button id="apply-and-reanalyze-btn" class="btn-config btn-config-warning" onclick="PromptConfig.applyAndReanalyze()" style="display: none;">
                            🔄 Aplicar e Reanalisar
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.manualEdit = false; // Resetar flag de edição manual
        this.renderTemplates();
        this.updatePreview();
    },

    async loadSavedConfig() {
        const saved = this.getSavedConfig();
        if (saved && saved.params) {
            console.log('📂 Carregando última configuração salva:', saved);
            this.currentTemplate = saved.template || 'default';

            // Aplicar params salvos aos inputs
            if (saved.params.min_species !== undefined)
                document.getElementById('param-min-species').value = saved.params.min_species;
            if (saved.params.max_species !== undefined)
                document.getElementById('param-max-species').value = saved.params.max_species;
            if (saved.params.detail_level)
                document.getElementById('param-detail-level').value = saved.params.detail_level;
            if (saved.params.taxonomic_precision)
                document.getElementById('param-taxonomic-precision').value = saved.params.taxonomic_precision;
            if (saved.params.include_genus)
                document.getElementById('param-include-genus').value = saved.params.include_genus;
            if (saved.params.include_family)
                document.getElementById('param-include-family').value = saved.params.include_family;
            if (saved.params.standardize_across_subplots)
                document.getElementById('param-standardize-subplots').value = saved.params.standardize_across_subplots;
            if (saved.params.separate_grasses !== undefined)
                document.getElementById('param-separate-grasses').checked = saved.params.separate_grasses;
            if (saved.params.include_soil !== undefined)
                document.getElementById('param-include-soil').checked = saved.params.include_soil;
            if (saved.params.include_litter !== undefined)
                document.getElementById('param-include-litter').checked = saved.params.include_litter;
            if (saved.params.focus_functional !== undefined)
                document.getElementById('param-focus-functional').checked = saved.params.focus_functional;
            if (saved.params.focus_succession !== undefined)
                document.getElementById('param-focus-succession').checked = saved.params.focus_succession;
            if (saved.params.focus_carbon !== undefined)
                document.getElementById('param-focus-carbon').checked = saved.params.focus_carbon;
            if (saved.params.include_polygon_json !== undefined)
                document.getElementById('param-include-polygon-json').checked = saved.params.include_polygon_json;
            if (saved.params.include_eco_traits !== undefined)
                document.getElementById('param-include-eco-traits').checked = saved.params.include_eco_traits;
        }
    },

    renderTemplates() {
        const container = document.getElementById('template-list');
        if (!container) return;

        container.innerHTML = this.templates.map(template => {
            const isCustom = template.custom === true;
            const isFeatured = template.featured === true;
            const isLandscape = template.analysis_mode === 'landscape';
            const deleteBtn = isCustom ? `<button class="template-delete-btn" onclick="event.stopPropagation(); PromptConfig.deleteTemplate('${template.filename}')" title="Deletar template">🗑️</button>` : '';
            const customBadge = isCustom ? '<span class="template-custom-badge">⭐ Customizado</span>' : '';
            const featuredBadge = isFeatured ? '<span class="template-featured-badge">🚀 NOVO</span>' : '';
            const modeBadge = isLandscape ? '<span class="template-mode-badge landscape">🛰️ Drone</span>' : '';

            return `
                <div class="template-card ${template.id === this.currentTemplate ? 'active' : ''} ${isCustom ? 'custom' : ''} ${isFeatured ? 'featured' : ''}" 
                     onclick="PromptConfig.selectTemplate('${template.id}')">
                    <div class="template-card-header">
                        <div class="template-card-title">
                            ${template.name}
                            ${featuredBadge}
                            ${customBadge}
                            ${modeBadge}
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <div class="template-card-badge">${template.objective}</div>
                            ${deleteBtn}
                        </div>
                    </div>
                    <div class="template-card-desc">${template.description}</div>
                    ${isCustom ? `<div class="template-card-date">Criado em: ${new Date(template.created_at).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
            `;
        }).join('');
    },

    async deleteTemplate(filename) {
        if (!confirm('Tem certeza que deseja deletar este template personalizado?')) {
            return;
        }

        try {
            const response = await fetch(`/api/templates/custom/delete/${filename}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('✓ Template deletado com sucesso!');

                // Recarregar lista
                await this.loadTemplates();
                this.renderTemplates();

                // Se estava selecionado, voltar para default
                if (this.currentTemplate === `custom_${filename}`) {
                    this.selectTemplate('default');
                }
            } else {
                alert('Erro: ' + (result.error || 'Erro ao deletar template'));
            }
        } catch (error) {
            console.error('Erro ao deletar template:', error);
            alert('Erro ao deletar template: ' + error.message);
        }
    },

    async selectTemplate(templateId) {
        this.currentTemplate = templateId;

        // Verificar se é template customizado
        const isCustom = templateId.startsWith('custom_');

        let params;
        let analysisMode = 'herbaceous';

        if (isCustom) {
            // Template customizado - buscar dos dados locais
            const template = this.templates.find(t => t.id === templateId);
            console.log('🔍 Template customizado selecionado:', templateId);
            console.log('📋 Template encontrado:', template);

            if (template && template.params) {
                params = template.params;
                analysisMode = template.analysis_mode || params.analysis_mode || 'herbaceous';
                console.log('✅ Params carregados:', params);
            } else {
                console.error('❌ Template customizado não encontrado ou sem params');
                console.log('Templates disponíveis:', this.templates);
                return;
            }
        } else {
            // Template padrão - buscar da API
            try {
                const response = await fetch(`/api/templates/${templateId}`);
                const data = await response.json();
                params = data.params;
                analysisMode = data.analysis_mode || params?.analysis_mode || 'herbaceous';
            } catch (error) {
                console.error('Erro ao carregar template:', error);
                return;
            }
        }

        console.log('🎯 Aplicando params aos inputs:', params);
        console.log('🛰️ Modo de análise:', analysisMode);

        // Alternar visibilidade dos grupos de parâmetros baseado no modo
        this.switchModeUI(analysisMode);
        this.currentMode = analysisMode;

        // Aplicar parâmetros aos inputs com validação
        const setInputValue = (id, value, type = 'value') => {
            const el = document.getElementById(id);
            if (!el) {
                // Não logar erro para campos que podem não existir
                return false;
            }

            if (type === 'checkbox') {
                el.checked = value;
            } else {
                el.value = value;
            }
            return true;
        };

        // Aplicar parâmetros comuns
        setInputValue('param-min-species', params.min_species || 1);
        setInputValue('param-max-species', params.max_species || (analysisMode === 'landscape' ? 30 : 8));
        setInputValue('param-detail-level', params.detail_level || 'medium');
        setInputValue('param-taxonomic-precision', params.taxonomic_precision || 'conservative');
        setInputValue('param-include-genus', params.include_genus || 'only_obvious');
        setInputValue('param-include-family', params.include_family || 'when_clear');

        // Aplicar parâmetros herbáceos
        setInputValue('param-standardize-subplots', params.standardize_across_subplots || 'moderate');
        setInputValue('param-separate-grasses', params.separate_grasses !== false, 'checkbox');
        setInputValue('param-include-soil', params.include_soil !== false, 'checkbox');
        setInputValue('param-include-litter', params.include_litter !== false, 'checkbox');
        setInputValue('param-normalize-coverage', params.normalize_coverage === true, 'checkbox');
        setInputValue('param-focus-functional', params.focus_functional === true, 'checkbox');
        setInputValue('param-focus-succession', params.focus_succession === true, 'checkbox');
        setInputValue('param-focus-carbon', params.focus_carbon === true, 'checkbox');
        setInputValue('param-include-polygon-json', params.include_polygon_json !== false, 'checkbox');
        setInputValue('param-include-eco-traits', params.include_eco_traits === true, 'checkbox');

        // Aplicar parâmetros paisagem/drone
        setInputValue('param-include-trees', params.include_trees !== false, 'checkbox');
        setInputValue('param-include-seedlings', params.include_seedlings !== false, 'checkbox');
        setInputValue('param-include-erosion', params.include_erosion !== false, 'checkbox');
        setInputValue('param-include-anthropic', params.include_anthropic !== false, 'checkbox');
        setInputValue('param-include-fauna', params.include_fauna !== false, 'checkbox');
        setInputValue('param-estimate-dbh', params.estimate_dbh !== false, 'checkbox');
        setInputValue('param-estimate-crown', params.estimate_crown !== false, 'checkbox');
        setInputValue('param-include-water', params.include_water === true, 'checkbox');
        setInputValue('param-count-individuals', params.count_individuals === true, 'checkbox');

        console.log('✅ Todos os parâmetros aplicados');

        this.renderTemplates();
        this.updatePreview();
    },

    // Alternar visibilidade dos grupos de modo
    switchModeUI(mode) {
        const herbaceousGroup = document.querySelector('.herbaceous-mode-group');
        const landscapeGroup = document.querySelector('.landscape-mode-group');

        if (mode === 'landscape') {
            if (herbaceousGroup) herbaceousGroup.style.display = 'none';
            if (landscapeGroup) landscapeGroup.style.display = 'block';
            console.log('🛰️ UI alternada para modo PAISAGEM');
        } else {
            if (herbaceousGroup) herbaceousGroup.style.display = 'block';
            if (landscapeGroup) landscapeGroup.style.display = 'none';
            console.log('🌿 UI alternada para modo HERBÁCEO');
        }
    },

    attachEvents() {
        const inputs = [
            'param-min-species', 'param-max-species', 'param-detail-level',
            'param-taxonomic-precision', 'param-include-genus', 'param-include-family',
            'param-standardize-subplots',
            'param-separate-grasses', 'param-include-soil', 'param-include-litter',
            'param-normalize-coverage',
            'param-focus-functional', 'param-focus-succession', 'param-focus-carbon',
            'param-include-polygon-json', 'param-include-eco-traits',
            // Landscape mode params
            'param-include-trees', 'param-include-seedlings', 'param-include-erosion',
            'param-include-anthropic', 'param-include-fauna',
            'param-estimate-dbh', 'param-estimate-crown',
            'param-include-water', 'param-count-individuals'
        ];

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    this.manualEdit = false; // Resetar flag ao mudar configurações
                    this.updatePreview();
                    this.saveCurrentConfig(); // Salvar automaticamente
                });
            }
        });
    },

    saveCurrentConfig() {
        const config = {
            template: this.currentTemplate,
            params: this.getCustomParams()
        };
        localStorage.setItem('promptConfig', JSON.stringify(config));
        console.log('💾 Configuração salva automaticamente:', config);
    },

    getCustomParams() {
        // Helper to safely get checkbox value
        const getChecked = (id) => {
            const el = document.getElementById(id);
            return el ? el.checked : false;
        };

        const params = {
            // Common params
            min_species: parseInt(document.getElementById('param-min-species').value),
            max_species: parseInt(document.getElementById('param-max-species').value),
            detail_level: document.getElementById('param-detail-level').value,
            taxonomic_precision: document.getElementById('param-taxonomic-precision').value,
            include_genus: document.getElementById('param-include-genus').value,
            include_family: document.getElementById('param-include-family').value,
            // Herbaceous params
            standardize_across_subplots: document.getElementById('param-standardize-subplots')?.value || 'moderate',
            separate_grasses: getChecked('param-separate-grasses'),
            include_soil: getChecked('param-include-soil'),
            include_litter: getChecked('param-include-litter'),
            normalize_coverage: getChecked('param-normalize-coverage'),
            focus_functional: getChecked('param-focus-functional'),
            focus_succession: getChecked('param-focus-succession'),
            focus_carbon: getChecked('param-focus-carbon'),
            include_polygon_json: getChecked('param-include-polygon-json'),
            include_eco_traits: getChecked('param-include-eco-traits'),
            // Landscape params
            include_trees: getChecked('param-include-trees'),
            include_seedlings: getChecked('param-include-seedlings'),
            include_erosion: getChecked('param-include-erosion'),
            include_anthropic: getChecked('param-include-anthropic'),
            include_fauna: getChecked('param-include-fauna'),
            estimate_dbh: getChecked('param-estimate-dbh'),
            estimate_crown: getChecked('param-estimate-crown'),
            include_water: getChecked('param-include-water'),
            count_individuals: getChecked('param-count-individuals')
        };

        // Add analysis_mode if in landscape mode
        if (this.currentMode === 'landscape') {
            params.analysis_mode = 'landscape';
        }

        return params;
    },

    async updatePreview() {
        // Se houver edição manual, não sobrescrever
        if (this.manualEdit) {
            return;
        }

        clearTimeout(this.previewTimer);
        this.previewTimer = setTimeout(async () => {
            try {
                const response = await fetch('/api/templates/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template: this.currentTemplate,
                        params: this.getCustomParams()
                    })
                });

                const data = await response.json();
                const previewElement = document.getElementById('prompt-preview-text');
                previewElement.value = data.prompt;
                document.getElementById('prompt-length').textContent = `${data.length} caracteres`;
            } catch (error) {
                console.error('Erro ao gerar preview:', error);
            }
        }, 500);
    },

    onPromptEdit() {
        // Marcar que houve edição manual
        this.manualEdit = true;

        // Atualizar contador de caracteres
        const previewElement = document.getElementById('prompt-preview-text');
        const length = previewElement.value.length;
        document.getElementById('prompt-length').textContent = `${length} caracteres`;
    },

    getEditedPrompt() {
        // Retornar prompt editado se houver edição manual
        if (this.manualEdit) {
            return document.getElementById('prompt-preview-text').value;
        }
        return null;
    },

    open() {
        document.getElementById('prompt-config-modal').classList.add('active');

        // Mostrar botão "Aplicar e Reanalisar" se há uma reanálise pendente
        const reanalyzeBtn = document.getElementById('apply-and-reanalyze-btn');
        if (reanalyzeBtn && window.pendingReanalysis) {
            reanalyzeBtn.style.display = 'inline-block';
        } else if (reanalyzeBtn) {
            reanalyzeBtn.style.display = 'none';
        }
    },

    close() {
        document.getElementById('prompt-config-modal').classList.remove('active');

        // Limpar reanálise pendente ao fechar sem executar
        if (window.pendingReanalysis) {
            delete window.pendingReanalysis;
        }
    },

    async applyAndReanalyze() {
        // Verificar se há reanálise pendente
        if (!window.pendingReanalysis) {
            showAlert('error', 'Nenhuma reanálise pendente');
            return;
        }

        const { subparcela } = window.pendingReanalysis;

        // Salvar configuração
        this.saveAndClose();

        // Obter configuração recém-salva
        const promptConfig = this.getSavedConfig();

        // Executar reanálise
        const success = await executeReanalysis(subparcela, promptConfig);

        if (success) {
            // Limpar reanálise pendente
            delete window.pendingReanalysis;
        }
    },

    async saveTemplate() {
        // Criar mini-modal para salvar template
        const saveModal = document.createElement('div');
        saveModal.className = 'save-template-modal';
        saveModal.innerHTML = `
            <div class="save-template-overlay" onclick="PromptConfig.closeSaveModal()"></div>
            <div class="save-template-dialog">
                <div class="save-template-header">
                    <h3>💾 Salvar Template Personalizado</h3>
                    <button onclick="PromptConfig.closeSaveModal()">×</button>
                </div>
                <div class="save-template-body">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">
                            Nome do Template *
                        </label>
                        <input type="text" id="save-template-name" placeholder="Ex: Cerrado Campo Limpo"
                               style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">
                            Descrição (opcional)
                        </label>
                        <textarea id="save-template-description" rows="3" placeholder="Descreva quando usar este template..."
                                  style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 0.95rem; resize: vertical;"></textarea>
                    </div>
                    <div style="padding: 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 0.9rem; color: #93c5fd;">
                            <strong>ℹ️ Informação:</strong> Este template salvará todas as configurações atuais (parâmetros, checkboxes, etc.)
                        </p>
                    </div>
                </div>
                <div class="save-template-footer">
                    <button class="btn-config btn-config-secondary" onclick="PromptConfig.closeSaveModal()">
                        Cancelar
                    </button>
                    <button class="btn-config btn-config-success" onclick="PromptConfig.confirmSaveTemplate()">
                        💾 Salvar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(saveModal);

        // Focus no input
        setTimeout(() => {
            document.getElementById('save-template-name').focus();
        }, 100);
    },

    closeSaveModal() {
        const modal = document.querySelector('.save-template-modal');
        if (modal) modal.remove();
    },

    async confirmSaveTemplate() {
        const name = document.getElementById('save-template-name').value.trim();
        const description = document.getElementById('save-template-description').value.trim();

        if (!name) {
            alert('Por favor, digite um nome para o template');
            return;
        }

        const params = this.getCustomParams();

        // Obter preview do prompt
        const previewResponse = await fetch('/api/templates/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                template: this.currentTemplate,
                params: params
            })
        });

        const previewData = await previewResponse.json();

        try {
            const response = await fetch('/api/templates/custom/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    params: params,
                    prompt: previewData.prompt,
                    base_template: this.currentTemplate
                })
            });

            const result = await response.json();

            if (result.success) {
                this.closeSaveModal();
                alert(`✓ Template "${name}" salvo com sucesso!`);

                // Recarregar lista de templates
                await this.loadTemplates();
                this.renderTemplates();
            } else {
                alert('Erro: ' + (result.error || 'Erro ao salvar template'));
            }
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            alert('Erro ao salvar template: ' + error.message);
        }
    },

    saveAndClose() {
        const config = {
            template: this.currentTemplate,
            params: this.getCustomParams()
        };

        // Se houve edição manual, salvar o prompt editado
        if (this.manualEdit) {
            config.customPrompt = document.getElementById('prompt-preview-text').value;
            console.log('💾 Salvando prompt editado manualmente');
        }

        localStorage.setItem('promptConfig', JSON.stringify(config));

        // Verificar se há imagens pendentes para adicionar à análise
        if (window.appState && window.appState.pendingNewImages) {
            this.close();
            // Chamar função para adicionar imagens com a configuração
            if (window.addImagesToExistingAnalysis) {
                window.addImagesToExistingAnalysis(window.appState.pendingNewImages, config);
            }
        } else {
            alert('✓ Configuração salva! Será aplicada na próxima análise.');
            this.close();
        }
    },

    loadSavedConfig() {
        const saved = localStorage.getItem('promptConfig');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.currentTemplate = config.template || 'default';
                this.customParams = config.params || {};
            } catch (e) {
                console.error('Erro ao carregar configuração salva:', e);
            }
        }
    },

    getSavedConfig() {
        const saved = localStorage.getItem('promptConfig');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return { template: 'default', params: null };
            }
        }
        return { template: 'default', params: null };
    },

    resetToDefault() {
        this.selectTemplate('default');
    }
};

// Inicializar quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PromptConfig.init());
} else {
    PromptConfig.init();
}
