# Last Number Standing

**Last Number Standing** is a thrilling, pass-the-device secret number elimination party game built for **2 to 10 players** on a single browser screen.

---

## 🎮 Game Concept

Each player secretly selects a hidden number within a dynamically calculated range:

$$\text{Max Number} = \text{Number of Players} \times 10$$

- **2 Players:** 1 – 20
- **3 Players:** 1 – 30
- **4 Players:** 1 – 40
- **5 Players:** 1 – 50
- **...**
- **10 Players:** 1 – 100

Players take turns guessing numbers. When a number is guessed, any active player holding that secret number is **instantly eliminated**. The last surviving player wins!

---

## ✨ Features

- **🌐 Multi-Device Online Room Mode:** Host a lobby with a custom Room Code (e.g. `LNS-4821`), share the invite link with 2–10 players, have everyone enter their name and secretly lock in their number on their own device, and the host starts the match!
- **📱 Pass & Play Mode (Single Device):** Play together on one phone/tablet using pass-the-device privacy screens.
- **🔢 Live Interactive Number Tracker:** Interactive matrix grid ($1$ to $\text{Max}$) tracking all available vs. guessed numbers in real-time. Tap any available number to autofill your guess!
- **📜 Turn-by-Turn Guess Feed:** Live history feed tracking rounds, turns, guessers, and elimination events.
- **🔗 Smart Invite Links & QR / Share:** One-click copy and mobile sharing for room invite links.
- **Self-Guess Prevention:** Safeguard against self-elimination.
- **Duplicate Secret Numbers & Guess Prevention:** Full support for identical secret numbers and rejection of repeated guesses.
- **Automatic Turn Skipping & Winner Detection:** Auto-skips eliminated players and triggers confetti when only 1 survivor remains.
- **100% Client-Side Serverless P2P:** Zero backend or database required.



---

## 🛠️ Tech Stack

- **HTML5** & Semantic Elements
- **Tailwind CSS** (Modern dark gaming theme)
- **Vanilla JavaScript (ES6 Modules)**
- **Vite** (Zero-config local bundler and dev server)

---

## 🚀 Installation & Running

### 1. Install Dependencies

Using `npm`:
```bash
npm install
```

Or using `pnpm`:
```bash
pnpm install
```

### 2. Start Local Development Server

```bash
npm run dev
```
*(or `pnpm dev`)*

Open the local URL displayed in your terminal (usually `http://localhost:5173`).

### 3. Production Build

```bash
npm run build
```
*(or `pnpm build`)*

### 4. Preview Production Build

```bash
npm run preview
```
*(or `pnpm preview`)*

---

## 📜 Complete Game Rules

1. **Player Setup:** Choose between 2 and 10 players. Optionally enter custom player names.
2. **Secret Selection:** Pass the device to each player in turn. Each player secretly enters and locks in their secret number (between `1` and `Players * 10`).
3. **Guessing Phase:**
   - On each turn, the device is handed to the active player.
   - The player presses **"I'm Ready"** to reveal their guessing board.
   - The player enters an integer guess within the allowed range.
4. **Eliminations:**
   - If one or more active opponents chose the guessed number, they are **eliminated**.
   - If no one has the number, play advances.
5. **Special Constraints:**
   - You cannot guess your own secret number.
   - You cannot guess a number that was already guessed.
6. **Winning:**
   - The last remaining active player wins the game!
