class ParticleExplosion {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.gravity = false;
        this.colorScheme = 0;
        this.colorSchemes = [
            ['#00fff2', '#ff00d4', '#00ff88'],
            ['#ff0000', '#ff8800', '#ffff00'],
            ['#00ff00', '#00ffff', '#0088ff'],
            ['#ff00ff', '#ff0088', '#ff0000']
        ];

        this.setupCanvas();
        this.addEventListeners();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.setupCanvas());
        this.canvas.addEventListener('click', (e) => this.createExplosion(e));
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) {
                this.createExplosion(e);
            }
        });

        document.getElementById('gravityBtn').addEventListener('click', (e) => {
            this.gravity = !this.gravity;
            e.target.classList.toggle('active');
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.colorScheme = (this.colorScheme + 1) % this.colorSchemes.length;
        });
    }

    createExplosion(e) {
        const x = e.clientX;
        const y = e.clientY;
        const colors = this.colorSchemes[this.colorScheme];

        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const velocity = 5 + Math.random() * 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                radius: Math.random() * 3 + 1,
                color: color,
                life: 1,
                spin: Math.random() * 0.2 - 0.1,
                trail: []
            });
        }
    }

    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (this.gravity) {
            particle.vy += 0.2;
        }
        
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        particle.life -= 0.01;

        // Update trail
        particle.trail.unshift({ x: particle.x, y: particle.y });
        if (particle.trail.length > 5) {
            particle.trail.pop();
        }
    }

    drawParticle(particle) {
        // Draw trail
        this.ctx.beginPath();
        this.ctx.moveTo(particle.trail[0]?.x || particle.x, particle.trail[0]?.y || particle.y);
        particle.trail.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.strokeStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
        this.ctx.lineWidth = particle.radius;
        this.ctx.stroke();

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 10, 31, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(particle => {
            if (particle.life > 0) {
                this.updateParticle(particle);
                this.drawParticle(particle);
                return true;
            }
            return false;
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParticleExplosion();
});