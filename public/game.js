const player = document.getElementById('player');
const monster = document.getElementById('monster');
const apple = document.getElementById('apple');
const scoreDisplay = document.getElementById('score');
const playerHighscoreDisplay = document.getElementById('highScore');
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', restartGame);

let score = 0;
let highScore = 0;
let playerX = 100;
let playerY = 100;
let monsterX;
let monsterY;
let isGameOver = false;  // Track game state
const monsterDistance = 100; // Minimum distance from the player
const keyState = {}; // Track pressed keys
let animationFrameId; // Store requestAnimationFrame ID

// Keydown and keyup listeners for key presses
document.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
    if (event.key === 'r') {
        restartGame();
    }
});

document.addEventListener('keyup', (event) => {
    keyState[event.key] = false;
});

function positionMonster() {
    do {
        monsterX = Math.random() * 370;
        monsterY = Math.random() * 370;
    } while (Math.abs(playerX - monsterX) < monsterDistance && Math.abs(playerY - monsterY) < monsterDistance);

    monster.style.left = `${monsterX}px`;
    monster.style.top = `${monsterY}px`;
}

function spawnApple() {
    apple.style.left = `${Math.random() * 370}px`;
    apple.style.top = `${Math.random() * 370}px`;
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    const monsterRect = monster.getBoundingClientRect();

    if (
        playerRect.x < monsterRect.x + monsterRect.width &&
        playerRect.x + playerRect.width > monsterRect.x &&
        playerRect.y < monsterRect.y + monsterRect.height &&
        playerRect.y + playerRect.height > monsterRect.y
    ) {
        endGame();
    }
}

async function endGame() {
    isGameOver = true;
    highScore = Math.max(score, highScore);
    previousHighScore = await getPlayerHighScore(playerName);
    if (highScore > previousHighScore) {
        console.log(`New all time highscore for ${playerName}: ${score}`);
        submitHighScore(playerName, highScore);
    }

    updateGlobalHighScores();

    // Display the high score menu
    scoreDisplay.textContent = score;
    playerHighscoreDisplay.textContent = highScore;
    restartButton.style.display = 'block';

    cancelAnimationFrame(animationFrameId); // Stop player movement loop
}

function restartGame() {
    // Reset the score and player position
    score = 0;
    scoreDisplay.textContent = score;
    playerX = 100;
    playerY = 100;
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';

    // Hide the high score menu and restart button
    restartButton.style.display = 'none';

    // Reposition the monster and apple
    positionMonster();
    spawnApple();

    isGameOver = false;

    // Restart the game loop
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(movePlayer);
}

function movePlayer() {
    if (isGameOver) return; // Stop moving if game is over

    // Handle movement based on key presses
    if (keyState['ArrowUp']) {
        playerY = Math.max(0, playerY - 5);
    }
    if (keyState['ArrowDown']) {
        playerY = Math.min(370, playerY + 5);
    }
    if (keyState['ArrowLeft']) {
        playerX = Math.max(0, playerX - 5);
    }
    if (keyState['ArrowRight']) {
        playerX = Math.min(370, playerX + 5);
    }

    // Update player position on the game board
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;

    // Check for collisions with monster
    checkCollision();

    // Check if the player collects the apple
    const playerRect = player.getBoundingClientRect();
    const appleRect = apple.getBoundingClientRect();
    if (
        playerRect.x < appleRect.x + appleRect.width &&
        playerRect.x + playerRect.width > appleRect.x &&
        playerRect.y < appleRect.y + appleRect.height &&
        playerRect.y + playerRect.height > appleRect.y
    ) {
        updateScore();
        spawnApple(); // Spawn a new apple after collecting the current one
    }

    // Continue game loop
    animationFrameId = requestAnimationFrame(movePlayer);
}

function getTop10HighScores() {
    // fetch('http://localhost:3000/highscores')
    fetch('/data/highscores')
    .then(response => response.json())
    .then(data => {
            console.log('Top 10 high scores:', data); // TODO: save data to a variable as well; const highscores? or what's the role of const? global variables?
        })
        .catch((error) => {
            console.error('Error retrieving high scores:', error);
        });
}

async function getPlayerHighScore(playerName) { 
    console.log(`getPlayerHighScore`);
    try {
        // const response = await fetch(`http://localhost:3000/highscore/${playerName}`);
        const response = await fetch(`/data/highscore/${playerName}`);
        const data = await response.json();
        if (data.highScore !== undefined) {
            return data.highScore;
        } else {
            console.log(`Player ${playerName} not found. Return 0`);
            return 0;
        }
    } catch (error) {
        console.error('Error retrieving player high score:', error);
        return null;
    }
}

/* INSERT OR REPLACE INTO highscores (name, score) */
function submitHighScore(name, score) {
    // fetch('http://localhost:3000/highscores', {
    fetch('/data/highscores', {
        method: 'POST', // INSERT OR REPLACE
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, score: score }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('High score submitted:', data);
    })
    .catch((error) => {
        console.error('Error submitting high score:', error);
    });
}

/** Fetch top 10 players and update table */
async function updateGlobalHighScores() {
    const response = await fetch('/data/highscores');
    const highScoresJson = await response.json();
    const highScores = highScoresJson.highScores;
    const tableBody = document.querySelector('#highscores-table tbody');
    tableBody.innerHTML = ''; // Clear previous content

    highScores.forEach((score, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Start the game loop
restartGame()
updateGlobalHighScores();

