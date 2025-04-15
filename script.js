document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar .nav-item a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const headerContentContainer = document.getElementById('header-content-container');
    const historyList = document.getElementById('history-list');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const howItWorksButton = document.getElementById('how-it-works-button');
    const howItWorksContent = document.getElementById('how-it-works-content');
    const bodyElement = document.body;
    const MAX_HISTORY_ITEMS = 30;

    const minesSection = document.getElementById('mines-section');
    const gameBoard = document.getElementById('game-board');
    const mineCountSelect = document.getElementById('mine-count');
    const predictButton = document.getElementById('predict-button');
    const boardSize = 5;
    const totalCells = boardSize * boardSize;
    let minesInitialized = false;

    const aviatorSection = document.getElementById('aviator-section');
    const aviatorResultSpan = document.getElementById('aviator-result');
    const aviatorTimerSpan = document.getElementById('aviator-timer');
    const aviatorGenerateButton = document.getElementById('aviator-generate-button');
    let aviatorUpdateIntervalId = null; let aviatorDisplayIntervalId = null; let aviatorNextUpdateTimestamp = 0; const AVIATOR_INTERVAL = 20000; let currentAviatorValue = "1.00x";

    const luckyjetSection = document.getElementById('luckyjet-section');
    const luckyjetResultSpan = document.getElementById('luckyjet-result');
    const luckyjetTimerSpan = document.getElementById('luckyjet-timer');
    const luckyjetGenerateButton = document.getElementById('luckyjet-generate-button');
    let luckyjetUpdateIntervalId = null; let luckyjetDisplayIntervalId = null; let luckyjetNextUpdateTimestamp = 0; const LUCKYJET_INTERVAL = 15000; let currentLuckyJetValue = "1.00x";

    const speedcashSection = document.getElementById('speedcash-section');
    const speedcashResultBlueSpan = document.getElementById('speedcash-result-blue');
    const speedcashResultOrangeSpan = document.getElementById('speedcash-result-orange');
    const speedcashTimerSpan = document.getElementById('speedcash-timer');
    const speedcashGenerateButton = document.getElementById('speedcash-generate-button');
    let speedcashUpdateIntervalId = null; let speedcashDisplayIntervalId = null; let speedcashNextUpdateTimestamp = 0; const SPEEDCASH_INTERVAL = 18000; let currentSpeedCashBlueValue = "1.00x"; let currentSpeedCashOrangeValue = "1.00x";

    const jetxSection = document.getElementById('jetx-section');
    const jetxResultSpan = document.getElementById('jetx-result');
    const jetxTimerSpan = document.getElementById('jetx-timer');
    const jetxGenerateButton = document.getElementById('jetx-generate-button');
    let jetxUpdateIntervalId = null; let jetxDisplayIntervalId = null; let jetxNextUpdateTimestamp = 0; const JETX_INTERVAL = 16000; let currentJetXValue = "1.00x";

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

    if (howItWorksButton && howItWorksContent) {
        howItWorksButton.addEventListener('click', () => {
            const isActive = howItWorksContent.classList.toggle('active');
             howItWorksContent.style.display = isActive ? 'block' : 'none';
             if(isActive) {
                 requestAnimationFrame(() => { requestAnimationFrame(() => { howItWorksContent.style.maxHeight = howItWorksContent.scrollHeight + "px"; }); });
             } else {
                 howItWorksContent.style.maxHeight = '0';
             }
        });
         if (!howItWorksContent.classList.contains('active')) {
             howItWorksContent.style.maxHeight = '0';
         }
    }

    function addHistoryEntry(gameName, value, colorClass = '') {
        if (!historyList) return;
        const newItem = document.createElement('li');
        newItem.classList.add('history-item');
        if (colorClass) { newItem.classList.add(colorClass); }
        newItem.classList.add(`history-${gameName.toLowerCase().replace('&', '').replace(' ', '')}`);
        const nameSpan = document.createElement('span'); nameSpan.textContent = gameName;
        const valueSpan = document.createElement('span'); valueSpan.textContent = value;
        newItem.appendChild(nameSpan); newItem.appendChild(valueSpan);
        historyList.prepend(newItem);
        while (historyList.children.length > MAX_HISTORY_ITEMS) { historyList.lastElementChild.remove(); }
        historyList.scrollTop = 0;
    }

    function updateHeaderContent(sectionId) {
        if (!headerContentContainer) return;
        let headerHTML = '';
        switch (sectionId) {
            case 'mines': headerHTML = '<img src="logo.png" alt="1win x Mines Logo" class="header-logo">'; break;
            case 'aviator': headerHTML = '<img src="header-aviator-logo.png" alt="Aviator Logo" class="header-logo" id="header-aviator-img">'; break;
            case 'luckyjet': headerHTML = '<img src="header-luckyjet-logo.png" alt="Lucky Jet Logo" class="header-logo" id="header-luckyjet-img">'; break;
            case 'speedcash': headerHTML = '<img src="header-speedcash-logo.png" alt="Speed Cash Logo" class="header-logo" id="header-speedcash-img">'; break;
            case 'jetx': headerHTML = '<img src="header-jetx-logo.png" alt="JetX Logo" class="header-logo" id="header-jetx-img">'; break;
            case 'settings': headerHTML = '<h1 id="header-text">Настройки</h1>'; break;
            default: headerHTML = '<img src="logo.png" alt="1win x Mines Logo" class="header-logo">';
        }
        const currentHTML = headerContentContainer.innerHTML;
        if (currentHTML.replace(/\s+/g, '') !== headerHTML.replace(/\s+/g, '')) {
             headerContentContainer.style.opacity = '0';
             setTimeout(() => { headerContentContainer.innerHTML = headerHTML; headerContentContainer.style.opacity = '1'; }, 150);
        } else {
            headerContentContainer.style.opacity = '1';
        }
    }

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
             });
        } else { console.error("Секция не найдена:", sectionId + '-section'); }
        if (targetNavItem) { targetNavItem.classList.add('active-nav'); }
        else { console.error("Пункт навигации не найден для секции:", sectionId); }
    }

    navLinks.forEach(link => { link.addEventListener('click', (event) => { event.preventDefault(); const sectionId = link.getAttribute('data-section'); if (!link.closest('.nav-item').classList.contains('active-nav')) { showSection(sectionId); } }); });

    function createBoard() { if (!gameBoard) return; gameBoard.innerHTML = ''; for (let i = 0; i < totalCells; i++) { const cell = document.createElement('div'); cell.classList.add('cell'); cell.dataset.index = i; gameBoard.appendChild(cell); } }
    function generatePrediction() { if (!minesSection.classList.contains('active') || !gameBoard || !mineCountSelect) return; const numMines = parseInt(mineCountSelect.value); const cells = gameBoard.querySelectorAll('.cell'); if(cells.length === 0) return; cells.forEach(cell => cell.classList.remove('mine-predicted')); const mineIndices = new Set(); while (mineIndices.size < numMines && mineIndices.size < totalCells) { mineIndices.add(Math.floor(Math.random() * totalCells)); } let delay = 50; mineIndices.forEach(index => { if (cells[index]) { setTimeout(() => { if (minesSection.classList.contains('active') && cells[index]) { cells[index].classList.add('mine-predicted'); }}, delay); delay += 40; } }); }
    function initMines() { createBoard(); minesInitialized = true; if (predictButton) { predictButton.removeEventListener('click', generatePrediction); predictButton.addEventListener('click', generatePrediction); } else { console.error('Кнопка predict-button не найдена!'); } }

    function updateResultDisplay(spanElement, newValue) { if (!spanElement || !spanElement.closest('.content-section').classList.contains('active')) return; spanElement.classList.add('updating'); setTimeout(() => { if (spanElement) { spanElement.textContent = newValue; spanElement.classList.remove('updating'); spanElement.style.animation = 'none'; requestAnimationFrame(() => { if(spanElement) spanElement.style.animation = 'popIn 0.3s ease-out forwards'; }); }}, 150); }
    function updateTimerDisplay(spanElement, nextTimestamp) { if (!spanElement || !spanElement.closest('.content-section').classList.contains('active')) return; const now = Date.now(); const timeLeft = Math.max(0, nextTimestamp - now); spanElement.textContent = `${(timeLeft / 1000).toFixed(1)}s`; }

    function updateAviatorValue(addToHistory = false) { if (!aviatorResultSpan) return; currentAviatorValue = `${(Math.random() * 99 + 1).toFixed(2)}x`; if(addToHistory) addHistoryEntry('Aviator', currentAviatorValue); updateResultDisplay(aviatorResultSpan, currentAviatorValue); }
    function triggerAviatorUpdate() { updateAviatorValue(true); aviatorNextUpdateTimestamp = Date.now() + AVIATOR_INTERVAL; }
    function updateAviatorDisplay() { updateTimerDisplay(aviatorTimerSpan, aviatorNextUpdateTimestamp); updateResultDisplay(aviatorResultSpan, currentAviatorValue); }
    function startAviatorTimers() { if (Date.now() >= aviatorNextUpdateTimestamp) { triggerAviatorUpdate(); } else { updateTimerDisplay(aviatorTimerSpan, aviatorNextUpdateTimestamp); } aviatorUpdateIntervalId = setInterval(triggerAviatorUpdate, AVIATOR_INTERVAL); aviatorDisplayIntervalId = setInterval(() => updateTimerDisplay(aviatorTimerSpan, aviatorNextUpdateTimestamp), 100); }
    if(aviatorGenerateButton) { aviatorGenerateButton.addEventListener('click', () => updateAviatorValue(true)); }

    function updateLuckyJetValue(addToHistory = false) { if (!luckyjetResultSpan) return; currentLuckyJetValue = `${(Math.random() * 199 + 1).toFixed(2)}x`; if(addToHistory) addHistoryEntry('Lucky Jet', currentLuckyJetValue); updateResultDisplay(luckyjetResultSpan, currentLuckyJetValue); }
    function triggerLuckyJetUpdate() { updateLuckyJetValue(true); luckyjetNextUpdateTimestamp = Date.now() + LUCKYJET_INTERVAL; }
    function updateLuckyJetDisplay() { updateTimerDisplay(luckyjetTimerSpan, luckyjetNextUpdateTimestamp); updateResultDisplay(luckyjetResultSpan, currentLuckyJetValue); }
    function startLuckyJetTimers() { if (Date.now() >= luckyjetNextUpdateTimestamp) { triggerLuckyJetUpdate(); } else { updateTimerDisplay(luckyjetTimerSpan, luckyjetNextUpdateTimestamp); } luckyjetUpdateIntervalId = setInterval(triggerLuckyJetUpdate, LUCKYJET_INTERVAL); luckyjetDisplayIntervalId = setInterval(() => updateTimerDisplay(luckyjetTimerSpan, luckyjetNextUpdateTimestamp), 100); }
    if(luckyjetGenerateButton) { luckyjetGenerateButton.addEventListener('click', () => updateLuckyJetValue(true)); }

    function updateSpeedCashValue(addToHistory = false) { if (!speedcashResultBlueSpan || !speedcashResultOrangeSpan) return; currentSpeedCashBlueValue = `${(Math.random() * 49 + 1).toFixed(2)}x`; currentSpeedCashOrangeValue = `${(Math.random() * 49 + 1).toFixed(2)}x`; if(addToHistory) { addHistoryEntry('SpeedCash', currentSpeedCashBlueValue, 'blue'); addHistoryEntry('SpeedCash', currentSpeedCashOrangeValue, 'orange'); } updateResultDisplay(speedcashResultBlueSpan, currentSpeedCashBlueValue); updateResultDisplay(speedcashResultOrangeSpan, currentSpeedCashOrangeValue); }
    function triggerSpeedCashUpdate() { updateSpeedCashValue(true); speedcashNextUpdateTimestamp = Date.now() + SPEEDCASH_INTERVAL; }
    function updateSpeedCashDisplay() { updateTimerDisplay(speedcashTimerSpan, speedcashNextUpdateTimestamp); updateResultDisplay(speedcashResultBlueSpan, currentSpeedCashBlueValue); updateResultDisplay(speedcashResultOrangeSpan, currentSpeedCashOrangeValue); }
    function startSpeedCashTimers() { if (Date.now() >= speedcashNextUpdateTimestamp) { triggerSpeedCashUpdate(); } else { updateTimerDisplay(speedcashTimerSpan, speedcashNextUpdateTimestamp); } speedcashUpdateIntervalId = setInterval(triggerSpeedCashUpdate, SPEEDCASH_INTERVAL); speedcashDisplayIntervalId = setInterval(() => updateTimerDisplay(speedcashTimerSpan, speedcashNextUpdateTimestamp), 100); }
    if(speedcashGenerateButton) { speedcashGenerateButton.addEventListener('click', () => updateSpeedCashValue(true)); }

    function updateJetXValue(addToHistory = false) { if (!jetxResultSpan) return; currentJetXValue = `${(Math.random() * 149 + 1).toFixed(2)}x`; if(addToHistory) addHistoryEntry('JetX', currentJetXValue); updateResultDisplay(jetxResultSpan, currentJetXValue); }
    function triggerJetXUpdate() { updateJetXValue(true); jetxNextUpdateTimestamp = Date.now() + JETX_INTERVAL; }
    function updateJetXDisplay() { updateTimerDisplay(jetxTimerSpan, jetxNextUpdateTimestamp); updateResultDisplay(jetxResultSpan, currentJetXValue); }
    function startJetXTimers() { if (Date.now() >= jetxNextUpdateTimestamp) { triggerJetXUpdate(); } else { updateTimerDisplay(jetxTimerSpan, jetxNextUpdateTimestamp); } jetxUpdateIntervalId = setInterval(triggerJetXUpdate, JETX_INTERVAL); jetxDisplayIntervalId = setInterval(() => updateTimerDisplay(jetxTimerSpan, jetxNextUpdateTimestamp), 100); }
    if(jetxGenerateButton) { jetxGenerateButton.addEventListener('click', () => updateJetXValue(true)); }

    startAviatorTimers(); startLuckyJetTimers(); startSpeedCashTimers(); startJetXTimers();
    const initialActiveSectionElement = document.querySelector('.content-section.active');
    let initialSectionId = 'mines';
    if (initialActiveSectionElement) { initialSectionId = initialActiveSectionElement.id.replace('-section', ''); }
    showSection(initialSectionId);

});