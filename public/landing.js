document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('playerName');
    const startGameButton = document.getElementById('startGameButton');

    // Start the game when the button is clicked
    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        if (playerName) {
            // Store the player's name in local storage or pass it to the game page
            localStorage.setItem('playerName', playerName);
            window.location.href = 'game.html'; // Redirect to the game page
        } else {
            alert('Please enter your name!');
        }
    });
});
