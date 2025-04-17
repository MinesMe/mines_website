document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const navLinks = document.querySelectorAll('.sidebar .nav-item a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const headerContentContainer = document.getElementById('header-content-container');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const howItWorksButton = document.getElementById('how-it-works-button');
    const howItWorksContent = document.getElementById('how-it-works-content');
    const bodyElement = document.body;
    const MAX_HISTORY_ITEMS = 25; // Уменьшил лимит истории

    // --- Элементы Игр ---
    // Mines
    const minesSection = document.getElementById('mines-section');
    const minesBoard = document.getElementById('mines-board'); // Исправлено ID
    const mineCountSelect = document.getElementById('mine-count');
    const minesGenerateButton = document.getElementById('mines-generate-button'); // Исправлено ID
    // Aviator
    const aviatorSection = document.getElementById('aviator-section');
    const aviatorResultSpan = document.getElementById('aviator-result');
    const aviatorTimerSpan = document.getElementById('aviator-timer');
    // Lucky Jet
    const luckyjetSection = document.getElementById('luckyjet-section');
    const luckyjetResultSpan = document.getElementById('luckyjet-result');
    const luckyjetTimerSpan = document.getElementById('luckyjet-timer');
    // Speed & Cash
    const speedcashSection = document.getElementById('speedcash-section');
    const speedcashResultBlueSpan = document.getElementById('speedcash-result-blue');
    const speedcashResultOrangeSpan = document.getElementById('speedcash-result-orange');
    const speedcashTimerSpan = document.getElementById('speedcash-timer');
    // JetX
    const jetxSection = document.getElementById('jetx-section');
    const jetxResultSpan = document.getElementById('jetx-result');
    const jetxTimerSpan = document.getElementById('jetx-timer');
    // Keno
    const kenoSection = document.getElementById('keno-section');
    const kenoResultDisplay = document.getElementById('keno-result-display');
    const kenoGenerateButton = document.getElementById('keno-generate-button');
    // Plinko
    const plinkoSection = document.getElementById('plinko-section');
    const plinkoResultSpan = document.getElementById('plinko-result');
    const plinkoGenerateButton = document.getElementById('plinko-generate-button');
    // Coinflip
    const coinflipSection = document.getElementById('coinflip-section');
    const coinflipResultSpan = document.getElementById('coinflip-result');
    const coinflipGenerateButton = document.getElementById('coinflip-generate-button');
    // Double
    const doubleSection = document.getElementById('double-section');
    const doubleResultIndicator = document.getElementById('double-result');
    const doubleTimerSpan = document.getElementById('double-timer');
    // Dice
    const diceSection = document.getElementById('dice-section');
    const diceResultSpan = document.getElementById('dice-result');
    const diceGenerateButton = document.getElementById('dice-generate-button');
    // Hilo
    const hiloSection = document.getElementById('hilo-section');
    const hiloCardSpan = document.getElementById('hilo-current-card-display');
    const hiloPredictionSpan = document.getElementById('hilo-prediction');
    const hiloGenerateButton = document.getElementById('hilo-generate-button');

    // --- Состояния Игр ---
    const boardSize = 5; const totalCells = boardSize * boardSize; let minesInitialized = false;
    let aviatorTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 20000 };
    let luckyjetTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 15000 };
    let speedcashTimer = { intervalId: null, displayId: null, nextUpdate: 0, blueValue: "1.00x", orangeValue: "1.00x", INTERVAL: 18000 };
    let jetxTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 16000 };
    let doubleTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "?", INTERVAL: 15000 }; // Таймер для Double

    // --- Инициализация Темы ---
    function applyTheme(theme) { /* ... как раньше ... */ }
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    applyTheme(savedTheme);
    if (themeCheckbox) { themeCheckbox.addEventListener('change', () => { applyTheme(themeCheckbox.checked ? 'light' : 'dark'); }); }

    // --- Логика "Как это работает?" ---
    if (howItWorksButton && howItWorksContent) { howItWorksButton.addEventListener('click', () => { const isActive = howItWorksContent.classList.toggle('active'); howItWorksContent.style.display = isActive ? 'block' : 'none'; if(isActive) { requestAnimationFrame(() => { requestAnimationFrame(() => { howItWorksContent.style.maxHeight = howItWorksContent.scrollHeight + "px"; }); }); } else { howItWorksContent.style.maxHeight = '0'; } }); if (!howItWorksContent.classList.contains('active')) { howItWorksContent.style.maxHeight = '0'; } }

    // --- История Прогнозов (Улучшенная) ---
    function addHistoryEntry(gameId, predictionText, timestamp = null) {
        const historyListElem = document.getElementById(`${gameId}-history-list`);
        if (!historyListElem) return;

        const newItem = document.createElement('li');
        newItem.classList.add('history-item');
        newItem.classList.add(`history-${gameId}`); // Класс для возможной стилизации

        const predictionSpan = document.createElement('span');
        predictionSpan.innerHTML = predictionText; // Используем innerHTML для поддержки тегов (например, цвета Double)

        const timeSpan = document.createElement('span');
        const now = timestamp ? new Date(timestamp) : new Date();
        timeSpan.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        newItem.appendChild(predictionSpan);
        newItem.appendChild(timeSpan);

        historyListElem.prepend(newItem);

        while (historyListElem.children.length > MAX_HISTORY_ITEMS) {
            historyListElem.lastElementChild.remove();
        }
        historyListElem.scrollTop = 0; // Прокрутка вверх (из-за flex-reverse)
    }

    // --- Обновление Шапки ---
    function updateHeaderContent(sectionId) { /* ... как раньше ... */ }

    // --- Навигация ---
    function showSection(sectionId) {
        // Не останавливаем таймеры краш-игр
        contentSections.forEach(section => section.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active-nav'));
        updateHeaderContent(sectionId);
        const targetSection = document.getElementById(sectionId + '-section');
        const targetNavItem = document.querySelector(`.nav-item a[data-section="${sectionId}"]`)?.closest('.nav-item');
        if (targetSection) {
             requestAnimationFrame(() => {
                 targetSection.classList.add('active');
                 // Обновляем отображение при входе
                 if (sectionId === 'mines') { initMines(); }
                 else if (sectionId === 'aviator') { updateAviatorDisplay(); }
                 else if (sectionId === 'luckyjet') { updateLuckyJetDisplay(); }
                 else if (sectionId === 'speedcash') { updateSpeedCashDisplay(); }
                 else if (sectionId === 'jetx') { updateJetXDisplay(); }
                 else if (sectionId === 'keno') { /* Можно показать предыдущий результат */ }
                 else if (sectionId === 'plinko') { /* Показать предыдущий */ }
                 else if (sectionId === 'coinflip') { /* Показать предыдущий */ }
                 else if (sectionId === 'double') { updateDoubleDisplay(); }
                 else if (sectionId === 'dice') { /* Показать предыдущий */ }
                 else if (sectionId === 'hilo') { /* Показать предыдущий */ }
             });
        } else { console.error("Секция не найдена:", sectionId + '-section'); }
        if (targetNavItem) { targetNavItem.classList.add('active-nav'); }
        else { console.error("Пункт навигации не найден для секции:", sectionId); }
    }
    navLinks.forEach(link => { link.addEventListener('click', (event) => { event.preventDefault(); const sectionId = link.getAttribute('data-section'); if (!link.closest('.nav-item').classList.contains('active-nav')) { showSection(sectionId); } }); });

    // --- Логика для Мины ---
    function createBoard() { if (!minesBoard) return; minesBoard.innerHTML = ''; for (let i = 0; i < totalCells; i++) { const cell = document.createElement('div'); cell.classList.add('cell'); cell.dataset.index = i; minesBoard.appendChild(cell); } }
    function generateMinesPrediction() { if (!minesSection.classList.contains('active') || !minesBoard || !mineCountSelect) return; const numMines = parseInt(mineCountSelect.value); const cells = minesBoard.querySelectorAll('.cell'); if(cells.length === 0) return; cells.forEach(cell => cell.classList.remove('mine-predicted')); const mineIndices = new Set(); while (mineIndices.size < numMines && mineIndices.size < totalCells) { mineIndices.add(Math.floor(Math.random() * totalCells)); } let delay = 50; const predictedCoords = []; mineIndices.forEach(index => { const row = Math.floor(index / boardSize) + 1; const col = (index % boardSize) + 1; predictedCoords.push(`[${row},${col}]`); if (cells[index]) { setTimeout(() => { if (minesSection.classList.contains('active') && cells[index]) { cells[index].classList.add('mine-predicted'); }}, delay); delay += 40; } }); addHistoryEntry('mines', `Мины: ${predictedCoords.join(', ')}`); }
    function initMines() { createBoard(); minesInitialized = true; if (minesGenerateButton) { minesGenerateButton.removeEventListener('click', generateMinesPrediction); minesGenerateButton.addEventListener('click', generateMinesPrediction); } }

    // --- Общие функции для Краш-игр и Double ---
    function updateResultDisplay(spanElement, newValue) { if (!spanElement || !spanElement.closest('.content-section.active')) return; spanElement.classList.add('updating'); setTimeout(() => { if (spanElement) { spanElement.textContent = newValue; spanElement.classList.remove('updating'); spanElement.style.animation = 'none'; requestAnimationFrame(() => { if(spanElement) spanElement.style.animation = 'popIn 0.3s ease-out forwards'; }); }}, 150); }
    function updateTimerDisplay(spanElement, nextTimestamp) { if (!spanElement || !spanElement.closest('.content-section.active')) return; const now = Date.now(); const timeLeft = Math.max(0, nextTimestamp - now); spanElement.textContent = `${(timeLeft / 1000).toFixed(1)}s`; }

    // --- Логика Краш-Игр ---
    // Aviator
    function updateAviatorValue() { aviatorTimer.value = `${(Math.random() * 99 + 1).toFixed(2)}x`; addHistoryEntry('aviator', aviatorTimer.value); updateResultDisplay(aviatorResultSpan, aviatorTimer.value); }
    function triggerAviatorUpdate() { updateAviatorValue(); aviatorTimer.nextUpdate = Date.now() + aviatorTimer.INTERVAL; }
    function updateAviatorDisplay() { updateTimerDisplay(aviatorTimerSpan, aviatorTimer.nextUpdate); updateResultDisplay(aviatorResultSpan, aviatorTimer.value); }
    function startAviatorTimers() { if (Date.now() >= aviatorTimer.nextUpdate) triggerAviatorUpdate(); else updateTimerDisplay(aviatorTimerSpan, aviatorTimer.nextUpdate); aviatorTimer.intervalId = setInterval(triggerAviatorUpdate, aviatorTimer.INTERVAL); aviatorTimer.displayId = setInterval(() => updateTimerDisplay(aviatorTimerSpan, aviatorTimer.nextUpdate), 100); }
    // Lucky Jet
    function updateLuckyJetValue() { luckyjetTimer.value = `${(Math.random() * 199 + 1).toFixed(2)}x`; addHistoryEntry('luckyjet', luckyjetTimer.value); updateResultDisplay(luckyjetResultSpan, luckyjetTimer.value); }
    function triggerLuckyJetUpdate() { updateLuckyJetValue(); luckyjetTimer.nextUpdate = Date.now() + luckyjetTimer.INTERVAL; }
    function updateLuckyJetDisplay() { updateTimerDisplay(luckyjetTimerSpan, luckyjetTimer.nextUpdate); updateResultDisplay(luckyjetResultSpan, luckyjetTimer.value); }
    function startLuckyJetTimers() { if (Date.now() >= luckyjetTimer.nextUpdate) triggerLuckyJetUpdate(); else updateTimerDisplay(luckyjetTimerSpan, luckyjetTimer.nextUpdate); luckyjetTimer.intervalId = setInterval(triggerLuckyJetUpdate, luckyjetTimer.INTERVAL); luckyjetTimer.displayId = setInterval(() => updateTimerDisplay(luckyjetTimerSpan, luckyjetTimer.nextUpdate), 100); }
    // Speed & Cash
    function updateSpeedCashValue() { speedcashTimer.blueValue = `${(Math.random() * 49 + 1).toFixed(2)}x`; speedcashTimer.orangeValue = `${(Math.random() * 49 + 1).toFixed(2)}x`; addHistoryEntry('speedcash', `Blue: ${speedcashTimer.blueValue}`, 'blue'); addHistoryEntry('speedcash', `Orange: ${speedcashTimer.orangeValue}`, 'orange'); updateResultDisplay(speedcashResultBlueSpan, speedcashTimer.blueValue); updateResultDisplay(speedcashResultOrangeSpan, speedcashTimer.orangeValue); }
    function triggerSpeedCashUpdate() { updateSpeedCashValue(); speedcashTimer.nextUpdate = Date.now() + speedcashTimer.INTERVAL; }
    function updateSpeedCashDisplay() { updateTimerDisplay(speedcashTimerSpan, speedcashTimer.nextUpdate); updateResultDisplay(speedcashResultBlueSpan, speedcashTimer.blueValue); updateResultDisplay(speedcashResultOrangeSpan, speedcashTimer.orangeValue); }
    function startSpeedCashTimers() { if (Date.now() >= speedcashTimer.nextUpdate) triggerSpeedCashUpdate(); else updateTimerDisplay(speedcashTimerSpan, speedcashTimer.nextUpdate); speedcashTimer.intervalId = setInterval(triggerSpeedCashUpdate, speedcashTimer.INTERVAL); speedcashTimer.displayId = setInterval(() => updateTimerDisplay(speedcashTimerSpan, speedcashTimer.nextUpdate), 100); }
    // JetX
    function updateJetXValue() { jetxTimer.value = `${(Math.random() * 149 + 1).toFixed(2)}x`; addHistoryEntry('jetx', jetxTimer.value); updateResultDisplay(jetxResultSpan, jetxTimer.value); }
    function triggerJetXUpdate() { updateJetXValue(); jetxTimer.nextUpdate = Date.now() + jetxTimer.INTERVAL; }
    function updateJetXDisplay() { updateTimerDisplay(jetxTimerSpan, jetxTimer.nextUpdate); updateResultDisplay(jetxResultSpan, jetxTimer.value); }
    function startJetXTimers() { if (Date.now() >= jetxTimer.nextUpdate) triggerJetXUpdate(); else updateTimerDisplay(jetxTimerSpan, jetxTimer.nextUpdate); jetxTimer.intervalId = setInterval(triggerJetXUpdate, jetxTimer.INTERVAL); jetxTimer.displayId = setInterval(() => updateTimerDisplay(jetxTimerSpan, jetxTimer.nextUpdate), 100); }

     // --- Логика для Double ---
    function updateDoubleValue() {
        const rand = Math.random(); let result, colorClass, colorName;
        if (rand < 0.03) { result = 'G'; colorClass = 'green'; colorName = 'Зеленый'; } // ~3% Зеленый
        else if (rand < 0.515) { result = 'R'; colorClass = 'red'; colorName = 'Красный'; } // ~48.5% Красный
        else { result = 'B'; colorClass = 'black'; colorName = 'Черный'; } // ~48.5% Черный
        doubleTimer.value = result;
        addHistoryEntry('double', `<span class="double-result-history ${colorClass}">${colorName}</span>`);
        updateDoubleResultDisplay(colorClass);
    }
     function updateDoubleResultDisplay(colorClass) {
         if (!doubleResultIndicator || !doubleSection.classList.contains('active')) return;
         doubleResultIndicator.className = 'double-color-indicator'; // Сброс классов
         if (colorClass) {
             doubleResultIndicator.classList.add(colorClass);
             doubleResultIndicator.style.animation = 'none';
             requestAnimationFrame(() => { doubleResultIndicator.style.animation = 'popIn 0.4s ease-out forwards'; });
         }
     }
    function triggerDoubleUpdate() { updateDoubleValue(); doubleTimer.nextUpdate = Date.now() + doubleTimer.INTERVAL; }
    function updateDoubleDisplay() { updateTimerDisplay(doubleTimerSpan, doubleTimer.nextUpdate); updateDoubleResultDisplay(doubleTimer.value === 'G' ? 'green' : (doubleTimer.value === 'R' ? 'red' : (doubleTimer.value === 'B' ? 'black' : null))); }
    function startDoubleTimers() { if (Date.now() >= doubleTimer.nextUpdate) triggerDoubleUpdate(); else updateTimerDisplay(doubleTimerSpan, doubleTimer.nextUpdate); doubleTimer.intervalId = setInterval(triggerDoubleUpdate, doubleTimer.INTERVAL); doubleTimer.displayId = setInterval(() => updateTimerDisplay(doubleTimerSpan, doubleTimer.nextUpdate), 100); }

    // --- Логика для Keno ---
    function generateKenoPrediction() {
        if (!kenoSection.classList.contains('active') || !kenoResultDisplay) return;
        const numbers = new Set();
        while (numbers.size < 10) { numbers.add(Math.floor(Math.random() * 80) + 1); }
        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
        kenoResultDisplay.innerHTML = ''; // Очистить предыдущие
        sortedNumbers.forEach((num, index) => {
            setTimeout(() => { // Небольшая задержка для анимации
                 const span = document.createElement('span');
                 span.classList.add('keno-number');
                 span.textContent = num;
                 kenoResultDisplay.appendChild(span);
            }, index * 50);
        });
        addHistoryEntry('keno', `Номера: ${sortedNumbers.join(', ')}`);
    }
    if(kenoGenerateButton) kenoGenerateButton.addEventListener('click', generateKenoPrediction);

    // --- Логика для Plinko ---
    function generatePlinkoPrediction() {
         if (!plinkoSection.classList.contains('active') || !plinkoResultSpan) return;
         const multipliers = [0.2, 0.5, 1, 1.5, 2, 5, 10, 0.5, 0.2]; // Примерный набор множителей
         const randomIndex = Math.floor(Math.random() * multipliers.length);
         const predictedValue = `x${multipliers[randomIndex].toFixed(1)}`;
         updateResultDisplay(plinkoResultSpan, predictedValue);
         addHistoryEntry('plinko', `Множитель: ${predictedValue}`);
    }
    if(plinkoGenerateButton) plinkoGenerateButton.addEventListener('click', generatePlinkoPrediction);

    // --- Логика для Coinflip ---
    function generateCoinflipPrediction() {
         if (!coinflipSection.classList.contains('active') || !coinflipResultSpan) return;
         coinflipResultSpan.classList.add('flipping'); // Запустить анимацию
         coinflipResultSpan.classList.remove('gold', 'silver'); // Убрать старый цвет
         coinflipResultSpan.textContent = '?';
         setTimeout(() => { // Показать результат после анимации
             const isGold = Math.random() < 0.5;
             const resultText = isGold ? 'Орёл' : 'Решка';
             const resultClass = isGold ? 'gold' : 'silver';
             coinflipResultSpan.textContent = resultText;
             coinflipResultSpan.classList.remove('flipping');
             coinflipResultSpan.classList.add(resultClass);
             addHistoryEntry('coinflip', resultText);
         }, 500); // Время анимации
    }
     if(coinflipGenerateButton) coinflipGenerateButton.addEventListener('click', generateCoinflipPrediction);

     // --- Логика для Dice ---
     function generateDicePrediction() {
         if (!diceSection.classList.contains('active') || !diceResultSpan) return;
         const target = (Math.random() * 90 + 5).toFixed(2); // Число от 5.00 до 95.00
         const condition = Math.random() < 0.5 ? 'Больше' : 'Меньше';
         const prediction = `${condition} ${target}`;
         diceResultSpan.textContent = prediction;
         addHistoryEntry('dice', prediction);
     }
      if(diceGenerateButton) diceGenerateButton.addEventListener('click', generateDicePrediction);

     // --- Логика для HiLo ---
     const hiloSuits = ['♦️', '♥️', '♣️', '♠️'];
     const hiloRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
     const hiloRankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
     let currentHiloCard = { rank: '?', suit: '', value: 0 };

     function getRandomCard() {
         const suit = hiloSuits[Math.floor(Math.random() * hiloSuits.length)];
         const rank = hiloRanks[Math.floor(Math.random() * hiloRanks.length)];
         return { rank, suit, value: hiloRankValues[rank] };
     }
     function generateHiloPrediction() {
         if (!hiloSection.classList.contains('active') || !hiloCardSpan || !hiloPredictionSpan) return;
         currentHiloCard = getRandomCard();
         const nextCardValue = hiloRankValues[hiloRanks[Math.floor(Math.random() * hiloRanks.length)]]; // Случайное значение след. карты
         let prediction = '?';
         if (currentHiloCard.value === 14) prediction = 'Ниже'; // Если туз, точно ниже
         else if (currentHiloCard.value === 2) prediction = 'Выше'; // Если двойка, точно выше
         else prediction = Math.random() < 0.5 ? 'Выше' : 'Ниже'; // Иначе случайно

         hiloCardSpan.textContent = currentHiloCard.suit + currentHiloCard.rank;
         hiloCardSpan.className = 'hilo-card'; // Сброс цвета
         if (currentHiloCard.suit === '♦️' || currentHiloCard.suit === '♥️') {
             hiloCardSpan.classList.add('red');
         }
         hiloPredictionSpan.textContent = prediction;
         addHistoryEntry('hilo', `Карта: ${currentHiloCard.suit}${currentHiloCard.rank}, Прогноз: ${prediction}`);
     }
     if(hiloGenerateButton) hiloGenerateButton.addEventListener('click', generateHiloPrediction);


     // --- Логика для Истории-шторки ---
     document.querySelectorAll('.history-toggle-button').forEach(button => {
         button.addEventListener('click', () => {
             const targetListId = button.getAttribute('data-target');
             const targetList = document.getElementById(targetListId);
             if (targetList) {
                 const isActive = targetList.classList.toggle('active');
                 button.textContent = isActive ? 'История ▲' : 'История ▼';
                 // Анимация высоты в CSS
             }
         });
     });


    // --- Запуск Таймеров и Инициализация ---
    startAviatorTimers(); startLuckyJetTimers(); startSpeedCashTimers(); startJetXTimers(); startDoubleTimers();
    const initialActiveSectionElement = document.querySelector('.content-section.active');
    let initialSectionId = 'mines';
    if (initialActiveSectionElement) { initialSectionId = initialActiveSectionElement.id.replace('-section', ''); }
    showSection(initialSectionId);

}); // Конец DOMContentLoaded