class NeonPong {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.paddleHeight = 100;
        this.paddleWidth = 15;
        this.ballSize = 10;
        this.ballSpeed = 5;
        this.paddleSpeed = 8;
        this.aiSpeed = 6;
        this.winScore = 5;

        // Initialize game state
        this.isPlaying = false;
        this.initialize();
        this.setupEventListeners();
        this.startScreenLoop();
    }

    initialize() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 500;

        // Initialize game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: this.ballSpeed,
            dy: 0
        };

        this.player = {
            x: this.paddleWidth * 2,
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0
        };

        this.ai = {
            x: this.canvas.width - this.paddleWidth * 3,
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0
        };

        // Input tracking
        this.keys = {
            up: false,
            down: false
        };
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') this.keys.up = true;
            if (e.key === 'ArrowDown') this.keys.down = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp') this.keys.up = false;
            if (e.key === 'ArrowDown') this.keys.down = false;
        });

        // Game buttons
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        this.isPlaying = true;
        this.gameLoop();
    }

    restartGame() {
        document.getElementById('win-screen').classList.add('hidden');
        this.initialize();
        this.isPlaying = true;
        this.gameLoop();
    }

    update() {
        if (!this.isPlaying) return;

        // Update player paddle
        if (this.keys.up) this.player.y = Math.max(0, this.player.y - this.paddleSpeed);
        if (this.keys.down) this.player.y = Math.min(this.canvas.height - this.paddleHeight, this.player.y + this.paddleSpeed);

        // Update AI paddle
        const aiCenter = this.ai.y + this.paddleHeight / 2;
        const ballCenter = this.ball.y;
        if (Math.abs(aiCenter - ballCenter) > this.aiSpeed) {
            if (aiCenter < ballCenter) this.ai.y += this.aiSpeed;
            else this.ai.y -= this.aiSpeed;
        }

        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }

        // Ball collision with paddles
        if (this.checkPaddleCollision(this.player) || this.checkPaddleCollision(this.ai)) {
            this.ball.dx *= -1;
            this.ball.dy = (Math.random() - 0.5) * this.ballSpeed;
        }

        // Score points
        if (this.ball.x <= 0) {
            this.ai.score++;
            this.resetBall('ai');
        } else if (this.ball.x >= this.canvas.width) {
            this.player.score++;
            this.resetBall('player');
        }

        // Check for win
        if (this.player.score >= this.winScore || this.ai.score >= this.winScore) {
            this.endGame();
        }

        // Update score display
        document.getElementById('player-score').textContent = this.player.score;
        document.getElementById('ai-score').textContent = this.ai.score;
    }

    checkPaddleCollision(paddle) {
        return this.ball.x >= paddle.x && 
               this.ball.x <= paddle.x + this.paddleWidth &&
               this.ball.y >= paddle.y &&
               this.ball.y <= paddle.y + this.paddleHeight;
    }

    resetBall(scorer) {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ballSpeed * (scorer === 'ai' ? 1 : -1);
        this.ball.dy = 0;
    }

    endGame() {
        this.isPlaying = false;
        const winScreen = document.getElementById('win-screen');
        const winMessage = document.getElementById('win-message');
        winMessage.textContent = this.player.score > this.ai.score ? 'You Win!' : 'AI Wins!';
        winScreen.classList.remove('hidden');
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#00fff2';
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#00fff2';
        this.ctx.fillRect(this.player.x, this.player.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillRect(this.ai.x, this.ai.y, this.paddleWidth, this.paddleHeight);

        // Draw ball with glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00fff2';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize, 0, Math.PI * 2);
        this.ctx.fillStyle = '#00fff2';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    startScreenLoop() {
        if (!this.isPlaying) {
            this.draw();
            requestAnimationFrame(() => this.startScreenLoop());
        }
    }

    gameLoop() {
        if (this.isPlaying) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeonPong();
});