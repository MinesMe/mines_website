// --- START OF FILE script.js ---

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const mainContent = document.getElementById('main-content');
    const contentPages = { // Map of page IDs to elements
        'home-content': document.getElementById('home-content'),
        'products-content': document.getElementById('products-content'),
        'payments-content': document.getElementById('payments-content'),
        'history-content': document.getElementById('history-content'),
        'halva-club-page': document.getElementById('halva-club-page'), // Split View
        'shop-page-content': document.getElementById('shop-page-content'), // Partner Street
        'games-page-content': document.getElementById('games-page-content'), // Games Page
        'blank-screen': document.getElementById('blank-screen') // Fallback/Dev Screen
    };

    // Navigation & Global Buttons
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const notificationBell = document.getElementById('notification-bell');
    const notificationModalOverlay = document.getElementById('notification-modal-overlay');

    // Home Page Elements
    const balanceAmountElement = document.getElementById('balance-amount');
    const toggleBalanceButton = document.getElementById('toggle-balance-visibility');

    // Halva Club Split View Elements
    const shopSplitSection = document.getElementById('shop-split-section');
    const gamesSplitSection = document.getElementById('games-split-section');

    // Partner Street Page Elements
    const shopPageContent = contentPages['shop-page-content']; // Convenience reference
    const backToSplitViewButton = document.getElementById('back-to-split-view');
    const partnerLogos = shopPageContent?.querySelectorAll('.partner-logo');
    const partnerOfferPopup = shopPageContent?.querySelector('#partner-offer-popup');
    const offerTitleElement = shopPageContent?.querySelector('#offer-title');
    const offerDetailsElement = shopPageContent?.querySelector('#offer-details');
    const closeOfferPopupButton = shopPageContent?.querySelector('#close-offer-popup');
    const coinCountElement = shopPageContent?.querySelector('.coin-balance .coin-count'); // Selector for coin display

    // Games Page Elements
    const gamesPageContent = contentPages['games-page-content']; // Convenience reference
    const backToSplitViewFromGamesButton = document.getElementById('back-to-split-view-from-games');
    const gameSelectionContainer = gamesPageContent?.querySelector('.game-selection');
    const gameAreaWrapper = gamesPageContent?.querySelector('.game-area-wrapper');
    const gameContentContainer = gameAreaWrapper?.querySelector('#game-content-container');
    const gamePlaceholderText = gameContentContainer?.querySelector('.placeholder-text');
    const gameIframe = gameContentContainer?.querySelector('#game-iframe');
    const leaderboardView = gameAreaWrapper?.querySelector('#leaderboard-view');
    const showLeaderboardButton = gamesPageContent?.querySelector('#show-leaderboard-btn');
    const backToGamesButton = leaderboardView?.querySelector('#back-to-games-btn');
    const gameSelectionButtons = gameSelectionContainer?.querySelectorAll('button[data-game]'); // Select only game buttons
    const leaderboardListElement = leaderboardView?.querySelector('.leaderboard-list');


    // --- State Variables ---
    const originalBalanceText = '5 000,00 BYN';
    const hiddenBalanceText = '••••• BYN';
    let isBalanceVisible = false; // Default to hidden as per initial icon
    let currentlyOpenLogo = null; // Track which partner logo is 'open'
    let userCoins = 17; // Example initial coins, matching HTML
    const VISIBLE_CLASS = 'visible'; // CSS class for visibility transitions

    // --- Critical Element Check ---
    let allElementsFound = true;
    // Check page containers
    for (const key in contentPages) {
        if (!contentPages[key]) {
            console.error(`Критическая ошибка: Элемент страницы #${key} не найден.`);
            allElementsFound = false;
        }
    }
    // Check essential interactive elements
    const essentialSelectors = [
        mainContent, navItems, navItems?.length > 0, notificationBell, notificationModalOverlay,
        balanceAmountElement, toggleBalanceButton, shopSplitSection, gamesSplitSection,
        backToSplitViewButton, backToSplitViewFromGamesButton, partnerLogos, partnerLogos?.length > 0,
        partnerOfferPopup, offerTitleElement, offerDetailsElement, closeOfferPopupButton, coinCountElement,
        gameAreaWrapper, gameContentContainer, gamePlaceholderText, gameIframe, leaderboardView,
        showLeaderboardButton, backToGamesButton, gameSelectionButtons, gameSelectionButtons?.length > 0,
        leaderboardListElement
    ];
    essentialSelectors.forEach((el, index) => {
        if (!el) {
            // Provide a more specific error message if possible based on index or element name
            console.error(`Критическая ошибка: Не найден обязательный элемент (индекс проверки ${index}). Проверьте HTML структуру и ID.`);
            allElementsFound = false;
        }
    });
    if (!allElementsFound) {
        alert("Ошибка инициализации приложения: Не найдены критические элементы интерфейса. Пожалуйста, проверьте консоль разработчика (F12) для детальной информации.");
        return; // Stop execution if critical elements are missing
    }

    // --- Core Functions ---

    // Switch visible page content
    function switchContent(targetId) {
        console.log("Switching view to:", targetId);
        let targetFound = false;

        // Hide all pages first
        for (const id in contentPages) {
            const page = contentPages[id];
            if (page) {
                page.style.display = 'none'; // Hide immediately
                page.classList.remove(VISIBLE_CLASS); // Remove class for transition out
            }
        }

        const targetElement = contentPages[targetId];
        if (targetElement) {
            targetFound = true;
            // Determine display style based on page type
            let displayStyle = 'block'; // Default for standard pages
            if (targetId === 'home-content') {
                 // Home page is special, doesn't use absolute positioning like others
                 displayStyle = 'block'; // Or 'flex' if its internal layout needs it
            } else if (['halva-club-page', 'shop-page-content', 'games-page-content', 'blank-screen'].includes(targetId)) {
                displayStyle = 'flex'; // Use flex for overlay pages
            } else {
                 // Other pages like products, payments, history might need block if they are simple containers
                 displayStyle = 'block';
            }

            targetElement.style.display = displayStyle; // Set display before adding class

            // Trigger transition by adding class after a tiny delay
            // For home, no transition is needed as it's always 'there' conceptually
            if (targetId !== 'home-content') {
                 requestAnimationFrame(() => {
                     setTimeout(() => {
                         targetElement.classList.add(VISIBLE_CLASS);
                     }, 10); // Small delay helps ensure display:flex/block is applied first
                 });
            } else {
                 targetElement.classList.add(VISIBLE_CLASS); // Ensure home always has visible class if switching back
            }


            // Reset specific page states when navigating to them
            if (targetId === 'games-page-content') resetGameSelection();
            if (targetId === 'shop-page-content') {
                hidePartnerOffer(); // Close any open offer popup
                const street = targetElement.querySelector('.vertical-partner-street');
                if (street) street.scrollTop = 0; // Scroll partner list to top
            }

        } else {
            // Fallback if target page doesn't exist
            console.warn("Target page element not found:", targetId, ". Showing blank screen.");
            const fallbackScreen = contentPages['blank-screen'];
            if (fallbackScreen) {
                fallbackScreen.style.display = 'flex';
                requestAnimationFrame(() => { setTimeout(() => { fallbackScreen.classList.add(VISIBLE_CLASS); }, 10); });
            }
        }

        // Scroll main container to top (useful if pages have different heights)
        if (mainContent) mainContent.scrollTop = 0;

        return targetFound;
    }

    // Update coin display (called after game ends)
    function updateUserCoins(newCoins) {
        userCoins = newCoins;
        if (coinCountElement) {
            coinCountElement.textContent = userCoins;
        }
        // Here you might also save to localStorage or send to a server in a real app
        console.log("User coins updated to:", userCoins);
    }

    // Toggle balance visibility on Home page
    function updateBalanceVisibility() {
        const iconElement = toggleBalanceButton;
        if (isBalanceVisible) {
            // Ensure firstChild is a text node before modifying
            if (balanceAmountElement.firstChild && balanceAmountElement.firstChild.nodeType === Node.TEXT_NODE) {
                 balanceAmountElement.firstChild.nodeValue = originalBalanceText + ' ';
            } else { // Fallback if structure changes
                 balanceAmountElement.innerHTML = `${originalBalanceText} <i id="toggle-balance-visibility" class="fas fa-eye"></i>`;
                 // Re-select the button if innerHTML was used
                 // toggleBalanceButton = document.getElementById('toggle-balance-visibility');
            }
            iconElement?.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            if (balanceAmountElement.firstChild && balanceAmountElement.firstChild.nodeType === Node.TEXT_NODE) {
                balanceAmountElement.firstChild.nodeValue = hiddenBalanceText + ' ';
            } else {
                 balanceAmountElement.innerHTML = `${hiddenBalanceText} <i id="toggle-balance-visibility" class="fas fa-eye-slash"></i>`;
                 // Re-select the button if innerHTML was used
                 // toggleBalanceButton = document.getElementById('toggle-balance-visibility');
            }
             iconElement?.classList.replace('fa-eye', 'fa-eye-slash');
        }
    }

    // --- Navigation Logic ---

    // Bottom Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) {
                 console.error("Navigation item missing data-target attribute.");
                 return;
            }
            // Prevent unnecessary action if already active or target invalid
            if (item.classList.contains('active') || !contentPages[targetId]) {
                 if (!contentPages[targetId]) {
                      console.error(`Target content page with ID "${targetId}" not found.`);
                      // Optionally switch to blank screen as fallback
                      switchContent('blank-screen');
                      navItems.forEach(i => i.classList.remove('active'));
                      // Potentially mark a default item as active or none
                 }
                 return;
            }

            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            switchContent(targetId);
        });
    });

    // Halva Club Split View Navigation
    function navigateFromHalva(targetPageId) {
        const halvaPage = contentPages['halva-club-page'];
        const targetPage = contentPages[targetPageId];
        if (!halvaPage || !targetPage) {
             console.error("Error navigating from Halva: Page element missing.");
             return;
        }

        halvaPage.classList.remove(VISIBLE_CLASS); // Start fade out
        setTimeout(() => { // Wait for fade out before hiding and showing next
            halvaPage.style.display = 'none';
            targetPage.style.display = 'flex'; // Set display before fade in
            requestAnimationFrame(() => {
                 setTimeout(() => {
                     targetPage.classList.add(VISIBLE_CLASS); // Start fade in
                 }, 10);
            });
            // Reset state of the target page
            if (targetPageId === 'shop-page-content') hidePartnerOffer();
            else if (targetPageId === 'games-page-content') resetGameSelection();
        }, 300); // Match transition duration

        if (mainContent) mainContent.scrollTop = 0;
    }

    function navigateToHalva(sourcePageId) {
        const sourcePage = contentPages[sourcePageId];
        const halvaPage = contentPages['halva-club-page'];
        if (!sourcePage || !halvaPage) {
            console.error("Error navigating to Halva: Page element missing.");
            return;
        }

        sourcePage.classList.remove(VISIBLE_CLASS); // Start fade out
        setTimeout(() => { // Wait for fade out
            sourcePage.style.display = 'none';
            halvaPage.style.display = 'flex'; // Set display before fade in
            requestAnimationFrame(() => {
                setTimeout(() => {
                    halvaPage.classList.add(VISIBLE_CLASS); // Start fade in
                }, 10);
            });
        }, 300); // Match transition duration

        if (mainContent) mainContent.scrollTop = 0;
    }

    // --- Event Listeners Setup ---

    // Balance Toggle
    toggleBalanceButton?.addEventListener('click', () => {
        isBalanceVisible = !isBalanceVisible;
        updateBalanceVisibility();
    });

    // Halva Club Navigation
    shopSplitSection?.addEventListener('click', () => navigateFromHalva('shop-page-content'));
    gamesSplitSection?.addEventListener('click', () => navigateFromHalva('games-page-content'));
    backToSplitViewButton?.addEventListener('click', () => navigateToHalva('shop-page-content'));
    backToSplitViewFromGamesButton?.addEventListener('click', () => navigateToHalva('games-page-content'));

    // Notification Modal
    function openNotificationModal() { notificationModalOverlay.classList.add(VISIBLE_CLASS); }
    function closeNotificationModal() { notificationModalOverlay.classList.remove(VISIBLE_CLASS); }
    notificationBell?.addEventListener('click', openNotificationModal);
    notificationModalOverlay?.addEventListener('click', (event) => {
        // Close only if clicking the overlay itself, not the content inside
        if (event.target === notificationModalOverlay) closeNotificationModal();
    });

    // --- Partner Street Logic ---
    const partnerOffers = {
        'ozby': { title: 'Скидка 15% на книги в OZ.by', details: 'Введите промокод MOBYREAD при заказе книг на сумму от 30 BYN.' },
        'dodo': { title: 'Вторая пицца за 1 BYN', details: 'Закажите большую пиццу в Додо Пицца и получите вторую (меньшего размера) всего за 1 рубль при оплате картой "Халва".' },
        'belpost': { title: 'Скидка 10% на все блюда', details: 'Скидка 10% на все позиции при оплате картой "Халва".' },
        'letu': { title: 'Подарок при покупке в Л\'Этуаль', details: 'Получите миниатюру парфюма в подарок при покупке от 100 BYN по карте "Халва".' },
        'ozon': { title: 'Баллы Ozon за покупки', details: 'Получайте повышенные баллы Ozon при оплате заказов картой Moby.' }
    };

    function showPartnerOffer(partnerId, logoElement) {
        const offer = partnerOffers[partnerId];
        if (offer && offerTitleElement && offerDetailsElement && partnerOfferPopup) {
            // Close previously open logo if different
            if (currentlyOpenLogo && currentlyOpenLogo !== logoElement) {
                currentlyOpenLogo.classList.remove('open');
            }
            // Update popup content
            offerTitleElement.textContent = offer.title;
            offerDetailsElement.textContent = offer.details;
            // Show popup and mark logo as open
            partnerOfferPopup.classList.add(VISIBLE_CLASS);
            logoElement.classList.add('open');
            currentlyOpenLogo = logoElement;
        } else {
            console.warn("Нет данных/элементов для акции партнера:", partnerId);
             hidePartnerOffer(); // Hide popup if data missing
        }
    }

    function hidePartnerOffer() {
        partnerOfferPopup?.classList.remove(VISIBLE_CLASS);
        if (currentlyOpenLogo) {
            currentlyOpenLogo.classList.remove('open');
            currentlyOpenLogo = null;
        }
    }

    partnerLogos?.forEach(logo => {
        logo.addEventListener('click', (event) => {
            const clickedLogo = event.currentTarget;
            const partnerId = clickedLogo.dataset.partner;
            if (clickedLogo === currentlyOpenLogo) {
                hidePartnerOffer(); // Click again to close
            } else {
                showPartnerOffer(partnerId, clickedLogo); // Show new offer
            }
        });
    });

    closeOfferPopupButton?.addEventListener('click', hidePartnerOffer);

    // --- Games Page & Leaderboard Logic ---

    // Function to populate the leaderboard list dynamically
    function populateLeaderboard() {
        if (!leaderboardListElement) return;
        leaderboardListElement.innerHTML = ''; // Clear previous entries

        const topPlayers = [
            { rank: 1, icon: 'fas fa-crown', name: 'Александр Приходько', score: 15480 },
            { rank: 2, icon: 'fas fa-medal', name: 'Анастасия Данилевич', score: 14950 },
            { rank: 3, icon: 'fas fa-medal', name: 'Егор Олиферко', score: 14210 },
        ];
        const randomNames = [ "Мария Иванова", "Дмитрий Петров", "Елена Сидорова", "Андрей Кузнецов", "Ольга Смирнова", "Иван Васильев", "Светлана Попова", "Николай Соколов", "Татьяна Михайлова", "Сергей Новиков", "Наталья Фёдорова", "Алексей Морозов" ];
        const shuffledNames = [...randomNames].sort(() => 0.5 - Math.random());
        let leaderboardData = [...topPlayers];
        let baseScore = 13800;

        for (let i = 4; i <= 10; i++) {
            const score = baseScore - Math.floor(Math.random() * 400);
            leaderboardData.push({ rank: i, icon: null, name: shuffledNames[i - 4] || `Игрок ${i}`, score: score });
            baseScore = score;
        }

        leaderboardData.forEach(player => {
            const item = document.createElement('li');
            item.className = `leaderboard-item rank-${player.rank}`; // Add classes for styling

            const rankSpan = document.createElement('span');
            rankSpan.className = 'rank';
            rankSpan.textContent = player.rank; // Add rank number text first
            if (player.icon) {
                const icon = document.createElement('i');
                icon.className = player.icon; // Add icon classes (e.g., "fas fa-crown")
                rankSpan.appendChild(icon); // Append icon after number text
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            nameSpan.textContent = player.name;

            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'score';
            scoreSpan.textContent = player.score.toLocaleString('ru-RU') + ' '; // Format score

            const coinImg = document.createElement('img');
            coinImg.src = 'moneta.png'; // Ensure path is correct
            coinImg.alt = 'coins';
            coinImg.className = 'coin-icon';
            scoreSpan.appendChild(coinImg);

            item.appendChild(rankSpan);
            item.appendChild(nameSpan);
            item.appendChild(scoreSpan);
            leaderboardListElement.appendChild(item);
        });
    }

    // Show the leaderboard view
    function showLeaderboard() {
        if (!leaderboardView || !gameContentContainer || !leaderboardListElement) return;
        populateLeaderboard(); // Generate content
        gameContentContainer.classList.remove(VISIBLE_CLASS); // Hide game area
        gameContentContainer.style.display = 'none'; // Ensure display none
        leaderboardView.style.display = 'flex'; // Set display before transition
        requestAnimationFrame(() => { setTimeout(() => { leaderboardView.classList.add(VISIBLE_CLASS); }, 10); });
        gameSelectionButtons?.forEach(btn => btn.classList.remove('active')); // Deactivate game buttons
        showLeaderboardButton?.classList.add('active'); // Activate leaderboard button
        leaderboardListElement.scrollTop = 0; // Scroll to top
    }

    // Show the game content area (placeholder or iframe)
    function showGameArea() {
        if (!leaderboardView || !gameContentContainer) return;
        leaderboardView.classList.remove(VISIBLE_CLASS); // Hide leaderboard
        leaderboardView.style.display = 'none'; // Ensure display none
        gameContentContainer.style.display = 'flex'; // Set display before transition
        requestAnimationFrame(() => { setTimeout(() => { gameContentContainer.classList.add(VISIBLE_CLASS); }, 10); });
        showLeaderboardButton?.classList.remove('active'); // Deactivate leaderboard button
    }

    // Load a specific game into the iframe
    function loadGameIntoIframe(gameId) {
        let gameUrl = '';
        // --- CORRECTED PATHS based on user feedback ---
        switch (gameId) {
            case 'block_blast': gameUrl = 'games/block_blast/block_blast.html'; break;
            case 'match_3': gameUrl = 'games/match_3/match_3.html'; break;
            case 'word_find': gameUrl = 'games/word_find/word_find.html'; break;
            case 'word_of_the_day': gameUrl = 'games/word_of_the_day/word_of_the_day.html'; break;
            case 'referals': gameUrl = 'games/referals/referals.html'; break;
            default:
                console.warn('Unknown game ID for iframe:', gameId);
                resetGameSelection(); // Show placeholder if game unknown
                return;
        }
        // --- End Path Correction ---

        if (gameUrl && gameIframe && gamePlaceholderText && gameContentContainer) {
            console.log('Loading game into iframe:', gameUrl);
            showGameArea(); // Make sure game area is visible
            gamePlaceholderText.style.display = 'none'; // Hide placeholder
            gameIframe.src = gameUrl;
            gameIframe.style.display = 'block'; // Show iframe
        } else {
             console.error("Cannot load game: iframe or placeholder element missing.");
             resetGameSelection(); // Fallback
        }
    }

    // Reset the game area to show the placeholder text
    function resetGameSelection() {
        if (!gamePlaceholderText || !gameIframe || !gameContentContainer || !gameAreaWrapper) return;
        showGameArea(); // Ensure game area is visible, leaderboard hidden

        // Deactivate all game and leaderboard buttons
        gameSelectionButtons?.forEach(btn => btn.classList.remove('active'));
        showLeaderboardButton?.classList.remove('active');

        gamePlaceholderText.style.display = 'block'; // Show placeholder
        gameIframe.style.display = 'none'; // Hide iframe
        gameIframe.src = 'about:blank'; // Clear iframe content
    }

    // Event Listeners for Games Page
    showLeaderboardButton?.addEventListener('click', showLeaderboard);
    backToGamesButton?.addEventListener('click', resetGameSelection); // Back button returns to placeholder
    gameSelectionButtons?.forEach(button => {
        button.addEventListener('click', (event) => {
            const clickedButton = event.currentTarget;
            const gameId = clickedButton.dataset.game;
            if (!gameId) return;

            // Deactivate other buttons (incl. leaderboard)
            gameSelectionButtons.forEach(btn => btn.classList.remove('active'));
            showLeaderboardButton?.classList.remove('active');

            clickedButton.classList.add('active'); // Activate clicked button
            loadGameIntoIframe(gameId); // Load the selected game
        });
    });

    // --- Iframe Communication Listener ---
    window.addEventListener('message', (event) => {
        // SECURITY: Check event.origin in production!
        // Example: if (event.origin !== window.location.origin) return; // Simple check if games are same origin

        const eventData = event.data;
        if (eventData && eventData.type === 'gameOver') {
            console.log('Received game over message from iframe:', eventData);
            const score = eventData.score || 0;
            const gameName = eventData.game || 'Unknown Game';
            let coinsEarned = 0;

            // Customize coin logic per game
            switch (gameName) {
                case 'block_blast': coinsEarned = Math.floor(score / 150); break;
                case 'match_3': coinsEarned = Math.floor(score / 20); break;
                case 'word_find': coinsEarned = score * 2; break; // Example: 2 coins per word
                default: coinsEarned = Math.floor(score / 100);
            }
            coinsEarned = Math.max(0, coinsEarned); // Ensure non-negative coins

            if (coinsEarned > 0) {
                updateUserCoins(userCoins + coinsEarned);
                // Replace alert with a less intrusive notification if desired
                alert(`Игра "${gameName}" окончена!\nВаш счет: ${score}\nВы заработали ${coinsEarned} Халвинок!`);
            } else {
                alert(`Игра "${gameName}" окончена!\nВаш счет: ${score}`);
            }
            // Optional: Automatically navigate back after game over?
             // setTimeout(() => resetGameSelection(), 500); // e.g., back to placeholder
             // setTimeout(() => navigateToHalva('games-page-content'), 500); // e.g., back to split view
        }
    });

    // --- Initialization ---
    updateBalanceVisibility(); // Set initial balance visibility state
    if (coinCountElement) coinCountElement.textContent = userCoins; // Set initial coin display
    switchContent('home-content'); // Show home page initially
    navItems.forEach(item => item.classList.remove('active')); // Clear active state
    document.querySelector('.bottom-nav .nav-item[data-target="home-content"]')?.classList.add('active'); // Activate home nav item
    resetGameSelection(); // Set initial state for the game area


}); // --- End of DOMContentLoaded ---
// --- END OF FILE script.js ---