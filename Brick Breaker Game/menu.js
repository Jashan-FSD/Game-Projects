// PLAY
window.handlePlayClick = function () {
    playClickSound();

    setTimeout(() => {
        window.location.href = "levelSelection.html";
    }, 200);
};

// HIGHSCORE
window.handleHighScoreClick = function () {
    playClickSound();

    setTimeout(() => {
        let highScore = localStorage.getItem("highScore") || 0;
        alert("🏆 High Score: " + highScore);
    }, 150);
};

// SETTINGS
window.handleSettingsClick = function () {
    playClickSound();

    setTimeout(() => {
        alert("⚙ Settings coming soon!");
    }, 150);
};

// 🏠 MAIN MENU BUTTON
function handleMainMenuClick() {
    playClickSound();

    setTimeout(() => {
        // Change this to your actual main menu file
        window.location.href = "BrickBreakerGame.html";
    }, 200);
}

// Show score on Game Over screen
window.addEventListener("load", () => {

    let lastScore = localStorage.getItem("lastScore") || 0;
    let highScore = localStorage.getItem("highScore") || 0;

    document.getElementById("finalScore").innerText = "Score: " + lastScore;
    document.getElementById("highScore").innerText = "High Score: " + highScore;
});