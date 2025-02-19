class DNASynthesizer {
    constructor() {
        this.canvas = document.getElementById('dnaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.sequence = [];
        this.currentIndex = 0;
        this.rotation = 0;
        this.rotationSpeed = 0.02;

        // Main synthesizer setup
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "triangle",
                partials: [1, 0.5, 0.3]
            },
            envelope: {
                attack: 0.03,
                decay: 0.3,
                sustain: 0.4,
                release: 0.8
            },
            volume: -8
        }).toDestination();

        // Ambient pad for background
        this.padSynth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 1.5,
            modulationIndex: 3.5,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.8,
                release: 1.5
            },
            modulation: {
                type: "triangle"
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0.1,
                sustain: 0.2,
                release: 0.5
            },
            volume: -16
        }).toDestination();

        // Effects chain
        this.reverb = new Tone.Reverb({
            decay: 3,
            wet: 0.4,
            preDelay: 0.1
        }).toDestination();

        this.delay = new Tone.FeedbackDelay({
            delayTime: "8n",
            feedback: 0.2,
            wet: 0.25
        }).connect(this.reverb);

        this.chorus = new Tone.Chorus({
            frequency: 0.8,
            delayTime: 2.5,
            depth: 0.7,
            wet: 0.2
        }).connect(this.delay);

        this.synth.connect(this.chorus);
        this.padSynth.connect(this.reverb);

        // Musical mapping - using a pentatonic scale for more harmonious sounds
        this.notes = {
            'A': 'C4',
            'T': 'D4',
            'G': 'F4',
            'C': 'G4'
        };

        // Ambient chord progression
        this.chords = [
            ['C3', 'E3', 'G3'],
            ['F3', 'A3', 'C4'],
            ['G3', 'B3', 'D4'],
            ['E3', 'G3', 'B3']
        ];
        this.currentChord = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.generateRandomSequence();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.setupCanvas());
        
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('mutateBtn').addEventListener('click', () => this.mutateSequence());
        document.getElementById('randomBtn').addEventListener('click', () => this.generateRandomSequence());
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.rotationSpeed = e.target.value * 0.004;
        });
        
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            const volume = Tone.gainToDb(e.target.value / 100);
            this.synth.volume.value = volume;
            this.padSynth.volume.value = volume - 8;
        });

        document.querySelectorAll('.base-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const base = btn.dataset.base;
                this.addBase(base);
                this.playNote(base);
            });
        });
    }

    generateRandomSequence() {
        const bases = ['A', 'T', 'G', 'C'];
        this.sequence = Array.from({length: 20}, () => 
            bases[Math.floor(Math.random() * bases.length)]
        );
        this.updateSequenceDisplay();
    }

    mutateSequence() {
        const bases = ['A', 'T', 'G', 'C'];
        const mutationPoint = Math.floor(Math.random() * this.sequence.length);
        const newBase = bases[Math.floor(Math.random() * bases.length)];
        this.sequence[mutationPoint] = newBase;
        this.updateSequenceDisplay();
        this.playNote(newBase);
    }

    addBase(base) {
        this.sequence.push(base);
        this.updateSequenceDisplay();
    }

    updateSequenceDisplay() {
        document.getElementById('sequenceDisplay').textContent = this.sequence.join('');
    }

    playNote(base) {
        const note = this.notes[base];
        this.synth.triggerAttackRelease(note, '8n');
    }

    playAmbientChord() {
        const chord = this.chords[this.currentChord];
        this.padSynth.triggerAttackRelease(chord, '2n');
        this.currentChord = (this.currentChord + 1) % this.chords.length;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('playBtn').textContent = this.isPlaying ? 'Stop' : 'Play DNA';
        
        if (this.isPlaying) {
            Tone.start();
            this.playSequence();
            // Start ambient progression
            this.playAmbientChord();
        }
    }

    async playSequence() {
        if (!this.isPlaying) return;
        
        const base = this.sequence[this.currentIndex];
        const note = this.notes[base];
        
        document.getElementById('noteDisplay').textContent = `${base} (${note})`;
        this.playNote(base);
        
        this.currentIndex = (this.currentIndex + 1) % this.sequence.length;
        
        if (this.currentIndex % 4 === 0) {
            this.playAmbientChord();
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.isPlaying) this.playSequence();
    }

    drawDNA() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 100;
        const verticalSpacing = 30;
        
        this.rotation += this.rotationSpeed;
        
        // Draw helix backbone
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 255, 242, 0.1)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.sequence.length; i++) {
            const angle = i * 0.5 + this.rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + i * verticalSpacing - (this.sequence.length * verticalSpacing) / 2;
            
            if (i > 0) {
                const prevX = centerX + Math.cos(angle - 0.5) * radius;
                const prevY = centerY + (i - 1) * verticalSpacing - (this.sequence.length * verticalSpacing) / 2;
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Draw base pairs
        for (let i = 0; i < this.sequence.length; i++) {
            const angle = i * 0.5 + this.rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + i * verticalSpacing - (this.sequence.length * verticalSpacing) / 2;
            
            // Active base glow effect
            if (i === this.currentIndex && this.isPlaying) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#00fff2';
            }
            
            // Base pair circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = i === this.currentIndex && this.isPlaying ? 
                '#00fff2' : 'rgba(0, 255, 242, 0.5)';
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            
            // Base letter
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Share Tech Mono';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.sequence[i], x, y);
            
            // Connecting line
            const oppositeX = centerX + Math.cos(angle + Math.PI) * radius;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(oppositeX, y);
            this.ctx.strokeStyle = 'rgba(0, 255, 242, 0.3)';
            this.ctx.stroke();
        }
    }

    animate() {
        this.drawDNA();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DNASynthesizer();
});