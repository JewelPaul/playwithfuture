class DigitalCircuit {
    constructor() {
        this.canvas = document.getElementById('circuitCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.pulses = [];
        this.mouse = { x: 0, y: 0 };
        this.powerLevel = 0;

        // Configuration
        this.theme = 'cyber';
        this.pulseSpeed = 1;
        this.density = 'medium';
        this.effect = 'energy';

        this.themes = {
            cyber: {
                primary: '#00fff2',
                secondary: '#ff00ff',
                background: '#000000'
            },
            matrix: {
                primary: '#00ff00',
                secondary: '#003300',
                background: '#000000'
            },
            quantum: {
                primary: '#4411ff',
                secondary: '#ff00ff',
                background: '#000022'
            },
            fire: {
                primary: '#ff4400',
                secondary: '#ffff00',
                background: '#110000'
            }
        };

        this.densityMap = {
            low: 20,
            medium: 35,
            high: 50
        };

        this.init();
        this.setupControls();
        this.animate();
        this.setupTime();
    }

    setupTime() {
        const updateTime = () => {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const parts = formatter.formatToParts(now);
            const timeValues = {};
            parts.forEach(part => {
                timeValues[part.type] = part.value;
            });
            
            const timeString = `${timeValues.year}-${timeValues.month}-${timeValues.day} ${timeValues.hour}:${timeValues.minute}:${timeValues.second}`;
            document.getElementById('timeDisplay').textContent = timeString;
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.energizeNearbyNodes();
        });
        
        this.createCircuit();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createCircuit();
    }

    setupControls() {
        const themeBtn = document.getElementById('themeBtn');
        const pulseBtn = document.getElementById('pulseBtn');
        const densityBtn = document.getElementById('densityBtn');
        const effectBtn = document.getElementById('effectBtn');

        const themes = Object.keys(this.themes);
        let themeIndex = 0;
        themeBtn.onclick = () => {
            themeIndex = (themeIndex + 1) % themes.length;
            this.theme = themes[themeIndex];
            themeBtn.textContent = `Theme: ${this.theme.charAt(0).toUpperCase() + this.theme.slice(1)}`;
        };

        const speeds = [0.5, 1, 2];
        let speedIndex = 1;
        pulseBtn.onclick = () => {
            speedIndex = (speedIndex + 1) % speeds.length;
            this.pulseSpeed = speeds[speedIndex];
            pulseBtn.textContent = `Pulse: ${this.pulseSpeed === 1 ? 'Normal' : this.pulseSpeed < 1 ? 'Slow' : 'Fast'}`;
        };

        const densities = ['low', 'medium', 'high'];
        let densityIndex = 1;
        densityBtn.onclick = () => {
            densityIndex = (densityIndex + 1) % densities.length;
            this.density = densities[densityIndex];
            densityBtn.textContent = `Density: ${this.density.charAt(0).toUpperCase() + this.density.slice(1)}`;
            this.createCircuit();
        };

        const effects = ['energy', 'data', 'quantum', 'pulse'];
        let effectIndex = 0;
        effectBtn.onclick = () => {
            effectIndex = (effectIndex + 1) % effects.length;
            this.effect = effects[effectIndex];
            effectBtn.textContent = `Effect: ${this.effect.charAt(0).toUpperCase() + this.effect.slice(1)}`;
        };
    }

    createCircuit() {
        this.nodes = [];
        this.connections = [];
        const nodeCount = this.densityMap[this.density];
        const gridSize = Math.sqrt(nodeCount);
        const cellWidth = this.canvas.width / gridSize;
        const cellHeight = this.canvas.height / gridSize;

        // Create nodes in a grid with random offset
        for(let i = 0; i < gridSize; i++) {
            for(let j = 0; j < gridSize; j++) {
                const x = i * cellWidth + Math.random() * (cellWidth * 0.5);
                const y = j * cellHeight + Math.random() * (cellHeight * 0.5);
                this.nodes.push({
                    x, y,
                    power: 0,
                    connections: []
                });
            }
        }

        // Create connections
        this.nodes.forEach((node, i) => {
            const nearbyNodes = this.nodes
                .filter((_, j) => i !== j)
                .sort((a, b) => this.distance(node, a) - this.distance(node, b))
                .slice(0, 3);

            nearbyNodes.forEach(nearNode => {
                if (!this.connections.some(c => 
                    (c.start === node && c.end === nearNode) ||
                    (c.start === nearNode && c.end === node)
                )) {
                    this.connections.push({
                        start: node,
                        end: nearNode,
                        power: 0
                    });
                    node.connections.push(nearNode);
                    nearNode.connections.push(node);
                }
            });
        });
    }

    distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    energizeNearbyNodes() {
        this.nodes.forEach(node => {
            const dist = this.distance(node, this.mouse);
            if (dist < 100) {
                node.power = Math.max(node.power, 1 - dist/100);
                this.createPulse(node);
            }
        });
    }

    createPulse(node) {
        if (Math.random() < 0.1) {
            this.pulses.push({
                x: node.x,
                y: node.y,
                size: 0,
                opacity: 1
            });
        }
    }

    update() {
        // Update power levels
        this.nodes.forEach(node => {
            node.power *= 0.95;
        });

        this.connections.forEach(conn => {
            conn.power = (conn.start.power + conn.end.power) / 2;
        });

        // Update pulses
        this.pulses = this.pulses.filter(pulse => {
            pulse.size += 2 * this.pulseSpeed;
            pulse.opacity -= 0.02 * this.pulseSpeed;
            return pulse.opacity > 0;
        });

        // Calculate overall power level
        const totalPower = this.nodes.reduce((sum, node) => sum + node.power, 0);
        this.powerLevel = Math.min(100, Math.round((totalPower / this.nodes.length) * 100));
        document.getElementById('powerLevel').textContent = this.powerLevel;
    }

    draw() {
        this.ctx.fillStyle = this.themes[this.theme].background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.connections.forEach(conn => {
            const gradient = this.ctx.createLinearGradient(
                conn.start.x, conn.start.y,
                conn.end.x, conn.end.y
            );
            gradient.addColorStop(0, `${this.themes[this.theme].primary}${Math.floor(conn.start.power * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${this.themes[this.theme].primary}${Math.floor(conn.end.power * 255).toString(16).padStart(2, '0')}`);
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(conn.start.x, conn.start.y);
            this.ctx.lineTo(conn.end.x, conn.end.y);
            this.ctx.stroke();
        });

        // Draw nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `${this.themes[this.theme].secondary}${Math.floor(node.power * 255).toString(16).padStart(2, '0')}`;
            this.ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
            this.ctx.fill();

            if (node.power > 0.1) {
                this.ctx.beginPath();
                this.ctx.fillStyle = `${this.themes[this.theme].primary}33`;
                this.ctx.arc(node.x, node.y, 10 * node.power, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Draw pulses
        this.pulses.forEach(pulse => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `${this.themes[this.theme].primary}${Math.floor(pulse.opacity * 255).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = 2;
            this.ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        // Draw special effects
        if (this.effect === 'quantum') {
            this.drawQuantumEffect();
        } else if (this.effect === 'data') {
            this.drawDataFlow();
        }
    }

    drawQuantumEffect() {
        this.nodes.forEach(node => {
            if (node.power > 0.1) {
                const angle = Date.now() * 0.001;
                const size = 20 * node.power;
                
                this.ctx.beginPath();
                this.ctx.strokeStyle = `${this.themes[this.theme].secondary}88`;
                this.ctx.lineWidth = 1;
                this.ctx.arc(node.x, node.y, size, angle, angle + Math.PI);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, size, angle + Math.PI, angle + Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawDataFlow() {
        this.connections.forEach(conn => {
            if (conn.power > 0.1) {
                const progress = (Date.now() * 0.001 * this.pulseSpeed) % 1;
                const x = conn.start.x + (conn.end.x - conn.start.x) * progress;
                const y = conn.start.y + (conn.end.y - conn.start.y) * progress;

                this.ctx.beginPath();
                this.ctx.fillStyle = this.themes[this.theme].secondary;
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
window.addEventListener('load', () => {
    const circuit = new DigitalCircuit();
    
    // Click handler for energy bursts
    window.addEventListener('click', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Find closest node
        const closestNode = circuit.nodes.reduce((closest, node) => {
            const dist = circuit.distance({ x: mouseX, y: mouseY }, node);
            return dist < circuit.distance({ x: mouseX, y: mouseY }, closest) ? node : closest;
        }, circuit.nodes[0]);

        if (circuit.distance({ x: mouseX, y: mouseY }, closestNode) < 50) {
            closestNode.power = 1;
            
            // Create audio feedback
            try {
                const audio = new AudioContext();
                const osc = audio.createOscillator();
                const gain = audio.createGain();
                
                osc.connect(gain);
                gain.connect(audio.destination);
                
                osc.frequency.value = 440 + Math.random() * 220;
                gain.gain.value = 0.1;
                
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.00001, audio.currentTime + 0.5);
                
                setTimeout(() => osc.stop(), 500);
            } catch (e) {
                console.log('Audio not supported');
            }
        }
    });
});