class SoundWaves {
    constructor() {
        this.canvas = document.getElementById('waveCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // Initialize audio state
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.colorScheme = 0;
        this.currentSongIndex = 0;

        // Define songs with correct paths
        this.songs = [
            { path: '../assets/sounds/Heart and Rhythm.mp3', name: 'Heart and Rhythm' },
            { path: '../assets/sounds/Heartbeat Melody.mp3', name: 'Heartbeat Melody' },
            { path: '../assets/sounds/Midnight Skyline.mp3', name: 'Midnight Skyline' },
            { path: '../assets/sounds/Rise Up.mp3', name: 'Rise Up' },
            { path: '../assets/sounds/ambient.mp3', name: 'Ambient Flow' }
        ];

        // Color schemes
        this.colors = [
            { name: 'Electric Blue', primary: '#00fff2', secondary: '#0066ff', background: '#001933' },
            { name: 'Neon Pink', primary: '#ff00d4', secondary: '#ff66ff', background: '#330033' },
            { name: 'Cyber Green', primary: '#00ff00', secondary: '#33ff33', background: '#003300' },
            { name: 'Solar Gold', primary: '#ffaa00', secondary: '#ffcc33', background: '#332200' },
            { name: 'Plasma Purple', primary: '#aa00ff', secondary: '#cc66ff', background: '#220033' }
        ];

        this.shuffleSongs();
        this.createSongInfoDisplay();
        this.setupCanvas();
        this.addEventListeners();
        this.setupAudioContext();
        this.updateUI();
        this.animate();
    }

    shuffleSongs() {
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }
    }

    createSongInfoDisplay() {
        const container = document.createElement('div');
        container.className = 'song-info';
        container.style.cssText = `
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            z-index: 2;
        `;

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next Song';
        nextButton.style.cssText = `
            padding: 0.5rem 1rem;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Share Tech Mono', monospace;
            transition: all 0.3s ease;
        `;
        nextButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stopAudio();
            }
            this.playNextSong();
        });

        container.appendChild(nextButton);
        document.body.appendChild(container);
    }

    async setupAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            await this.loadCurrentSong();
        } catch (error) {
            console.error('Audio setup failed:', error);
        }
    }

    async loadCurrentSong() {
        try {
            const response = await fetch(this.songs[this.currentSongIndex].path);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('Song loaded successfully');
        } catch (error) {
            console.error('Failed to load song:', error);
        }
    }

    async playAudio() {
        try {
            if (!this.audioContext) {
                await this.setupAudioContext();
            }

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            if (this.source) {
                this.source.stop();
                this.source = null;
            }

            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;

            this.gainNode = this.audioContext.createGain();
            const volume = document.getElementById('volumeSlider').value / 100;
            this.gainNode.gain.value = volume;

            this.source.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.source.onended = () => {
                if (this.isPlaying) {
                    this.playNextSong();
                }
            };

            this.source.start(0);
            this.isPlaying = true;
            this.updateUI();
        } catch (error) {
            console.error('Playback failed:', error);
        }
    }

    stopAudio() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
        this.isPlaying = false;
        this.updateUI();
    }

    async playNextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        await this.loadCurrentSong();
        await this.playAudio();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateUI() {
        const colorBtn = document.getElementById('colorBtn');
        const playBtn = document.getElementById('playBtn');
        
        if (colorBtn) colorBtn.textContent = `Color: ${this.colors[this.colorScheme].name}`;
        if (playBtn) playBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.setupCanvas());

        const colorBtn = document.getElementById('colorBtn');
        const playBtn = document.getElementById('playBtn');
        const volumeSlider = document.getElementById('volumeSlider');

        if (colorBtn) {
            colorBtn.addEventListener('click', () => {
                this.colorScheme = (this.colorScheme + 1) % this.colors.length;
                this.updateUI();
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.stopAudio();
                } else {
                    this.playAudio();
                }
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                if (this.gainNode) {
                    this.gainNode.gain.value = e.target.value / 100;
                }
            });
        }
    }

    draw() {
        const { width, height } = this.canvas;
        const colors = this.colors[this.colorScheme];

        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colors.background);
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        if (this.analyser && this.isPlaying) {
            this.analyser.getByteTimeDomainData(this.dataArray);
            this.ctx.beginPath();
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = colors.primary;
            
            const sliceWidth = width / this.analyser.frequencyBinCount;
            let x = 0;

            for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                const v = this.dataArray[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            this.ctx.lineTo(width, height / 2);
            this.ctx.stroke();

            this.analyser.getByteFrequencyData(this.dataArray);
            const barWidth = width / this.analyser.frequencyBinCount * 2.5;
            let barX = 0;

            for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                const barHeight = this.dataArray[i] / 2;
                
                const barGradient = this.ctx.createLinearGradient(0, height - barHeight, 0, height);
                barGradient.addColorStop(0, colors.primary);
                barGradient.addColorStop(1, colors.secondary);
                
                this.ctx.fillStyle = barGradient;
                this.ctx.fillRect(barX, height - barHeight, barWidth, barHeight);

                barX += barWidth + 1;
            }
        }

        const time = new Date();
        const seconds = time.getSeconds();
        const milliseconds = time.getMilliseconds();
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + (seconds + milliseconds/1000) * Math.PI / 6;
            const x = width/2 + Math.cos(angle) * 100;
            const y = height/2 + Math.sin(angle) * 100;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = colors.primary;
            this.ctx.fill();
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SoundWaves();
});