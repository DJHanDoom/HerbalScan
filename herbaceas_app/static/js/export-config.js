// Modal de Configuração da Exportação em PDF
// PEDIDO: "Inclua um modal de configuração da exportação que altera fatores
// de design, dados incluídos, metadados, etc" - antes o botão "Exportar
// PDF" gerava o relatório direto, sempre com tudo, sem escolha. Agora abre
// este modal primeiro; a configuração persiste em localStorage (mesmo
// padrão de PromptConfig) e é lida por exportToPDF() em app.js.

const ExportConfig = {
    STORAGE_KEY: 'pdfExportConfig',

    defaults() {
        return {
            orientation: 'landscape',
            include_logo: true,
            include_cover: true,
            include_summary: true,
            include_subparcelas: true,
            include_field_metadata: true,
            include_species_table: true,
            include_species_sheets: true,
            include_analytics: true,
        };
    },

    getSavedConfig() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? { ...this.defaults(), ...JSON.parse(saved) } : this.defaults();
        } catch (e) {
            return this.defaults();
        }
    },

    saveConfig(config) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
        } catch (e) { /* localStorage indisponível - segue sem persistir */ }
    },

    createModal() {
        if (document.getElementById('export-config-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'export-config-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content export-config-content">
                <span class="close" onclick="ExportConfig.close()">&times;</span>
                <h2>📄 Configurar Exportação em PDF</h2>
                <p class="export-config-intro">Escolha o que entra no relatório e como ele é formatado. Sua escolha fica salva para a próxima exportação.</p>

                <div class="export-config-group">
                    <h3>🎨 Design</h3>
                    <div class="export-config-row">
                        <label>Orientação da página:</label>
                        <select id="export-orientation">
                            <option value="landscape">Paisagem (recomendado - gráficos e fotos largas)</option>
                            <option value="portrait">Retrato</option>
                        </select>
                    </div>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-logo">
                        Exibir título "HerbalScan" na capa
                    </label>
                </div>

                <div class="export-config-group">
                    <h3>📋 Conteúdo</h3>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-cover">
                        Capa (nome da parcela, contagens, data)
                    </label>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-summary">
                        Resumo geral (índices de diversidade)
                    </label>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-subparcelas">
                        Fotos das subparcelas com polígonos
                    </label>
                    <label class="export-config-check export-config-sub">
                        <input type="checkbox" id="export-include-field-metadata">
                        ↳ Incluir metadados de campo (município/UF/bioma/coordenadas/data)
                    </label>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-species-table">
                        Tabela de gerenciamento de espécies
                    </label>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-species-sheets">
                        Ficha detalhada de cada espécie (estatísticas, ocorrências, fotos de referência)
                    </label>
                    <label class="export-config-check">
                        <input type="checkbox" id="export-include-analytics">
                        Análises avançadas (todos os gráficos)
                    </label>
                </div>

                <div class="form-actions">
                    <button class="btn btn-success" onclick="ExportConfig.generate()">📄 Gerar PDF</button>
                    <button class="btn btn-secondary" onclick="ExportConfig.close()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Indentar visualmente o item "sub" (metadados de campo, dependente
        // de subparcelas) sem precisar de mais uma classe utilitária
        const subLabel = modal.querySelector('.export-config-sub');
        if (subLabel) subLabel.style.marginLeft = '26px';
    },

    applyConfigToInputs(config) {
        const setVal = (id, value) => { const el = document.getElementById(id); if (el) el.value = value; };
        const setChecked = (id, value) => { const el = document.getElementById(id); if (el) el.checked = value; };

        setVal('export-orientation', config.orientation);
        setChecked('export-include-logo', config.include_logo);
        setChecked('export-include-cover', config.include_cover);
        setChecked('export-include-summary', config.include_summary);
        setChecked('export-include-subparcelas', config.include_subparcelas);
        setChecked('export-include-field-metadata', config.include_field_metadata);
        setChecked('export-include-species-table', config.include_species_table);
        setChecked('export-include-species-sheets', config.include_species_sheets);
        setChecked('export-include-analytics', config.include_analytics);
    },

    readConfigFromInputs() {
        const getChecked = (id) => document.getElementById(id)?.checked !== false;
        return {
            orientation: document.getElementById('export-orientation')?.value || 'landscape',
            include_logo: getChecked('export-include-logo'),
            include_cover: getChecked('export-include-cover'),
            include_summary: getChecked('export-include-summary'),
            include_subparcelas: getChecked('export-include-subparcelas'),
            include_field_metadata: getChecked('export-include-field-metadata'),
            include_species_table: getChecked('export-include-species-table'),
            include_species_sheets: getChecked('export-include-species-sheets'),
            include_analytics: getChecked('export-include-analytics'),
        };
    },

    open() {
        this.createModal();
        this.applyConfigToInputs(this.getSavedConfig());
        document.getElementById('export-config-modal').classList.add('active');
    },

    close() {
        const modal = document.getElementById('export-config-modal');
        if (modal) modal.classList.remove('active');
    },

    async generate() {
        const config = this.readConfigFromInputs();
        this.saveConfig(config);
        this.close();
        if (typeof exportToPDF === 'function') {
            await exportToPDF(config);
        }
    },
};

document.addEventListener('DOMContentLoaded', () => ExportConfig.createModal());
