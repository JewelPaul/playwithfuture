class TimePaint {
    constructor() {
        this.canvas = document.getElementById('paintCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.brushSize = 10;
        this.lastX = 0;
        this.lastY = 0;
        this.hue = 0;
        this.direction = true;

        this.setupCanvas();
        this.addEventListeners();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth - 320; // Account for ad spaces
        this.canvas.height = window.innerHeight - 180; // Account for ad spaces
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.globalCompositeOperation = 'screen';
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.setupCanvas());
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        document.getElementById('sizeSlider').addEventListener('change', (e) => {
            this.brushSize = e.target.value;
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `timepaint-${Date.now()}.png`;
            link.href = this.canvas.toDataURL();
            link.click();
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = this.getMousePos(e);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }

    draw(e) {
        if (!this.isDrawing) return;

        const [x, y] = this.getMousePos(e);
        const time = new Date();
        
        // Use time components for visual effects
        this.hue = (time.getSeconds() * 6 + time.getMilliseconds() / 1000 * 6) % 360;
        const sat = time.getMinutes() * 100 / 60;
        const light = time.getHours() * 100 / 24;

        this.ctx.strokeStyle = `hsl(${this.hue}, ${sat}%, ${light}%)`;
        this.ctx.lineWidth = this.brushSize;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        // Create particles
        this.createParticles(x, y);

        [this.lastX, this.lastY] = [x, y];
    }

    createParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            const particle = {
                x: x + Math.random() * 20 - 10,
                y: y + Math.random() * 20 - 10,
                size: Math.random() * this.brushSize / 2,
                hue: this.hue + Math.random() * 30 - 15,
                life: 1
            };

            const animate = () => {
                if (particle.life <= 0) return;
                
                particle.life -= 0.02;
                particle.size *= 0.95;
                
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.life})`;
                this.ctx.fill();

                requestAnimationFrame(animate);
            };

            animate();
        }
    }

    stopDrawing() {
        this.isDrawing = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TimePaint();
});
