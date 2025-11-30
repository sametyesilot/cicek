// Wait for the page to fully load
window.addEventListener('load', () => {
    // Small delay to ensure the browser has rendered the initial state
    setTimeout(() => {
        document.body.classList.remove("not-loaded");
    }, 1000);

    // Generate Fireflies
    const firefliesContainer = document.querySelector('.fireflies');
    const isMobile = window.innerWidth < 768;
    const fireflyCount = isMobile ? 10 : 30; // Reduce fireflies on mobile

    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // Random position
        firefly.style.left = Math.random() * 100 + '%';
        firefly.style.top = Math.random() * 100 + '%';

        // Random animation properties
        firefly.style.animationDuration = (Math.random() * 5 + 5) + 's, ' + (Math.random() * 2 + 1) + 's';
        firefly.style.animationDelay = Math.random() * 5 + 's';

        firefliesContainer.appendChild(firefly);
    }

    // Moon Emojis
    const emojis = ['❤️', '💖', '💘', '💕', '💓', '💗', '💞', '💟', '😍', '😘'];

    function createMoonEmoji() {
        const emoji = document.createElement('div');
        emoji.classList.add('moon-emoji');
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];

        // Random direction for burst (mostly downwards/leftwards since moon is top right)
        // tx: -10vmin to +2vmin (Reduced distance)
        // ty: -2vmin to +10vmin (Reduced distance)
        const tx = (Math.random() * 12 - 10) + 'vmin';
        const ty = (Math.random() * 12 - 2) + 'vmin';

        emoji.style.setProperty('--tx', tx);
        emoji.style.setProperty('--ty', ty);

        document.body.appendChild(emoji);

        setTimeout(() => {
            emoji.remove();
        }, 2000);
    }

    // Heart Shooting Stars
    function createHeartStar() {
        const star = document.createElement('div');
        star.classList.add('heart-star');

        // Random start position (mostly top right)
        star.style.left = (Math.random() * 50 + 50) + '%';
        star.style.top = (Math.random() * 50) + '%';

        // Random delay and duration
        star.style.animationDuration = (Math.random() * 1 + 1.5) + 's';

        document.body.appendChild(star);

        // Remove after animation
        setTimeout(() => {
            star.remove();
        }, 2500);
    }

    // Only enable heavy animations on desktop
    if (!isMobile) {
        // Erupt every 1.2 seconds
        setInterval(createMoonEmoji, 1200);
        // Create a heart star every few seconds
        setInterval(createHeartStar, 2000);
    }

    // Love Bar Game Logic
    const loveBarFill = document.getElementById('love-bar-fill');
    const recordMarker = document.getElementById('record-marker');
    const messageDisplay = document.getElementById('message-display');
    const attemptsDisplay = document.getElementById('attempts-count');

    let currentLevel = 0;
    let direction = 1;
    let isPlaying = false;
    let animationId;
    let gameOver = false;

    // PERSISTENT ATTEMPTS
    // RESET ATTEMPTS (User Request)
    localStorage.setItem('loveBarAttempts', 3);
    let attempts = 3;
    attemptsDisplay.innerText = attempts;

    // MOCK GLOBAL RECORD SYSTEM
    // RESET RECORD (User Request)
    localStorage.setItem('loveBarRecord', 0);

    // 1. Load local record
    // 2. Fetch "global" record from JSON
    // 3. Show the higher of the two
    let localRecord = 0; // Since we just reset it
    let globalRecord = 0;
    let displayRecord = localRecord;

    // Fetch mock global record
    fetch('record.json')
        .then(response => response.json())
        .then(data => {
            globalRecord = data.record || 0;
            // If global record is higher than local, show it (simulate "someone else's" record)
            if (globalRecord > localRecord) {
                displayRecord = globalRecord;
            }
            updateRecordDisplay();
        })
        .catch(err => console.log('Record fetch error:', err));

    function updateRecordDisplay() {
        recordMarker.style.bottom = displayRecord + '%';
    }

    // Initial display
    updateRecordDisplay();

    // Check if game over on load
    if (attempts <= 0) {
        gameOver = true;
        messageDisplay.innerText = `Oyun Bitti! En İyi: ${displayRecord}%`;
        loveBarFill.style.backgroundColor = '#555';
    }

    // PERFORMANCE OPTIMIZED LOOP
    // Using transform: scaleY for GPU acceleration
    // Minimized DOM writes
    let lastTime = 0;

    function gameLoop(timestamp) {
        if (!isPlaying) return;

        // Delta time calculation for consistent speed across frame rates
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // Base speed adjustment (normalized for 60fps approx 16ms)
        const timeScale = deltaTime / 16.67;

        // IMPOSSIBLE DIFFICULTY MODE (EXTREME)
        let finalSpeed;

        if (currentLevel > 70) {
            // "Impossible" -> Moves very fast
            finalSpeed = (15.0 + Math.random() * 5.0) * timeScale;
        } else {
            // Progressive difficulty
            let baseSpeed = 0.5;
            let ramp = (currentLevel / 70) * 2.0;
            finalSpeed = (baseSpeed + ramp) * timeScale;
        }

        currentLevel += finalSpeed * direction;

        if (currentLevel >= 100) {
            currentLevel = 100;
            direction = -1;
        } else if (currentLevel <= 0) {
            currentLevel = 0;
            direction = 1;
        }

        // GPU ACCELERATED RENDER
        // ScaleY takes 0 to 1 value
        loveBarFill.style.transform = `scaleY(${currentLevel / 100})`;

        animationId = requestAnimationFrame(gameLoop);
    }

    function stopGame(e) {
        if (e && e.type === 'touchstart') {
            e.preventDefault();
        }

        if (gameOver) return;

        if (!isPlaying) {
            if (attempts > 0) {
                isPlaying = true;
                lastTime = 0; // Reset time
                messageDisplay.innerText = "Durdurmak için bas!";
                animationId = requestAnimationFrame(gameLoop);
            }
        } else {
            isPlaying = false;
            cancelAnimationFrame(animationId);

            // Decrement and Save Attempts
            attempts--;
            localStorage.setItem('loveBarAttempts', attempts);
            attemptsDisplay.innerText = attempts;

            const score = Math.floor(currentLevel);

            // Check against Display Record (Global or Local)
            if (score > displayRecord) {
                // New Record!
                localRecord = score;
                displayRecord = score;
                localStorage.setItem('loveBarRecord', localRecord);
                updateRecordDisplay();

                messageDisplay.innerText = `Tebrikler! Yeni Rekor: ${score}% 🎉`;
                createConfetti();
            } else {
                messageDisplay.innerText = `Skor: ${score}%.`;
            }

            if (attempts === 0) {
                gameOver = true;
                messageDisplay.innerText = `Oyun Bitti! En İyi: ${displayRecord}%`;
                loveBarFill.style.backgroundColor = '#555';
            }
        }
    }

    function createConfetti() {
        const confettiCount = isMobile ? 20 : 50; // Reduce confetti on mobile
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = '50%';
            confetti.style.top = '50%';
            confetti.style.width = '1vmin';
            confetti.style.height = '1vmin';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.zIndex = '100';
            confetti.style.pointerEvents = 'none';

            // Random explosion direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 20 + 10;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            confetti.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}vmin, ${ty}vmin) scale(0)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)',
                fill: 'forwards'
            });

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 2000);
        }
    }

    // Controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            stopGame();
        }
    });

    // Handle touchstart with passive: false to allow preventDefault
    document.addEventListener('touchstart', stopGame, { passive: false });

    document.addEventListener('click', (e) => {
        // We can keep click for desktop, but on mobile touchstart will handle it.
        // If it's a mouse click, e.detail is usually 1.
        // We can just rely on the fact that we preventDefault on touchstart, 
        // so the click event shouldn't fire on touch devices.
        stopGame();
    });
});

// Fallback: If load event doesn't fire for some reason (e.g. some preview environments), try DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.classList.remove("not-loaded");
    }, 1500);
});
