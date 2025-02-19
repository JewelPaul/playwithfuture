class PixelRain {
    constructor() {
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pixels = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.colorMode = 'neon';
        this.speed = 1;
        this.pixelSize = 4;
        this.gravity = 1;
        this.poolHeight = 0;
        
        this.colorModes = {
            neon: ['#00fff2', '#ff00ff', '#00ff00', '#ffff00', '#ff0000'],
            rainbow: (i) => `hsl(${(i * 2) % 360}, 100%, 50%)`,
            mono: ['#00fff2'],
            matrix: ['#00ff00'],
            fire: ['#ff0000', '#ff4400', '#ff8800', '#ffbb00']
        };

        this.init();
        this.setupControls();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        window.addEventListener('click', () => this.createExplosion());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.poolHeight = 0;
    }

    setupControls() {
        const colorModeBtn = document.getElementById('colorModeBtn');
        const speedBtn = document.getElementById('speedBtn');
        const sizeBtn = document.getElementById('sizeBtn');
        const gravityBtn = document.getElementById('gravityBtn');

        const colorModes = ['neon', 'rainbow', 'mono', 'matrix', 'fire'];
        let colorIndex = 0;
        colorModeBtn.onclick = () => {
            colorIndex = (colorIndex + 1) % colorModes.length;
            this.colorMode = colorModes[colorIndex];
            colorModeBtn.textContent = `Color Mode: ${this.colorMode.charAt(0).toUpperCase() + this.colorMode.slice(1)}`;
        };

        const speeds = [0.5, 1, 2, 3];
        let speedIndex = 1;
        speedBtn.onclick = () => {
            speedIndex = (speedIndex + 1) % speeds.length;
            this.speed = speeds[speedIndex];
            speedBtn.textContent = `Speed: ${this.speed === 1 ? 'Normal' : this.speed < 1 ? 'Slow' : 'Fast x' + this.speed}`;
        };

        const sizes = [2, 4, 6, 8];
        let sizeIndex = 1;
        sizeBtn.onclick = () => {
            sizeIndex = (sizeIndex + 1) % sizes.length;
            this.pixelSize = sizes[sizeIndex];
            sizeBtn.textContent = `Pixel Size: ${this.pixelSize === 4 ? 'Normal' : this.pixelSize < 4 ? 'Small' : 'Large'}`;
        };

        const gravities = [0.5, 1, 2, 3];
        let gravityIndex = 1;
        gravityBtn.onclick = () => {
            gravityIndex = (gravityIndex + 1) % gravities.length;
            this.gravity = gravities[gravityIndex];
            gravityBtn.textContent = `Gravity: ${this.gravity === 1 ? 'Normal' : this.gravity < 1 ? 'Low' : 'High'}`;
        };
    }

    createPixel(x, y, force = false) {
        if (force || Math.random() < 0.3) {
            const color = this.colorMode === 'rainbow' 
                ? this.colorModes.rainbow(this.pixels.length)
                : this.colorModes[this.colorMode][Math.floor(Math.random() * this.colorModes[this.colorMode].length)];
            
            this.pixels.push({
                x: x || Math.random() * this.canvas.width,
                y: y || -this.pixelSize,
                size: this.pixelSize,
                speed: (Math.random() * 2 + 1) * this.speed,
                color: color,
                opacity: 1
            });
        }
    }

    createExplosion() {
        const explosionCenter = {
            x: this.mouseX,
            y: this.mouseY
        };

        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 / 50) * i;
            const distance = Math.random() * 100;
            const x = explosionCenter.x + Math.cos(angle) * distance;
            const y = explosionCenter.y + Math.sin(angle) * distance;
            this.createPixel(x, y, true);
        }
    }

    update() {
        // Create new pixels
        this.createPixel();

        // Update existing pixels
        this.pixels = this.pixels.filter(pixel => {
            // Apply mouse influence
            const dx = this.mouseX - pixel.x;
            const dy = this.mouseY - pixel.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                pixel.x -= Math.cos(angle) * (100 - distance) * 0.1;
            }

            // Update position
            pixel.y += pixel.speed * this.gravity;
            
            // Pool at bottom
            if (pixel.y > this.canvas.height - this.poolHeight) {
                pixel.y = this.canvas.height - this.poolHeight;
                pixel.opacity -= 0.01;
                return pixel.opacity > 0;
            }

            return pixel.y < this.canvas.height + pixel.size;
        });

        // Gradually increase pool height
        if (this.pixels.length > 100) {
            this.poolHeight = Math.min(this.poolHeight + 0.1, this.canvas.height * 0.3);
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.pixels.forEach(pixel => {
            this.ctx.fillStyle = pixel.color + Math.floor(pixel.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.shadowColor = pixel.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
window.addEventListener('load', () => new PixelRain());