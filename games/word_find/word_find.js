// --- START OF FILE word_find.js ---

document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.wordcircle-game-container');
    const gridContainerElement = document.getElementById('wordcircle-grid-container'); // Grid container element
    const wheelElement = document.getElementById('letter-wheel');
    const winMessageElement = document.getElementById('win-message-circle');
    const winMessageHeading = winMessageElement.querySelector('h2'); // Element for win message text
    const winMessageParagraph = winMessageElement.querySelector('p'); // Element for "Under Development" text
    const playAgainButtonWin = document.getElementById('play-again-wordcircle-win');
    const shuffleButton = document.getElementById('play-again-wordcircle-footer'); // Repurposed footer button
    const lineSvg = document.getElementById('selection-line-svg');
    const linePolyline = document.getElementById('selection-line');

    // --- Уровни Игры (УПРОЩЕННАЯ СТРУКТУРА) ---
    // Каждый уровень теперь просто список слов для нахождения и набор букв.
    // Сетка будет генерироваться автоматически как отдельные ряды.
    const LEVELS = [
        {
            letters: ['Н', 'С', 'О'],
            words: ["НОС", "СОН"]
        },
        {
            letters: ['С', 'Л', 'О', 'Ь'],
            words: ["ОСЬ", "СОЛЬ", "ЛОСЬ"]
        },
        {
            letters: ['Ш', 'А', 'Ф', 'Р'],
            words: ["ШАР", "ФАРШ", "ШАРФ"]
        },
        {
            letters: ['П', 'О', 'Б', 'Е', 'Д', 'А', 'Я'],
            words: ["БЕДА", "ОБЕД", "ЯБЕДА", "ПОБЕДА"]
        }
    ];

     const WIN_MESSAGES = ["Молодец!", "Супер!", "Отлично!"]; // Messages for levels 0, 1, 2 completion

    // --- Состояние игры ---
    let currentLevelIndex = 0; // Start at the first level (index 0)
    let currentLevelData = {};
    let displayLetters = []; // The letters currently shown on the wheel
    let letterElements = []; // Array of DOM elements for the letters on the wheel
    let possibleWordsSet = new Set(); // Set of uppercased words for the current level
    let foundWords = new Set(); // Set of uppercased words found by the player
    let gridCellElements = {}; // Map to store grid cell elements, keyed by word and index (e.g., 'НОС_0', 'НОС_1', ...)

    let isGameOver = false; // Flag for when the level is complete
    let isDragging = false; // Flag for active pointer dragging
    let selectedPath = []; // Array of {element, letter, index} for the current selection path
    let angleStep = 0; // Calculated angle between letters
    const LETTER_CIRCLE_SIZE = 50; // Must match CSS .letter-circle width/height
    const WHEEL_PADDING = 10;

    // --- Инициализация/Перезапуск игры ---
    function initGame(levelIndex = 0) {
        console.log("Initializing Word Find game...");
        console.log("LEVELS length:", LEVELS.length);

        // Validate level index and loop back if needed
        if (levelIndex < 0 || levelIndex >= LEVELS.length) {
            console.warn(`Invalid level index ${levelIndex}. Resetting to level 0.`);
            currentLevelIndex = 0;
        } else {
            currentLevelIndex = levelIndex;
        }
         console.log("Starting level index:", currentLevelIndex);

        currentLevelData = LEVELS[currentLevelIndex];

        // Reset state
        possibleWordsSet = new Set(currentLevelData.words.map(w => w.toUpperCase()));
        foundWords.clear();
        isGameOver = false;
        winMessageElement.style.display = 'none';
        winMessageParagraph.style.display = 'none'; // Hide development message by default
        clearSelection(); // Clear visual selection and path data

        // Prepare letters and UI
        displayLetters = shuffleArray([...currentLevelData.letters]); // Shuffle letters for variety
        populateGrid(); // Build and display the grid (simple rows) for the new level

        // Use rAF to ensure layout is calculated before placing letters
        requestAnimationFrame(populateLetterWheel);

        // Manage event listeners - remove old ones before adding new ones if they were attached to wheel
        // (In this case, listeners are mostly on document or persistent buttons, so simpler)
        removeWheelListeners(); // Remove doc listeners from previous drag
        addWheelListeners(); // Add doc listeners for *this* drag session

        console.log("Word Find Initialized. Level:", currentLevelIndex, "Words to find:", [...possibleWordsSet]);

        // Scroll container to top if needed (especially after level transition)
        gameContainer.scrollTop = 0;
    }

    // --- Отображение сетки слов (упрощенная версия) ---
    function populateGrid() {
        gridContainerElement.innerHTML = ''; // Clear previous grid
        gridCellElements = {}; // Reset cell element map

        const wordsForLevel = [...currentLevelData.words].sort((a, b) => a.length - b.length || a.localeCompare(b)); // Sort words for consistent display

        wordsForLevel.forEach(word => {
            const wordRowDiv = document.createElement('div');
            wordRowDiv.classList.add('word-row');
            wordRowDiv.dataset.word = word.toUpperCase(); // Store the word on the row

            for (let i = 0; i < word.length; i++) {
                const letter = word[i].toUpperCase();
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('grid-cell');
                // We don't put the letter in textContent initially, only when found
                // cellDiv.textContent = letter; // Keep empty initially

                // Store data needed to identify this cell later
                cellDiv.dataset.word = word.toUpperCase();
                cellDiv.dataset.index = i;
                cellDiv.dataset.letter = letter; // Store correct letter for filling

                wordRowDiv.appendChild(cellDiv);

                // Store the element reference keyed by word and index
                gridCellElements[`${word.toUpperCase()}_${i}`] = cellDiv;
            }
            gridContainerElement.appendChild(wordRowDiv);
        });

        // Adjust cell size based on the longest word and container width
        const longestWordLength = Math.max(...wordsForLevel.map(w => w.length));
        if (longestWordLength > 0) {
             adjustGridCellSize(longestWordLength);
        }
    }

    // Adjust cell size based on max word length and container width
     function adjustGridCellSize(maxWordLength) {
        if (maxWordLength === 0) return;

        const containerWidth = gridContainerElement.offsetWidth - parseInt(getComputedStyle(gridContainerElement).paddingLeft) * 2; // Subtract padding
        const gap = parseInt(getComputedStyle(document.querySelector('.word-row') || gridContainerElement).gap) || 0; // Get gap from row or default

        // Calculate max possible cell size based on container width and longest word
        const maxCellSize = 35; // Maximum desired cell size
        const calculatedSizeFromWidth = (containerWidth - gap * (maxWordLength - 1)) / maxWordLength;

        // Choose the smaller of the calculated size and the max desired size
        const finalSize = Math.min(calculatedSizeFromWidth, maxCellSize);

        // Apply the calculated size to all grid cells
        // We can't use grid-template-columns on the container anymore
        // Iterate through all cell elements and set their width/height directly
        Object.values(gridCellElements).forEach(cell => {
             if (cell) { // Safety check
                 cell.style.width = `${finalSize}px`;
                 cell.style.height = `${finalSize}px`;
             }
        });

        // Adjust font size in cells
        const fontSize = finalSize * 0.6; // Adjust factor
         Object.values(gridCellElements).forEach(cell => {
             if (cell) {
                 cell.style.fontSize = `${fontSize}px`;
             }
         });

         // Recalculate placement of letters on wheel (less likely needed if grid is flexbox)
         requestAnimationFrame(calculateAndPlaceLetters);
     }

    // Ensure grid size is adjusted on window resize
     window.addEventListener('resize', () => {
         if (currentLevelData && currentLevelData.words) {
            const longestWordLength = Math.max(...currentLevelData.words.map(w => w.length));
            if (longestWordLength > 0) {
                 adjustGridCellSize(longestWordLength);
            }
         }
     });


    // --- Расчет и отображение колеса букв ---
    function calculateAndPlaceLetters() {
        const wheelContainer = document.querySelector('.letter-wheel-container');
        const wheelContainerWidth = wheelContainer ? wheelContainer.offsetWidth : 0;

        if (wheelContainerWidth === 0) {
            requestAnimationFrame(calculateAndPlaceLetters);
            return;
        }

        const wheelRadius = wheelContainerWidth / 2;
        const circlePlacementRadius = wheelRadius - LETTER_CIRCLE_SIZE / 2 - WHEEL_PADDING;
        // Recalculate angle step based on current displayLetters length
        const currentAngleStep = (2 * Math.PI) / displayLetters.length;
        const startAngle = -Math.PI / 2; // Start at 12 o'clock position

        letterElements.forEach((circle, index) => {
            const angle = startAngle + index * currentAngleStep;
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
        if (displayLetters.length === 0) return;

        // Angle step is calculated within calculateAndPlaceLetters now for flexibility

        displayLetters.forEach((letter, index) => {
            const circle = document.createElement('div');
            circle.classList.add('letter-circle');
            circle.textContent = letter.toUpperCase();
            circle.dataset.index = index; // Store index and letter
            circle.dataset.letter = letter.toUpperCase();
            // Initial position in center before calculation places them
             circle.style.left = `calc(50% - ${LETTER_CIRCLE_SIZE / 2}px)`;
             circle.style.top = `calc(50% - ${LETTER_CIRCLE_SIZE / 2}px)`;
            wheelElement.appendChild(circle);
            letterElements.push(circle);
        });

        // Defer placement until next frame
        requestAnimationFrame(calculateAndPlaceLetters);
    }

     // --- Перемешивание букв на колесе ---
     function shuffleLettersOnWheel() {
         if (isGameOver || isDragging) return;

         // Perform shuffle on the displayLetters array
         displayLetters = shuffleArray(displayLetters);

         // Animate the movement of existing letter circles to new positions
         // Clear the old element array reference, but keep the DOM elements for animation
         const oldLetterElementsInDOM = Array.from(wheelElement.querySelectorAll('.letter-circle'));

         letterElements = []; // Reset the logical array of elements

         const startAngle = -Math.PI / 2;
         const wheelContainerWidth = document.querySelector('.letter-wheel-container').offsetWidth;
         const wheelRadius = wheelContainerWidth / 2;
         const circlePlacementRadius = wheelRadius - LETTER_CIRCLE_SIZE / 2 - WHEEL_PADDING;
         const currentAngleStep = (2 * Math.PI) / displayLetters.length; // Use current angle step

         displayLetters.forEach((letter, newIndex) => {
             const angle = startAngle + newIndex * currentAngleStep;
             const centerX = wheelRadius + circlePlacementRadius * Math.cos(angle);
             const centerY = wheelRadius + circlePlacementRadius * Math.sin(angle);
             const newX = centerX - LETTER_CIRCLE_SIZE / 2;
             const newY = centerY - LETTER_CIRCLE_SIZE / 2;

             // Find the old element for this letter that hasn't been assigned a new position yet
             let oldElement = oldLetterElementsInDOM.find(el => el.dataset.letter === letter && !el.classList.contains('assigned-new-pos'));

             if (oldElement) {
                  oldElement.dataset.index = newIndex; // Update index
                  oldElement.classList.add('assigned-new-pos'); // Mark as assigned
                  // Set the new position
                  oldElement.style.left = `${newX}px`;
                  oldElement.style.top = `${newY}px`;
                  oldElement.style.transform = 'scale(1)'; // Reset scale from selected/hover
                  oldElement.classList.remove('selected', 'correct', 'incorrect'); // Remove any state classes
                   oldElement.style.transition = 'left 0.5s ease-in-out, top 0.5s ease-in-out, transform 0.2s ease'; // Add transition

                  // After transition, remove the temporary class and reset transition property
                  oldElement.ontransitionend = (event) => {
                      // Ensure the transition event is for left or top
                      if (event.propertyName === 'left' || event.propertyName === 'top') {
                         oldElement.classList.remove('assigned-new-pos');
                         oldElement.style.transition = ''; // Reset to default transition
                         oldElement.ontransitionend = null; // Clean up listener
                      }
                  };

                  letterElements.push(oldElement); // Add to the new element array
             } else {
                 // This case should ideally not happen if letters match, but as a fallback:
                 console.warn(`Letter ${letter} not found in old elements during shuffle.`);
                 const circle = document.createElement('div');
                  circle.classList.add('letter-circle');
                  circle.textContent = letter.toUpperCase();
                  circle.dataset.index = newIndex;
                  circle.dataset.letter = letter.toUpperCase();
                   circle.style.left = `${newX}px`; // Place directly at final position
                   circle.style.top = `${newY}px`;
                   wheelElement.appendChild(circle); // Add to DOM
                   letterElements.push(circle);
             }
         });

         // Remove any old elements that weren't reused (should be none if letters match)
         oldLetterElementsInDOM.forEach(el => {
             if (!el.classList.contains('assigned-new-pos')) {
                 el.remove();
             }
         });

          console.log("Letters shuffled.");
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

        // Listeners for buttons
        playAgainButtonWin.addEventListener('click', handleWinButtonClick);
        shuffleButton.addEventListener('click', shuffleLettersOnWheel); // Use footer button for shuffle
    }

    function removeWheelListeners() {
        // Remove document listeners that are added/removed during drag
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        document.removeEventListener('touchmove', preventDefaultScroll); // Remove scroll prevention
        // Do NOT remove listeners from persistent buttons (playAgainButtonWin, shuffleButton)
        // Do NOT remove the pointerdown listener from wheelElement itself, it's handled there.
    }

    function handleWinButtonClick() {
        if (currentLevelIndex === LEVELS.length - 1) {
            // If it was the last level, reset to level 0
            initGame(0);
        } else {
            // Otherwise, go to the next level
            initGame(currentLevelIndex + 1);
        }
    }

    // --- Обработчики перетаскивания (Pointer Events) ---
    function handlePointerDown(e) {
        // Ignore if game over, already dragging, or not primary button/touch
        if (isGameOver || isDragging || (e.button !== 0 && e.button !== -1)) return; // Allow mouse left click (0) and touch (-1)

        const targetCircle = e.target.closest('.letter-circle');
        if (!targetCircle) return; // Didn't click on a letter

        e.preventDefault(); // Prevent default actions like scrolling
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
        if (!isDragging || isGameOver) return;
        e.preventDefault();

        // Find the element directly under the current pointer position
        const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
        const targetCircle = elementUnderPointer?.closest('.letter-circle');

        if (targetCircle) {
             const targetItem = {
                 element: targetCircle,
                 letter: targetCircle.dataset.letter,
                 index: parseInt(targetCircle.dataset.index)
             };

             const lastSelectedItem = selectedPath[selectedPath.length - 1];

             if (lastSelectedItem && targetItem.element === lastSelectedItem.element) {
                 // Pointer is still over the last selected letter, do nothing
                 return;
             }

             const existingIndex = selectedPath.findIndex(item => item.element === targetItem.element);

             if (existingIndex === -1) {
                 // New letter - add it to the path. Allow any new letter, not just adjacent.
                 addLetterToPath(targetCircle);
             } else if (existingIndex === selectedPath.length - 2) {
                 // Pointer moved back to the second-to-last letter - allow backtracking
                 removeLastLetterFromPath();
             } else {
                // Pointer moved to an earlier letter (not the last or second-to-last) - ignore or truncate path
                // For simplicity, we'll ignore moves to non-adjacent earlier letters.
                // To truncate: while (selectedPath.length - 1 > existingIndex) { removeLastLetterFromPath logic };
             }
        }
         // Update the line after potential path changes (add/remove)
         updateSelectionLine();
    }

     function removeLastLetterFromPath() {
         if (selectedPath.length > 1) {
             const removedItem = selectedPath.pop();
             if (removedItem && removedItem.element) {
                removedItem.element.classList.remove('selected');
             }
         } else if (selectedPath.length === 1) {
             // If only one letter is left and pointer moves back off it, clear selection
             clearSelection();
         }
     }


    function handlePointerUp(e) {
        if (!isDragging) return;

        isDragging = false; // End dragging state

        // Release pointer capture
        try {
            const capturedElement = document.querySelector('.letter-circle.selected');
             if (capturedElement) {
                 capturedElement.releasePointerCapture(e.pointerId).catch(() => {});
             } else {
                  e.target?.releasePointerCapture(e.pointerId).catch(() => {});
             }
        } catch(err) {
             // Ignore error
        }

        // Remove global listeners
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        document.removeEventListener('touchmove', preventDefaultScroll);

        // Validate the word if the game isn't over and there's a selection
        if (!isGameOver && selectedPath.length > 0) {
            validateSelectedWord();
        } else {
             // If game over or no valid selection, just clear visuals
             clearSelection();
        }
    }

    // --- Логика выбора пути и рисования линии ---
    function addLetterToPath(circleElement) {
        if (!circleElement || !circleElement.dataset.letter || typeof circleElement.dataset.index === 'undefined') return;

        selectedPath.push({
            element: circleElement,
            letter: circleElement.dataset.letter,
            index: parseInt(circleElement.dataset.index)
        });
        circleElement.classList.add('selected'); // Visual feedback
        updateSelectionLine(); // Draw/update the line
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
         selectedPath.forEach(item => {
             if (item && item.element) { // Add safety check
                item.element.classList.remove('selected', 'correct', 'incorrect');
             }
         });
         // Clear the path data
         selectedPath = [];
         // Clear the line
         if (linePolyline) { linePolyline.setAttribute('points', ''); }
     }

    // --- Валидация слова ---
    function validateSelectedWord() {
        // Get the word directly from the selected path
        const selectedWord = selectedPath.map(item => item.letter).join('');

        // Check if it's a possible word for this level
        const isPossibleWord = possibleWordsSet.has(selectedWord);

        if (!isPossibleWord) {
             // Invalid word - Red flash
             highlightPathTemporarily(selectedPath.map(item => item.element), 'incorrect', 500);
             setTimeout(clearSelection, 500); // Clear after animation
             return; // Stop further processing
        }

        // Word is valid for this level
        if (foundWords.has(selectedWord)) {
            // Valid word but already found - Yellow flash
            highlightPathTemporarily(selectedPath.map(item => item.element), 'selected', 300);
            setTimeout(clearSelection, 300); // Clear after animation
        } else {
            // New valid word - Green flash and fill grid
            foundWords.add(selectedWord);
            fillGridWord(selectedWord); // Fill the word in the grid
            highlightPathTemporarily(selectedPath.map(item => item.element), 'correct', 400); // Green flash

            // Check for level completion after a short delay to allow fill animation to start
            setTimeout(() => {
                if (foundWords.size === possibleWordsSet.size) {
                    showWinMessage(); // Delay win message slightly after animations
                } else {
                    // If level is not complete, clear selection after successful find animation
                    clearSelection();
                }
            }, 400); // Delay matches highlight animation duration
        }
    }

     // --- Заполнение слова в сетке (упрощенная версия) ---
     function fillGridWord(word) {
         const upperWord = word.toUpperCase();

         // Find all cells corresponding to this word using the map
         for (let i = 0; i < upperWord.length; i++) {
             const cellKey = `${upperWord}_${i}`;
             const cellElement = gridCellElements[cellKey];

             if (cellElement) {
                  // Set the text content and add the 'found' class
                  cellElement.textContent = upperWord[i];
                  cellElement.classList.add('found');
             } else {
                  console.warn(`Cell element not found for word "${word}" at index ${i}. Key: ${cellKey}`);
             }
         }
     }


     function highlightPathTemporarily(pathElements, className, duration = 500) {
         // Apply temporary class for feedback
         pathElements.forEach(el => {
             if (el) { // Safety check
                el.classList.remove('selected'); // Remove base selection style
                el.classList.add(className);
             }
         });
         // Remove the feedback class after the duration
         setTimeout(() => {
             pathElements.forEach(el => {
                  if (el?.classList.contains(className)) {
                       el.classList.remove(className);
                  }
             });
         }, duration);
     }

    // --- Завершение игры (Уровень пройден) ---
    function showWinMessage() {
        if (isGameOver) return; // Prevent multiple triggers
        isGameOver = true;
        // Clear any lingering selection visuals immediately
        clearSelection();

        const isLastLevel = currentLevelIndex === LEVELS.length - 1;

        winMessageElement.style.display = 'flex'; // Show win popup

        // Determine message and button text based on level index
        if (currentLevelIndex >= 0 && currentLevelIndex < WIN_MESSAGES.length) {
            // Levels 0, 1, 2 get "Молодец!", "Супер!", "Отлично!"
            winMessageHeading.textContent = WIN_MESSAGES[currentLevelIndex];
            playAgainButtonWin.textContent = "Следующий уровень";
            winMessageParagraph.style.display = 'none';
            // Reset button styles to default success styles
            playAgainButtonWin.style.backgroundColor = ''; // Clear inline style
            playAgainButtonWin.style.borderColor = ''; // Clear inline style
            playAgainButtonWin.style.boxShadow = ''; // Clear inline style
        } else if (isLastLevel) { // This handles level 3 (index 3) which is > WIN_MESSAGES.length - 1
            winMessageHeading.textContent = "Поздравляем!"; // Or keep it general like "Уровень пройден!"
            winMessageParagraph.textContent = "Все уровни пройдены.\nПродолжение в разработке.";
            winMessageParagraph.style.display = 'block';
            playAgainButtonWin.textContent = "Начать сначала";
            // Apply specific styles for the restart button (optional, using accent color)
            playAgainButtonWin.style.backgroundColor = 'var(--primary-accent)';
            playAgainButtonWin.style.borderColor = 'var(--primary-accent)';
            playAgainButtonWin.style.boxShadow = '0 4px 15px rgba(93, 173, 226, 0.3)';

        } else {
            // Fallback - should not happen with levels 0-3 covered
            winMessageHeading.textContent = "Уровень пройден!";
             playAgainButtonWin.textContent = "Следующий уровень";
             winMessageParagraph.style.display = 'none';
             playAgainButtonWin.style.backgroundColor = '';
             playAgainButtonWin.style.borderColor = '';
             playAgainButtonWin.style.boxShadow = '';
        }

        console.log(`Level ${currentLevelIndex} Complete! Found words: ${foundWords.size}/${possibleWordsSet.size}`);

        // --- Send score/result to parent window (Optional, keep if embedded) ---
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'gameOver', game: 'word_find', level: currentLevelIndex, score: foundWords.size, total: possibleWordsSet.size }, '*');
        }
        // --- End Send score ---
    }

    // --- Вспомогательные функции ---
    function shuffleArray(array) {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }

    // --- Старт игры при загрузке ---
    initGame(0); // Start level 0 automatically
});
// --- END OF FILE word_find.js ---