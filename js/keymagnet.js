const KeyMagnetGame = {
    settings: {
        easy: {
            keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
            rounds: 12,
            timeLimit: 0
        },
        medium: {
            keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
            rounds: 18,
            timeLimit: 5
        },
        hard: {
            keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
            rounds: 25,
            timeLimit: 3
        }
    },

    active: false,
    score: 0,
    correct: 0,
    wrong: 0,
    timeouts: 0,
    round: 0,
    target: '',
    responseTimes: [],
    animationId: null,
    callbacks: null,

    start(level, callbacks) {
        this.stop();

        this.config = this.settings[level];
        this.callbacks = callbacks;
        this.active = true;
        this.score = 0;
        this.correct = 0;
        this.wrong = 0;
        this.timeouts = 0;
        this.round = 0;
        this.target = '';
        this.responseTimes = [];
        this.startTime = performance.now();
        this.lastStatsUpdate = 0;

        this.newTarget();
        this.updateStats();
        this.animationId = requestAnimationFrame(time => this.animate(time));
    },

    newTarget() {
        const available = this.config.keys.filter(key => key !== this.target);
        const randomIndex = Math.floor(Math.random() * available.length);

        this.target = available[randomIndex];
        this.targetStart = performance.now();

        document.getElementById('targetLetter').textContent = this.target;
        document.getElementById('roundLabel').textContent = `Round ${this.round + 1} / ${this.config.rounds}`;

        this.highlightTarget();
        this.updateCountdown(this.config.timeLimit);
    },

    highlightTarget() {
        document.querySelectorAll('.key-button').forEach(button => {
            button.classList.toggle('target', button.dataset.key === this.target);
        });
    },

    press(key) {
        if (!this.active || !/^[A-Z0-9]$/.test(key)) {
            return;
        }

        if (key === this.target) {
            const responseTime = (performance.now() - this.targetStart) / 1000;
            this.responseTimes.push(responseTime);
            this.correct++;
            this.score += 10;
            this.round++;
            this.callbacks.onFeedback(`Correct! ${key} in ${responseTime.toFixed(2)}s. +10 points`, 'correct');

            if (this.round >= this.config.rounds) {
                this.finish();
                return;
            }

            this.newTarget();
        } else {
            this.wrong++;
            this.score = Math.max(0, this.score - 2);
            this.callbacks.onFeedback(`You pressed ${key}. Look for ${this.target}. -2 points`, 'incorrect');
        }

        this.updateStats();
    },

    animate(time) {
        if (!this.active) {
            return;
        }

        if (this.config.timeLimit > 0) {
            const secondsLeft = this.config.timeLimit - (time - this.targetStart) / 1000;
            this.updateCountdown(Math.max(0, secondsLeft));

            if (secondsLeft <= 0) {
                this.timeouts++;
                this.round++;
                this.score = Math.max(0, this.score - 3);
                this.callbacks.onFeedback(`Time's up for ${this.target}. -3 points`, 'incorrect');

                if (this.round >= this.config.rounds) {
                    this.finish();
                    return;
                }

                this.newTarget();
                this.updateStats();
            }
        }

        if (time - this.lastStatsUpdate > 120) {
            this.updateStats();
            this.lastStatsUpdate = time;
        }

        this.animationId = requestAnimationFrame(nextTime => this.animate(nextTime));
    },

    updateCountdown(secondsLeft) {
        const limit = this.config.timeLimit;
        const width = limit ? (secondsLeft / limit) * 100 : 100;

        document.getElementById('timebarFill').style.width = `${width}%`;
        document.getElementById('countdownLabel').textContent = limit
            ? `${secondsLeft.toFixed(1)}s remaining`
            : 'No time limit';
    },

    getAccuracy() {
        const attempts = this.correct + this.wrong + this.timeouts;
        return attempts ? Math.round((this.correct / attempts) * 100) : 100;
    },

    getSeconds() {
        return Math.floor((performance.now() - this.startTime) / 1000);
    },

    averageResponse() {
        if (this.responseTimes.length === 0) {
            return '0.00s';
        }

        const sum = this.responseTimes.reduce((total, seconds) => total + seconds, 0);
        return `${(sum / this.responseTimes.length).toFixed(2)}s`;
    },

    updateStats() {
        if (!this.active) {
            return;
        }

        this.callbacks.onStats({
            score: this.score,
            second: `${this.getAccuracy()}%`,
            third: `${this.correct} / ${this.config.rounds}`,
            seconds: this.getSeconds()
        });
    },

    finish() {
        const result = {
            mode: 'keymagnet',
            score: this.score,
            correct: this.correct,
            wrong: this.wrong,
            timeouts: this.timeouts,
            accuracy: this.getAccuracy(),
            averageTime: this.averageResponse(),
            seconds: this.getSeconds()
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

        document.querySelectorAll('.key-button').forEach(button => {
            button.classList.remove('target');
        });
    }
};
