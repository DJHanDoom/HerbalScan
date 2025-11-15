// ============================================================
// SVG COVERAGE DRAWER v3.0 - SVG Overlay Method
// ============================================================
// Baseado na análise em ANALISE_METODOS_CANVAS.md
// Usa SVG overlay com viewBox para sincronização automática
// ============================================================

const SVGCoverageDrawer = {
    // Estado
    svg: null,
    image: null,
    imageContainer: null,
    currentSubparcela: null,
    toolbar: null,

    // Dados
    subparcelaPolygon: null,  // { points: [{x,y}, ...] }
    speciesPolygons: {},       // { speciesIndex: [{ points: [{x,y}, ...] }, ...] }

    // Modo de desenho
    drawMode: null,            // 'subparcela' ou 'species'
    currentSpeciesIndex: null,
    currentTool: 'rectangle',  // 'rectangle', 'polygon', 'circle', 'ellipse'

    // Estado do desenho
    isDrawing: false,
    startPoint: null,
    currentPath: null,
    polygonPoints: [],
    currentPreviewShape: null,  // Para preview de círculo/elipse

    // Configurações visuais
    fillEnabled: false,
    subparcelaFillEnabled: false,
    fillOpacity: 0.3,
    strokeWidth: 3,

    // Cores
    colors: {
        subparcela: '#667eea',
        species: [
            '#48bb78', '#ed8936', '#f6e05e', '#ec4899',
            '#8b5cf6', '#3b82f6', '#ef4444', '#10b981'
        ]
    },

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    init(imageElement, subparcelaData) {
        console.log('🎨 SVGCoverageDrawer v3.0 - SVG Overlay Method');

        this.image = imageElement;
        this.currentSubparcela = subparcelaData;
        this.imageContainer = document.getElementById('viewer-img-container');

        if (!this.imageContainer) {
            console.error('❌ Container não encontrado');
            return;
        }

        this.createSVG();
        this.createToolbar();
        this.setupEventListeners();
        this.loadSavedData();
    },

    createSVG() {
        // Remover SVG antigo se existir
        const oldSVG = document.getElementById('coverage-svg');
        if (oldSVG) oldSVG.remove();

        // Aguardar imagem carregar
        if (!this.image.complete || !this.image.naturalWidth) {
            this.image.onload = () => this.createSVG();
            return;
        }

        // Criar SVG com viewBox = dimensões naturais da imagem
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.id = 'coverage-svg';
        this.svg.setAttribute('viewBox', `0 0 ${this.image.naturalWidth} ${this.image.naturalHeight}`);

        // Estilo: overlay absoluto que cobre todo o container
        this.svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
            display: none;
        `;

        // Criar grupo para área da subparcela
        const subparcelaGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        subparcelaGroup.id = 'subparcela-group';
        this.svg.appendChild(subparcelaGroup);

        // Criar grupo para espécies
        const speciesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        speciesGroup.id = 'species-group';
        this.svg.appendChild(speciesGroup);

        // Criar grupo para desenho temporário
        const drawGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        drawGroup.id = 'draw-group';
        this.svg.appendChild(drawGroup);

        this.imageContainer.appendChild(this.svg);

        console.log(`✅ SVG criado: viewBox="${this.svg.getAttribute('viewBox')}"`);
    },

    // ========================================
    // TOOLBAR
    // ========================================

    createToolbar() {
        const oldToolbar = document.getElementById('coverage-toolbar');
        if (oldToolbar) oldToolbar.remove();

        this.toolbar = document.createElement('div');
        this.toolbar.id = 'coverage-toolbar';
        this.toolbar.style.cssText = `
            position: absolute;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(30,30,40,0.95));
            padding: 8px;
            border-radius: 12px;
            z-index: 20;
            display: none;
            flex-direction: column;
            gap: 6px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        `;

        const buttons = [
            { id: 'rect-btn', label: '▢', title: 'Retângulo (R)', tool: 'rectangle', color: '#3b82f6' },
            { id: 'circle-btn', label: '○', title: 'Círculo (C)', tool: 'circle', color: '#10b981' },
            { id: 'ellipse-btn', label: '⬭', title: 'Elipse (E)', tool: 'ellipse', color: '#8b5cf6' },
            { id: 'polygon-btn', label: '⬡', title: 'Polígono (P)\nEnter ou duplo clique para finalizar', tool: 'polygon', color: '#f59e0b' },
            { id: 'divider', isDivider: true },
            { id: 'cancel-btn', label: '✕', title: 'Cancelar (ESC)', action: 'cancel', color: '#ef4444' },
            { id: 'finish-btn', label: '✓', title: 'Finalizar e Sair', action: 'finish', color: '#10b981' }
        ];

        buttons.forEach(btn => {
            if (btn.isDivider) {
                const divider = document.createElement('div');
                divider.style.cssText = `
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                    margin: 4px 0;
                `;
                this.toolbar.appendChild(divider);
                return;
            }

            const button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.label;
            button.title = btn.title;
            button.dataset.tool = btn.tool || btn.action;

            const baseColor = btn.color || '#4a5568';
            button.style.cssText = `
                padding: 12px;
                background: ${baseColor}22;
                color: white;
                border: 2px solid ${baseColor};
                border-radius: 8px;
                cursor: pointer;
                font-size: 20px;
                font-weight: 700;
                transition: all 0.2s;
                min-width: 50px;
                min-height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            `;

            button.onmouseenter = () => {
                button.style.background = baseColor;
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = `0 0 20px ${baseColor}88`;
            };

            button.onmouseleave = () => {
                const isActive = this.currentTool === btn.tool;
                button.style.background = isActive ? baseColor : `${baseColor}22`;
                button.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
                button.style.boxShadow = 'none';
            };

            if (btn.tool) {
                button.onclick = () => {
                    this.setTool(btn.tool);
                    this.updateToolbarHighlight();
                };
            } else if (btn.action === 'cancel') {
                button.onclick = () => this.cancelDrawing();
            } else if (btn.action === 'finish') {
                button.onclick = () => this.stopDrawing();
            }

            this.toolbar.appendChild(button);
        });

        this.imageContainer.appendChild(this.toolbar);
        console.log('🔧 Toolbar criada (vertical colorida)');
    },

    updateToolbarHighlight() {
        const buttons = this.toolbar.querySelectorAll('button[data-tool]');
        buttons.forEach(btn => {
            const tool = btn.dataset.tool;
            const isActive = this.currentTool === tool;
            const colorMap = {
                'rectangle': '#3b82f6',
                'circle': '#10b981',
                'ellipse': '#8b5cf6',
                'polygon': '#f59e0b'
            };
            const baseColor = colorMap[tool] || '#4a5568';

            btn.style.background = isActive ? baseColor : `${baseColor}22`;
            btn.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
            btn.style.boxShadow = isActive ? `0 0 15px ${baseColor}66` : 'none';
        });
    },

    // ========================================
    // EVENTOS
    // ========================================

    setupEventListeners() {
        this.svg.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.svg.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.svg.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.svg.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    },

    getSVGPoint(e) {
        // Converter coordenadas da tela para coordenadas do SVG
        // O browser faz toda a mágica! Não precisamos calcular nada!
        const pt = this.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;

        const svgP = pt.matrixTransform(this.svg.getScreenCTM().inverse());
        return { x: svgP.x, y: svgP.y };
    },

    onMouseDown(e) {
        if (!this.drawMode) return;
        
        // Verificar se ferramenta foi selecionada
        if (!this.currentTool) {
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Selecione uma ferramenta primeiro (Retângulo/Polígono/Círculo/Elipse)');
            }
            return;
        }
        
        e.preventDefault();

        const point = this.getSVGPoint(e);

        if (this.currentTool === 'polygon') {
            // Para polígonos: só iniciar desenho se ainda não começou
            if (!this.isDrawing) {
                // Primeiro clique - iniciar desenho
                this.isDrawing = true;
                this.polygonPoints = [point]; // Começar com primeiro ponto
                console.log('🔵 POLÍGONO INICIADO - isDrawing agora TRUE - ponto 1 adicionado');
                if (typeof showAlert === 'function') {
                    showAlert('info', '🔵 Clique para adicionar pontos, duplo-clique ou Enter para finalizar');
                }
            } else {
                // Cliques seguintes - adicionar pontos
                this.polygonPoints.push(point);
                console.log(`✓ Ponto ${this.polygonPoints.length} adicionado - isDrawing JÁ ESTAVA TRUE`);
            }
            this.renderCurrentDraw();
        } else {
            // Rectangle, Circle, Ellipse
            this.isDrawing = true;
            this.startPoint = point;
        }
    },

    onMouseMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();

        const point = this.getSVGPoint(e);

        if (this.currentTool === 'polygon') {
            this.renderCurrentDraw(point);
        } else if (this.startPoint) {
            // Rectangle, Circle, Ellipse
            this.renderCurrentDraw(point);
        }
    },

    onMouseUp(e) {
        if (!this.isDrawing || this.currentTool === 'polygon') return;
        e.preventDefault();

        const point = this.getSVGPoint(e);

        if (this.startPoint) {
            switch (this.currentTool) {
                case 'rectangle':
                    this.finishRectangle(point);
                    break;
                case 'circle':
                    this.finishCircle(point);
                    break;
                case 'ellipse':
                    this.finishEllipse(point);
                    break;
            }
        }

        // NÃO resetar aqui - já é feito nas funções finish
    },

    onDoubleClick(e) {
        if (this.currentTool === 'polygon' && this.polygonPoints.length >= 3) {
            e.preventDefault();
            e.stopPropagation();
            this.finishPolygon();
        }
    },

    onKeyDown(e) {
        if (!this.drawMode) return;

        switch(e.key.toLowerCase()) {
            case 'r':
                this.setTool('rectangle');
                break;
            case 'p':
                this.setTool('polygon');
                break;
            case 'c':
                this.setTool('circle');
                break;
            case 'e':
                this.setTool('ellipse');
                break;
            case 'escape':
                this.cancelDrawing();
                break;
            case 'enter':
                // Finalizar polígono com Enter
                if (this.currentTool === 'polygon' && this.polygonPoints.length >= 3) {
                    this.finishPolygon();
                }
                break;
        }
    },

    // ========================================
    // DESENHO
    // ========================================

    renderCurrentDraw(currentPoint = null) {
        const drawGroup = this.svg.querySelector('#draw-group');
        drawGroup.innerHTML = '';

        const color = this.drawMode === 'subparcela'
            ? this.colors.subparcela
            : this.colors.species[this.currentSpeciesIndex % this.colors.species.length];

        if (this.currentTool === 'rectangle' && this.startPoint && currentPoint) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', Math.min(this.startPoint.x, currentPoint.x));
            rect.setAttribute('y', Math.min(this.startPoint.y, currentPoint.y));
            rect.setAttribute('width', Math.abs(currentPoint.x - this.startPoint.x));
            rect.setAttribute('height', Math.abs(currentPoint.y - this.startPoint.y));
            rect.setAttribute('fill', color);
            rect.setAttribute('fill-opacity', '0.2');
            rect.setAttribute('stroke', color);
            rect.setAttribute('stroke-width', this.strokeWidth);
            rect.setAttribute('stroke-dasharray', '5,5');
            drawGroup.appendChild(rect);
        }
        else if (this.currentTool === 'circle' && this.startPoint && currentPoint) {
            const dx = currentPoint.x - this.startPoint.x;
            const dy = currentPoint.y - this.startPoint.y;
            const radius = Math.abs(dx); // Usar apenas distância horizontal

            const centerX = this.startPoint.x + (dx > 0 ? radius : -radius);
            const centerY = this.startPoint.y + (dy > 0 ? radius : -radius);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', color);
            circle.setAttribute('fill-opacity', '0.2');
            circle.setAttribute('stroke', color);
            circle.setAttribute('stroke-width', this.strokeWidth);
            circle.setAttribute('stroke-dasharray', '5,5');
            drawGroup.appendChild(circle);
        }
        else if (this.currentTool === 'ellipse' && this.startPoint && currentPoint) {
            const rx = Math.abs(currentPoint.x - this.startPoint.x) / 2;
            const ry = Math.abs(currentPoint.y - this.startPoint.y) / 2;

            const centerX = (this.startPoint.x + currentPoint.x) / 2;
            const centerY = (this.startPoint.y + currentPoint.y) / 2;

            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            ellipse.setAttribute('cx', centerX);
            ellipse.setAttribute('cy', centerY);
            ellipse.setAttribute('rx', rx);
            ellipse.setAttribute('ry', ry);
            ellipse.setAttribute('fill', color);
            ellipse.setAttribute('fill-opacity', '0.2');
            ellipse.setAttribute('stroke', color);
            ellipse.setAttribute('stroke-width', this.strokeWidth);
            ellipse.setAttribute('stroke-dasharray', '5,5');
            drawGroup.appendChild(ellipse);
        }
        else if (this.currentTool === 'polygon' && this.polygonPoints.length > 0) {
            const points = [...this.polygonPoints];
            if (currentPoint) points.push(currentPoint);

            const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', pointsStr);
            polygon.setAttribute('fill', 'rgba(255,255,255,0.2)');
            polygon.setAttribute('stroke', '#fff');
            polygon.setAttribute('stroke-width', '2');
            polygon.setAttribute('stroke-dasharray', '5,5');
            drawGroup.appendChild(polygon);
        }
    },

    finishRectangle(endPoint) {
        // Limpar preview imediatamente
        const drawGroup = this.svg.querySelector('#draw-group');
        if (drawGroup) drawGroup.innerHTML = '';
        
        // Bloquear novos eventos temporariamente
        this.svg.style.pointerEvents = 'none';
        
        const x1 = Math.min(this.startPoint.x, endPoint.x);
        const y1 = Math.min(this.startPoint.y, endPoint.y);
        const x2 = Math.max(this.startPoint.x, endPoint.x);
        const y2 = Math.max(this.startPoint.y, endPoint.y);

        // Converter retângulo em polígono
        const points = [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 }
        ];

        this.savePolygon(points);
        
        // Resetar estado para próximo desenho
        this.startPoint = null;
        this.isDrawing = false;
        
        // Reativar pointer events para próximo desenho
        this.svg.style.pointerEvents = 'auto';
        
        if (typeof showAlert === 'function') {
            showAlert('success', '✅ Retângulo salvo! Arraste para criar outro ou ESC para parar');
        }
    },

    finishCircle(endPoint) {
        // Limpar preview imediatamente
        const drawGroup = this.svg.querySelector('#draw-group');
        if (drawGroup) drawGroup.innerHTML = '';
        
        // Bloquear novos eventos temporariamente
        this.svg.style.pointerEvents = 'none';
        
        const dx = endPoint.x - this.startPoint.x;
        const dy = endPoint.y - this.startPoint.y;
        const radius = Math.abs(dx); // Usar apenas distância horizontal

        if (radius < 5) {
            console.warn('⚠️ Círculo muito pequeno, cancelando');
            this.svg.style.pointerEvents = 'auto'; // Reativar se cancelar
            return;
        }

        // Centro deslocado na direção do arraste
        const centerX = this.startPoint.x + (dx > 0 ? radius : -radius);
        const centerY = this.startPoint.y + (dy > 0 ? radius : -radius);

        // Converter círculo em polígono (48 segmentos para suavidade)
        const points = [];
        const segments = 48;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            points.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }

        this.savePolygon(points);
        
        // Resetar estado para próximo desenho
        this.startPoint = null;
        this.isDrawing = false;
        
        // Reativar pointer events para próximo desenho
        this.svg.style.pointerEvents = 'auto';
        
        if (typeof showAlert === 'function') {
            showAlert('success', '✅ Círculo salvo! Arraste para criar outro ou ESC para parar');
        }
        
        console.log(`✅ Círculo convertido para polígono (raio: ${radius.toFixed(1)}px)`);
    },

    finishEllipse(endPoint) {
        // Limpar preview imediatamente
        const drawGroup = this.svg.querySelector('#draw-group');
        if (drawGroup) drawGroup.innerHTML = '';
        
        // Bloquear novos eventos temporariamente
        this.svg.style.pointerEvents = 'none';
        
        const rx = Math.abs(endPoint.x - this.startPoint.x) / 2;
        const ry = Math.abs(endPoint.y - this.startPoint.y) / 2;

        if (rx < 5 || ry < 5) {
            console.warn('⚠️ Elipse muito pequena, cancelando');
            this.svg.style.pointerEvents = 'auto'; // Reativar se cancelar
            return;
        }

        // Centro entre ponto inicial e final
        const centerX = (this.startPoint.x + endPoint.x) / 2;
        const centerY = (this.startPoint.y + endPoint.y) / 2;

        // Converter elipse em polígono (48 segmentos para suavidade)
        const points = [];
        const segments = 48;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            points.push({
                x: centerX + Math.cos(angle) * rx,
                y: centerY + Math.sin(angle) * ry
            });
        }

        this.savePolygon(points);
        
        // Resetar estado para próximo desenho
        this.startPoint = null;
        this.isDrawing = false;
        
        // Reativar pointer events para próximo desenho
        this.svg.style.pointerEvents = 'auto';
        
        if (typeof showAlert === 'function') {
            showAlert('success', '✅ Elipse salva! Arraste para criar outra ou ESC para parar');
        }
        
        console.log(`✅ Elipse convertida para polígono (${rx.toFixed(1)}x${ry.toFixed(1)}px)`);
    },

    finishPolygon() {
        if (this.polygonPoints.length < 3) return;
        
        console.log(`🟢 FINALIZANDO POLÍGONO - ${this.polygonPoints.length} pontos`);
        
        // Capturar dados antes de resetar
        const pointsToSave = [...this.polygonPoints];
        const currentMode = this.drawMode;
        const currentSpeciesIdx = this.currentSpeciesIndex;
        
        // Resetar pontos mas MANTER modo ativo
        this.polygonPoints = [];
        this.isDrawing = false;
        this.startPoint = null;
        
        console.log(`🔄 Estado resetado: isDrawing=${this.isDrawing}, drawMode=${this.drawMode}, pontos=${this.polygonPoints.length}`);
        console.log('✅ DrawMode PERMANECE ATIVO - próximo clique iniciará novo polígono');
        
        // NÃO resetar drawMode - manter ferramenta ativa
        // NÃO bloquear pointer-events - manter ativo
        
        // Limpar preview
        const drawGroup = this.svg.querySelector('#draw-group');
        if (drawGroup) drawGroup.innerHTML = '';
        
        // Salvar usando dados capturados
        this.savePolygonWithMode(pointsToSave, currentMode, currentSpeciesIdx);
        
        // NÃO desativar - manter ferramenta ativa para próximo polígono
        // Apenas mostrar mensagem
        if (typeof showAlert === 'function') {
            showAlert('success', '✅ Polígono salvo! Clique para desenhar outro ou pressione ESC para parar');
        }

        console.log('✅ Polígono finalizado - ferramenta permanece ativa');
    },

    savePolygon(points) {
        this.savePolygonWithMode(points, this.drawMode, this.currentSpeciesIndex);
    },

    savePolygonWithMode(points, drawMode, speciesIndex) {
        const color = drawMode === 'subparcela'
            ? this.colors.subparcela
            : this.colors.species[speciesIndex % this.colors.species.length];

        if (drawMode === 'subparcela') {
            this.subparcelaPolygon = { points };
            this.renderSubparcela();
            this.persistSubparcelaArea(points);
        } else if (drawMode === 'species') {
            if (!this.speciesPolygons[speciesIndex]) {
                this.speciesPolygons[speciesIndex] = [];
            }
            this.speciesPolygons[speciesIndex].push({ points });
            this.renderSpecies();
            this.persistSpeciesArea(speciesIndex, this.speciesPolygons[speciesIndex]);

            // Calcular e atualizar cobertura
            this.updateCoverageDisplay();
        }

        // Limpar desenho temporário
        this.svg.querySelector('#draw-group').innerHTML = '';

        console.log(`✅ Polígono salvo (${drawMode}):`, points.length, 'pontos');
    },

    renderSubparcela() {
        const subparcelaGroup = this.svg.querySelector('#subparcela-group');
        subparcelaGroup.innerHTML = '';

        if (!this.subparcelaPolygon) return;

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const pointsStr = this.subparcelaPolygon.points.map(p => `${p.x},${p.y}`).join(' ');
        polygon.setAttribute('points', pointsStr);

        const fillOpacity = this.subparcelaFillEnabled ? this.fillOpacity : 0;
        polygon.setAttribute('fill', this.colors.subparcela);
        polygon.setAttribute('fill-opacity', fillOpacity);
        polygon.setAttribute('stroke', this.colors.subparcela);
        polygon.setAttribute('stroke-width', this.strokeWidth);

        subparcelaGroup.appendChild(polygon);
    },

    renderSpecies() {
        const speciesGroup = this.svg.querySelector('#species-group');
        speciesGroup.innerHTML = '';

        Object.keys(this.speciesPolygons).forEach(speciesIndex => {
            const polygons = this.speciesPolygons[speciesIndex];
            const color = this.colors.species[speciesIndex % this.colors.species.length];
            const speciesName = this.currentSubparcela?.especies[speciesIndex]?.apelido || `Espécie ${parseInt(speciesIndex) + 1}`;

            polygons.forEach((polyData, polyIndex) => {
                // Criar grupo para polígono + rótulo
                const polygonGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                polygonGroup.dataset.speciesIndex = speciesIndex;
                polygonGroup.dataset.polygonIndex = polyIndex;
                
                // Criar polígono
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const pointsStr = polyData.points.map(p => `${p.x},${p.y}`).join(' ');
                polygon.setAttribute('points', pointsStr);

                const fillOpacity = this.fillEnabled ? this.fillOpacity : 0;
                polygon.setAttribute('fill', color);
                polygon.setAttribute('fill-opacity', fillOpacity);
                polygon.setAttribute('stroke', color);
                polygon.setAttribute('stroke-width', this.strokeWidth);

                polygonGroup.appendChild(polygon);

                // Calcular centro do polígono para posicionar rótulo
                const bounds = this.getPolygonBounds(polyData.points);
                const centerX = (bounds.minX + bounds.maxX) / 2;
                const centerY = (bounds.minY + bounds.maxY) / 2;

                // Criar rótulo
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                label.classList.add('polygon-label');
                // Permitir pointer events APENAS no rótulo, não no polígono
                label.style.pointerEvents = 'all';
                label.style.cursor = 'pointer';

                // Fundo do rótulo
                const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                labelBg.setAttribute('fill', color);
                labelBg.setAttribute('fill-opacity', '0.9');
                labelBg.setAttribute('rx', '4');
                
                // Texto do rótulo
                const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                labelText.setAttribute('x', centerX);
                labelText.setAttribute('y', centerY);
                labelText.setAttribute('text-anchor', 'middle');
                labelText.setAttribute('dominant-baseline', 'middle');
                labelText.setAttribute('fill', '#ffffff');
                labelText.setAttribute('font-size', '28');
                labelText.setAttribute('font-weight', 'bold');
                labelText.textContent = speciesName;

                label.appendChild(labelBg);
                label.appendChild(labelText);

                // Ajustar tamanho do fundo baseado no texto
                setTimeout(() => {
                    const bbox = labelText.getBBox();
                    labelBg.setAttribute('x', bbox.x - 4);
                    labelBg.setAttribute('y', bbox.y - 2);
                    labelBg.setAttribute('width', bbox.width + 8);
                    labelBg.setAttribute('height', bbox.height + 4);
                }, 0);

                // Eventos do rótulo
                label.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.deletePolygon(speciesIndex, polyIndex);
                });

                label.addEventListener('dblclick', (e) => {
                    e.preventDefault();
                    this.editPolygonVertices(speciesIndex, polyIndex);
                });

                polygonGroup.appendChild(label);
                speciesGroup.appendChild(polygonGroup);
            });
        });
    },

    getPolygonBounds(points) {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    },

    deletePolygon(speciesIndex, polygonIndex) {
        const speciesName = this.currentSubparcela?.especies[speciesIndex]?.apelido || `Espécie ${parseInt(speciesIndex) + 1}`;
        
        if (!confirm(`Apagar polígono da espécie "${speciesName}"?`)) {
            return;
        }

        // Remover polígono do array
        if (this.speciesPolygons[speciesIndex]) {
            this.speciesPolygons[speciesIndex].splice(polygonIndex, 1);
            
            // Se não sobrou nenhum polígono, remover a espécie
            if (this.speciesPolygons[speciesIndex].length === 0) {
                delete this.speciesPolygons[speciesIndex];
            }
            
            // Re-renderizar
            this.renderSpecies();
            
            // Atualizar cobertura
            this.updateCoverageDisplay();
            
            // Persistir
            if (this.speciesPolygons[speciesIndex]) {
                this.persistSpeciesArea(speciesIndex, this.speciesPolygons[speciesIndex]);
            } else {
                this.persistSpeciesArea(speciesIndex, []);
            }
            
            if (typeof showAlert === 'function') {
                showAlert('success', '✅ Polígono removido');
            }
        }
    },

    editPolygonVertices(speciesIndex, polygonIndex) {
        const speciesName = this.currentSubparcela?.especies[speciesIndex]?.apelido || `Espécie ${parseInt(speciesIndex) + 1}`;
        
        if (typeof showAlert === 'function') {
            showAlert('info', `🔧 Edição de vértices para "${speciesName}" - Em desenvolvimento`);
        }
        
        // TODO: Implementar edição de vértices
        console.log('TODO: Editar vértices do polígono', speciesIndex, polygonIndex);
    },

    render() {
        this.renderSubparcela();
        this.renderSpecies();
    },

    cancelDrawing() {
        this.isDrawing = false;
        this.startPoint = null;
        this.polygonPoints = [];
        this.svg.querySelector('#draw-group').innerHTML = '';
        console.log('❌ Desenho cancelado');
    },

    // ========================================
    // MODOS DE DESENHO
    // ========================================

    startDrawSubparcela(tool = null) {
        this.drawMode = 'subparcela';
        this.currentTool = tool; // null até o usuário selecionar ferramenta
        this.svg.style.display = 'block';
        this.svg.style.pointerEvents = 'auto';
        this.toolbar.style.display = 'flex';

        console.log('📐 Modo: Desenhar Área 100%');
        if (typeof showAlert === 'function') {
            if (tool) {
                showAlert('info', `📐 Desenhar Área 100% - ${tool === 'polygon' ? 'Clique para adicionar pontos, duplo clique para fechar' : 'Arraste para criar'}`);
            } else {
                showAlert('info', '📐 Modo Desenhar Área 100% ativado - Selecione uma ferramenta na barra (Retângulo/Polígono/Círculo/Elipse)');
            }
        }
    },

    startDrawSpecies(speciesIndex, tool = 'rectangle') {
        if (!this.subparcelaPolygon) {
            console.warn('⚠️ Defina a área 100% primeiro!');
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Primeiro defina a área de 100% da subparcela!');
            }
            return;
        }

        if (!this.currentSubparcela || !this.currentSubparcela.especies) {
            console.error('❌ Dados da subparcela não disponíveis');
            if (typeof showAlert === 'function') {
                showAlert('error', 'Erro: Dados da subparcela não carregados. Reabra o modal.');
            }
            return;
        }

        if (!this.currentSubparcela.especies[speciesIndex]) {
            console.error(`❌ Espécie ${speciesIndex} não encontrada`);
            return;
        }

        this.drawMode = 'species';
        this.currentSpeciesIndex = speciesIndex;
        this.currentTool = tool; // null até o usuário selecionar ferramenta
        this.svg.style.display = 'block';
        this.svg.style.pointerEvents = 'auto';
        this.toolbar.style.display = 'flex';

        const speciesName = this.currentSubparcela.especies[speciesIndex].apelido || `Espécie ${speciesIndex + 1}`;
        console.log(`🌿 Modo: Desenhar espécie "${speciesName}"`);
        if (typeof showAlert === 'function') {
            if (tool) {
                showAlert('info', `🌿 Desenhar "${speciesName}" - ${tool === 'polygon' ? 'Clique para pontos, duplo clique para fechar' : 'Arraste para criar'}`);
            } else {
                showAlert('info', `🌿 Desenhar "${speciesName}" - Selecione uma ferramenta na barra (Retângulo/Polígono/Círculo/Elipse)`);
            }
        }
    },

    stopDrawing() {
        this.drawMode = null;
        this.currentSpeciesIndex = null;
        this.isDrawing = false;
        this.startPoint = null;
        this.polygonPoints = [];
        this.toolbar.style.display = 'none';

        // Manter SVG visível se houver polígonos
        if (!this.subparcelaPolygon && Object.keys(this.speciesPolygons).length === 0) {
            this.svg.style.display = 'none';
        }
        this.svg.style.pointerEvents = 'none';

        this.svg.querySelector('#draw-group').innerHTML = '';
        console.log('⏹️ Modo de desenho desativado');
    },

    setTool(tool) {
        this.currentTool = tool;
        console.log(`🔧 Ferramenta: ${tool}`);
        
        // Mostrar instruções baseadas na ferramenta
        if (typeof showAlert === 'function' && this.drawMode) {
            const modeName = this.drawMode === 'subparcela' ? 'Área 100%' : 'Espécie';
            let instruction = '';
            
            switch(tool) {
                case 'rectangle':
                    instruction = 'Clique e arraste para criar um retângulo';
                    break;
                case 'polygon':
                    instruction = 'Clique para adicionar pontos, duplo-clique ou Enter para fechar';
                    break;
                case 'circle':
                    instruction = 'Clique e arraste para criar um círculo';
                    break;
                case 'ellipse':
                    instruction = 'Clique e arraste para criar uma elipse';
                    break;
            }
            
            showAlert('success', `✅ ${tool.toUpperCase()} selecionado - ${instruction}`);
        }
    },

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    async persistSubparcelaArea(points) {
        const data = {
            parcela: window.appState?.parcelaNome,
            subparcela: this.currentSubparcela.subparcela,
            area_shape: { type: 'polygon', points }
        };

        try {
            const response = await fetch('/api/subparcela/area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('✅ Área da subparcela salva');
                this.currentSubparcela.area_shape = { type: 'polygon', points };
            }
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
        }
    },

    async persistSpeciesArea(speciesIndex, polygons) {
        if (!this.currentSubparcela || !this.currentSubparcela.especies || !this.currentSubparcela.especies[speciesIndex]) {
            console.error('❌ Espécie não encontrada para persistir área');
            return;
        }

        const especie = this.currentSubparcela.especies[speciesIndex];
        const subparcelaId = this.currentSubparcela.subparcela_id || this.currentSubparcela.id || this.currentSubparcela.subparcela;
        
        const data = {
            parcela: window.appState?.parcelaNome,
            subparcela: subparcelaId,
            especie: especie.apelido || especie.especie,
            area_shapes: polygons.map(p => ({ type: 'polygon', points: p.points }))
        };

        console.log('📤 Enviando para backend:', data);

        try {
            const response = await fetch('/api/species/area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log(`✅ Áreas da espécie ${speciesIndex} salvas no backend`);
                especie.area_shapes = data.area_shapes;
            } else {
                const error = await response.json();
                console.error(`❌ Erro do backend (${response.status}):`, error);
            }
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
        }
    },

    loadSavedData() {
        console.log('💾 Carregando dados salvos...');

        // Carregar área da subparcela
        if (this.currentSubparcela.area_shape) {
            this.subparcelaPolygon = this.currentSubparcela.area_shape;
            console.log('  ✅ Área da subparcela carregada');
        }

        // Carregar áreas das espécies
        if (this.currentSubparcela.especies) {
            this.currentSubparcela.especies.forEach((esp, index) => {
                if (esp.area_shapes && Array.isArray(esp.area_shapes)) {
                    this.speciesPolygons[index] = esp.area_shapes;
                    console.log(`  ✅ Áreas da espécie ${index} "${esp.apelido}" carregadas`);
                }
            });
        }

        // Renderizar polígonos salvos
        this.render();

        // Mostrar SVG se houver polígonos
        if (this.subparcelaPolygon || Object.keys(this.speciesPolygons).length > 0) {
            this.svg.style.display = 'block';
            console.log('  📐 SVG mostrado com polígonos salvos');
        }
    },

    // ========================================
    // CÁLCULO DE COBERTURA
    // ========================================

    calculatePolygonArea(points) {
        if (!points || points.length < 3) return 0;

        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area / 2);
    },

    pointInPolygon(point, polygon) {
        if (!polygon || polygon.length < 3) return false;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },

    calculateSpeciesCoverage(speciesIndex) {
        const polygons = this.speciesPolygons[speciesIndex];
        if (!polygons || polygons.length === 0) return 0;

        // Usar Monte Carlo para calcular união
        const samples = 10000;
        let insideCount = 0;

        // Bounding box
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        polygons.forEach(polyData => {
            polyData.points.forEach(p => {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            });
        });

        // Amostrar pontos
        for (let i = 0; i < samples; i++) {
            const point = {
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY)
            };

            // Está dentro de pelo menos um polígono?
            for (let polyData of polygons) {
                if (this.pointInPolygon(point, polyData.points)) {
                    insideCount++;
                    break;
                }
            }
        }

        const boundingBoxArea = (maxX - minX) * (maxY - minY);
        return boundingBoxArea * (insideCount / samples);
    },

    calculateCoveragePercentage(speciesIndex) {
        if (!this.subparcelaPolygon) {
            console.warn('⚠️ Área total (100%) não definida');
            return 0;
        }

        const totalArea = this.calculatePolygonArea(this.subparcelaPolygon.points);
        if (totalArea === 0) return 0;

        const polygons = this.speciesPolygons[speciesIndex];
        if (!polygons || polygons.length === 0) return 0;

        // Calcular interseção com área total usando Monte Carlo
        const samples = 10000;
        let insideCount = 0;

        const totalPolygon = this.subparcelaPolygon.points;

        // Bounding box
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        polygons.forEach(polyData => {
            polyData.points.forEach(p => {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            });
        });

        for (let i = 0; i < samples; i++) {
            const point = {
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY)
            };

            // Está dentro de pelo menos um polígono da espécie?
            let inSpecies = false;
            for (let polyData of polygons) {
                if (this.pointInPolygon(point, polyData.points)) {
                    inSpecies = true;
                    break;
                }
            }

            // E dentro da área total?
            if (inSpecies && this.pointInPolygon(point, totalPolygon)) {
                insideCount++;
            }
        }

        const boundingBoxArea = (maxX - minX) * (maxY - minY);
        const intersectionArea = boundingBoxArea * (insideCount / samples);

        const percentage = (intersectionArea / totalArea) * 100;
        return Math.min(100, Math.max(0, percentage));
    },

    updateCoverageDisplay() {
        if (this.drawMode !== 'species' || this.currentSpeciesIndex === null) return;

        const percentage = this.calculateCoveragePercentage(this.currentSpeciesIndex);
        const speciesIndex = this.currentSpeciesIndex;

        console.log(`📊 Atualizando cobertura da espécie ${speciesIndex}: ${percentage.toFixed(1)}%`);

        // 1. Atualizar no card do viewer
        const speciesCard = document.getElementById(`viewer-species-${speciesIndex}`);
        if (speciesCard) {
            const detailsContainer = speciesCard.querySelector('.viewer-species-details');
            if (detailsContainer) {
                const coverageDetail = Array.from(detailsContainer.querySelectorAll('.viewer-species-detail'))
                    .find(detail => detail.querySelector('.viewer-species-detail-label')?.textContent === 'Cobertura');

                if (coverageDetail) {
                    const valueElement = coverageDetail.querySelector('.viewer-species-detail-value');
                    if (valueElement) {
                        valueElement.textContent = `${percentage.toFixed(1)}%`;
                    }
                }
            }
        }

        // 2. Atualizar no objeto da espécie (para persistência)
        if (this.currentSubparcela.especies && this.currentSubparcela.especies[speciesIndex]) {
            this.currentSubparcela.especies[speciesIndex].cobertura = parseFloat(percentage.toFixed(1));
        }

        // 3. Persistir no backend
        this.persistCoveragePercentage(speciesIndex, percentage);

        // Propagar para tabelas/análises
        if (typeof window.updateSpeciesCoverageInTables === 'function') {
            const subparcelaId = this.currentSubparcela.id || this.currentSubparcela.subparcela;
            console.log(`📤 Propagando cobertura: subparcela=${subparcelaId}, espécie=${speciesIndex}, cobertura=${percentage.toFixed(1)}%`);
            window.updateSpeciesCoverageInTables(subparcelaId, speciesIndex, percentage);
        }
    },

    async persistCoveragePercentage(speciesIndex, percentage) {
        if (!this.currentSubparcela || !this.currentSubparcela.especies || !this.currentSubparcela.especies[speciesIndex]) {
            console.error('❌ Espécie não encontrada para persistir cobertura');
            return;
        }

        const especie = this.currentSubparcela.especies[speciesIndex];
        const subparcelaId = this.currentSubparcela.id || this.currentSubparcela.subparcela;

        const data = {
            subparcela_id: subparcelaId,
            especie_nome: especie.especie || especie.apelido,
            apelido: especie.apelido,
            cobertura: parseFloat(percentage.toFixed(1))
        };

        try {
            const response = await fetch('/api/species/coverage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log(`✅ Cobertura ${percentage.toFixed(1)}% salva no backend`);
            } else {
                console.error('❌ Erro ao salvar cobertura:', await response.text());
            }
        } catch (error) {
            console.error('❌ Erro ao persistir cobertura:', error);
        }
    },

    // ========================================
    // LIMPEZA
    // ========================================

    destroy() {
        if (this.svg) {
            this.svg.remove();
            this.svg = null;
        }
        if (this.toolbar) {
            this.toolbar.remove();
            this.toolbar = null;
        }
        this.drawMode = null;
        this.isDrawing = false;
        this.polygonPoints = [];
        console.log('🗑️ SVGCoverageDrawer destruído');
    }
};

// Exportar globalmente
window.SVGCoverageDrawer = SVGCoverageDrawer;
