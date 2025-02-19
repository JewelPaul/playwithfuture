class ChronoRipples {
    constructor() {
        this.canvas = document.getElementById('rippleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ripples = [];
        this.autoMode = false;
        this.autoInterval = null;

        this.setupCanvas();
        this.addEventListeners();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.setupCanvas());
        this.canvas.addEventListener('click', (e) => this.createRipple(e.clientX, e.clientY));
        
        document.getElementById('autoBtn').addEventListener('click', (e) => {
            this.autoMode = !this.autoMode;
            e.target.classList.toggle('active');
            
            if (this.autoMode) {
                this.startAutoRipples();
            } else {
                clearInterval(this.autoInterval);
            }
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.ripples = [];
        });
    }

    startAutoRipples() {
        this.autoInterval = setInterval(() => {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.createRipple(x, y);
        }, 1000);
    }

    createRipple(x, y) {
        const time = new Date();
        const hue = (time.getSeconds() * 6 + time.getMilliseconds() / 1000 * 6) % 360;
        
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: Math.min(this.canvas.width, this.canvas.height) * 0.4,
            speed: 2 + Math.random() * 2,
            hue: hue,
            opacity: 1
        });
    }

    animate() {
        this.ctx.fillStyle = `rgba(10, 10, 31, 0.1)`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ripples.forEach((ripple, index) => {
            // Draw main ripple
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `hsla(${ripple.hue}, 100%, 50%, ${ripple.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw echo ripples
            for (let i = 1; i <= 3; i++) {
                const echoRadius = ripple.radius - (i * 20);
                if (echoRadius > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(ripple.x, ripple.y, echoRadius, 0, Math.PI * 2);
                    this.ctx.strokeStyle = `hsla(${ripple.hue + i * 20}, 100%, 50%, ${ripple.opacity * 0.5})`;
                    this.ctx.stroke();
                }
            }

            // Update ripple
            ripple.radius += ripple.speed;
            ripple.opacity -= 0.003;

            // Remove faded ripples
            if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
                this.ripples.splice(index, 1);
            }
        });

        // Create time-based background particles
        this.createTimeParticles();
        requestAnimationFrame(() => this.animate());
    }

    createTimeParticles() {
        const time = new Date();
        if (time.getMilliseconds() < 50) { // Limit particle creation
            const particle = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3,
                speed: Math.random() * 2 + 1,
                hue: time.getSeconds() * 6
            };

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, 0.5)`;
            this.ctx.fill();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ripples = new ChronoRipples();
    ripples.animate();
});
