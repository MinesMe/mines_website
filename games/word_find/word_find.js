document.addEventListener('DOMContentLoaded', () => {
    const wheelElement = document.getElementById('letter-wheel');
    const wordListElement = document.getElementById('word-list-circle');
    const currentSelectionElement = document.getElementById('current-selection-circle');
    const winMessageElement = document.getElementById('win-message-circle');
    const playAgainButtonFooter = document.getElementById('play-again-wordcircle-footer');
    const playAgainButtonWin = document.getElementById('play-again-wordcircle-win');
    const lineSvg = document.getElementById('selection-line-svg');
    const linePolyline = document.getElementById('selection-line');

    // --- Уровни Игры ---
    const LEVELS = [
        { letters: ['А', 'Л', 'П', 'К', 'А', 'Б', 'О', 'Р'], words: ["КОРА", "КРАБ", "ПАЛКА", "ПАРА", "ПАРК", "ПОЛК", "ЛАПА"] },
        { letters: ['Н', 'О', 'С', 'Т', 'Р', 'А', 'К', 'И'], words: ["КИТ", "КОРА", "КРАН", "КРОТ", "НОРА", "РАК", "РОСТ"] },
        { letters: ['Т', 'Е', 'Р', 'А', 'К', 'Т', 'О', 'Л'], words: ["КАТОК", "КЛЕТКА", "КРОТ", "ЛЕКТОР", "ЛЕТО", "ТЕАТР", "ТОЛК"] },
        { letters: ['И', 'Е', 'Л', 'С', 'Д', 'О', 'Н', 'А'], words: ["ДЕЛО", "ДОЛИНА", "ЛЕС", "ЛИСА", "НОС", "САД", "СЕЛО"] },
        { letters: ['О', 'Б', 'А', 'К', 'С', 'Р', 'Т', 'У'], words: ["БАРСУК", "БРАК", "КРОТ", "КУСТ", "СОРТ", "СУРОК", "ТРОС"] }
    ];

    // --- Состояние игры ---
    let currentLevelIndex = -1;
    let currentLevelData = {};
    let displayLetters = [];
    let letterElements = [];
    let possibleWordsSet = new Set();
    let foundWords = new Set();
    let isGameOver = false;
    let isDragging = false;
    let selectedPath = [];
    let angleStep = 0;
    const LETTER_CIRCLE_SIZE = 62; // Синхронизировано с CSS

    // --- Инициализация/Перезапуск игры ---
    function initGame(levelIndex = -1) {
        if (levelIndex === -1 || levelIndex >= LEVELS.length) {
             currentLevelIndex = Math.floor(Math.random() * LEVELS.length);
        } else {
             currentLevelIndex = levelIndex;
        }
        currentLevelData = LEVELS[currentLevelIndex];
        possibleWordsSet = new Set(currentLevelData.words.map(w => w.toUpperCase()));
        foundWords.clear();
        isGameOver = false;
        winMessageElement.style.display = 'none';
        clearSelection();
        displayLetters = shuffleArray([...currentLevelData.letters]);
        populateWordList();
        requestAnimationFrame(populateLetterWheel);
        removeWheelListeners();
        addWheelListeners();
    }

    // --- Отображение списка слов ---
    function populateWordList() {
        wordListElement.innerHTML = '';
        currentLevelData.words.sort((a, b) => a.length - b.length || a.localeCompare(b));
        currentLevelData.words.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word.toUpperCase();
            wordSpan.classList.add('word-item-circle');
            wordSpan.dataset.word = word.toUpperCase();
            wordListElement.appendChild(wordSpan);
        });
    }

    // --- Расчет и отображение колеса букв ---
    function calculateAndPlaceLetters() {
        const wheelContainerWidth = wheelElement.offsetWidth;
        if (wheelContainerWidth === 0) { requestAnimationFrame(calculateAndPlaceLetters); return; }
        const wheelRadius = wheelContainerWidth / 2;
        const circlePlacementRadius = wheelRadius - LETTER_CIRCLE_SIZE / 2 - 15;
        angleStep = (2 * Math.PI) / displayLetters.length;
        const startAngle = -Math.PI / 2; // Начинаем с верхней точки (минус 90 градусов)

        letterElements.forEach((circle, index) => {
            const angle = startAngle + index * angleStep; // Добавляем стартовый угол
            const x = wheelRadius + circlePlacementRadius * Math.cos(angle) - LETTER_CIRCLE_SIZE / 2;
            const y = wheelRadius + circlePlacementRadius * Math.sin(angle) - LETTER_CIRCLE_SIZE / 2;
            circle.style.left = `${x}px`;
            circle.style.top = `${y}px`;
            // transform: rotate(90deg) убран из CSS, здесь ничего не меняем
        });
    }

    function populateLetterWheel() {
        wheelElement.innerHTML = '';
        letterElements = [];
        angleStep = (2 * Math.PI) / displayLetters.length; // Пересчет

        displayLetters.forEach((letter, index) => {
            const circle = document.createElement('div');
            circle.classList.add('letter-circle');
            circle.textContent = letter.toUpperCase();
            circle.style.left = `calc(50% - ${LETTER_CIRCLE_SIZE / 2}px)`; // Ставим в центр
            circle.style.top = `calc(50% - ${LETTER_CIRCLE_SIZE / 2}px)`;
            // transform: rotate(90deg) убран из CSS
            circle.dataset.index = index;
            circle.dataset.letter = letter.toUpperCase();
            wheelElement.appendChild(circle);
            letterElements.push(circle);
        });
        requestAnimationFrame(calculateAndPlaceLetters); // Расставляем по кругу
    }

    // --- Перемешивание букв на колесе (убрана кнопка, но функция осталась) ---
    // function shuffleLetterDisplay() { ... } // Если захочешь вернуть, логика та же

    // --- Вспомогательная функция для получения центра буквы ---
    function getLetterCenter(element) {
        // Используем getBoundingClientRect для получения позиций относительно viewport,
        // затем корректируем относительно SVG
        const svgRect = lineSvg.getBoundingClientRect();
        const letterRect = element.getBoundingClientRect();

        const x = letterRect.left + letterRect.width / 2 - svgRect.left;
        const y = letterRect.top + letterRect.height / 2 - svgRect.top;
        return { x, y };
    }


    // --- Обработчики событий колеса ---
    function addWheelListeners() {
        wheelElement.addEventListener('pointerdown', handlePointerDown);
        // Слушатели для оставшихся кнопок
        playAgainButtonFooter.addEventListener('click', () => initGame(-1));
        playAgainButtonWin.addEventListener('click', () => initGame(-1));
    }
    function removeWheelListeners() {
        wheelElement.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('touchmove', preventDefaultScroll);
        playAgainButtonFooter.removeEventListener('click', () => initGame(-1));
        playAgainButtonWin.removeEventListener('click', () => initGame(-1));
    }


    // --- Обработчики перетаскивания ---
    function handlePointerDown(e) {
        if (isGameOver || isDragging) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const targetCircle = e.target.closest('.letter-circle');
        if (!targetCircle) return;
        isDragging = true;
        clearSelection();
        addLetterToPath(targetCircle);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp, { once: true });
        if (e.pointerType === 'touch') { document.addEventListener('touchmove', preventDefaultScroll, { passive: false }); }
    }
     function preventDefaultScroll(e) { e.preventDefault(); }
    function handlePointerMove(e) {
        if (!isDragging || isGameOver) return;
        // Используем elementFromPoint для надежности на разных устройствах
        const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
        const targetCircle = elementUnderPointer?.closest('.letter-circle');
        if (targetCircle && !selectedPath.some(item => item.element === targetCircle)) {
            addLetterToPath(targetCircle);
        }
    }
    function handlePointerUp(e) {
        if (!isDragging) return; isDragging = false;
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('touchmove', preventDefaultScroll);
        if (!isGameOver) { validateSelectedWord(); }
        else { clearSelection(); }
    }

    // --- Логика выбора пути и рисования линии ---
    function addLetterToPath(circleElement) {
        selectedPath.push({ element: circleElement, letter: circleElement.dataset.letter, index: parseInt(circleElement.dataset.index) });
        circleElement.classList.add('selected');
        updateCurrentSelectionDisplay();
        updateSelectionLine(); // Обновляем линию
    }
     function updateCurrentSelectionDisplay() { currentSelectionElement.textContent = selectedPath.map(item => item.letter).join(''); }

     function updateSelectionLine() {
         if (!linePolyline || selectedPath.length < 1) { // Не рисовать для 0 или 1 точки
             if (linePolyline) linePolyline.setAttribute('points', '');
             return;
         };
         // Получаем координаты центров букв
         const points = selectedPath.map(item => {
             const center = getLetterCenter(item.element);
             return `${center.x},${center.y}`;
         }).join(' ');
         linePolyline.setAttribute('points', points);
     }

     function clearSelection() {
         selectedPath.forEach(item => item.element.classList.remove('selected', 'correct', 'incorrect'));
         selectedPath = [];
         updateCurrentSelectionDisplay();
         if (linePolyline) { linePolyline.setAttribute('points', ''); }
     }

    // --- Валидация слова ---
    function validateSelectedWord() {
        const selectedWord = currentSelectionElement.textContent;
        let wordFound = false, alreadyFound = false;
        const currentPathElements = selectedPath.map(item => item.element);

        if (selectedPath.length > 0 && possibleWordsSet.has(selectedWord)) {
            if (!foundWords.has(selectedWord)) {
                wordFound = true; foundWords.add(selectedWord); markWordAsFoundInList(selectedWord);
                highlightPathTemporarily(currentPathElements, 'correct', 400);
                if (foundWords.size === currentLevelData.words.length) { setTimeout(showWinMessage, 500); }
            } else { alreadyFound = true; highlightPathTemporarily(currentPathElements, 'selected', 300); }
        } else if (selectedPath.length > 1) { highlightPathTemporarily(currentPathElements, 'incorrect', 500); }

        if (!isGameOver) {
             const clearDelay = wordFound ? 400 : (alreadyFound ? 300 : (selectedPath.length <=1 ? 0 : 500) );
             setTimeout(() => { if (!isDragging) { clearSelection(); } }, clearDelay);
        }
    }
     function markWordAsFoundInList(word) { const el = wordListElement.querySelector(`.word-item-circle[data-word="${word}"]`); if (el) el.classList.add('found'); }
     function highlightPathTemporarily(pathElements, className, duration = 500) {
         pathElements.forEach(el => { el.classList.remove('selected'); el.classList.add(className); });
         setTimeout(() => { pathElements.forEach(el => { if (el.classList.contains(className)) el.classList.remove(className); }); }, duration);
     }
    // --- Завершение игры ---
    function showWinMessage() { if (isGameOver) return; isGameOver = true; clearSelection(); winMessageElement.style.display = 'flex'; }
    // --- Вспомогательные функции ---
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
    // --- Старт игры при загрузке ---
    initGame();
});