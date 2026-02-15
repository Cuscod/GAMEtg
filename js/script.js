// Emoji pairs for different difficulties
const emojis4x4 = [
    '🐶', '🐱', '🐭', '🐹',
    '🐰', '🦊', '🐻', '🐼'
];

const emojis6x6 = [
    '🐶', '🐱', '🐭', '🐹',
    '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐸', '🐙', '🦄',
    '🦋', '🐢', '🦎', '🦖',
    '🦕', '🦑'
];

// Game state
let gameState = {
    difficulty: null,
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    totalTime: 0,
    gameActive: false,
    timerInterval: null,
    emojis: []
};

// DOM Elements
const welcomeScreen = document.querySelector('.welcome-screen');
const gameScreen = document.querySelector('.game-screen');
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const completionPopup = document.getElementById('completionPopup');
const completionText = document.getElementById('completionText');
const difficultyButtons = document.querySelectorAll('.btn-difficulty');
const btnBack = document.getElementById('btnBack');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const btnChangeLevel = document.getElementById('btnChangeLevel');

// Initialize event listeners
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const difficulty = parseInt(e.target.dataset.difficulty);
        startGame(difficulty);
    });
});

btnBack.addEventListener('click', returnToMenu);
btnPlayAgain.addEventListener('click', () => restartGame());
btnChangeLevel.addEventListener('click', returnToMenu);

/**
 * Starts a new game with the specified difficulty
 */
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.cards = [];
    gameState.flipped = [];
    gameState.matched = [];
    gameState.moves = 0;
    gameState.totalTime = 0;
    gameState.gameActive = true;

    // Select emojis based on difficulty
    if (difficulty === 4) {
        gameState.emojis = [...emojis4x4];
    } else {
        gameState.emojis = [...emojis6x6];
    }

    // Create pairs and shuffle
    const pairs = gameState.emojis;
    gameState.cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);

    // Update UI
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.add('active');

    // Render game board
    renderBoard();

    // Reset displays
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';

    // Start timer
    startTimer();
}

/**
 * Renders the game board with all cards
 */
function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.className = `game-board grid-${gameState.difficulty}x${gameState.difficulty}`;

    gameState.cards.forEach((emoji, index) => {
        const card = document.createElement('button');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;

        // Add matched class if card is already matched
        if (gameState.matched.includes(index)) {
            card.classList.add('matched');
        }

        // Show emoji if card is flipped
        if (gameState.flipped.includes(index)) {
            card.classList.add('flipped');
            card.textContent = emoji;
        } else {
            card.textContent = '';
        }

        card.addEventListener('click', () => cardClick(index));
        gameBoard.appendChild(card);
    });
}

/**
 * Handles card click event
 */
function cardClick(index) {
    // Prevent clicks if game is not active or card is already processed
    if (!gameState.gameActive) return;
    if (gameState.flipped.includes(index)) return;
    if (gameState.matched.includes(index)) return;
    if (gameState.flipped.length >= 2) return;

    // Flip card
    gameState.flipped.push(index);
    renderBoard();

    // Check for match when two cards are flipped
    if (gameState.flipped.length === 2) {
        gameState.gameActive = false;
        gameState.moves++;
        movesDisplay.textContent = gameState.moves;

        setTimeout(() => {
            checkMatch();
        }, 500);
    }
}

/**
 * Checks if the two flipped cards match
 */
function checkMatch() {
    const [first, second] = gameState.flipped;
    const match = gameState.cards[first] === gameState.cards[second];

    if (match) {
        gameState.matched.push(first, second);
    }

    gameState.flipped = [];
    gameState.gameActive = true;
    renderBoard();

    // Check if game is complete
    if (gameState.matched.length === gameState.cards.length) {
        endGame();
    }
}

/**
 * Starts the game timer
 */
function startTimer() {
    gameState.totalTime = 0;
    gameState.timerInterval = setInterval(() => {
        gameState.totalTime++;
        const minutes = Math.floor(gameState.totalTime / 60);
        const seconds = gameState.totalTime % 60;
        timerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

/**
 * Stops the game timer
 */
function stopTimer() {
    clearInterval(gameState.timerInterval);
}

/**
 * Handles game completion
 */
function endGame() {
    gameState.gameActive = false;
    stopTimer();

    const minutes = Math.floor(gameState.totalTime / 60);
    const seconds = gameState.totalTime % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    completionText.textContent = 
        `Ты справился(лась) за ${gameState.moves} ходов и ${timeString}!`;

    completionPopup.classList.add('active');
}

/**
 * Restarts the current game with the same difficulty
 */
function restartGame() {
    completionPopup.classList.remove('active');
    gameState.flipped = [];
    gameState.matched = [];
    gameState.moves = 0;
    gameState.totalTime = 0;
    gameState.gameActive = true;

    // Reshuffle cards
    gameState.cards = gameState.cards.sort(() => Math.random() - 0.5);

    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';

    renderBoard();
    startTimer();
}

/**
 * Returns to the main menu
 */
function returnToMenu() {
    completionPopup.classList.remove('active');
    gameScreen.classList.remove('active');
    welcomeScreen.classList.remove('hidden');
    gameState.gameActive = false;
    stopTimer();
}
