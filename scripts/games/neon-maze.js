class NeonMaze {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.maze = [];
        this.mazeSize = 15;
        this.cellSize = 30;
        this.player = { x: 1, y: 1 };
        this.end = { x: 0, y: 0 };
        this.moveCount = 0;
        this.startTime = Date.now();
        this.solution = [];
        this.showingSolution = false;
        
        // Colors
        this.colors = [
            { wall: '#00fff2', path: '#00332f' },  // Cyan
            { wall: '#ff00ff', path: '#330033' },  // Magenta
            { wall: '#00ff00', path: '#003300' },  // Matrix Green
            { wall: '#ff0000', path: '#330000' },  // Red
            { wall: '#ffff00', path: '#333300' }   // Yellow
        ];
        this.currentColor = 0;

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
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    init() {
        this.resizeCanvas();
        this.generateMaze();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => this.handleMovement(e));
    }

    resizeCanvas() {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
        this.cellSize = Math.floor(size / this.mazeSize);
        this.canvas.width = this.cellSize * this.mazeSize;
        this.canvas.height = this.cellSize * this.mazeSize;
    }

    generateMaze() {
        // Initialize maze with walls
        this.maze = Array(this.mazeSize).fill().map(() => 
            Array(this.mazeSize).fill(1)
        );

        // Start at (1,1)
        this.player = { x: 1, y: 1 };
        this.carve(1, 1);

        // Set end point at opposite corner
        this.end = { x: this.mazeSize - 2, y: this.mazeSize - 2 };
        
        // Reset game state
        this.moveCount = 0;
        this.startTime = Date.now();
        this.solution = this.findSolution();
        this.showingSolution = false;
        
        // Update display
        document.getElementById('moveCount').textContent = `Moves: ${this.moveCount}`;
        document.getElementById('sizeDisplay').textContent = `Size: ${this.mazeSize}x${this.mazeSize}`;
    }

    carve(x, y) {
        const directions = [
            [0, -2], // Up
            [2, 0],  // Right
            [0, 2],  // Down
            [-2, 0]  // Left
        ];
        
        // Randomize directions
        directions.sort(() => Math.random() - 0.5);

        this.maze[y][x] = 0;

        directions.forEach(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX > 0 && newX < this.mazeSize - 1 && 
                newY > 0 && newY < this.mazeSize - 1 && 
                this.maze[newY][newX] === 1) {
                
                // Carve path
                this.maze[y + dy/2][x + dx/2] = 0;
                this.maze[newY][newX] = 0;
                this.carve(newX, newY);
            }
        });
    }

    findSolution() {
        const solution = [];
        const visited = new Set();
        const stack = [{
            x: this.player.x,
            y: this.player.y,
            path: []
        }];

        while (stack.length > 0) {
            const current = stack.pop();
            const key = `${current.x},${current.y}`;

            if (current.x === this.end.x && current.y === this.end.y) {
                return current.path;
            }

            if (!visited.has(key)) {
                visited.add(key);
                
                // Check all four directions
                [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
                    const newX = current.x + dx;
                    const newY = current.y + dy;
                    
                    if (this.maze[newY][newX] === 0) {
                        stack.push({
                            x: newX,
                            y: newY,
                            path: [...current.path, { x: newX, y: newY }]
                        });
                    }
                });
            }
        }
        return [];
    }

    handleMovement(e) {
        const key = e.key.toLowerCase();
        let dx = 0, dy = 0;

        if (key === 'arrowup' || key === 'w') dy = -1;
        else if (key === 'arrowdown' || key === 's') dy = 1;
        else if (key === 'arrowleft' || key === 'a') dx = -1;
        else if (key === 'arrowright' || key === 'd') dx = 1;

        if (dx === 0 && dy === 0) return;

        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (this.maze[newY][newX] === 0) {
            this.player.x = newX;
            this.player.y = newY;
            this.moveCount++;
            document.getElementById('moveCount').textContent = `Moves: ${this.moveCount}`;

            // Check win condition
            if (this.player.x === this.end.x && this.player.y === this.end.y) {
                setTimeout(() => {
                    alert('Congratulations! You solved the maze!');
                    this.generateMaze();
                }, 100);
            }
        }
    }

    setupControls() {
        const newMazeBtn = document.getElementById('newMazeBtn');
        const sizeBtn = document.getElementById('sizeBtn');
        const colorBtn = document.getElementById('colorBtn');
        const solveBtn = document.getElementById('solveBtn');

        newMazeBtn.onclick = () => this.generateMaze();

        const sizes = [11, 15, 19, 23];
        let sizeIndex = 1;
        sizeBtn.onclick = () => {
            sizeIndex = (sizeIndex + 1) % sizes.length;
            this.mazeSize = sizes[sizeIndex];
            this.resizeCanvas();
            this.generateMaze();
        };

        colorBtn.onclick = () => {
            this.currentColor = (this.currentColor + 1) % this.colors.length;
        };

        solveBtn.onclick = () => {
            this.showingSolution = !this.showingSolution;
            solveBtn.textContent = this.showingSolution ? 'Hide Solution' : 'Show Solution';
        };
    }

    updateGameTime() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timeElapsed').textContent = 
            `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                const color = this.maze[y][x] === 1 ? 
                    this.colors[this.currentColor].wall : 
                    this.colors[this.currentColor].path;

                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        }

        // Draw solution if showing
        if (this.showingSolution) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `${this.colors[this.currentColor].wall}88`;
            this.ctx.lineWidth = this.cellSize / 4;
            
            this.solution.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(
                        (point.x + 0.5) * this.cellSize,
                        (point.y + 0.5) * this.cellSize
                    );
                } else {
                    this.ctx.lineTo(
                        (point.x + 0.5) * this.cellSize,
                        (point.y + 0.5) * this.cellSize
                    );
                }
            });
            this.ctx.stroke();
        }

        // Draw player
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.player.x + 0.5) * this.cellSize,
            (this.player.y + 0.5) * this.cellSize,
            this.cellSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw end point
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.end.x + 0.5) * this.cellSize,
            (this.end.y + 0.5) * this.cellSize,
            this.cellSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Update game time
        this.updateGameTime();
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
window.addEventListener('load', () => new NeonMaze());