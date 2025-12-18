let currMoleTile;
let currPlantTile;
let score = 0;
let gameover = false;

let timeLeft = 30;
let moleInterval;
let plantInterval;
let timerInterval;

let hitSound;
let gameOverSound;
let bgMusic;
let soundEnabled = false;

let highScore = localStorage.getItem("highScore") || 0;
let lastHitTime = 0;

window.onload = function () {
    setGame();
};

function setGame() {
    score = 0;
    timeLeft = 30;
    gameover = false;

    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("gameOverScreen").classList.add("hidden");

    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        board.appendChild(tile);
    }

    document.body.addEventListener("click", enableSound, { once: true });

    moleInterval = setInterval(setMole, 1000);
    plantInterval = setInterval(setPlant, 2000);

    startTimer();
}

function enableSound() {
    hitSound = new Audio("pop-402324.mp3");
    gameOverSound = new Audio("kl-peach-game-over-iii-142453.mp3");
    bgMusic = new Audio("bg-music.mp3");

    hitSound.volume = 0.8;
    gameOverSound.volume = 0.6;
    bgMusic.volume = 0.3;

    bgMusic.loop = true;

    hitSound.load();
    gameOverSound.load();
    bgMusic.load();

    Promise.all([
        hitSound.play().then(() => hitSound.pause()),
        gameOverSound.play().then(() => gameOverSound.pause())
    ]).catch(() => {});

    soundEnabled = true;
    bgMusic.play().catch(() => {});
}

function toggleSound() {
    soundEnabled = !soundEnabled;

    if (!soundEnabled) {
        if (bgMusic) bgMusic.pause();
    } else {
        if (bgMusic) bgMusic.play().catch(() => {});
    }
}

function getRandomTile() {
    return Math.floor(Math.random() * 9).toString();
}

function getFreeTile() {
    let num;
    do {
        num = getRandomTile();
    } while (
        (currMoleTile && currMoleTile.id === num) ||
        (currPlantTile && currPlantTile.id === num)
    );
    return num;
}

function setMole() {
    if (gameover) return;

    if (currMoleTile) currMoleTile.innerHTML = "";

    let mole = document.createElement("img");
    mole.src = "monty-mole.png";

    let num = getFreeTile();
    currMoleTile = document.getElementById(num);
    currMoleTile.appendChild(mole);
}

function setPlant() {
    if (gameover) return;

    if (currPlantTile) currPlantTile.innerHTML = "";

    let plant = document.createElement("img");
    plant.src = "piranha-plant.png";

    let num = getFreeTile();
    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
}

function selectTile() {
    if (gameover) return;

    if (this === currMoleTile) {
        let now = Date.now();
        score += (now - lastHitTime < 800) ? 15 : 10;
        lastHitTime = now;

        document.getElementById("score").innerText = score;

        if (soundEnabled) {
            hitSound.currentTime = 0;
            hitSound.play();
        }

        this.firstChild.style.transform = "scale(1.3)";
        setTimeout(() => {
            if (this.firstChild)
                this.firstChild.style.transform = "scale(1)";
        }, 100);

        if (score % 50 === 0) {
            clearInterval(moleInterval);
            moleInterval = setInterval(setMole, Math.max(400, 1000 - score * 5));
        }
    } 
    else if (this === currPlantTile) {
        document.body.classList.add("shake");
        setTimeout(() => document.body.classList.remove("shake"), 300);

        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }

        if (soundEnabled) {
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }

        endGame();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;

        if (timeLeft <= 0) {
            if (bgMusic) {
                bgMusic.pause();
                bgMusic.currentTime = 0;
            }

            if (soundEnabled) {
                gameOverSound.currentTime = 0;
                gameOverSound.play();
            }

            endGame();
        }
    }, 1000);
}

function endGame() {
    if (gameover) return;
    gameover = true;

    clearInterval(moleInterval);
    clearInterval(plantInterval);
    clearInterval(timerInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("finalScore").innerText = score;
    document.getElementById("highScore").innerText = highScore;
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

function restartGame() {
    document.getElementById("gameOverScreen").classList.add("hidden");

    clearInterval(moleInterval);
    clearInterval(plantInterval);
    clearInterval(timerInterval);

    if (soundEnabled && bgMusic) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(() => {});
    }

    setGame();
}
