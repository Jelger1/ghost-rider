// Globale variabelen
let scene = 1; // var om scene bij te houden
let selectedCar = 0; // Om de geselecteerde auto bij te houden

// Font variabelen
let font;

// Muziek variabelen
let bgMusic, gameOverMusic, hitSound;
let isMusicPlaying = false; // boolean om muziek te controleren

// Game variabelen
let playerX = 400;
let playerY = 500;
let playerWidth = 50;
let playerHeight = 100;
let speed = 5.5;

let obstacles = [];
let obstacleSpeed = 7;
let initialSpeed = 7;
let score = 0;
let lives = 3;
let heartImg;
let markerY = 0;
let greenery = [];
let isBlinking = false; // Voor knipperend effect
let blinkTimer = 0;

// Afbeeldingen
let playerCar;
let playerCarOptions = []; 
let obstacleCars = [];
let treesAndBushes = [];

function preload() {
    bgMusic = loadSound('assets/bgMusic.mp3');
    gameOverMusic = loadSound('assets/gameOver.mp3');
    hitSound = loadSound('assets/hitSound.mp3'); // Geluidseffect bij botsing
    font = loadFont('assets/PressStart2P-Regular.ttf');

    // Laden van speler-auto-afbeeldingen
    for (let i = 1; i <= 3; i++) {
        playerCarOptions.push(loadImage(`assets/playerCar${i}.png`));
    }

    playerCar = playerCarOptions[0];
    for (let i = 1; i <= 7; i++) {
        obstacleCars.push(loadImage(`assets/obstacleCar${i}.png`));
    }
    heartImg = loadImage('assets/heart.png');

    // Laden van bomen en struiken
    for (let i = 1; i <= 3; i++) {
        treesAndBushes.push(loadImage(`assets/boom${i}.png`));
    }
}

function setup() {
    createCanvas(800, 600); // verplichte canvasgrootte
    markerY = height;
    textFont(font, 20);
    initialiseGame();
}

function initialiseGame() {
    playerX = 400;
    playerY = 500;
    score = 0;
    lives = 3;
    obstacleSpeed = initialSpeed;
    obstacles = [];
    greenery = [];
    isBlinking = false;

    // Groen opnieuw instellen
    for (let i = 0; i < 10; i++) {
        greenery.push({
            img: random(treesAndBushes),
            x: random([random(0, 70), random(720, 800)]),
            y: random(-height, 0),
        });
    }
}

function draw() {
    if (scene == 1) {
        background(50);
        fill(255);
        textAlign(CENTER);
        text("Welcome to Ghost Rider!", width / 2, height / 2 - 50);
        text("Use arrow keys to avoid cars.", width / 2, height / 2);
        text("Press A to start", width / 2, height / 2 + 50);
    } else if (scene == 2) {
        drawSelectionMenu();
    } else if (scene == 3) {
        playGame();
    } else if (scene == 4) {
        background(30);
        fill(255, 0, 0);
        textAlign(CENTER);
        text("Game Over", width / 2, height / 2 - 50);
        text(`Score: ${score}`, width / 2, height / 2);
        text("Press ENTER to restart", width / 2, height / 2 + 50);

        if (!isMusicPlaying) {
            gameOverMusic.play();
            isMusicPlaying = true;
        }
    }
}

function drawSelectionMenu() {
    background(30);
    fill(255);
    textAlign(CENTER);
    text("Select Your Car", width / 2, height / 2 - 220);

    for (let i = 0; i < playerCarOptions.length; i++) {
        let x = width / 2 + (i - 1) * 170;
        let y = height / 2.5;
        let carWidth = i === selectedCar ? 130 : 100;
        let carHeight = i === selectedCar ? 260 : 200;
        if (i === selectedCar) {
            stroke(255, 255, 0);
            strokeWeight(4);
        } else {
            noStroke();
        }
        image(playerCarOptions[i], x - carWidth / 2, y - carHeight / 2, carWidth, carHeight);
    }

    noStroke();
    textSize(16);
    text("Use arrow keys to choose", width / 2, height / 2 + 150);
    text("Press ENTER to confirm", width / 2, height / 2 + 180);
}

function playGame() {
    background(160, 190, 110); // Lichtgroene achtergrond

    // Teken weg
    fill(55);
    rect(100, 0, 600, height);

    // Teken rijstrookmarkeringen
    fill(255);
    markerY += obstacleSpeed - 1.5;
    for (let i = 0; i < 18; i++) {
        let y = markerY + 100 * i - 1800;
        rect(width / 2 - 5, y, 10, 50, 10, 45);
        rect(width / 2 - 5 - 160, y, 10, 50, 10, 45);
        rect(width / 2 - 5 + 160, y, 10, 50 , 10, 45);

        // Zorg ervoor dat de markeringen blijven bewegen
    }
    if (markerY > height * 3) {
        markerY = height;
    }

    // Teken bomen en struiken
    for (let green of greenery) {
        image(green.img, green.x, green.y, 45, 45);
        green.y += obstacleSpeed - 1.5;
        if (green.y > height) {
            green.y = random(-120, -10);
            green.x = random([random(0, 40), random(700, 790)]);
            green.img = random(treesAndBushes);
        }
    }

    // Knipperend effect bij botsing
    if (isBlinking) {
        blinkTimer++;
        if (blinkTimer % 20 < 10) {
            tint(255, 128); // Halfdoorzichtig
        } else {
            noTint();
        }
        if (blinkTimer > 60) {
            isBlinking = false;
            noTint();
        }
    }

    // Teken speler
    image(playerCar, playerX, playerY, playerWidth, playerHeight);

    // Teken obstakels
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        image(obs.img, obs.x, obs.y, playerWidth, playerHeight);
        obs.y += obstacleSpeed;

        // Check botsing
        if (
            playerX < obs.x + playerWidth &&
            playerX + playerWidth > obs.x &&
            playerY < obs.y + playerHeight &&
            playerY + playerHeight > obs.y
        ) {
            lives--;
            if (lives > 0 && !hitSound.isPlaying()) hitSound.play();
            obstacleSpeed *= 0.8;
            obstacles.splice(i, 1);
            isBlinking = true;
            blinkTimer = 0;
            if (lives <= 0) {
                scene = 4;
                bgMusic.stop();
                isMusicPlaying = false;
            }
        }

        // Verwijder obstakels buiten canvas
        if (obs.y > height) {
            obstacles.splice(i, 1);
            score++;
            if (obstacleSpeed < initialSpeed + score / 20) {
                obstacleSpeed += 0.3;
            }
        }
    }

    // Nieuwe obstakels toevoegen
    if (frameCount % 30 === 0) {
        let obsX = random(100, width - 100 - playerWidth);
        let obsImg = random(obstacleCars);
        obstacles.push({ x: obsX, y: -100, img: obsImg });
    }

    // Teken HUD
    fill(255);
    textSize(20);
    textAlign(LEFT);
    text(`Score: ${score}`, 20, 30);

    for (let i = 0; i < lives; i++) {
        image(heartImg, width - 150 + i * 40, 10, 30, 30);
    }

    // Speler bewegen
    if (keyIsDown(LEFT_ARROW)) {
        playerX = max(110, playerX - speed);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        playerX = min(width - 110 - playerWidth, playerX + speed);
    }
}

function keyPressed() {
    if (scene === 1 && (key === 'a' || key === 'A')) {
        scene = 2;
    } else if (scene === 2) {
        if (keyCode === LEFT_ARROW) {
            selectedCar = (selectedCar - 1 + playerCarOptions.length) % playerCarOptions.length;
        } else if (keyCode === RIGHT_ARROW) {
            selectedCar = (selectedCar + 1) % playerCarOptions.length;
        } else if (keyCode === ENTER) {
            playerCar = playerCarOptions[selectedCar];
            scene = 3;
            bgMusic.loop(); // Start de achtergrondmuziek opnieuw
            isMusicPlaying = true;
        }
    } else if (scene === 4 && keyCode === ENTER) {
        initialiseGame(); // Reset alle variabelen
        scene = 1; // Terug naar het beginscherm
        gameOverMusic.stop();
        isMusicPlaying = false;
    }
}
