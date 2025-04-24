// --- START OF FILE games/game_menu.js ---

// This script runs INSIDE the main Moby app's games iframe (games/game_menu.html).
// It manages the game selection menu and loads specific game HTML files into its *own* internal iframe.

document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors (within this iframe: game_menu.html) ---
    const gameMenuContainer = document.querySelector('.game-menu-container'); // Main container for this iframe's content
    const gameSelectionContainer = gameMenuContainer?.querySelector('.game-selection-container'); // Container for buttons
    const gameSelectionButtons = gameSelectionContainer?.querySelectorAll('.game-selection button'); // Select ALL buttons
    const gameAreaWrapper = gameMenuContainer?.querySelector('.game-area-wrapper'); // Area for sub-views

    // Game Sub-Views (within gameAreaWrapper)
    const gameContentContainer = gameAreaWrapper?.querySelector('#game-content-container'); // Placeholder & Internal Iframe View
    const leaderboardView = gameAreaWrapper?.querySelector('#leaderboard-view'); // Leaderboard View
    const wordOfDayView = gameAreaWrapper?.querySelector('#word-of-day-view'); // Word of Day View

    // Elements within specific Game Sub-Views
    const gamePlaceholderText = gameContentContainer?.querySelector('.placeholder-text');
    const gameIframe = gameContentContainer?.querySelector('#game-iframe'); // This is the *internal* iframe that loads specific game HTML
    const backToMenuBtnLeaderboard = leaderboardView?.querySelector('#back-to-menu-btn-leaderboard'); // Back button in Leaderboard
    const leaderboardListElement = leaderboardView?.querySelector('.leaderboard-list');

    // Word of Day elements
    const backToMenuBtnWordDay = wordOfDayView?.querySelector('#back-to-menu-btn-word-day'); // Back button in Word of Day view
    const wordOfDayInput = wordOfDayView?.querySelector('#word-of-day-input');
    const checkWordButton = wordOfDayView?.querySelector('#check-word-btn');
    const wordOfDayMessageElement = wordOfDayView?.querySelector('#word-of-day-message');


     // Levels data for Word Find (needed to calculate coins before sending to parent)
     // This data is needed here because game over messages come from the internal iframe to *this* script.
     const WORD_FIND_LEVELS = [
         { level: 1, letters: ['Н', 'С', 'О'], words: ["НОС", "СОН"] },
         { level: 2, letters: ['С', 'Ь', 'О', 'Л'], words: ["ОСЬ", "СОЛЬ", "ЛОСЬ"] },
         { level: 3, letters: ['Б', 'У', 'К', 'В', 'А', 'С'], words: ["БУКВА", "БАК", "ВКУС"] },
         { level: 4, letters: ['П', 'О', 'Б', 'Е', 'Д', 'А', 'Я'], words: ["ПОБЕДА", "БЕДА", "ОБЕД", "ЯБЕДА"] }
     ];

    // --- Critical Element Check ---
     let allElementsFound = true;
     const essentialSelectors = [
         gameMenuContainer, gameSelectionContainer, gameSelectionButtons, gameSelectionButtons?.length > 0, gameAreaWrapper,
         gameContentContainer, gamePlaceholderText, gameIframe, leaderboardView, wordOfDayView,
         backToMenuBtnLeaderboard, leaderboardListElement, backToMenuBtnWordDay, wordOfDayInput,
         checkWordButton, wordOfDayMessageElement
     ];

     essentialSelectors.forEach((el, index) => {
         if (!el) {
             console.error(`Критическая ошибка (game_menu.js): Не найден обязательный элемент (индекс проверки ${index}). Проверьте HTML структуру game_menu.html и ID.`);
             allElementsFound = false;
         }
     });

     if (!allElementsFound) {
         console.error("game_menu.js: Critical elements missing. Stopping initialization.");
         // Optionally display an error message within the iframe
         if (gameAreaWrapper) gameAreaWrapper.innerHTML = "<p style='text-align:center; color:red;'>Ошибка загрузки меню игр.</p>";
         return; // Stop execution
     }


    // --- Core Functions ---

    // Function to switch between sub-views within game-area-wrapper
    // Handles visibility and display of sub-views.
    function showGamesSubView(viewId) {
        console.log("game_menu.js: Switching games sub-view to:", viewId);

        const subViews = gameAreaWrapper.querySelectorAll('.game-sub-view');

        // Hide all sub-views first by removing visible class (for transition)
        subViews.forEach(view => view.classList.remove('visible'));

        // Set display to none after a slight delay to allow transition out
         subViews.forEach(view => view.style.display = 'none');


        let targetViewElement = null;

        // Determine target element based on viewId
        switch (viewId) {
            case 'placeholder':
                 targetViewElement = gameContentContainer;
                 // placeholder is shown inside gameContentContainer
                 if (gamePlaceholderText) gamePlaceholderText.style.display = 'block';
                 // Ensure internal game iframe is hidden and cleared
                 if (gameIframe) { gameIframe.style.display = 'none'; gameIframe.src = 'about:blank'; } // Clear internal iframe
                 // Ensure button container is visible
                 if (gameSelectionContainer) gameSelectionContainer.style.display = 'flex';
                 break;
            case 'iframe':
                 targetViewElement = gameContentContainer;
                 // iframe visibility is handled by loadGameIntoInternalIframe
                 if (gamePlaceholderText) gamePlaceholderText.style.display = 'none';
                 // Hide button container when game is running
                 if (gameSelectionContainer) gameSelectionContainer.style.display = 'none';
                 break;
            case 'leaderboard':
                 targetViewElement = leaderboardView;
                 populateLeaderboard(); // Re-populate leaderboard when showing
                 if (leaderboardListElement) leaderboardListElement.scrollTop = 0; // Scroll to top
                 // Hide button container
                 if (gameSelectionContainer) gameSelectionContainer.style.display = 'none';
                break;
            case 'word-of-day': // Word of Day view
                 targetViewElement = wordOfDayView;
                 // Reset word of day input/message when showing
                 if (wordOfDayInput) wordOfDayInput.value = '';
                 if (wordOfDayMessageElement) {
                     wordOfDayMessageElement.textContent = '';
                     wordOfDayMessageElement.className = 'word-message'; // Reset classes
                 }
                 // Hide button container
                 if (gameSelectionContainer) gameSelectionContainer.style.display = 'none';
                 break;
            default:
                console.error("game_menu.js: Unknown game sub-view ID:", viewId);
                showGamesSubView('placeholder'); // Fallback
                return;
        }

        if (targetViewElement) {
            targetViewElement.style.display = 'flex'; // Use flex for sub-views layout
             requestAnimationFrame(() => {
                 setTimeout(() => {
                     targetViewElement.classList.add('visible'); // Start fade in
                 }, 10);
             });
             // Ensure the main iframe body is scrolled to the top if content overflows
             document.body.scrollTop = 0;
             document.documentElement.scrollTop = 0;
        }
    }


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
            coinImg.src = '../moneta.png'; // Ensure path is correct relative to games/
            coinImg.alt = 'coins';
            coinImg.className = 'coin-icon';
            scoreSpan.appendChild(coinImg);

            item.appendChild(rankSpan);
            item.appendChild(nameSpan);
            item.appendChild(scoreSpan);
            leaderboardListElement.appendChild(item);
        });
    }

    // Load a specific game HTML file into the *internal* iframe (#game-iframe)
    // This makes the game take over the view area within game_menu.html
    function loadGameIntoInternalIframe(gameId) {
        let gameUrl = '';
        // --- Paths to game HTML files (relative to game_menu.html) ---
        switch (gameId) {
            case 'block_blast': gameUrl = 'block_blast/block_blast.html'; break; // e.g., games/block_blast/block_blast.html
            case 'match_3': gameUrl = 'match_3/match_3.html'; break;
            case 'word_find': gameUrl = 'word_find/word_find.html'; break;
            default:
                console.warn('game_menu.js: Unknown game ID for internal iframe:', gameId);
                showGamesSubView('placeholder'); // Show placeholder if game unknown
                return;
        }
        // --- End Path Definition ---

        if (gameUrl && gameIframe) {
            console.log('game_menu.js: Loading game into internal iframe:', gameUrl);
            showGamesSubView('iframe'); // Switch to the iframe view (hides placeholder, sets display: flex)
            gameIframe.style.display = 'block'; // Ensure iframe is visible inside the flex container
            gameIframe.src = gameUrl; // Load the selected game
            // Button activation is handled by the click listener calling this function
        } else {
             console.error("game_menu.js: Cannot load game: internal iframe element missing or game URL invalid.");
             showGamesSubView('placeholder'); // Fallback
        }
    }

    // NEW: Word of Day Logic
    function handleCheckWord() {
        if (!wordOfDayInput || !wordOfDayMessageElement) return;

        const inputWord = wordOfDayInput.value.trim().toUpperCase();
        const correctWord = "ХАЛВА";

        wordOfDayMessageElement.textContent = ''; // Clear previous message
        wordOfDayMessageElement.className = 'word-message'; // Reset classes

        if (inputWord === correctWord) {
            wordOfDayMessageElement.textContent = "Твой шоколад в пути)";
            wordOfDayMessageElement.classList.add('success'); // Add success class for styling
            // Optionally clear input after success
            // wordOfDayInput.value = '';
            // Add logic here to give the user coins, e.g.:
            sendCoinUpdateToParent(15); // Example: give 15 coins for the word of the day
            console.log("game_menu.js: Word of Day correct! Sending coins to parent.");
        } else {
            wordOfDayMessageElement.textContent = "Неправильное слово. Попробуйте еще.";
            wordOfDayMessageElement.classList.add('error'); // Add error class for styling
             console.log("game_menu.js: Word of Day incorrect.");
        }
    }

    // Helper to deactivate all game selection buttons in this menu iframe
    function deactivateAllGameButtons() {
        gameSelectionButtons?.forEach(btn => btn.classList.remove('active'));
    }

    // Helper to send message to the parent window (main Moby app)
    function sendMessageToParent(messageData) {
        // Check if parent exists and is not self (when not in iframe)
        if (window.parent && window.parent !== window) {
            // Use postMessage with the target origin set to the parent's origin
            // For simplicity here, using '*' which is less secure.
            // In production, get the parent's origin safely: new URL(document.referrer).origin or window.location.origin
            window.parent.postMessage(messageData, '*');
            // console.log("game_menu.js: Sent message to parent:", messageData);
        } else {
            console.warn("game_menu.js: No parent window found to send message:", messageData);
        }
    }

    // Example: Send coins to parent (Called from game logic or here)
    function sendCoinUpdateToParent(coins) {
         if (coins > 0) {
             sendMessageToParent({ type: 'addCoins', coins: coins });
         }
    }


    // --- Event Listeners for Game Selection Buttons ---
    gameSelectionButtons?.forEach(button => {
        button.addEventListener('click', (event) => {
            const clickedButton = event.currentTarget;
            const gameId = clickedButton.dataset.game; // Get game ID from data-game attribute

            deactivateAllGameButtons(); // Deactivate others
            clickedButton.classList.add('active'); // Activate clicked button

            // Determine which view/action based on the button
            if (gameId) {
                // It's a button for a specific game HTML file
                loadGameIntoInternalIframe(gameId); // Load the selected game into the *internal* iframe
            } else if (clickedButton.id === 'show-leaderboard-btn') {
                // It's the leaderboard button
                showGamesSubView('leaderboard'); // Switch to leaderboard view
            } else if (clickedButton.id === 'word-of-day-btn') {
                // It's the word of day button
                showGamesSubView('word-of-day'); // Switch to word of day view
            } else {
                console.warn("game_menu.js: Clicked unknown button in game selection:", clickedButton);
                showGamesSubView('placeholder'); // Fallback to menu
            }
        });
    });

    // Event Listeners for Back Buttons within Sub-views
    backToMenuBtnLeaderboard?.addEventListener('click', () => {
         showGamesSubView('placeholder'); // Back from Leaderboard to Placeholder
         deactivateAllGameButtons(); // Clear active button state
    });

    // NEW: Event Listener for Back Button in Word of Day view
    backToMenuBtnWordDay?.addEventListener('click', () => {
         showGamesSubView('placeholder'); // Back from Word of Day to Placeholder
         deactivateAllGameButtons(); // Clear active button state
    });

    // NEW: Event Listeners for Word of Day Input and Button
    checkWordButton?.addEventListener('click', handleCheckWord);
    wordOfDayInput?.addEventListener('keypress', (event) => {
        // Check if the pressed key is 'Enter'
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            handleCheckWord();
        }
    });

     // --- Listener for messages *from* the internal game iframe (#game-iframe) ---
     // This receives messages from the actual game HTML files (block_blast.html, etc.)
     window.addEventListener('message', (event) => {
          // SECURITY: Check event.origin in production!
           // For development, allow any origin from within this iframe
           // if (!event.origin.startsWith(window.location.origin)) { // Basic check
           //      console.warn('game_menu.js: Message ignored, origin mismatch from internal game:', event.origin);
           //      return;
           // }

          // Only process messages from the internal game iframe if it exists and is the source
           if (!gameIframe || !gameIframe.contentWindow || event.source !== gameIframe.contentWindow) {
               // console.warn("game_menu.js: Ignoring message from unexpected source or before iframe ready.");
               return;
           }


          const eventData = event.data;
           console.log("game_menu.js: Received message from internal game iframe:", eventData);

          // Handle 'gameOver' message from a specific game (e.g., Block Blast, Match 3, Word Find)
          if (eventData && eventData.type === 'gameOver') {
              const score = eventData.score || 0;
              const gameName = eventData.game || 'Unknown Game';
              const gameLetters = eventData.letters; // For Word Find

              let coinsEarned = eventData.coins || 0; // Game might calculate coins itself

              // If game didn't send coins, calculate based on score/gameName
              if (coinsEarned === 0) {
                  switch (gameName) {
                      case 'block_blast': coinsEarned = Math.floor(score / 150); break;
                      case 'match_3': coinsEarned = Math.floor(score / 20); break;
                      case 'word_find':
                           // Find the level data based on the letters
                           const levelData = WORD_FIND_LEVELS.find(level => level.letters.join('').toUpperCase() === gameLetters?.toUpperCase());
                           const totalWords = levelData?.words.length || 0;
                           const completedLevel = totalWords > 0 && score === totalWords;
                           coinsEarned = score * 10 + (completedLevel ? 50 : 0);
                           break;
                      default: coinsEarned = Math.floor(score / 100); // Default coin calculation
                   }
               }
               coinsEarned = Math.max(0, coinsEarned); // Ensure non-negative coins

              // Send the coins and game details back to the main app (parent window)
               // Sending both 'addCoins' and 'gameOver' allows parent to update coins immediately
               // and also show a game-specific alert/message.
               if (coinsEarned > 0) {
                   sendMessageToParent({ type: 'addCoins', coins: coinsEarned }); // Send coins
               }
               sendMessageToParent({ type: 'gameOver', game: gameName, score: score, coins: coinsEarned }); // Send game over + score/coins


               // After a game finishes, return to the menu view in this iframe
               showGamesSubView('placeholder');
               deactivateAllGameButtons(); // Ensure buttons are reset
          }

           // Handle 'showMenu' message from a game (e.g., a game's internal back button)
           if (eventData && eventData.type === 'showMenu') {
               console.log("game_menu.js: Internal game sent 'showMenu'. Switching to placeholder.");
               showGamesSubView('placeholder'); // Switch back to the menu placeholder
               deactivateAllGameButtons(); // Ensure buttons are reset
           }

     });


    // --- Initialization ---
    showGamesSubView('placeholder'); // Show the placeholder/menu initially when this script loads
    deactivateAllGameButtons(); // Ensure no buttons are active on load
}); // --- End of DOMContentLoaded ---
// --- END OF FILE games/game_menu.js ---