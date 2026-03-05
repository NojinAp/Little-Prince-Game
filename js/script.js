window.addEventListener("load", function() {

    function blockBrowserZoom() {
        document.addEventListener('wheel', (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('keydown', (event) => {
            if (!(event.ctrlKey || event.metaKey)) return;

            if (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '0') {
                event.preventDefault();
            }
        });

        document.addEventListener('gesturestart', (event) => {
            event.preventDefault();
        }, { passive: false });

        document.addEventListener('gesturechange', (event) => {
            event.preventDefault();
        }, { passive: false });

        document.addEventListener('gestureend', (event) => {
            event.preventDefault();
        }, { passive: false });
    }

    blockBrowserZoom();

    const startPage = document.getElementById("startPage");
    const startButton = document.getElementById("startButton");
    const canvas = document.getElementById("gameCanvas");
    const resumeButton = document.getElementById("resumeButton");
    const playAgainButton = document.getElementById("playAgainButton");
    const highScoreKey = "petitPrinceLeapHighScore";
    let keys = {};
    let tiltInput = 0;
    let tiltControlsReady = false;
    let tiltListenerAttached = false;

    function isMobileTiltDevice() {
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }

    function attachTiltListener() {
        if (tiltListenerAttached) return;

        window.addEventListener('deviceorientation', (event) => {
            const gamma = typeof event.gamma === 'number' ? event.gamma : 0;
            const clamped = Math.max(-20, Math.min(20, gamma));
            const normalized = clamped / 20;
            const deadzone = 0.04;
            tiltInput = Math.abs(normalized) < deadzone ? 0 : normalized;
        });

        tiltListenerAttached = true;
        tiltControlsReady = true;
    }

    async function enableTiltControlsFromGesture() {
        if (!isMobileTiltDevice()) return;

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    attachTiltListener();
                }
            } catch {
            }
            return;
        }

        attachTiltListener();
    }

    function getStoredHighScore() {
        try {
            const savedValue = Number(localStorage.getItem(highScoreKey));
            return Number.isFinite(savedValue) && savedValue > 0 ? Math.floor(savedValue) : 0;
        } catch {
            return 0;
        }
    }

    function setStoredHighScore(value) {
        try {
            localStorage.setItem(highScoreKey, String(Math.max(0, Math.floor(value))));
        } catch {
        }
    }

    document.addEventListener('keydown', e => keys[e.key] = true);
    document.addEventListener('keyup', e => keys[e.key] = false);

    if (playAgainButton) {
        playAgainButton.addEventListener("click", async () => {
            await enableTiltControlsFromGesture();
            playAgainButton.style.display = "none";
            if (resumeButton) resumeButton.style.display = "none";
            canvas.style.display = "none";
            startGame(() => {
                canvas.style.display = "block";
            });
        });
    }

    startButton.addEventListener("click", async () => {
        await enableTiltControlsFromGesture();
        canvas.style.display = "none";
        if (resumeButton) resumeButton.style.display = "none";
        if (playAgainButton) playAgainButton.style.display = "none";
        startGame(() => {
            startPage.style.display = "none";  // hide start page when game is ready
            canvas.style.display = "block";    // show canvas
        });                                   // start your canvas game loop
    });

    function startGame(onReady) {
        const ctx = canvas.getContext('2d');
        const gameWidth = 400;
        const gameHeight = 600;

        // ---------------- CANVAS SETUP ----------------
        function setupCanvasResolution() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.floor(gameWidth * dpr);
            canvas.height = Math.floor(gameHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        function fitCanvasToScreen() {
            const isPhoneViewport = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

            if (isPhoneViewport) {
                const screenWidth = window.innerWidth;
                const screenHeight = Math.floor(window.visualViewport?.height || window.innerHeight);
                canvas.style.width = screenWidth + 'px';
                canvas.style.height = screenHeight + 'px';
                return;
            }

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight);
            canvas.style.width = Math.floor(gameWidth * scale) + 'px';
            canvas.style.height = Math.floor(gameHeight * scale) + 'px';
        }

        setupCanvasResolution();
        fitCanvasToScreen();

        window.addEventListener('resize', fitCanvasToScreen);

        // ---------------- IMAGES ----------------
        let leftImage = new Image();
        let rightImage = new Image();
        let startBackground = new Image();
        let skyImage = new Image();
        const stepSound = new Audio('sounds/step.mp3');
        const fallSound = new Audio('sounds/fall.mp3');
        stepSound.preload = 'auto';
        stepSound.volume = 0.9;
        fallSound.preload = 'auto';
        fallSound.volume = 0.9;

        function playStepSound() {
            try {
                stepSound.currentTime = 0;
                const playAttempt = stepSound.play();
                if (playAttempt && typeof playAttempt.catch === 'function') {
                    playAttempt.catch(() => {});
                }
            } catch {
            }
        }

        function playFallSound() {
            try {
                fallSound.currentTime = 0;
                const playAttempt = fallSound.play();
                if (playAttempt && typeof playAttempt.catch === 'function') {
                    playAttempt.catch(() => {});
                }
            } catch {
            }
        }

        const isImageRenderable = (image) => image.complete && image.naturalWidth > 0;

        // ---------------- PHYSICS ----------------
        const isPhoneControls = isMobileTiltDevice();
        const phoneTiltMultiplier = 3.2;
        const phoneGravityMultiplier = 1.9;
        const phoneJumpMultiplier = Math.sqrt(phoneGravityMultiplier);
        const moveSpeed = 2.5;
        const gravity = 0.12 * (isPhoneControls ? phoneGravityMultiplier : 1);
        const jumpStrength = -7.5 * (isPhoneControls ? phoneJumpMultiplier : 1);
        const maxFallSpeed = isPhoneControls ? Math.abs(jumpStrength) : 3.5;
        const cameraScrollFactor = 0.55;
        const landingTolerance = 1.5;
        let cameraY = 0;
        let highestCameraY = 0;
        let gameOver = false;
        let outOfBoundsFrames = 0;
        let paused = false;
        let highScore = getStoredHighScore();
        const previousHighScore = highScore;
        const pauseButton = { x: gameWidth - 20 - 32, y: 14, width: 32, height: 36 };

        // ---------------- PRINCE ----------------
        class Prince {
            constructor() {
                this.width = 54;
                this.height = 100;
                this.hitboxInsetLeft = 4;
                this.hitboxInsetRight = 4;
                this.hitboxInsetBottom = 26;
                this.x = gameWidth / 2 - this.width / 2;
                this.y = gameHeight - this.height - 10;
                this.previousY = this.y;
                this.velocityY = 0;
                this.landingFXFrames = 0;
                this.maxLandingFXFrames = 16;
                this.landingFXStrength = 6;
                this.direction = 'left';
            }

            draw() {
                let currentImage = this.direction === 'right' ? rightImage : leftImage;
                let sinkPixels = this.landingFXFrames > 0
                    ? Math.sin((1 - this.landingFXFrames / this.maxLandingFXFrames) * Math.PI) * this.landingFXStrength
                    : 0;

                ctx.save();
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.filter = 'none';
                if (isImageRenderable(currentImage)) {
                    ctx.drawImage(
                        currentImage,
                        this.x,
                        this.y - this.hitboxInsetBottom + sinkPixels,
                        this.width,
                        this.height
                    );
                } else {
                    ctx.fillStyle = 'rgb(255, 197, 104)';
                    ctx.fillRect(
                        Math.round(this.x),
                        Math.round(this.y - this.hitboxInsetBottom + sinkPixels),
                        this.width,
                        this.height
                    );
                }
                ctx.restore();
            }

            update() {
                this.previousY = this.y;
                this.velocityY += gravity;
                if (this.velocityY > maxFallSpeed) this.velocityY = maxFallSpeed;
                this.y += this.velocityY;

                if (this.x > gameWidth) this.x = -this.width;
                if (this.x + this.width < 0) this.x = gameWidth;

                if (this.landingFXFrames > 0) this.landingFXFrames--;
            }

            jump() {
                this.velocityY = jumpStrength;
            }

            playLandingFX(impactSpeed = 0) {
                const impactRatio = Math.max(0.75, Math.min(1.8, impactSpeed / maxFallSpeed));
                this.landingFXStrength = 6 * impactRatio;
                this.landingFXFrames = this.maxLandingFXFrames;
            }
        }

        let prince = new Prince();

        // ---------------- PLATFORM ----------------
        class Platform {
            constructor(x, y, width = 80, height = 10) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }

            draw() {
                const x = Math.round(this.x);
                const y = Math.round(this.y);
                const w = this.width;
                const h = this.height;
                const radius = Math.min(4, h / 2, w / 2);
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + w - radius, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
                ctx.lineTo(x + w, y + h - radius);
                ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
                ctx.lineTo(x + radius, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();
            }
        }

        // ---------------- BACKGROUND ----------------
        function drawBackground() {
            const skyHeight = gameHeight;
            const tileOverlap = 2;

            if (!isImageRenderable(startBackground) && !isImageRenderable(skyImage)) {
                return;
            }

            // Start background only while visible
            if (cameraY < gameHeight && isImageRenderable(startBackground)) {
                ctx.drawImage(startBackground, 0, cameraY, gameWidth, gameHeight);
            }

            // Draw sky tiles forever above
            const tilesNeeded = Math.ceil((Math.abs(cameraY) + gameHeight) / skyHeight) + 2;
            const firstSkyY = cameraY - skyHeight;

            if (isImageRenderable(skyImage)) {
                for (let i = 0; i < tilesNeeded; i++) {
                    const tileY = Math.floor(firstSkyY - i * skyHeight);
                    ctx.drawImage(skyImage, 0, tileY, gameWidth, skyHeight + tileOverlap);
                }
            }
        }

        // ---------------- GAME SETUP ----------------
        let platforms = [];
        let lastJumpPlatform = null;
        let canScrollCamera = false;

        const groundY = gameHeight - 50;
        const groundWidth = 90;
        const groundX = gameWidth / 2 - groundWidth / 2;

        const startPlatform = new Platform(groundX, groundY, groundWidth, 10);
        platforms.push(startPlatform);

        for (let i = 1; i < 6; i++) {
            let x = Math.random() * (gameWidth - 80);
            let y = groundY - i * 120;
            platforms.push(new Platform(x, y));
        }

        prince.y = startPlatform.y - (prince.height - prince.hitboxInsetBottom);
        prince.previousY = prince.y;
        lastJumpPlatform = startPlatform;

        // ---------------- HELPERS ----------------
        function movePlatformsDown(delta) {
            platforms.forEach(p => p.y += delta);
            cameraY += delta;
            highestCameraY = Math.max(highestCameraY, cameraY);
        }

        function keepVisiblePlatforms() {
            platforms = platforms.filter(p => p.y < gameHeight);
        }

        function drawPlatforms() {
            platforms.forEach(p => p.draw());
        }

        function drawScore() {
            const score = Math.floor(highestCameraY);
            highScore = Math.max(highScore, score);

            ctx.save();
            ctx.fillStyle = 'rgb(255, 197, 104)';
            ctx.font = '18px "Betania Patmos"';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Score: ${score}`, 20, 28);
            ctx.fillText(`Highest Score: ${highScore}`, 20, 46);
            ctx.restore();
        }

        function drawPauseButton() {
            ctx.save();
            ctx.fillStyle = 'rgb(255, 197, 104)';
            ctx.font = '17px "Betania Patmos"';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText('||', pauseButton.x + pauseButton.width / 2, pauseButton.y + pauseButton.height / 2 + 1);
            ctx.restore();
        }

        function togglePause() {
            if (gameOver) return;
            paused = !paused;
            if (resumeButton) resumeButton.style.display = paused ? 'flex' : 'none';
        }

        function getCanvasPointFromEvent(event) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = gameWidth / rect.width;
            const scaleY = gameHeight / rect.height;
            return {
                x: (event.clientX - rect.left) * scaleX,
                y: (event.clientY - rect.top) * scaleY
            };
        }

        canvas.addEventListener('click', (event) => {
            if (gameOver) return;

            const point = getCanvasPointFromEvent(event);

            const insidePauseButton =
                point.x >= pauseButton.x &&
                point.x <= pauseButton.x + pauseButton.width &&
                point.y >= pauseButton.y &&
                point.y <= pauseButton.y + pauseButton.height;

            if (!paused && insidePauseButton) {
                togglePause();
            }
        });

        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                paused = false;
                resumeButton.style.display = 'none';
            });
        }

        function drawFinalMessage(score, bestScore, isNewHighScore) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(0, 0, gameWidth, gameHeight);

            ctx.fillStyle = 'rgb(255, 197, 104)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const messageBaseY = gameHeight / 2 + 70;

            ctx.font = '30px "Betania Patmos"';
            ctx.fillText('Game Over', gameWidth / 2, messageBaseY);

            ctx.font = '18px "Betania Patmos"';
            ctx.fillText(`Final Score: ${score}`, gameWidth / 2, messageBaseY + 34);
            ctx.fillText(`Highest Score: ${bestScore}`, gameWidth / 2, messageBaseY + 62);

            const statusText = isNewHighScore
                ? 'New High Score!'
                : `Previous Best: ${previousHighScore}`;
            ctx.fillText(statusText, gameWidth / 2, messageBaseY + 90);
            ctx.restore();
        }

        function endGame() {
            gameOver = true;
            const finalScore = Math.floor(highestCameraY);
            highScore = Math.max(highScore, finalScore);
            setStoredHighScore(highScore);
            drawFinalMessage(finalScore, highScore, finalScore > previousHighScore);
            if (resumeButton) resumeButton.style.display = 'none';
            if (playAgainButton) playAgainButton.style.display = 'flex';
        }

        // ---------------- GAME LOOP ----------------
        function gameLoop() {
            if (gameOver) return;

            ctx.clearRect(0, 0, gameWidth, gameHeight);

            drawBackground();

            if (!paused) {
                if (keys['ArrowLeft']) { prince.x -= moveSpeed; prince.direction = 'left'; }
                if (keys['ArrowRight']) { prince.x += moveSpeed; prince.direction = 'right'; }

                if (tiltControlsReady) {
                    const tiltMoveSpeed = moveSpeed * (isPhoneControls ? phoneTiltMultiplier : 2.0);
                    prince.x += tiltInput * tiltMoveSpeed;
                    if (tiltInput < -0.02) prince.direction = 'left';
                    if (tiltInput > 0.02) prince.direction = 'right';
                }

                prince.update();

                if (canScrollCamera && prince.velocityY < 0 && prince.y < gameHeight / 2) {
                    let delta = (gameHeight / 2 - prince.y) * cameraScrollFactor;
                    prince.y = gameHeight / 2;
                    movePlatformsDown(delta);
                    keepVisiblePlatforms();

                    while (platforms.length < 6) {
                        let x = Math.random() * (gameWidth - 80);
                        let y = -10;
                        platforms.push(new Platform(x, y));
                    }
                }

                if (prince.velocityY > 0) {
                    const currentBottom = prince.y + (prince.height - prince.hitboxInsetBottom);
                    const previousBottom = prince.previousY + (prince.height - prince.hitboxInsetBottom);
                    const feetLeft = prince.x + prince.hitboxInsetLeft;
                    const feetRight = prince.x + prince.width - prince.hitboxInsetRight;

                    let landingPlatform = null;
                    for (const p of platforms) {
                        const crossedTop = previousBottom <= p.y + landingTolerance && currentBottom >= p.y - landingTolerance;
                        const feetOverPlatform = feetRight > p.x && feetLeft < p.x + p.width;
                        if (crossedTop && feetOverPlatform && (!landingPlatform || p.y < landingPlatform.y)) {
                            landingPlatform = p;
                        }
                    }

                    if (landingPlatform) {
                        const impactSpeed = prince.velocityY;
                        prince.y = landingPlatform.y - (prince.height - prince.hitboxInsetBottom);
                        prince.previousY = prince.y;
                        canScrollCamera = landingPlatform !== lastJumpPlatform;
                        lastJumpPlatform = landingPlatform;
                        prince.playLandingFX(impactSpeed);
                        playStepSound();
                        prince.jump();
                    }
                }
            }

            drawPlatforms();
            prince.draw();
            drawScore();

            if (paused) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fillRect(0, 0, gameWidth, gameHeight);
                ctx.restore();
            } else {
                const princeRenderedTop = prince.y - prince.hitboxInsetBottom;
                if (princeRenderedTop > gameHeight) {
                    outOfBoundsFrames++;
                    if (outOfBoundsFrames > 18) {
                        playFallSound();
                        endGame();
                        return;
                    }
                } else {
                    outOfBoundsFrames = 0;
                }
            }

            drawPauseButton();

            requestAnimationFrame(gameLoop);
        }

        // ---------------- START GAME ----------------
        let imagesReady = 0;
        const totalImages = 4;
        let gameLoopStarted = false;

        const markImageReady = () => {
            imagesReady++;
            if (!gameLoopStarted && imagesReady >= totalImages) {
                gameLoopStarted = true;
                if (typeof onReady === 'function') onReady();
                gameLoop();
            }
        };

        const wireImage = (image, src) => {
            let settled = false;
            const settle = () => {
                if (settled) return;
                settled = true;
                markImageReady();
            };

            image.addEventListener('load', settle, { once: true });
            image.addEventListener('error', settle, { once: true });
            image.src = src;
            if (image.complete) {
                settle();
            }
        };

        wireImage(leftImage, 'images/left.png');
        wireImage(rightImage, 'images/right.png');
        wireImage(startBackground, 'images/background.jpg');
        wireImage(skyImage, 'images/sky.PNG');
    }
});