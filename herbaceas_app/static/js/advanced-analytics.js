// Módulo de Análises Avançadas
// Análises ecológicas, fitossociológicas e visualizações profissionais

const AdvancedAnalytics = {
    data: null,
    charts: {},

    initialize(analysisData) {
        console.log('🚀 AdvancedAnalytics.initialize() chamado');
        console.log('📦 Dados recebidos:', analysisData);
        console.log('   - especies:', analysisData?.especies ? Object.keys(analysisData.especies).length + ' espécies' : 'NULO');
        console.log('   - analysisResults:', analysisData?.analysisResults ? analysisData.analysisResults.length + ' resultados' : 'NULO');
        console.log('   - subparcelas:', analysisData?.subparcelas);
        
        // Validar dados
        if (!analysisData || !analysisData.especies || Object.keys(analysisData.especies).length === 0) {
            console.error('❌ Dados insuficientes para análise');
            this.showErrorMessage('Não há dados suficientes para gerar análises avançadas');
            return;
        }
        
        this.data = analysisData;
        console.log('✅ Dados validados, iniciando render');
        this.render();
    },

    showErrorMessage(message) {
        const container = document.getElementById('advanced-analytics-section');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                    <h3 style="color: #333; margin-bottom: 10px;">Análises Avançadas</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    render() {
        const container = document.getElementById('advanced-analytics-section');
        if (!container) return;

        container.innerHTML = `
            <div class="analytics-tabs">
                <button class="analytics-tab active" data-tab="ecological">🌿 Análises Ecológicas</button>
                <button class="analytics-tab" data-tab="phytosociological">📊 Fitossociologia</button>
                <button class="analytics-tab" data-tab="monitoring">📈 Monitoramento</button>
                <button class="analytics-tab" data-tab="comparative">🔍 Comparativas</button>
                <button class="analytics-tab" data-tab="accumulated">📚 Acumuladas</button>
            </div>
            
            <div class="analytics-content">
                <div id="tab-ecological" class="analytics-tab-content active">
                    ${this.renderEcologicalAnalysis()}
                </div>
                <div id="tab-phytosociological" class="analytics-tab-content">
                    ${this.renderPhytosociologicalAnalysis()}
                </div>
                <div id="tab-monitoring" class="analytics-tab-content">
                    ${this.renderMonitoringAnalysis()}
                </div>
                <div id="tab-comparative" class="analytics-tab-content">
                    ${this.renderComparativeAnalysis()}
                </div>
                <div id="tab-accumulated" class="analytics-tab-content">
                    ${this.renderAccumulatedAnalysis()}
                </div>
            </div>
        `;

        this.setupTabNavigation();
        this.generateCharts();
    },

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.analytics-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active de todos
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.analytics-tab-content').forEach(c => c.classList.remove('active'));
                
                // Adiciona active no clicado
                e.target.classList.add('active');
                const tabId = e.target.getAttribute('data-tab');
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    },

    renderEcologicalAnalysis() {
        const diversityIndex = this.calculateShannonDiversity();
        const richnessIndex = this.calculateSpeciesRichness();
        const evennessIndex = this.calculateEveness();
        const dominanceIndex = this.calculateSimpsonDominance();

        console.log('📊 Renderizando análises ecológicas:', { diversityIndex, richnessIndex, evennessIndex, dominanceIndex });

        // Garantir que valores são números válidos
        const diversity = isNaN(diversityIndex) ? 0 : diversityIndex;
        const richness = isNaN(richnessIndex) ? 0 : richnessIndex;
        const eveness = isNaN(evennessIndex) ? 0 : evennessIndex;
        const dominance = isNaN(dominanceIndex) ? 0 : dominanceIndex;

        return `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>🌈 Índice de Diversidade de Shannon (H')</h3>
                    <div class="analytics-value">${diversity.toFixed(3)}</div>
                    <p class="analytics-description">
                        Indica a diversidade de espécies. Valores típicos: 1.5-3.5 (baixa a alta diversidade)
                    </p>
                    <div class="analytics-interpretation">
                        ${this.interpretShannon(diversity)}
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>🔢 Riqueza de Espécies (S)</h3>
                    <div class="analytics-value">${richness}</div>
                    <p class="analytics-description">
                        Número total de espécies diferentes encontradas na área
                    </p>
                    <canvas id="chart-richness" height="200"></canvas>
                </div>

                <div class="analytics-card">
                    <h3>⚖️ Equitabilidade de Pielou (J')</h3>
                    <div class="analytics-value">${eveness.toFixed(3)}</div>
                    <p class="analytics-description">
                        Indica uniformidade na distribuição das espécies (0-1)
                    </p>
                    <div class="analytics-interpretation">
                        ${this.interpretEveness(eveness)}
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>👑 Índice de Dominância de Simpson (D)</h3>
                    <div class="analytics-value">${dominance.toFixed(3)}</div>
                    <p class="analytics-description">
                        Probabilidade de duas amostras aleatórias serem da mesma espécie
                    </p>
                    <div class="analytics-interpretation">
                        ${this.interpretSimpson(dominance)}
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h3>📊 Distribuição de Cobertura por Espécie</h3>
                <canvas id="chart-coverage-distribution" height="300"></canvas>
            </div>

            <div class="analytics-section">
                <h3>📏 Distribuição de Alturas</h3>
                <canvas id="chart-height-distribution" height="300"></canvas>
            </div>
        `;
    },

    renderPhytosociologicalAnalysis() {
        const frequencyData = this.calculateFrequency();
        const densityData = this.calculateDensity();
        const dominanceData = this.calculateDominance();
        const iviData = this.calculateIVI(frequencyData, densityData, dominanceData);

        return `
            <div class="analytics-section">
                <h3>📊 Índice de Valor de Importância (IVI)</h3>
                <p class="analytics-description">
                    O IVI combina frequência, densidade e dominância para identificar as espécies mais importantes ecologicamente
                </p>
                <canvas id="chart-ivi" height="300"></canvas>
            </div>

            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>📍 Frequência Relativa</h3>
                    <p class="analytics-description">Presença das espécies nas subparcelas</p>
                    <canvas id="chart-frequency" height="250"></canvas>
                </div>

                <div class="analytics-card">
                    <h3>🌱 Densidade Relativa</h3>
                    <p class="analytics-description">Abundância das espécies por área</p>
                    <canvas id="chart-density" height="250"></canvas>
                </div>

                <div class="analytics-card">
                    <h3>👑 Dominância Relativa</h3>
                    <p class="analytics-description">Cobertura das espécies na área total</p>
                    <canvas id="chart-dominance" height="250"></canvas>
                </div>
            </div>

            <div class="analytics-section">
                <h3>📋 Tabela Fitossociológica Completa</h3>
                <div class="phytosociological-table">
                    ${this.renderPhytosociologicalTable(frequencyData, densityData, dominanceData, iviData)}
                </div>
            </div>
        `;
    },

    renderMonitoringAnalysis() {
        return `
            <div class="analytics-section">
                <h3>📈 Análise Temporal (Monitoramento de Reflorestamento)</h3>
                <p class="analytics-description">
                    Compare esta análise com dados históricos para acompanhar a evolução do reflorestamento
                </p>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h3>🌱 Taxa de Cobertura Vegetal</h3>
                        <div class="analytics-value">${this.calculateTotalCoverage().toFixed(1)}%</div>
                        <p>Cobertura total de todas as espécies</p>
                    </div>

                    <div class="analytics-card">
                        <h3>📊 Estratificação Vertical</h3>
                        <canvas id="chart-stratification" height="200"></canvas>
                    </div>

                    <div class="analytics-card">
                        <h3>🌿 Sucessão Ecológica</h3>
                        ${this.renderSuccessionAnalysis()}
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h3>🎯 Indicadores de Qualidade de Restauração</h3>
                <div class="quality-indicators">
                    ${this.renderQualityIndicators()}
                </div>
            </div>
        `;
    },

    renderComparativeAnalysis() {
        return `
            <div class="analytics-section">
                <h3>🔍 Análise Comparativa entre Subparcelas</h3>
                <canvas id="chart-subparcel-comparison" height="300"></canvas>
            </div>

            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>📊 Similaridade de Jaccard</h3>
                    <p class="analytics-description">Similaridade na composição de espécies entre subparcelas</p>
                    <div id="jaccard-matrix">
                        ${this.renderJaccardMatrix()}
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>📈 Variabilidade Espacial</h3>
                    <canvas id="chart-spatial-variability" height="250"></canvas>
                </div>
            </div>

            <div class="analytics-section">
                <h3>🗺️ Mapa de Calor de Diversidade</h3>
                <canvas id="chart-diversity-heatmap" height="300"></canvas>
            </div>
        `;
    },

    renderAccumulatedAnalysis() {
        return `
            <div class="analytics-section">
                <h3>📚 Curva de Acumulação de Espécies</h3>
                <p class="analytics-description">
                    Indica se o esforço amostral foi suficiente para capturar a diversidade total
                </p>
                <canvas id="chart-species-accumulation" height="300"></canvas>
            </div>

            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>📊 Estatísticas Acumuladas</h3>
                    ${this.renderAccumulatedStats()}
                </div>

                <div class="analytics-card">
                    <h3>🌿 Espécies por Forma de Vida</h3>
                    <canvas id="chart-life-forms" height="250"></canvas>
                </div>
            </div>

            <div class="analytics-section">
                <h3>📈 Distribuição de Frequências</h3>
                <canvas id="chart-frequency-distribution" height="300"></canvas>
            </div>
        `;
    },

    // === CÁLCULOS DE ÍNDICES ECOLÓGICOS ===

    calculateShannonDiversity() {
        if (!this.data || !this.data.especies) {
            console.warn('⚠️ Shannon: Dados de espécies não disponíveis');
            return 0;
        }
        
        const especies = Object.values(this.data.especies);
        console.log('📊 Shannon: Total de espécies:', especies.length);
        
        const totalCoverage = especies.reduce((sum, sp) => {
            const cobertura = parseFloat(sp.cobertura) || 0;
            return sum + cobertura;
        }, 0);
        
        console.log('📊 Shannon: Cobertura total:', totalCoverage);
        
        if (totalCoverage === 0) {
            console.warn('⚠️ Shannon: Cobertura total é zero');
            return 0;
        }
        
        let shannon = 0;
        especies.forEach(sp => {
            const cobertura = parseFloat(sp.cobertura) || 0;
            if (cobertura > 0) {
                const pi = cobertura / totalCoverage;
                shannon -= pi * Math.log(pi);
            }
        });
        
        console.log('✅ Shannon calculado:', shannon);
        return shannon;
    },

    calculateSpeciesRichness() {
        if (!this.data || !this.data.especies) {
            console.warn('⚠️ Riqueza: Dados de espécies não disponíveis');
            return 0;
        }
        const richness = Object.keys(this.data.especies).length;
        console.log('✅ Riqueza calculada:', richness);
        return richness;
    },

    calculateEveness() {
        const H = this.calculateShannonDiversity();
        const S = this.calculateSpeciesRichness();
        if (S <= 1) {
            console.warn('⚠️ Equitabilidade: Riqueza <= 1');
            return 0;
        }
        const eveness = H / Math.log(S);
        console.log('✅ Equitabilidade calculada:', eveness);
        return eveness;
    },

    calculateSimpsonDominance() {
        if (!this.data || !this.data.especies) {
            console.warn('⚠️ Simpson: Dados de espécies não disponíveis');
            return 0;
        }
        
        const especies = Object.values(this.data.especies);
        const totalCoverage = especies.reduce((sum, sp) => {
            const cobertura = parseFloat(sp.cobertura) || 0;
            return sum + cobertura;
        }, 0);
        
        if (totalCoverage === 0) {
            console.warn('⚠️ Simpson: Cobertura total é zero');
            return 0;
        }
        
        let simpson = 0;
        especies.forEach(sp => {
            const cobertura = parseFloat(sp.cobertura) || 0;
            if (cobertura > 0) {
                const pi = cobertura / totalCoverage;
                simpson += pi * pi;
            }
        });
        
        console.log('✅ Simpson calculado:', simpson);
        return simpson;
    },

    calculateTotalCoverage() {
        if (!this.data || !this.data.especies) {
            console.warn('⚠️ Cobertura Total: Dados de espécies não disponíveis');
            return 0;
        }
        const especies = Object.values(this.data.especies);
        const total = Math.min(100, especies.reduce((sum, sp) => {
            const cobertura = parseFloat(sp.cobertura) || 0;
            return sum + cobertura;
        }, 0));
        console.log('✅ Cobertura Total calculada:', total);
        return total;
    },

    // === CÁLCULOS FITOSSOCIOLÓGICOS ===

    calculateFrequency() {
        if (!this.data || !this.data.analysisResults) {
            console.warn('⚠️ Frequência: Dados de análise não disponíveis');
            return {};
        }
        
        const frequency = {};
        const totalSubparcelas = this.data.analysisResults.length;
        
        // Contar em quantas subparcelas cada espécie aparece
        Object.keys(this.data.especies || {}).forEach(especie => {
            let count = 0;
            this.data.analysisResults.forEach(result => {
                if (result.especies && result.especies[especie]) {
                    count++;
                }
            });
            
            frequency[especie] = {
                absolute: count,
                relative: totalSubparcelas > 0 ? (count / totalSubparcelas) * 100 : 0
            };
        });
        
        console.log('✅ Frequência calculada para', Object.keys(frequency).length, 'espécies');
        return frequency;
    },

    calculateDensity() {
        if (!this.data || !this.data.especies) {
            console.warn('⚠️ Densidade: Dados de espécies não disponíveis');
            return {};
        }
        
        const density = {};
        const totalOccurrences = Object.values(this.data.especies).reduce((sum, sp) => {
            const ocorrencias = parseInt(sp.ocorrencias) || 0;
            return sum + ocorrencias;
        }, 0);
        
        Object.entries(this.data.especies).forEach(([nome, esp]) => {
            const ocorrencias = parseInt(esp.ocorrencias) || 0;
            density[nome] = {
                absolute: ocorrencias,
                relative: totalOccurrences > 0 ? (ocorrencias / totalOccurrences) * 100 : 0
            };
        });
        
        console.log('✅ Densidade calculada para', Object.keys(density).length, 'espécies');
        return density;
    },

    calculateDominance() {
        if (!this.data || !this.data.especies) {
            console.warn('⚠️ Dominância: Dados de espécies não disponíveis');
            return {};
        }
        
        const dominance = {};
        const totalCoverage = Object.values(this.data.especies).reduce((sum, sp) => {
            const cobertura = parseFloat(sp.cobertura) || 0;
            return sum + cobertura;
        }, 0);
        
        Object.entries(this.data.especies).forEach(([nome, esp]) => {
            const cobertura = parseFloat(esp.cobertura) || 0;
            dominance[nome] = {
                absolute: cobertura,
                relative: totalCoverage > 0 ? (cobertura / totalCoverage) * 100 : 0
            };
        });
        
        console.log('✅ Dominância calculada para', Object.keys(dominance).length, 'espécies');
        return dominance;
    },

    calculateIVI(frequency, density, dominance) {
        const ivi = {};
        
        Object.keys(this.data.especies || {}).forEach(especie => {
            const freq = frequency[especie]?.relative || 0;
            const dens = density[especie]?.relative || 0;
            const dom = dominance[especie]?.relative || 0;
            
            ivi[especie] = {
                frequency: freq,
                density: dens,
                dominance: dom,
                ivi: freq + dens + dom,
                iviPercent: (freq + dens + dom) / 3
            };
        });
        
        console.log('✅ IVI calculado para', Object.keys(ivi).length, 'espécies');
        return ivi;
    },

    // === INTERPRETAÇÕES ===

    interpretShannon(value) {
        if (value < 1.5) return '⚠️ <strong>Baixa diversidade</strong> - Área pode estar degradada ou em estágio inicial de sucessão';
        if (value < 2.5) return '✓ <strong>Diversidade moderada</strong> - Típico de áreas em recuperação';
        if (value < 3.5) return '✓✓ <strong>Alta diversidade</strong> - Indica boa qualidade ambiental';
        return '🌟 <strong>Diversidade excepcional</strong> - Área muito bem preservada ou restaurada';
    },

    interpretEveness(value) {
        if (value < 0.3) return '⚠️ <strong>Baixa equitabilidade</strong> - Forte dominância de poucas espécies';
        if (value < 0.6) return '✓ <strong>Equitabilidade moderada</strong> - Distribuição razoável';
        return '✓✓ <strong>Alta equitabilidade</strong> - Espécies bem distribuídas';
    },

    interpretSimpson(value) {
        if (value > 0.7) return '⚠️ <strong>Alta dominância</strong> - Poucas espécies dominam a área';
        if (value > 0.4) return '✓ <strong>Dominância moderada</strong>';
        return '✓✓ <strong>Baixa dominância</strong> - Boa distribuição de espécies';
    },

    // === RENDERIZADORES ===

    renderPhytosociologicalTable(frequency, density, dominance, ivi) {
        if (!this.data || !this.data.especies) return '<p>Sem dados disponíveis</p>';
        
        // Ordenar por IVI descendente
        const sortedSpecies = Object.entries(ivi).sort((a, b) => b[1].ivi - a[1].ivi);
        
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Espécie</th>
                        <th>Freq. Abs.</th>
                        <th>Freq. Rel. (%)</th>
                        <th>Dens. Abs.</th>
                        <th>Dens. Rel. (%)</th>
                        <th>Dom. Abs. (%)</th>
                        <th>Dom. Rel. (%)</th>
                        <th>IVI</th>
                        <th>IVI (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sortedSpecies.forEach(([especie, data]) => {
            const esp = this.data.especies[especie];
            const freq = frequency[especie];
            const dens = density[especie];
            const dom = dominance[especie];
            
            html += `
                <tr>
                    <td><strong>${esp?.apelido_usuario || especie}</strong></td>
                    <td>${freq?.absolute || 0}</td>
                    <td>${(freq?.relative || 0).toFixed(2)}</td>
                    <td>${dens?.absolute || 0}</td>
                    <td>${(dens?.relative || 0).toFixed(2)}</td>
                    <td>${(dom?.absolute || 0).toFixed(2)}</td>
                    <td>${(dom?.relative || 0).toFixed(2)}</td>
                    <td>${data.ivi.toFixed(2)}</td>
                    <td>${data.iviPercent.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    },

    renderSuccessionAnalysis() {
        if (!this.data || !this.data.especies) return '<p>Sem dados</p>';
        
        // Classificação simples por altura (pode ser melhorada com dados reais)
        let pioneer = 0, secondary = 0, climax = 0;
        
        Object.values(this.data.especies).forEach(esp => {
            const avgHeight = esp.altura_media || 0;
            if (avgHeight < 30) pioneer++;
            else if (avgHeight < 60) secondary++;
            else climax++;
        });
        
        return `
            <div class="succession-stages">
                <div class="stage">
                    <strong>🌱 Pioneiras:</strong> ${pioneer} espécies
                    <div class="stage-bar" style="width: ${(pioneer / this.calculateSpeciesRichness()) * 100}%; background: #4CAF50;"></div>
                </div>
                <div class="stage">
                    <strong>🌿 Secundárias:</strong> ${secondary} espécies
                    <div class="stage-bar" style="width: ${(secondary / this.calculateSpeciesRichness()) * 100}%; background: #8BC34A;"></div>
                </div>
                <div class="stage">
                    <strong>🌳 Clímax:</strong> ${climax} espécies
                    <div class="stage-bar" style="width: ${(climax / this.calculateSpeciesRichness()) * 100}%; background: #CDDC39;"></div>
                </div>
            </div>
        `;
    },

    renderQualityIndicators() {
        const coverage = this.calculateTotalCoverage();
        const richness = this.calculateSpeciesRichness();
        const diversity = this.calculateShannonDiversity();
        const eveness = this.calculateEveness();
        
        return `
            <div class="quality-indicator">
                <div class="label">Cobertura Total</div>
                <div class="value">${coverage.toFixed(0)}%</div>
            </div>
            <div class="quality-indicator">
                <div class="label">Riqueza</div>
                <div class="value">${richness}</div>
            </div>
            <div class="quality-indicator">
                <div class="label">Diversidade (H')</div>
                <div class="value">${diversity.toFixed(2)}</div>
            </div>
            <div class="quality-indicator">
                <div class="label">Equitabilidade (J')</div>
                <div class="value">${eveness.toFixed(2)}</div>
            </div>
        `;
    },

    renderJaccardMatrix() {
        if (!this.data || !this.data.analysisResults || this.data.analysisResults.length < 2) {
            return '<p>Necessário pelo menos 2 subparcelas para comparação</p>';
        }
        
        const subparcelas = this.data.analysisResults;
        const n = subparcelas.length;
        
        let html = '<table><thead><tr><th></th>';
        subparcelas.forEach((_, i) => {
            html += `<th>Sub ${i + 1}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        for (let i = 0; i < n; i++) {
            html += `<tr><th>Sub ${i + 1}</th>`;
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    html += '<td style="background: #4CAF50; color: white; font-weight: bold;">1.00</td>';
                } else {
                    const similarity = this.calculateJaccardSimilarity(
                        subparcelas[i].especies || {},
                        subparcelas[j].especies || {}
                    );
                    const color = this.getColorByValue(similarity);
                    html += `<td style="background: ${color}; color: white;">${similarity.toFixed(2)}</td>`;
                }
            }
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        return html;
    },

    calculateJaccardSimilarity(especies1, especies2) {
        const set1 = new Set(Object.keys(especies1));
        const set2 = new Set(Object.keys(especies2));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    },

    getColorByValue(value) {
        // Gradiente de vermelho (0) a verde (1)
        const r = Math.round(255 * (1 - value));
        const g = Math.round(255 * value);
        return `rgb(${r}, ${g}, 0)`;
    },

    renderAccumulatedStats() {
        const richness = this.calculateSpeciesRichness();
        const totalCoverage = this.calculateTotalCoverage();
        const avgHeightSum = Object.values(this.data.especies || {}).reduce((sum, esp) => sum + (esp.altura_media || 0), 0);
        const avgHeight = richness > 0 ? avgHeightSum / richness : 0;
        
        return `
            <div style="padding: 20px;">
                <p><strong>📊 Riqueza Total:</strong> ${richness} espécies</p>
                <p><strong>🌿 Cobertura Acumulada:</strong> ${totalCoverage.toFixed(1)}%</p>
                <p><strong>📏 Altura Média:</strong> ${avgHeight.toFixed(1)} cm</p>
                <p><strong>🔢 Subparcelas Analisadas:</strong> ${this.data.analysisResults?.length || 0}</p>
            </div>
        `;
    },

    // === GERAÇÃO DE GRÁFICOS (Chart.js) ===

    generateCharts() {
        // Destruir gráficos existentes antes de recriar
        this.destroyCharts();
        
        setTimeout(() => {
            // Aplicar altura fixa em todos os canvas para evitar crescimento infinito
            this.setCanvasFixedHeight();
            
            this.createCoverageDistributionChart();
            this.createHeightDistributionChart();
            this.createRichnessChart();
            this.createIVIChart();
            this.createFrequencyChart();
            this.createDensityChart();
            this.createDominanceChart();
            this.createStratificationChart();
            this.createSubparcelComparisonChart();
            this.createSpatialVariabilityChart();
            this.createDiversityHeatmap();
            this.createSpeciesAccumulationChart();
            this.createLifeFormsChart();
            this.createFrequencyDistributionChart();
        }, 100);
    },

    setCanvasFixedHeight() {
        // Aplicar altura fixa em todos os canvas para prevenir crescimento infinito
        const allCanvas = document.querySelectorAll('.analytics-section canvas, .analytics-card canvas');
        allCanvas.forEach(canvas => {
            canvas.style.maxHeight = '300px';
            canvas.style.height = '300px';
        });
        console.log(`✅ Altura fixa aplicada em ${allCanvas.length} canvas`);
    },

    destroyCharts() {
        // Destruir todos os gráficos Chart.js existentes para evitar acúmulo
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key] && typeof this.charts[key].destroy === 'function') {
                console.log(`🗑️ Destruindo gráfico: ${key}`);
                this.charts[key].destroy();
            }
        });
        this.charts = {}; // Limpar objeto
    },

    createCoverageDistributionChart() {
        const ctx = document.getElementById('chart-coverage-distribution');
        if (!ctx || !this.data.especies) return;
        
        // Definir tamanho fixo do canvas
        ctx.style.maxHeight = '300px';
        ctx.height = 300;
        
        const especies = Object.values(this.data.especies);
        const top10 = especies.sort((a, b) => b.cobertura - a.cobertura).slice(0, 10);
        
        this.charts.coverage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(e => e.apelido_usuario),
                datasets: [{
                    label: 'Cobertura (%)',
                    data: top10.map(e => e.cobertura.toFixed(2)),
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    title: { display: true, text: 'Top 10 Espécies por Cobertura' },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Cobertura (%)' } }
                }
            }
        });
    },

    createHeightDistributionChart() {
        const ctx = document.getElementById('chart-height-distribution');
        if (!ctx || !this.data.especies) return;
        
        const especies = Object.values(this.data.especies).filter(e => e.altura_media > 0);
        
        // Agrupar por faixas de altura
        const ranges = { '0-20cm': 0, '20-40cm': 0, '40-60cm': 0, '60-80cm': 0, '80+cm': 0 };
        especies.forEach(e => {
            const h = e.altura_media;
            if (h < 20) ranges['0-20cm']++;
            else if (h < 40) ranges['20-40cm']++;
            else if (h < 60) ranges['40-60cm']++;
            else if (h < 80) ranges['60-80cm']++;
            else ranges['80+cm']++;
        });
        
        this.charts.height = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    data: Object.values(ranges),
                    backgroundColor: [
                        '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: { display: true, text: 'Distribuição por Faixa de Altura' }
                }
            }
        });
    },

    createRichnessChart() {
        const ctx = document.getElementById('chart-richness');
        if (!ctx) return;
        
        const richness = this.calculateSpeciesRichness();
        
        this.charts.richness = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Riqueza'],
                datasets: [{
                    label: 'Número de Espécies',
                    data: [richness],
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    createIVIChart() {
        const ctx = document.getElementById('chart-ivi');
        if (!ctx) return;
        
        const frequency = this.calculateFrequency();
        const density = this.calculateDensity();
        const dominance = this.calculateDominance();
        const ivi = this.calculateIVI(frequency, density, dominance);
        
        const sortedIVI = Object.entries(ivi).sort((a, b) => b[1].ivi - a[1].ivi).slice(0, 10);
        
        this.charts.ivi = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedIVI.map(([nome, _]) => this.data.especies[nome]?.apelido_usuario || nome),
                datasets: [{
                    label: 'IVI',
                    data: sortedIVI.map(([_, data]) => data.ivi.toFixed(2)),
                    backgroundColor: 'rgba(156, 39, 176, 0.7)',
                    borderColor: 'rgba(156, 39, 176, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    title: { display: true, text: 'Top 10 Espécies por IVI' }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    },

    createFrequencyChart() {
        const ctx = document.getElementById('chart-frequency');
        if (!ctx) return;
        
        const frequency = this.calculateFrequency();
        const top10 = Object.entries(frequency)
            .sort((a, b) => b[1].relative - a[1].relative)
            .slice(0, 10);
        
        this.charts.frequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(([nome, _]) => this.data.especies[nome]?.apelido_usuario || nome),
                datasets: [{
                    label: 'Frequência Relativa (%)',
                    data: top10.map(([_, data]) => data.relative.toFixed(2)),
                    backgroundColor: '#FF5722'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    },

    createDensityChart() {
        const ctx = document.getElementById('chart-density');
        if (!ctx) return;
        
        const density = this.calculateDensity();
        const top10 = Object.entries(density)
            .sort((a, b) => b[1].relative - a[1].relative)
            .slice(0, 10);
        
        this.charts.density = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(([nome, _]) => this.data.especies[nome]?.apelido_usuario || nome),
                datasets: [{
                    label: 'Densidade Relativa (%)',
                    data: top10.map(([_, data]) => data.relative.toFixed(2)),
                    backgroundColor: '#009688'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    },

    createDominanceChart() {
        const ctx = document.getElementById('chart-dominance');
        if (!ctx) return;
        
        const dominance = this.calculateDominance();
        const top10 = Object.entries(dominance)
            .sort((a, b) => b[1].relative - a[1].relative)
            .slice(0, 10);
        
        this.charts.dominance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(([nome, _]) => this.data.especies[nome]?.apelido_usuario || nome),
                datasets: [{
                    label: 'Dominância Relativa (%)',
                    data: top10.map(([_, data]) => data.relative.toFixed(2)),
                    backgroundColor: '#FFC107'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    },

    createStratificationChart() {
        const ctx = document.getElementById('chart-stratification');
        if (!ctx) return;
        
        const especies = Object.values(this.data.especies || {});
        const strata = { 'Rasteira (0-20cm)': 0, 'Baixa (20-50cm)': 0, 'Média (50-80cm)': 0, 'Alta (>80cm)': 0 };
        
        especies.forEach(e => {
            const h = e.altura_media || 0;
            if (h < 20) strata['Rasteira (0-20cm)']++;
            else if (h < 50) strata['Baixa (20-50cm)']++;
            else if (h < 80) strata['Média (50-80cm)']++;
            else strata['Alta (>80cm)']++;
        });
        
        this.charts.stratification = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(strata),
                datasets: [{
                    data: Object.values(strata),
                    backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    },

    createSubparcelComparisonChart() {
        const ctx = document.getElementById('chart-subparcel-comparison');
        if (!ctx || !this.data.analysisResults) return;
        
        const subparcelas = this.data.analysisResults;
        
        this.charts.subparcel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subparcelas.map((_, i) => `Sub ${i + 1}`),
                datasets: [{
                    label: 'Riqueza de Espécies',
                    data: subparcelas.map(s => Object.keys(s.especies || {}).length),
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    createSpatialVariabilityChart() {
        const ctx = document.getElementById('chart-spatial-variability');
        if (!ctx || !this.data.analysisResults) return;
        
        const subparcelas = this.data.analysisResults;
        const coverages = subparcelas.map(s => {
            const especies = Object.values(s.especies || {});
            return especies.reduce((sum, e) => sum + (e.cobertura || 0), 0);
        });
        
        this.charts.spatial = new Chart(ctx, {
            type: 'line',
            data: {
                labels: subparcelas.map((_, i) => `Sub ${i + 1}`),
                datasets: [{
                    label: 'Cobertura Total (%)',
                    data: coverages,
                    borderColor: '#FF5722',
                    backgroundColor: 'rgba(255, 87, 34, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    createDiversityHeatmap() {
        const ctx = document.getElementById('chart-diversity-heatmap');
        if (!ctx || !this.data.analysisResults) return;
        
        // Placeholder - implementar heatmap real com biblioteca especializada
        const subparcelas = this.data.analysisResults;
        const diversities = subparcelas.map(s => {
            const especies = Object.values(s.especies || {});
            const total = especies.reduce((sum, e) => sum + (e.cobertura || 0), 0);
            let shannon = 0;
            especies.forEach(e => {
                if (e.cobertura > 0 && total > 0) {
                    const pi = e.cobertura / total;
                    shannon -= pi * Math.log(pi);
                }
            });
            return shannon;
        });
        
        this.charts.heatmap = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subparcelas.map((_, i) => `Sub ${i + 1}`),
                datasets: [{
                    label: 'Diversidade (H\')',
                    data: diversities,
                    backgroundColor: diversities.map(d => {
                        const intensity = Math.min(255, Math.round(d * 80));
                        return `rgba(76, ${intensity + 100}, 80, 0.7)`;
                    })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    createSpeciesAccumulationChart() {
        const ctx = document.getElementById('chart-species-accumulation');
        if (!ctx || !this.data.analysisResults) return;
        
        const subparcelas = this.data.analysisResults;
        const accumulated = [];
        const seenSpecies = new Set();
        
        subparcelas.forEach((s, i) => {
            Object.keys(s.especies || {}).forEach(sp => seenSpecies.add(sp));
            accumulated.push(seenSpecies.size);
        });
        
        this.charts.accumulation = new Chart(ctx, {
            type: 'line',
            data: {
                labels: subparcelas.map((_, i) => `${i + 1}`),
                datasets: [{
                    label: 'Espécies Acumuladas',
                    data: accumulated,
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: { display: true, text: 'Curva de Acumulação de Espécies (Rarefação)' }
                },
                scales: {
                    x: { title: { display: true, text: 'Número de Subparcelas' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Número de Espécies' } }
                }
            }
        });
    },

    createLifeFormsChart() {
        const ctx = document.getElementById('chart-life-forms');
        if (!ctx) return;
        
        // Classificação simples por altura (pode ser melhorada)
        const especies = Object.values(this.data.especies || {});
        const forms = { 'Rasteiras': 0, 'Herbáceas': 0, 'Subarbustos': 0, 'Trepadeiras': 0 };
        
        especies.forEach(e => {
            const h = e.altura_media || 0;
            if (h < 15) forms['Rasteiras']++;
            else if (h < 50) forms['Herbáceas']++;
            else if (h < 100) forms['Subarbustos']++;
            else forms['Trepadeiras']++;
        });
        
        this.charts.lifeForms = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(forms),
                datasets: [{
                    data: Object.values(forms),
                    backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    },

    createFrequencyDistributionChart() {
        const ctx = document.getElementById('chart-frequency-distribution');
        if (!ctx) return;
        
        const frequency = this.calculateFrequency();
        const classes = { 'Muito Rara (0-20%)': 0, 'Rara (20-40%)': 0, 'Comum (40-60%)': 0, 'Frequente (60-80%)': 0, 'Muito Frequente (80-100%)': 0 };
        
        Object.values(frequency).forEach(f => {
            const rel = f.relative;
            if (rel < 20) classes['Muito Rara (0-20%)']++;
            else if (rel < 40) classes['Rara (20-40%)']++;
            else if (rel < 60) classes['Comum (40-60%)']++;
            else if (rel < 80) classes['Frequente (60-80%)']++;
            else classes['Muito Frequente (80-100%)']++;
        });
        
        this.charts.freqDist = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(classes),
                datasets: [{
                    label: 'Número de Espécies',
                    data: Object.values(classes),
                    backgroundColor: ['#f44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
};
