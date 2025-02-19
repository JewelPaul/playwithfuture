class NeonTypewriter {
    constructor() {
        this.input = document.getElementById('userInput');
        this.textElement = document.getElementById('typewriterText');
        this.clearBtn = document.getElementById('clearBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.currentColor = 'neon-blue';
        this.effectMode = 'normal';
        
        this.phrases = [
            "The future is neon bright...",
            "Type to create light...",
            "Watch your words glow...",
            "Digital dreams in neon...",
            "Create your own light show...",
            "Coding in the matrix...",
            "Cyberpunk dreams...",
            "Neon lights forever..."
        ];

        this.colors = ['neon-blue', 'neon-purple', 'neon-red', 'neon-green', 'neon-yellow'];
        
        this.init();
        this.setupControls();
    }

    init() {
        this.setRandomText();
        
        this.input.addEventListener('input', (e) => {
            this.updateText(e.target.value);
            this.createRipple();
        });

        document.addEventListener('click', (e) => this.createRipple(e));
    }

    setupControls() {
        // Create additional control buttons
        const controls = document.querySelector('.controls');
        
        // Color Toggle Button
        const colorBtn = document.createElement('button');
        colorBtn.textContent = 'Change Color';
        colorBtn.onclick = () => this.cycleColors();
        
        // Rainbow Mode Button
        const rainbowBtn = document.createElement('button');
        rainbowBtn.textContent = 'Rainbow Mode';
        rainbowBtn.onclick = () => this.toggleRainbow();
        
        // Type Effect Button
        const effectBtn = document.createElement('button');
        effectBtn.textContent = 'Change Effect';
        effectBtn.onclick = () => this.cycleEffects();
        
        // Add new buttons
        controls.appendChild(colorBtn);
        controls.appendChild(rainbowBtn);
        controls.appendChild(effectBtn);
        
        // Setup existing buttons
        this.clearBtn.onclick = () => {
            this.input.value = '';
            this.updateText('');
            this.createRipple();
            this.input.focus();
        };

        this.randomBtn.onclick = () => {
            this.setRandomText();
            this.createRipple();
            this.input.focus();
        };
    }

    setRandomText() {
        const randomPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        this.input.value = randomPhrase;
        this.updateText(randomPhrase);
    }

    updateText(text) {
        this.textElement.textContent = text;
        this.applyCurrentEffect();
    }

    cycleColors() {
        const currentIndex = this.colors.indexOf(this.currentColor);
        this.currentColor = this.colors[(currentIndex + 1) % this.colors.length];
        this.effectMode = 'normal';
        this.applyCurrentEffect();
    }

    toggleRainbow() {
        this.effectMode = this.effectMode === 'rainbow' ? 'normal' : 'rainbow';
        this.applyCurrentEffect();
    }

    cycleEffects() {
        const effects = ['normal', 'wave', 'bounce', 'glitch'];
        const currentIndex = effects.indexOf(this.effectMode);
        this.effectMode = effects[(currentIndex + 1) % effects.length];
        this.applyCurrentEffect();
    }

    applyCurrentEffect() {
        this.textElement.className = 'typewriter-text';
        
        switch(this.effectMode) {
            case 'rainbow':
                this.textElement.classList.add('rainbow-text');
                break;
            case 'wave':
                this.applyWaveEffect();
                break;
            case 'bounce':
                this.textElement.style.animation = 'float 3s ease-in-out infinite';
                break;
            case 'glitch':
                this.applyGlitchEffect();
                break;
            default:
                this.textElement.classList.add(this.currentColor);
                this.textElement.style.animation = '';
        }
    }

    applyWaveEffect() {
        const text = this.textElement.textContent;
        this.textElement.innerHTML = text.split('').map((char, i) => 
            `<span style="animation: float ${1 + Math.random()}s ease-in-out infinite; animation-delay: ${i * 0.1}s">${char}</span>`
        ).join('');
    }

    applyGlitchEffect() {
        this.textElement.style.animation = 'none';
        let iterations = 0;
        const glitchInterval = setInterval(() => {
            this.textElement.style.transform = `translate(${Math.random() * 2}px, ${Math.random() * 2}px)`;
            if (iterations++ > 30) {
                clearInterval(glitchInterval);
                this.textElement.style.transform = 'none';
            }
        }, 50);
    }

    createRipple(event) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        
        if (event) {
            ripple.style.left = `${event.clientX}px`;
            ripple.style.top = `${event.clientY}px`;
        } else {
            ripple.style.left = `${window.innerWidth / 2}px`;
            ripple.style.top = `${window.innerHeight / 2}px`;
        }
        
        ripple.style.borderColor = this.currentColor === 'neon-blue' ? '#00fff2' : 
                                 this.effectMode === 'rainbow' ? '#ff00ff' : 
                                 getComputedStyle(this.textElement).color;
        
        document.body.appendChild(ripple);

        // Sound effect
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

        ripple.addEventListener('animationend', () => {
            document.body.removeChild(ripple);
        });
    }
}

// Initialize
window.addEventListener('load', () => new NeonTypewriter());