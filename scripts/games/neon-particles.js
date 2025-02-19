class NeonParticles {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentColor = '#00fff2';
        this.isClicking = false;
        this.lastTime = 0;
        
        this.colors = [
            { color: '#ff3366', name: 'Red' },
            { color: '#00fff2', name: 'Cyan' },
            { color: '#ff00aa', name: 'Pink' },
            { color: '#00ff88', name: 'Green' },
            { color: '#ffff00', name: 'Yellow' },
            { color: '#aa00ff', name: 'Purple' },
            { color: '#ff8800', name: 'Orange' },
            { color: '#ffffff', name: 'White' },
            { color: '#0066ff', name: 'Blue' }
        ];

        this.init();
    }

    init() {
        this.resize();
        this.setupEventListeners();
        this.animate();
        // Set initial active button
        document.querySelector('[data-color="#00fff2"]').style.background = '#00fff222';
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('mousemove', (e) => {
            const newX = e.clientX;
            const newY = e.clientY;
            
            if (!this.isClicking) {
                // Create particles along the mouse trail
                if (this.mouseX && this.mouseY) {
                    const dx = newX - this.mouseX;
                    const dy = newY - this.mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const steps = Math.floor(distance / 5);
                    
                    for (let i = 0; i <= steps; i++) {
                        const x = this.mouseX + (dx * i / steps);
                        const y = this.mouseY + (dy * i / steps);
                        this.createParticle(x, y, 1);
                    }
                } else {
                    this.createParticle(newX, newY, 1);
                }
            }
            
            this.mouseX = newX;
            this.mouseY = newY;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.isClicking = true;
            this.burst(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isClicking = false;
        });

        // Touch events
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const newX = touch.clientX;
            const newY = touch.clientY;
            
            if (this.mouseX && this.mouseY) {
                const dx = newX - this.mouseX;
                const dy = newY - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.floor(distance / 5);
                
                for (let i = 0; i <= steps; i++) {
                    const x = this.mouseX + (dx * i / steps);
                    const y = this.mouseY + (dy * i / steps);
                    this.createParticle(x, y, 1);
                }
            }
            
            this.mouseX = newX;
            this.mouseY = newY;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.burst(touch.clientX, touch.clientY);
        });

        // Color controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentColor = btn.dataset.color;
                document.querySelectorAll('.control-btn').forEach(b => 
                    b.style.background = 'transparent');
                btn.style.background = `${this.currentColor}22`;
                this.burst(this.mouseX || window.innerWidth/2, this.mouseY || window.innerHeight/2);
            });
        });
    }

    createParticle(x, y, count = 1) {
        for (let i = 0; i < count; i++) {
            const speed = Math.random() * 2 + 1;
            const angle = Math.random() * Math.PI * 2;
            const size = Math.random() * 3 + 2;
            
            this.particles.push({
                x,
                y,
                size,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: this.currentColor,
                alpha: 1,
                acceleration: 0.98,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                rotation: Math.random() * Math.PI * 2,
                trail: [],
                maxTrailLength: Math.floor(Math.random() * 5) + 5
            });
        }
    }

    burst(x, y) {
        const burstCount = 50;
        for (let i = 0; i < burstCount; i++) {
            const angle = (i / burstCount) * Math.PI * 2;
            const speed = Math.random() * 5 + 5;
            const size = Math.random() * 4 + 2;
            
            this.particles.push({
                x,
                y,
                size,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: this.currentColor,
                alpha: 1,
                acceleration: 0.96,
                rotationSpeed: (Math.random() - 0.5) * 0.4,
                rotation: Math.random() * Math.PI * 2,
                trail: [],
                maxTrailLength: Math.floor(Math.random() * 8) + 8
            });
        }
    }

    drawParticle(particle) {
        this.ctx.save();
        
        // Draw trail
        if (particle.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            
            for (let i = 1; i < particle.trail.length; i++) {
                const point = particle.trail[i];
                this.ctx.lineTo(point.x, point.y);
            }
            
            this.ctx.strokeStyle = `${particle.color}${Math.floor(particle.alpha * 127).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = particle.size * 0.5;
            this.ctx.stroke();
        }
        
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        // Glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = particle.color;
        
        // Main particle
        this.ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    updateParticle(particle) {
        // Update trail
        particle.trail.unshift({ x: particle.x, y: particle.y });
        if (particle.trail.length > particle.maxTrailLength) {
            particle.trail.pop();
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.speedX *= particle.acceleration;
        particle.speedY *= particle.acceleration;
        particle.speedY += 0.1; // Gravity
        particle.alpha *= 0.96;
        particle.rotation += particle.rotationSpeed;
        
        // Bounce effects
        if (particle.y > this.canvas.height - particle.size) {
            particle.y = this.canvas.height - particle.size;
            particle.speedY *= -0.6;
            particle.speedX *= 0.8;
        }
        
        if (particle.x < particle.size) {
            particle.x = particle.size;
            particle.speedX *= -0.6;
        } else if (particle.x > this.canvas.width - particle.size) {
            particle.x = this.canvas.width - particle.size;
            particle.speedX *= -0.6;
        }
    }

    animate() {
        // Semi-transparent fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
            return particle.alpha > 0.01;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => new NeonParticles());