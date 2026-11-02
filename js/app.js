let selectedLevel = 'easy';
let currentMode = null;

const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');
const feedback = document.getElementById('feedback');

const keyboardRows = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM'
];

function showScreen(screen) {
    homeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    screen.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function selectLevel(level) {
    selectedLevel = level;

    document.querySelectorAll('.difficulty-button').forEach(button => {
        const isSelected = button.dataset.level === level;
        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', isSelected);
    });
}

function createKeyboard(includeNumbers) {
    const keyboard = document.getElementById('keyboard');
    const rows = includeNumbers ? ['1234567890', ...keyboardRows] : keyboardRows;

    keyboard.innerHTML = '';

    rows.forEach(letters => {
        const row = document.createElement('div');
        row.className = 'keyboard-row';

        for (const letter of letters) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'key-button';
            button.dataset.key = letter;
            button.textContent = letter;
            button.setAttribute('aria-label', `Type ${letter}`);
            button.addEventListener('click', () => handleKey(letter));
            row.appendChild(button);
        }

        keyboard.appendChild(row);
    });
}

function showFeedback(message, type = '') {
    feedback.textContent = message;
    feedback.className = 'feedback';

    if (type) {
        feedback.classList.add(type);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remaining = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remaining}`;
}

function updateStats(stats) {
    document.getElementById('scoreValue').textContent = stats.score;
    document.getElementById('statTwoValue').textContent = stats.second;
    document.getElementById('statThreeValue').textContent = stats.third;
    document.getElementById('timeValue').textContent = formatTime(stats.seconds);
}

function stopGames() {
    BubblesGame.stop();
    KeyMagnetGame.stop();
}

function startGame(mode) {
    stopGames();
    currentMode = mode;

    const isBubbles = mode === 'bubbles';
    const title = isBubbles ? 'Bubbles' : 'KeyMagnet';
    const description = isBubbles
        ? 'Pop letters before they escape from the top.'
        : 'Type the target key as quickly and accurately as you can.';

    document.getElementById('gameTitle').textContent = title;
    document.getElementById('gameDescription').textContent = description;
    document.getElementById('gameLevel').textContent = selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1);
    document.getElementById('statTwoLabel').textContent = isBubbles ? 'MISSES' : 'ACCURACY';
    document.getElementById('statThreeLabel').textContent = isBubbles ? 'POPPED' : 'CORRECT';
    document.getElementById('bubblesPanel').classList.toggle('hidden', !isBubbles);
    document.getElementById('magnetPanel').classList.toggle('hidden', isBubbles);

    createKeyboard(!isBubbles && selectedLevel === 'hard');
    showFeedback('Ready? Start typing!');
    showScreen(gameScreen);

    const callbacks = {
        onStats: updateStats,
        onFeedback: showFeedback,
        onFinish: showResults
    };

    if (isBubbles) {
        BubblesGame.start(selectedLevel, callbacks);
    } else {
        KeyMagnetGame.start(selectedLevel, callbacks);
    }
}

function handleKey(key) {
    if (gameScreen.classList.contains('hidden')) {
        return;
    }

    const letter = key.toUpperCase();

    if (currentMode === 'bubbles') {
        BubblesGame.press(letter);
    } else if (currentMode === 'keymagnet') {
        KeyMagnetGame.press(letter);
    }
}

function goHome() {
    stopGames();
    currentMode = null;
    showScreen(homeScreen);
}

function addResult(label, value) {
    const container = document.getElementById('resultStats');
    const item = document.createElement('div');
    const name = document.createElement('span');
    const number = document.createElement('strong');

    item.className = 'result-stat';
    name.textContent = label;
    number.textContent = value;
    item.appendChild(name);
    item.appendChild(number);
    container.appendChild(item);
}

function showResults(result) {
    document.getElementById('resultsTitle').textContent = result.mode === 'bubbles'
        ? 'Bubbles complete!'
        : 'KeyMagnet complete!';

    document.getElementById('resultsText').textContent = 'Nice work! Here is your round summary.';
    document.getElementById('finalScore').textContent = result.score;
    document.getElementById('resultStats').innerHTML = '';

    if (result.mode === 'bubbles') {
        addResult('Bubbles popped', result.popped);
        addResult('Bubbles missed', result.misses);
        addResult('Wrong keys', result.wrong);
        addResult('Final speed', `${result.speed} px/s`);
    } else {
        addResult('Correct answers', result.correct);
        addResult('Wrong answers', result.wrong);
        addResult('Timed out', result.timeouts);
        addResult('Accuracy', `${result.accuracy}%`);
        addResult('Average response', result.averageTime);
    }

    addResult('Time played', formatTime(result.seconds));
    showScreen(resultsScreen);
}

document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', () => selectLevel(button.dataset.level));
});

document.getElementById('startBubbles').addEventListener('click', () => startGame('bubbles'));
document.getElementById('startKeyMagnet').addEventListener('click', () => startGame('keymagnet'));
document.getElementById('restartButton').addEventListener('click', () => startGame(currentMode));
document.getElementById('resetButton').addEventListener('click', goHome);
document.getElementById('backButton').addEventListener('click', goHome);
document.getElementById('playAgainButton').addEventListener('click', () => startGame(currentMode));
document.getElementById('homeButton').addEventListener('click', goHome);

document.getElementById('brandLink').addEventListener('click', event => {
    event.preventDefault();
    goHome();
});

document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) {
        return;
    }

    if (/^[a-z0-9]$/i.test(event.key)) {
        handleKey(event.key);
    }
});
