class DigitalRainPiano {
    constructor() {
        this.canvas = document.getElementById('rainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.piano = document.getElementById('piano');
        
        // Configuration
        this.theme = 'matrix';
        this.speed = 1;
        this.soundEnabled = true;
        this.effect = 'rain';
        
        this.themes = {
            matrix: {
                primary: '#00ff00',
                secondary: '#003300',
                background: '#000000'
            },
            cyber: {
                primary: '#00fff2',
                secondary: '#ff00ff',
                background: '#000000'
            },
            sunset: {
                primary: '#ff0066',
                secondary: '#ffcc00',
                background: '#000033'
            }
        };

        // Piano notes
        this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.raindrops = [];
        
        this.init();
        this.setupTime();
        this.setupControls();
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
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.createPiano();
        this.setupAudio();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createPiano() {
        const octaves = 2;
        for (let octave = 0; octave < octaves; octave++) {
            this.notes.forEach((note, index) => {
                const key = document.createElement('div');
                key.className = `piano-key${note.includes('#') ? ' black' : ''}`;
                key.dataset.note = note + (octave + 4);
                
                key.addEventListener('mousedown', () => this.playNote(note + (octave + 4)));
                key.addEventListener('mouseup', () => this.stopNote(note + (octave + 4)));
                key.addEventListener('mouseleave', () => this.stopNote(note + (octave + 4)));
                
                this.piano.appendChild(key);
            });
        }
    }

    setupAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.activeOscillators = {};
        
        // Setup gain node for volume control
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.1;
        this.masterGain.connect(this.audioContext.destination);
    }

    playNote(note) {
        if (!this.soundEnabled) return;

        const freq = this.noteToFreq(note);
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.01);
        
        osc.start();
        this.activeOscillators[note] = { osc, gainNode };
        
        // Create visual effect
        this.createRaindrop(note);
    }

    stopNote(note) {
        if (!this.activeOscillators[note]) return;
        
        const { osc, gainNode } = this.activeOscillators[note];
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.01);
        osc.stop(this.audioContext.currentTime + 0.01);
        delete this.activeOscillators[note];
    }

    noteToFreq(note) {
        const A4 = 440;
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const semitone = notes.indexOf(note.slice(0, -1));
        const N = semitone + 12 * (octave - 4) + (49 - 69);
        return A4 * Math.pow(2, N / 12);
    }

    createRaindrop(note) {
        const x = Math.random() * this.canvas.width;
        const speed = this.speed * (2 + Math.random() * 2);
        const length = 20 + Math.random() * 30;
        
        this.raindrops.push({
            x,
            y: 0,
            speed,
            length,
            char: String.fromCharCode(0x30A0 + Math.random() * 96),
            alpha: 1,
            note
        });
    }

    setupControls() {
        const themeBtn = document.getElementById('themeBtn');
        const speedBtn = document.getElementById('speedBtn');
        const soundBtn = document.getElementById('soundBtn');
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
        speedBtn.onclick = () => {
            speedIndex = (speedIndex + 1) % speeds.length;
            this.speed = speeds[speedIndex];
            speedBtn.textContent = `Speed: ${this.speed === 1 ? 'Normal' : this.speed < 1 ? 'Slow' : 'Fast'}`;
        };

        soundBtn.onclick = () => {
            this.soundEnabled = !this.soundEnabled;
            soundBtn.textContent = `Sound: ${this.soundEnabled ? 'On' : 'Off'}`;
        };

        const effects = ['rain', 'wave', 'spiral'];
        let effectIndex = 0;
        effectBtn.onclick = () => {
            effectIndex = (effectIndex + 1) % effects.length;
            this.effect = effects[effectIndex];
            effectBtn.textContent = `Effect: ${this.effect.charAt(0).toUpperCase() + this.effect.slice(1)}`;
        };
    }

    draw() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = `${this.themes[this.theme].background}15`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw raindrops
        this.ctx.font = '14px monospace';
        
        this.raindrops = this.raindrops.filter(drop => {
            drop.y += drop.speed;
            drop.alpha = Math.max(0, 1 - drop.y / this.canvas.height);

            if (this.effect === 'rain') {
                this.ctx.fillStyle = `${this.themes[this.theme].primary}${Math.floor(drop.alpha * 255).toString(16).padStart(2, '0')}`;
                this.ctx.fillText(drop.char, drop.x, drop.y);
            } else if (this.effect === 'wave') {
                const x = drop.x + Math.sin(drop.y * 0.02) * 20;
                this.ctx.fillStyle = `${this.themes[this.theme].primary}${Math.floor(drop.alpha * 255).toString(16).padStart(2, '0')}`;
                this.ctx.fillText(drop.char, x, drop.y);
            } else if (this.effect === 'spiral') {
                const angle = drop.y * 0.02;
                const radius = drop.y * 0.2;
                const x = this.canvas.width/2 + Math.cos(angle) * radius;
                const y = this.canvas.height/2 + Math.sin(angle) * radius;
                this.ctx.fillStyle = `${this.themes[this.theme].primary}${Math.floor(drop.alpha * 255).toString(16).padStart(2, '0')}`;
                this.ctx.fillText(drop.char, x, y);
            }

            return drop.y < this.canvas.height && drop.alpha > 0;
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
window.addEventListener('load', () => new DigitalRainPiano());