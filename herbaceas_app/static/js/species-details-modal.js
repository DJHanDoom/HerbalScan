// Modal de Detalhes e Dashboard de Espécies
// Sistema completo com visualizações, estatísticas e upload de fotos

const SpeciesDetailsModal = {
    modal: null,
    currentSpecies: null,
    currentSpeciesData: null,
    uploadedPhotos: [],

    open(apelidoOriginal, initialTab = 'overview') {
        this.currentSpecies = apelidoOriginal;
        this.loadSpeciesData();
        this.createModal();
        this.renderContent();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Mudar para a aba especificada se não for a padrão
        if (initialTab !== 'overview') {
            setTimeout(() => this.switchTab(initialTab), 100);
        }
    },

    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.remove();
                    this.modal = null;
                }
            }, 300);
        }
    },

    loadSpeciesData() {
        // Carregar dados da espécie unificada
        const especieUnificada = appState.especies[this.currentSpecies];

        if (!especieUnificada) {
            showAlert('error', 'Espécie não encontrada');
            return;
        }

        // Coletar dados de todas as ocorrências
        const ocorrencias = [];
        let totalCobertura = 0;
        let totalAltura = 0;
        let formasVida = {};
        let subparcelasPresenca = new Set();

        appState.analysisResults.forEach(result => {
            result.especies.forEach(esp => {
                if (esp.apelido === this.currentSpecies || esp.apelido === especieUnificada.apelido_usuario) {
                    ocorrencias.push({
                        subparcela: result.subparcela,
                        cobertura: esp.cobertura || 0,
                        altura: esp.altura || 0,
                        forma_vida: esp.forma_vida || '-',
                        observacoes: esp.observacoes || '',
                        familia: esp.familia || '',
                        genero: esp.genero || '',
                        especie: esp.especie || ''
                    });

                    totalCobertura += (esp.cobertura || 0);
                    totalAltura += (esp.altura || 0);
                    subparcelasPresenca.add(result.subparcela);

                    const forma = esp.forma_vida || '-';
                    formasVida[forma] = (formasVida[forma] || 0) + 1;
                }
            });
        });

        this.currentSpeciesData = {
            ...especieUnificada,
            ocorrencias: ocorrencias,
            totalOcorrencias: ocorrencias.length,
            coberturaMedia: ocorrencias.length > 0 ? totalCobertura / ocorrencias.length : 0,
            alturaMedia: ocorrencias.length > 0 ? totalAltura / ocorrencias.length : 0,
            coberturaTotal: totalCobertura,
            formasVida: formasVida,
            subparcelasPresenca: Array.from(subparcelasPresenca).sort((a, b) => a - b),
            coberturaMin: Math.min(...ocorrencias.map(o => o.cobertura)),
            coberturaMax: Math.max(...ocorrencias.map(o => o.cobertura)),
            alturaMin: Math.min(...ocorrencias.map(o => o.altura)),
            alturaMax: Math.max(...ocorrencias.map(o => o.altura))
        };

        // Carregar fotos salvas
        this.loadSavedPhotos();
    },

    async loadSavedPhotos() {
        try {
            const response = await fetch(`/api/especies/${this.currentSpecies}/photos`);
            if (response.ok) {
                const data = await response.json();
                this.uploadedPhotos = data.photos || [];
            }
        } catch (error) {
            console.log('Nenhuma foto salva ainda');
            this.uploadedPhotos = [];
        }
    },

    createModal() {
        if (this.modal) this.modal.remove();

        this.modal = document.createElement('div');
        this.modal.className = 'species-details-modal';
        this.modal.innerHTML = `
            <div class="species-details-overlay" onclick="SpeciesDetailsModal.close()"></div>
            <div class="species-details-container">
                <div class="species-details-header">
                    <div class="species-details-title-section">
                        <h2 id="species-details-title">Carregando...</h2>
                        <p id="species-details-subtitle" class="species-subtitle"></p>
                    </div>
                    <button class="species-details-close" onclick="SpeciesDetailsModal.close()">✕</button>
                </div>
                <div class="species-details-content" id="species-details-content">
                    <!-- Conteúdo será renderizado dinamicamente -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
    },

    renderContent() {
        if (!this.currentSpeciesData) return;

        const data = this.currentSpeciesData;
        const content = document.getElementById('species-details-content');

        // Atualizar título
        document.getElementById('species-details-title').textContent = data.apelido_usuario || data.apelido_original;

        const taxonomia = [];
        if (data.genero) taxonomia.push(data.genero);
        if (data.especie) taxonomia.push(data.especie);
        if (data.familia) taxonomia.push(`(${data.familia})`);

        document.getElementById('species-details-subtitle').textContent =
            taxonomia.length > 0 ? taxonomia.join(' ') : 'Taxonomia não definida';

        content.innerHTML = `
            <!-- Navegação por abas -->
            <div class="species-tabs">
                <button class="species-tab active" data-tab="overview" onclick="SpeciesDetailsModal.switchTab('overview')">
                    📊 Visão Geral
                </button>
                <button class="species-tab" data-tab="distribution" onclick="SpeciesDetailsModal.switchTab('distribution')">
                    📍 Distribuição
                </button>
                <button class="species-tab" data-tab="photos" onclick="SpeciesDetailsModal.switchTab('photos')">
                    📷 Fotos (${this.uploadedPhotos.length})
                </button>
                <button class="species-tab" data-tab="edit" onclick="SpeciesDetailsModal.switchTab('edit')">
                    ✏️ Editar
                </button>
            </div>

            <!-- Conteúdo das abas -->
            <div class="species-tab-content">
                <!-- Aba: Visão Geral -->
                <div class="species-tab-panel active" id="tab-overview">
                    ${this.renderOverviewTab()}
                </div>

                <!-- Aba: Distribuição -->
                <div class="species-tab-panel" id="tab-distribution">
                    ${this.renderDistributionTab()}
                </div>

                <!-- Aba: Fotos -->
                <div class="species-tab-panel" id="tab-photos">
                    ${this.renderPhotosTab()}
                </div>

                <!-- Aba: Editar -->
                <div class="species-tab-panel" id="tab-edit">
                    ${this.renderEditTab()}
                </div>
            </div>
        `;

        // Renderizar gráficos
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    },

    renderOverviewTab() {
        const data = this.currentSpeciesData;

        return `
            <!-- Cards de estatísticas -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">${data.totalOcorrencias}</div>
                        <div class="stat-label">Ocorrências</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🌿</div>
                    <div class="stat-content">
                        <div class="stat-value">${data.coberturaMedia.toFixed(1)}%</div>
                        <div class="stat-label">Cobertura Média</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📏</div>
                    <div class="stat-content">
                        <div class="stat-value">${data.alturaMedia.toFixed(1)} cm</div>
                        <div class="stat-label">Altura Média</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📍</div>
                    <div class="stat-content">
                        <div class="stat-value">${data.subparcelasPresenca.length}</div>
                        <div class="stat-label">Subparcelas</div>
                    </div>
                </div>
            </div>

            <!-- Gráficos -->
            <div class="charts-section">
                <div class="chart-container">
                    <h3>Cobertura por Subparcela</h3>
                    <canvas id="coverage-chart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Altura por Subparcela</h3>
                    <canvas id="height-chart"></canvas>
                </div>
            </div>

            <!-- Análises detalhadas -->
            <div class="analysis-section">
                <h3>Análise Estatística</h3>
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <strong>Cobertura:</strong>
                        <div class="analysis-detail">
                            Mínima: ${data.coberturaMin.toFixed(1)}% |
                            Máxima: ${data.coberturaMax.toFixed(1)}% |
                            Total: ${data.coberturaTotal.toFixed(1)}%
                        </div>
                    </div>
                    <div class="analysis-item">
                        <strong>Altura:</strong>
                        <div class="analysis-detail">
                            Mínima: ${data.alturaMin.toFixed(1)} cm |
                            Máxima: ${data.alturaMax.toFixed(1)} cm
                        </div>
                    </div>
                    <div class="analysis-item">
                        <strong>Formas de Vida:</strong>
                        <div class="analysis-detail">
                            ${Object.entries(data.formasVida).map(([forma, count]) =>
            `${forma}: ${count}x`
        ).join(' | ')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderDistributionTab() {
        const data = this.currentSpeciesData;

        return `
            <div class="distribution-section">
                <h3>Mapa de Presença</h3>
                <div class="distribution-map">
                    <canvas id="presence-map"></canvas>
                </div>

                <h3>Ocorrências Detalhadas</h3>
                <div class="occurrences-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Subparcela</th>
                                <th>Cobertura (%)</th>
                                <th>Altura (cm)</th>
                                <th>Forma de Vida</th>
                                <th>Observações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.ocorrencias.map(occ => `
                                <tr>
                                    <td><strong>${occ.subparcela}</strong></td>
                                    <td>${occ.cobertura.toFixed(1)}%</td>
                                    <td>${occ.altura.toFixed(1)} cm</td>
                                    <td>${occ.forma_vida}</td>
                                    <td class="obs-cell">${occ.observacoes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderPhotosTab() {
        return `
            <div class="photos-section">
                <div class="photos-upload-area">
                    <h3>Upload de Fotos</h3>
                    <p class="info-text">Adicione fotos desta espécie para facilitar a identificação futura</p>

                    <div class="upload-zone" id="photo-upload-zone">
                        <div class="upload-icon">📷</div>
                        <p>Clique ou arraste fotos aqui</p>
                        <input type="file" id="photo-upload-input" multiple accept="image/*" style="display: none;">
                        <button class="btn-upload" onclick="document.getElementById('photo-upload-input').click()">
                            Selecionar Fotos
                        </button>
                    </div>
                </div>

                <div class="photos-gallery">
                    <h3>Galeria de Fotos (${this.uploadedPhotos.length})</h3>
                    <div class="photos-grid" id="photos-grid">
                        ${this.uploadedPhotos.length === 0 ?
                '<p class="no-photos">Nenhuma foto adicionada ainda</p>' :
                this.uploadedPhotos.map((photo, index) => `
                                <div class="photo-item" data-index="${index}">
                                    <img src="${photo.url}" alt="Foto ${index + 1}">
                                    <div class="photo-actions">
                                        <button onclick="SpeciesDetailsModal.viewPhoto(${index})" class="btn-view" title="Ver em tamanho real">
                                            🔍
                                        </button>
                                        <button onclick="SpeciesDetailsModal.deletePhoto(${index})" class="btn-delete" title="Remover">
                                            🗑️
                                        </button>
                                    </div>
                                    <div class="photo-info">
                                        ${photo.filename}
                                    </div>
                                </div>
                            `).join('')
            }
                    </div>
                </div>
            </div>
        `;
    },

    renderEditTab() {
        const data = this.currentSpeciesData;

        return `
            <div class="edit-section">
                <h3>Informações Taxonômicas</h3>
                <form id="species-edit-form" onsubmit="SpeciesDetailsModal.saveChanges(event)">
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Apelido Personalizado *</label>
                            <input type="text" id="edit-apelido-usuario" value="${data.apelido_usuario || ''}" required>
                        </div>

                        <div class="form-group">
                            <label>Gênero</label>
                            <input type="text" id="edit-genero" value="${data.genero || ''}" placeholder="Ex: Paspalum">
                        </div>

                        <div class="form-group">
                            <label>Espécie</label>
                            <input type="text" id="edit-especie" value="${data.especie || ''}" placeholder="Ex: notatum">
                        </div>

                        <div class="form-group full-width">
                            <label>Família</label>
                            <input type="text" id="edit-familia" value="${data.familia || ''}" placeholder="Ex: Poaceae">
                        </div>


                        <div class="form-group full-width">
                            <label>🔗 Link das Fotos (URL)</label>
                            <input type="url" id="edit-link-fotos" value="${data.link_fotos || ''}"
                                   placeholder="https://exemplo.com/fotos-da-especie">
                            <small>Cole o link para fotos de referência online da espécie</small>
                        </div>

                        <div class="form-group full-width">
                            <label>📝 Descrição / Observações</label>
                            <textarea id="edit-observacoes" rows="6" class="form-control" 
                                      placeholder="Descrição detalhada e observações sobre a espécie...">${data.observacoes || ''}</textarea>
                            <small>Texto descritivo gerado pela IA ou editado manualmente</small>
                        </div>
                    </div>

                    <h3 style="margin-top: 20px;">🌱 Características Ecológicas</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Grupo Sucessional</label>
                            <select id="edit-grupo-sucessional">
                                <option value="" ${!data.grupo_sucessional ? 'selected' : ''}>Não definido</option>
                                <option value="Pioneira" ${data.grupo_sucessional === 'Pioneira' ? 'selected' : ''}>Pioneira</option>
                                <option value="Secundária Inicial" ${data.grupo_sucessional === 'Secundária Inicial' ? 'selected' : ''}>Secundária Inicial</option>
                                <option value="Secundária Tardia" ${data.grupo_sucessional === 'Secundária Tardia' ? 'selected' : ''}>Secundária Tardia</option>
                                <option value="Climácica" ${data.grupo_sucessional === 'Climácica' ? 'selected' : ''}>Climácica</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Tolerância à Sombra</label>
                            <select id="edit-tolerancia-sombra">
                                <option value="" ${!data.tolerancia_sombra ? 'selected' : ''}>Não definido</option>
                                <option value="Heliófita" ${data.tolerancia_sombra === 'Heliófita' ? 'selected' : ''}>Heliófita (sol)</option>
                                <option value="Esciófita" ${data.tolerancia_sombra === 'Esciófita' ? 'selected' : ''}>Esciófita (sombra)</option>
                                <option value="Indiferente" ${data.tolerancia_sombra === 'Indiferente' ? 'selected' : ''}>Indiferente</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Tipo de Dispersão</label>
                            <select id="edit-tipo-dispersao">
                                <option value="" ${!data.tipo_dispersao ? 'selected' : ''}>Não definido</option>
                                <option value="Anemocórica" ${data.tipo_dispersao === 'Anemocórica' ? 'selected' : ''}>Anemocórica (vento)</option>
                                <option value="Zoocórica" ${data.tipo_dispersao === 'Zoocórica' ? 'selected' : ''}>Zoocórica (animais)</option>
                                <option value="Autocórica" ${data.tipo_dispersao === 'Autocórica' ? 'selected' : ''}>Autocórica (auto)</option>
                                <option value="Hidrocórica" ${data.tipo_dispersao === 'Hidrocórica' ? 'selected' : ''}>Hidrocórica (água)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Habitat Preferencial</label>
                            <input type="text" id="edit-habitat-preferencial" value="${data.habitat_preferencial || ''}" 
                                   placeholder="Ex: Borda de mata, Campo úmido">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">💾 Salvar Alterações</button>
                        <button type="button" class="btn btn-secondary" onclick="SpeciesDetailsModal.close()">Cancelar</button>
                    </div>
                </form>

                <div class="danger-zone">
                    <h3>⚠️ Zona de Perigo</h3>
                    <p>Estas ações afetarão todas as ${data.totalOcorrencias} ocorrências desta espécie</p>
                    <button class="btn btn-danger" onclick="SpeciesDetailsModal.deleteSpecies()">
                        🗑️ Remover Espécie Completamente
                    </button>
                </div>
            </div>
        `;
    },

    switchTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.species-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Atualizar painéis
        document.querySelectorAll('.species-tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Renderizar gráficos se necessário
        if (tabName === 'overview' || tabName === 'distribution') {
            setTimeout(() => this.renderCharts(), 100);
        }

        // Setup upload se for aba de fotos
        if (tabName === 'photos') {
            this.setupPhotoUpload();
        }
    },

    renderCharts() {
        this.renderCoverageChart();
        this.renderHeightChart();
        this.renderPresenceMap();
    },

    renderCoverageChart() {
        const canvas = document.getElementById('coverage-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.currentSpeciesData;

        // Destruir gráfico anterior se existir
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.ocorrencias.map(o => `Sub ${o.subparcela}`),
                datasets: [{
                    label: 'Cobertura (%)',
                    data: data.ocorrencias.map(o => o.cobertura),
                    backgroundColor: 'rgba(72, 187, 120, 0.6)',
                    borderColor: 'rgb(72, 187, 120)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cobertura (%)'
                        }
                    }
                }
            }
        });
    },

    renderHeightChart() {
        const canvas = document.getElementById('height-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.currentSpeciesData;

        if (canvas.chart) {
            canvas.chart.destroy();
        }

        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.ocorrencias.map(o => `Sub ${o.subparcela}`),
                datasets: [{
                    label: 'Altura (cm)',
                    data: data.ocorrencias.map(o => o.altura),
                    backgroundColor: 'rgba(103, 126, 234, 0.2)',
                    borderColor: 'rgb(103, 126, 234)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Altura (cm)'
                        }
                    }
                }
            }
        });
    },

    renderPresenceMap() {
        const canvas = document.getElementById('presence-map');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.currentSpeciesData;

        // Criar mapa de presença visual
        const totalSubparcelas = appState.analysisResults.length;
        const presencaMap = new Array(totalSubparcelas).fill(0);

        data.ocorrencias.forEach(occ => {
            const index = occ.subparcela - 1;
            if (index >= 0 && index < totalSubparcelas) {
                presencaMap[index] = occ.cobertura;
            }
        });

        if (canvas.chart) {
            canvas.chart.destroy();
        }

        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: presencaMap.map((_, i) => `${i + 1}`),
                datasets: [{
                    label: 'Presença/Cobertura',
                    data: presencaMap,
                    backgroundColor: presencaMap.map(val =>
                        val > 0 ? `rgba(72, 187, 120, ${0.3 + (val / 100) * 0.7})` : 'rgba(200, 200, 200, 0.3)'
                    ),
                    borderColor: presencaMap.map(val =>
                        val > 0 ? 'rgb(72, 187, 120)' : 'rgb(200, 200, 200)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed.y;
                                return value > 0 ? `Cobertura: ${value.toFixed(1)}%` : 'Ausente';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Cobertura (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Subparcela'
                        }
                    }
                }
            }
        });
    },

    setupPhotoUpload() {
        const input = document.getElementById('photo-upload-input');
        const zone = document.getElementById('photo-upload-zone');

        if (!input || !zone) return;

        // Remover listeners antigos
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // Adicionar novo listener
        newInput.addEventListener('change', (e) => this.handlePhotoUpload(e.target.files));

        // Drag and drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            this.handlePhotoUpload(e.dataTransfer.files);
        });
    },

    async handlePhotoUpload(files) {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        formData.append('species', this.currentSpecies);

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                formData.append('photos', file);
            }
        }

        try {
            showAlert('info', 'Enviando fotos...');

            const response = await fetch(`/api/especies/${this.currentSpecies}/photos`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showAlert('success', `${result.uploaded} foto(s) enviada(s) com sucesso!`);
                this.uploadedPhotos = result.photos;

                // Re-renderizar aba de fotos
                document.getElementById('tab-photos').innerHTML = this.renderPhotosTab();
                this.setupPhotoUpload();
            } else {
                showAlert('error', result.error || 'Erro ao enviar fotos');
            }
        } catch (error) {
            showAlert('error', 'Erro ao enviar fotos: ' + error.message);
        }
    },

    viewPhoto(index) {
        const photo = this.uploadedPhotos[index];
        if (!photo) return;

        // Criar modal de visualização
        const viewer = document.createElement('div');
        viewer.className = 'photo-viewer-modal';
        viewer.innerHTML = `
            <div class="photo-viewer-overlay" onclick="this.parentElement.remove()"></div>
            <div class="photo-viewer-content">
                <button class="photo-viewer-close" onclick="this.parentElement.parentElement.remove()">✕</button>
                <img src="${photo.url}" alt="Foto ${index + 1}">
                <div class="photo-viewer-info">${photo.filename}</div>
            </div>
        `;
        document.body.appendChild(viewer);
    },

    async deletePhoto(index) {
        if (!confirm('Tem certeza que deseja remover esta foto?')) return;

        const photo = this.uploadedPhotos[index];

        try {
            const response = await fetch(`/api/especies/${this.currentSpecies}/photos/${photo.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('success', 'Foto removida com sucesso');
                this.uploadedPhotos.splice(index, 1);

                // Re-renderizar
                document.getElementById('tab-photos').innerHTML = this.renderPhotosTab();
                this.setupPhotoUpload();

                // Atualizar contador na aba
                const tab = document.querySelector('[data-tab="photos"]');
                if (tab) {
                    tab.innerHTML = `📷 Fotos (${this.uploadedPhotos.length})`;
                }
            } else {
                showAlert('error', result.error || 'Erro ao remover foto');
            }
        } catch (error) {
            showAlert('error', 'Erro ao remover foto: ' + error.message);
        }
    },

    async saveChanges(event) {
        event.preventDefault();

        const apelidoUsuario = document.getElementById('edit-apelido-usuario').value.trim();
        const genero = document.getElementById('edit-genero').value.trim();
        const especieNome = document.getElementById('edit-especie').value.trim();
        const familia = document.getElementById('edit-familia').value.trim();
        const linkFotos = document.getElementById('edit-link-fotos').value.trim();

        // Campos ecológicos
        const grupoSucessional = document.getElementById('edit-grupo-sucessional').value;
        const toleranciaSombra = document.getElementById('edit-tolerancia-sombra').value;
        const tipoDispersao = document.getElementById('edit-tipo-dispersao').value;
        const habitatPreferencial = document.getElementById('edit-habitat-preferencial').value.trim();

        if (!apelidoUsuario) {
            showAlert('error', 'Apelido personalizado é obrigatório');
            return;
        }

        try {
            const response = await fetch(`/api/especies/${this.currentSpecies}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apelido_usuario: apelidoUsuario,
                    genero,
                    especie: especieNome,
                    familia,
                    link_fotos: linkFotos,
                    observacoes: document.getElementById('edit-observacoes').value.trim(),
                    // Campos ecológicos
                    grupo_sucessional: grupoSucessional,
                    tolerancia_sombra: toleranciaSombra,
                    tipo_dispersao: tipoDispersao,
                    habitat_preferencial: habitatPreferencial
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('success', 'Alterações salvas com sucesso!');

                // Atualizar dados locais
                appState.especies[this.currentSpecies] = result.especie;

                // Atualizar todas as ocorrências
                appState.analysisResults.forEach(subparcela => {
                    subparcela.especies.forEach(esp => {
                        if (esp.apelido === this.currentSpecies) {
                            esp.apelido = apelidoUsuario;
                            esp.genero = genero;
                            esp.especie = especieNome;
                            esp.familia = familia;
                            esp.link_fotos = linkFotos;
                            esp.observacoes = result.especie.observacoes || esp.observacoes;
                            // Campos ecológicos
                            esp.grupo_sucessional = grupoSucessional;
                            esp.tolerancia_sombra = toleranciaSombra;
                            esp.tipo_dispersao = tipoDispersao;
                            esp.habitat_preferencial = habitatPreferencial;
                        }
                    });
                });

                // Recarregar dados e atualizar interface
                this.loadSpeciesData();
                this.renderContent();

                // Recalcular espécies unificadas
                if (typeof recalcularEspeciesUnificadas === 'function') {
                    recalcularEspeciesUnificadas();
                }

                // Atualizar tabela de gerenciamento se estiver visível
                if (typeof displaySpeciesTable === 'function') {
                    displaySpeciesTable();
                }
                if (typeof displaySubparcelas === 'function') {
                    displaySubparcelas();
                }
            } else {
                showAlert('error', result.error || 'Erro ao salvar alterações');
            }
        } catch (error) {
            showAlert('error', 'Erro ao salvar: ' + error.message);
        }
    },


    async deleteSpecies() {
        const data = this.currentSpeciesData;

        console.log('🗑️ deleteSpecies() chamado para:', data.apelido_usuario);
        console.log('📊 Dados da espécie:', data);

        if (!confirm(`Tem certeza que deseja remover completamente a espécie "${data.apelido_usuario}"?\n\nIsso removerá todas as ${data.totalOcorrencias} ocorrências em ${data.subparcelasPresenca.length} subparcela(s).\n\nEsta ação não pode ser desfeita!`)) {
            console.log('❌ Usuário cancelou a remoção');
            return;
        }

        console.log('✅ Usuário confirmou a remoção. Iniciando processo...');

        try {
            // Remover de cada subparcela
            for (const subparcela of data.subparcelasPresenca) {
                console.log(`📤 Removendo da subparcela ${subparcela}...`);

                const response = await fetch('/api/especies/remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parcela: appState.parcelaNome,
                        subparcela: subparcela,
                        apelido: this.currentSpecies
                    })
                });

                console.log(`📥 Resposta da subparcela ${subparcela}:`, response.status, response.statusText);

                if (!response.ok) {
                    throw new Error(`Erro ao remover da subparcela ${subparcela}`);
                }
            }

            console.log('✅ Espécie removida de todas as subparcelas com sucesso!');
            showAlert('success', 'Espécie removida completamente com sucesso!');

            // Recarregar dados
            console.log('🔄 Recarregando dados...');
            await refreshData();

            // Recalcular espécies unificadas
            console.log('🔢 Recalculando espécies unificadas...');
            if (typeof recalcularEspeciesUnificadas === 'function') {
                recalcularEspeciesUnificadas();
            }

            // Fechar modal
            console.log('🚪 Fechando modal...');
            this.close();

            // Atualizar tabelas
            console.log('📊 Atualizando tabelas...');
            if (typeof displaySpeciesTable === 'function') {
                displaySpeciesTable();
            }
            if (typeof displaySubparcelas === 'function') {
                displaySubparcelas();
            }
        } catch (error) {
            console.error('❌ Erro ao remover espécie:', error);
            showAlert('error', 'Erro ao remover espécie: ' + error.message);
        }
    }
};

// Tornar disponível globalmente
window.SpeciesDetailsModal = SpeciesDetailsModal;
