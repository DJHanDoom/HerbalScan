// ========================================
// COVERAGE DRAWER v2.0 - Sistema Moderno
// ========================================
// Arquitetura: Canvas Fixo com Coordenadas Normalizadas
// - Canvas é uma área fixa que cobre o container
// - Polígonos armazenados em coordenadas relativas (0-1)
// - Zoom/pan não afeta as coordenadas dos polígonos
// - Sistema similar ao Photoshop: canvas = fundo, imagem = layer1, polígonos = layers

const CoverageDrawer = {
    // ===== ELEMENTOS DOM =====
    canvas: null,
    ctx: null,
    image: null,
    imageContainer: null,
    toolbar: null,

    // ===== ESTADO DA APLICAÇÃO =====
    currentSubparcela: null,
    drawMode: null, // 'subparcela' | 'species' | null
    currentSpeciesIndex: null,
    currentShapeType: 'rectangle', // 'rectangle' | 'circle' | 'ellipse' | 'polygon'
    isDrawing: false,
    selectedShapeIndex: null,

    // ===== DADOS (Coordenadas Normalizadas 0-1) =====
    subparcelaShape: null,
    speciesShapes: [], // Array de {type, species, coords, color}

    // ===== DESENHO TEMPORÁRIO =====
    startPoint: null, // {x, y} em coordenadas canvas
    currentShape: null, // Forma sendo desenhada agora
    polygonPoints: [], // Array de pontos para polígono

    // ===== DIMENSÕES =====
    canvasWidth: 0,
    canvasHeight: 0,
    imageNaturalWidth: 0,
    imageNaturalHeight: 0,

    // ===== VIEWPORT (Zoom/Pan) =====
    viewportX: 0, // Offset da imagem dentro do canvas
    viewportY: 0,
    viewportScale: 1, // Escala atual da imagem

    // ===== CONFIGURAÇÕES VISUAIS =====
    fillEnabled: false,
    subparcelaFillEnabled: false,
    fillOpacity: 0.3,
    strokeWidth: 3,
    gridEnabled: false,
    gridCellSize: 10, // % da menor dimensão
    gridLineWidth: 1,

    // ===== PALETA DE CORES =====
    colors: {
        subparcela: 'rgba(103, 126, 234, 0.3)',
        subparcelaBorder: 'rgb(103, 126, 234)',
        species: [
            'rgba(72, 187, 120, 0.4)',
            'rgba(237, 137, 54, 0.4)',
            'rgba(246, 224, 94, 0.4)',
            'rgba(236, 72, 153, 0.4)',
            'rgba(139, 92, 246, 0.4)',
            'rgba(59, 130, 246, 0.4)',
            'rgba(239, 68, 68, 0.4)',
            'rgba(16, 185, 129, 0.4)',
        ]
    },

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    
    init(imageElement, subparcela) {
        console.log('🎨 CoverageDrawer v2.0 - Inicializando');
        
        this.currentSubparcela = subparcela;
        this.image = imageElement;
        this.imageContainer = document.getElementById('viewer-img-container');

        if (!this.imageContainer) {
            console.error('❌ Container não encontrado');
            return;
        }

        // Aguardar imagem carregar
        if (this.image.complete && this.image.naturalWidth > 0) {
            this.setupCanvas();
        } else {
            this.image.onload = () => this.setupCanvas();
        }
    },

    setupCanvas() {
        console.log('📐 Configurando canvas fixo');
        
        // Remover canvas anterior
        const oldCanvas = document.getElementById('coverage-canvas');
        if (oldCanvas) oldCanvas.remove();

        // Dimensões naturais da imagem
        this.imageNaturalWidth = this.image.naturalWidth;
        this.imageNaturalHeight = this.image.naturalHeight;
        console.log(`   Imagem: ${this.imageNaturalWidth}x${this.imageNaturalHeight}px`);

        // Criar canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'coverage-canvas';
        
        // Estilo: canvas cobre TODO o container
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: crosshair;
            pointer-events: auto;
            z-index: 10;
        `;

        this.ctx = this.canvas.getContext('2d');
        this.imageContainer.appendChild(this.canvas);

        // Configurar dimensões iniciais
        this.updateCanvasDimensions();
        this.updateViewport();

        // Observers para responder a mudanças
        this.setupObservers();

        // Criar toolbar e carregar dados
        this.createToolbar();
        this.loadSavedData();
        this.setupEventListeners();
        this.render();

        console.log('✅ Canvas pronto');
    },

    updateCanvasDimensions() {
        // Canvas resolution = tamanho CSS do container
        const rect = this.imageContainer.getBoundingClientRect();
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        console.log(`   Canvas: ${this.canvasWidth}x${this.canvasHeight}px`);
    },

    updateViewport() {
        // Descobrir onde a imagem está sendo renderizada
        const imgRect = this.image.getBoundingClientRect();
        const containerRect = this.imageContainer.getBoundingClientRect();
        
        // Posição da imagem relativa ao container
        this.viewportX = imgRect.left - containerRect.left;
        this.viewportY = imgRect.top - containerRect.top;
        
        // Escala atual
        this.viewportScale = imgRect.width / this.imageNaturalWidth;
        
        console.log(`   Viewport: offset=(${this.viewportX.toFixed(1)}, ${this.viewportY.toFixed(1)}), scale=${this.viewportScale.toFixed(3)}`);
    },

    setupObservers() {
        // Resize observer: quando container muda de tamanho
        const resizeObserver = new ResizeObserver(() => {
            this.updateCanvasDimensions();
            this.render();
        });
        resizeObserver.observe(this.imageContainer);

        // Mutation observer: quando imagem sofre zoom/pan (CSS transform)
        const mutationObserver = new MutationObserver(() => {
            this.updateViewport();
            this.render();
        });
        mutationObserver.observe(this.image, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    },

    // ========================================
    // CONVERSÃO DE COORDENADAS
    // ========================================
    
    // Canvas pixels → Normalized (0-1)
    canvasToNormalized(canvasX, canvasY) {
        // 1. Canvas → Image pixels
        const imgX = (canvasX - this.viewportX) / this.viewportScale;
        const imgY = (canvasY - this.viewportY) / this.viewportScale;
        
        // 2. Image pixels → Normalized
        const normX = imgX / this.imageNaturalWidth;
        const normY = imgY / this.imageNaturalHeight;
        
        return { x: normX, y: normY };
    },

    // Normalized (0-1) → Canvas pixels
    normalizedToCanvas(normX, normY) {
        // 1. Normalized → Image pixels
        const imgX = normX * this.imageNaturalWidth;
        const imgY = normY * this.imageNaturalHeight;
        
        // 2. Image pixels → Canvas pixels
        const canvasX = imgX * this.viewportScale + this.viewportX;
        const canvasY = imgY * this.viewportScale + this.viewportY;
        
        return { x: canvasX, y: canvasY };
    },

    // Mouse event → Canvas coordinates
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },

    // ========================================
    // RENDERIZAÇÃO
    // ========================================
    
    render() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Grid (se ativado)
        if (this.gridEnabled) {
            this.drawGrid();
        }

        // Área da subparcela
        if (this.subparcelaShape) {
            this.drawShape(
                this.subparcelaShape,
                this.colors.subparcelaBorder,
                this.subparcelaFillEnabled
            );
        }

        // Áreas das espécies
        this.speciesShapes.forEach((shape, index) => {
            const isSelected = index === this.selectedShapeIndex;
            this.drawShape(shape, shape.color, this.fillEnabled, isSelected);
        });

        // Forma sendo desenhada agora
        if (this.currentShape) {
            const color = this.drawMode === 'subparcela' 
                ? this.colors.subparcelaBorder 
                : this.colors.species[this.currentSpeciesIndex % this.colors.species.length];
            this.drawShape(this.currentShape, color, false, false, true);
        }

        // Polígono em construção
        if (this.polygonPoints.length > 0) {
            this.drawPolygonPreview();
        }
    },

    drawShape(shape, color, filled = false, selected = false, preview = false) {
        if (!shape || !shape.type) return;

        this.ctx.save();
        
        // Estilo
        this.ctx.strokeStyle = selected ? 'yellow' : color;
        this.ctx.lineWidth = selected ? this.strokeWidth + 2 : this.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (filled || preview) {
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = this.fillOpacity;
        }

        // Desenhar conforme o tipo
        switch (shape.type) {
            case 'rectangle':
                this.drawRectangle(shape);
                break;
            case 'circle':
                this.drawCircle(shape);
                break;
            case 'ellipse':
                this.drawEllipse(shape);
                break;
            case 'polygon':
                this.drawPolygon(shape);
                break;
        }

        if (filled || preview) {
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        this.ctx.stroke();

        this.ctx.restore();
    },

    drawRectangle(shape) {
        const p1 = this.normalizedToCanvas(shape.x1, shape.y1);
        const p2 = this.normalizedToCanvas(shape.x2, shape.y2);
        
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);
        
        this.ctx.beginPath();
        this.ctx.rect(x, y, w, h);
    },

    drawCircle(shape) {
        const center = this.normalizedToCanvas(shape.cx, shape.cy);
        
        // Raio em coordenadas normalizadas → canvas
        const radiusX = shape.radius * this.imageNaturalWidth * this.viewportScale;
        
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radiusX, 0, 2 * Math.PI);
    },

    drawEllipse(shape) {
        const center = this.normalizedToCanvas(shape.cx, shape.cy);
        
        const radiusX = shape.rx * this.imageNaturalWidth * this.viewportScale;
        const radiusY = shape.ry * this.imageNaturalHeight * this.viewportScale;
        
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    },

    drawPolygon(shape) {
        if (!shape.points || shape.points.length < 2) return;
        
        this.ctx.beginPath();
        
        const first = this.normalizedToCanvas(shape.points[0].x, shape.points[0].y);
        this.ctx.moveTo(first.x, first.y);
        
        for (let i = 1; i < shape.points.length; i++) {
            const p = this.normalizedToCanvas(shape.points[i].x, shape.points[i].y);
            this.ctx.lineTo(p.x, p.y);
        }
        
        this.ctx.closePath();
    },

    drawPolygonPreview() {
        if (this.polygonPoints.length === 0) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = this.drawMode === 'subparcela' 
            ? this.colors.subparcelaBorder 
            : this.colors.species[this.currentSpeciesIndex % this.colors.species.length];
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.polygonPoints[0].x, this.polygonPoints[0].y);
        
        for (let i = 1; i < this.polygonPoints.length; i++) {
            this.ctx.lineTo(this.polygonPoints[i].x, this.polygonPoints[i].y);
        }
        
        this.ctx.stroke();
        
        // Círculos nos pontos
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.polygonPoints.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    },

    drawGrid() {
        const imgRect = {
            x: this.viewportX,
            y: this.viewportY,
            w: this.imageNaturalWidth * this.viewportScale,
            h: this.imageNaturalHeight * this.viewportScale
        };

        // Tamanho da célula baseado em % da menor dimensão
        const minDim = Math.min(imgRect.w, imgRect.h);
        const cellSize = minDim * (this.gridCellSize / 100);
        
        const cols = Math.ceil(imgRect.w / cellSize);
        const rows = Math.ceil(imgRect.h / cellSize);

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = this.gridLineWidth;
        this.ctx.setLineDash([2, 2]);

        // Linhas verticais
        for (let i = 0; i <= cols; i++) {
            const x = imgRect.x + i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, imgRect.y);
            this.ctx.lineTo(x, imgRect.y + imgRect.h);
            this.ctx.stroke();
        }

        // Linhas horizontais
        for (let i = 0; i <= rows; i++) {
            const y = imgRect.y + i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(imgRect.x, y);
            this.ctx.lineTo(imgRect.x + imgRect.w, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    },

    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        
        // Prevenir menu de contexto
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    },

    onMouseDown(e) {
        if (!this.drawMode) return;
        
        const pos = this.getMousePos(e);
        this.isDrawing = true;
        this.startPoint = pos;

        if (this.currentShapeType === 'polygon') {
            // Adicionar ponto ao polígono
            this.polygonPoints.push(pos);
            this.render();
        } else {
            // Iniciar forma simples
            const normPos = this.canvasToNormalized(pos.x, pos.y);
            
            switch (this.currentShapeType) {
                case 'rectangle':
                    this.currentShape = {
                        type: 'rectangle',
                        x1: normPos.x,
                        y1: normPos.y,
                        x2: normPos.x,
                        y2: normPos.y
                    };
                    break;
                case 'circle':
                    this.currentShape = {
                        type: 'circle',
                        cx: normPos.x,
                        cy: normPos.y,
                        radius: 0
                    };
                    break;
                case 'ellipse':
                    this.currentShape = {
                        type: 'ellipse',
                        cx: normPos.x,
                        cy: normPos.y,
                        rx: 0,
                        ry: 0
                    };
                    break;
            }
        }
    },

    onMouseMove(e) {
        if (!this.isDrawing || !this.startPoint || this.currentShapeType === 'polygon') return;
        
        const pos = this.getMousePos(e);
        const normPos = this.canvasToNormalized(pos.x, pos.y);
        const normStart = this.canvasToNormalized(this.startPoint.x, this.startPoint.y);

        switch (this.currentShapeType) {
            case 'rectangle':
                this.currentShape.x2 = normPos.x;
                this.currentShape.y2 = normPos.y;
                break;
            case 'circle':
                const dx = normPos.x - normStart.x;
                const dy = normPos.y - normStart.y;
                this.currentShape.radius = Math.sqrt(dx * dx + dy * dy);
                break;
            case 'ellipse':
                this.currentShape.rx = Math.abs(normPos.x - normStart.x);
                this.currentShape.ry = Math.abs(normPos.y - normStart.y);
                break;
        }

        this.render();
    },

    onMouseUp(e) {
        if (!this.isDrawing || this.currentShapeType === 'polygon') return;
        
        this.isDrawing = false;
        
        if (this.currentShape) {
            this.finalizeShape(this.currentShape);
            this.currentShape = null;
            this.startPoint = null;
        }
    },

    onDoubleClick(e) {
        if (this.currentShapeType !== 'polygon' || this.polygonPoints.length < 3) return;
        
        // Finalizar polígono
        const points = this.polygonPoints.map(p => this.canvasToNormalized(p.x, p.y));
        
        const shape = {
            type: 'polygon',
            points: points
        };
        
        this.finalizeShape(shape);
        this.polygonPoints = [];
        this.render();
    },

    onKeyDown(e) {
        // ESC: cancelar desenho
        if (e.key === 'Escape') {
            this.cancelDrawing();
        }
        // Delete: remover forma selecionada
        if (e.key === 'Delete' && this.selectedShapeIndex !== null) {
            this.deleteSelectedShape();
        }
    },

    // ========================================
    // LÓGICA DE DESENHO
    // ========================================
    
    finalizeShape(shape) {
        const color = this.drawMode === 'subparcela'
            ? this.colors.subparcelaBorder
            : this.colors.species[this.currentSpeciesIndex % this.colors.species.length];

        if (this.drawMode === 'subparcela') {
            this.subparcelaShape = { ...shape, color };
            this.saveSubparcelaArea();
        } else if (this.drawMode === 'species') {
            const speciesData = {
                ...shape,
                color,
                species: this.currentSubparcela.especies[this.currentSpeciesIndex].especie,
                index: this.currentSpeciesIndex
            };
            this.speciesShapes.push(speciesData);
            this.saveSpeciesArea(this.currentSpeciesIndex);
        }

        this.render();
    },

    cancelDrawing() {
        this.currentShape = null;
        this.polygonPoints = [];
        this.startPoint = null;
        this.isDrawing = false;
        this.render();
    },

    deleteSelectedShape() {
        if (this.selectedShapeIndex === null) return;
        
        this.speciesShapes.splice(this.selectedShapeIndex, 1);
        this.selectedShapeIndex = null;
        this.saveAllSpeciesAreas();
        this.render();
    },

    // ========================================
    // TOOLBAR
    // ========================================
    
    createToolbar() {
        const existing = document.getElementById('coverage-toolbar');
        if (existing) existing.remove();

        this.toolbar = document.createElement('div');
        this.toolbar.id = 'coverage-toolbar';
        this.toolbar.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 8px;
            z-index: 20;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            max-width: 300px;
        `;

        const buttons = [
            { id: 'rect-btn', label: '▢', title: 'Retângulo', shape: 'rectangle' },
            { id: 'circle-btn', label: '○', title: 'Círculo', shape: 'circle' },
            { id: 'ellipse-btn', label: '⬭', title: 'Elipse', shape: 'ellipse' },
            { id: 'polygon-btn', label: '⬡', title: 'Polígono (duplo clique para fechar)', shape: 'polygon' },
            { id: 'clear-btn', label: '🗑', title: 'Limpar área', action: 'clear' },
            { id: 'cancel-btn', label: '✕', title: 'Cancelar', action: 'cancel' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.label;
            button.title = btn.title;
            button.style.cssText = `
                padding: 8px 12px;
                background: #444;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            `;

            if (btn.shape) {
                button.onclick = () => this.setShapeType(btn.shape);
            } else if (btn.action === 'clear') {
                button.onclick = () => this.clearCurrentArea();
            } else if (btn.action === 'cancel') {
                button.onclick = () => this.cancelDrawing();
            }

            this.toolbar.appendChild(button);
        });

        this.imageContainer.appendChild(this.toolbar);
    },

    setShapeType(type) {
        this.currentShapeType = type;
        this.cancelDrawing();
        console.log(`🔧 Forma selecionada: ${type}`);
    },

    clearCurrentArea() {
        if (this.drawMode === 'subparcela') {
            this.subparcelaShape = null;
            this.saveSubparcelaArea();
        } else if (this.drawMode === 'species' && this.currentSpeciesIndex !== null) {
            this.speciesShapes = this.speciesShapes.filter(s => s.index !== this.currentSpeciesIndex);
            this.saveSpeciesArea(this.currentSpeciesIndex);
        }
        this.render();
    },

    // ========================================
    // MODOS DE DESENHO
    // ========================================
    
    startSubparcelaMode() {
        this.drawMode = 'subparcela';
        this.currentSpeciesIndex = null;
        this.canvas.style.display = 'block';
        this.toolbar.style.display = 'flex';
        console.log('🟦 Modo: desenhar subparcela');
    },

    startSpeciesMode(speciesIndex) {
        this.drawMode = 'species';
        this.currentSpeciesIndex = speciesIndex;
        this.canvas.style.display = 'block';
        this.toolbar.style.display = 'flex';
        console.log(`🟩 Modo: desenhar espécie ${speciesIndex}`);
    },

    stopDrawing() {
        this.drawMode = null;
        this.currentSpeciesIndex = null;
        this.cancelDrawing();
        this.canvas.style.display = 'none';
        this.toolbar.style.display = 'none';
        console.log('⏹ Desenho desativado');
    },

    // ========================================
    // PERSISTÊNCIA
    // ========================================
    
    loadSavedData() {
        // Carregar área da subparcela
        if (this.currentSubparcela.area_shape) {
            this.subparcelaShape = this.currentSubparcela.area_shape;
        }

        // Carregar áreas das espécies
        this.speciesShapes = [];
        this.currentSubparcela.especies.forEach((esp, index) => {
            if (esp.area_shape) {
                this.speciesShapes.push({
                    ...esp.area_shape,
                    species: esp.especie,
                    index: index,
                    color: this.colors.species[index % this.colors.species.length]
                });
            }
        });

        this.render();
    },

    async saveSubparcelaArea() {
        const data = {
            subparcela_id: this.currentSubparcela.id,
            area_shape: this.subparcelaShape
        };

        try {
            const response = await fetch('/save_subparcela_area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('✅ Área da subparcela salva');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar área:', error);
        }
    },

    async saveSpeciesArea(speciesIndex) {
        const especie = this.currentSubparcela.especies[speciesIndex];
        const shape = this.speciesShapes.find(s => s.index === speciesIndex);

        const data = {
            subparcela_id: this.currentSubparcela.id,
            especie: especie.especie,
            area_shape: shape || null
        };

        try {
            const response = await fetch('/save_species_area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log(`✅ Área da espécie ${speciesIndex} salva`);
            }
        } catch (error) {
            console.error('❌ Erro ao salvar área:', error);
        }
    },

    async saveAllSpeciesAreas() {
        for (let i = 0; i < this.currentSubparcela.especies.length; i++) {
            await this.saveSpeciesArea(i);
        }
    }
};

// Expor globalmente
window.CoverageDrawer = CoverageDrawer;
