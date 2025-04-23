document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('match3-grid');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('game-over-match3');
    const finalScoreElement = document.getElementById('final-score-match3');
    const restartButton = document.getElementById('restart-match3');
    const playAgainButton = document.getElementById('play-again-match3');

    // --- Параметры Игры ---
    const GRID_SIZE = 8;
    const NUM_ITEM_TYPES = 5;
    let CELL_SIZE = 0;

    // --- Состояние Игры ---
    let gridData = [];
    let gridItems = [];
    let score = 0;
    let isProcessing = false;

    // --- Состояние для перетаскивания ---
    let isDragging = false;
    let startDragItem = null; // { element, row, col }
    let startPointerPos = null; // { x, y }
    let currentPointerPos = null; // { x, y } - Добавим для хранения текущей позиции
    const SWIPE_THRESHOLD = 20;

    // --- Инициализация (без изменений) ---
    function initGame() {
        CELL_SIZE = gridElement.offsetWidth / GRID_SIZE;
        if (CELL_SIZE === 0) {
            requestAnimationFrame(initGame);
            return;
        }
        console.log("Cell size:", CELL_SIZE);

        score = 0;
        isProcessing = false;
        isDragging = false;
        startDragItem = null;
        startPointerPos = null;
        currentPointerPos = null;
        updateScoreDisplay();
        if(gameOverElement) gameOverElement.style.display = 'none';

        gridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

        createInitialGridData();
        renderGrid();
        removeEventListeners();
        addEventListeners();
        console.log("Game Initialized with Strict Swipe Controls");
    }

    // --- Создание данных, Рендер, Создание элемента (без изменений) ---
    function createInitialGridData() {
        gridData = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            gridData[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                let newItemType;
                do { newItemType = getRandomItemType(); } while (
                    (c >= 2 && gridData[r][c - 1] === newItemType && gridData[r][c - 2] === newItemType) ||
                    (r >= 2 && gridData[r - 1][c] === newItemType && gridData[r - 2][c] === newItemType)
                );
                gridData[r][c] = newItemType;
            }
        }
    }
    function renderGrid() {
        gridElement.innerHTML = '';
        gridItems = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            gridItems[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                if (gridData[r][c] === null) { gridItems[r][c] = null; continue; }
                const item = createGridItemElement(r, c, gridData[r][c]);
                gridElement.appendChild(item);
                gridItems[r][c] = item;
            }
        }
    }
    function createGridItemElement(r, c, type, startAbove = false) {
         const item = document.createElement('div');
         item.classList.add('match3-item', `item-type-${type}`);
         item.dataset.row = r;
         item.dataset.col = c;
         const topPosition = startAbove ? `${-1 * (100 / GRID_SIZE)}%` : `${r * (100 / GRID_SIZE)}%`;
         item.style.top = topPosition;
         item.style.left = `${c * (100 / GRID_SIZE)}%`;
         item.style.width = `${100 / GRID_SIZE}%`;
         item.style.height = `${100 / GRID_SIZE}%`;
         item.draggable = false;
         item.ondragstart = () => false;
         return item;
    }
    function updateGridAppearance() { // (без изменений)
         for (let r = 0; r < GRID_SIZE; r++) {
             for (let c = 0; c < GRID_SIZE; c++) {
                 const itemElement = gridItems[r]?.[c];
                 const itemType = gridData[r]?.[c];
                 if (itemElement && itemType !== null) {
                     itemElement.style.top = `${r * (100 / GRID_SIZE)}%`;
                     itemElement.style.left = `${c * (100 / GRID_SIZE)}%`;
                     if (!itemElement.classList.contains(`item-type-${itemType}`)) {
                         itemElement.className = `match3-item item-type-${itemType}`;
                         itemElement.draggable = false;
                         itemElement.ondragstart = () => false;
                     }
                     itemElement.dataset.row = r;
                     itemElement.dataset.col = c;
                 } else if (!itemElement && itemType !== null) {
                     const newItem = createGridItemElement(r, c, itemType, true);
                     gridElement.appendChild(newItem);
                     gridItems[r][c] = newItem;
                     void newItem.offsetWidth;
                     newItem.style.top = `${r * (100 / GRID_SIZE)}%`;
                 } else if (itemElement && itemType === null) {
                     if (!itemElement.classList.contains('matched')) {
                         itemElement.remove();
                         gridItems[r][c] = null;
                     }
                 }
             }
         }
     }

    // --- Слушатели событий (без изменений) ---
    function addEventListeners() {
        gridElement.addEventListener('pointerdown', handlePointerDown);
        restartButton.addEventListener('click', initGame);
        if(playAgainButton) playAgainButton.addEventListener('click', initGame);
    }
    function removeEventListeners() {
         gridElement.removeEventListener('pointerdown', handlePointerDown);
         document.removeEventListener('pointermove', handlePointerMove);
         document.removeEventListener('pointerup', handlePointerUp);
         document.removeEventListener('pointercancel', handlePointerUp);
         document.removeEventListener('touchmove', preventDefaultScroll, { passive: false });
         restartButton.removeEventListener('click', initGame);
         if(playAgainButton) playAgainButton.removeEventListener('click', initGame);
     }


    // --- Обработка событий перетаскивания ---

    function handlePointerDown(event) {
        if (isProcessing || isDragging) return;
        const downItem = event.target.closest('.match3-item');
        if (!downItem) return;

        event.preventDefault();
        downItem.setPointerCapture(event.pointerId);

        isDragging = true;
        const row = parseInt(downItem.dataset.row);
        const col = parseInt(downItem.dataset.col);
        startDragItem = { element: downItem, row, col };
        startPointerPos = { x: event.clientX, y: event.clientY };
        currentPointerPos = { ...startPointerPos }; // Инициализируем текущую позицию

        // Применяем визуальный эффект начала перетаскивания
        downItem.style.zIndex = '10';
        downItem.style.transform = 'scale(1.05)'; // Только увеличиваем
        downItem.style.cursor = 'grabbing';

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp);
        if (event.pointerType === 'touch') {
             document.addEventListener('touchmove', preventDefaultScroll, { passive: false });
        }
    }

    function handlePointerMove(event) {
        if (!isDragging || !startDragItem) return;
        event.preventDefault();

        // !!! ИЗМЕНЕНО: Просто обновляем текущие координаты, не двигаем элемент
        currentPointerPos = { x: event.clientX, y: event.clientY };

        // Можно добавить легкую анимацию "дрожания" или подсветку элемента, если нужно,
        // но не перемещение за курсором.
        // startDragItem.element.style.transform = `scale(1.05)`; // Оставляем только scale
    }

    function handlePointerUp(event) {
        if (!isDragging || !startDragItem) return;

        const initialElement = startDragItem.element; // Сохраняем ссылку

        // Пытаемся отпустить захват и сбросить стили
        try {
            initialElement.releasePointerCapture(event.pointerId);
            initialElement.style.zIndex = '';
            initialElement.style.transform = ''; // Сбрасываем scale
            initialElement.style.cursor = '';
        } catch (e) {
            console.warn("Error releasing pointer capture or resetting style:", e);
        }

        // Координаты в момент отпускания берем из сохраненных в handlePointerMove
        const endX = currentPointerPos.x;
        const endY = currentPointerPos.y;
        const deltaX = endX - startPointerPos.x;
        const deltaY = endY - startPointerPos.y;

        // Убираем глобальные слушатели
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        document.removeEventListener('touchmove', preventDefaultScroll, { passive: false });

        isDragging = false; // Завершаем состояние перетаскивания СРАЗУ

        // Определяем направление и силу свайпа
        let targetRow = startDragItem.row;
        let targetCol = startDragItem.col;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (Math.max(absDeltaX, absDeltaY) > SWIPE_THRESHOLD) {
            if (absDeltaX > absDeltaY) {
                targetCol = startDragItem.col + (deltaX > 0 ? 1 : -1);
            } else {
                targetRow = startDragItem.row + (deltaY > 0 ? 1 : -1);
            }

            if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
                console.log(`Swipe detected: from [${startDragItem.row},${startDragItem.col}] to [${targetRow},${targetCol}]`);
                // Передаем КООРДИНАТЫ в attemptSwap, а не элемент, т.к. startDragItem обнулится
                attemptSwap(startDragItem.row, startDragItem.col, targetRow, targetCol);
            } else {
                console.log("Swipe out of bounds or too short.");
            }
        } else {
            console.log("Swipe too short.");
        }

        // Сбрасываем состояние перетаскивания
        startDragItem = null;
        startPointerPos = null;
        currentPointerPos = null;
    }

    function preventDefaultScroll(e) {
        e.preventDefault();
    }

    // --- Проверка соседства, Попытка свайпа, Визуальный свайп, Свайп данных (без изменений) ---
    function areAdjacent(r1, c1, r2, c2) { return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1; }
    async function attemptSwap(r1, c1, r2, c2) {
        if (isProcessing) return;
        if (!areAdjacent(r1, c1, r2, c2)) {
             console.warn("Attempted swap between non-adjacent cells.");
             return;
        }
        isProcessing = true;

        const item1 = gridItems[r1]?.[c1];
        const item2 = gridItems[r2]?.[c2];
        if (!item1 || !item2) {
            isProcessing = false;
            return;
        }

        await visualSwap(item1, item2);
        swapData(r1, c1, r2, c2);
        const matches = checkForAllMatches();

        if (matches.length > 0) {
            await processMatchesAndRefill(matches);
        } else {
            await visualSwap(item1, item2); // Анимация обратно
            swapData(r1, c1, r2, c2); // Данные обратно
        }
        isProcessing = false;
    }
    function visualSwap(item1, item2) {
         return new Promise(resolve => {
            if (!item1 || !item2) { resolve(); return; }
            const top1 = item1.style.top, left1 = item1.style.left;
            const top2 = item2.style.top, left2 = item2.style.left;
            item1.style.top = top2; item1.style.left = left2;
            item2.style.top = top1; item2.style.left = left1;
            const r1 = item1.dataset.row, c1 = item1.dataset.col;
            item1.dataset.row = item2.dataset.row; item1.dataset.col = item2.dataset.col;
            item2.dataset.row = r1; item2.dataset.col = c1;
             setTimeout(resolve, 250);
         });
    }
    function swapData(r1, c1, r2, c2) {
        [gridData[r1][c1], gridData[r2][c2]] = [gridData[r2][c2], gridData[r1][c1]];
        [gridItems[r1][c1], gridItems[r2][c2]] = [gridItems[r2][c2], gridItems[r1][c1]];
    }

    // --- Поиск совпадений, Обработка каскадов, Удаление, Падение, Заполнение, Анимация новых, Вспомогательные (без изменений) ---
    function checkForAllMatches() {
        const matches = new Set();
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE - 2; ) {
                if (gridData[r][c] !== null && gridData[r][c] === gridData[r][c + 1] && gridData[r][c] === gridData[r][c + 2]) {
                    let matchLen = 3;
                    while (c + matchLen < GRID_SIZE && gridData[r][c] === gridData[r][c + matchLen]) matchLen++;
                    for (let i = 0; i < matchLen; i++) matches.add(`${r}-${c + i}`);
                    c += matchLen;
                } else { c++; }
            }
        }
        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r < GRID_SIZE - 2; ) {
                 if (gridData[r][c] !== null && gridData[r][c] === gridData[r + 1][c] && gridData[r][c] === gridData[r + 2][c]) {
                     let matchLen = 3;
                     while (r + matchLen < GRID_SIZE && gridData[r][c] === gridData[r + matchLen][c]) matchLen++;
                      for (let i = 0; i < matchLen; i++) matches.add(`${r + i}-${c}`);
                      r += matchLen;
                 } else { r++; }
            }
       }
        return Array.from(matches).map(coord => { const [row, col] = coord.split('-').map(Number); return { row, col }; });
    }
     async function processMatchesAndRefill(initialMatches) {
         let currentMatches = initialMatches;
         while (currentMatches.length > 0) {
             updateScore(currentMatches.length);
             await visuallyRemoveMatches(currentMatches);
             removeMatchesFromData(currentMatches);
             await handleFallingPieces();
             refillGrid();
             await animateNewPieces();
             currentMatches = checkForAllMatches();
             if (currentMatches.length > 0) {
                 await new Promise(resolve => setTimeout(resolve, 200));
             }
         }
     }
    function visuallyRemoveMatches(matches) {
        return new Promise(resolve => {
             matches.forEach(({ row, col }) => {
                  const item = gridItems[row]?.[col];
                  if (item) item.classList.add('matched');
             });
             setTimeout(() => {
                  matches.forEach(({ row, col }) => {
                       const item = gridItems[row]?.[col];
                       if (item) { item.remove(); gridItems[row][col] = null; }
                  });
                  resolve();
             }, 400);
        });
    }
     function removeMatchesFromData(matches) { matches.forEach(({ row, col }) => { if (gridData[row]) gridData[row][col] = null; }); }
    async function handleFallingPieces() {
         let fell = false;
         for (let c = 0; c < GRID_SIZE; c++) {
              let writeRow = GRID_SIZE - 1;
              for (let r = GRID_SIZE - 1; r >= 0; r--) {
                   if (gridData[r][c] !== null) {
                        if (r !== writeRow) {
                             gridData[writeRow][c] = gridData[r][c];
                             gridData[r][c] = null;
                             gridItems[writeRow][c] = gridItems[r][c];
                             gridItems[r][c] = null;
                             if (gridItems[writeRow][c]) {
                                 gridItems[writeRow][c].dataset.row = writeRow;
                             }
                             fell = true;
                        }
                        writeRow--;
                   }
              }
         }
        if (fell) {
             updateGridAppearance();
             await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    function refillGrid() {
        for (let c = 0; c < GRID_SIZE; c++) {
             for (let r = 0; r < GRID_SIZE; r++) {
                 if (gridData[r][c] === null) {
                     gridData[r][c] = getRandomItemType();
                 }
             }
        }
    }
     function animateNewPieces() {
          return new Promise(resolve => {
               updateGridAppearance();
               setTimeout(resolve, 300);
          });
     }
    function getRandomItemType() { return Math.floor(Math.random() * NUM_ITEM_TYPES); }
    function updateScore(points) { score += points; updateScoreDisplay(); }
    function updateScoreDisplay() { scoreElement.textContent = score; }

    // --- Старт Игры ---
    requestAnimationFrame(initGame);
});