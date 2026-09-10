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
    // Convencao Camada 1: pontos em this.subparcelaPolygon.points e
    // this.speciesPolygons[idx][i].points sao SEMPRE em pixels do SVG (espaco da
    // imagem natural). A conversao para/de 0..100 (formato canonico do
    // backend e da IA) acontece apenas em loadSavedData() e nas funcoes
    // persistSubparcelaArea / persistSpeciesArea.
    subparcelaPolygon: null,  // { points: [{x,y}, ...] }  -- em pixels
    speciesPolygons: {},       // { speciesIndex: [{ points: [{x,y}, ...] }, ...] }  -- em pixels
    hiddenSpecies: {},         // { speciesIndex: true } -- visibilidade por morfotipo (Camada 2)

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

    // Estado de viewport (Camada 2 vai ligar nos controles de UI)
    // Os polygons nao mudam quando isto muda; somente a transform aplicada ao <g> de renderizacao.
    viewportTransform: { zoom: 1, panX: 0, panY: 0, rotation: 0 },

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
        // Camada 2: SVG vai dentro de #canvas-stage para herdar a transform
        // de zoom/pan/rotacao aplicada ao wrapper. Cai para viewer-img-container
        // se canvas-stage nao existir (compatibilidade).
        this.imageContainer = document.getElementById('canvas-stage')
            || document.getElementById('viewer-img-container');

        // BUGFIX: este objeto é um singleton reutilizado para TODAS as
        // subparcelas (não é recriado por subparcela). init() é chamado a
        // cada troca de foto no viewer (ver o wrap de updateViewerContent em
        // app.js), mas loadSavedData() só SOBRESCREVE subparcelaPolygon/
        // speciesPolygons quando a subparcela atual tem dados - se ela não
        // tiver (ex: usuário ainda não desenhou nada aqui), os polígonos da
        // subparcela ANTERIOR ficavam presos em memória e reapareciam
        // desenhados por cima da foto nova. Resetar tudo aqui, sempre, antes
        // de loadSavedData() popular de novo a partir da subparcela atual.
        this.subparcelaPolygon = null;
        this.speciesPolygons = {};
        this.hiddenSpecies = {};
        this.drawMode = null;
        this.currentSpeciesIndex = null;
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPath = null;
        this.polygonPoints = [];
        this.currentPreviewShape = null;
        this.viewportTransform = { zoom: 1, panX: 0, panY: 0, rotation: 0 };
        this._editingVertices = null;
        this._draggingVertex = null;

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

        // Toolbar deve ficar FORA do canvas-stage (que rotaciona/escala),
        // senao gira junto com a imagem. Anexar ao container externo.
        const toolbarHost = document.getElementById('viewer-img-container') || this.imageContainer;
        toolbarHost.appendChild(this.toolbar);
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
        // mousedown/move/up/dblclick vao no this.svg, que e recriado do zero
        // em createSVG() a cada init() (o elemento antigo e removido, entao
        // seus listeners somem junto). O keydown, porem, vai no `document`,
        // que NUNCA e recriado - sem remover o listener antigo antes,
        // cada troca de subparcela empilhava mais um handler de keydown
        // (bug real: depois de navegar por varias subparcelas, Enter/Esc no
        // modo de desenho disparavam a acao varias vezes de uma vez). Guarda
        // a referencia vinculada para poder remove-la aqui e em destroy().
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }
        this._keydownHandler = (e) => this.onKeyDown(e);

        this.svg.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.svg.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.svg.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.svg.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        document.addEventListener('keydown', this._keydownHandler);
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
        // Edição de vértices: clique no fundo (fora de uma alça, que já parou
        // a propagação no próprio mousedown dela) conclui e salva a edição.
        if (this._editingVertices) {
            this.finishVertexEditing();
            return;
        }

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
            // Ignorar segundo clique do duplo-clique para evitar ponto duplicado
            if (e.detail > 1) {
                e.preventDefault();
                return;
            }

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
        if (this._draggingVertex) {
            e.preventDefault();
            this.dragVertexTo(this.getSVGPoint(e));
            return;
        }

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
        if (this._draggingVertex) {
            e.preventDefault();
            this._draggingVertex = null;
            return;
        }

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

        switch (e.key.toLowerCase()) {
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
        // BUGFIX: um polígono degenerado (área ~0 - ex: retângulo desenhado
        // sem arraste real, ou pontos quase colineares) era salvo do mesmo
        // jeito. Se isso acontecesse com a Área 100%, calculatePolygonArea()
        // retornava 0 e TODAS as espécies passavam a calcular 0% de cobertura
        // (divisão por área total praticamente zero), sem nenhum aviso claro
        // do motivo. Recusar aqui, cedo, com uma mensagem que explica o que
        // aconteceu.
        const area = this.calculatePolygonArea(points);
        if (area < 4) { // ~2x2px: tolera imprecisão de clique, rejeita clique acidental
            console.warn(`⚠️ Polígono descartado: área ${area.toFixed(2)}px² (degenerado/sem arraste real)`);
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Polígono não salvo: área quase zero. Arraste/clique para formar uma área real antes de finalizar.');
            }
            return;
        }

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

            // Cada polígono desenhado representa um indivíduo/touceira - contagem
            // sobe junto (mesma regra que "Recalcular" já aplicava em lote)
            this.updateIndividualCount(speciesIndex);

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

        // Rótulo clicável (duplo-clique edita os vértices) - mesmo padrão
        // usado nos polígonos de espécie em renderSpecies()
        const bounds = this.getPolygonBounds(this.subparcelaPolygon.points);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        label.classList.add('polygon-label');
        label.style.pointerEvents = 'all';
        label.style.cursor = 'pointer';

        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('fill', this.colors.subparcela);
        labelBg.setAttribute('fill-opacity', '0.9');
        labelBg.setAttribute('rx', '4');

        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', (bounds.minX + bounds.maxX) / 2);
        labelText.setAttribute('y', bounds.minY + 20);
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('dominant-baseline', 'middle');
        labelText.setAttribute('fill', '#ffffff');
        labelText.setAttribute('font-size', '28');
        labelText.setAttribute('font-weight', 'bold');
        labelText.textContent = 'Área 100%';

        label.appendChild(labelBg);
        label.appendChild(labelText);

        setTimeout(() => {
            const bbox = labelText.getBBox();
            labelBg.setAttribute('x', bbox.x - 4);
            labelBg.setAttribute('y', bbox.y - 2);
            labelBg.setAttribute('width', bbox.width + 8);
            labelBg.setAttribute('height', bbox.height + 4);
        }, 0);

        label.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.editSubparcelaVertices();
        });

        subparcelaGroup.appendChild(label);
    },

    renderSpecies() {
        const speciesGroup = this.svg.querySelector('#species-group');
        speciesGroup.innerHTML = '';

        Object.keys(this.speciesPolygons).forEach(speciesIndex => {
            // Camada 2: respeitar toggle de visibilidade por morfotipo
            if (this.hiddenSpecies && this.hiddenSpecies[speciesIndex]) {
                return;
            }

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

            // Atualizar cobertura e contagem de indivíduos (índice explícito -
            // pode não ser o mesmo da espécie ativa no modo de desenho)
            this.updateCoverageDisplay(speciesIndex);
            this.updateIndividualCount(speciesIndex);

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

    // ========================================
    // EDIÇÃO DE VÉRTICES (ajuste manual de polígonos - desenhados à mão OU
    // importados da IA, ambos guardados no mesmo formato this.speciesPolygons)
    // ========================================

    editPolygonVertices(speciesIndex, polygonIndex) {
        const speciesName = this.currentSubparcela?.especies[speciesIndex]?.apelido || `Espécie ${parseInt(speciesIndex) + 1}`;
        const polyData = this.speciesPolygons[speciesIndex]?.[polygonIndex];

        if (!polyData) {
            console.error('❌ Polígono não encontrado para edição', speciesIndex, polygonIndex);
            if (typeof showAlert === 'function') {
                showAlert('error', 'Polígono não encontrado.');
            }
            return;
        }

        this._startVertexEditing({ type: 'species', speciesIndex, polygonIndex });

        if (typeof showAlert === 'function') {
            showAlert('info', `✏️ Editando "${speciesName}" - arraste os pontos (círculos azuis) para ajustar o contorno. Clique fora do polígono para concluir e salvar.`);
        }
    },

    // PEDIDO: Área 100% também precisa ser editável manualmente (antes só
    // dava para redesenhar do zero com "Definir Área 100%", perdendo
    // qualquer ajuste fino já feito). Mesmo mecanismo de arrastar vértices
    // usado nas espécies, só que mirando this.subparcelaPolygon.
    editSubparcelaVertices() {
        if (!this.subparcelaPolygon) {
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Defina a Área 100% primeiro (botão "Definir Área 100%").');
            }
            return;
        }

        this._startVertexEditing({ type: 'subparcela' });

        if (typeof showAlert === 'function') {
            showAlert('info', '✏️ Editando Área 100% - arraste os pontos (círculos azuis) para ajustar o contorno. Clique fora do polígono para concluir e salvar.');
        }
    },

    // Helper compartilhado por editPolygonVertices/editSubparcelaVertices
    _startVertexEditing(target) {
        // Sair de qualquer modo de desenho ativo antes de editar
        this.drawMode = null;
        this.isDrawing = false;
        this.polygonPoints = [];
        if (this.toolbar) this.toolbar.style.display = 'none';

        this._editingVertices = target;
        this.renderVertexHandles();
        this.svg.style.display = 'block';
        this.svg.style.pointerEvents = 'auto';
    },

    // Resolve this._editingVertices para o array de pontos que está sendo
    // editado no momento (da espécie+polígono, ou da área 100% da subparcela)
    _getEditingPolyData() {
        if (!this._editingVertices) return null;
        if (this._editingVertices.type === 'subparcela') {
            return this.subparcelaPolygon;
        }
        const { speciesIndex, polygonIndex } = this._editingVertices;
        return this.speciesPolygons[speciesIndex]?.[polygonIndex];
    },

    renderVertexHandles() {
        this.clearVertexHandles();
        const polyData = this._getEditingPolyData();
        if (!polyData) return;

        const handleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        handleGroup.id = 'vertex-handle-group';
        handleGroup.style.pointerEvents = 'all';

        // Área 100% em azul-arroxeado (this.colors.subparcela) para distinguir
        // visualmente das alças de espécie (azul padrão)
        const handleColor = this._editingVertices.type === 'subparcela' ? this.colors.subparcela : '#2196F3';

        polyData.points.forEach((pt, ptIdx) => {
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            handle.setAttribute('cx', pt.x);
            handle.setAttribute('cy', pt.y);
            handle.setAttribute('r', 12);
            handle.setAttribute('fill', '#ffffff');
            handle.setAttribute('stroke', handleColor);
            handle.setAttribute('stroke-width', 4);
            handle.style.cursor = 'move';

            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation(); // não deixar o mousedown "vazar" pro fundo (que conclui a edição)
                this._draggingVertex = { pointIndex: ptIdx };
            });

            handleGroup.appendChild(handle);
        });

        this.svg.appendChild(handleGroup);
    },

    clearVertexHandles() {
        const old = this.svg?.querySelector('#vertex-handle-group');
        if (old) old.remove();
    },

    dragVertexTo(point) {
        if (!this._editingVertices || !this._draggingVertex) return;
        const polyData = this._getEditingPolyData();
        if (!polyData) return;

        polyData.points[this._draggingVertex.pointIndex] = point;

        // Redesenha o polígono em tempo real + reposiciona as alças
        if (this._editingVertices.type === 'subparcela') {
            this.renderSubparcela();
        } else {
            this.renderSpecies();
        }
        this.renderVertexHandles();
    },

    async finishVertexEditing() {
        if (!this._editingVertices) return;
        const target = this._editingVertices;

        this.clearVertexHandles();
        this._editingVertices = null;
        this._draggingVertex = null;
        this.svg.style.pointerEvents = 'none';

        // BUGFIX: antes chamava persistX() sem esperar e mostrava "salvo com
        // sucesso" de qualquer jeito - se o backend rejeitasse (400) ou a
        // rede falhasse, o usuário via uma confirmação falsa e achava que
        // tinha salvo quando não tinha. Agora aguarda o resultado real.
        let result = { ok: true };
        if (target.type === 'subparcela') {
            if (this.subparcelaPolygon) {
                result = await this.persistSubparcelaArea(this.subparcelaPolygon.points);
            }
        } else if (this.speciesPolygons[target.speciesIndex]) {
            // Mesma persistência usada por desenho manual e importação da IA -
            // a edição de um polígono importado passa a ser salva igual
            result = await this.persistSpeciesArea(target.speciesIndex, this.speciesPolygons[target.speciesIndex]);
            this.updateCoverageDisplay(target.speciesIndex);
        }

        if (typeof showAlert === 'function') {
            if (result && result.ok === false) {
                showAlert('error', `❌ Não foi possível salvar a edição: ${result.error || 'erro desconhecido'}. Tente novamente.`);
            } else {
                showAlert('success', '✅ Edição concluída e salva.');
            }
        }
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

            switch (tool) {
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
        // pontos chegam em pixels; converter para 0..100 antes de enviar
        const pointsPct = this._pxToPct(points);
        const data = {
            parcela: window.appState?.parcelaNome,
            subparcela: this.currentSubparcela.subparcela,
            area_shape: { type: 'polygon', points: pointsPct }
        };

        // BUGFIX: essa função nunca informava quem chamou se o salvamento
        // realmente funcionou - finishVertexEditing() mostrava "salvo com
        // sucesso" incondicionalmente, mesmo quando o backend rejeitava
        // (400) ou a rede falhava. Agora retorna {ok, error} pra quem chamar
        // poder mostrar a mensagem certa.
        try {
            const response = await fetch('/api/subparcela/area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('✅ Área da subparcela salva (0..100)');
                this.currentSubparcela.area_shape = { type: 'polygon', points: pointsPct };
                return { ok: true };
            }
            const err = await response.json().catch(() => ({}));
            console.error('❌ Backend rejeitou area_shape:', response.status, err);
            return { ok: false, error: err.error || `HTTP ${response.status}` };
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            return { ok: false, error: error.message };
        }
    },

    async persistSpeciesArea(speciesIndex, polygons) {
        if (!this.currentSubparcela || !this.currentSubparcela.especies || !this.currentSubparcela.especies[speciesIndex]) {
            console.error('❌ Espécie não encontrada para persistir área');
            return;
        }

        const especie = this.currentSubparcela.especies[speciesIndex];
        const subparcelaId = this.currentSubparcela.subparcela_id || this.currentSubparcela.id || this.currentSubparcela.subparcela;

        // pontos chegam em pixels; converter para 0..100 antes de enviar
        const data = {
            parcela: window.appState?.parcelaNome,
            subparcela: subparcelaId,
            especie: especie.apelido || especie.especie,
            area_shapes: polygons
                .filter(p => p && p.points && p.points.length >= 3)
                .map(p => ({ type: 'polygon', points: this._pxToPct(p.points) }))
        };

        console.log('📤 Enviando para backend (0..100):', data);

        // BUGFIX: mesmo problema de persistSubparcelaArea() - retornar
        // {ok, error} pra quem chamar (finishVertexEditing etc) poder
        // confirmar de verdade em vez de assumir sucesso sempre.
        try {
            const response = await fetch('/api/species/area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log(`✅ Áreas da espécie ${speciesIndex} salvas no backend`);
                especie.area_shapes = data.area_shapes;
                return { ok: true };
            }
            const error = await response.json().catch(() => ({}));
            console.error(`❌ Erro do backend (${response.status}):`, error);
            return { ok: false, error: error.error || `HTTP ${response.status}` };
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            return { ok: false, error: error.message };
        }
    },

    // ========================================
    // CONVERSAO DE COORDENADAS (Camada 1)
    // Formato canonico (backend/IA/storage): 0..100 normalizado
    // Formato interno (frontend, render, edicao): pixels do SVG
    // ========================================

    _imageDims() {
        const w = this.image?.naturalWidth;
        const h = this.image?.naturalHeight;
        if (!w || !h) {
            console.warn('⚠️ Imagem sem dimensoes naturais; usando 100x100');
            return { w: 100, h: 100 };
        }
        return { w, h };
    },

    _pctToPx(points) {
        if (!points || points.length === 0) return points;
        const { w, h } = this._imageDims();
        return points.map(p => ({
            x: (Number(p.x) / 100) * w,
            y: (Number(p.y) / 100) * h
        }));
    },

    _pxToPct(points) {
        if (!points || points.length === 0) return points;
        const { w, h } = this._imageDims();
        // Clipar em [0,100]: desenhar perto da borda (comum com zoom) pode
        // gerar 1-2px além do natural width/height da imagem: sem isso, o
        // backend (validate_polygon_pct, tolerância de 0.5) rejeitava o
        // polígono inteiro com 400 em vez de aceitar clipado na borda.
        const clip = (v) => Math.max(0, Math.min(100, v));
        return points.map(p => ({
            x: +clip((Number(p.x) / w) * 100).toFixed(4),
            y: +clip((Number(p.y) / h) * 100).toFixed(4)
        }));
    },

    loadSavedData() {
        console.log('💾 Carregando dados salvos (formato canonico 0..100 -> px)...');

        // Carregar área da subparcela (sempre interpretado como 0..100).
        // area_shapes (persistido via edição manual/import anterior) tem
        // prioridade - é sempre a "última versão". Só se NADA foi salvo
        // ainda é que caímos no fallback abaixo (importar da IA automaticamente).
        if (this.currentSubparcela.area_shape) {
            const points = this.currentSubparcela.area_shape.points;
            if (points && points.length) {
                this.subparcelaPolygon = { points: this._pctToPx(points) };
                console.log('  ✅ Área da subparcela carregada (salva/editada anteriormente)');
            }
        }

        // Carregar áreas das espécies já salvas (desenhadas/editadas manualmente
        // ou importadas e persistidas em uma visita anterior ao editor)
        if (this.currentSubparcela.especies) {
            this.currentSubparcela.especies.forEach((esp, index) => {
                if (esp.area_shapes && Array.isArray(esp.area_shapes)) {
                    const processedShapes = esp.area_shapes
                        .filter(shape => shape && shape.points && shape.points.length >= 3)
                        .map(shape => ({ points: this._pctToPx(shape.points) }));

                    if (processedShapes.length) {
                        this.speciesPolygons[index] = processedShapes;
                        console.log(`  ✅ Áreas da espécie ${index} "${esp.apelido}" carregadas (${processedShapes.length} pol, salva anteriormente)`);
                    }
                }
            });
        }

        // BUGFIX/PEDIDO: polígonos da IA não devem depender de clique num
        // botão - aparecem automaticamente ao abrir o editor. Mas só
        // importamos aqui o que AINDA NÃO tem uma versão salva (acima): uma
        // vez que o usuário edita manualmente (o que persiste em
        // area_shapes via persistSpeciesArea/persistSubparcelaArea), essa
        // versão editada sempre tem prioridade e a IA não a sobrescreve mais
        // - "mostrar sempre a última versão" significa a mais recentemente
        // salva, seja ela da IA ou de uma edição manual.
        this.importAIDetectedAreas({ silent: true, onlyMissing: true });

        // Renderizar polígonos (salvos e/ou recém-importados da IA acima)
        this.render();

        // Mostrar SVG se houver polígonos
        if (this.subparcelaPolygon || Object.keys(this.speciesPolygons).length > 0) {
            this.svg.style.display = 'block';
            console.log('  📐 SVG mostrado com polígonos');
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
        if (totalArea < 4) {
            // Área 100% degenerada (salva antes do bugfix em savePolygonWithMode,
            // ou importada de um area_shape ruim) - toda espécie daria 0% aqui
            // silenciosamente. Avisar em vez de deixar o usuário achar que o
            // desenho da espécie que está errado.
            console.error(`❌ Área 100% degenerada (${totalArea.toFixed(2)}px²) - redesenhe com "Definir Área 100%"`);
            if (typeof showAlert === 'function') {
                showAlert('error', '❌ A Área 100% salva está inválida (praticamente sem área). Clique em "Definir Área 100%" e desenhe novamente antes de recalcular.');
            }
            return 0;
        }

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

    updateIndividualCount(speciesIndex) {
        if (!this.currentSubparcela?.especies || !this.currentSubparcela.especies[speciesIndex]) return;

        const count = this.speciesPolygons[speciesIndex]?.length || 0;
        this.currentSubparcela.especies[speciesIndex].numero_individuos = count;

        const speciesCard = document.getElementById(`viewer-species-${speciesIndex}`);
        if (speciesCard) {
            const detail = Array.from(speciesCard.querySelectorAll('.viewer-species-detail'))
                .find(d => d.querySelector('.viewer-species-detail-label')?.textContent === 'Indivíduos');
            const valueElement = detail?.querySelector('.viewer-species-detail-value');
            if (valueElement) valueElement.textContent = count;
        }
    },

    updateCoverageDisplay(speciesIndex = this.currentSpeciesIndex) {
        // BUGFIX: antes ignorava o parâmetro e sempre usava this.currentSpeciesIndex
        // + exigia drawMode === 'species' - chamadas fora do modo de desenho ativo
        // (ex: deletePolygon apagando uma área de OUTRA espécie) viravam no-op ou
        // atualizavam a espécie errada. Aceita explicitamente qual espécie recalcular.
        if (speciesIndex === null || speciesIndex === undefined) return;

        const percentage = this.calculateCoveragePercentage(speciesIndex);

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

        // Camada 6: notificar analises agregadas (fitossociologia, monitoramento, etc)
        if (typeof window.notifySubparcelaUpdated === 'function') {
            const subparcelaId = this.currentSubparcela.id || this.currentSubparcela.subparcela;
            window.notifySubparcelaUpdated(subparcelaId);
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
    // IMPORTAÇÃO DE ÁREAS DA IA
    // ========================================

    // options.silent: nao mostrar alerts (usado na chamada automatica ao
    // abrir o editor - so faz sentido alertar quando o usuario clica o botao
    // "Importar Areas IA" de proposito).
    // options.onlyMissing: so importar espécies/área que AINDA NAO tem
    // polígono carregado (this.speciesPolygons[i]/this.subparcelaPolygon
    // vazios) - usado na chamada automática para nunca sobrescrever uma
    // versão já salva/editada manualmente (essa sempre "vence"). O botão
    // manual continua sem essa restrição (permite reimportar/adicionar).
    importAIDetectedAreas(options = {}) {
        const { silent = false, onlyMissing = false } = options;
        const notify = (type, msg) => {
            if (!silent && typeof showAlert === 'function') showAlert(type, msg);
        };

        if (!this.currentSubparcela) {
            console.error('❌ Dados da subparcela não disponíveis');
            notify('error', 'Erro: Dados da subparcela não carregados. Reabra o modal.');
            return;
        }

        // BUGFIX (reescrito 2026-09): a versão anterior "adivinhava" se cada
        // polígono estava em % ou em pixels checando se max(x,y) <= 100, e
        // convertia inline (duplicado 5x) com fallback silencioso para uma
        // "imagem" de 100x100 quando this.image não tinha dimensões prontas.
        // Isso é ambíguo por natureza (um polígono pixel pequeno, perto da
        // origem, passa no mesmo teste que um polígono percentual real) e
        // causava tanto conversão dupla quanto perda de escala - os sintomas
        // relatados ("polígonos da IA viram quadradinhos agrupados fora da
        // área da imagem") batem exatamente com isso. TODOS os formatos que a
        // IA/backend retornam aqui (species_shapes, area_shapes, areas,
        // polygon_json, coordenadas/polygon, area_shape da subparcela) usam o
        // mesmo contrato canônico 0..100% documentado no topo do arquivo, sem
        // exceção - então a conversão correta é SEMPRE via this._pctToPx(),
        // nunca uma decisão por heurística de magnitude.
        if (!this.image || !this.image.naturalWidth || !this.image.naturalHeight) {
            console.error('❌ Imagem ainda não carregada - não é possível converter coordenadas da IA');
            notify('error', 'Aguarde a imagem carregar completamente antes de importar áreas da IA.');
            return;
        }

        console.log('🤖 Importando áreas detectadas pela IA...');

        let areasImportadas = 0;
        let especiesComAreas = 0;

        // Normaliza um ponto em qualquer formato aceito ({x,y} ou [x,y]) para {x,y}
        const toXY = (p) => Array.isArray(p) ? { x: Number(p[0]) || 0, y: Number(p[1]) || 0 } : { x: Number(p?.x) || 0, y: Number(p?.y) || 0 };

        // Verificar se há dados de polígonos da IA nas espécies
        if (this.currentSubparcela.especies) {
            this.currentSubparcela.especies.forEach((esp, index) => {
                // onlyMissing: espécie já tem polígono carregado (salvo/editado
                // anteriormente) - não sobrescrever nem duplicar com o da IA.
                if (onlyMissing && this.speciesPolygons[index] && this.speciesPolygons[index].length > 0) {
                    return;
                }

                console.log(`🔍 Inspecionando espécie ${index} (${esp.apelido}):`, Object.keys(esp));

                // Lista de polígonos crus (ainda em %), cada um {points: [{x,y}%,...]}
                let rawPolygons = null;

                // Formato 1: species_shapes no resultado (polígonos por espécie, já no formato canônico)
                if (esp.species_shapes && Array.isArray(esp.species_shapes) && esp.species_shapes.length > 0) {
                    rawPolygons = esp.species_shapes.map(shape => ({ points: (shape.points || []).map(toXY) }));
                }
                // Formato 2: area_shapes (persistido anteriormente via persistSpeciesArea, também canônico %)
                else if (esp.area_shapes && Array.isArray(esp.area_shapes) && esp.area_shapes.length > 0) {
                    rawPolygons = esp.area_shapes.map(shape => ({ points: (shape.points || []).map(toXY) }));
                }
                // Formato 3: polygon_json com coordenadas percentuais
                else if (esp.polygon_json && esp.polygon_json.points) {
                    rawPolygons = [{ points: esp.polygon_json.points.map(toXY) }];
                }
                // Formato 4: coordenadas JSON diretas (x, y em %)
                else if (esp.coordenadas || esp.polygon) {
                    const coords = esp.coordenadas || esp.polygon;
                    if (coords.points && Array.isArray(coords.points)) {
                        rawPolygons = [{ points: coords.points.map(toXY) }];
                    }
                }
                // Formato 5: 'areas' como array de polígonos (multishape) ou array de pontos (single shape)
                else if (esp.areas && Array.isArray(esp.areas) && esp.areas.length > 0) {
                    const firstItem = esp.areas[0];

                    // Caso 5A: Array de Polígonos [[{x,y}|[x,y], ...], [...]]
                    if (Array.isArray(firstItem) && firstItem.length > 0 && typeof firstItem[0] === 'object') {
                        rawPolygons = esp.areas.map(polyPoints => ({ points: polyPoints.map(toXY) }));
                        console.log(`  📐 Identificado 'areas' como lista de ${rawPolygons.length} polígonos`);
                    }
                    // Caso 5B: Único polígono em formato de array de pontos [{x,y}, {x,y}...]
                    else if (typeof firstItem === 'object' && 'x' in firstItem) {
                        rawPolygons = [{ points: esp.areas.map(toXY) }];
                        console.log(`  📐 Identificado 'areas' como único polígono de ${rawPolygons[0].points.length} pontos`);
                    }
                    // Caso 5C: Único polígono em formato array de arrays [[x,y], [x,y]...]
                    else if (Array.isArray(firstItem) && firstItem.length >= 2 && typeof firstItem[0] === 'number') {
                        rawPolygons = [{ points: esp.areas.map(toXY) }];
                        console.log(`  📐 Identificado 'areas' como único polígono (formato array) de ${rawPolygons[0].points.length} pontos`);
                    }
                }

                if (rawPolygons && rawPolygons.length > 0) {
                    if (!this.speciesPolygons[index]) {
                        this.speciesPolygons[index] = [];
                    }

                    rawPolygons.forEach(poly => {
                        if (poly.points && poly.points.length >= 3) {
                            // Única conversão %->px, canônica, sem adivinhação
                            this.speciesPolygons[index].push({ points: this._pctToPx(poly.points) });
                            areasImportadas++;
                        }
                    });

                    // BUGFIX: importar só atualizava o estado em memória
                    // (this.speciesPolygons) - nunca persistia no backend nem
                    // no objeto real da subparcela (this.currentSubparcela,
                    // que agora É o dado real - ver fix em initializeCoverageDrawer).
                    // Resultado: as áreas importadas ficavam visíveis só até
                    // fechar o modal; ao reabrir, loadSavedData() lia
                    // esp.area_shapes (nunca escrito pelo import) e sumiam.
                    // Mesma persistência que o desenho manual já fazia.
                    if (this.speciesPolygons[index].length > 0) {
                        this.persistSpeciesArea(index, this.speciesPolygons[index]);
                    }

                    especiesComAreas++;
                    console.log(`  ✅ Espécie "${esp.apelido}": ${rawPolygons.length} polígono(s) importado(s)`);
                }
            });
        }

        // Verificar área da subparcela (area_shape)
        if (this.currentSubparcela.area_shape && !this.subparcelaPolygon) {
            const points = (this.currentSubparcela.area_shape.points || []).map(toXY);

            if (points.length >= 3) {
                this.subparcelaPolygon = { points: this._pctToPx(points) };
                console.log('  ✅ Área 100% da subparcela importada');
                // Mesmo bugfix acima: persistir a área importada também
                this.persistSubparcelaArea(this.subparcelaPolygon.points);
            }
        }

        // Re-renderizar
        this.render();

        // Mostrar SVG
        if (this.subparcelaPolygon || Object.keys(this.speciesPolygons).length > 0) {
            this.svg.style.display = 'block';
        }

        // Feedback ao usuário (notify() já é no-op quando silent=true - a
        // chamada automática ao abrir o editor não deve interromper com alerts)
        if (areasImportadas > 0) {
            notify('success', `✅ Importadas ${areasImportadas} área(s) de ${especiesComAreas} espécie(s) da IA`);
        } else {
            notify('warning', '⚠️ Nenhuma área detectada pela IA foi encontrada. A IA pode não ter retornado polígonos ou os dados não estão no formato esperado.');
        }

        console.log(`🤖 Importação concluída: ${areasImportadas} áreas de ${especiesComAreas} espécies`);
    },

    // ========================================
    // LIMPEZA
    // ========================================

    // === CÁLCULO DE COBERTURA (RECALCULAR BUTTON) ===
    calculateCoverage() {
        console.log('🔄 Recalculando cobertura para TODAS as espécies...');

        // Verificações básicas
        if (!this.subparcelaPolygon) {
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Primeiro defina a área 100% antes de recalcular!');
            }
            console.warn('⚠️ Área total (100%) não definida');
            return;
        }

        if (!this.currentSubparcela || !this.currentSubparcela.especies) {
            if (typeof showAlert === 'function') {
                showAlert('error', 'Dados da subparcela não carregados.');
            }
            return;
        }

        let updatedCount = 0;
        const especies = this.currentSubparcela.especies;

        // Iterar sobre todas as espécies
        for (let speciesIndex = 0; speciesIndex < especies.length; speciesIndex++) {
            const polygons = this.speciesPolygons[speciesIndex];
            const especie = especies[speciesIndex];

            if (polygons && polygons.length > 0) {
                // Calcular cobertura
                const percentage = this.calculateCoveragePercentage(speciesIndex);
                especie.cobertura = parseFloat(percentage.toFixed(1));

                // Atualizar numero_individuos baseado na contagem de polígonos
                especie.numero_individuos = polygons.length;

                console.log(`  ✓ ${especie.apelido}: ${percentage.toFixed(1)}% cob, ${polygons.length} ind`);

                // Atualizar UI do viewer
                const speciesCard = document.getElementById(`viewer-species-${speciesIndex}`);
                if (speciesCard) {
                    const details = speciesCard.querySelectorAll('.viewer-species-detail');
                    details.forEach(detail => {
                        const label = detail.querySelector('.viewer-species-detail-label');
                        const value = detail.querySelector('.viewer-species-detail-value');
                        if (label && value) {
                            if (label.textContent === 'Cobertura') {
                                value.textContent = `${especie.cobertura}%`;
                            } else if (label.textContent === 'Indivíduos') {
                                value.textContent = especie.numero_individuos;
                            }
                        }
                    });
                }

                // Persistir no backend
                this.persistCoveragePercentage(speciesIndex, percentage);

                updatedCount++;
            } else {
                // Sem polígonos desenhados
                console.log(`  ⚠️ ${especie.apelido}: sem polígonos desenhados`);
            }
        }

        // Atualizar appState se disponível
        if (window.appState && window.appState.analysisResults) {
            const subparcelaId = this.currentSubparcela.subparcela || this.currentSubparcela.id;
            const result = window.appState.analysisResults.find(r => r.subparcela == subparcelaId);
            if (result) {
                result.especies = especies;
                console.log('✅ appState.analysisResults atualizado');
            }
        }

        // Atualizar tabelas principais
        if (typeof recalcularEspeciesUnificadas === 'function') {
            recalcularEspeciesUnificadas();
        }
        if (typeof displaySubparcelas === 'function') {
            displaySubparcelas();
        }
        if (typeof displaySpeciesTable === 'function') {
            displaySpeciesTable();
        }

        if (typeof showAlert === 'function') {
            showAlert('success', `✅ ${updatedCount} espécies recalculadas com base nos polígonos desenhados!`);
        }

        console.log(`🔄 Recálculo concluído: ${updatedCount} espécies atualizadas`);
    },

    calculatePolygonArea(vertices) {
        let total = 0;
        for (let i = 0, l = vertices.length; i < l; i++) {
            const addX = vertices[i].x;
            const addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
            const subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
            const subY = vertices[i].y;

            total += (addX * addY * 0.5);
            total -= (subX * subY * 0.5);
        }
        return Math.abs(total);
    },

    destroy() {
        if (this.svg) {
            this.svg.remove();
            this.svg = null;
        }
        if (this.toolbar) {
            this.toolbar.remove();
            this.toolbar = null;
        }
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        // Mesmo reset de estado por-subparcela feito em init() - destroy()
        // é o outro ponto de entrada (fechar o viewer) e precisa deixar o
        // singleton limpo para a próxima vez que for aberto, mesma razão
        // do bugfix em init() (ver comentário lá).
        this.currentSubparcela = null;
        this.subparcelaPolygon = null;
        this.speciesPolygons = {};
        this.hiddenSpecies = {};
        this.drawMode = null;
        this.currentSpeciesIndex = null;
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPath = null;
        this.polygonPoints = [];
        this.currentPreviewShape = null;
        this.viewportTransform = { zoom: 1, panX: 0, panY: 0, rotation: 0 };
        this._editingVertices = null;
        this._draggingVertex = null;
        console.log('🗑️ SVGCoverageDrawer destruído');
    }
};

// Exportar globalmente
window.SVGCoverageDrawer = SVGCoverageDrawer;

// Alias para compatibilidade com app.js
window.CoverageDrawer = SVGCoverageDrawer;
