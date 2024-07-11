const gameArea = document.getElementById('game-area');
const target = document.getElementById('target');
const startBtn = document.getElementById('start-btn');
const countdownEl = document.getElementById('countdown');
const timeLimit = document.getElementById('time-limit');
const maxMisses = document.getElementById('max-misses');
const targetSize = document.getElementById('target-size');
const targetDuration = document.getElementById('target-duration');
const stepUpSpeed = document.getElementById('step-up-speed');
const keyboardKeyInput = document.getElementById('keyboard-key');
const changeTargetColorInput = document.getElementById('change-target-color');

const timeRemainingEl = document.getElementById('time-remaining');
const targetsHitEl = document.getElementById('targets-hit');
const targetsMissedEl = document.getElementById('targets-missed');
const accuracyEl = document.getElementById('accuracy');
const reactionTimeEl = document.getElementById('reaction-time');
const avgReactionTimeEl = document.getElementById('avg-reaction-time');

const modal = document.getElementById('game-over-modal');
const modalTargetsHit = document.getElementById('modal-targets-hit');
const modalAccuracy = document.getElementById('modal-accuracy');
const modalAvgReactionTime = document.getElementById('modal-avg-reaction-time');
const closeModalBtn = document.getElementById('close-modal');

let gameActive = false;
let targetsHit = 0;
let targetsMissed = 0;
let timeRemaining = 0;
let reactionTimes = [];
let targetAppearTime;
let gameTimer;
let currentTargetDuration;
let targetTimeout;
let selectedKey = '';

function startGame() {
    try {
        if (gameActive) return;

        // Reset stats
        targetsHit = 0;
        targetsMissed = 0;
        timeRemaining = parseInt(timeLimit.value);
        reactionTimes = [];
        currentTargetDuration = parseInt(targetDuration.value);

        // Validate the color input
        if (!isValidHex(changeTargetColorInput.value)) {
            changeTargetColorInput.value = '#ff006e'; // Reset to default color if invalid
        }

        updateStats();
        
        // Countdown
        let countdown = 3;
        countdownEl.textContent = countdown;
        countdownEl.style.display = 'block';
        countdownEl.style.fontSize = '48px';
        countdownEl.style.color = 'red';

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownEl.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                countdownEl.style.display = 'none';
                gameActive = true;
                createTarget();
                startTimer();
            }
        }, 1000);
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}

function isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
}

function startTimer() {
    gameTimer = setInterval(() => {
        timeRemaining--;
        updateStats();

        if (timeRemaining <= 0 || targetsMissed >= parseInt(maxMisses.value)) {
            endGame();
        }
    }, 1000);
}

function createTarget() {
    if (!gameActive) return;

    clearTimeout(targetTimeout);

    const size = parseInt(targetSize.value);
    const maxX = gameArea.clientWidth - size;
    const maxY = gameArea.clientHeight - size;
    
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
    target.style.left = `${Math.random() * maxX}px`;
    target.style.top = `${Math.random() * maxY}px`;
    target.style.display = 'block';
    
    // Use the custom color if it's valid, otherwise default to red
    const customColor = changeTargetColorInput.value;
    target.style.backgroundColor = isValidHex(customColor) ? customColor : '#ff006e';

    targetAppearTime = Date.now();

    targetTimeout = setTimeout(() => {
        if (gameActive && target.style.display !== 'none') {
            missTarget();
        }
    }, currentTargetDuration);
}

changeTargetColorInput.addEventListener('change', function() {
    if (!isValidHex(this.value)) {
        alert('Please enter a valid hex color (e.g., #FF0000 for red)');
        this.value = '#ff006e'; // Reset to default color if invalid
    }
});

function missTarget() {
    if (!gameActive) return;

    clearTimeout(targetTimeout);
    targetsMissed++;
    updateStats();
    target.style.display = 'none';
    createTarget();
}

function hitTarget() {
    if (!gameActive) return;

    clearTimeout(targetTimeout);
    targetsHit++;
    const reactionTime = Date.now() - targetAppearTime;
    reactionTimes.push(reactionTime);

    updateStats(reactionTime);
    target.style.display = 'none';

    if (stepUpSpeed.checked) {
        currentTargetDuration = Math.max(currentTargetDuration - 50, 200); // Decrease by 50ms, but not below 200ms
    }

    createTarget();
}

function updateStats(lastReactionTime = null) {
    timeRemainingEl.textContent = timeRemaining;
    targetsHitEl.textContent = targetsHit;
    targetsMissedEl.textContent = targetsMissed;
    
    const totalTargets = targetsHit + targetsMissed;
    const accuracy = totalTargets > 0 ? (targetsHit / totalTargets * 100).toFixed(2) : 0;
    accuracyEl.textContent = accuracy;

    if (lastReactionTime !== null) {
        reactionTimeEl.textContent = lastReactionTime.toFixed(2);
    }

    const avgReactionTime = reactionTimes.length > 0 ? (reactionTimes.reduce((a, b) => a + b) / reactionTimes.length).toFixed(2) : 0;
    avgReactionTimeEl.textContent = avgReactionTime;
}

function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    clearTimeout(targetTimeout);
    target.style.display = 'none';
    
    modalTargetsHit.textContent = targetsHit;
    modalAccuracy.textContent = accuracyEl.textContent;
    modalAvgReactionTime.textContent = avgReactionTimeEl.textContent;
    modal.style.display = 'block';
}

startBtn.addEventListener('click', startGame);
target.addEventListener('click', hitTarget);
gameArea.addEventListener('click', (e) => {
    if (gameActive && e.target === gameArea) {
        missTarget();
    }
});

// Keyboard functionality
keyboardKeyInput.addEventListener('focus', () => {
    keyboardKeyInput.value = 'Press a key';
});

keyboardKeyInput.addEventListener('blur', () => {
    if (!selectedKey) {
        keyboardKeyInput.value = '';
    }
});

keyboardKeyInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    selectedKey = e.key;
    keyboardKeyInput.value = selectedKey;
});

let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

document.addEventListener('keydown', (e) => {
    if (gameActive && e.key === selectedKey) {
        const targetRect = target.getBoundingClientRect();
        
        if (lastMouseX >= targetRect.left && lastMouseX <= targetRect.right &&
            lastMouseY >= targetRect.top && lastMouseY <= targetRect.bottom) {
            hitTarget();
        } else {
            missTarget();
        }
    }
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Initial stats update
updateStats();