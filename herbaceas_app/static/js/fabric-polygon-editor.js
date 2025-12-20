// ============================================================
// FABRIC POLYGON EDITOR v1.0 - Canvas-based Polygon Editor
// ============================================================
// Uses Fabric.js for robust polygon editing with synchronized zoom/pan
// ============================================================

const FabricPolygonEditor = {
    // Canvas and state
    canvas: null,
    containerElement: null,
    backgroundImage: null,

    // Data
    subparcelaPolygon: null,      // { fabric.Polygon object }
    speciesPolygons: {},          // { index: [fabric.Polygon objects] }
    currentSubparcela: null,

    // Mode
    drawMode: null,               // null, 'subparcela', 'species'
    currentSpeciesIndex: null,
    isDrawing: false,
    drawPoints: [],

    // Colors
    colors: {
        subparcela: '#3b82f6',
        species: [
            '#48bb78', '#ed8936', '#f6e05e', '#ec4899',
            '#8b5cf6', '#3b82f6', '#ef4444', '#10b981'
        ]
    },

    // Settings
    fillOpacity: 0.3,
    strokeWidth: 2,

    // ========================================
    // INITIALIZATION
    // ========================================

    init(containerSelector, imageUrl, subparcelaData) {
        console.log('🎨 Inicializando FabricPolygonEditor...');

        // Get container
        this.containerElement = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;

        if (!this.containerElement) {
            console.error('❌ Container não encontrado');
            return false;
        }

        this.currentSubparcela = subparcelaData;

        // Create canvas element
        const canvasEl = document.createElement('canvas');
        canvasEl.id = 'fabric-polygon-canvas';
        this.containerElement.innerHTML = '';
        this.containerElement.appendChild(canvasEl);

        // Initialize Fabric canvas
        this.canvas = new fabric.Canvas('fabric-polygon-canvas', {
            selection: true,
            preserveObjectStacking: true
        });

        // Load background image
        return this.loadImage(imageUrl);
    },

    loadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(imageUrl, (img) => {
                if (!img) {
                    console.error('❌ Falha ao carregar imagem');
                    reject(new Error('Failed to load image'));
                    return;
                }

                this.backgroundImage = img;

                // Set canvas size to container
                const containerWidth = this.containerElement.clientWidth;
                const containerHeight = this.containerElement.clientHeight || 600;

                // Calculate scale to fit
                const scaleX = containerWidth / img.width;
                const scaleY = containerHeight / img.height;
                const scale = Math.min(scaleX, scaleY);

                // Set canvas dimensions
                this.canvas.setWidth(containerWidth);
                this.canvas.setHeight(containerHeight);

                // Scale and center image
                img.set({
                    scaleX: scale,
                    scaleY: scale,
                    left: (containerWidth - img.width * scale) / 2,
                    top: (containerHeight - img.height * scale) / 2,
                    selectable: false,
                    evented: false
                });

                this.canvas.add(img);
                this.canvas.sendToBack(img);

                // Store image bounds for coordinate conversion
                this.imageBounds = {
                    left: img.left,
                    top: img.top,
                    width: img.width * scale,
                    height: img.height * scale,
                    scale: scale,
                    originalWidth: img.width,
                    originalHeight: img.height
                };

                // Setup event listeners
                this.setupEventListeners();

                // Load saved data
                this.loadSavedData();

                console.log('✅ FabricPolygonEditor inicializado');
                console.log(`   Imagem: ${img.width}x${img.height}, scale: ${scale.toFixed(2)}`);

                resolve(true);
            }, { crossOrigin: 'anonymous' });
        });
    },

    // ========================================
    // COORDINATE CONVERSION
    // ========================================

    // Convert percentage (0-100) to canvas pixels
    percentToPixel(point) {
        return {
            x: this.imageBounds.left + (point.x / 100) * this.imageBounds.width,
            y: this.imageBounds.top + (point.y / 100) * this.imageBounds.height
        };
    },

    // Convert canvas pixels to percentage (0-100)
    pixelToPercent(point) {
        return {
            x: ((point.x - this.imageBounds.left) / this.imageBounds.width) * 100,
            y: ((point.y - this.imageBounds.top) / this.imageBounds.height) * 100
        };
    },

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Mouse wheel for zoom
        this.canvas.on('mouse:wheel', (opt) => {
            const delta = opt.e.deltaY;
            let zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;

            if (zoom > 10) zoom = 10;
            if (zoom < 0.5) zoom = 0.5;

            this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        // Pan with middle mouse or Alt+drag
        this.canvas.on('mouse:down', (opt) => {
            if (opt.e.altKey || opt.e.button === 1) {
                this.canvas.isDragging = true;
                this.canvas.selection = false;
                this.canvas.lastPosX = opt.e.clientX;
                this.canvas.lastPosY = opt.e.clientY;
            }

            // Drawing mode
            if (this.drawMode && !this.canvas.isDragging) {
                this.handleDrawStart(opt);
            }
        });

        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isDragging) {
                const e = opt.e;
                const vpt = this.canvas.viewportTransform;
                vpt[4] += e.clientX - this.canvas.lastPosX;
                vpt[5] += e.clientY - this.canvas.lastPosY;
                this.canvas.requestRenderAll();
                this.canvas.lastPosX = e.clientX;
                this.canvas.lastPosY = e.clientY;
            }

            // Drawing preview
            if (this.isDrawing) {
                this.handleDrawMove(opt);
            }
        });

        this.canvas.on('mouse:up', (opt) => {
            this.canvas.setViewportTransform(this.canvas.viewportTransform);
            this.canvas.isDragging = false;
            this.canvas.selection = true;
        });

        // Double-click to finish polygon
        this.canvas.on('mouse:dblclick', (opt) => {
            if (this.isDrawing && this.drawPoints.length >= 3) {
                this.finishPolygon();
            }
        });

        // Monitor modified objects (resize, move, rotate) to recalculate area
        this.canvas.on('object:modified', (opt) => {
            console.log('✏️ Polígono modificado, recalculando áreas...');
            this.recalculateAllCoverages();
            this.persistSpeciesArea(opt.target.speciesIndex);
        });

        // ResizeObserver to handle container resizing
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.containerElement);

        // Remove label on right click (context menu) - Optional but good for UX
        this.canvas.on('mouse:down', (opt) => {
            if (opt.e.button === 2) { // Right click
                // Context menu logic could go here
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelDrawing();
            } else if (e.key === 'Enter' && this.isDrawing) {
                this.finishPolygon();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }
        });
    },

    handleResize() {
        if (!this.canvas || !this.backgroundImage || !this.containerElement) return;

        const containerWidth = this.containerElement.clientWidth;
        const containerHeight = this.containerElement.clientHeight || 600;

        // If container is hidden or collapsed, skip
        if (containerWidth === 0 || containerHeight === 0) return;

        this.canvas.setWidth(containerWidth);
        this.canvas.setHeight(containerHeight);

        // Recalculate scale to fit image
        const img = this.backgroundImage;
        const scaleX = containerWidth / img.width;
        const scaleY = containerHeight / img.height;
        const scale = Math.min(scaleX, scaleY); // Contain

        img.set({
            scaleX: scale,
            scaleY: scale,
            left: (containerWidth - img.width * scale) / 2,
            top: (containerHeight - img.height * scale) / 2
        });

        // Update image bounds
        this.imageBounds = {
            left: img.left,
            top: img.top,
            width: img.width * scale,
            height: img.height * scale,
            scale: scale,
            originalWidth: img.width,
            originalHeight: img.height
        };

        // Redraw all polygons based on new coordinates
        // This is tricky: existing polygons are in PIXELS. We need to re-map them?
        // Actually, if we use percentToPixel on load, we should re-load?
        // Better: Convert all current polygons to percentages, clear canvas, re-init with new size?
        // Or: Scale objects?

        // Simpler approach for now: Just center the image and let user pan/zoom.
        // But for responsive layout, re-rendering from data source is safest.

        // Let's force a reload of data to ensure everything positions correctly relative to new image size
        this.canvas.requestRenderAll();
    },

    // ========================================
    // DRAWING
    // ========================================

    startDrawSubparcela() {
        this.drawMode = 'subparcela';
        this.currentSpeciesIndex = null;
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'crosshair';
        console.log('📐 Modo: Desenhar Área 100%');

        if (typeof showAlert === 'function') {
            showAlert('info', '📐 Clique para adicionar pontos, duplo-clique ou Enter para fechar o polígono');
        }
    },

    startDrawSpecies(speciesIndex) {
        if (!this.subparcelaPolygon) {
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Primeiro defina a área de 100% da subparcela!');
            }
            return;
        }

        this.drawMode = 'species';
        this.currentSpeciesIndex = speciesIndex;
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'crosshair';

        const speciesName = this.currentSubparcela?.especies?.[speciesIndex]?.apelido || `Espécie ${speciesIndex + 1}`;
        console.log(`🌿 Modo: Desenhar espécie "${speciesName}"`);

        if (typeof showAlert === 'function') {
            showAlert('info', `🌿 Desenhar "${speciesName}" - Clique para pontos, duplo-clique para fechar`);
        }
    },

    stopDrawing() {
        this.drawMode = null;
        this.currentSpeciesIndex = null;
        this.isDrawing = false;
        this.drawPoints = [];
        this.canvas.selection = true;
        this.canvas.defaultCursor = 'default';

        // Remove preview elements
        this.canvas.getObjects().forEach(obj => {
            if (obj.isPreview) {
                this.canvas.remove(obj);
            }
        });

        console.log('⏹️ Modo de desenho desativado');
    },

    handleDrawStart(opt) {
        const pointer = this.canvas.getPointer(opt.e);

        this.isDrawing = true;
        this.drawPoints.push({ x: pointer.x, y: pointer.y });

        // Draw point indicator
        const point = new fabric.Circle({
            left: pointer.x - 4,
            top: pointer.y - 4,
            radius: 4,
            fill: this.drawMode === 'subparcela' ? this.colors.subparcela : this.colors.species[this.currentSpeciesIndex % this.colors.species.length],
            selectable: false,
            evented: false,
            isPreview: true
        });
        this.canvas.add(point);
    },

    handleDrawMove(opt) {
        if (this.drawPoints.length === 0) return;

        const pointer = this.canvas.getPointer(opt.e);

        // Remove old preview line
        this.canvas.getObjects().forEach(obj => {
            if (obj.isPreviewLine) {
                this.canvas.remove(obj);
            }
        });

        // Draw preview line
        const lastPoint = this.drawPoints[this.drawPoints.length - 1];
        const line = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
            stroke: this.drawMode === 'subparcela' ? this.colors.subparcela : this.colors.species[this.currentSpeciesIndex % this.colors.species.length],
            strokeWidth: 2,
            selectable: false,
            evented: false,
            isPreviewLine: true
        });
        this.canvas.add(line);
    },

    finishPolygon() {
        if (this.drawPoints.length < 3) {
            console.warn('⚠️ Polígono precisa de pelo menos 3 pontos');
            return;
        }

        const color = this.drawMode === 'subparcela'
            ? this.colors.subparcela
            : this.colors.species[this.currentSpeciesIndex % this.colors.species.length];

        // Create polygon
        const polygon = new fabric.Polygon(this.drawPoints, {
            fill: color,
            fillOpacity: this.fillOpacity,
            opacity: this.fillOpacity,
            stroke: color,
            strokeWidth: this.strokeWidth,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            objectCaching: false
        });

        // Store metadata
        polygon.polygonType = this.drawMode;
        polygon.speciesIndex = this.currentSpeciesIndex;

        // Remove preview elements
        this.canvas.getObjects().forEach(obj => {
            if (obj.isPreview || obj.isPreviewLine) {
                this.canvas.remove(obj);
            }
        });

        // Add polygon
        this.canvas.add(polygon);

        // Store reference
        if (this.drawMode === 'subparcela') {
            // Remove old subparcela polygon if exists
            if (this.subparcelaPolygon) {
                this.canvas.remove(this.subparcelaPolygon);
            }
            this.subparcelaPolygon = polygon;
            this.persistSubparcelaArea();
        } else if (this.drawMode === 'species') {
            if (!this.speciesPolygons[this.currentSpeciesIndex]) {
                this.speciesPolygons[this.currentSpeciesIndex] = [];
            }
            this.speciesPolygons[this.currentSpeciesIndex].push(polygon);
            this.persistSpeciesArea(this.currentSpeciesIndex);
            this.addPolygonLabel(polygon, this.currentSpeciesIndex);
        }

        // Reset drawing state but keep mode active for next polygon
        this.drawPoints = [];
        this.isDrawing = false;

        console.log(`✅ Polígono ${this.drawMode} criado com ${polygon.points.length} pontos`);

        if (typeof showAlert === 'function') {
            showAlert('success', '✅ Polígono salvo! Clique para desenhar outro ou ESC para parar');
        }
    },

    cancelDrawing() {
        // Remove preview elements
        this.canvas.getObjects().forEach(obj => {
            if (obj.isPreview || obj.isPreviewLine) {
                this.canvas.remove(obj);
            }
        });

        this.drawPoints = [];
        this.isDrawing = false;
        this.stopDrawing();

        console.log('❌ Desenho cancelado');
    },

    deleteSelected() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;

        const speciesName = this.currentSubparcela?.especies?.[activeObject.speciesIndex]?.apelido || 'Área';

        if (!confirm(`Apagar polígono "${speciesName}"?`)) return;

        // Remove from stored references
        if (activeObject.polygonType === 'subparcela') {
            this.subparcelaPolygon = null;
        } else if (activeObject.polygonType === 'species') {
            const idx = activeObject.speciesIndex;
            if (this.speciesPolygons[idx]) {
                const polyIdx = this.speciesPolygons[idx].indexOf(activeObject);
                if (polyIdx > -1) {
                    this.speciesPolygons[idx].splice(polyIdx, 1);
                }
            }
        }

        // Remove associated label
        this.canvas.getObjects().forEach(obj => {
            if (obj.associatedPolygon === activeObject) {
                this.canvas.remove(obj);
            }
        });

        this.canvas.remove(activeObject);
        this.canvas.discardActiveObject();

        console.log('🗑️ Polígono removido');
        if (typeof showAlert === 'function') {
            showAlert('success', '✅ Polígono removido');
        }
    },

    // ========================================
    // LABELS
    // ========================================

    addPolygonLabel(polygon, speciesIndex) {
        const speciesName = this.currentSubparcela?.especies?.[speciesIndex]?.apelido || `Espécie ${speciesIndex + 1}`;
        const color = this.colors.species[speciesIndex % this.colors.species.length];

        // Calculate center of polygon
        const bounds = polygon.getBoundingRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        const label = new fabric.Text(speciesName, {
            left: centerX,
            top: centerY,
            fontSize: 14,
            fill: '#ffffff',
            backgroundColor: color,
            padding: 4,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
        });

        label.associatedPolygon = polygon;
        polygon.label = label;

        this.canvas.add(label);
    },

    // ========================================
    // PERSISTENCE
    // ========================================

    persistSubparcelaArea() {
        if (!this.subparcelaPolygon) return;

        // Convert points to percentage
        const points = this.subparcelaPolygon.points.map(p => this.pixelToPercent(p));

        const data = {
            parcela: window.appState?.parcelaNome,
            subparcela: this.currentSubparcela.subparcela || this.currentSubparcela.id,
            area_shape: { type: 'polygon', points }
        };

        console.log('📤 Salvando área subparcela:', data);

        fetch('/api/subparcela/area', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.ok) console.log('✅ Área da subparcela salva');
        }).catch(err => console.error('❌ Erro ao salvar:', err));
    },

    persistSpeciesArea(speciesIndex) {
        const polygons = this.speciesPolygons[speciesIndex];
        if (!polygons || polygons.length === 0) return;

        const especie = this.currentSubparcela?.especies?.[speciesIndex];
        if (!especie) return;

        // Convert all polygons to percentage
        const area_shapes = polygons.map(poly => ({
            type: 'polygon',
            points: poly.points.map(p => this.pixelToPercent(p))
        }));

        const data = {
            parcela: window.appState?.parcelaNome,
            subparcela: this.currentSubparcela.subparcela || this.currentSubparcela.id,
            especie: especie.apelido,
            area_shapes
        };

        console.log('📤 Salvando área espécie:', data);

        fetch('/api/species/area', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.ok) console.log(`✅ Áreas da espécie ${speciesIndex} salvas`);
        }).catch(err => console.error('❌ Erro ao salvar:', err));
    },

    // ========================================
    // LOAD DATA
    // ========================================

    loadSavedData() {
        if (!this.currentSubparcela) return;

        console.log('💾 Carregando dados salvos...');

        // Load subparcela area
        if (this.currentSubparcela.area_shape?.points) {
            this.importSubparcelaPolygon(this.currentSubparcela.area_shape.points);
        }

        // Load species areas
        if (this.currentSubparcela.especies) {
            this.currentSubparcela.especies.forEach((esp, index) => {
                if (esp.area_shapes) {
                    esp.area_shapes.forEach(shape => {
                        if (shape.points) {
                            this.importSpeciesPolygon(index, shape.points);
                        }
                    });
                }
            });
        }
    },

    importSubparcelaPolygon(percentPoints) {
        const pixelPoints = percentPoints.map(p => this.percentToPixel(p));

        const polygon = new fabric.Polygon(pixelPoints, {
            fill: this.colors.subparcela,
            opacity: this.fillOpacity,
            stroke: this.colors.subparcela,
            strokeWidth: this.strokeWidth,
            selectable: true,
            hasControls: true
        });

        polygon.polygonType = 'subparcela';
        this.subparcelaPolygon = polygon;
        this.canvas.add(polygon);

        console.log('  ✅ Área da subparcela carregada');
    },

    importSpeciesPolygon(speciesIndex, percentPoints) {
        const pixelPoints = percentPoints.map(p => this.percentToPixel(p));
        const color = this.colors.species[speciesIndex % this.colors.species.length];

        const polygon = new fabric.Polygon(pixelPoints, {
            fill: color,
            opacity: this.fillOpacity,
            stroke: color,
            strokeWidth: this.strokeWidth,
            selectable: true,
            hasControls: true
        });

        polygon.polygonType = 'species';
        polygon.speciesIndex = speciesIndex;

        if (!this.speciesPolygons[speciesIndex]) {
            this.speciesPolygons[speciesIndex] = [];
        }
        this.speciesPolygons[speciesIndex].push(polygon);
        this.canvas.add(polygon);

        this.addPolygonLabel(polygon, speciesIndex);

        const speciesName = this.currentSubparcela?.especies?.[speciesIndex]?.apelido || `Espécie ${speciesIndex + 1}`;
        console.log(`  ✅ Área da espécie "${speciesName}" carregada`);
    },

    // ========================================
    // IMPORT AI AREAS
    // ========================================

    importAIDetectedAreas() {
        if (!this.currentSubparcela) {
            if (typeof showAlert === 'function') {
                showAlert('error', 'Dados da subparcela não disponíveis');
            }
            return;
        }

        console.log('🤖 Importando áreas detectadas pela IA...');

        let areasImportadas = 0;

        // Import species areas from 'areas' field
        if (this.currentSubparcela.especies) {
            this.currentSubparcela.especies.forEach((esp, index) => {
                if (esp.areas && Array.isArray(esp.areas) && esp.areas.length >= 3) {
                    // Convert [[x,y], ...] format to [{x, y}, ...]
                    let points;
                    if (Array.isArray(esp.areas[0])) {
                        points = esp.areas.map(p => ({ x: p[0], y: p[1] }));
                    } else {
                        points = esp.areas;
                    }

                    this.importSpeciesPolygon(index, points);
                    areasImportadas++;
                }
            });
        }

        this.canvas.renderAll();

        if (typeof showAlert === 'function') {
            if (areasImportadas > 0) {
                showAlert('success', `✅ ${areasImportadas} área(s) importada(s) da IA`);
            } else {
                showAlert('warning', '⚠️ Nenhuma área da IA encontrada');
            }
        }

        console.log(`🤖 Importação: ${areasImportadas} áreas`);
    },

    // ========================================
    // COVERAGE CALCULATION
    // ========================================

    calculatePolygonArea(polygon) {
        const points = polygon.points;
        if (!points || points.length < 3) return 0;

        // Shoelace formula
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area / 2);
    },

    calculateCoveragePercentage(speciesIndex) {
        if (!this.subparcelaPolygon) return 0;

        const totalArea = this.calculatePolygonArea(this.subparcelaPolygon);
        if (totalArea === 0) return 0;

        const polygons = this.speciesPolygons[speciesIndex];
        if (!polygons || polygons.length === 0) return 0;

        let speciesArea = 0;
        polygons.forEach(poly => {
            speciesArea += this.calculatePolygonArea(poly);
        });

        const percentage = (speciesArea / totalArea) * 100;
        return Math.min(100, Math.max(0, percentage));
    },

    recalculateAllCoverages() {
        if (!this.subparcelaPolygon) {
            if (typeof showAlert === 'function') {
                showAlert('warning', '⚠️ Primeiro defina a área de 100%');
            }
            return;
        }

        if (!this.currentSubparcela?.especies) return;

        console.log('🔄 Recalculando coberturas...');

        const updates = [];

        this.currentSubparcela.especies.forEach((esp, index) => {
            const polygons = this.speciesPolygons[index];
            if (polygons && polygons.length > 0) {
                const newCov = this.calculateCoveragePercentage(index);
                const oldCov = esp.cobertura;

                if (Math.abs(newCov - oldCov) > 0.1) {
                    esp.cobertura = parseFloat(newCov.toFixed(1));
                    updates.push({ name: esp.apelido, old: oldCov, new: esp.cobertura });
                }
            }
        });

        if (updates.length > 0 && typeof showAlert === 'function') {
            let msg = `✅ ${updates.length} coberturas atualizadas:\n`;
            updates.forEach(u => msg += `\n• ${u.name}: ${u.old}% → ${u.new}%`);
            showAlert('success', msg);
        }

        console.log(`🔄 ${updates.length} coberturas atualizadas`);
        return updates;
    },

    // ========================================
    // ZOOM/PAN
    // ========================================

    resetZoom() {
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.renderAll();
    },

    zoomIn() {
        const zoom = this.canvas.getZoom() * 1.2;
        this.canvas.setZoom(Math.min(zoom, 10));
    },

    zoomOut() {
        const zoom = this.canvas.getZoom() / 1.2;
        this.canvas.setZoom(Math.max(zoom, 0.5));
    },

    // ========================================
    // CLEANUP
    // ========================================

    destroy() {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
        this.subparcelaPolygon = null;
        this.speciesPolygons = {};
        this.currentSubparcela = null;
        console.log('🗑️ FabricPolygonEditor destruído');
    }
};

// Export globally
window.FabricPolygonEditor = FabricPolygonEditor;
