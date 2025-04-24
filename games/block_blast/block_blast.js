document.addEventListener('DOMContentLoaded', () => {
    const gameBoardElement = document.getElementById('game-board');
    const pieceContainerElement = document.getElementById('piece-container');
    const scoreElement = document.getElementById('score');
    const gameOverMessageElement = document.getElementById('game-over-message');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const restartButtonIngame = document.getElementById('restart-button-ingame');

    // --- Параметры игры ---
    const GRID_SIZE = 8;
    const PIECE_COUNT = 3;
    const BOARD_FIXED_SIZE_PX = 300; // <<--- СООТВЕТСТВУЕТ CSS width/height .game-board

    // --- Состояние игры ---
    let grid = [];
    let score = 0;
    let currentPieces = [];
    let isGameOver = false;
    let draggedPiece = null;
    let draggedPieceData = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let currentDraggingElement = null;


    // --- Определения фигур ---
    // УДАЛЕНЫ ВЕРТИКАЛЬНЫЕ ВАРИАНТЫ 1xN
    const pieceDefinitions = [
        // 1x1
        { shape: [[0, 0]], type: 'block-type-1' },
        // 1x2 ГОРИЗОНТАЛЬНЫЙ
        { shape: [[0, 0], [0, 1]], type: 'block-type-2' },
        // 2x1 ВЕРТИКАЛЬНЫЙ
        { shape: [[0, 0], [1, 0]], type: 'block-type-2' },
        // 1x3 ГОРИЗОНТАЛЬНЫЙ
        { shape: [[0, 0], [0, 1], [0, 2]], type: 'block-type-3' },
        // 3x1 ВЕРТИКАЛЬНЫЙ
        // { shape: [[0, 0], [1, 0], [2, 0]], type: 'block-type-3' }, // <-- ОСТАВИЛ, может пригодиться
        // 2x2
        { shape: [[0, 0], [0, 1], [1, 0], [1, 1]], type: 'block-type-4' },
        // L (3 high) - Вертикальные L
        { shape: [[0, 0], [1, 0], [2, 0], [2, 1]], type: 'block-type-5' },
        { shape: [[0, 1], [1, 1], [2, 1], [2, 0]], type: 'block-type-5' },
        // L (3 wide) - Горизонтальные L
        { shape: [[0, 0], [0, 1], [0, 2], [1, 2]], type: 'block-type-5' },
        { shape: [[1, 0], [1, 1], [1, 2], [0, 2]], type: 'block-type-5' },
        // T
        { shape: [[0, 0], [0, 1], [0, 2], [1, 1]], type: 'block-type-6' }, // T вниз
        { shape: [[0, 1], [1, 0], [1, 1], [2, 1]], type: 'block-type-6' }, // T вправо
        { shape: [[1, 0], [1, 1], [1, 2], [0, 1]], type: 'block-type-6' }, // T вверх
        { shape: [[0, 0], [1, 0], [1, 1], [2, 0]], type: 'block-type-6' }, // T влево
         // Z
        { shape: [[0, 0], [0, 1], [1, 1], [1, 2]], type: 'block-type-7' },
        { shape: [[1, 0], [1, 1], [0, 1], [0, 2]], type: 'block-type-7' }, // Перевернутый Z
        // S
        { shape: [[0, 1], [0, 2], [1, 0], [1, 1]], type: 'block-type-1' }, // Перевернутый S
        { shape: [[0, 0], [1, 0], [1, 1], [2, 1]], type: 'block-type-1' },
        // U
        { shape: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]], type: 'block-type-4' },
        // 1x4 ГОРИЗОНТАЛЬНЫЙ
        { shape: [[0, 0], [0, 1], [0, 2], [0, 3]], type: 'block-type-2' },
        // 4x1 ВЕРТИКАЛЬНЫЙ
        // { shape: [[0, 0], [1, 0], [2, 0], [3, 0]], type: 'block-type-2' }, // <-- ОСТАВИЛ
        // 1x5 ГОРИЗОНТАЛЬНЫЙ
        { shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], type: 'block-type-3' },
        // 5x1 ВЕРТИКАЛЬНЫЙ
        // { shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], type: 'block-type-3' }, // <-- УДАЛЕН ИЗ ГЕНЕРАЦИИ
        // +
        { shape: [[0,1],[1,0],[1,1],[1,2],[2,1]], type: 'block-type-5'},
    ];

    // --- Функции ---

    function initGame() {
        isGameOver = false; score = 0; updateScoreDisplay();
        gameOverMessageElement.style.display = 'none';
        grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        gameBoardElement.innerHTML = ''; pieceContainerElement.innerHTML = '';
        document.documentElement.style.setProperty('--grid-size', GRID_SIZE);
        createGrid();
        generateNewPieces();
        displayPieces();
        addBoardListeners();
    }

    function createGrid() {
        // Устанавливаем размер из константы, а не из CSS переменной для grid-template-*
        const cellSize = `${BOARD_FIXED_SIZE_PX / GRID_SIZE}px`;
        gameBoardElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${cellSize})`;
        gameBoardElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${cellSize})`;

        // gameBoardElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
        // gameBoardElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.dataset.row = r; cell.dataset.col = c;
                gameBoardElement.appendChild(cell);
            }
        }
    }

    function addBoardListeners() {
        gameBoardElement.addEventListener('pointerover', handlePointerOverBoard);
        gameBoardElement.addEventListener('pointerleave', handlePointerLeaveBoard);
    }

    function generateNewPieces() {
        currentPieces = [];
        for (let i = 0; i < PIECE_COUNT; i++) {
            const randomIndex = Math.floor(Math.random() * pieceDefinitions.length);
            currentPieces.push(pieceDefinitions[randomIndex]);
        }
    }

    function displayPieces() {
        pieceContainerElement.innerHTML = '';
        currentPieces.forEach((pieceData, index) => {
            if (pieceData) {
                const pieceElement = createPieceElement(pieceData);
                pieceElement.dataset.pieceIndex = index;
                pieceContainerElement.appendChild(pieceElement);
                addPieceListeners(pieceElement);
            }
        });
        checkGameOver();
    }

    function createPieceElement(pieceData, isDragging = false) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece');
        if (isDragging) pieceElement.classList.add('dragging-piece');

        let maxRow = 0, maxCol = 0;
        pieceData.shape.forEach(([r, c]) => { maxRow = Math.max(maxRow, r); maxCol = Math.max(maxCol, c); });

        // Размер блока для перетаскивания (рассчитывается на основе ФИКСИРОВАННОГО размера доски)
        const draggingBlockSize = BOARD_FIXED_SIZE_PX / GRID_SIZE;
        // Размер блока в контейнере (из CSS)
        const containerBlockSize = 20; // Должно совпадать с .piece-block в CSS

        const blockSize = isDragging ? draggingBlockSize : containerBlockSize;

        pieceElement.style.gridTemplateRows = `repeat(${maxRow + 1}, ${blockSize}px)`;
        pieceElement.style.gridTemplateColumns = `repeat(${maxCol + 1}, ${blockSize}px)`;
        // Устанавливаем общую ширину/высоту контейнера фигуры
        pieceElement.style.width = `${(maxCol + 1) * blockSize}px`;
        pieceElement.style.height = `${(maxRow + 1) * blockSize}px`;

        pieceData.shape.forEach(([r, c]) => {
            const block = document.createElement('div');
            block.classList.add('piece-block', pieceData.type);
            block.style.gridRowStart = r + 1;
            block.style.gridColumnStart = c + 1;
             // Если это перетаскиваемый элемент, задаем ему размер явно
             if(isDragging) {
                  block.style.width = `${blockSize}px`;
                  block.style.height = `${blockSize}px`;
             }
            pieceElement.appendChild(block);
        });
        return pieceElement;
    }


    function addPieceListeners(pieceElement) {
        pieceElement.addEventListener('pointerdown', handlePointerDown);
    }

    // --- Логика Drag and Drop ---
    function handlePointerDown(e) {
        if (isGameOver || !e.target.closest('.piece')) return;
        e.preventDefault();

        draggedPiece = e.target.closest('.piece');
        const pieceIndex = parseInt(draggedPiece.dataset.pieceIndex);
        draggedPieceData = currentPieces[pieceIndex];
        if (!draggedPieceData) return;

        currentDraggingElement = createPieceElement(draggedPieceData, true);
        document.body.appendChild(currentDraggingElement);

        const rect = draggedPiece.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        draggedPiece.style.opacity = '0.3';
        moveDraggingElement(e.clientX, e.clientY);

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    }

    function handlePointerMove(e) {
        if (!currentDraggingElement) return;
        e.preventDefault();
        moveDraggingElement(e.clientX, e.clientY);
        highlightCells(e.clientX, e.clientY);
    }

     function moveDraggingElement(clientX, clientY) {
         if (!currentDraggingElement) return;
         // Позиционируем копию относительно viewport
         currentDraggingElement.style.left = `${clientX - dragOffsetX}px`;
         currentDraggingElement.style.top = `${clientY - dragOffsetY}px`;
    }


    function handlePointerUp(e) {
        if (!draggedPiece || !currentDraggingElement) { cleanupDrag(); return; }
        e.preventDefault();
        const boardRect = gameBoardElement.getBoundingClientRect();
        if (e.clientX >= boardRect.left && e.clientX <= boardRect.right && e.clientY >= boardRect.top && e.clientY <= boardRect.bottom) {
            const { gridRow, gridCol } = getGridCoords(e.clientX, e.clientY);
            tryPlacePiece(gridRow, gridCol);
        } else {
            if (draggedPiece) draggedPiece.style.opacity = '1';
        }
        cleanupDrag();
    }

    function cleanupDrag() {
        clearHighlights();
        if (currentDraggingElement) { currentDraggingElement.remove(); currentDraggingElement = null; }
        if (draggedPiece && pieceContainerElement.contains(draggedPiece)) {
            draggedPiece.style.opacity = '1';
        }
        draggedPiece = null; draggedPieceData = null;
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
    }

    // --- Логика размещения и проверки ---
    function getGridCoords(clientX, clientY) {
        const boardRect = gameBoardElement.getBoundingClientRect();
        // Используем фиксированный размер доски для расчета ячейки
        const cellWidth = BOARD_FIXED_SIZE_PX / GRID_SIZE;
        const cellHeight = BOARD_FIXED_SIZE_PX / GRID_SIZE;

        // Координаты курсора относительно доски
        const relativeX = clientX - boardRect.left;
        const relativeY = clientY - boardRect.top;

        // Рассчитываем ячейку, куда указывает левый верхний угол перетаскиваемой фигуры
        let gridCol = Math.floor((relativeX - dragOffsetX) / cellWidth);
        let gridRow = Math.floor((relativeY - dragOffsetY) / cellHeight);

        // Округляем до ближайшей ячейки (альтернативный способ)
        // gridCol = Math.round((relativeX - dragOffsetX) / cellWidth);
        // gridRow = Math.round((relativeY - dragOffsetY) / cellHeight);

         // Простая привязка к центру курсора (может быть менее точной для больших фигур)
         gridCol = Math.floor(relativeX / cellWidth);
         gridRow = Math.floor(relativeY / cellHeight);
         // Пытаемся скорректировать на основе точки нажатия внутри фигуры
         if(currentDraggingElement){
             const dragPercentX = dragOffsetX / currentDraggingElement.offsetWidth;
             const dragPercentY = dragOffsetY / currentDraggingElement.offsetHeight;
             const shapeWidthCells = Math.max(...draggedPieceData.shape.map(p=>p[1])) + 1;
             const shapeHeightCells = Math.max(...draggedPieceData.shape.map(p=>p[0])) + 1;
             gridCol = Math.floor((relativeX / cellWidth) - (dragPercentX * shapeWidthCells) + 0.5); // +0.5 для округления
             gridRow = Math.floor((relativeY / cellHeight) - (dragPercentY * shapeHeightCells) + 0.5);
         }


        return { gridRow, gridCol };
    }

    function canPlacePiece(pieceData, startRow, startCol) {
        for (const [r, c] of pieceData.shape) {
            const boardRow = startRow + r;
            const boardCol = startCol + c;
            if (boardRow < 0 || boardRow >= GRID_SIZE || boardCol < 0 || boardCol >= GRID_SIZE || grid[boardRow][boardCol] !== 0) {
                return false;
            }
        }
        return true;
    }

    function tryPlacePiece(startRow, startCol) {
        if (!draggedPieceData) return;
        if (canPlacePiece(draggedPieceData, startRow, startCol)) {
            let pieceScore = 0;
            draggedPieceData.shape.forEach(([r, c]) => {
                grid[startRow + r][startCol + c] = draggedPieceData.type;
                pieceScore++;
            });
            updateScore(pieceScore);
            updateGridDisplay();
            const pieceIndex = parseInt(draggedPiece.dataset.pieceIndex);
            currentPieces[pieceIndex] = null;
            draggedPiece.remove();
            checkAndClearLines();
            if (currentPieces.every(p => p === null)) { generateNewPieces(); displayPieces(); }
            else { checkGameOver(); }
        } else {
            if (draggedPiece) draggedPiece.style.opacity = '1';
        }
    }

    function updateGridDisplay() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = gameBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.className = 'board-cell'; // Сброс
                    if (grid[r][c] !== 0) {
                        cell.classList.add('cell-filled', grid[r][c]);
                    }
                }
            }
        }
    }

    function checkAndClearLines() {
        let linesCleared = 0, rowsToClear = [], colsToClear = [];
        for (let r = 0; r < GRID_SIZE; r++) if (grid[r].every(cell => cell !== 0)) rowsToClear.push(r);
        for (let c = 0; c < GRID_SIZE; c++) if (grid.every(row => row[c] !== 0)) colsToClear.push(c);

        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            isProcessing = true; // Блокируем на время анимации
            // Применяем анимацию очистки
            rowsToClear.forEach(r => { for (let c = 0; c < GRID_SIZE; c++) gameBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`)?.classList.add('clearing'); });
            colsToClear.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) if (!rowsToClear.includes(r)) gameBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`)?.classList.add('clearing'); });

            // Задержка перед фактической очисткой
            setTimeout(() => {
                rowsToClear.forEach(r => grid[r].fill(0));
                colsToClear.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = 0; });

                updateGridDisplay();
                linesCleared = rowsToClear.length + colsToClear.length; // Упрощенный подсчет для очков
                 let clearScore = linesCleared * GRID_SIZE + (linesCleared > 1 ? (linesCleared * linesCleared * GRID_SIZE / 2) : 0);
                 updateScore(clearScore);
                 checkGameOver(); // Перепроверка после очистки
                 isProcessing = false; // Разблокируем
            }, 300);
        }
    }

    function updateScore(points) { score += points; updateScoreDisplay(); }
    function updateScoreDisplay() { scoreElement.textContent = score; }

    function checkGameOver() {
        if (isGameOver) return;
        const availablePieces = currentPieces.filter(p => p !== null);
        if (availablePieces.length === 0) return; // Новые еще не сгенерировались

        let canPlaceAny = false;
        for (const pieceData of availablePieces) {
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (canPlacePiece(pieceData, r, c)) { canPlaceAny = true; break; }
                } if (canPlaceAny) break;
            } if (canPlaceAny) break;
        }
        if (!canPlaceAny) endGame();
    }

    function endGame() {
        isGameOver = true; finalScoreElement.textContent = score;
        gameOverMessageElement.style.display = 'flex';
        console.log("Game Over!");
    }

    // --- Подсветка ---
    function handlePointerOverBoard(e) { if (currentDraggingElement) highlightCells(e.clientX, e.clientY); }
    function handlePointerLeaveBoard() { if (currentDraggingElement) clearHighlights(); }

    function highlightCells(clientX, clientY) {
        clearHighlights();
        if (!draggedPieceData || !currentDraggingElement) return;
        const { gridRow, gridCol } = getGridCoords(clientX, clientY);
        const canPlace = canPlacePiece(draggedPieceData, gridRow, gridCol);
        draggedPieceData.shape.forEach(([r, c]) => {
            const R = gridRow + r, C = gridCol + c;
            if (R >= 0 && R < GRID_SIZE && C >= 0 && C < GRID_SIZE) {
                gameBoardElement.querySelector(`[data-row="${R}"][data-col="${C}"]`)?.classList.add(canPlace ? 'cell-highlight' : 'cell-invalid');
            }
        });
    }
    function clearHighlights() { gameBoardElement.querySelectorAll('.cell-highlight, .cell-invalid').forEach(cell => cell.classList.remove('cell-highlight', 'cell-invalid')); }

    // --- Слушатели кнопок ---
    restartButton.addEventListener('click', initGame);
    restartButtonIngame.addEventListener('click', initGame);

    // --- Старт ---
    initGame();
});