class QuantumBubble {
    constructor() {
        this.canvas = document.getElementById('bubbleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.combo = 0;
        this.bubbles = [];
        this.lastSpawn = 0;
        this.spawnInterval = 1000;
        this.colors = ['#00fff2', '#ff00d4', '#00ff88'];
        
        this.setupCanvas();
        this.addEventListeners();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.setupCanvas());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    createBubble() {
        const size = Math.random() * 40 + 20;
        return {
            x: Math.random() * (this.canvas.width - size * 2) + size,
            y: this.canvas.height + size,
            size: size,
            speed: Math.random() * 2 + 1,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            angle: Math.random() * Math.PI * 2,
            wobble: Math.random() * 2 * Math.PI,
            wobbleSpeed: Math.random() * 0.1
        };
    }

    updateBubbles() {
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnInterval) {
            this.bubbles.push(this.createBubble());
            this.lastSpawn = now;
        }

        this.bubbles = this.bubbles.filter(bubble => {
            bubble.y -= bubble.speed;
            bubble.wobble += bubble.wobbleSpeed;
            bubble.x += Math.sin(bubble.wobble) * 2;
            return bubble.y + bubble.size > 0;
        });
    }

    drawBubble(bubble) {
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        this.ctx.fillStyle = bubble.color + '33';  // 20% opacity
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.size - 2, 0, Math.PI * 2);
        this.ctx.strokeStyle = bubble.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Shine effect
        this.ctx.beginPath();
        this.ctx.arc(
            bubble.x - bubble.size * 0.3,
            bubble.y - bubble.size * 0.3,
            bubble.size * 0.2,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#ffffff44';
        this.ctx.fill();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const distance = Math.hypot(bubble.x - x, bubble.y - y);

            if (distance < bubble.size) {
                this.bubbles.splice(i, 1);
                this.combo++;
                this.score += this.combo * 10;
                this.updateScore();
                this.createPopEffect(bubble);
                return;
            }
        }

        this.combo = 0;
        this.updateScore();
    }

    createPopEffect(bubble) {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            particles.push({
                x: bubble.x,
                y: bubble.y,
                speed: 5,
                angle: angle,
                color: bubble.color,
                life: 1
            });
        }

        const animate = () => {
            particles.forEach(particle => {
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed;
                particle.life -= 0.02;
                
                if (particle.life > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
                    this.ctx.fill();
                }
            });

            if (particles.some(p => p.life > 0)) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('comboValue').textContent = this.combo;
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateBubbles();
        this.bubbles.forEach(bubble => this.drawBubble(bubble));
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuantumBubble();
});
