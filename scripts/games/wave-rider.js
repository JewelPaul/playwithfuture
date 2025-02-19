class WaveRider {
    // ... (keep existing constructor and other methods)

    addWave() {
        const wave = {
            points: [],
            color: this.activeColor,
            offset: Math.random() * Math.PI * 2,
            speed: this.settings.speed * (0.8 + Math.random() * 0.4),
            frequency: this.settings.frequency * (0.9 + Math.random() * 0.2),
            // New properties for more dynamic waves
            phase: Math.random() * Math.PI * 2,
            amplitude: this.settings.amplitude * (0.7 + Math.random() * 0.6),
            harmonics: Math.floor(Math.random() * 3) + 1,
            density: 1 + Math.random() * 2
        };

        // Create points with variable density
        for (let i = 0; i <= this.canvas.width; i += wave.density) {
            wave.points.push({
                x: i,
                y: this.canvas.height / 2,
                individualOffset: Math.random() * Math.PI * 2 // Individual point variation
            });
        }

        this.waves.push(wave);
        document.getElementById('waveCounter').textContent = this.waves.length;
    }

    updateWaves(deltaTime) {
        if (this.isPaused) return;

        this.waves.forEach(wave => {
            wave.offset += 0.02 * wave.speed * deltaTime;
            wave.phase += 0.01 * wave.speed * deltaTime;

            wave.points.forEach((point, i) => {
                // Calculate mouse influence
                const dx = point.x - this.mousePos.x;
                const dy = point.y - this.mousePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const influence = Math.max(0, 1 - distance / 200);

                // Multiple wave components
                let y = this.canvas.height / 2;

                // Primary wave
                y += Math.sin(i * 0.02 * wave.frequency + wave.offset) * wave.amplitude;

                // Harmonic waves
                for (let h = 1; h <= wave.harmonics; h++) {
                    y += Math.sin(i * 0.02 * wave.frequency * h + wave.phase) * 
                         (wave.amplitude / (h * 2));
                }

                // Add mouse interaction
                if (influence > 0) {
                    const angle = Math.atan2(dy, dx) + point.individualOffset;
                    y += Math.sin(angle + wave.offset) * influence * 50;
                }

                // Add some noise for organic movement
                y += Math.sin(point.individualOffset + wave.offset * 2) * 5;

                // Update point position
                point.y = y;
            });
        });
    }

    drawWave(wave) {
        this.ctx.beginPath();
        this.ctx.moveTo(wave.points[0].x, wave.points[0].y);

        // Enhanced curve drawing
        for (let i = 0; i < wave.points.length - 1; i++) {
            const current = wave.points[i];
            const next = wave.points[i + 1];
            
            if (i % 2 === 0) {
                const xc = (current.x + next.x) / 2;
                const yc = (current.y + next.y) / 2;
                this.ctx.quadraticCurveTo(current.x, current.y, xc, yc);
            } else {
                this.ctx.lineTo(next.x, next.y);
            }
        }

        // Enhanced visual effects
        this.ctx.strokeStyle = wave.color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 20 * this.settings.glow;
        this.ctx.shadowColor = wave.color;
        this.ctx.stroke();

        // Add highlight effect
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.globalAlpha = 0.3;
        wave.points.forEach((point, i) => {
            if (i % 4 === 0) {
                this.ctx.moveTo(point.x, point.y - 1);
                this.ctx.lineTo(point.x, point.y + 1);
            }
        });
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    draw(deltaTime) {
        // Enhanced trail effect
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.settings.trail})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw waves in reverse order for better layering
        for (let i = this.waves.length - 1; i >= 0; i--) {
            this.drawWave(this.waves[i]);
        }
        
        this.frameCount++;
    }
}