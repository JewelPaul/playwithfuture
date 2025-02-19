class ScrollMetrics {
    constructor() {
        // Initialize metrics
        this.totalDistance = 0;
        this.currentSpeed = 0;
        this.maxSpeed = 0;
        this.scrollCount = 0;
        this.lastScrollPos = window.scrollY;
        this.lastScrollTime = Date.now();
        this.loadedItems = 0;
        this.isLoading = false;
        
        // Fun facts for content generation
        this.funFacts = [
            "🌎 You've scrolled the distance of %d Earth circumferences",
            "🚀 That's equivalent to %d trips to the Moon",
            "🏃‍♂️ You've scrolled the length of %d marathons",
            "🗼 You've climbed %d Eiffel Towers",
            "🌊 You've gone %d leagues under the sea",
            "🎢 You've ridden %d roller coasters",
            "🚁 You've flown %d helicopter rides",
            "🎪 You've circled %d Olympic stadiums",
            "🌈 You've crossed %d rainbows",
            "🎭 You've performed %d Broadway shows"
        ];

        // Create content buffer
        this.contentBuffer = document.createElement('div');
        this.contentBuffer.className = 'content-buffer';
        document.querySelector('.infinite-content').appendChild(this.contentBuffer);

        // Initialize components
        this.setupSpeedometer();
        this.initInfiniteScroll();
        this.setupEventListeners();
        this.startMetricsUpdate();
    }

    initInfiniteScroll() {
        // Create initial content
        this.generateInitialContent();

        // Set up scroll position detection
        window.addEventListener('scroll', () => {
            this.checkScrollPosition();
        }, { passive: true });

        // Initial check
        this.checkScrollPosition();
    }

    checkScrollPosition() {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;
        
        // Load more content when user reaches 75% of current content
        if (!this.isLoading && (scrollTop + clientHeight) / scrollHeight > 0.75) {
            this.loadMoreContent();
        }
    }

    generateInitialContent() {
        this.generateContent(0, 20);
    }

    loadMoreContent() {
        this.isLoading = true;
        this.generateContent(this.loadedItems, 10);
        setTimeout(() => {
            this.isLoading = false;
            this.checkScrollPosition(); // Check again after loading
        }, 100);
    }

    generateContent(startIndex, count) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const itemIndex = startIndex + i;
            const item = this.createScrollItem(itemIndex);
            fragment.appendChild(item);
        }

        this.contentBuffer.appendChild(fragment);
        this.loadedItems += count;

        // Remove old items if too many are loaded (keep memory usage in check)
        this.pruneOldContent();
    }

    pruneOldContent() {
        const maxItems = 100; // Maximum items to keep in DOM
        const items = this.contentBuffer.children;
        
        if (items.length > maxItems) {
            const itemsToRemove = items.length - maxItems;
            for (let i = 0; i < itemsToRemove; i++) {
                if (items[0] && items[0].getBoundingClientRect().bottom < 0) {
                    items[0].remove();
                }
            }
        }
    }

    createScrollItem(index) {
        const item = document.createElement('div');
        item.className = 'scroll-item';
        
        const content = document.createElement('div');
        content.className = 'scroll-content';

        // Add index number
        const indexDiv = document.createElement('div');
        indexDiv.className = 'scroll-index';
        indexDiv.textContent = `#${index + 1}`;
        
        // Add random height for variety
        content.style.height = `${150 + Math.random() * 200}px`;
        
        // Add decorative elements
        const pattern = this.createPattern();
        content.appendChild(pattern);
        
        // Add message
        const message = document.createElement('div');
        message.className = 'scroll-message';
        const fact = this.funFacts[index % this.funFacts.length];
        message.textContent = fact.replace('%d', Math.floor(Math.random() * 1000));
        
        content.appendChild(message);
        item.appendChild(indexDiv);
        item.appendChild(content);

        return item;
    }

    createPattern() {
        const pattern = document.createElement('div');
        pattern.className = 'pattern';
        
        const shapeCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < shapeCount; i++) {
            const shape = document.createElement('div');
            shape.className = 'pattern-shape';
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.top = `${Math.random() * 100}%`;
            shape.style.animationDelay = `${Math.random() * 5}s`;
            shape.style.animationDuration = `${5 + Math.random() * 10}s`;
            pattern.appendChild(shape);
        }
        
        return pattern;
    }

    // ... (rest of the methods remain the same as in the previous version)
}

// Initialize the ScrollMetrics class when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollMetrics();
});