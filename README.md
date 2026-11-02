# KeyPlay — Typing Challenge Game

A beginner-friendly web project built with **HTML5, CSS3, and JavaScript ES6+**.

## How to run

1. Extract the ZIP.
2. Open the `Typing-Challenge-Simple` folder.
3. Double-click `index.html` to open it in Chrome, Edge, or Firefox.
4. Choose Easy, Medium, or Hard and start either game.

No installation, internet connection, or database is required.

## Project structure

```text
Typing-Challenge-Simple/
├── index.html          Main page and game screens
├── css/
│   └── style.css       Responsive styling
├── js/
│   ├── app.js          Navigation, controls, and results
│   ├── bubbles.js      Bubble movement and scoring
│   └── keymagnet.js    Keyboard trainer and response times
├── screenshots/        Desktop and mobile previews
└── README.md
```

## Game 1: Bubbles

- Displays at least 5 moving letter bubbles simultaneously.
- Press a matching letter on the keyboard (or tap the on-screen key) to pop a bubble and gain 10 points.
- Wrong letters cost 2 / 3 / 5 points depending on difficulty.
- A bubble reaching the top counts as a miss.
- The game ends when the miss limit is reached.
- Bubble movement becomes 12% faster after every 8 popped bubbles (up to twice the initial speed).
- The results screen shows score, popped bubbles, misses, wrong keys, speed, and time.

| Difficulty | Starting bubbles | Speed | Miss limit | Wrong-key penalty |
|---|---:|---:|---:|---:|
| Easy | 5 | 40 px/s | 8 | -2 |
| Medium | 7 | 65 px/s | 6 | -3 |
| Hard | 9 | 90 px/s | 4 | -5 |

## Game 2: KeyMagnet

- Displays a target letter and a visible keyboard.
- Target keys are selected from JavaScript arrays.
- A matching key grants 10 points and moves to the next round.
- Incorrect keys cost 2 points, stay on the current target, and are counted.
- Medium/Hard have per-target timers. Timeout costs 3 points and moves to the next round.
- The results screen shows correct keys, wrong keys, timeouts, accuracy, average response time, and time.

| Difficulty | Practice keys | Rounds | Time per target |
|---|---|---:|---|
| Easy | A S D F J K L | 12 | Unlimited |
| Medium | A-Z | 18 | 5 seconds |
| Hard | A-Z and 0-9 | 25 | 3 seconds |

## Controls

- **Start:** Enter the selected mode at the chosen difficulty.
- **Restart:** Start a fresh session in the same game and difficulty without reloading the page.
- **Reset:** Stop gameplay and go back to the home screen.
- **Back to home:** Leave the game and select another mode.
- **Play again:** Start a new session after results.

All repeated animation loops stop when gameplay ends, restarts, or resets.

## For your submission

The lab instructions require all source files **plus a complete demonstration video showing one full session for each mode**. Record your own screen while demonstrating the home screen, difficulty choices, controls, feedback, and results.
