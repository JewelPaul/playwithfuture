class MemoryGame {
    constructor() {
        this.levels = {
            easy: {
                symbols: ['★', '♦', '♠', '♣', '♥', '⬟', '⬢', '⬡'],
                time: 90,
                name: 'Easy Mode'
            },
            medium: {
                symbols: ['⚓', '⚔', '⚕', '⚛', '⚜', '⚝', '⚡', '⚪'],
                time: 60,
                name: 'Medium Mode'
            },
            hard: {
                symbols: ['⭐', '⭑', '✦', '✧', '✶', '✴', '✹', '✸'],
                time: 45,
                name: 'Hard Mode'
            }
        };

        this.currentLevel = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.isLocked = false;

        this.setupEventListeners();
        this.showMenu();
    }

    setupEventListeners() {
        // Menu buttons
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => this.startGame(btn.dataset.level));
        });

        // Game controls
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
    }

    showMenu() {
        document.getElementById('menuScreen').style.display = 'block';
        document.getElementById('gameScreen').style.display = 'none';
        this.loadBestTimes();
    }

    startGame(level) {
        this.currentLevel = level;
        this.timeLeft = this.levels[level].time;
        this.moves = 0;
        this.matchedPairs = 0;
        this.cards = [];
        this.flippedCards = [];

        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('levelIndicator').textContent = this.levels[level].name;
        document.getElementById('moves').textContent = '0';

        this.setupCards();
        this.startTimer();
    }

    setupCards() {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        
        const symbols = [...this.levels[this.currentLevel].symbols, ...this.levels[this.currentLevel].symbols];
        this.shuffleArray(symbols);

        symbols.forEach((symbol, index) => {
            const card = this.createCard(symbol, index);
            grid.appendChild(card);
            this.cards.push(card);
        });
    }

    createCard(symbol, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-face card-front">${symbol}</div>
            <div class="card-face card-back"></div>
        `;
        card.dataset.symbol = symbol;
        card.addEventListener('click', () => this.flipCard(card));
        return card;
    }

    flipCard(card) {
        if (this.isLocked || card.classList.contains('flipped') || 
            card.classList.contains('matched')) return;

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('moves').textContent = this.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;

        if (card1.dataset.symbol === card2.dataset.symbol) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;

            if (this.matchedPairs === this.levels[this.currentLevel].symbols.length) {
                this.handleWin();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }

        setTimeout(() => {
            this.flippedCards = [];
            this.isLocked = false;
        }, 1000);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.updateTimer();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.handleLoss();
            }
        }, 1000);
    }

    updateTimer() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    handleWin() {
        clearInterval(this.timerInterval);
        this.updateBestTime();
        setTimeout(() => {
            alert(`Congratulations! You won in ${this.moves} moves!`);
            this.showMenu();
        }, 500);
    }

    handleLoss() {
        clearInterval(this.timerInterval);
        setTimeout(() => {
            alert('Time\'s up! Try again!');
            this.showMenu();
        }, 500);
    }

    updateBestTime() {
        const currentScore = this.moves;
        const bestScore = localStorage.getItem(`best_${this.currentLevel}`) || Infinity;
        
        if (currentScore < bestScore) {
            localStorage.setItem(`best_${this.currentLevel}`, currentScore);
            this.loadBestTimes();
        }
    }

    loadBestTimes() {
        ['easy', 'medium', 'hard'].forEach(level => {
            const bestScore = localStorage.getItem(`best_${level}`);
            document.getElementById(`${level}Best`).textContent = 
                bestScore ? `${bestScore} moves` : '--';
        });
    }

    restartGame() {
        this.startGame(this.currentLevel);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});