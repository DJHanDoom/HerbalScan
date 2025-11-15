// Gerenciamento de Análises Salvas

const AnalysisManager = {
    currentParcela: null,
    
    init() {
        this.createUI();
    },
    
    createUI() {
        // Injetar estilos do modal de salvar
        this.injectSaveModalStyles();
        
        // Adicionar botões na seção de exportação
        const exportSection = document.getElementById('export-section');
        if (!exportSection) return;
        
        // Criar container de botões se não existir
        let btnContainer = exportSection.querySelector('.analysis-controls');
        if (!btnContainer) {
            btnContainer = document.createElement('div');
            btnContainer.className = 'analysis-controls';
            btnContainer.style.cssText = 'display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;';
            
            // Inserir antes do botão de exportar
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportSection.insertBefore(btnContainer, exportBtn);
            } else {
                exportSection.insertBefore(btnContainer, exportSection.firstChild);
            }
        }
        
        // Botões agora estão no footer fixo, não precisamos criar dinamicamente
        /*
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-secondary';
        saveBtn.innerHTML = '💾 Salvar Análise';
        saveBtn.onclick = () => this.showSaveDialog();
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-secondary';
        loadBtn.innerHTML = '📂 Carregar Análise';
        loadBtn.onclick = () => this.showLoadDialog();
        
        const exportZipBtn = document.createElement('button');
        exportZipBtn.className = 'btn btn-success';
        exportZipBtn.innerHTML = '📦 Exportar ZIP Completo';
        exportZipBtn.onclick = () => this.exportCompleteZip();
        exportZipBtn.title = 'Exportar análise completa com imagens em arquivo ZIP';
        
        const importZipBtn = document.createElement('button');
        importZipBtn.className = 'btn btn-info';
        importZipBtn.innerHTML = '📥 Importar Projeto';
        importZipBtn.onclick = () => this.importCompleteZip();
        importZipBtn.title = 'Importar projeto completo de arquivo ZIP';
        
        btnContainer.appendChild(saveBtn);
        btnContainer.appendChild(loadBtn);
        btnContainer.appendChild(exportZipBtn);
        btnContainer.appendChild(importZipBtn);
        */
    },
    
    async showSaveDialog() {
        // Verificar se há análise atual
        if (!appState.parcelaNome || appState.analysisResults.length === 0) {
            alert('Nenhuma análise em andamento para salvar');
            return;
        }
        
        // Criar modal para salvar análise
        const saveModal = document.createElement('div');
        saveModal.className = 'save-analysis-modal';
        saveModal.innerHTML = `
            <div class="save-analysis-overlay" onclick="AnalysisManager.closeSaveModal()"></div>
            <div class="save-analysis-dialog">
                <div class="save-analysis-header">
                    <h3>💾 Salvar Análise</h3>
                    <button onclick="AnalysisManager.closeSaveModal()">×</button>
                </div>
                <div class="save-analysis-body">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">
                            Nome da Análise *
                        </label>
                        <input type="text" id="save-analysis-name" placeholder="Ex: Parcela 9 - Análise Preliminar"
                               style="width: 100%; padding: 10px; background: #1a202c; border: 2px solid #4a5568; border-radius: 6px; color: white; font-size: 1rem;">
                    </div>
                    <div style="padding: 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 0.9rem; color: #93c5fd;">
                            <strong>ℹ️ Informação:</strong> Esta análise salvará:
                        </p>
                        <ul style="margin: 8px 0 0 20px; font-size: 0.85rem; color: #93c5fd;">
                            <li>${appState.analysisResults.length} subparcelas analisadas</li>
                            <li>${Object.keys(appState.especies || {}).length} espécies identificadas</li>
                            <li>Todas as edições manuais realizadas</li>
                            <li>Configurações do prompt utilizadas</li>
                        </ul>
                    </div>
                </div>
                <div class="save-analysis-footer">
                    <button class="btn-config btn-config-secondary" onclick="AnalysisManager.closeSaveModal()">
                        Cancelar
                    </button>
                    <button class="btn-config btn-config-success" onclick="AnalysisManager.confirmSaveAnalysis()">
                        💾 Salvar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(saveModal);
        
        // Focus no input
        setTimeout(() => {
            document.getElementById('save-analysis-name').focus();
        }, 100);
    },
    
    closeSaveModal() {
        const modal = document.querySelector('.save-analysis-modal');
        if (modal) modal.remove();
    },
    
    injectSaveModalStyles() {
        // Evitar duplicar estilos
        if (document.getElementById('save-analysis-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'save-analysis-modal-styles';
        style.textContent = `
            /* Save Analysis Modal */
            .save-analysis-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease-out;
            }
            
            .save-analysis-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            
            .save-analysis-dialog {
                position: relative;
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease-out;
            }
            
            .save-analysis-header {
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                padding: 20px 24px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .save-analysis-header h3 {
                margin: 0;
                color: white;
                font-size: 1.3rem;
                font-weight: 600;
            }
            
            .save-analysis-header button {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 1.5rem;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .save-analysis-header button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .save-analysis-body {
                padding: 24px;
            }
            
            .save-analysis-body label {
                display: block;
                color: #e2e8f0;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 0.95rem;
            }
            
            .save-analysis-body input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-size: 1rem;
                box-sizing: border-box;
                transition: all 0.2s;
            }
            
            .save-analysis-body input:focus {
                outline: none;
                border-color: rgba(102, 126, 234, 0.6);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .save-analysis-info {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 8px;
                padding: 12px 16px;
                margin-top: 16px;
            }
            
            .save-analysis-info ul {
                margin: 8px 0 0 0;
                padding-left: 20px;
                color: #94a3b8;
            }
            
            .save-analysis-info ul li {
                margin: 4px 0;
            }
            
            .save-analysis-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    async confirmSaveAnalysis() {
        const name = document.getElementById('save-analysis-name').value.trim();
        
        if (!name) {
            alert('Por favor, digite um nome para a análise');
            return;
        }
        
        try {
            const config = typeof PromptConfig !== 'undefined' ? PromptConfig.getSavedConfig() : {};
            
            const response = await fetch('/api/analysis/save', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: name,
                    parcela: appState.parcelaNome,
                    config: config
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.closeSaveModal();
                alert(`✓ Análise "${name}" salva com sucesso!`);
            } else {
                alert('Erro: ' + (result.error || 'Erro ao salvar análise'));
            }
        } catch (error) {
            console.error('Erro ao salvar análise:', error);
            alert('Erro ao salvar análise: ' + error.message);
        }
    },
    
    async showLoadDialog() {
        try {
            // Buscar lista de análises salvas
            const response = await fetch('/api/analysis/list');
            const data = await response.json();
            
            if (!data.analyses || data.analyses.length === 0) {
                alert('Nenhuma análise salva encontrada');
                return;
            }
            
            // Criar modal para seleção
            this.createLoadModal(data.analyses);
            
        } catch (error) {
            console.error('Erro ao carregar lista de análises:', error);
            alert('Erro ao carregar lista de análises');
        }
    },
    
    createLoadModal(analyses) {
        // Remover modal existente se houver
        const existingModal = document.getElementById('analysis-load-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'analysis-load-modal';
        modal.className = 'analysis-modal';
        modal.innerHTML = `
            <div class="analysis-modal-content">
                <div class="analysis-modal-header">
                    <h2>📂 Carregar Análise Salva</h2>
                    <button class="analysis-modal-close" onclick="AnalysisManager.closeLoadModal()">×</button>
                </div>
                <div class="analysis-modal-body">
                    <div class="analysis-list">
                        ${analyses.map(analysis => `
                            <div class="analysis-item" data-filename="${analysis.filename}">
                                <div class="analysis-item-header">
                                    <h3>${analysis.name}</h3>
                                    <button class="btn-delete-analysis" onclick="AnalysisManager.deleteAnalysis('${analysis.filename}')" title="Deletar">
                                        🗑️
                                    </button>
                                </div>
                                <div class="analysis-item-info">
                                    <span><strong>Parcela:</strong> ${analysis.parcela}</span>
                                    <span><strong>Subparcelas:</strong> ${analysis.num_subparcelas}</span>
                                    <span><strong>Espécies:</strong> ${analysis.num_especies}</span>
                                    <span><strong>Imagens:</strong> ${analysis.num_images}</span>
                                    <span><strong>Salva em:</strong> ${new Date(analysis.saved_at).toLocaleString('pt-BR')}</span>
                                </div>
                                <button class="btn-load-analysis" onclick="AnalysisManager.loadAnalysis('${analysis.filename}')">
                                    Carregar Análise
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="analysis-modal-footer">
                    <button class="btn-secondary" onclick="AnalysisManager.closeLoadModal()">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar estilos se necessário
        if (!document.getElementById('analysis-manager-styles')) {
            this.addStyles();
        }
    },
    
    addStyles() {
        const style = document.createElement('style');
        style.id = 'analysis-manager-styles';
        style.textContent = `
            .analysis-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease;
            }
            
            .analysis-modal-content {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border-radius: 16px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            .analysis-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .analysis-modal-header h2 {
                margin: 0;
                color: white;
                font-size: 1.5rem;
            }
            
            .analysis-modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                transition: background 0.2s;
            }
            
            .analysis-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .analysis-modal-body {
                padding: 20px 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .analysis-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .analysis-item {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
                transition: all 0.3s;
            }
            
            .analysis-item:hover {
                border-color: rgba(59, 130, 246, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
            }
            
            .analysis-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .analysis-item-header h3 {
                margin: 0;
                color: white;
                font-size: 1.2rem;
            }
            
            .btn-delete-analysis {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #ef4444;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s;
            }
            
            .btn-delete-analysis:hover {
                background: rgba(239, 68, 68, 0.3);
                transform: scale(1.1);
            }
            
            .analysis-item-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .analysis-item-info span {
                color: #94a3b8;
                font-size: 0.9rem;
            }
            
            .analysis-item-info strong {
                color: #e2e8f0;
            }
            
            .btn-load-analysis {
                width: 100%;
                padding: 10px;
                background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .btn-load-analysis:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
            }
            
            .analysis-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: flex-end;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    closeLoadModal() {
        const modal = document.getElementById('analysis-load-modal');
        if (modal) modal.remove();
    },
    
    async loadAnalysis(filename) {
        try {
            showAlert('info', 'Carregando análise...');
            
            // Restaurar análise
            const restoreResponse = await fetch('/api/analysis/restore', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ filename })
            });
            
            const restoreResult = await restoreResponse.json();
            
            if (restoreResult.success) {
                this.closeLoadModal();
                showAlert('success', 'Análise carregada! Recarregando página...');
                
                // Recarregar página para exibir dados
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showAlert('error', restoreResult.error || 'Erro ao carregar análise');
            }
        } catch (error) {
            console.error('Erro ao carregar análise:', error);
            showAlert('error', 'Erro ao carregar análise');
        }
    },
    
    async deleteAnalysis(filename) {
        if (!confirm('Tem certeza que deseja deletar esta análise?')) return;
        
        try {
            const response = await fetch(`/api/analysis/delete/${filename}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Análise deletada com sucesso');
                // Atualizar lista
                this.showLoadDialog();
            } else {
                alert(result.error || 'Erro ao deletar análise');
            }
        } catch (error) {
            console.error('Erro ao deletar análise:', error);
            alert('Erro ao deletar análise');
        }
    },
    
    async exportCompleteZip() {
        if (!appState.parcelaNome || appState.analysisResults.length === 0) {
            alert('Nenhuma análise em andamento para exportar');
            return;
        }
        
        try {
            showAlert('info', 'Gerando arquivo ZIP... Isso pode levar alguns segundos.');
            
            const response = await fetch('/api/analysis/export-complete', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ parcela: appState.parcelaNome })
            });
            
            if (response.ok) {
                // Download do arquivo
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${appState.parcelaNome}_${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                showAlert('success', 'Arquivo ZIP exportado com sucesso! Contém todos os dados e imagens.');
            } else {
                const error = await response.json();
                alert('Erro: ' + (error.error || 'Erro ao exportar'));
            }
        } catch (error) {
            console.error('Erro ao exportar ZIP:', error);
            alert('Erro ao exportar ZIP: ' + error.message);
        }
    },
    
    importCompleteZip() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                showNotification('📥 Importando projeto completo... Aguarde...', 'info');
                
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch('/api/analysis/import-complete', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(`✅ Projeto "${result.parcela}" importado! Restaurando interface...`, 'success');
                    
                    // Restaurar estado completo da aplicação
                    appState.parcelaNome = result.parcela;
                    appState.analysisResults = result.analysis_results || [];
                    appState.uploadedFiles = result.subparcelas || [];
                    
                    // Restaurar espécies
                    appState.especies = {};
                    appState.especiesUnificadas = result.especies || {};
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
                    
                    console.log('✅ Estado restaurado:', {
                        parcela: appState.parcelaNome,
                        subparcelas: appState.analysisResults.length,
                        especies: Object.keys(appState.especies).length
                    });
                    
                    // Atualizar campo de nome da parcela
                    const parcelaInput = document.getElementById('parcela-name');
                    if (parcelaInput) {
                        parcelaInput.value = appState.parcelaNome;
                    }
                    
                    // Mostrar todas as seções
                    elements.analysisSection.style.display = 'block';
                    elements.speciesSection.style.display = 'block';
                    if (elements.analyticsSection) {
                        elements.analyticsSection.style.display = 'block';
                    }
                    if (elements.exportFooter) {
                        elements.exportFooter.style.display = 'block';
                    }
                    
                    // Renderizar interface completa
                    displayResults();
                    
                    // Atualizar lista de análises salvas
                    this.listSavedAnalyses();
                    
                    showNotification(`🎉 Projeto completo importado! ${appState.analysisResults.length} subparcelas, ${Object.keys(appState.especies).length} espécies.`, 'success');
                    
                } else {
                    showNotification('❌ Erro ao importar projeto: ' + (result.error || 'Erro desconhecido'), 'error');
                }
            } catch (error) {
                console.error('Erro ao importar projeto:', error);
                showNotification('❌ Erro ao importar projeto: ' + error.message, 'error');
            }
        };
        
        input.click();
    }
};

// Inicializar quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnalysisManager.init());
} else {
    AnalysisManager.init();
}
