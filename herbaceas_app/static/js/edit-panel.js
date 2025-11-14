// Sistema de Painel Lateral de Edição
let currentEditContext = null;

function openEditPanel(title, contentHTML, onSave) {
    const panel = document.getElementById('edit-panel');
    const overlay = document.getElementById('edit-panel-overlay');
    const titleEl = document.getElementById('edit-panel-title');
    const bodyEl = document.getElementById('edit-panel-body');
    const saveBtn = document.getElementById('edit-panel-save');

    console.log('📝 openEditPanel chamado:', { title, hasSaveBtn: !!saveBtn, hasOnSave: !!onSave });

    if (!saveBtn) {
        console.error('❌ Botão Salvar não encontrado no DOM!');
        return;
    }

    titleEl.textContent = title;
    bodyEl.innerHTML = contentHTML;

    // Remover listeners antigos clonando o botão
    const newSaveBtn = saveBtn.cloneNode(true);
    newSaveBtn.id = 'edit-panel-save'; // Garantir que o ID seja mantido
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
    console.log('🔄 Botão clonado, ID:', newSaveBtn.id, 'Parent:', newSaveBtn.parentNode.className);

    // Configurar callback de salvamento
    newSaveBtn.onclick = () => {
        console.log('💾 Botão Salvar clicado!');
        if (onSave) {
            console.log('✅ Executando callback onSave...');
            onSave();
        } else {
            console.error('❌ Nenhum callback onSave definido!');
        }
    };
    
    console.log('✅ Event listener anexado ao botão Salvar (onclick)');
    
    // Teste adicional: verificar se o botão está realmente no DOM e clicável
    setTimeout(() => {
        const btnTest = document.getElementById('edit-panel-save');
        console.log('🧪 Teste do botão após timeout:', {
            existe: !!btnTest,
            visivel: btnTest ? window.getComputedStyle(btnTest).display !== 'none' : false,
            pointer: btnTest ? window.getComputedStyle(btnTest).pointerEvents : 'N/A'
        });
    }, 500);

    // Mostrar painel
    panel.classList.add('active');
    overlay.classList.add('active');

    // Focar no primeiro input
    const firstInput = bodyEl.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
}

function closeEditPanel() {
    const panel = document.getElementById('edit-panel');
    const overlay = document.getElementById('edit-panel-overlay');

    panel.classList.remove('active');
    overlay.classList.remove('active');
    currentEditContext = null;
}

// Fechar ao clicar no overlay
document.getElementById('edit-panel-overlay').addEventListener('click', closeEditPanel);

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('edit-panel').classList.contains('active')) {
        closeEditPanel();
    }
});

// Editar Espécie Global (substitui modal antigo)
function editSpecies(apelidoOriginal) {
    const especie = appState.especies[apelidoOriginal];

    if (!especie) {
        showAlert('error', 'Espécie não encontrada');
        return;
    }

    const formHTML = `
        <div class="especie-card expanded">
            <div class="especie-card-content">
                <div class="especie-edit-grid">
                    <div class="especie-edit-field">
                        <label>Apelido Original</label>
                        <input type="text" value="${especie.apelido_original}" disabled>
                    </div>

                    <div class="especie-edit-field">
                        <label>Nº de Ocorrências</label>
                        <input type="text" value="${especie.ocorrencias}" disabled>
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>Apelido Personalizado *</label>
                        <input type="text" id="edit-apelido-usuario" value="${especie.apelido_usuario}"
                               placeholder="Digite o apelido que preferir">
                    </div>

                    <div class="especie-edit-field">
                        <label>Gênero</label>
                        <input type="text" id="edit-genero" value="${especie.genero || ''}"
                               placeholder="Ex: Paspalum">
                    </div>

                    <div class="especie-edit-field">
                        <label>Espécie</label>
                        <input type="text" id="edit-especie" value="${especie.especie || ''}"
                               placeholder="Ex: notatum">
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>Família</label>
                        <input type="text" id="edit-familia" value="${especie.familia || ''}"
                               placeholder="Ex: Poaceae">
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>🔗 Link das Fotos (URL)</label>
                        <input type="url" id="edit-link-fotos" value="${especie.link_fotos || ''}"
                               placeholder="https://exemplo.com/fotos-da-especie">
                        <small style="color: #718096; margin-top: 4px;">Cole o link para fotos de referência da espécie</small>
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #f7fafc; border-radius: 8px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #4a5568;">
                        <strong>💡 Dica:</strong> As alterações serão aplicadas em todas as ${especie.ocorrencias}
                        ocorrências desta espécie.
                    </p>
                </div>
            </div>
        </div>
    `;

    currentEditContext = { type: 'global', apelidoOriginal };

    openEditPanel(`Editar ${especie.apelido_original}`, formHTML, async () => {
        const apelidoUsuario = document.getElementById('edit-apelido-usuario').value.trim();
        const genero = document.getElementById('edit-genero').value.trim();
        const especieNome = document.getElementById('edit-especie').value.trim();
        const familia = document.getElementById('edit-familia').value.trim();
        const linkFotos = document.getElementById('edit-link-fotos').value.trim();

        if (!apelidoUsuario) {
            showAlert('error', 'Apelido personalizado é obrigatório');
            return;
        }

        try {
            const response = await fetch(`/api/especies/${encodeURIComponent(apelidoOriginal)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apelido_usuario: apelidoUsuario,
                    genero,
                    especie: especieNome,
                    familia,
                    link_fotos: linkFotos
                })
            });

            const result = await response.json();

            if (result.success) {
                // Atualizar appState.especies
                appState.especies[apelidoOriginal] = result.especie;
                
                // 🔧 FIX: Propagar TODAS as alterações (incluindo apelido_usuario e link_fotos) para subparcelas
                appState.analysisResults.forEach(subparcela => {
                    subparcela.especies.forEach(esp => {
                        if (esp.apelido === apelidoOriginal) {
                            // Atualizar apelido exibido
                            esp.apelido = apelidoUsuario;
                            // Atualizar dados taxonômicos
                            esp.genero = genero;
                            esp.especie = especieNome;
                            esp.familia = familia;
                            esp.link_fotos = linkFotos;
                        }
                    });
                });
                
                displaySpeciesTable();  // Atualiza tabela 3 (gerenciamento)
                displaySubparcelas();   // Atualiza tabela de subparcelas na home
                closeEditPanel();
                showAlert('success', 'Espécie atualizada em todas as subparcelas!');
            } else {
                showAlert('error', result.error || 'Erro ao atualizar');
            }
        } catch (error) {
            showAlert('error', 'Erro: ' + error.message);
        }
    });
}

// Editar Espécie em Subparcela Específica
function editSubparcelaEspeciePanel(subparcela, apelido) {
    const especies = appState.analysisResults.find(r => r.subparcela === subparcela)?.especies || [];
    const especie = especies.find(e => e.apelido === apelido);

    if (!especie) {
        showAlert('error', 'Espécie não encontrada');
        return;
    }

    const formHTML = `
        <div class="especie-card expanded">
            <div class="especie-card-content">
                <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #667eea;">Subparcela ${subparcela}</h4>
                    <p style="margin: 0; color: #4a5568; font-size: 0.95rem;">
                        Editando: <strong>${especie.apelido}</strong>
                    </p>
                </div>

                <div class="especie-edit-grid">
                    <div class="especie-edit-field">
                        <label>Família</label>
                        <input type="text" id="edit-familia" value="${especie.familia || ''}"
                               placeholder="Ex: Poaceae">
                        <small style="color: #718096; margin-top: 4px;">opcional</small>
                    </div>

                    <div class="especie-edit-field">
                        <label>Gênero</label>
                        <input type="text" id="edit-genero" value="${especie.genero || ''}"
                               placeholder="Ex: Paspalum">
                        <small style="color: #718096; margin-top: 4px;">opcional</small>
                    </div>

                    <div class="especie-edit-field">
                        <label>Espécie</label>
                        <input type="text" id="edit-especie" value="${especie.especie || ''}"
                               placeholder="Ex: notatum">
                        <small style="color: #718096; margin-top: 4px;">opcional</small>
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>Observações</label>
                        <textarea id="edit-observacoes" rows="3"
                                  placeholder="Descrição detalhada das características visuais...">${especie.observacoes || ''}</textarea>
                        <small style="color: #718096; margin-top: 4px;">opcional</small>
                    </div>

                    <div class="especie-edit-field">
                        <label>Cobertura (%) *</label>
                        <input type="number" id="edit-cobertura" value="${especie.cobertura}"
                               min="0" max="100" step="0.1" required>
                        <small style="color: #718096; margin-top: 4px;">0-100%</small>
                    </div>

                    <div class="especie-edit-field">
                        <label>Altura (cm) *</label>
                        <input type="number" id="edit-altura" value="${especie.altura}"
                               min="0" step="0.1" required>
                        <small style="color: #718096; margin-top: 4px;">em centímetros</small>
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>Forma de Vida *</label>
                        <select id="edit-forma-vida" required>
                            <option value="Erva" ${especie.forma_vida === 'Erva' ? 'selected' : ''}>Erva</option>
                            <option value="Arbusto" ${especie.forma_vida === 'Arbusto' ? 'selected' : ''}>Arbusto</option>
                            <option value="Subarbusto" ${especie.forma_vida === 'Subarbusto' ? 'selected' : ''}>Subarbusto</option>
                            <option value="Liana" ${especie.forma_vida === 'Liana' ? 'selected' : ''}>Liana</option>
                            <option value="Trepadeira" ${especie.forma_vida === 'Trepadeira' ? 'selected' : ''}>Trepadeira</option>
                            <option value="Plântula" ${especie.forma_vida === 'Plântula' ? 'selected' : ''}>Plântula</option>
                            <option value="Bromélia" ${especie.forma_vida === 'Bromélia' ? 'selected' : ''}>Bromélia</option>
                            <option value="Cacto" ${especie.forma_vida === 'Cacto' ? 'selected' : ''}>Cacto</option>
                            <option value="Pteridófita" ${especie.forma_vida === 'Pteridófita' ? 'selected' : ''}>Pteridófita</option>
                            <option value="-" ${especie.forma_vida === '-' ? 'selected' : ''}>Outro</option>
                        </select>
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>🔗 Link das Fotos (URL)</label>
                        <input type="url" id="edit-link-fotos" value="${especie.link_fotos || ''}"
                               placeholder="https://exemplo.com/fotos-da-especie">
                        <small style="color: #718096; margin-top: 4px;">Cole o link para fotos de referência da espécie</small>
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #856404;">
                        ⚠️ <strong>Atenção:</strong> Estas alterações afetam apenas esta subparcela.
                    </p>
                </div>
            </div>
        </div>
    `;

    currentEditContext = { type: 'subparcela', subparcela, apelido };

    openEditPanel(`Editar em Subparcela ${subparcela}`, formHTML, async () => {
        const familia = document.getElementById('edit-familia').value.trim();
        const genero = document.getElementById('edit-genero').value.trim();
        const especie_nome = document.getElementById('edit-especie').value.trim();
        const observacoes = document.getElementById('edit-observacoes').value.trim();
        const cobertura = parseFloat(document.getElementById('edit-cobertura').value);
        const altura = parseFloat(document.getElementById('edit-altura').value);
        const formaVida = document.getElementById('edit-forma-vida').value;
        const linkFotos = document.getElementById('edit-link-fotos').value.trim();

        if (isNaN(cobertura) || isNaN(altura) || cobertura < 0 || cobertura > 100 || altura < 0) {
            showAlert('error', 'Valores inválidos. Verifique cobertura (0-100) e altura (≥0)');
            return;
        }

        try {
            const response = await fetch(`/api/especies/${appState.parcelaNome}/${subparcela}/${encodeURIComponent(apelido)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    familia,
                    genero,
                    especie: especie_nome,
                    observacoes,
                    cobertura,
                    altura,
                    forma_vida: formaVida,
                    link_fotos: linkFotos
                })
            });

            const result = await response.json();

            if (result.success) {
                await refreshData();
                closeEditPanel();
                showAlert('success', 'Espécie atualizada!');
            } else {
                showAlert('error', result.error || 'Erro ao atualizar');
            }
        } catch (error) {
            showAlert('error', 'Erro: ' + error.message);
        }
    });
}

// Adicionar Nova Espécie
function addEspecieToSubparcelaPanel(subparcela) {
    const formHTML = `
        <div class="especie-card expanded">
            <div class="especie-card-content">
                <div style="padding: 15px; background: #f0fff4; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #48bb78;">Nova Espécie</h4>
                    <p style="margin: 0; color: #4a5568; font-size: 0.95rem;">
                        Adicionando à Subparcela ${subparcela}
                    </p>
                </div>

                <div class="especie-edit-grid">
                    <div class="especie-edit-field full-width">
                        <label>Nome/Apelido *</label>
                        <input type="text" id="new-apelido" placeholder="Ex: Leguminosa Rasteira" required>
                    </div>

                    <div class="especie-edit-field">
                        <label>Cobertura (%) *</label>
                        <input type="number" id="new-cobertura" min="0" max="100" step="0.1"
                               placeholder="0-100" required>
                    </div>

                    <div class="especie-edit-field">
                        <label>Altura (cm) *</label>
                        <input type="number" id="new-altura" min="0" step="0.1"
                               placeholder="em cm" required>
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>Forma de Vida *</label>
                        <select id="new-forma-vida" required>
                            <option value="">Selecione...</option>
                            <option value="Erva">Erva</option>
                            <option value="Arbusto">Arbusto</option>
                            <option value="Subarbusto">Subarbusto</option>
                            <option value="Liana">Liana</option>
                            <option value="Trepadeira">Trepadeira</option>
                            <option value="Plântula">Plântula Arbórea</option>
                            <option value="Bromélia">Bromélia</option>
                            <option value="Cacto">Cactácea</option>
                            <option value="Pteridófita">Pteridófita (Samambaia)</option>
                            <option value="-">Outro</option>
                        </select>
                    </div>

                    <div class="especie-edit-field">
                        <label>Gênero (opcional)</label>
                        <input type="text" id="new-genero" placeholder="Ex: Stylosanthes">
                    </div>

                    <div class="especie-edit-field">
                        <label>Espécie (opcional)</label>
                        <input type="text" id="new-especie" placeholder="Ex: capitata">
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>Família (opcional)</label>
                        <input type="text" id="new-familia" placeholder="Ex: Fabaceae">
                    </div>

                    <div class="especie-edit-field full-width">
                        <label>🔗 Link das Fotos (URL)</label>
                        <input type="url" id="new-link-fotos" placeholder="https://exemplo.com/fotos-da-especie">
                        <small style="color: #718096; margin-top: 4px;">Cole o link para fotos de referência da espécie</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    openEditPanel('Adicionar Espécie', formHTML, async () => {
        console.log('🚀 Callback de salvamento executado!');
        
        const apelido = document.getElementById('new-apelido').value.trim();
        const cobertura = parseFloat(document.getElementById('new-cobertura').value);
        const altura = parseFloat(document.getElementById('new-altura').value);
        const formaVida = document.getElementById('new-forma-vida').value;
        const genero = document.getElementById('new-genero').value.trim();
        const especieNome = document.getElementById('new-especie').value.trim();
        const familia = document.getElementById('new-familia').value.trim();
        const linkFotos = document.getElementById('new-link-fotos').value.trim();

        console.log('📝 Dados coletados:', { apelido, cobertura, altura, formaVida });

        if (!apelido || isNaN(cobertura) || isNaN(altura) || !formaVida) {
            console.error('❌ Validação falhou');
            showAlert('error', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (cobertura < 0 || cobertura > 100 || altura < 0) {
            console.error('❌ Valores fora do range válido');
            showAlert('error', 'Valores inválidos. Cobertura: 0-100, Altura: ≥0');
            return;
        }

        console.log('✅ Validação passou, enviando requisição...');

        try {
            const response = await fetch('/api/especies/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parcela: appState.parcelaNome,
                    subparcela,
                    especie: {
                        apelido,
                        cobertura,
                        altura,
                        forma_vida: formaVida,
                        genero,
                        especie: especieNome,
                        familia,
                        link_fotos: linkFotos
                    }
                })
            });

            const result = await response.json();
            console.log('📡 Resposta recebida:', result);

            if (result.success) {
                console.log('✅ Espécie adicionada com sucesso');
                
                // Fechar painel ANTES de atualizar dados
                closeEditPanel();
                
                // Mostrar mensagem de sucesso
                showAlert('success', result.message);
                
                // Atualizar dados em background
                await refreshData();
                
                console.log('🔄 Dados atualizados');
            } else {
                console.error('❌ Erro na resposta:', result.error);
                showAlert('error', result.error || 'Erro ao adicionar');
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            showAlert('error', 'Erro: ' + error.message);
        }
    });
}

// Atualizar referências antigas
window.editSpecies = editSpecies;
window.editSubparcelaEspecie = editSubparcelaEspeciePanel;
window.addEspecieToSubparcela = addEspecieToSubparcelaPanel;
