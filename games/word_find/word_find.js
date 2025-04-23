// --- START OF FILE word_find.js ---

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
        { letters: ['Н', 'О', 'С', 'Т', 'Р', 'А', 'К', 'И'], words: ["КИТ", "КОРА", "КРАН", "КРОТ", "НОРА", "РАК", "РОСТ", "СТРОКА", "ТРОС", "КАРТОН"] },
        { letters: ['Т', 'Е', 'Р', 'А', 'К', 'Т', 'О', 'Л'], words: ["КАТОК", "КЛЕТКА", "КРОТ", "ЛЕКТОР", "ЛЕТО", "ТЕАТР", "ТОЛК", "РОТА", "КОЛ", "АКТЕР"] },
        { letters: ['И', 'Е', 'Л', 'С', 'Д', 'О', 'Н', 'А'], words: ["ДЕЛО", "ДОЛИНА", "ЛЕС", "ЛИСА", "НОС", "САД", "СЕЛО", "ОЛЕНЬ", "СЕНО", "ДОН"] },
        { letters: ['О', 'Б', 'А', 'К', 'С', 'Р', 'Т', 'У'], words: ["БАРСУК", "БРАК", "КРОТ", "КУСТ", "СОРТ", "СУРОК", "ТРОС", "БАР", "ТУР", "КОРА", "БРАТ"] }
    ];

    // --- Состояние игры ---
    let currentLevelIndex = -1;
    let currentLevelData = {};
    let displayLetters = []; // The letters currently shown on the wheel
    let letterElements = []; // Array of DOM elements for the letters
    let possibleWordsSet = new Set(); // Set of uppercased words for the current level
    let foundWords = new Set(); // Set of uppercased words found by the player
    let isGameOver = false; // Flag for when the level is complete
    let isDragging = false; // Flag for active pointer dragging
    let selectedPath = []; // Array of {element, letter, index} for the current selection path
    let angleStep = 0; // Calculated angle between letters
    // --- ИЗМЕНЕНА КОНСТАНТА РАЗМЕРА ---
    const LETTER_CIRCLE_SIZE = 50; // Было 62 (Must match CSS .letter-circle width/height)
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---
    const WHEEL_PADDING = 10; // Adjusted padding slightly

    // --- Инициализация/Перезапуск игры ---
    function initGame(levelIndex = -1) {
        console.log("Initializing Word Find game...");
        // Select level
        if (levelIndex === -1 || levelIndex >= LEVELS.length) {
             currentLevelIndex = Math.floor(Math.random() * LEVELS.length);
        } else {
             currentLevelIndex = levelIndex;
        }
        currentLevelData = LEVELS[currentLevelIndex];

        // Reset state
        possibleWordsSet = new Set(currentLevelData.words.map(w => w.toUpperCase()));
        foundWords.clear();
        isGameOver = false;
        winMessageElement.style.display = 'none';
        clearSelection(); // Clear visual selection and path data

        // Prepare letters and UI
        displayLetters = shuffleArray([...currentLevelData.letters]);
        populateWordList(); // Update the list of words to find

        // Use rAF to ensure layout is calculated before placing letters
        requestAnimationFrame(populateLetterWheel);

        // Manage event listeners
        removeWheelListeners(); // Remove old listeners first
        addWheelListeners();
        console.log("Word Find Initialized. Level:", currentLevelIndex);
    }

    // --- Отображение списка слов ---
    function populateWordList() {
        wordListElement.innerHTML = ''; // Clear previous list
        // Sort words (e.g., by length, then alphabetically)
        const sortedWords = [...currentLevelData.words].sort((a, b) => a.length - b.length || a.localeCompare(b));

        sortedWords.forEach(word => {
            const wordSpan = document.createElement('span'); // Use span or li as appropriate
            wordSpan.textContent = word.toUpperCase();
            wordSpan.classList.add('word-item-circle');
            wordSpan.dataset.word = word.toUpperCase(); // Store word for easy lookup
            wordListElement.appendChild(wordSpan);
        });
    }

    // --- Расчет и отображение колеса букв ---
    function calculateAndPlaceLetters() {
        const wheelContainerWidth = wheelElement.offsetWidth;
        // Wait if container not rendered yet
        if (wheelContainerWidth === 0) { requestAnimationFrame(calculateAndPlaceLetters); return; }

        const wheelRadius = wheelContainerWidth / 2;
        // Radius for placing the *center* of the letter circles
        const circlePlacementRadius = wheelRadius - LETTER_CIRCLE_SIZE / 2 - WHEEL_PADDING; // Use updated constants
        angleStep = (2 * Math.PI) / displayLetters.length;
        const startAngle = -Math.PI / 2; // Start at 12 o'clock position

        letterElements.forEach((circle, index) => {
            const angle = startAngle + index * angleStep;
            // Calculate center position, then adjust by half size for top/left
            const centerX = wheelRadius + circlePlacementRadius * Math.cos(angle);
            const centerY = wheelRadius + circlePlacementRadius * Math.sin(angle);
            const x = centerX - LETTER_CIRCLE_SIZE / 2;
            const y = centerY - LETTER_CIRCLE_SIZE / 2;
            circle.style.left = `${x}px`;
            circle.style.top = `${y}px`;
            circle.style.transform = ''; // Reset any previous transform if needed
        });
    }

    function populateLetterWheel() {
        wheelElement.innerHTML = ''; // Clear previous letters
        letterElements = []; // Reset element array
        if (displayLetters.length === 0) return; // Should not happen

        angleStep = (2 * Math.PI) / displayLetters.length; // Recalculate just in case

        displayLetters.forEach((letter, index) => {
            const circle = document.createElement('div');
            circle.classList.add('letter-circle');
            circle.textContent = letter.toUpperCase();
            // Initial position in center before calculation places them
            circle.style.left = `calc(50% - ${LETTER_CIRCLE_SIZE / 2}px)`;
            circle.style.top = `calc(50% - ${LETTER_CIRCLE_SIZE / 2}px)`;
            circle.dataset.index = index; // Store index and letter
            circle.dataset.letter = letter.toUpperCase();
            wheelElement.appendChild(circle);
            letterElements.push(circle);
        });

        // Defer placement until next frame to ensure layout is ready
        requestAnimationFrame(calculateAndPlaceLetters);
    }

    // --- Вспомогательная функция для получения центра буквы (относительно SVG) ---
    function getLetterCenter(element) {
        // Get bounding rects relative to viewport
        const svgRect = lineSvg.getBoundingClientRect();
        const letterRect = element.getBoundingClientRect();

        // Calculate center relative to SVG top-left corner
        const x = letterRect.left + letterRect.width / 2 - svgRect.left;
        const y = letterRect.top + letterRect.height / 2 - svgRect.top;
        return { x, y };
    }

    // --- Обработчики событий колеса ---
    function addWheelListeners() {
        wheelElement.addEventListener('pointerdown', handlePointerDown);
        // Listeners for global "Play Again" / "Next Level" buttons
        playAgainButtonFooter.addEventListener('click', () => initGame(-1)); // Start random level
        playAgainButtonWin.addEventListener('click', () => initGame(-1)); // Start random level
    }

    function removeWheelListeners() {
        wheelElement.removeEventListener('pointerdown', handlePointerDown);
        // Remove document listeners added during drag
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp); // Handle cancel
        document.removeEventListener('touchmove', preventDefaultScroll); // Remove scroll prevention
        // Remove button listeners (or keep them if they should persist)
        // playAgainButtonFooter.removeEventListener('click', () => initGame(-1));
        // playAgainButtonWin.removeEventListener('click', () => initGame(-1));
    }


    // --- Обработчики перетаскивания (Pointer Events) ---
    function handlePointerDown(e) {
        // Ignore if game over, already dragging, or not primary button/touch
        if (isGameOver || isDragging || e.button !== 0 || !e.isPrimary) return;

        const targetCircle = e.target.closest('.letter-circle');
        if (!targetCircle) return; // Didn't click on a letter

        e.preventDefault(); // Prevent default actions
        targetCircle.setPointerCapture(e.pointerId); // Capture pointer

        isDragging = true;
        clearSelection(); // Start a new selection
        addLetterToPath(targetCircle); // Add the first letter

        // Add document listeners for move/up
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp); // Handle cancel

        // Prevent scrolling on touch
        if (e.pointerType === 'touch') {
             document.addEventListener('touchmove', preventDefaultScroll, { passive: false });
        }
    }

    function preventDefaultScroll(e) { e.preventDefault(); }

    function handlePointerMove(e) {
        if (!isDragging || isGameOver || !e.isPrimary) return;
        e.preventDefault();

        // Find the element directly under the current pointer position
        // Use elementFromPoint for better reliability across browsers/devices
        const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
        const targetCircle = elementUnderPointer?.closest('.letter-circle');

        // Check if it's a letter circle AND not already the last one in the path
        if (targetCircle && selectedPath[selectedPath.length - 1]?.element !== targetCircle) {
             // Check if it's already *anywhere* in the path (prevent revisiting)
             if (!selectedPath.some(item => item.element === targetCircle)) {
                 addLetterToPath(targetCircle);
             } else {
                 // Optional: Allow backtracking - remove letters back to the revisited one
                 const existingIndex = selectedPath.findIndex(item => item.element === targetCircle);
                 if (existingIndex !== -1 && existingIndex < selectedPath.length - 1) {
                    // Remove letters after the one we returned to
                     while (selectedPath.length - 1 > existingIndex) {
                         const removedItem = selectedPath.pop();
                         removedItem.element.classList.remove('selected');
                     }
                     updateCurrentSelectionDisplay();
                     updateSelectionLine();
                 }
             }
        }
    }

    function handlePointerUp(e) {
        if (!isDragging || !e.isPrimary) return; // Ignore if not dragging or not primary pointer up

        isDragging = false; // End dragging state

        // Release pointer capture
        try {
            // Use a fallback if e.target might not be the original element
            const capturedElement = document.querySelector('.letter-circle.selected');
             capturedElement?.releasePointerCapture(e.pointerId);
        } catch(err) {
             // Ignore error if capture was already lost
             // console.warn("Could not release pointer capture:", err);
        }

        // Remove global listeners
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        document.removeEventListener('touchmove', preventDefaultScroll);

        // Validate the word if the game isn't over
        if (!isGameOver) {
            validateSelectedWord();
        } else {
            // If game was already over, just clear the selection
            clearSelection();
        }
    }

    // --- Логика выбора пути и рисования линии ---
    function addLetterToPath(circleElement) {
        // Ensure the element exists and has necessary data
        if (!circleElement || !circleElement.dataset.letter || typeof circleElement.dataset.index === 'undefined') return;

        selectedPath.push({
            element: circleElement,
            letter: circleElement.dataset.letter,
            index: parseInt(circleElement.dataset.index)
        });
        circleElement.classList.add('selected'); // Visual feedback
        updateCurrentSelectionDisplay();
        updateSelectionLine(); // Draw/update the line
    }

    function updateCurrentSelectionDisplay() {
        // Join letters from the path array
        currentSelectionElement.textContent = selectedPath.map(item => item.letter).join('');
    }

     function updateSelectionLine() {
         if (!linePolyline) return; // SVG element check

         // Don't draw line for 0 or 1 points
         if (selectedPath.length < 2) {
             linePolyline.setAttribute('points', '');
             return;
         };

         // Get center coordinates for each letter in the path
         const points = selectedPath.map(item => {
             const center = getLetterCenter(item.element);
             return `${center.x},${center.y}`;
         }).join(' '); // Format as "x1,y1 x2,y2 ..."

         // Update the points attribute of the polyline
         linePolyline.setAttribute('points', points);
     }

     function clearSelection() {
         // Remove visual styles from selected letters
         selectedPath.forEach(item => item.element.classList.remove('selected', 'correct', 'incorrect'));
         // Clear the path data
         selectedPath = [];
         // Clear the display and the line
         updateCurrentSelectionDisplay();
         if (linePolyline) { linePolyline.setAttribute('points', ''); }
     }

    // --- Валидация слова ---
    function validateSelectedWord() {
        const selectedWord = currentSelectionElement.textContent;
        if (selectedWord.length < 2) { // Ignore clicks or very short drags
             clearSelection();
             return;
        }

        let wordFound = false;
        let alreadyFound = false;
        const currentPathElements = selectedPath.map(item => item.element); // Get elements for highlighting

        if (possibleWordsSet.has(selectedWord)) { // Is it a valid word for this level?
            if (!foundWords.has(selectedWord)) { // Is it a *new* word?
                wordFound = true;
                foundWords.add(selectedWord);
                markWordAsFoundInList(selectedWord);
                highlightPathTemporarily(currentPathElements, 'correct', 400); // Green flash
                // Check for level completion
                if (foundWords.size === possibleWordsSet.size) {
                    setTimeout(showWinMessage, 500); // Delay win message slightly
                }
            } else {
                alreadyFound = true; // Word is valid but already found
                highlightPathTemporarily(currentPathElements, 'selected', 300); // Yellow flash (or different color)
            }
        } else {
            // Invalid word - Red flash
            highlightPathTemporarily(currentPathElements, 'incorrect', 500);
        }

        // Clear the selection after a delay, unless the game just ended
        if (!isGameOver) {
             // Adjust delay based on outcome
             const clearDelay = wordFound ? 400 : (alreadyFound ? 300 : 500);
             setTimeout(() => {
                 // Only clear if the user hasn't started a new drag immediately
                 if (!isDragging) {
                     clearSelection();
                 }
             }, clearDelay);
        }
    }

     function markWordAsFoundInList(word) {
         // Find the corresponding element in the word list and mark it
         const el = wordListElement.querySelector(`.word-item-circle[data-word="${word}"]`);
         if (el) el.classList.add('found');
     }

     function highlightPathTemporarily(pathElements, className, duration = 500) {
         // Apply temporary class for feedback
         pathElements.forEach(el => {
             el.classList.remove('selected'); // Remove base selection style
             el.classList.add(className);
         });
         // Remove the feedback class after the duration
         setTimeout(() => {
             pathElements.forEach(el => {
                  // Check if the class is still present before removing
                  // (user might have interacted again)
                 if (el?.classList.contains(className)) { // Added safety check for element existence
                      el.classList.remove(className);
                 }
             });
         }, duration);
     }

    // --- Завершение игры (Уровень пройден) ---
    function showWinMessage() {
        if (isGameOver) return; // Prevent multiple triggers
        isGameOver = true;
        const finalScore = foundWords.size; // Score is number of words found
        clearSelection(); // Clear any lingering selection
        winMessageElement.style.display = 'flex'; // Show win popup
        console.log("Word Find Level Complete! Score (words found):", finalScore);

        // --- Send score/result to parent window ---
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'gameOver', game: 'word_find', score: finalScore }, '*');
        }
        // --- End Send score ---
    }

    // --- Вспомогательные функции ---
    function shuffleArray(array) {
        // Fisher-Yates (Knuth) Shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Старт игры при загрузке ---
    initGame(); // Start the first level automatically
});
// --- END OF FILE word_find.js ---