class ClockChaos {
    constructor() {
        this.canvas = document.getElementById('chaosCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuration
        this.theme = 'neon';
        this.pattern = 'spiral';
        this.speed = 1;
        this.effect = 'wave';
        
        this.themes = {
            neon: {
                primary: '#00fff2',
                secondary: '#ff00ff',
                background: '#000000'
            },
            sunset: {
                primary: '#ff0066',
                secondary: '#ffcc00',
                background: '#000033'
            },
            forest: {
                primary: '#00ff00',
                secondary: '#006600',
                background: '#000000'
            }
        };

        this.particles = [];
        this.timePoints = [];
        
        this.init();
        this.setupControls();
        this.setupTime();
        this.animate();
    }

    setupTime() {
        const updateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            document.getElementById('timeDisplay').textContent = timeString;
            
            // Update time points for visualization
            this.updateTimePoints(hours, minutes, seconds);
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.createParticles();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    createParticles() {
        this.particles = [];
        const count = 100;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    updateTimePoints(hours, minutes, seconds) {
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.4;
        
        // Convert to 24-hour angles
        const hoursAngle = (hours % 12 + minutes / 60) * (Math.PI * 2 / 12) - Math.PI / 2;
        const minutesAngle = minutes * (Math.PI * 2 / 60) - Math.PI / 2;
        const secondsAngle = seconds * (Math.PI * 2 / 60) - Math.PI / 2;

        this.timePoints = [
            {
                x: this.centerX + Math.cos(hoursAngle) * radius * 0.5,
                y: this.centerY + Math.sin(hoursAngle) * radius * 0.5,
                angle: hoursAngle
            },
            {
                x: this.centerX + Math.cos(minutesAngle) * radius * 0.7,
                y: this.centerY + Math.sin(minutesAngle) * radius * 0.7,
                angle: minutesAngle
            },
            {
                x: this.centerX + Math.cos(secondsAngle) * radius * 0.9,
                y: this.centerY + Math.sin(secondsAngle) * radius * 0.9,
                angle: secondsAngle
            }
        ];
    }

    setupControls() {
        const themeBtn = document.getElementById('themeBtn');
        const patternBtn = document.getElementById('patternBtn');
        const speedBtn = document.getElementById('speedBtn');
        const effectBtn = document.getElementById('effectBtn');

        const themes = Object.keys(this.themes);
        let themeIndex = 0;
        themeBtn.onclick = () => {
            themeIndex = (themeIndex + 1) % themes.length;
            this.theme = themes[themeIndex];
            themeBtn.textContent = `Theme: ${this.theme.charAt(0).toUpperCase() + this.theme.slice(1)}`;
        };

        const patterns = ['spiral', 'orbit', 'chaos'];
        let patternIndex = 0;
        patternBtn.onclick = () => {
            patternIndex = (patternIndex + 1) % patterns.length;
            this.pattern = patterns[patternIndex];
            patternBtn.textContent = `Pattern: ${this.pattern.charAt(0).toUpperCase() + this.pattern.slice(1)}`;
        };

        const speeds = [0.5, 1, 2];
        let speedIndex = 1;
        speedBtn.onclick = () => {
            speedIndex = (speedIndex + 1) % speeds.length;
            this.speed = speeds[speedIndex];
            speedBtn.textContent = `Speed: ${this.speed === 1 ? 'Normal' : this.speed < 1 ? 'Slow' : 'Fast'}`;
        };

        const effects = ['wave', 'pulse', 'trail'];
        let effectIndex = 0;
        effectBtn.onclick = () => {
            effectIndex = (effectIndex + 1) % effects.length;
            this.effect = effects[effectIndex];
            effectBtn.textContent = `Effect: ${this.effect.charAt(0).toUpperCase() + this.effect.slice(1)}`;
        };
    }

    draw() {
        // Create fade effect
        this.ctx.fillStyle = `${this.themes[this.theme].background}15`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clock face
        this.ctx.strokeStyle = this.themes[this.theme].primary;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 
            Math.min(this.canvas.width, this.canvas.height) * 0.4, 
            0, Math.PI * 2);
        this.ctx.stroke();

        // Update and draw particles
        this.particles.forEach((particle, index) => {
            const time = Date.now() * 0.001 * this.speed;
            
            if (this.pattern === 'spiral') {
                particle.angle += 0.02 * this.speed;
                const radius = 50 + Math.sin(time + index) * 100;
                particle.x = this.centerX + Math.cos(particle.angle) * radius;
                particle.y = this.centerY + Math.sin(particle.angle) * radius;
            } else if (this.pattern === 'orbit') {
                this.timePoints.forEach(point => {
                    const dx = point.x - particle.x;
                    const dy = point.y - particle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    particle.speedX += (dx / dist) * 0.1;
                    particle.speedY += (dy / dist) * 0.1;
                });
                
                particle.x += particle.speedX * this.speed;
                particle.y += particle.speedY * this.speed;
                
                // Damping
                particle.speedX *= 0.99;
                particle.speedY *= 0.99;
            } else if (this.pattern === 'chaos') {
                particle.x += Math.sin(time + index) * 2 * this.speed;
                particle.y += Math.cos(time + index * 0.7) * 2 * this.speed;
            }

            // Keep particles within bounds
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Draw particle with effect
            if (this.effect === 'wave') {
                particle.size = 2 + Math.sin(time + index) * 2;
            } else if (this.effect === 'pulse') {
                const pulse = Math.sin(time * 2) * 0.5 + 0.5;
                particle.size = 2 + pulse * 4;
            } else if (this.effect === 'trail') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.themes[this.theme].primary;
            }

            this.ctx.beginPath();
            this.ctx.fillStyle = this.themes[this.theme].primary;
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw time points
        this.timePoints.forEach((point, index) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = index === 0 ? this.themes[this.theme].secondary : this.themes[this.theme].primary;
            this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
window.addEventListener('load', () => new ClockChaos());