document.addEventListener('DOMContentLoaded', () => {
    // --- Глобальные элементы ---
    const navLinks = document.querySelectorAll('.sidebar .nav-item a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const headerContentContainer = document.getElementById('header-content-container'); // Контейнер в шапке

    // --- Элементы секции Мины ---
    const minesSection = document.getElementById('mines-section');
    const gameBoard = document.getElementById('game-board');
    const mineCountSelect = document.getElementById('mine-count');
    const predictButton = document.getElementById('predict-button');
    const boardSize = 5;
    const totalCells = boardSize * boardSize;
    let minesInitialized = false;

    // --- Элементы секции Авиатор ---
    const aviatorSection = document.getElementById('aviator-section');
    const aviatorResultSpan = document.getElementById('aviator-result');
    const aviatorTimerSpan = document.getElementById('aviator-timer');
    let aviatorUpdateIntervalId = null;
    let aviatorDisplayIntervalId = null;
    let aviatorNextUpdateTimestamp = 0;
    const AVIATOR_INTERVAL = 20000;
    let currentAviatorValue = "1.00x"; // Храним текущее значение Авиатора

    // --- Логика обновления шапки ---
    function updateHeaderContent(sectionId) {
        if (!headerContentContainer) return;

        let headerHTML = '';

        switch (sectionId) {
            case 'mines':
                headerHTML = '<img src="logo.png" alt="1win x Mines Logo" class="header-logo">';
                break;
            case 'aviator':
                 // ---- ИЗМЕНЕНИЕ ЗДЕСЬ: Добавляем ID ----
                headerHTML = '<img src="header-aviator-logo.png" alt="Aviator Logo" class="header-logo" id="header-aviator-img">';
                break;
            case 'settings':
                headerHTML = '<h1 id="header-text">Настройки</h1>';
                break;
        }
        headerContentContainer.innerHTML = headerHTML;
    }


    // --- Логика навигации ---
    function showSection(sectionId) {
        stopAviatorTimer();
        contentSections.forEach(section => section.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active-nav'));
        updateHeaderContent(sectionId);

        const targetSection = document.getElementById(sectionId + '-section');
        const targetNavItem = document.querySelector(`.nav-item a[data-section="${sectionId}"]`)?.closest('.nav-item');

        if (targetSection) {
             setTimeout(() => {
                 targetSection.classList.add('active');
                 if (sectionId === 'mines') {
                     initMines();
                 } else if (sectionId === 'aviator') {
                     startAviator();
                 }
             }, 10);
        } else { console.error("Секция не найдена:", sectionId + '-section'); }

        if (targetNavItem) {
            targetNavItem.classList.add('active-nav');
        } else { console.error("Пункт навигации не найден для секции:", sectionId); }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('data-section');
            if (!link.closest('.nav-item').classList.contains('active-nav')) {
                 showSection(sectionId);
            }
        });
    });

    // --- Логика для секции Мины ---
    function createBoard() {
        if (!gameBoard) return;
        gameBoard.innerHTML = '';
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            gameBoard.appendChild(cell);
        }
        console.log('Поле "Мины" создано/обновлено.');
    }

    function generatePrediction() {
        if (!minesSection.classList.contains('active') || !gameBoard || !mineCountSelect) return;
        console.log('Генерация прогноза для Мин...');
        const numMines = parseInt(mineCountSelect.value);
        const cells = gameBoard.querySelectorAll('.cell');

        cells.forEach(cell => cell.classList.remove('mine-predicted'));

        const mineIndices = new Set();
        while (mineIndices.size < numMines && mineIndices.size < totalCells) {
            const randomIndex = Math.floor(Math.random() * totalCells);
            mineIndices.add(randomIndex);
        }

        let delay = 0;
        mineIndices.forEach(index => {
            if (cells[index]) {
                 setTimeout(() => {
                    if (minesSection.classList.contains('active') && cells[index]) {
                         cells[index].classList.add('mine-predicted');
                    }
                 }, delay);
                 delay += 30;
            }
        });
        console.log(`Прогноз для Мин (${numMines} мин) сгенерирован.`);
    }

    function initMines() {
        if (minesInitialized || !minesSection.classList.contains('active')) return;
        console.log('Инициализация секции "Мины"...');
        createBoard();

        if (predictButton && mineCountSelect) {
           if (!predictButton.hasAttribute('data-listener-added')) {
                predictButton.addEventListener('click', generatePrediction);
                predictButton.setAttribute('data-listener-added', 'true');
           }
           if (!mineCountSelect.hasAttribute('data-listener-added')) {
               mineCountSelect.addEventListener('change', () => {
                 if (gameBoard) {
                    const cells = gameBoard.querySelectorAll('.cell');
                    cells.forEach(cell => cell.classList.remove('mine-predicted'));
                 }
               });
               mineCountSelect.setAttribute('data-listener-added', 'true');
           }
            minesInitialized = true;
        } else { console.error('Элементы управления Мин не найдены!'); }
    }

    // --- Логика для секции Авиатор ---

    function updateAviatorTimerDisplay() {
        if (!aviatorSection.classList.contains('active') || !aviatorTimerSpan) return;
        const now = Date.now();
        const timeLeft = Math.max(0, aviatorNextUpdateTimestamp - now);
        const secondsLeft = (timeLeft / 1000).toFixed(1);
        aviatorTimerSpan.textContent = `${secondsLeft}s`;
    }

    function updateAviatorValue() {
        if (!aviatorResultSpan) return;
        const randomNumber = (Math.random() * (1000 - 1) + 1).toFixed(2);
        currentAviatorValue = `${randomNumber}x`;

        aviatorResultSpan.classList.add('updating');
        setTimeout(() => {
            aviatorResultSpan.textContent = currentAviatorValue;
            aviatorResultSpan.classList.remove('updating');
            console.log(`Авиатор обновлен: ${currentAviatorValue}`);
        }, 150);
    }

    function triggerAviatorUpdate() {
        if (!aviatorSection.classList.contains('active')) {
            stopAviatorTimer(); return;
        }
        updateAviatorValue();
        aviatorNextUpdateTimestamp = Date.now() + AVIATOR_INTERVAL;
        updateAviatorTimerDisplay();
        console.log('Запланировано следующее обновление Авиатора.');
    }

    function startAviator() {
        if (!aviatorSection.classList.contains('active')) return;
        console.log('Запуск секции "Авиатор"...');
        stopAviatorTimer();

        if (aviatorResultSpan) {
            aviatorResultSpan.textContent = currentAviatorValue;
            aviatorResultSpan.style.animation = 'none';
            void aviatorResultSpan.offsetWidth;
            aviatorResultSpan.style.animation = 'popIn 0.3s ease-out forwards';
        }

        if (Date.now() >= aviatorNextUpdateTimestamp) {
             aviatorNextUpdateTimestamp = Date.now() + AVIATOR_INTERVAL;
             // Если время уже прошло, можно обновить значение сразу при старте
             // updateAviatorValue(); // Раскомментировать, если нужно обновлять сразу, если время вышло
        }

        aviatorUpdateIntervalId = setInterval(triggerAviatorUpdate, AVIATOR_INTERVAL);
        aviatorDisplayIntervalId = setInterval(updateAviatorTimerDisplay, 100);
        updateAviatorTimerDisplay();
        console.log(`Таймеры Авиатора запущены. Следующее обновление около ${new Date(aviatorNextUpdateTimestamp).toLocaleTimeString()}`);
    }

    function stopAviatorTimer() {
        if (aviatorUpdateIntervalId) { clearInterval(aviatorUpdateIntervalId); aviatorUpdateIntervalId = null; }
        if (aviatorDisplayIntervalId) { clearInterval(aviatorDisplayIntervalId); aviatorDisplayIntervalId = null; }
         console.log('Таймеры Авиатора остановлены.');
    }

    // --- Инициализация при загрузке ---
    const initialActiveSectionElement = document.querySelector('.content-section.active');
    let initialSectionId = 'mines';
    if (initialActiveSectionElement) { initialSectionId = initialActiveSectionElement.id.replace('-section', ''); }

    updateHeaderContent(initialSectionId);

    setTimeout(() => {
        if (initialSectionId === 'mines') { initMines(); }
        else if (initialSectionId === 'aviator') { startAviator(); }
    }, 50);

}); // Конец DOMContentLoaded