const BubblesGame = {
    settings: {
        easy: { count: 5, speed: 40, missLimit: 8, penalty: 2 },
        medium: { count: 7, speed: 65, missLimit: 6, penalty: 3 },
        hard: { count: 9, speed: 90, missLimit: 4, penalty: 5 }
    },

    active: false,
    bubbles: [],
    score: 0,
    popped: 0,
    misses: 0,
    wrong: 0,
    speed: 0,
    lastFrame: 0,
    startTime: 0,
    animationId: null,
    nextId: 1,
    callbacks: null,

    start(level, callbacks) {
        this.stop();

        this.config = this.settings[level];
        this.callbacks = callbacks;
        this.active = true;
        this.bubbles = [];
        this.score = 0;
        this.popped = 0;
        this.misses = 0;
        this.wrong = 0;
        this.speed = this.config.speed;
        this.nextId = 1;
        this.startTime = performance.now();
        this.lastFrame = this.startTime;
        this.lastStatsUpdate = 0;

        this.field = document.getElementById('bubbleField');
        this.field.querySelectorAll('.bubble').forEach(bubble => bubble.remove());

        for (let i = 0; i < this.config.count; i++) {
            this.addBubble(i);
        }

        this.updateStats();
        this.animationId = requestAnimationFrame(time => this.animate(time));
    },

    addBubble(index = 0) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const colors = ['#4688dc', '#1c9ba4', '#dc9436', '#b9619d', '#617bd9'];
        const letter = letters[Math.floor(Math.random() * letters.length)];
        const element = document.createElement('div');
        const lane = (this.nextId * 3 + 1) % 10;
        const x = 5 + lane * 9;
        const y = 20 + (index % 4) * 37;

        element.className = 'bubble';
        element.textContent = letter;
        element.style.backgroundColor = colors[this.nextId % colors.length];
        element.style.left = `${x}%`;
        element.style.bottom = `${y}px`;
        element.setAttribute('aria-label', `Bubble ${letter}`);

        const bubble = {
            id: this.nextId,
            letter,
            element,
            y
        };

        this.nextId++;
        this.bubbles.push(bubble);
        this.field.appendChild(element);
    },

    animate(time) {
        if (!this.active) {
            return;
        }

        const seconds = Math.min((time - this.lastFrame) / 1000, 0.05);
        this.lastFrame = time;
        const limit = this.field.clientHeight - 44;

        for (const bubble of [...this.bubbles]) {
            bubble.y += this.speed * seconds;
            bubble.element.style.bottom = `${bubble.y}px`;

            if (bubble.y >= limit) {
                this.removeBubble(bubble);
                this.misses++;
                this.callbacks.onFeedback('A bubble escaped! Watch the top.', 'incorrect');

                if (this.misses >= this.config.missLimit) {
                    this.finish();
                    return;
                }

                this.addBubble();
            }
        }

        if (time - this.lastStatsUpdate > 120) {
            this.updateStats();
            this.lastStatsUpdate = time;
        }

        this.animationId = requestAnimationFrame(nextTime => this.animate(nextTime));
    },

    press(key) {
        if (!this.active || !/^[A-Z]$/.test(key)) {
            return;
        }

        const matchingBubble = this.bubbles.find(bubble => bubble.letter === key);

        if (matchingBubble) {
            this.removeBubble(matchingBubble);
            this.score += 10;
            this.popped++;
            this.callbacks.onFeedback(`Great! You popped ${key}. +10 points`, 'correct');

            if (this.popped % 8 === 0) {
                this.speed = Math.min(this.speed * 1.12, this.config.speed * 2);
                this.callbacks.onFeedback('Speed increased! Keep going.', 'correct');
            }

            this.addBubble();
        } else {
            this.wrong++;
            this.score = Math.max(0, this.score - this.config.penalty);
            this.callbacks.onFeedback(`No ${key} bubble. -${this.config.penalty} points`, 'incorrect');
        }

        this.updateStats();
    },

    removeBubble(bubble) {
        bubble.element.remove();
        this.bubbles = this.bubbles.filter(item => item.id !== bubble.id);
    },

    getSeconds() {
        return Math.floor((performance.now() - this.startTime) / 1000);
    },

    updateStats() {
        if (!this.active) {
            return;
        }

        document.getElementById('bubbleSpeed').textContent = `Speed: ${Math.round(this.speed)} px/s`;

        this.callbacks.onStats({
            score: this.score,
            second: `${this.misses} / ${this.config.missLimit}`,
            third: this.popped,
            seconds: this.getSeconds()
        });
    },

    finish() {
        const result = {
            mode: 'bubbles',
            score: this.score,
            popped: this.popped,
            misses: this.misses,
            wrong: this.wrong,
            seconds: this.getSeconds(),
            speed: Math.round(this.speed)
        };

        this.stop();
        this.callbacks.onFinish(result);
    },

    stop() {
        this.active = false;

        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.bubbles.forEach(bubble => bubble.element.remove());
        this.bubbles = [];
    }
};
