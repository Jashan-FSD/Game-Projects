document.addEventListener("DOMContentLoaded", () => {

    const hoverSound = document.getElementById("hoverSound");
    const clickSound = document.getElementById("clickSound");
    const unlockScreen = document.getElementById("soundUnlock");
	
	// Get collision sounds
	const brickSound = document.getElementById("brickSound");
	const paddleSound = document.getElementById("paddleSound");
	const wallSound = document.getElementById("wallSound");

    let audioUnlocked = false;

    function unlockAudio() {
        if (audioUnlocked) return;

        if (hoverSound && clickSound) {
            hoverSound.muted = true;
            clickSound.muted = true;

            hoverSound.play().then(() => {
                hoverSound.pause();
                hoverSound.currentTime = 0;
                hoverSound.muted = false;
            });

            clickSound.play().then(() => {
                clickSound.pause();
                clickSound.currentTime = 0;
                clickSound.muted = false;
            });
        }

        audioUnlocked = true;

        // Hide overlay if exists
        if (unlockScreen) {
            unlockScreen.style.display = "none";
        }
    }

    // 🔓 Unlock on ANY click (not just overlay)
    document.body.addEventListener("click", unlockAudio, { once: true });

    // 🔊 Hover sound
    window.playHoverSound = function () {
        unlockAudio(); // ensure unlock
        if (!hoverSound) return;

        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {});
    };

    // 🔊 Click sound
    window.playClickSound = function () {
        unlockAudio(); // ensure unlock
        if (!clickSound) return;

        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    };
	
	// 🔊 Ultra-fast sound (no delay)
	function playFastSound(originalSound) {
		if (!audioUnlocked || !originalSound) return;

		const sound = originalSound.cloneNode(); // 
		sound.volume = 0.3; // optional volume control
		sound.play().catch(() => {});
	}

	// 🔊 Brick hit
	window.playBrickSound = function () {
		playFastSound(brickSound);
	};

	// 🔊 Paddle hit
	window.playPaddleSound = function () {
		playFastSound(paddleSound);
	};

	// 🔊 Wall hit
	window.playWallSound = function () {
		playFastSound(wallSound);
	};
	
	// 🔊 Game Over sound (no delay)
	window.playGameOverSound = function () {
		const original = document.getElementById("gameOverSound");
		if (!original) return;

		const sound = original.cloneNode(); // instant play
		sound.volume = 0.4;
		sound.play().catch(() => {});
	};
	
	// 🔊 Game Win sound (no delay)
	window.playGameWinSound = function () {
		const sound = document.getElementById("gameWinSound");
		if (!sound) return;

		sound.currentTime = 0; // restart if already played
		sound.volume = 0.4;

		sound.play().catch(() => {
			console.log("Sound blocked by browser");
		});
	};

});