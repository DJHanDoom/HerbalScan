/**
 * Gerenciador de Espécies de Referência
 * Permite adicionar, editar e remover espécies que serão incluídas no prompt como referência
 */

const ReferenceSpeciesManager = {
    species: [],
    
    init() {
        this.loadSpecies();
    },
    
    async loadSpecies() {
        try {
            const response = await fetch('/api/reference-species');
            const data = await response.json();
            this.species = data.species || [];
            console.log(`✓ ${this.species.length} espécies de referência carregadas`);
        } catch (error) {
            console.error('Erro ao carregar espécies de referência:', error);
            this.species = [];
        }
    },
    
    open() {
        this.createModal();
        this.renderSpeciesList();
    },
    
    close() {
        const modal = document.getElementById('reference-species-modal');
        if (modal) modal.remove();
    },
    
    createModal() {
        // Remover modal existente
        this.close();
        
        const modal = document.createElement('div');
        modal.id = 'reference-species-modal';
        modal.className = 'reference-species-modal';
        modal.innerHTML = `
            <div class="reference-species-container">
                <div class="reference-species-header">
                    <h2>📚 Gerenciar Espécies de Referência</h2>
                    <button class="reference-species-close" onclick="ReferenceSpeciesManager.close()">×</button>
                </div>
                
                <div class="reference-species-info">
                    <p>🎯 <strong>Objetivo:</strong> Estas espécies serão incluídas no prompt como referência para padronizar apelidos entre subparcelas.</p>
                    <p>💡 <strong>Dica:</strong> Adicione morfotipos comuns da sua área de estudo para melhorar a consistência das análises.</p>
                </div>
                
                <div class="reference-species-body">
                    <div class="reference-species-form">
                        <h3>➕ Adicionar Nova Espécie</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ref-apelido">Apelido: *</label>
                                <input type="text" id="ref-apelido" placeholder="Ex: Gramínea Cespitosa Verde-Claro" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ref-familia">Família:</label>
                                <input type="text" id="ref-familia" placeholder="Ex: Poaceae">
                            </div>
                            
                            <div class="form-group">
                                <label for="ref-genero">Gênero:</label>
                                <input type="text" id="ref-genero" placeholder="Ex: Paspalum">
                            </div>
                            
                            <div class="form-group">
                                <label for="ref-especie">Espécie:</label>
                                <input type="text" id="ref-especie" placeholder="Ex: notatum">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="ref-observacoes">Descrição Morfológica:</label>
                            <textarea id="ref-observacoes" rows="3" placeholder="Ex: Gramínea em touceiras densas, folhas lineares muito finas (<2mm), caules cilíndricos, cor verde-claro com leve tonalidade amarelada, textura lisa e glabra, altura 25-35cm"></textarea>
                        </div>
                        
                        <button class="btn-add-species" onclick="ReferenceSpeciesManager.addSpecies()">
                            ➕ Adicionar Espécie
                        </button>
                    </div>
                    
                    <div class="reference-species-list">
                        <div class="list-header">
                            <h3>📋 Espécies Cadastradas (<span id="species-count">0</span>)</h3>
                            <button class="btn-import" onclick="ReferenceSpeciesManager.showImportDialog()" title="Importar JSON">
                                📥 Importar
                            </button>
                            <button class="btn-export" onclick="ReferenceSpeciesManager.exportSpecies()" title="Exportar JSON">
                                📤 Exportar
                            </button>
                        </div>
                        <div id="species-list-container"></div>
                    </div>
                </div>
                
                <div class="reference-species-footer">
                    <button class="btn-config btn-config-secondary" onclick="ReferenceSpeciesManager.close()">
                        Fechar
                    </button>
                    <button class="btn-config btn-config-success" onclick="ReferenceSpeciesManager.saveAndClose()">
                        💾 Salvar e Fechar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.injectStyles();
    },
    
    renderSpeciesList() {
        const container = document.getElementById('species-list-container');
        const countSpan = document.getElementById('species-count');
        
        if (!container) return;
        
        countSpan.textContent = this.species.length;
        
        if (this.species.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhuma espécie cadastrada ainda.</div>';
            return;
        }
        
        container.innerHTML = this.species.map((sp, index) => `
            <div class="species-card">
                <div class="species-card-header">
                    <strong>${sp.apelido}</strong>
                    <button class="btn-delete-species" onclick="ReferenceSpeciesManager.deleteSpecies(${index})" title="Remover">
                        🗑️
                    </button>
                </div>
                <div class="species-card-body">
                    ${sp.familia ? `<div><strong>Família:</strong> ${sp.familia}</div>` : ''}
                    ${sp.genero ? `<div><strong>Gênero:</strong> ${sp.genero}</div>` : ''}
                    ${sp.especie ? `<div><strong>Espécie:</strong> ${sp.especie}</div>` : ''}
                    ${sp.observacoes ? `<div class="species-obs"><strong>Descrição:</strong> ${sp.observacoes}</div>` : ''}
                </div>
            </div>
        `).join('');
    },
    
    addSpecies() {
        const apelido = document.getElementById('ref-apelido').value.trim();
        
        if (!apelido) {
            alert('Por favor, preencha o campo "Apelido"');
            return;
        }
        
        const newSpecies = {
            apelido: apelido,
            familia: document.getElementById('ref-familia').value.trim(),
            genero: document.getElementById('ref-genero').value.trim(),
            especie: document.getElementById('ref-especie').value.trim(),
            observacoes: document.getElementById('ref-observacoes').value.trim()
        };
        
        this.species.push(newSpecies);
        
        // Limpar formulário
        document.getElementById('ref-apelido').value = '';
        document.getElementById('ref-familia').value = '';
        document.getElementById('ref-genero').value = '';
        document.getElementById('ref-especie').value = '';
        document.getElementById('ref-observacoes').value = '';
        
        this.renderSpeciesList();
        
        // Feedback visual
        const btn = document.querySelector('.btn-add-species');
        btn.textContent = '✓ Adicionado!';
        btn.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        setTimeout(() => {
            btn.textContent = '➕ Adicionar Espécie';
            btn.style.background = '';
        }, 1500);
    },
    
    deleteSpecies(index) {
        const species = this.species[index];
        if (confirm(`Remover "${species.apelido}"?`)) {
            this.species.splice(index, 1);
            this.renderSpeciesList();
        }
    },
    
    async saveAndClose() {
        try {
            const response = await fetch('/api/reference-species', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ species: this.species })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`✓ ${this.species.length} espécies salvas com sucesso!`);
                this.close();
            } else {
                alert('Erro: ' + (result.error || 'Erro ao salvar espécies'));
            }
        } catch (error) {
            console.error('Erro ao salvar espécies:', error);
            alert('Erro ao salvar espécies: ' + error.message);
        }
    },
    
    exportSpecies() {
        if (this.species.length === 0) {
            alert('Nenhuma espécie para exportar');
            return;
        }
        
        const dataStr = JSON.stringify({ species: this.species }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `reference_species_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        alert(`✓ ${this.species.length} espécies exportadas!`);
    },
    
    showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!data.species || !Array.isArray(data.species)) {
                    alert('Formato de arquivo inválido');
                    return;
                }
                
                if (confirm(`Importar ${data.species.length} espécies? Isso substituirá a lista atual.`)) {
                    this.species = data.species;
                    this.renderSpeciesList();
                    alert(`✓ ${this.species.length} espécies importadas!`);
                }
            } catch (error) {
                alert('Erro ao importar arquivo: ' + error.message);
            }
        };
        
        input.click();
    },
    
    injectStyles() {
        if (document.getElementById('reference-species-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'reference-species-styles';
        style.textContent = `
            .reference-species-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease-out;
            }
            
            .reference-species-container {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease-out;
            }
            
            .reference-species-header {
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                padding: 20px 24px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .reference-species-header h2 {
                margin: 0;
                color: white;
                font-size: 1.4rem;
            }
            
            .reference-species-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 1.5rem;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .reference-species-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .reference-species-info {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                padding: 16px;
                margin: 20px 24px;
                border-radius: 8px;
                color: #e2e8f0;
            }
            
            .reference-species-info p {
                margin: 8px 0;
            }
            
            .reference-species-body {
                padding: 0 24px;
                overflow-y: auto;
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
            
            .reference-species-form {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;
            }
            
            .reference-species-form h3 {
                margin: 0 0 16px 0;
                color: #e2e8f0;
                font-size: 1.1rem;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
                margin-bottom: 12px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
            }
            
            .form-group label {
                color: #cbd5e1;
                font-size: 0.9rem;
                margin-bottom: 6px;
                font-weight: 500;
            }
            
            .form-group input,
            .form-group textarea {
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 10px;
                color: white;
                font-size: 0.95rem;
                transition: all 0.2s;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: rgba(102, 126, 234, 0.6);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .btn-add-species {
                width: 100%;
                padding: 12px;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 12px;
                transition: all 0.2s;
            }
            
            .btn-add-species:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
            }
            
            .reference-species-list {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            
            .list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .list-header h3 {
                margin: 0;
                color: #e2e8f0;
                font-size: 1.1rem;
            }
            
            .btn-import,
            .btn-export {
                padding: 8px 16px;
                background: rgba(59, 130, 246, 0.2);
                border: 1px solid rgba(59, 130, 246, 0.5);
                color: #60a5fa;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            
            .btn-import:hover,
            .btn-export:hover {
                background: rgba(59, 130, 246, 0.3);
                transform: translateY(-1px);
            }
            
            #species-list-container {
                flex: 1;
                overflow-y: auto;
                max-height: 400px;
            }
            
            .species-card {
                background: rgba(30, 41, 59, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 10px;
                transition: all 0.2s;
            }
            
            .species-card:hover {
                border-color: rgba(102, 126, 234, 0.5);
                transform: translateX(4px);
            }
            
            .species-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                color: #e2e8f0;
            }
            
            .species-card-body {
                color: #94a3b8;
                font-size: 0.9rem;
            }
            
            .species-card-body div {
                margin: 4px 0;
            }
            
            .species-obs {
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-style: italic;
            }
            
            .btn-delete-species {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #ef4444;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s;
            }
            
            .btn-delete-species:hover {
                background: rgba(239, 68, 68, 0.3);
                transform: scale(1.1);
            }
            
            .empty-state {
                text-align: center;
                color: #64748b;
                padding: 40px;
                font-style: italic;
            }
            
            .reference-species-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
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
    }
};

// Inicializar quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReferenceSpeciesManager.init());
} else {
    ReferenceSpeciesManager.init();
}
