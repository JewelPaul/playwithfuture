class ColorPulse {
    constructor() {
        this.canvas = document.getElementById('pulseCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pulses = [];
        this.sounds = {};
        this.audioContext = null;
        
        this.init();
    }

    init() {
        this.resize();
        this.setupAudio();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupAudio() {
        // Initialize audio context on user interaction to comply with browser policies
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.createSounds();
            }
        }, { once: true });
    }

    createSounds() {
        const notes = {
            'C4': 261.63,
            'D4': 293.66,
            'E4': 329.63,
            'F4': 349.23,
            'G4': 392.00
        };

        document.querySelectorAll('.orb').forEach(orb => {
            const note = orb.dataset.note;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(notes[note], this.audioContext.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            
            oscillator.start();

            this.sounds[orb.style.color] = { gainNode, oscillator };

            this.setupOrbEvents(orb);
        });
    }

    setupOrbEvents(orb) {
        const handleStart = () => {
            if (this.sounds[orb.style.color]) {
                this.sounds[orb.style.color].gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                this.createPulse(
                    this.canvas.width / 2,
                    this.canvas.height / 2,
                    orb.style.color
                );
            }
        };

        const handleEnd = () => {
            if (this.sounds[orb.style.color]) {
                this.sounds[orb.style.color].gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        };

        // Mouse events
        orb.addEventListener('mousedown', handleStart);
        orb.addEventListener('mouseup', handleEnd);
        orb.addEventListener('mouseleave', handleEnd);

        // Touch events
        orb.addEventListener('touchstart', handleStart);
        orb.addEventListener('touchend', handleEnd);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
    }

    createPulse(x, y, color) {
        this.pulses.push({
            x,
            y,
            radius: 0,
            color,
            alpha: 1,
            speed: 15
        });
    }

    animate() {
        // Semi-transparent black for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw pulses
        this.pulses.forEach((pulse, index) => {
            pulse.radius += pulse.speed;
            pulse.alpha *= 0.95;

            this.ctx.beginPath();
            this.ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `${pulse.color}${Math.floor(pulse.alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = 2;
            
            // Add glow effect
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = pulse.color;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            if (pulse.alpha < 0.01) {
                this.pulses.splice(index, 1);
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => new ColorPulse());