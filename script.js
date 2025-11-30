// Wait for the page to fully load
window.addEventListener('load', () => {
    // Small delay to ensure the browser has rendered the initial state
    setTimeout(() => {
        document.body.classList.remove("not-loaded");
    }, 1000);

    // Generate Fireflies
    const firefliesContainer = document.querySelector('.fireflies');
    const fireflyCount = 30;

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

    // Erupt every 1.2 seconds
    setInterval(createMoonEmoji, 1200);

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

    // Create a heart star every few seconds
    setInterval(createHeartStar, 2000);

    // Love Bar Game Logic
    const loveBarFill = document.getElementById('love-bar-fill');
    const recordMarker = document.getElementById('record-marker');
    const messageDisplay = document.getElementById('message-display');
    const attemptsDisplay = document.getElementById('attempts-count');

    let currentLevel = 0;
    let direction = 1; // 1 for up, -1 for down
    let isPlaying = false;
    let animationId;
    let attempts = 3;
    let gameOver = false;

    // RESET RECORD (User Request)
    localStorage.setItem('loveBarRecord', 0);

    let record = localStorage.getItem('loveBarRecord') || 0;

    // Initialize marker position
    recordMarker.style.bottom = record + '%';

    function gameLoop() {
        if (!isPlaying) return;

        // IMPOSSIBLE DIFFICULTY MODE (EXTREME)
        // Below 70%: Normal ramp up
        // Above 70%: TELEPORT SPEED. Impossible to time.

        let finalSpeed;

        if (currentLevel > 70) {
            // "Impossible" -> Moves 15% per frame! It's a blur.
            finalSpeed = 15.0 + Math.random() * 5.0;
        } else {
            // Progressive difficulty up to 70%
            let baseSpeed = 0.5;
            let ramp = (currentLevel / 70) * 2.0;
            finalSpeed = baseSpeed + ramp;
        }

        currentLevel += finalSpeed * direction;

        if (currentLevel >= 100) {
            currentLevel = 100;
            direction = -1;
        } else if (currentLevel <= 0) {
            currentLevel = 0;
            direction = 1;
        }

        loveBarFill.style.height = currentLevel + '%';
        animationId = requestAnimationFrame(gameLoop);
    }

    function stopGame() {
        if (gameOver) return;

        if (!isPlaying) {
            if (attempts > 0) {
                // Start game
                isPlaying = true;
                messageDisplay.innerText = "Durdurmak için bas!";
                gameLoop();
            }
        } else {
            // Stop game
            isPlaying = false;
            cancelAnimationFrame(animationId);
            attempts--;
            attemptsDisplay.innerText = attempts;

            const score = Math.floor(currentLevel);

            if (score > record) {
                record = score;
                localStorage.setItem('loveBarRecord', record);
                recordMarker.style.bottom = record + '%';
                messageDisplay.innerText = `Tebrikler! Yeni Rekor: ${score}% 🎉`;
                createConfetti();
            } else {
                messageDisplay.innerText = `Skor: ${score}%.`;
            }

            if (attempts === 0) {
                gameOver = true;
                messageDisplay.innerText = `Oyun Bitti! En İyi: ${record}%`;
                loveBarFill.style.backgroundColor = '#555'; // Grey out bar
            }
        }
    }

    function createConfetti() {
        for (let i = 0; i < 50; i++) {
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

    document.addEventListener('touchstart', stopGame);
    document.addEventListener('click', (e) => {
        // Prevent click from triggering immediately after touchstart on mobile
        stopGame();
    });
});

// Fallback: If load event doesn't fire for some reason (e.g. some preview environments), try DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.classList.remove("not-loaded");
    }, 1500);
});
