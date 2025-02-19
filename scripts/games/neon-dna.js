class NeonDNA {
    constructor() {
        this.canvas = document.getElementById('dnaCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize properties
        this.dnaStrands = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotation = 0;
        this.activeColor = '#00fff2';
        
        // Configuration
        this.config = {
            speed: 0.5,
            strands: 2,
            glowIntensity: 0.7,
            baseRadius: 100,
            particleCount: 30,
            particleSize: 4
        };

        this.setupCanvas();
        this.setupEventListeners();
        this.createStrands();
        this.animate();
    }

    setupCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    setupEventListeners() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Controls
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.config.speed = e.target.value / 50;
        });

        document.getElementById('strandSlider').addEventListener('input', (e) => {
            this.config.strands = parseInt(e.target.value);
            this.createStrands();
        });

        document.getElementById('glowSlider').addEventListener('input', (e) => {
            this.config.glowIntensity = e.target.value / 100;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.createStrands();
        });

        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.style.backgroundColor = btn.dataset.color;
            btn.addEventListener('click', () => {
                this.activeColor = btn.dataset.color;
                this.createStrands();
            });
        });
    }

    createStrands() {
        this.dnaStrands = [];
        for (let i = 0; i < this.config.strands; i++) {
            this.dnaStrands.push(new DNAStrand(
                this.config.particleCount,
                this.activeColor,
                i * (Math.PI * 2 / this.config.strands)
            ));
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update rotation based on mouse position
        const dx = this.mouseX - this.centerX;
        const dy = this.mouseY - this.centerY;
        const targetRotation = Math.atan2(dy, dx);
        this.rotation += (targetRotation - this.rotation) * 0.05;

        // Draw strands
        this.dnaStrands.forEach(strand => {
            strand.update(this.rotation, this.config);
            strand.draw(this.ctx, this.centerX, this.centerY, this.config);
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class DNAStrand {
    constructor(particleCount, color, offset = 0) {
        this.particles = [];
        this.color = color;
        this.offset = offset;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                phase: (i / particleCount) * Math.PI * 2
            });
        }
    }

    update(rotation, config) {
        this.particles.forEach(particle => {
            particle.phase += config.speed * 0.05;
        });
    }

    draw(ctx, centerX, centerY, config) {
        ctx.shadowBlur = 20 * config.glowIntensity;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        this.particles.forEach(particle => {
            const x = centerX + Math.cos(particle.phase + this.offset) * config.baseRadius;
            const y = centerY + Math.sin(particle.phase + this.offset) * config.baseRadius;

            ctx.beginPath();
            ctx.arc(x, y, config.particleSize, 0, Math.PI * 2);
            ctx.fill();

            // Draw connecting lines
            if (particle !== this.particles[0]) {
                const prevParticle = this.particles[this.particles.indexOf(particle) - 1];
                const prevX = centerX + Math.cos(prevParticle.phase + this.offset) * config.baseRadius;
                const prevY = centerY + Math.sin(prevParticle.phase + this.offset) * config.baseRadius;

                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeonDNA();
});