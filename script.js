// Card data - Pool lengkap untuk semua level
const cardDataPool = [
    { name: 'biru', type: 'image', path: 'assets/biru.png' },
    { name: 'hijau', type: 'image', path: 'assets/hijau.png' },
    { name: 'hitam', type: 'image', path: 'assets/hitam.png' },
    { name: 'kuning', type: 'image', path: 'assets/kuning.png' },
    { name: 'merah', type: 'image', path: 'assets/merah.png' },
    { name: 'pink', type: 'image', path: 'assets/pink.png' },
    { name: 'putih', type: 'image', path: 'assets/putih.png' },
    { name: 'ungu', type: 'image', path: 'assets/ungu.png' },
    { name: 'orange', type: 'image', path: 'assets/orange.png' },
    { name: 'emas', type: 'emoji', icon: '⭐' },
    { name: 'pelangi', type: 'emoji', icon: '🌈' },
    { name: 'awan', type: 'emoji', icon: '☁️' },
    { name: 'matahari', type: 'emoji', icon: '☀️' },
    { name: 'bulan', type: 'emoji', icon: '🌙' },
    { name: 'bintang', type: 'emoji', icon: '✨' },
    { name: 'api', type: 'emoji', icon: '🔥' },
    { name: 'air', type: 'emoji', icon: '💧' },
    { name: 'daun', type: 'emoji', icon: '🍃' },
    { name: 'bunga', type: 'emoji', icon: '🌸' },
    { name: 'hati', type: 'emoji', icon: '❤️' },
    { name: 'kilat', type: 'emoji', icon: '⚡' },
    { name: 'rocket', type: 'emoji', icon: '🚀' },
    { name: 'crown', type: 'emoji', icon: '👑' },
    { name: 'gem', type: 'emoji', icon: '💎' }
];

// Level configurations
const LEVELS = {
    1: { pairs: 8, name: 'Easy', timeBonus: 120 },
    2: { pairs: 10, name: 'Medium', timeBonus: 150 },
    3: { pairs: 12, name: 'Medium+', timeBonus: 180 },
    4: { pairs: 15, name: 'Hard', timeBonus: 210 },
    5: { pairs: 18, name: 'Hard+', timeBonus: 240 },
    6: { pairs: 20, name: 'Expert', timeBonus: 270 },
    7: { pairs: 24, name: 'Master', timeBonus: 300 }
};

// Game state
let gameState = {
    currentLevel: 1,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    gameStarted: false,
    canFlip: true,
    musicEnabled: true,
    soundEnabled: true,
    weatherEnabled: true
};

// Audio elements
let bgMusic;
let audioContext;

// Weather system
let weatherCanvas;
let weatherCtx;
let raindrops = [];
let lightningFlash = false;

// DOM elements
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const pairsDisplay = document.getElementById('pairs');
const currentLevelDisplay = document.getElementById('currentLevel');
const levelSelection = document.getElementById('levelSelection');
const gameArea = document.getElementById('gameArea');
const modal = document.getElementById('modal');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const replayBtn = document.getElementById('replayBtn');
const backToLevelsBtn = document.getElementById('backToLevelsBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');
const musicToggle = document.getElementById('musicToggle');
const soundToggle = document.getElementById('soundToggle');
const weatherToggle = document.getElementById('weatherToggle');

// Initialize
function init() {
    initAudio();
    initWeather();
    setupLevelButtons();
    setupEventListeners();
}

// Initialize audio
function initAudio() {
    bgMusic = new Audio('assets/bg.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Create beep sound
function createBeep(frequency, duration, volume = 0.3) {
    return () => {
        if (!gameState.soundEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
}

// Initialize weather effects
function initWeather() {
    weatherCanvas = document.getElementById('weatherCanvas');
    
    if (!weatherCanvas) {
        console.error('Weather canvas not found');
        return;
    }
    
    weatherCtx = weatherCanvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        weatherCanvas.width = window.innerWidth;
        weatherCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize raindrops
    raindrops = [];
    for (let i = 0; i < 150; i++) {
        raindrops.push({
            x: Math.random() * weatherCanvas.width,
            y: Math.random() * weatherCanvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 3 + 3,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Start animation
    animateWeather();
}

// Animate weather
function animateWeather() {
    requestAnimationFrame(animateWeather);
    
    if (!gameState.weatherEnabled) {
        weatherCtx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
        return;
    }
    
    // Clear canvas
    weatherCtx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    // Draw rain
    weatherCtx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
    weatherCtx.lineWidth = 1.5;
    weatherCtx.lineCap = 'round';
    
    raindrops.forEach(drop => {
        weatherCtx.globalAlpha = drop.opacity;
        weatherCtx.beginPath();
        weatherCtx.moveTo(drop.x, drop.y);
        weatherCtx.lineTo(drop.x - 2, drop.y + drop.length);
        weatherCtx.stroke();
        
        // Update position
        drop.y += drop.speed;
        drop.x -= 0.5;
        
        // Reset if out of bounds
        if (drop.y > weatherCanvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * weatherCanvas.width;
        }
    });
    
    weatherCtx.globalAlpha = 1;
    
    // Lightning effect (random)
    if (Math.random() < 0.001) {
        lightningFlash = true;
        playSound(createBeep(150, 0.2, 0.1));
        setTimeout(() => lightningFlash = false, 100);
    }
    
    if (lightningFlash) {
        weatherCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        weatherCtx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    }
}

// Setup level buttons
function setupLevelButtons() {
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = parseInt(btn.dataset.level);
            startLevel(level);
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    restartBtn.addEventListener('click', () => restartLevel());
    backBtn.addEventListener('click', () => backToLevels());
    nextLevelBtn.addEventListener('click', () => nextLevel());
    replayBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        restartLevel();
    });
    backToLevelsBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        backToLevels();
    });
    musicToggle.addEventListener('click', toggleMusic);
    soundToggle.addEventListener('click', toggleSound);
    weatherToggle.addEventListener('click', toggleWeather);
}

// Start level
function startLevel(level) {
    gameState.currentLevel = level;
    levelSelection.style.display = 'none';
    gameArea.style.display = 'block';
    
    resetGameState();
    createBoard();
    updateDisplay();
    startGame();
}

// Reset game state
function resetGameState() {
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.gameStarted = false;
    gameState.canFlip = true;
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}

// Create board
function createBoard() {
    gameBoard.innerHTML = '';
    gameBoard.className = `game-board level-${gameState.currentLevel}`;
    
    const levelConfig = LEVELS[gameState.currentLevel];
    const selectedCards = cardDataPool.slice(0, levelConfig.pairs);
    const duplicatedCards = [...selectedCards, ...selectedCards];
    
    gameState.cards = shuffleArray(duplicatedCards);
    
    gameState.cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        gameBoard.appendChild(cardElement);
    });
}

// Create card element
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.index = index;
    cardDiv.dataset.name = card.name;
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    const cardBackImg = document.createElement('img');
    cardBackImg.src = 'assets/ori.png';
    cardBackImg.alt = 'Kite Logo';
    cardBackImg.className = 'card-back-img';
    cardFront.appendChild(cardBackImg);
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    if (card.type === 'image') {
        const img = document.createElement('img');
        img.src = card.path;
        img.alt = card.name;
        cardBack.appendChild(img);
    } else if (card.type === 'emoji') {
        cardBack.classList.add('emoji');
        cardBack.textContent = card.icon;
    }
    
    cardDiv.appendChild(cardFront);
    cardDiv.appendChild(cardBack);
    
    cardDiv.addEventListener('click', () => flipCard(cardDiv));
    
    return cardDiv;
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Start game
function startGame() {
    gameState.gameStarted = true;
    startTimer();
    playSound(createBeep(500, 0.2));
    
    if (gameState.musicEnabled) {
        bgMusic.play().catch(e => console.log('Music autoplay prevented'));
    }
}

// Flip card
function flipCard(card) {
    if (!gameState.gameStarted) return;
    if (!gameState.canFlip) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    
    // Immediate feedback
    card.classList.add('flipped');
    gameState.flippedCards.push(card);
    playSound(createBeep(400, 0.1));
    
    if (gameState.flippedCards.length === 2) {
        gameState.canFlip = false;
        gameState.moves++;
        updateDisplay();
        
        // Check match immediately without delay
        setTimeout(() => checkMatch(), 400);
    }
}

// Check match
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const name1 = card1.dataset.name;
    const name2 = card2.dataset.name;
    
    if (name1 === name2) {
        // Match found - faster response
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            gameState.matchedPairs++;
            updateDisplay();
            playSound(createBeep(600, 0.2));
            
            gameState.flippedCards = [];
            gameState.canFlip = true;
            
            const levelConfig = LEVELS[gameState.currentLevel];
            if (gameState.matchedPairs === levelConfig.pairs) {
                setTimeout(() => winLevel(), 300);
            }
        }, 300);
    } else {
        // No match - faster flip back
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            gameState.flippedCards = [];
            gameState.canFlip = true;
        }, 800);
    }
}

// Start timer
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateDisplay();
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Update display
function updateDisplay() {
    currentLevelDisplay.textContent = gameState.currentLevel;
    movesDisplay.textContent = gameState.moves;
    
    const levelConfig = LEVELS[gameState.currentLevel];
    pairsDisplay.textContent = `${gameState.matchedPairs}/${levelConfig.pairs}`;
    
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Win level
function winLevel() {
    stopTimer();
    bgMusic.pause();
    playSound(createBeep(800, 0.5));
    
    const levelConfig = LEVELS[gameState.currentLevel];
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    let message = `🎉 Level ${gameState.currentLevel} Complete! 🎉\n\n`;
    message += `⏱️ Time: ${timeStr}\n`;
    message += `🎯 Moves: ${gameState.moves}\n`;
    message += `⭐ Pairs Found: ${gameState.matchedPairs}/${levelConfig.pairs}`;
    
    document.getElementById('modalTitle').textContent = 'Level Complete!';
    document.getElementById('modalMessage').textContent = message;
    
    // Show/hide next level button
    if (gameState.currentLevel < 7) {
        nextLevelBtn.style.display = 'block';
    } else {
        nextLevelBtn.style.display = 'none';
        document.getElementById('modalTitle').textContent = '🏆 Game Complete! 🏆';
        document.getElementById('modalMessage').textContent = message + '\n\nYou are a Memory Master!';
    }
    
    modal.classList.add('show');
}

// Next level
function nextLevel() {
    modal.classList.remove('show');
    if (gameState.currentLevel < 7) {
        startLevel(gameState.currentLevel + 1);
    }
}

// Restart level
function restartLevel() {
    startLevel(gameState.currentLevel);
}

// Back to levels
function backToLevels() {
    stopTimer();
    bgMusic.pause();
    bgMusic.currentTime = 0;
    
    gameArea.style.display = 'none';
    levelSelection.style.display = 'block';
    
    resetGameState();
}

// Toggle music
function toggleMusic() {
    gameState.musicEnabled = !gameState.musicEnabled;
    musicToggle.classList.toggle('muted');
    
    if (gameState.musicEnabled && gameState.gameStarted) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
    
    musicToggle.textContent = gameState.musicEnabled ? '🔊 Music' : '🔇 Music';
}

// Toggle sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggle.classList.toggle('muted');
    soundToggle.textContent = gameState.soundEnabled ? '🔊 Sound' : '🔇 Sound';
}

// Toggle weather
function toggleWeather() {
    gameState.weatherEnabled = !gameState.weatherEnabled;
    weatherToggle.classList.toggle('muted');
    weatherToggle.textContent = gameState.weatherEnabled ? '🌧️ Weather' : '🌧️ Weather';
}

// Play sound
function playSound(soundFunc) {
    if (gameState.soundEnabled && typeof soundFunc === 'function') {
        soundFunc();
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);