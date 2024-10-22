const player = document.getElementById('player');
const monster = document.getElementById('monster');
const apple = document.getElementById('apple');
const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highScore');
const finalScoreDisplay = document.getElementById('finalScore');
const highscoreMenu = document.getElementById('highscoreMenu');
const restartButton = document.getElementById('restartButton');

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

    // Hotkey for restarting the game ('r')
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

function endGame() {
    isGameOver = true; // Set game over flag
    cancelAnimationFrame(animationFrameId); // Stop player movement loop

    previousHighScore = highScore;
    highScore = Math.max(score, highScore); // TODO later: should be for current person...
    player_name = 'Jonatan' // TODO later: player name.
    if (score > previousHighScore) {
        submitHighScore(player_name, score);
    } else {
        console.log(`Only ${score} apples. Highscore for ${player_name} is ${previousHighScore}`);
    }

    getHighScores();
    // TODO: show highscore menu for 10 people

    // Display the high score menu
    highscoreMenu.style.display = 'block';
    finalScoreDisplay.textContent = score;
    highscoreDisplay.textContent = highScore;
    restartButton.style.display = 'block';
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
    highscoreMenu.style.display = 'none';
    restartButton.style.display = 'none';

    // Reposition the monster and apple
    positionMonster();
    spawnApple();

    // Reset game over flag and re-enable movement
    isGameOver = false;

    // Restart the game loop
    cancelAnimationFrame(animationFrameId); // Ensure no duplicate loops
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

function getHighScores() {
    fetch('http://localhost:3000/highscores')
    .then(response => response.json())
    .then(data => {
            console.log('High scores:', data); // TODO: save data to a variable as well; const highscores? or what's the role of const? global variables?
        })
        .catch((error) => {
            console.error('Error retrieving high scores:', error);
        });
    }
    
function submitHighScore(name, score) {
    console.log(`new highscore for ${name} - ${score} apples! Submitting to database.`);
    fetch('http://localhost:3000/highscores', {
        method: 'POST',
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



// Start the game loop
animationFrameId = requestAnimationFrame(movePlayer);
restartButton.addEventListener('click', restartGame);
positionMonster(); // Set initial monster position
spawnApple(); // Set initial apple position
