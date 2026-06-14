// ================= CANVAS =================
const canvas = document.getElementById("gameCanvas");
canvas.style.imageRendering = "auto";
const ctx = canvas.getContext("2d");

// ================= Responsive Scaling =================
window.addEventListener("resize", () => {
    if (canvas.style.display === "block") {
        resizeCanvas();
    }
});

function resizeCanvas() {
    const aspectRatio = 3 / 2;

    // Get actual available space in browser
    let maxWidth = window.innerWidth;
    let maxHeight = window.innerHeight;

    // Leave some margin (optional)
    maxWidth *= 0.95;
    maxHeight *= 0.95;

    let width, height;

    // Maintain aspect ratio
    if (maxWidth / maxHeight > aspectRatio) {
        height = maxHeight;
        width = height * aspectRatio;
    } else {
        width = maxWidth;
        height = width / aspectRatio;
    }

    const dpr = window.devicePixelRatio || 1;

    // Real resolution
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Display size
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	
	ctx.scale(1, 1);
	
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";

    // Logical size (used everywhere)
    canvas.logicalWidth = width;
    canvas.logicalHeight = height;

    // Scale elements based on screen
    ballRadius = width * 0.006;

    paddleWidth = width * 0.15;
    paddleHeight = height * 0.02;

    brickWidth = width * 0.08;
    brickHeight = height * 0.04;
    brickPadding = width * 0.01;

    brickOffsetTop = height * 0.14;
}

// ================= CONTAINER =================
const container = document.querySelector(".container");

// ================= LEVEL CONFIG =================
const LEVEL_CONFIG = {
    easy: { ballSpeed: 15, paddleSpeed: 15, brickRows: 3, brickColumnCount: 8},
    medium: { ballSpeed: 20, paddleSpeed: 20, brickRows: 5, brickColumnCount: 8},
    hard: { ballSpeed: 25, paddleSpeed: 25, brickRows: 7, brickColumnCount: 8}
};

// ================= GAME VARIABLES =================
let speed;
let paddleSpeed;
let level = "easy";

let x, y, dx, dy;
let ballRadius;

let paddleHeight;
let paddleWidth;
let paddleX;

let rightPressed = false;
let leftPressed = false;

let brickRowCount;
let brickColumnCount;
let brickWidth;
let brickHeight;
let brickPadding;
let brickOffsetTop;

let bricks = [];
let particles = [];

let score = 0;
let displayScore = 0;
let totalBricks = 0;
let highScore = localStorage.getItem("highScore") || 0;

let gameRunning = false;
let gameStarted = false;
let gameEnded = false;

// ================= LEVEL CLICK =================
window.handleLevelClick = function (selectedLevel) {
    if (typeof playClickSound === "function") playClickSound();
    setTimeout(() => startGame(selectedLevel), 150);
};

// ================= START GAME =================
function startGame(selectedLevel) {
    level = selectedLevel;

    if (container) container.style.display = "none";
    canvas.style.display = "block";

    resizeCanvas();

    gameRunning = false;
    initGame();

    gameRunning = true;
    draw();
}

// ================= INIT =================
function initGame() {
    let config = LEVEL_CONFIG[level];

    speed = (canvas.logicalWidth * 0.005) * (config.ballSpeed / 12);
    paddleSpeed = (canvas.logicalWidth * 0.01) * (config.paddleSpeed / 15);
    brickRowCount = config.brickRows;
	brickColumnCount = config.brickColumnCount;

    x = canvas.logicalWidth / 2;
    y = canvas.logicalHeight - canvas.logicalHeight * 0.05;

    paddleX = (canvas.logicalWidth - paddleWidth) / 2;

    score = 0;
    displayScore = 0;
    gameStarted = false;
    gameEnded = false;
	winTriggered = false;

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    totalBricks = brickRowCount * brickColumnCount;

    let angle = (Math.random() * Math.PI / 3) + Math.PI / 6;

    dx = speed * Math.cos(angle);
    dy = -speed * Math.sin(angle);
}

// ================= CONTROLS =================
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") rightPressed = true;
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.code === "Space") gameStarted = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") rightPressed = false;
    if (e.key === "ArrowLeft") leftPressed = false;
});

canvas.addEventListener("click", () => gameStarted = true);

// ================= DRAW LOOP =================
function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);

    drawBricks();
    drawParticles();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    if (x + dx > canvas.logicalWidth - ballRadius || x + dx < ballRadius) {
        dx = -dx + (Math.random() - 0.5) * 0.4;
    }

    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.logicalHeight - ballRadius) {

        if (x > paddleX && x < paddleX + paddleWidth) {

            let hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            let angle = hitPoint * Math.PI / 3;

            dx = speed * Math.sin(angle);
            dy = -speed * Math.cos(angle);

            if (typeof playPaddleSound === "function") playPaddleSound();

        } else {
            endGame("💀 Game Over!");
            return;
        }
    }

    if (rightPressed && paddleX < canvas.logicalWidth - paddleWidth) {
        paddleX += paddleSpeed;
    } 
    else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    if (!gameStarted) {
        x = paddleX + paddleWidth / 2;
        y = canvas.logicalHeight - paddleHeight - ballRadius;
    } else {
        x += dx;
        y += dy;
    }

    if (!gameStarted) {
        ctx.font = `${canvas.logicalWidth * 0.02}px Arial`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Press SPACE or Click to Start", canvas.logicalWidth / 2, canvas.logicalHeight / 2);
    }

    requestAnimationFrame(draw);
}

// ================= DRAW ELEMENTS =================
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.logicalHeight - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "cyan";
    ctx.fill();
    ctx.closePath();
}

// ================= BRICKS =================
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawBricks() {
    let totalWidth = (brickColumnCount * brickWidth) + ((brickColumnCount - 1) * brickPadding);
    let startX = (canvas.logicalWidth - totalWidth) / 2;

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {

            if (bricks[c][r].status === 1) {

                let brickX = startX + c * (brickWidth + brickPadding);
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                drawRoundedRect(brickX, brickY, brickWidth, brickHeight, 10);

                ctx.fillStyle = "#1e90ff";
                ctx.shadowColor = "#00ccff";
                ctx.shadowBlur = 8;

                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
}

// ================= SCORE =================
function drawScore() {
    displayScore += (score - displayScore) * 0.1;

    let text = `SCORE  ${Math.floor(displayScore)}`;

    ctx.font = `bold ${canvas.logicalWidth * 0.018}px Arial`;
    ctx.textAlign = "center";

    let textWidth = ctx.measureText(text).width;

    let boxX = canvas.logicalWidth / 2 - textWidth / 2 - 25;
    let boxY = 15;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(boxX, boxY, textWidth + 50, 45);

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 12;
    ctx.strokeRect(boxX, boxY, textWidth + 50, 45);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 8;
    ctx.fillText(text, canvas.logicalWidth / 2, boxY + 30);
    ctx.shadowBlur = 0;
}

// ================= COLLISION =================
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {

            let b = bricks[c][r];

            if (b.status === 1) {

                if (
                    x + ballRadius > b.x &&
                    x - ballRadius < b.x + brickWidth &&
                    y + ballRadius > b.y &&
                    y - ballRadius < b.y + brickHeight
                ) {

                    let overlapLeft = x + ballRadius - b.x;
                    let overlapRight = (b.x + brickWidth) - (x - ballRadius);
                    let overlapTop = y + ballRadius - b.y;
                    let overlapBottom = (b.y + brickHeight) - (y - ballRadius);

                    let minOverlap = Math.min(
                        overlapLeft,
                        overlapRight,
                        overlapTop,
                        overlapBottom
                    );

                    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                        dx = -dx;
                    } else {
                        dy = -dy;
                    }

                    dx += (Math.random() - 0.5) * 0.2;

                    b.status = 0;
                    score++;
					
					createParticles(
						b.x + brickWidth / 2,
						b.y + brickHeight / 2,
						"#00ccff"
					);

                    if (typeof playBrickSound === "function") {
                        playBrickSound();
                    }

                    if (score === totalBricks && !winTriggered) {
						winTriggered = true;

						// delay ensures loop finishes cleanly
						setTimeout(() => {
							endGame("You Win!", true);
						}, 50);

						return;
					}
                }
            }
        }
    }
}

// ================= GAME Win/Over Menu =================
function endGame(message, isWin = false) {

    if (gameEnded && !isWin) return;

    gameRunning = false;
    gameEnded = true;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    setTimeout(() => {

		localStorage.setItem("lastScore", score);

		// 🔥 THIS LINE WAS MISSING
		localStorage.setItem("gameResult", isWin ? "win" : "lose");

		if (isWin) {
			window.location.href = "GameWon.html";
		} else {
			window.location.href = "GameOver.html";
		}

	}, 1000);
}

// ================= Particle Function =================
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            life: 30,
            color: color
        });
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {

        let p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.closePath();

        ctx.shadowBlur = 0;

        // Movement
        p.x += p.dx;
        p.y += p.dy;

        // Fade out
        p.life--;
        p.size *= 0.95;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}