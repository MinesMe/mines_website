document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar .nav-item a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const headerContentContainer = document.getElementById('header-content-container');
    const themeCheckbox = document.getElementById('theme-checkbox');
    // Удалены ссылки на how-it-works
    const bodyElement = document.body;
    const MAX_HISTORY_ITEMS = 25;

    // --- Элементы Игр ---
    const minesSection = document.getElementById('mines-section');
    const minesBoard = document.getElementById('mines-board');
    const mineCountSelect = document.getElementById('mine-count');
    const minesGenerateButton = document.getElementById('mines-generate-button');

    const aviatorSection = document.getElementById('aviator-section');
    const aviatorResultSpan = document.getElementById('aviator-result');
    const aviatorTimerSpan = document.getElementById('aviator-timer');

    const luckyjetSection = document.getElementById('luckyjet-section');
    const luckyjetResultSpan = document.getElementById('luckyjet-result');
    const luckyjetTimerSpan = document.getElementById('luckyjet-timer');

    const speedcashSection = document.getElementById('speedcash-section');
    const speedcashResultBlueSpan = document.getElementById('speedcash-result-blue');
    const speedcashResultOrangeSpan = document.getElementById('speedcash-result-orange');
    const speedcashTimerSpan = document.getElementById('speedcash-timer');

    const jetxSection = document.getElementById('jetx-section');
    const jetxResultSpan = document.getElementById('jetx-result');
    const jetxTimerSpan = document.getElementById('jetx-timer');

    const kenoSection = document.getElementById('keno-section');
    const kenoResultDisplay = document.getElementById('keno-result-display');
    const kenoGenerateButton = document.getElementById('keno-generate-button');

    const plinkoSection = document.getElementById('plinko-section');
    const plinkoResultSpan = document.getElementById('plinko-result');
    const plinkoGenerateButton = document.getElementById('plinko-generate-button');

    const coinflipSection = document.getElementById('coinflip-section');
    const coinflipResultSpan = document.getElementById('coinflip-result');
    const coinflipGenerateButton = document.getElementById('coinflip-generate-button');

    const doubleSection = document.getElementById('double-section');
    const doubleResultIndicator = document.getElementById('double-result');
    const doubleTimerSpan = document.getElementById('double-timer');

    const diceSection = document.getElementById('dice-section');
    const diceResultSpan = document.getElementById('dice-result');
    const diceGenerateButton = document.getElementById('dice-generate-button');

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
    let doubleTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: { color: "?", class: "" }, INTERVAL: 15000 };

    const hiloSuits = ['♦️', '♥️', '♣️', '♠️'];
    const hiloRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const hiloRankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    let currentHiloCard = { rank: '?', suit: '', value: 0 };

    // --- Инициализация Темы ---
    function applyTheme(theme) {
        bodyElement.classList.remove('dark-theme', 'light-theme');
        bodyElement.classList.add(theme + '-theme');
        localStorage.setItem('appTheme', theme);
        if (themeCheckbox) {
            themeCheckbox.checked = (theme === 'light');
        }
    }
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    applyTheme(savedTheme);
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            const newTheme = themeCheckbox.checked ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // --- Логика "Как это работает?" (УДАЛЕНО) ---

    // --- История Прогнозов ---
    function addHistoryEntry(gameId, predictionText) {
        const historyListElem = document.getElementById(`${gameId}-history-list`);
        if (!historyListElem) return;
        const newItem = document.createElement('li');
        newItem.classList.add('history-item');
        newItem.classList.add(`history-${gameId}`);
        const predictionSpan = document.createElement('span');
        predictionSpan.innerHTML = predictionText;
        const timeSpan = document.createElement('span');
        const now = new Date();
        timeSpan.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        newItem.appendChild(predictionSpan);
        newItem.appendChild(timeSpan);
        historyListElem.prepend(newItem);
        while (historyListElem.children.length > MAX_HISTORY_ITEMS) { historyListElem.lastElementChild.remove(); }
        historyListElem.scrollTop = 0;
    }

    // --- Обновление Шапки ---
    function updateHeaderContent(sectionId) {
        if (!headerContentContainer) return;
        let headerHTML = '';
        let logoSrc = '';
        let logoId = '';
        switch (sectionId) {
            case 'mines': logoSrc = 'logo-mines.png'; logoId = 'header-mines-logo'; break;
            case 'aviator': logoSrc = 'header-aviator-logo.png'; logoId = 'header-aviator-img'; break;
            case 'luckyjet': logoSrc = 'header-luckyjet-logo.png'; logoId = 'header-luckyjet-img'; break;
            case 'speedcash': logoSrc = 'header-speedcash-logo.png'; logoId = 'header-speedcash-img'; break;
            case 'jetx': logoSrc = 'header-jetx-logo.png'; logoId = 'header-jetx-img'; break;
            case 'keno': logoSrc = 'header-keno-logo.png'; logoId = 'header-keno-img'; break;
            case 'plinko': logoSrc = 'header-plinko-logo.png'; logoId = 'header-plinko-img'; break;
            case 'coinflip': logoSrc = 'header-coinflip-logo.png'; logoId = 'header-coinflip-img'; break;
            case 'double': logoSrc = 'header-double-logo.png'; logoId = 'header-double-img'; break;
            case 'dice': logoSrc = 'header-dice-logo.png'; logoId = 'header-dice-img'; break;
            case 'hilo': logoSrc = 'header-hilo-logo.png'; logoId = 'header-hilo-img'; break;
            case 'settings': headerHTML = '<h1 id="header-text">Настройки</h1>'; break;
            default: logoSrc = 'logo.png'; logoId = 'header-default-logo';
        }
        if (logoSrc) {
             headerHTML = `<img src="${logoSrc}" alt="${sectionId} Logo" class="header-logo" ${logoId ? `id="${logoId}"` : ''}>`;
        } else if (!headerHTML) { // Если не настройки и нет лого, ставим дефолт
             headerHTML = '<img src="logo.png" alt="App Logo" class="header-logo">';
        }

        const currentHTML = headerContentContainer.innerHTML;
        if (currentHTML.replace(/\s+/g, '') !== headerHTML.replace(/\s+/g, '')) {
             headerContentContainer.style.opacity = '0';
             setTimeout(() => { headerContentContainer.innerHTML = headerHTML; headerContentContainer.style.opacity = '1'; }, 150);
        } else {
            headerContentContainer.style.opacity = '1';
        }
    }

    // --- Навигация ---
    function showSection(sectionId) {
        contentSections.forEach(section => section.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active-nav'));
        updateHeaderContent(sectionId);
        const targetSection = document.getElementById(sectionId + '-section');
        const targetNavItem = document.querySelector(`.nav-item a[data-section="${sectionId}"]`)?.closest('.nav-item');
        if (targetSection) {
             requestAnimationFrame(() => {
                 targetSection.classList.add('active');
                 if (sectionId === 'mines') { initMines(); }
                 else if (sectionId === 'aviator') { updateAviatorDisplay(); }
                 else if (sectionId === 'luckyjet') { updateLuckyJetDisplay(); }
                 else if (sectionId === 'speedcash') { updateSpeedCashDisplay(); }
                 else if (sectionId === 'jetx') { updateJetXDisplay(); }
                 else if (sectionId === 'double') { updateDoubleDisplay(); }
             });
        } else { console.error("Секция не найдена:", sectionId + '-section'); }
        if (targetNavItem) { targetNavItem.classList.add('active-nav'); }
        else { console.error("Пункт навигации не найден для секции:", sectionId); }
    }
    navLinks.forEach(link => { link.addEventListener('click', (event) => { event.preventDefault(); const sectionId = link.getAttribute('data-section'); if (!link.closest('.nav-item').classList.contains('active-nav')) { showSection(sectionId); } }); });

    // --- Мины ---
    function createBoard() { if (!minesBoard) return; minesBoard.innerHTML = ''; for (let i = 0; i < totalCells; i++) { const cell = document.createElement('div'); cell.classList.add('cell'); cell.dataset.index = i; minesBoard.appendChild(cell); } }
    function generateMinesPrediction() { if (!minesSection.classList.contains('active') || !minesBoard || !mineCountSelect) return; const numMines = parseInt(mineCountSelect.value); const cells = minesBoard.querySelectorAll('.cell'); if(cells.length === 0) return; cells.forEach(cell => cell.classList.remove('mine-predicted')); const mineIndices = new Set(); while (mineIndices.size < numMines && mineIndices.size < totalCells) { mineIndices.add(Math.floor(Math.random() * totalCells)); } let delay = 50; const predictedCoords = []; mineIndices.forEach(index => { const row = Math.floor(index / boardSize) + 1; const col = (index % boardSize) + 1; predictedCoords.push(`[${row},${col}]`); if (cells[index]) { setTimeout(() => { if (minesSection.classList.contains('active') && cells[index]) { cells[index].classList.add('mine-predicted'); }}, delay); delay += 40; } }); addHistoryEntry('mines', `Мины: ${predictedCoords.join(', ')}`); }
    function initMines() { createBoard(); minesInitialized = true; if (minesGenerateButton) { minesGenerateButton.removeEventListener('click', generateMinesPrediction); minesGenerateButton.addEventListener('click', generateMinesPrediction); } }

    // --- Общие функции для Краш-игр и Double ---
    function updateResultDisplay(spanElement, newValue, isHtml = false) { if (!spanElement || !spanElement.closest('.content-section.active')) return; spanElement.classList.add('updating'); setTimeout(() => { if (spanElement) { if(isHtml) { spanElement.innerHTML = newValue; } else { spanElement.textContent = newValue; } spanElement.classList.remove('updating'); spanElement.style.animation = 'none'; requestAnimationFrame(() => { if(spanElement) spanElement.style.animation = 'popIn 0.3s ease-out forwards'; }); }}, 150); }
    function updateTimerDisplay(spanElement, nextTimestamp) { if (!spanElement || !spanElement.closest('.content-section.active')) return; const now = Date.now(); const timeLeft = Math.max(0, nextTimestamp - now); spanElement.textContent = `${(timeLeft / 1000).toFixed(1)}s`; }

    // --- Логика Игр с Таймером ---
    function setupGameTimer(gameTimer, updateValueFunc, triggerUpdateFunc, updateDisplayFunc, timerSpan) {
        if (Date.now() >= gameTimer.nextUpdate) { triggerUpdateFunc(); }
        else { updateTimerDisplay(timerSpan, gameTimer.nextUpdate); } // Обновляем таймер сразу
        gameTimer.intervalId = setInterval(triggerUpdateFunc, gameTimer.INTERVAL);
        gameTimer.displayId = setInterval(() => updateTimerDisplay(timerSpan, gameTimer.nextUpdate), 100);
    }
    // Aviator
    function updateAviatorValue() { aviatorTimer.value = `${(Math.random() * 99 + 1).toFixed(2)}x`; addHistoryEntry('aviator', aviatorTimer.value); updateResultDisplay(aviatorResultSpan, aviatorTimer.value); }
    function triggerAviatorUpdate() { updateAviatorValue(); aviatorTimer.nextUpdate = Date.now() + aviatorTimer.INTERVAL; }
    function updateAviatorDisplay() { updateTimerDisplay(aviatorTimerSpan, aviatorTimer.nextUpdate); updateResultDisplay(aviatorResultSpan, aviatorTimer.value); }
    // Lucky Jet
    function updateLuckyJetValue() { luckyjetTimer.value = `${(Math.random() * 199 + 1).toFixed(2)}x`; addHistoryEntry('luckyjet', luckyjetTimer.value); updateResultDisplay(luckyjetResultSpan, luckyjetTimer.value); }
    function triggerLuckyJetUpdate() { updateLuckyJetValue(); luckyjetTimer.nextUpdate = Date.now() + luckyjetTimer.INTERVAL; }
    function updateLuckyJetDisplay() { updateTimerDisplay(luckyjetTimerSpan, luckyjetTimer.nextUpdate); updateResultDisplay(luckyjetResultSpan, luckyjetTimer.value); }
    // Speed & Cash
    function updateSpeedCashValue() { speedcashTimer.blueValue = `${(Math.random() * 49 + 1).toFixed(2)}x`; speedcashTimer.orangeValue = `${(Math.random() * 49 + 1).toFixed(2)}x`; addHistoryEntry('speedcash', `Blue: ${speedcashTimer.blueValue}`); addHistoryEntry('speedcash', `Orange: ${speedcashTimer.orangeValue}`); updateResultDisplay(speedcashResultBlueSpan, speedcashTimer.blueValue); updateResultDisplay(speedcashResultOrangeSpan, speedcashTimer.orangeValue); }
    function triggerSpeedCashUpdate() { updateSpeedCashValue(); speedcashTimer.nextUpdate = Date.now() + speedcashTimer.INTERVAL; }
    function updateSpeedCashDisplay() { updateTimerDisplay(speedcashTimerSpan, speedcashTimer.nextUpdate); updateResultDisplay(speedcashResultBlueSpan, speedcashTimer.blueValue); updateResultDisplay(speedcashResultOrangeSpan, speedcashTimer.orangeValue); }
    // JetX
    function updateJetXValue() { jetxTimer.value = `${(Math.random() * 149 + 1).toFixed(2)}x`; addHistoryEntry('jetx', jetxTimer.value); updateResultDisplay(jetxResultSpan, jetxTimer.value); }
    function triggerJetXUpdate() { updateJetXValue(); jetxTimer.nextUpdate = Date.now() + jetxTimer.INTERVAL; }
    function updateJetXDisplay() { updateTimerDisplay(jetxTimerSpan, jetxTimer.nextUpdate); updateResultDisplay(jetxResultSpan, jetxTimer.value); }
    // Double
    function updateDoubleValue() { const rand = Math.random(); if (rand < 0.03) { doubleTimer.value = { color: 'Зеленый', class: 'green' }; } else if (rand < 0.515) { doubleTimer.value = { color: 'Красный', class: 'red' }; } else { doubleTimer.value = { color: 'Черный', class: 'black' }; } addHistoryEntry('double', `<span class="double-result-history ${doubleTimer.value.class}"></span> ${doubleTimer.value.color}`, true); updateDoubleResultDisplay(doubleTimer.value.class); }
    function updateDoubleResultDisplay(colorClass) { if (!doubleResultIndicator || !doubleSection.classList.contains('active')) return; doubleResultIndicator.className = 'double-color-indicator'; if (colorClass) { doubleResultIndicator.classList.add(colorClass); doubleResultIndicator.style.animation = 'none'; requestAnimationFrame(() => { doubleResultIndicator.style.animation = 'popIn 0.4s ease-out forwards'; }); } }
    function triggerDoubleUpdate() { updateDoubleValue(); doubleTimer.nextUpdate = Date.now() + doubleTimer.INTERVAL; }
    function updateDoubleDisplay() { updateTimerDisplay(doubleTimerSpan, doubleTimer.nextUpdate); updateDoubleResultDisplay(doubleTimer.value.class); }

    // --- Логика Игр с Кнопкой ---
    // Keno
    function generateKenoPrediction() { if (!kenoSection.classList.contains('active') || !kenoResultDisplay) return; const numbers = new Set(); while (numbers.size < 10) { numbers.add(Math.floor(Math.random() * 80) + 1); } const sortedNumbers = Array.from(numbers).sort((a, b) => a - b); kenoResultDisplay.innerHTML = ''; sortedNumbers.forEach((num, index) => { setTimeout(() => { const span = document.createElement('span'); span.classList.add('keno-number'); span.textContent = num; kenoResultDisplay.appendChild(span); }, index * 50); }); addHistoryEntry('keno', `Номера: ${sortedNumbers.join(', ')}`); }
    if(kenoGenerateButton) kenoGenerateButton.addEventListener('click', generateKenoPrediction);
    // Plinko
    function generatePlinkoPrediction() { if (!plinkoSection.classList.contains('active') || !plinkoResultSpan) return; const multipliers = [0.2, 0.5, 1, 1.5, 2, 5, 10, 0.5, 0.2]; const randomIndex = Math.floor(Math.random() * multipliers.length); const predictedValue = `x${multipliers[randomIndex].toFixed(1)}`; updateResultDisplay(plinkoResultSpan, predictedValue); addHistoryEntry('plinko', `Множитель: ${predictedValue}`); }
    if(plinkoGenerateButton) plinkoGenerateButton.addEventListener('click', generatePlinkoPrediction);
    // Coinflip
    function generateCoinflipPrediction() { if (!coinflipSection.classList.contains('active') || !coinflipResultSpan) return; coinflipResultSpan.classList.add('flipping'); coinflipResultSpan.classList.remove('gold', 'silver'); coinflipResultSpan.textContent = '?'; setTimeout(() => { const isGold = Math.random() < 0.5; const resultText = isGold ? 'Орёл' : 'Решка'; const resultClass = isGold ? 'gold' : 'silver'; coinflipResultSpan.textContent = resultText; coinflipResultSpan.classList.remove('flipping'); coinflipResultSpan.classList.add(resultClass); addHistoryEntry('coinflip', resultText); }, 500); }
    if(coinflipGenerateButton) coinflipGenerateButton.addEventListener('click', generateCoinflipPrediction);
    // Dice
    function generateDicePrediction() { if (!diceSection.classList.contains('active') || !diceResultSpan) return; const target = (Math.random() * 90 + 5).toFixed(2); const condition = Math.random() < 0.5 ? 'Больше' : 'Меньше'; const prediction = `${condition} ${target}`; diceResultSpan.textContent = prediction; addHistoryEntry('dice', prediction); }
    if(diceGenerateButton) diceGenerateButton.addEventListener('click', generateDicePrediction);
    // Hilo
    function getRandomCard() { const suit = hiloSuits[Math.floor(Math.random() * hiloSuits.length)]; const rank = hiloRanks[Math.floor(Math.random() * hiloRanks.length)]; return { rank, suit, value: hiloRankValues[rank] }; }
    function generateHiloPrediction() { if (!hiloSection.classList.contains('active') || !hiloCardSpan || !hiloPredictionSpan) return; currentHiloCard = getRandomCard(); const nextCardValue = hiloRankValues[hiloRanks[Math.floor(Math.random() * hiloRanks.length)]]; let prediction = '?'; if (currentHiloCard.value === 14) prediction = 'Ниже'; else if (currentHiloCard.value === 2) prediction = 'Выше'; else prediction = Math.random() < 0.5 ? 'Выше' : 'Ниже'; hiloCardSpan.textContent = currentHiloCard.suit + currentHiloCard.rank; hiloCardSpan.className = 'hilo-card'; if (currentHiloCard.suit === '♦️' || currentHiloCard.suit === '♥️') { hiloCardSpan.classList.add('red'); } hiloPredictionSpan.textContent = prediction; addHistoryEntry('hilo', `Карта: ${currentHiloCard.suit}${currentHiloCard.rank}, Прогноз: ${prediction}`); }
    if(hiloGenerateButton) hiloGenerateButton.addEventListener('click', generateHiloPrediction);

    // --- Логика для Истории-шторки ---
    document.querySelectorAll('.history-toggle-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetListId = button.getAttribute('data-target');
            const targetList = document.getElementById(targetListId);
            if (targetList) {
                const isActive = targetList.classList.toggle('active');
                button.textContent = isActive ? 'История ▲' : 'История ▼';
            }
        });
    });

    // --- Запуск Таймеров и Инициализация ---
    setupGameTimer(aviatorTimer, updateAviatorValue, triggerAviatorUpdate, updateAviatorDisplay, aviatorTimerSpan);
    setupGameTimer(luckyjetTimer, updateLuckyJetValue, triggerLuckyJetUpdate, updateLuckyJetDisplay, luckyjetTimerSpan);
    setupGameTimer(speedcashTimer, updateSpeedCashValue, triggerSpeedCashUpdate, updateSpeedCashDisplay, speedcashTimerSpan);
    setupGameTimer(jetxTimer, updateJetXValue, triggerJetXUpdate, updateJetXDisplay, jetxTimerSpan);
    setupGameTimer(doubleTimer, updateDoubleValue, triggerDoubleUpdate, updateDoubleDisplay, doubleTimerSpan);

    const initialActiveSectionElement = document.querySelector('.content-section.active');
    let initialSectionId = 'mines';
    if (initialActiveSectionElement) { initialSectionId = initialActiveSectionElement.id.replace('-section', ''); }
    showSection(initialSectionId);

}); // Конец DOMContentLoaded