class CyberFlow {
    constructor() {
        this.canvas = document.getElementById('flowCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.mode = 'neon';
        
        this.init();
    }

    init() {
        this.resize();
        this.setupEventListeners();
        this.createPoints();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createPoints();
    }

    createPoints() {
        this.points = [];
        // Use same density for all modes
        const spacing = Math.min(this.canvas.width, this.canvas.height) / 20;

        for (let x = 0; x < this.canvas.width; x += spacing) {
            for (let y = 0; y < this.canvas.height; y += spacing) {
                this.points.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() + 0.5,
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`
                });
            }
        }
    }

    setupEventListeners() {
        // Throttled resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(() => {
                    this.resize();
                    resizeTimeout = null;
                }, 250);
            }
        });

        // Throttled mousemove handler
        let moveTimeout;
        this.canvas.addEventListener('mousemove', (e) => {
            if (!moveTimeout) {
                moveTimeout = setTimeout(() => {
                    this.mouseX = e.clientX;
                    this.mouseY = e.clientY;
                    moveTimeout = null;
                }, 16);
            }
        });

        // Click handler
        this.canvas.addEventListener('click', (e) => {
            this.createSurge(e.clientX, e.clientY);
        });

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => 
                    b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
            });
        });

        document.querySelector('[data-mode="neon"]').classList.add('active');
    }

    createSurge(x, y) {
        this.points.forEach(point => {
            const dx = point.x - x;
            const dy = point.y - y;
            const dist = Math.hypot(dx, dy);
            if (dist < 150) {
                point.angle = Math.atan2(dy, dx);
                point.speed = 3;
            }
        });
    }

    drawNeonMode() {
        this.ctx.strokeStyle = '#00fff2';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00fff2';
        this.ctx.beginPath();

        this.points.forEach(point => {
            const length = 15 * point.speed;
            const endX = point.x + Math.cos(point.angle) * length;
            const endY = point.y + Math.sin(point.angle) * length;
            
            this.ctx.moveTo(point.x, point.y);
            this.ctx.lineTo(endX, endY);
        });
        this.ctx.stroke();
    }

    drawPlasmaMode() {
        // Optimized plasma mode
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();

        this.points.forEach(point => {
            const length = 12 * point.speed;
            const endX = point.x + Math.cos(point.angle) * length;
            const endY = point.y + Math.sin(point.angle) * length;
            
            this.ctx.strokeStyle = point.color;
            this.ctx.shadowColor = point.color;
            this.ctx.moveTo(point.x, point.y);
            this.ctx.lineTo(endX, endY);
        });
        
        this.ctx.stroke();
    }

    drawGridMode() {
        // Optimized grid mode
        this.ctx.strokeStyle = '#00fff2';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();

        const maxDist = 60; // Reduced connection distance
        const maxDistSq = maxDist * maxDist;

        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            // Only check nearby points in a grid cell
            for (let j = i + 1; j < this.points.length; j++) {
                const other = this.points[j];
                const dx = other.x - point.x;
                if (Math.abs(dx) > maxDist) continue; // Skip if too far horizontally
                
                const dy = other.y - point.y;
                if (Math.abs(dy) > maxDist) continue; // Skip if too far vertically
                
                const distSq = dx * dx + dy * dy;
                if (distSq < maxDistSq) {
                    this.ctx.moveTo(point.x, point.y);
                    this.ctx.lineTo(other.x, other.y);
                }
            }
        }
        this.ctx.stroke();
    }

    updatePoints() {
        this.points.forEach(point => {
            // Basic movement
            point.x += Math.cos(point.angle) * point.speed;
            point.y += Math.sin(point.angle) * point.speed;

            // Simple mouse influence
            const dx = this.mouseX - point.x;
            const dy = this.mouseY - point.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 150) {
                point.angle = Math.atan2(dy, dx);
                point.speed = Math.min(point.speed + 0.1, 3);
            }

            // Return to base
            point.x += (point.baseX - point.x) * 0.05;
            point.y += (point.baseY - point.y) * 0.05;
            point.speed *= 0.95;
        });
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.updatePoints();

        switch(this.mode) {
            case 'neon':
                this.drawNeonMode();
                break;
            case 'plasma':
                this.drawPlasmaMode();
                break;
            case 'grid':
                this.drawGridMode();
                break;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => new CyberFlow());