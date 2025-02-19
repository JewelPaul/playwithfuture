class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrixCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.fontSize = 20; // Fixed size
        this.colorScheme = 0;
        
        this.characters = '01abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*(){}[]|;:,./<>?~_+░▒▓█▄▀←→↑↓◢◣◤◥';
        
        // Professional color schemes
        this.colors = [
            { bright: '#00ff00', dim: '#003300', name: 'Matrix Green' },
            { bright: '#00fff2', dim: '#003333', name: 'Cyber Blue' },
            { bright: '#ff00d4', dim: '#330033', name: 'Neon Pink' },
            { bright: '#ff0000', dim: '#330000', name: 'Digital Red' },
            { bright: '#0066ff', dim: '#001933', name: 'Electric Blue' },
            { bright: '#ffff00', dim: '#333300', name: 'Solar Yellow' },
            { bright: '#ff8800', dim: '#331100', name: 'Amber Orange' },
            { bright: '#aa00ff', dim: '#220033', name: 'Quantum Purple' },
            { bright: '#ffffff', dim: '#333333', name: 'Monochrome' }
        ];

        // Get color button
        this.colorBtn = document.getElementById('colorBtn');

        this.setupCanvas();
        this.createDrops();
        this.addEventListeners();
        this.updateUI();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
    }

    createDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = {
                x: i * this.fontSize,
                y: Math.random() * -100,
                speed: Math.random() * 2 + 3, // Fixed speed range
                text: this.generateText(),
                length: Math.floor(Math.random() * 20 + 5),
                glowIntensity: Math.random() * 0.5 + 0.5
            };
        }
    }

    generateText() {
        let text = '';
        const length = Math.floor(Math.random() * 20 + 5);
        for (let i = 0; i < length; i++) {
            text += this.characters[Math.floor(Math.random() * this.characters.length)];
        }
        return text;
    }

    updateUI() {
        this.colorBtn.textContent = `Color: ${this.colors[this.colorScheme].name}`;
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.createDrops();
        });

        // Only color button handler
        this.colorBtn.addEventListener('click', () => {
            this.colorScheme = (this.colorScheme + 1) % this.colors.length;
            this.updateUI();
        });
    }

    draw() {
        const fadeColor = this.colors[this.colorScheme].dim.substring(0, 7);
        this.ctx.fillStyle = `${fadeColor}22`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px 'Share Tech Mono'`;
        this.ctx.shadowBlur = 5;

        this.drops.forEach((drop, i) => {
            for (let j = 0; j < drop.text.length; j++) {
                const char = drop.text[j];
                const y = drop.y - (j * this.fontSize);
                
                if (y < 0) continue;
                
                const opacity = 1 - (j / drop.text.length);
                
                if (j === 0) {
                    this.ctx.shadowColor = this.colors[this.colorScheme].bright;
                    this.ctx.shadowBlur = 15 * drop.glowIntensity;
                    this.ctx.fillStyle = this.colors[this.colorScheme].bright;
                } else {
                    this.ctx.shadowBlur = 5;
                    this.ctx.shadowColor = 'transparent';
                    const dimColor = this.colors[this.colorScheme].dim;
                    this.ctx.fillStyle = `${dimColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                }
                
                this.ctx.fillText(char, drop.x, y);
            }

            drop.y += drop.speed;

            if (drop.y > this.canvas.height + drop.length * this.fontSize) {
                this.drops[i] = {
                    x: i * this.fontSize,
                    y: -drop.length * this.fontSize,
                    speed: Math.random() * 2 + 3,
                    text: this.generateText(),
                    length: Math.floor(Math.random() * 20 + 5),
                    glowIntensity: Math.random() * 0.5 + 0.5
                };
            }
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MatrixRain();
});