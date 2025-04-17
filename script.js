document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const navLinks = document.querySelectorAll('.sidebar .nav-item a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const headerContentContainer = document.getElementById('header-content-container');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const bodyElement = document.body;

    // Mines elements
    const minesSection = document.getElementById('mines-section');
    const minesBoard = document.getElementById('mines-board');
    const mineCountSelect = document.getElementById('mine-count');
    const minesGenerateButton = document.getElementById('mines-generate-button');
    const minesAnalysisIndicator = document.getElementById('mines-analysis-indicator');
    const minesAnalysisLabel = document.getElementById('mines-analysis-label');
    const minesProgressContainer = document.getElementById('mines-progress-container');
    const minesProgressBar = document.getElementById('mines-progress-bar');
    let isMinesGenerating = false;

    // Penalty Elements
    const penaltySection = document.getElementById('penalty-section');
    const penaltyBoard = document.getElementById('penalty-board');
    const penaltyGenerateButton = document.getElementById('penalty-generate-button');
    const penaltyAnalysisIndicator = document.getElementById('penalty-analysis-indicator');
    const penaltyAnalysisLabel = document.getElementById('penalty-analysis-label');
    const penaltyProgressContainer = document.getElementById('penalty-progress-container');
    const penaltyProgressBar = document.getElementById('penalty-progress-bar');
    let isPenaltyGenerating = false;
    const penaltyRows = 3; const penaltyCols = 5; const penaltyTotalSpots = penaltyRows * penaltyCols; const penaltyMisses = 4;

    // Crash Elements
    const crashSection = document.getElementById('crash-section');
    const crashResultSpan = document.getElementById('crash-result');
    const crashTimerSpan = document.getElementById('crash-timer');

    // Rocket Queen Elements
    const rocketqueenSection = document.getElementById('rocketqueen-section');
    const rocketqueenResultSpan = document.getElementById('rocketqueen-result');
    const rocketqueenTimerSpan = document.getElementById('rocketqueen-timer');

    // Aviator elements
    const aviatorSection = document.getElementById('aviator-section');
    const aviatorResultSpan = document.getElementById('aviator-result');
    const aviatorTimerSpan = document.getElementById('aviator-timer');

    // Luckyjet elements
    const luckyjetSection = document.getElementById('luckyjet-section');
    const luckyjetResultSpan = document.getElementById('luckyjet-result');
    const luckyjetTimerSpan = document.getElementById('luckyjet-timer');

    // Speedcash elements
    const speedcashSection = document.getElementById('speedcash-section');
    const speedcashResultBlueSpan = document.getElementById('speedcash-result-blue');
    const speedcashResultOrangeSpan = document.getElementById('speedcash-result-orange');
    const speedcashTimerSpan = document.getElementById('speedcash-timer');

    // JetX elements
    const jetxSection = document.getElementById('jetx-section');
    const jetxResultSpan = document.getElementById('jetx-result');
    const jetxTimerSpan = document.getElementById('jetx-timer');

    // Keno elements
    const kenoSection = document.getElementById('keno-section');
    const kenoResultDisplay = document.getElementById('keno-result-display');
    const kenoGenerateButton = document.getElementById('keno-generate-button');
    const kenoNumberCountSelect = document.getElementById('keno-number-count'); // Возвращено
    // const kenoRiskSelect = document.getElementById('keno-risk'); // Убрано
    const kenoAnalysisIndicator = document.getElementById('keno-analysis-indicator');
    const kenoAnalysisLabel = document.getElementById('keno-analysis-label');
    const kenoProgressContainer = document.getElementById('keno-progress-container');
    const kenoProgressBar = document.getElementById('keno-progress-bar');
    let isKenoGenerating = false;

    // Plinko elements
    const plinkoSection = document.getElementById('plinko-section');
    const plinkoGenerateButton = document.getElementById('plinko-generate-button');
    const plinkoPresetSelect = document.getElementById('plinko-preset');    // Возвращено
    const plinkoRiskSelect = document.getElementById('plinko-risk');        // Возвращено
    const plinkoRowCountSelect = document.getElementById('plinko-row-count');
    const plinkoBallCountSelect = document.getElementById('plinko-ball-count'); // Значения изменены в HTML
    const plinkoAnalysisIndicator = document.getElementById('plinko-analysis-indicator');
    const plinkoAnalysisLabel = document.getElementById('plinko-analysis-label');
    const plinkoProgressContainer = document.getElementById('plinko-progress-container');
    const plinkoProgressBar = document.getElementById('plinko-progress-bar');
    const plinkoBallResultDisplay = document.getElementById('plinko-ball-result-display');
    const plinkoBallResultText = document.getElementById('plinko-ball-result-text');
    let isPlinkoGenerating = false;

    // Coinflip elements
    const coinflipSection = document.getElementById('coinflip-section');
    const coinflipResultSpan = document.getElementById('coinflip-result');
    const coinflipGenerateButton = document.getElementById('coinflip-generate-button');

    // Double elements
    const doubleSection = document.getElementById('double-section');
    const doubleResultIndicator = document.getElementById('double-result');
    const doubleStarIcon = doubleResultIndicator?.querySelector('.double-star-icon');
    const doubleTimerSpan = document.getElementById('double-timer');
    const doubleResultText = document.getElementById('double-result-text');

    // Dice elements
    const diceSection = document.getElementById('dice-section');
    const diceGenerateButton = document.getElementById('dice-generate-button');
    const diceAnalysisIndicator = document.getElementById('dice-analysis-indicator');
    const diceAnalysisLabel = document.getElementById('dice-analysis-label');
    const diceProgressContainer = document.getElementById('dice-progress-container');
    const diceProgressBar = document.getElementById('dice-progress-bar');
    const diceResultDisplay = document.getElementById('dice-result-display');
    const diceResultNumberSpan = document.getElementById('dice-result-number');
    const diceResultPredictionSpan = document.getElementById('dice-result-prediction');
    const dicePredictionTextSpan = diceResultPredictionSpan?.querySelector('.dice-prediction-text');
    const diceArrowSpan = diceResultPredictionSpan?.querySelector('.dice-arrow');
    let isDiceGenerating = false;


    // Hilo elements
    const hiloSection = document.getElementById('hilo-section');
    const hiloCardDisplay = document.getElementById('hilo-current-card-display');
    const hiloCardRankSpan = hiloCardDisplay?.querySelector('.hilo-card-rank');
    const hiloCardSuitSpan = hiloCardDisplay?.querySelector('.hilo-card-suit');
    const hiloSuitSelect = document.getElementById('hilo-suit-select');
    const hiloRankSelect = document.getElementById('hilo-rank-select');
    const hiloGenerateButton = document.getElementById('hilo-generate-button');
    const hiloAnalysisIndicator = document.getElementById('hilo-analysis-indicator');
    const hiloAnalysisLabel = document.getElementById('hilo-analysis-label');
    const hiloProgressContainer = document.getElementById('hilo-progress-container');
    const hiloProgressBar = document.getElementById('hilo-progress-bar');
    const hiloPredictionDisplay = document.getElementById('hilo-prediction-display');
    const hiloPredictionSpan = document.getElementById('hilo-prediction');
    let isHiloGenerating = false;


    // --- Game State Variables ---
    const boardSize = 5; const totalCells = boardSize * boardSize; let minesInitialized = false; let penaltyInitialized = false;
    let doubleTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: { color: "Ожидание...", class: "" }, INTERVAL: 15000 };
    let aviatorTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 20000 };
    let luckyjetTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 15000 };
    let speedcashTimer = { intervalId: null, displayId: null, nextUpdate: 0, blueValue: "1.00x", orangeValue: "1.00x", INTERVAL: 18000 };
    let jetxTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 16000 };
    let crashTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 18000 };
    let rocketqueenTimer = { intervalId: null, displayId: null, nextUpdate: 0, value: "1.00x", INTERVAL: 22000 };

    const hiloSuits = ['♦️', '♥️', '♣️', '♠️'];
    const hiloRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const hiloRankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    let currentHiloCard = { rank: '7', suit: '♦️', value: 7 };


    // --- Helper Functions ---
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
    function applyTheme(theme) { bodyElement.classList.remove('dark-theme', 'light-theme'); bodyElement.classList.add(theme + '-theme'); localStorage.setItem('appTheme', theme); if (themeCheckbox) { themeCheckbox.checked = (theme === 'light'); } }
    const savedTheme = localStorage.getItem('appTheme') || 'dark'; applyTheme(savedTheme); if (themeCheckbox) { themeCheckbox.addEventListener('change', () => { applyTheme(themeCheckbox.checked ? 'light' : 'dark'); }); }
    function updateResultDisplay(spanElement, newValue, isHtml = false) { if (!spanElement || !spanElement.closest('.content-section.active')) return; spanElement.classList.add('updating'); setTimeout(() => { if (spanElement) { if(isHtml) { spanElement.innerHTML = newValue; } else { spanElement.textContent = newValue; } spanElement.classList.remove('updating'); spanElement.style.animation = 'none'; requestAnimationFrame(() => { if(spanElement) spanElement.style.animation = 'popIn 0.3s ease-out forwards'; }); }}, 150); }
    function updateTimerDisplay(spanElement, nextTimestamp) { if (!spanElement || !spanElement.closest('.content-section.active')) return; const now = Date.now(); const timeLeft = Math.max(0, nextTimestamp - now); spanElement.textContent = `${(timeLeft / 1000).toFixed(1)}s`; }

    // --- Header and Section Switching ---
    function updateHeaderContent(sectionId) { if (!headerContentContainer) return; let headerHTML = ''; let logoSrc = ''; let fallbackLogoSrc = ''; let logoId = ''; let altText = ''; switch (sectionId) { case 'mines': logoSrc = 'header-mines-logo.png'; fallbackLogoSrc = 'logo-mines.png'; logoId = 'header-mines-logo'; altText="Mines Logo"; break; case 'penalty': logoSrc = 'header-penalty-logo.png'; fallbackLogoSrc = 'logo-penalty.png'; logoId = 'header-penalty-logo'; altText="Penalty Logo"; break; case 'crash': logoSrc = 'header-crash-logo.png'; fallbackLogoSrc = 'logo-crash.png'; logoId = 'header-crash-logo'; altText="Crash Logo"; break; case 'rocketqueen': logoSrc = 'header-rocketqueen-logo.png'; fallbackLogoSrc = 'logo-rocketqueen.png'; logoId = 'header-rocketqueen-logo'; altText="Rocket Queen Logo"; break; case 'aviator': logoSrc = 'header-aviator-logo.png'; fallbackLogoSrc = 'logo-aviator.png'; logoId = 'header-aviator-logo'; altText="Aviator Logo"; break; case 'luckyjet': logoSrc = 'header-luckyjet-logo.png'; fallbackLogoSrc = 'logo-luckyjet.png'; logoId = 'header-luckyjet-logo'; altText="Lucky Jet Logo"; break; case 'speedcash': logoSrc = 'header-speedcash-logo.png'; fallbackLogoSrc = 'logo-speedcash.png'; logoId = 'header-speedcash-logo'; altText="Speed & Cash Logo"; break; case 'jetx': logoSrc = 'header-jetx-logo.png'; fallbackLogoSrc = 'logo-jetx.png'; logoId = 'header-jetx-logo'; altText="JetX Logo"; break; case 'keno': logoSrc = 'header-keno-logo.png'; fallbackLogoSrc = 'logo-keno.png'; logoId = 'header-keno-logo'; altText="Keno Logo"; break; case 'plinko': logoSrc = 'header-plinko-logo.png'; fallbackLogoSrc = 'logo-plinko.png'; logoId = 'header-plinko-logo'; altText="Plinko Logo"; break; case 'coinflip': logoSrc = 'header-conflip-logo.png'; fallbackLogoSrc = 'logo-coinflip.png'; logoId = 'header-coinflip-logo'; altText="Coinflip Logo"; break; case 'double': logoSrc = 'header-double-logo.png'; fallbackLogoSrc = 'logo-double.png'; logoId = 'header-double-logo'; altText="Double Logo"; break; case 'dice': logoSrc = 'header-dice-logo.png'; fallbackLogoSrc = 'logo-dice.png'; logoId = 'header-dice-logo'; altText="Dice Logo"; break; case 'hilo': logoSrc = 'header-hilo-logo.png'; fallbackLogoSrc = 'logo-hilo.png'; logoId = 'header-hilo-logo'; altText="Hilo Logo"; break; case 'settings': headerHTML = '<h1 id="header-text">Настройки</h1>'; altText="Settings"; break; default: logoSrc = 'logo.png'; fallbackLogoSrc = 'logo-mines.png'; logoId = 'header-default-logo'; altText="App Logo"; } if (logoSrc && sectionId !== 'settings') { headerHTML = `<img src="${logoSrc}" alt="${altText}" class="header-logo" ${logoId ? `id="${logoId}"` : ''} onerror="this.onerror=null; this.src='${fallbackLogoSrc}';">`; } else if (sectionId === 'settings') {} else { headerHTML = `<img src="${fallbackLogoSrc}" alt="App Logo" class="header-logo">`; } const currentHTML = headerContentContainer.innerHTML; if (currentHTML.replace(/\s+/g, '') !== headerHTML.replace(/\s+/g, '')) { headerContentContainer.style.opacity = '0'; setTimeout(() => { headerContentContainer.innerHTML = headerHTML; headerContentContainer.style.opacity = '1'; }, 150); } else { headerContentContainer.style.opacity = '1'; } }
    function showSection(sectionId) { contentSections.forEach(section => section.classList.remove('active')); navItems.forEach(item => item.classList.remove('active-nav')); updateHeaderContent(sectionId); const targetSection = document.getElementById(sectionId + '-section'); const targetNavItem = document.querySelector(`.nav-item a[data-section="${sectionId}"]`)?.closest('.nav-item'); if (targetSection) { requestAnimationFrame(() => { targetSection.classList.add('active'); if (sectionId === 'mines') { initMines(); } else if (sectionId === 'penalty') { initPenalty(); } else if (sectionId === 'crash') { updateCrashDisplay(); } else if (sectionId === 'rocketqueen') { updateRocketQueenDisplay(); } else if (sectionId === 'aviator') { updateAviatorDisplay(); } else if (sectionId === 'luckyjet') { updateLuckyJetDisplay(); } else if (sectionId === 'speedcash') { updateSpeedCashDisplay(); } else if (sectionId === 'jetx') { updateJetXDisplay(); } else if (sectionId === 'keno') { initKeno(); } else if (sectionId === 'plinko') { initPlinko(); } else if (sectionId === 'double') { updateDoubleDisplay(); } else if (sectionId === 'dice') { initDice(); } else if (sectionId === 'hilo') { initHilo(); } }); } else { console.error("Секция не найдена:", sectionId + '-section'); } if (targetNavItem) { targetNavItem.classList.add('active-nav'); } else { console.error("Пункт навигации не найден для секции:", sectionId); } }
    navLinks.forEach(link => { link.addEventListener('click', (event) => { event.preventDefault(); const sectionId = link.getAttribute('data-section'); if (!link.closest('.nav-item').classList.contains('active-nav')) { showSection(sectionId); } }); });

    // --- Game Timer Setup ---
    function setupGameTimer(gameTimer, updateValueFunc, triggerUpdateFunc, updateDisplayFunc, timerSpan) { if (Date.now() >= gameTimer.nextUpdate) { triggerUpdateFunc(); } else if (timerSpan) { updateTimerDisplay(timerSpan, gameTimer.nextUpdate); } if (gameTimer.intervalId) clearInterval(gameTimer.intervalId); if (gameTimer.displayId) clearInterval(gameTimer.displayId); gameTimer.intervalId = setInterval(triggerUpdateFunc, gameTimer.INTERVAL); if (timerSpan) { gameTimer.displayId = setInterval(() => updateTimerDisplay(timerSpan, gameTimer.nextUpdate), 100); } }

    // --- Function to generate biased crash-like multipliers ---
    function generateCrashMultiplier(maxCommon = 15, maxRare = 30, rareChance = 0.15) { const rand = Math.random(); let multiplier; if (rand < rareChance) { multiplier = Math.random() * (maxRare - maxCommon) + maxCommon; } else { multiplier = 1 + Math.pow(Math.random(), 2.5) * (maxCommon - 1); } return Math.max(1.00, multiplier).toFixed(2) + 'x'; }

    // --- Game Logic Functions ---
    function initMines() { createBoard(); minesInitialized = true; if (minesGenerateButton) { minesGenerateButton.removeEventListener('click', generateMinesPrediction); minesGenerateButton.addEventListener('click', generateMinesPrediction); isMinesGenerating = false; minesGenerateButton.disabled = false; } if(minesAnalysisIndicator) minesAnalysisIndicator.style.display = 'none'; }
    function createBoard() { if (!minesBoard) return; minesBoard.innerHTML = ''; for (let i = 0; i < totalCells; i++) { const cell = document.createElement('div'); cell.classList.add('cell'); cell.dataset.index = i; minesBoard.appendChild(cell); } }
    function generateMinesPrediction() { if (!minesSection.classList.contains('active') || !minesBoard || !mineCountSelect || isMinesGenerating) return; isMinesGenerating = true; if(minesGenerateButton) minesGenerateButton.disabled = true; const numMines = parseInt(mineCountSelect.value); const numSafeSpots = totalCells - numMines; const cells = minesBoard.querySelectorAll('.cell'); const starRevealInterval = 60; if (cells.length === 0 || !minesAnalysisIndicator || !minesProgressBar) { isMinesGenerating = false; if(minesGenerateButton) minesGenerateButton.disabled = false; return; } cells.forEach(cell => cell.classList.remove('safe-predicted', 'mine-predicted')); if (minesProgressBar) minesProgressBar.style.width = '0%'; if(minesAnalysisIndicator) minesAnalysisIndicator.style.display = 'block'; const mineIndices = new Set(); while (mineIndices.size < numMines) { mineIndices.add(Math.floor(Math.random() * totalCells)); } const safeIndices = []; for (let i = 0; i < totalCells; i++) { if (!mineIndices.has(i)) { safeIndices.push(i); } } shuffleArray(safeIndices); safeIndices.forEach((safeIndex, i) => { setTimeout(() => { if (!minesSection.classList.contains('active')) return; const cell = cells[safeIndex]; if (cell) { cell.classList.add('safe-predicted'); } const progress = ((i + 1) / numSafeSpots) * 100; if(minesProgressBar) minesProgressBar.style.width = `${progress}%`; if (i === numSafeSpots - 1) { setTimeout(() => { if(minesAnalysisIndicator) minesAnalysisIndicator.style.display = 'none'; isMinesGenerating = false; if(minesGenerateButton) minesGenerateButton.disabled = false; }, 300); } }, i * starRevealInterval); }); }

    function initPenalty() { createPenaltyBoard(); penaltyInitialized = true; if (penaltyGenerateButton) { penaltyGenerateButton.removeEventListener('click', generatePenaltyPrediction); penaltyGenerateButton.addEventListener('click', generatePenaltyPrediction); isPenaltyGenerating = false; penaltyGenerateButton.disabled = false; } if(penaltyAnalysisIndicator) penaltyAnalysisIndicator.style.display = 'none'; }
    function createPenaltyBoard() { if (!penaltyBoard) return; penaltyBoard.innerHTML = ''; penaltyBoard.style.gridTemplateColumns = `repeat(${penaltyCols}, 55px)`; penaltyBoard.style.gridTemplateRows = `repeat(${penaltyRows}, 55px)`; for (let i = 0; i < penaltyTotalSpots; i++) { const goalSpot = document.createElement('div'); goalSpot.classList.add('penalty-goal'); goalSpot.dataset.index = i; penaltyBoard.appendChild(goalSpot); } }
    function generatePenaltyPrediction() { if (!penaltySection.classList.contains('active') || !penaltyBoard || isPenaltyGenerating) return; isPenaltyGenerating = true; if(penaltyGenerateButton) penaltyGenerateButton.disabled = true; const numSafeSpots = penaltyTotalSpots - penaltyMisses; const goals = penaltyBoard.querySelectorAll('.penalty-goal'); const revealInterval = 100; if (goals.length === 0 || !penaltyAnalysisIndicator || !penaltyProgressBar) { isPenaltyGenerating = false; if(penaltyGenerateButton) penaltyGenerateButton.disabled = false; return; } goals.forEach(goal => goal.classList.remove('safe-predicted')); if (penaltyProgressBar) penaltyProgressBar.style.width = '0%'; if (penaltyAnalysisIndicator) penaltyAnalysisIndicator.style.display = 'block'; const missIndices = new Set(); while (missIndices.size < penaltyMisses) { missIndices.add(Math.floor(Math.random() * penaltyTotalSpots)); } const safeIndices = []; for (let i = 0; i < penaltyTotalSpots; i++) { if (!missIndices.has(i)) { safeIndices.push(i); } } shuffleArray(safeIndices); safeIndices.forEach((safeIndex, i) => { setTimeout(() => { if (!penaltySection.classList.contains('active')) return; const goal = goals[safeIndex]; if (goal) { goal.classList.add('safe-predicted'); } const progress = ((i + 1) / numSafeSpots) * 100; if(penaltyProgressBar) penaltyProgressBar.style.width = `${progress}%`; if (i === numSafeSpots - 1) { setTimeout(() => { if(penaltyAnalysisIndicator) penaltyAnalysisIndicator.style.display = 'none'; isPenaltyGenerating = false; if(penaltyGenerateButton) penaltyGenerateButton.disabled = false; }, 300); } }, i * revealInterval); }); }

    function updateCrashValue() { crashTimer.value = generateCrashMultiplier(15, 35, 0.15); updateResultDisplay(crashResultSpan, crashTimer.value); }
    function triggerCrashUpdate() { updateCrashValue(); crashTimer.nextUpdate = Date.now() + crashTimer.INTERVAL; }
    function updateCrashDisplay() { updateTimerDisplay(crashTimerSpan, crashTimer.nextUpdate); updateResultDisplay(crashResultSpan, crashTimer.value); }

    function updateRocketQueenValue() { rocketqueenTimer.value = generateCrashMultiplier(12, 30, 0.18); updateResultDisplay(rocketqueenResultSpan, rocketqueenTimer.value); }
    function triggerRocketQueenUpdate() { updateRocketQueenValue(); rocketqueenTimer.nextUpdate = Date.now() + rocketqueenTimer.INTERVAL; }
    function updateRocketQueenDisplay() { updateTimerDisplay(rocketqueenTimerSpan, rocketqueenTimer.nextUpdate); updateResultDisplay(rocketqueenResultSpan, rocketqueenTimer.value); }

    function updateAviatorValue() { aviatorTimer.value = generateCrashMultiplier(18, 40, 0.12); updateResultDisplay(aviatorResultSpan, aviatorTimer.value); }
    function triggerAviatorUpdate() { updateAviatorValue(); aviatorTimer.nextUpdate = Date.now() + aviatorTimer.INTERVAL; }
    function updateAviatorDisplay() { updateTimerDisplay(aviatorTimerSpan, aviatorTimer.nextUpdate); updateResultDisplay(aviatorResultSpan, aviatorTimer.value); }

    function updateLuckyJetValue() { luckyjetTimer.value = generateCrashMultiplier(15, 50, 0.10); updateResultDisplay(luckyjetResultSpan, luckyjetTimer.value); }
    function triggerLuckyJetUpdate() { updateLuckyJetValue(); luckyjetTimer.nextUpdate = Date.now() + luckyjetTimer.INTERVAL; }
    function updateLuckyJetDisplay() { updateTimerDisplay(luckyjetTimerSpan, luckyjetTimer.nextUpdate); updateResultDisplay(luckyjetResultSpan, luckyjetTimer.value); }

    function updateSpeedCashValue() { speedcashTimer.blueValue = generateCrashMultiplier(10, 25, 0.2); speedcashTimer.orangeValue = generateCrashMultiplier(10, 25, 0.2); updateResultDisplay(speedcashResultBlueSpan, speedcashTimer.blueValue); updateResultDisplay(speedcashResultOrangeSpan, speedcashTimer.orangeValue); }
    function triggerSpeedCashUpdate() { updateSpeedCashValue(); speedcashTimer.nextUpdate = Date.now() + speedcashTimer.INTERVAL; }
    function updateSpeedCashDisplay() { updateTimerDisplay(speedcashTimerSpan, speedcashTimer.nextUpdate); updateResultDisplay(speedcashResultBlueSpan, speedcashTimer.blueValue); updateResultDisplay(speedcashResultOrangeSpan, speedcashTimer.orangeValue); }

    function updateJetXValue() { jetxTimer.value = generateCrashMultiplier(20, 60, 0.08); updateResultDisplay(jetxResultSpan, jetxTimer.value); }
    function triggerJetXUpdate() { updateJetXValue(); jetxTimer.nextUpdate = Date.now() + jetxTimer.INTERVAL; }
    function updateJetXDisplay() { updateTimerDisplay(jetxTimerSpan, jetxTimer.nextUpdate); updateResultDisplay(jetxResultSpan, jetxTimer.value); }

    function updateDoubleValue() { const rand = Math.random(); let resultClass, resultColorText; if (rand < 0.03) { resultColorText = 'Звезда'; resultClass = 'white'; } else if (rand < 0.515) { resultColorText = 'Красный'; resultClass = 'red'; } else { resultColorText = 'Черный'; resultClass = 'black'; } doubleTimer.value = { color: resultColorText, class: resultClass }; updateDoubleResultDisplay(resultClass, resultColorText); }
    function updateDoubleResultDisplay(colorClass, colorText = "Ожидание...") { if (!doubleResultIndicator || !doubleResultText || !doubleStarIcon || !doubleSection.classList.contains('active')) return; doubleResultText.textContent = colorText; doubleResultIndicator.className = 'double-color-indicator'; doubleStarIcon.style.display = 'none'; if (colorClass) { doubleResultIndicator.classList.add(colorClass); if (colorClass === 'white') { doubleStarIcon.style.display = 'block'; } doubleResultIndicator.style.animation = 'none'; requestAnimationFrame(() => { doubleResultIndicator.style.animation = 'popIn 0.4s ease-out forwards'; }); } else { doubleResultIndicator.style.backgroundColor = ''; doubleResultIndicator.style.borderColor = ''; } }
    function triggerDoubleUpdate() { updateDoubleValue(); doubleTimer.nextUpdate = Date.now() + doubleTimer.INTERVAL; }
    function updateDoubleDisplay() { updateTimerDisplay(doubleTimerSpan, doubleTimer.nextUpdate); updateDoubleResultDisplay(doubleTimer.value.class, doubleTimer.value.color); }

    // --- Keno Functions (Updated) ---
    function initKeno() {
        if (kenoGenerateButton) {
             kenoGenerateButton.removeEventListener('click', generateKenoPrediction);
             kenoGenerateButton.addEventListener('click', generateKenoPrediction);
             isKenoGenerating = false;
             kenoGenerateButton.disabled = false;
         }
         if(kenoAnalysisIndicator) kenoAnalysisIndicator.style.display = 'none';
         if(kenoResultDisplay) kenoResultDisplay.innerHTML = ''; // Clear previous results on init
         if(kenoNumberCountSelect) kenoNumberCountSelect.value = "10"; // Set default
    }
    function generateKenoPrediction() {
        if (!kenoSection.classList.contains('active') || isKenoGenerating) return;
        isKenoGenerating = true;
        if(kenoGenerateButton) kenoGenerateButton.disabled = true;
        if(kenoResultDisplay) kenoResultDisplay.innerHTML = '';
        if(kenoAnalysisIndicator) kenoAnalysisIndicator.style.display = 'block';
        if(kenoProgressBar) kenoProgressBar.style.width = '0%';

        const analysisDuration = Math.random() * 1500 + 1500;
        const startTime = Date.now();
        let progressInterval = null;

        progressInterval = setInterval(() => {
             if (!kenoSection.classList.contains('active') || !isKenoGenerating) { clearInterval(progressInterval); isKenoGenerating = false; if(kenoGenerateButton) kenoGenerateButton.disabled = false; if(kenoAnalysisIndicator) kenoAnalysisIndicator.style.display = 'none'; return; }
             const elapsedTime = Date.now() - startTime;
             const progress = Math.min(100, (elapsedTime / analysisDuration) * 100);
             if (kenoProgressBar) kenoProgressBar.style.width = `${progress}%`;

             if (elapsedTime >= analysisDuration) {
                 clearInterval(progressInterval);
                 if(kenoAnalysisIndicator) kenoAnalysisIndicator.style.display = 'none';

                 const count = kenoNumberCountSelect ? parseInt(kenoNumberCountSelect.value) : 10; // Use selected count
                 const numbers = new Set();
                 while (numbers.size < count) { numbers.add(Math.floor(Math.random() * 40) + 1); }
                 const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
                 if(kenoResultDisplay) {
                     kenoResultDisplay.innerHTML = '';
                     sortedNumbers.forEach((num, index) => {
                         setTimeout(() => {
                             const span = document.createElement('span');
                             span.classList.add('keno-number');
                             span.textContent = num;
                             if (kenoResultDisplay && kenoSection.classList.contains('active')) { kenoResultDisplay.appendChild(span); }
                         }, index * 50);
                     });
                 }
                 isKenoGenerating = false;
                 if(kenoGenerateButton) kenoGenerateButton.disabled = false;
             }
         }, 50);
    }
    // --- End Keno Functions ---

    // --- Plinko Functions (Updated) ---
    function initPlinko() {
         if (plinkoPresetSelect) { plinkoPresetSelect.removeEventListener('change', handlePlinkoPresetChange); plinkoPresetSelect.addEventListener('change', handlePlinkoPresetChange); }
         // Risk select is now controlled by preset listener
         handlePlinkoPresetChange(); // Call initially to set correct options
         if (plinkoGenerateButton) { plinkoGenerateButton.removeEventListener('click', generatePlinkoPrediction); plinkoGenerateButton.addEventListener('click', generatePlinkoPrediction); isPlinkoGenerating = false; plinkoGenerateButton.disabled = false; }
         if(plinkoAnalysisIndicator) plinkoAnalysisIndicator.style.display = 'none';
         if(plinkoBallResultDisplay) plinkoBallResultDisplay.style.display = 'none';
         // Set defaults for new selectors
         if(plinkoRowCountSelect) plinkoRowCountSelect.value = "12";
         // Ball count is set by handlePlinkoPresetChange
    }
    function updatePlinkoBallCountOptions(preset) { // Logic remains the same
        if (!plinkoBallCountSelect) return; plinkoBallCountSelect.innerHTML = ''; let options = [];
        if (preset === 'extreme') { options = [25, 50, 100]; } // Corrected values
        else { options = [25, 50, 100]; } // Same for balance now, or adjust if needed
        options.forEach(num => { const option = document.createElement('option'); option.value = num; option.textContent = num; plinkoBallCountSelect.appendChild(option); });
        if (preset === 'balance' && options.includes(50)) { plinkoBallCountSelect.value = "50"; } // Default 50
        else if (preset === 'extreme' && options.includes(50)) { plinkoBallCountSelect.value = "50"; } // Default 50
    }
    function handlePlinkoPresetChange() { // Logic updated for risk
        if (!plinkoPresetSelect || !plinkoRiskSelect || !plinkoBallCountSelect) return;
        const selectedPreset = plinkoPresetSelect.value;
        updatePlinkoBallCountOptions(selectedPreset); // Update ball count based on preset
        if (selectedPreset === 'extreme') { plinkoRiskSelect.value = 'extreme'; plinkoRiskSelect.disabled = true; }
        else { plinkoRiskSelect.disabled = false; if (plinkoRiskSelect.value !== 'high' && plinkoRiskSelect.value !== 'extreme') { plinkoRiskSelect.value = 'high'; } }
    }
    function generatePlinkoPrediction() {
        if (!plinkoSection.classList.contains('active') || isPlinkoGenerating) return; isPlinkoGenerating = true; if(plinkoGenerateButton) plinkoGenerateButton.disabled = true; if(plinkoBallResultDisplay) plinkoBallResultDisplay.style.display = 'none'; if(plinkoAnalysisIndicator) plinkoAnalysisIndicator.style.display = 'block'; if(plinkoProgressBar) plinkoProgressBar.style.width = '0%'; const preset = plinkoPresetSelect ? plinkoPresetSelect.value : 'balance'; const risk = plinkoRiskSelect ? plinkoRiskSelect.value : 'high'; const rows = plinkoRowCountSelect ? parseInt(plinkoRowCountSelect.value) : 12; const ballCount = plinkoBallCountSelect ? parseInt(plinkoBallCountSelect.value) : 50; let resultBallNumber; const randBall = Math.random(); if (randBall < 0.15) { resultBallNumber = 11 + Math.floor(Math.random() * 5); } else { resultBallNumber = 5 + Math.floor(Math.random() * 6); } const analysisDuration = Math.random() * 2000 + 3000; const startTime = Date.now(); let progressInterval = null; progressInterval = setInterval(() => { if (!plinkoSection.classList.contains('active') || !isPlinkoGenerating) { clearInterval(progressInterval); isPlinkoGenerating = false; if(plinkoGenerateButton) plinkoGenerateButton.disabled = false; if(plinkoAnalysisIndicator) plinkoAnalysisIndicator.style.display = 'none'; return; } const elapsedTime = Date.now() - startTime; const progress = Math.min(100, (elapsedTime / analysisDuration) * 100); if (plinkoProgressBar) plinkoProgressBar.style.width = `${progress}%`; if (elapsedTime >= analysisDuration) { clearInterval(progressInterval); if(plinkoAnalysisIndicator) plinkoAnalysisIndicator.style.display = 'none'; if(plinkoBallResultText) plinkoBallResultText.innerHTML = `Шаров больше 1x = <span style="color: var(--plinko-orange);">${resultBallNumber}</span>`; if(plinkoBallResultDisplay) plinkoBallResultDisplay.style.display = 'inline-block'; isPlinkoGenerating = false; if(plinkoGenerateButton) plinkoGenerateButton.disabled = false; } }, 50);
    }
    // --- End Plinko Functions ---

    function generateCoinflipPrediction() { if (!coinflipSection.classList.contains('active') || !coinflipResultSpan) return; coinflipResultSpan.classList.add('flipping'); coinflipResultSpan.classList.remove('gold', 'silver'); coinflipResultSpan.textContent = '?'; setTimeout(() => { const isGold = Math.random() < 0.5; const resultText = isGold ? 'Орёл' : 'Решка'; const resultClass = isGold ? 'gold' : 'silver'; coinflipResultSpan.textContent = resultText; coinflipResultSpan.classList.remove('flipping'); coinflipResultSpan.classList.add(resultClass); }, 500); }
    if(coinflipGenerateButton) coinflipGenerateButton.addEventListener('click', generateCoinflipPrediction);

    // --- Dice Functions (Updated) ---
     function initDice() { if (diceGenerateButton) { diceGenerateButton.removeEventListener('click', generateDicePrediction); diceGenerateButton.addEventListener('click', generateDicePrediction); isDiceGenerating = false; diceGenerateButton.disabled = false; } if(diceAnalysisIndicator) diceAnalysisIndicator.style.display = 'none'; if(diceResultDisplay) diceResultDisplay.style.display = 'none'; }
    function generateDicePrediction() {
        if (!diceSection.classList.contains('active') || isDiceGenerating) return;
        isDiceGenerating = true;
        if(diceGenerateButton) diceGenerateButton.disabled = true;
        if(diceResultDisplay) diceResultDisplay.style.display = 'none';
        if(diceAnalysisIndicator) diceAnalysisIndicator.style.display = 'block';
        if(diceProgressBar) diceProgressBar.style.width = '0%';

        const analysisDuration = Math.random() * 2000 + 3000; // 3-5 seconds
        const startTime = Date.now();
        let progressInterval = null;

        progressInterval = setInterval(() => {
            if (!diceSection.classList.contains('active') || !isDiceGenerating) { clearInterval(progressInterval); isDiceGenerating = false; if(diceGenerateButton) diceGenerateButton.disabled = false; if(diceAnalysisIndicator) diceAnalysisIndicator.style.display = 'none'; return; }
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(100, (elapsedTime / analysisDuration) * 100);
            if (diceProgressBar) diceProgressBar.style.width = `${progress}%`;

            if (elapsedTime >= analysisDuration) {
                clearInterval(progressInterval);
                if(diceAnalysisIndicator) diceAnalysisIndicator.style.display = 'none';

                const resultNumber = Math.floor(Math.random() * 100) + 1;
                let predictionText = '';
                let arrow = '';
                const biasProbability = 0.75; // 75% шанс предсказать "сложное" направление
                const randomFactor = Math.random();

                if (resultNumber <= 50) { // Ожидаем "Больше"
                    if (randomFactor < biasProbability) { predictionText = "Меньше"; arrow = '▼'; }
                    else { predictionText = "Больше"; arrow = '▲'; }
                } else { // Ожидаем "Меньше" (resultNumber > 50)
                    if (randomFactor < biasProbability) { predictionText = "Больше"; arrow = '▲'; }
                    else { predictionText = "Меньше"; arrow = '▼'; }
                }

                if(diceResultNumberSpan) diceResultNumberSpan.textContent = resultNumber;
                if(dicePredictionTextSpan) dicePredictionTextSpan.textContent = predictionText;
                if(diceArrowSpan) diceArrowSpan.textContent = arrow;
                if(diceResultDisplay) diceResultDisplay.style.display = 'flex';

                isDiceGenerating = false;
                if(diceGenerateButton) diceGenerateButton.disabled = false;
            }
        }, 50);
    }
    // --- End Dice Functions ---

    function updateHiloCardDisplay() { if (!hiloSuitSelect || !hiloRankSelect || !hiloCardDisplay || !hiloCardRankSpan || !hiloCardSuitSpan) return; const selectedSuit = hiloSuitSelect.value; const selectedRank = hiloRankSelect.value; currentHiloCard = { rank: selectedRank, suit: selectedSuit, value: hiloRankValues[selectedRank] }; hiloCardRankSpan.textContent = selectedRank; hiloCardSuitSpan.textContent = selectedSuit; hiloCardDisplay.className = 'hilo-card-styled'; if (selectedSuit === '♦️' || selectedSuit === '♥️') { hiloCardDisplay.classList.add('red'); } if(hiloPredictionDisplay) hiloPredictionDisplay.style.display = 'none'; if(hiloAnalysisIndicator) hiloAnalysisIndicator.style.display = 'none'; if(hiloProgressBar) hiloProgressBar.style.width = '0%'; if(hiloGenerateButton) hiloGenerateButton.disabled = false; isHiloGenerating = false; }
    function generateHiloPrediction() { if (!hiloSection.classList.contains('active') || !hiloPredictionSpan || isHiloGenerating) return; isHiloGenerating = true; if(hiloGenerateButton) hiloGenerateButton.disabled = true; if(hiloPredictionDisplay) hiloPredictionDisplay.style.display = 'none'; if(hiloAnalysisIndicator) hiloAnalysisIndicator.style.display = 'block'; if(hiloProgressBar) hiloProgressBar.style.width = '0%'; const totalRanks = hiloRanks.length; const currentValue = currentHiloCard.value; const higherChance = (totalRanks - currentValue) / (totalRanks - 1); const lowerChance = (currentValue - 2) / (totalRanks - 1); let predictionText = '?'; if (currentValue === 14) { predictionText = 'Меньше'; } else if (currentValue === 2) { predictionText = 'Больше'; } else { const biasProbability = 0.8; const randomFactor = Math.random(); if (higherChance < 0.3 && randomFactor < biasProbability) { predictionText = 'Больше'; } else if (lowerChance < 0.3 && randomFactor < biasProbability) { predictionText = 'Меньше'; } else { predictionText = higherChance > lowerChance ? 'Больше' : 'Меньше'; } } const analysisDuration = Math.random() * 2000 + 3000; const startTime = Date.now(); let progressInterval = null; progressInterval = setInterval(() => { if (!hiloSection.classList.contains('active') || !isHiloGenerating) { clearInterval(progressInterval); isHiloGenerating = false; if(hiloGenerateButton) hiloGenerateButton.disabled = false; if(hiloAnalysisIndicator) hiloAnalysisIndicator.style.display = 'none'; return; } const elapsedTime = Date.now() - startTime; const progress = Math.min(100, (elapsedTime / analysisDuration) * 100); if (hiloProgressBar) hiloProgressBar.style.width = `${progress}%`; if (elapsedTime >= analysisDuration) { clearInterval(progressInterval); if(hiloAnalysisIndicator) hiloAnalysisIndicator.style.display = 'none'; if(hiloPredictionSpan) hiloPredictionSpan.textContent = predictionText; if(hiloPredictionDisplay) hiloPredictionDisplay.style.display = 'block'; isHiloGenerating = false; if(hiloGenerateButton) hiloGenerateButton.disabled = false; } }, 50); }
    function initHilo() { if (hiloSuitSelect) hiloSuitSelect.addEventListener('change', updateHiloCardDisplay); if (hiloRankSelect) hiloRankSelect.addEventListener('change', updateHiloCardDisplay); if (hiloGenerateButton) { hiloGenerateButton.removeEventListener('click', generateHiloPrediction); hiloGenerateButton.addEventListener('click', generateHiloPrediction); hiloGenerateButton.disabled = false; isHiloGenerating = false; } if(hiloRankSelect) hiloRankSelect.value = '7'; if(hiloSuitSelect) hiloSuitSelect.value = '♦️'; updateHiloCardDisplay(); if(hiloAnalysisIndicator) hiloAnalysisIndicator.style.display = 'none'; if(hiloPredictionDisplay) hiloPredictionDisplay.style.display = 'none'; }

    // --- Initialize Timers ---
    setupGameTimer(aviatorTimer, updateAviatorValue, triggerAviatorUpdate, updateAviatorDisplay, aviatorTimerSpan);
    setupGameTimer(luckyjetTimer, updateLuckyJetValue, triggerLuckyJetUpdate, updateLuckyJetDisplay, luckyjetTimerSpan);
    setupGameTimer(speedcashTimer, updateSpeedCashValue, triggerSpeedCashUpdate, updateSpeedCashDisplay, speedcashTimerSpan);
    setupGameTimer(jetxTimer, updateJetXValue, triggerJetXUpdate, updateJetXDisplay, jetxTimerSpan);
    setupGameTimer(doubleTimer, updateDoubleValue, triggerDoubleUpdate, updateDoubleDisplay, doubleTimerSpan);
    setupGameTimer(crashTimer, updateCrashValue, triggerCrashUpdate, updateCrashDisplay, crashTimerSpan);
    setupGameTimer(rocketqueenTimer, updateRocketQueenValue, triggerRocketQueenUpdate, updateRocketQueenDisplay, rocketqueenTimerSpan);

    // --- Show Initial Section ---
    const initialActiveSectionElement = document.querySelector('.content-section.active');
    let initialSectionId = 'mines';
    if (initialActiveSectionElement) { initialSectionId = initialActiveSectionElement.id.replace('-section', ''); }
    showSection(initialSectionId);

});