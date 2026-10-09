/**
 * UI Renderer for Last Number Standing
 * Clean, modern, high-contrast dark dashboard (Zero generic rainbow gradients).
 * 100% Room-based multiplayer with discrete player count selectors and custom host number limits.
 */

import { store, SCREENS } from './state.js';
import { GameActions } from './game.js';
import { network } from './network.js';
import { escapeHtml, sounds, ConfettiEffect } from './utils.js';

let confettiInstance = null;

/**
 * Initializes the UI and subscribes to state changes
 */
export function initUI() {
  const appContainer = document.getElementById('app');
  confettiInstance = new ConfettiEffect('confetti-canvas');

  // Handle window resize for confetti canvas
  window.addEventListener('resize', () => {
    if (confettiInstance) confettiInstance.resize();
  });

  // Re-render when store state changes
  store.subscribe(state => {
    renderApp(appContainer, state);
  });

  // Initial render
  renderApp(appContainer, store.getState());
}

/**
 * Main render function
 */
function renderApp(container, state) {
  if (!container) return;

  // Manage celebration confetti on WINNER screen
  if (state.screen === SCREENS.WINNER) {
    if (confettiInstance) confettiInstance.start(6000);
  } else {
    if (confettiInstance) confettiInstance.stop();
  }

  let screenContent = '';

  switch (state.screen) {
    case SCREENS.HOME:
      screenContent = renderHomeScreen(state);
      break;
    case SCREENS.ROOM_HOST_SETUP:
      screenContent = renderHostRoomSetupScreen(state);
      break;
    case SCREENS.ROOM_JOIN_SETUP:
      screenContent = renderJoinRoomSetupScreen(state);
      break;
    case SCREENS.ROOM_LOBBY:
      screenContent = renderHostLobbyScreen(state);
      break;
    case SCREENS.ROOM_LOBBY_WAITING:
      screenContent = renderClientLobbyWaitingScreen(state);
      break;
    case SCREENS.ROOM_RESTART_SETUP:
      screenContent = renderRoomRestartSetupScreen(state);
      break;
    case SCREENS.GUESSING:
      screenContent = renderGuessingScreen(state);
      break;
    case SCREENS.WINNER:
      screenContent = renderWinnerScreen(state);
      break;
    default:
      screenContent = renderHomeScreen(state);
  }

  // Render main screen + top bar + floating modals
  container.innerHTML = `
    <div class="min-h-screen flex flex-col justify-between p-3 sm:p-5 md:p-6 max-w-5xl mx-auto">
      <!-- Header / Top Bar -->
      <header class="flex items-center justify-between py-3 mb-4 border-b border-slate-800 gap-3">
        <button id="nav-brand-btn" class="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            #
          </div>
          <div>
            <h1 class="text-sm sm:text-base font-bold tracking-tight text-white uppercase leading-tight font-display">
              Last Number Standing
            </h1>
            <span class="text-[11px] text-slate-400 font-medium">
              ${state.roomCode ? `Room: <strong class="text-blue-400 font-mono">${state.roomCode}</strong>` : 'Multiplayer Elimination'}
            </span>
          </div>
        </button>

        <div class="flex items-center gap-2">
          <!-- Invite / Share Button -->
          <button id="btn-open-invite" aria-label="Invite Friends" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <span>🔗</span>
            <span class="hidden xs:inline">Invite Link</span>
          </button>

          <!-- Sound Toggle Button -->
          <button id="btn-toggle-sound" aria-label="Toggle Sound" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition focus:outline-none cursor-pointer">
            ${sounds.soundEnabled ? '🔊' : '🔇'}
          </button>

          <!-- Rules Modal Button -->
          <button id="btn-open-rules" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <span>📖</span>
            <span class="hidden sm:inline">Rules</span>
          </button>
        </div>
      </header>

      <!-- Dynamic Screen Content -->
      <main class="flex-1 flex flex-col justify-center my-auto py-2">
        ${screenContent}
      </main>

      <!-- Footer -->
      <footer class="text-center py-3 mt-6 text-xs text-slate-500 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Strategic number elimination party game • Multi-Device Multiplayer</p>
        <p class="text-slate-400 font-medium">100% Client-Side • Serverless P2P</p>
      </footer>
    </div>

    <!-- Invite Friends Modal -->
    ${state.inviteModalOpen ? renderInviteModal(state) : ''}

    <!-- Rules Modal -->
    ${state.rulesModalOpen ? renderRulesModal() : ''}
  `;

  // Attach event listeners for the current screen
  attachEventListeners(container, state);
}

/**
 * Screen 1: Home Screen (Room Mode Only)
 */
function renderHomeScreen() {
  return `
    <div class="animate-fade-in flex flex-col items-center text-center max-w-xl mx-auto">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-5">
        <span>🎮 Multi-Device Elimination Game</span>
      </div>

      <!-- Hero Title -->
      <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-3">
        LAST NUMBER STANDING
      </h2>

      <!-- Subtitle -->
      <p class="text-sm sm:text-base text-slate-300 mb-8 max-w-md leading-relaxed">
        Secretly choose your number. Guess your friends' numbers to eliminate them one by one. Be the <strong class="text-blue-400">last player standing</strong>!
      </p>

      <!-- Action Cards -->
      <div class="w-full space-y-3.5 mb-6">
        <button id="btn-home-create-room" class="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg transition cursor-pointer flex items-center justify-center gap-2">
          <span>🌐</span>
          <span>Create Game Room & Invite Friends</span>
          <span>➔</span>
        </button>

        <!-- Join Room Card -->
        <div class="game-card p-4 rounded-xl border border-slate-800 flex items-center gap-2">
          <input
            type="text"
            id="home-join-code-input"
            placeholder="Enter Room Code (e.g. LNS-4821)"
            class="w-full text-center uppercase font-mono font-bold text-sm py-2.5 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none"
          />
          <button id="btn-home-join-code" class="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition shrink-0 cursor-pointer">
            Join Room 🔑
          </button>
        </div>
      </div>

      <button id="btn-home-rules" class="text-xs font-medium text-slate-400 hover:text-blue-300 transition underline underline-offset-4 cursor-pointer">
        Read Full Game Rules
      </button>
    </div>
  `;
}

/**
 * Screen 2: Host Room Setup Screen (Discrete Player Selection & Custom Number Limit - No Slider!)
 */
function renderHostRoomSetupScreen(state) {
  const currentCount = state.playerCount || 4;
  const currentMax = state.maxNumber || 40;

  // Discrete Player Count Selection Buttons (2 to 10)
  const playerCounts = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const playerCountButtons = playerCounts
    .map(
      n => `
      <button
        type="button"
        data-count="${n}"
        class="btn-select-player-count py-2.5 rounded-lg font-bold text-xs border transition cursor-pointer ${
          n === currentCount
            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
        }"
      >
        ${n}P
      </button>
    `
    )
    .join('');

  // Quick Limit Presets
  const limitPresets = [20, 30, 40, 50, 100];
  const limitPresetButtons = limitPresets
    .map(
      lim => `
      <button
        type="button"
        data-limit="${lim}"
        class="btn-select-limit-preset px-2.5 py-1 rounded-md font-mono text-xs border transition cursor-pointer ${
          lim === currentMax
            ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
        }"
      >
        1–${lim}
      </button>
    `
    )
    .join('');

  return `
    <div class="animate-fade-in max-w-lg mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Host Room Setup</span>
        <h2 class="text-2xl font-bold text-white font-display">Create Game Room</h2>
        <p class="text-xs text-slate-400 mt-1">Select player count and customize your secret number limit</p>
      </div>

      <form id="form-host-setup" class="space-y-4">
        <!-- 1. Player Count (Discrete Buttons - NO SLIDER) -->
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Number of Players:
            </label>
            <span class="text-xs font-bold text-blue-400 font-mono">${currentCount} Players</span>
          </div>
          <div class="grid grid-cols-9 gap-1">
            ${playerCountButtons}
          </div>
        </div>

        <!-- 2. Host Custom Number Limit -->
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <label for="host-max-number-input" class="text-xs font-bold uppercase tracking-wider text-slate-300">
              Secret Number Limit (1 to Max):
            </label>
            <span class="text-xs font-mono font-bold text-emerald-400">1 – ${currentMax}</span>
          </div>

          <div class="flex items-center gap-2 mb-2">
            <input
              type="number"
              id="host-max-number-input"
              min="10"
              max="1000"
              step="1"
              value="${currentMax}"
              required
              class="w-full p-2 bg-slate-950 font-mono font-bold text-white text-center rounded-lg border border-slate-800 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Quick Presets -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] text-slate-500 uppercase font-bold">Presets:</span>
            ${limitPresetButtons}
          </div>
        </div>

        <!-- 3. Host Name -->
        <div>
          <label for="host-name-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Your Name (Host):
          </label>
          <input
            type="text"
            id="host-name-input"
            placeholder="Host (Player 1)"
            maxlength="20"
            required
            class="w-full p-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- 4. Host Secret Number -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="host-secret-input" class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Secret Number:
            </label>
            <span id="host-secret-range-hint" class="text-xs font-mono text-emerald-400 font-semibold">Valid: 1–${currentMax}</span>
          </div>
          <input
            type="number"
            id="host-secret-input"
            min="1"
            max="${currentMax}"
            required
            placeholder="e.g. 17"
            class="w-full p-2.5 text-center text-xl font-bold bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
          <div id="host-secret-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
        >
          Create Room & Open Lobby ➔
        </button>
      </form>
    </div>
  `;
}

/**
 * Screen 3: Join Room Screen (Directly opened via shared link)
 */
function renderJoinRoomSetupScreen(state) {
  const code = state.roomCode || '';
  const maxNumber = state.maxNumber || 40;

  return `
    <div class="animate-fade-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Invited Player</span>
        <h2 class="text-2xl font-bold text-white font-display">Join Game Room</h2>
        <p class="text-xs text-slate-400 mt-1">Enter your player name and choose your secret number</p>
      </div>

      <form id="form-join-setup" class="space-y-4">
        <!-- Room Code -->
        <div>
          <label for="join-room-code-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Room Code:
          </label>
          <input
            type="text"
            id="join-room-code-input"
            value="${escapeHtml(code)}"
            placeholder="LNS-4821"
            required
            class="w-full p-2.5 uppercase font-mono font-bold text-center text-base bg-slate-900 text-blue-400 rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Player Name -->
        <div>
          <label for="join-player-name-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Your Player Name:
          </label>
          <input
            type="text"
            id="join-player-name-input"
            placeholder="Enter your name..."
            maxlength="20"
            required
            autofocus
            class="w-full p-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Secret Number -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="join-secret-input" class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Secret Number:
            </label>
            <span id="join-range-badge" class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Host Range: 1–${maxNumber}
            </span>
          </div>
          <input
            type="number"
            id="join-secret-input"
            min="1"
            max="${maxNumber}"
            required
            placeholder="Pick number (1–${maxNumber})"
            class="w-full p-2.5 text-center text-xl font-bold bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
          <div id="join-validation-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
        >
          Join Room & Lock Secret Number 🔒
        </button>
      </form>
    </div>
  `;
}

/**
 * Screen 4: Host Room Lobby Screen
 */
function renderHostLobbyScreen(state) {
  const roomCode = state.roomCode || 'LNS-ROOM';
  const players = state.players || [];
  const targetCount = state.playerCount || 4;
  const readyCount = players.filter(p => p.ready).length;
  const canStart = players.length >= 2 && players.every(p => p.ready);

  let playerSlotsHtml = '';
  for (let i = 0; i < targetCount; i++) {
    const p = players[i];
    if (p) {
      playerSlotsHtml += `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-blue-950 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-800">
              ${p.isHost ? '👑' : i + 1}
            </span>
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <span>${escapeHtml(p.name)}</span>
              ${p.isHost ? '<span class="text-[9px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-800">HOST</span>' : ''}
            </div>
          </div>
          ${
            p.ready
              ? '<span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">✓ Ready</span>'
              : '<span class="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 animate-pulse">⏳ Picking Number...</span>'
          }
        </div>
      `;
    } else {
      playerSlotsHtml += `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-slate-900 text-slate-600 font-bold text-xs flex items-center justify-center">
              ${i + 1}
            </span>
            <span class="text-xs italic">Waiting for player ${i + 1} to join...</span>
          </div>
          <span class="text-xs text-slate-500">⏳ Empty Slot</span>
        </div>
      `;
    }
  }

  return `
    <div class="animate-fade-in max-w-lg mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Host Lobby</span>
        <h2 class="text-2xl font-bold text-white font-display">Room: <span class="text-blue-400 font-mono">${roomCode}</span></h2>
        <p class="text-xs text-slate-400 mt-1">Number Limit: <strong class="text-emerald-400 font-mono">1–${state.maxNumber}</strong></p>
      </div>

      <!-- Share Box -->
      <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800 mb-4 flex items-center justify-between gap-2">
        <div class="text-xs text-slate-300">
          Players: <strong class="text-emerald-400 font-bold">${readyCount} / ${players.length} Ready</strong> (${targetCount} Max)
        </div>
        <button id="btn-lobby-invite" class="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center gap-1 transition cursor-pointer">
          <span>🔗</span> Copy Invite Link
        </button>
      </div>

      <!-- Players List -->
      <div class="space-y-2 mb-5">
        ${playerSlotsHtml}
      </div>

      <!-- Start Match Button -->
      <button
        id="btn-host-start-match"
        class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition mb-3 ${
          canStart ? 'cursor-pointer shadow-lg shadow-blue-600/20' : 'opacity-40 cursor-not-allowed'
        }"
        ${canStart ? '' : 'disabled'}
      >
        ${canStart ? 'START GAME 🚀' : `Waiting for all players to pick numbers (${readyCount}/${players.length} ready)...`}
      </button>

      <div class="flex items-center gap-2">
        <button id="btn-host-change-secret" class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition cursor-pointer">
          Change Secret Number ✏️
        </button>
        <button id="btn-leave-room-lobby" class="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 font-semibold text-xs border border-slate-800 transition cursor-pointer">
          Leave Room 🚪
        </button>
      </div>
    </div>
  `;
}

/**
 * Screen 5: Client Lobby Waiting Screen
 */
function renderClientLobbyWaitingScreen(state) {
  const roomCode = state.roomCode || 'LNS-ROOM';
  const players = state.players || [];
  const targetCount = state.playerCount || 4;
  const readyCount = players.filter(p => p.ready).length;

  let playerSlotsHtml = '';
  players.forEach((p, idx) => {
    const isMe = p.networkId === state.myPlayerId;
    playerSlotsHtml += `
      <div class="flex items-center justify-between p-2.5 rounded-xl ${
        isMe ? 'bg-blue-950/40 border border-blue-800 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300'
      }">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
            ${p.isHost ? '👑' : idx + 1}
          </span>
          <div class="text-xs font-bold">
            <span>${escapeHtml(p.name)}</span>
            ${isMe ? '<span class="text-[10px] text-blue-400 bg-blue-950 px-1 py-0.2 rounded ml-1 font-normal">You</span>' : ''}
          </div>
        </div>
        ${
          p.ready
            ? '<span class="text-xs font-bold text-emerald-400">✓ Ready</span>'
            : '<span class="text-xs font-bold text-amber-400 animate-pulse">⏳ Choosing...</span>'
        }
      </div>
    `;
  });

  return `
    <div class="animate-fade-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-slate-800 text-center">
      <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">
        ⏳
      </div>

      <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Connected to Room</span>
      <h2 class="text-2xl font-bold text-white font-display mb-1">
        ${roomCode}
      </h2>
      <p class="text-xs text-slate-300 mb-5">
        Your secret number is locked in! Waiting for Host to start the match.
      </p>

      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-4 text-left">
        <div class="flex items-center justify-between mb-2 text-xs font-bold text-slate-400">
          <span>Players in Room</span>
          <span class="text-emerald-400">${readyCount} / ${players.length} Ready</span>
        </div>
        <div class="space-y-1.5">
          ${playerSlotsHtml}
        </div>
      </div>

      <div class="text-xs text-slate-500 mb-4">
        The match will begin automatically on this screen when the Host clicks Start!
      </div>

      <div class="flex items-center gap-2">
        <button id="btn-client-change-secret" class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition cursor-pointer">
          Change Secret Number ✏️
        </button>
        <button id="btn-leave-room-waiting" class="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 font-semibold text-xs border border-slate-800 transition cursor-pointer">
          Leave Room 🚪
        </button>
      </div>
    </div>
  `;
}

/**
 * Screen 8: Room Rematch / Restart Setup Screen
 * Prompts Host and each connected player to select their secret number for the new game in the same room.
 */
function renderRoomRestartSetupScreen(state) {
  const roomCode = state.roomCode || 'LNS-ROOM';
  const currentMax = state.maxNumber || 40;
  const isHost = state.isHost;
  const myPlayer = state.players.find(p => (isHost ? p.isHost : p.networkId === state.myPlayerId)) || { name: state.myPlayerName || 'Player' };

  // If host, provide option to keep or adjust range presets
  const limitPresets = [20, 30, 40, 50, 100];
  const limitPresetButtons = limitPresets
    .map(
      lim => `
      <button
        type="button"
        data-limit="${lim}"
        class="btn-select-rematch-limit px-2.5 py-1 rounded-md font-mono text-xs border transition cursor-pointer ${
          lim === currentMax
            ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
        }"
      >
        1–${lim}
      </button>
    `
    )
    .join('');

  return `
    <div class="animate-fade-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Same Room Rematch</span>
        <h2 class="text-2xl font-bold text-white font-display">New Game Setup</h2>
        <p class="text-xs text-slate-400 mt-1">
          Room <strong class="text-blue-400 font-mono">${roomCode}</strong> • Choose your secret number for this round
        </p>
      </div>

      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="text-base">${isHost ? '👑' : '🎮'}</span>
          <span class="text-slate-300">Player: <strong class="text-white">${escapeHtml(myPlayer.name || (isHost ? 'Host' : 'You'))}</strong></span>
        </div>
        <span class="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold uppercase">
          ${isHost ? 'Host' : 'Connected'}
        </span>
      </div>

      <form id="form-rematch-setup" class="space-y-4">
        ${
          isHost
            ? `
              <!-- Host Limit Customization (Optional) -->
              <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div class="flex items-center justify-between mb-1.5">
                  <label for="rematch-max-number-input" class="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Number Limit (1 to Max):
                  </label>
                  <span class="text-xs font-mono font-bold text-emerald-400">1 – ${currentMax}</span>
                </div>
                <input
                  type="number"
                  id="rematch-max-number-input"
                  min="10"
                  max="1000"
                  step="1"
                  value="${currentMax}"
                  class="w-full p-2 mb-2 bg-slate-950 font-mono font-bold text-white text-center rounded-lg border border-slate-800 focus:border-blue-500 outline-none text-sm"
                />
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] text-slate-500 uppercase font-bold">Presets:</span>
                  ${limitPresetButtons}
                </div>
              </div>
            `
            : ''
        }

        <!-- Secret Number Input -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="rematch-secret-input" class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Secret Number:
            </label>
            <span id="rematch-range-badge" class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Valid: 1–${currentMax}
            </span>
          </div>
          <input
            type="number"
            id="rematch-secret-input"
            min="1"
            max="${currentMax}"
            required
            autofocus
            placeholder="Pick number (1–${currentMax})"
            class="w-full p-3 text-center text-2xl font-bold bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
          <div id="rematch-secret-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
        >
          Lock In Secret Number & Ready ✓
        </button>

        <button
          type="button"
          id="btn-leave-room-rematch"
          class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition cursor-pointer"
        >
          Leave Room 🚪
        </button>
      </form>
    </div>
  `;
}

/**
 * Screen 6: Main Guessing Screen (With Real-Time Guess Banner & Bold Red Elimination Cards)
 */
function renderGuessingScreen(state) {
  const currentPlayer = state.players[state.currentPlayerIndex] || { name: 'Player' };
  const activePlayers = state.players.filter(p => p.active);
  const maxNumber = state.maxNumber;
  const guessedList = state.guessedNumbers;
  const activeTab = state.trackerTab || 'grid';

  const isMyTurn = (
    (state.isHost && currentPlayer.isHost) ||
    (!state.isHost && currentPlayer.networkId === state.myPlayerId)
  );

  // Render players status cards (Bold Red for Eliminated Players!)
  let playersListHtml = '';
  state.players.forEach(p => {
    const isCurrent = p.id === currentPlayer.id;
    const isMe = (
      (state.isHost && p.isHost) ||
      (!state.isHost && p.networkId === state.myPlayerId)
    );

    if (p.active) {
      // ACTIVE PLAYER (Green tag)
      playersListHtml += `
        <div class="flex items-center justify-between p-2 rounded-xl text-xs transition ${
          isCurrent
            ? 'bg-blue-950/70 border border-blue-500 text-white font-bold'
            : 'bg-slate-900 border border-slate-800 text-slate-200'
        }">
          <div class="flex items-center gap-2 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="truncate">${escapeHtml(p.name)}</span>
            ${isMe ? '<span class="text-[9px] text-blue-300 bg-blue-950 px-1 rounded border border-blue-800">You</span>' : ''}
            ${isCurrent ? '<span class="text-[9px] text-blue-400 bg-blue-950 px-1 py-0.2 rounded font-bold uppercase">Turn</span>' : ''}
          </div>
          <span class="text-emerald-400 font-bold text-[11px] shrink-0">● Active</span>
        </div>
      `;
    } else {
      // ELIMINATED PLAYER (Bold Red container)
      playersListHtml += `
        <div class="flex items-center justify-between p-2 rounded-xl text-xs bg-red-950/70 border border-red-600/90 text-red-300 font-bold transition">
          <div class="flex items-center gap-2 truncate line-through opacity-85">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <span class="truncate">${escapeHtml(p.name)}</span>
            ${isMe ? '<span class="text-[9px] text-red-400 bg-red-950 px-1 rounded border border-red-800 no-underline">You</span>' : ''}
          </div>
          <span class="text-red-400 font-black text-[11px] shrink-0 uppercase tracking-wider">✕ Eliminated</span>
        </div>
      `;
    }
  });

  // Render Number Board Grid (1 to maxNumber)
  let numberGridHtml = '';
  for (let num = 1; num <= maxNumber; num++) {
    const isGuessed = guessedList.includes(num);

    if (isGuessed) {
      const matchLog = state.historyLog.find(h => h.guessedNumber === num);
      const causedElimination = matchLog && matchLog.eliminatedNames && matchLog.eliminatedNames.length > 0;

      numberGridHtml += `
        <button
          type="button"
          disabled
          title="Number ${num} was guessed in Round ${matchLog ? matchLog.round : '?'}${causedElimination ? ' (Eliminated player!)' : ''}"
          class="aspect-square flex flex-col items-center justify-center rounded-lg font-mono font-bold text-xs border ${
            causedElimination
              ? 'bg-red-950/80 border-red-600 text-red-300 line-through'
              : 'bg-slate-950 border-slate-800 text-slate-600 line-through'
          } cursor-not-allowed"
        >
          <span>${num}</span>
          <span class="text-[8px] no-underline font-sans">${causedElimination ? '💥' : '✕'}</span>
        </button>
      `;
    } else {
      numberGridHtml += `
        <button
          type="button"
          data-number="${num}"
          ${!isMyTurn ? 'disabled' : ''}
          class="btn-pick-number aspect-square flex items-center justify-center rounded-lg font-mono font-bold text-xs bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-800 hover:border-blue-400 transition ${
            isMyTurn ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-80'
          }"
        >
          ${num}
        </button>
      `;
    }
  }

  // Render history feed
  let historyListHtml = '';
  if (state.historyLog.length === 0) {
    historyListHtml = '<div class="text-xs text-slate-500 italic text-center py-5">No guesses made yet.</div>';
  } else {
    historyListHtml = state.historyLog
      .map(entry => {
        const hasElimination = entry.eliminatedNames && entry.eliminatedNames.length > 0;
        return `
          <div class="p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            hasElimination
              ? 'bg-red-950/50 border-red-700/80 text-red-200 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }">
            <div class="flex items-center gap-1.5 truncate">
              <span class="font-bold text-blue-400">R${entry.round}:</span>
              <span class="font-bold text-white">${escapeHtml(entry.guesser)}</span>
              <span>guessed</span>
              <span class="font-mono font-bold px-1.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">${entry.guessedNumber}</span>
            </div>
            <div class="shrink-0 font-bold ${hasElimination ? 'text-red-400' : 'text-slate-500'}">
              ${hasElimination ? `💥 Eliminated ${entry.eliminatedNames.map(escapeHtml).join(', ')}` : 'Miss'}
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Live Guess Banner details on top of number board
  const lastGuess = state.lastGuessResult;
  let guessBannerHtml = '';
  if (lastGuess) {
    const hasElimination = lastGuess.eliminated && lastGuess.eliminated.length > 0;
    const eliminatedNames = hasElimination ? lastGuess.eliminated.map(p => p.name).join(', ') : '';

    guessBannerHtml = `
      <div class="mb-3 p-3 rounded-xl border ${
        hasElimination
          ? 'bg-red-950/80 border-red-600 text-red-200'
          : 'bg-slate-900 border-slate-800 text-slate-200'
      } flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">${hasElimination ? '💥' : '🎯'}</span>
          <div class="text-xs">
            <span class="font-bold text-white">${escapeHtml(lastGuess.guesser ? lastGuess.guesser.name : 'Player')}</span>
            <span>guessed number</span>
            <strong class="font-mono text-sm px-1.5 py-0.5 rounded bg-slate-950 ${hasElimination ? 'text-red-400 border border-red-700' : 'text-blue-400 border border-slate-800'}">${lastGuess.guessedNumber}</strong>
          </div>
        </div>
        <div class="text-xs font-bold text-right ${hasElimination ? 'text-red-400' : 'text-slate-400'}">
          ${hasElimination ? `✕ ${escapeHtml(eliminatedNames)} ELIMINATED!` : 'No eliminations'}
        </div>
      </div>
    `;
  }

  const remainingCount = maxNumber - guessedList.length;

  return `
    <div class="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-5xl mx-auto w-full">
      <!-- Left Column: Current Turn & Guess Input (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-3">
        <div class="game-card p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-xs">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-300">
                Round ${state.round}
              </span>
              <span class="text-slate-400">
                Range: <strong class="text-emerald-400 font-mono">1–${maxNumber}</strong>
              </span>
            </div>
            <span class="text-slate-400">
              Turn <strong class="text-white">#${state.turnCount + 1}</strong>
            </span>
          </div>

          <div class="text-center mb-4">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
              ${isMyTurn ? 'Your Turn' : 'Active Turn'}
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-display">
              ${escapeHtml(currentPlayer.name)}
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              ${isMyTurn ? 'Enter or tap any number on the board to guess' : `Waiting for ${escapeHtml(currentPlayer.name)} to guess...`}
            </p>
          </div>

          ${
            isMyTurn
              ? `
                <form id="form-make-guess" class="space-y-3">
                  <div>
                    <label for="guess-number-input" class="sr-only">Enter Guess</label>
                    <input
                      type="number"
                      id="guess-number-input"
                      min="1"
                      max="${maxNumber}"
                      step="1"
                      required
                      autofocus
                      placeholder="e.g. 17"
                      class="w-full text-center text-3xl font-bold py-2.5 bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
                    />
                    <div id="guess-validation-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-guess"
                    class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
                  >
                    Submit Guess 🎯
                  </button>
                </form>
              `
              : `
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                  <div class="text-2xl mb-1">⏳</div>
                  <p class="text-xs font-bold text-slate-300">
                    Waiting for ${escapeHtml(currentPlayer.name)}'s guess...
                  </p>
                  <p class="text-[11px] text-slate-500 mt-1">
                    The board will update immediately when they submit.
                  </p>
                </div>
              `
          }
        </div>

        <!-- Player Status List (Showing Eliminated Players in Red) -->
        <div class="game-card p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between mb-2 text-xs font-bold">
            <span class="uppercase tracking-wider text-slate-400">Players Status</span>
            <span class="text-emerald-400">${activePlayers.length} / ${state.players.length} Active</span>
          </div>
          <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            ${playersListHtml}
          </div>
        </div>
      </div>

      <!-- Right Column: Number Keeping Box & Tracker (7 cols) -->
      <div class="lg:col-span-7 game-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <!-- Live Guess Status Banner on top of Number Keeping Box -->
          ${guessBannerHtml}

          <!-- Tracker Header & Tabs -->
          <div class="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800 text-xs">
            <div>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                Number Board (${remainingCount} Available, ${guessedList.length} Guessed)
              </h3>
            </div>

            <!-- Tab Buttons -->
            <div class="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 font-semibold">
              <button
                id="btn-tab-grid"
                class="px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === 'grid' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }"
              >
                🔢 Grid
              </button>
              <button
                id="btn-tab-history"
                class="px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === 'history' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }"
              >
                📜 History (${state.historyLog.length})
              </button>
            </div>
          </div>

          <!-- Tab Content 1: Number Grid -->
          <div id="tracker-grid-view" class="${activeTab === 'grid' ? '' : 'hidden'}">
            <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-72 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-900">
              ${numberGridHtml}
            </div>
          </div>

          <!-- Tab Content 2: History Log -->
          <div id="tracker-history-view" class="${activeTab === 'history' ? '' : 'hidden'}">
            <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              ${historyListHtml}
            </div>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Guessed List:</span>
          <span class="font-mono text-cyan-300 font-bold truncate max-w-[280px]">
            ${guessedList.length > 0 ? [...guessedList].sort((a, b) => a - b).join(', ') : 'None yet'}
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Screen 7: Winner Screen
 */
function renderWinnerScreen(state) {
  const winner = state.winner || { name: 'Player' };
  const totalRounds = state.round;
  const totalGuesses = state.stats.totalGuesses;
  const playerCount = state.players.length;

  return `
    <div class="animate-scale-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-blue-600/70 text-center">
      <div class="w-16 h-16 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
        🏆
      </div>

      <span class="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-1">
        WINNER!
      </span>

      <h2 class="text-3xl font-black text-white font-display mb-1">
        ${escapeHtml(winner.name)}
      </h2>

      <p class="text-xs text-slate-300 mb-5">
        Last Player Standing!
      </p>

      <div class="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800 mb-5 text-center">
        <div>
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Players</span>
          <strong class="text-sm font-bold text-white">${playerCount}</strong>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Rounds</span>
          <strong class="text-sm font-bold text-blue-400">${totalRounds}</strong>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Guesses</span>
          <strong class="text-sm font-bold text-emerald-400">${totalGuesses}</strong>
        </div>
      </div>

      ${
        state.roomCode
          ? `
            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 mb-4 text-xs text-slate-300">
              <div class="flex items-center justify-between mb-1">
                <span class="text-slate-400">Room:</span>
                <strong class="text-blue-400 font-mono font-bold text-sm">${state.roomCode}</strong>
              </div>
              <p class="text-[11px] text-slate-400">
                ${state.isHost ? 'Restart to start a new match in this room. Everyone will pick a new secret number!' : 'Play another match with everyone in this room!'}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2.5">
              <button id="btn-room-restart" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-blue-600/20">
                ${state.isHost ? 'Restart Game (Same Room) 🔄' : 'Play Again in Room 🔄'}
              </button>
              <button id="btn-leave-room-winner" class="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer">
                Leave Room 🚪
              </button>
            </div>
          `
          : `
            <div class="flex flex-col sm:flex-row gap-2.5">
              <button id="btn-play-again" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer">
                Play Again 🔄
              </button>
              <button id="btn-winner-home" class="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer">
                Home
              </button>
            </div>
          `
      }
    </div>
  `;
}

/**
 * Modal: Invite Friends / Share Link
 */
function renderInviteModal(state) {
  const inviteLink = GameActions.getInviteLink();
  const isCopied = state.copiedInviteToast;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-overlay">
      <div class="game-card p-6 rounded-2xl max-w-md w-full border border-slate-800 modal-content">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔗</span>
            <h3 class="text-base font-bold text-white font-display">Invite Players</h3>
          </div>
          <button id="btn-close-invite" aria-label="Close Modal" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition cursor-pointer">
            ✕
          </button>
        </div>

        <p class="text-xs text-slate-300 mb-4 leading-relaxed">
          Share this direct link with other players. When they open it, it opens directly in the room to enter their name & number:
        </p>

        <!-- Room Summary -->
        <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4 text-xs text-slate-300 flex items-center justify-between">
          <div>
            <span>Room Code: </span>
            <strong class="text-blue-400 font-mono font-bold">${state.roomCode || 'LNS-GAME'}</strong>
          </div>
          <span class="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            ${state.playerCount} Players (1–${state.maxNumber})
          </span>
        </div>

        <!-- Link Box -->
        <div class="relative mb-4">
          <label for="invite-link-input" class="sr-only">Game Invite Link</label>
          <input
            type="text"
            id="invite-link-input"
            readonly
            value="${escapeHtml(inviteLink)}"
            class="w-full text-xs font-mono p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 pr-24 select-all outline-none"
          />
          <button
            id="btn-copy-invite-link"
            class="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
              isCopied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }"
          >
            ${isCopied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <button
            id="btn-share-native"
            class="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📱</span> Share on WhatsApp / Mobile
          </button>
          <button
            id="btn-close-invite-btn"
            class="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>

        ${isCopied ? '<p class="text-xs text-emerald-400 text-center font-bold mt-2.5">Link copied to clipboard!</p>' : ''}
      </div>
    </div>
  `;
}

/**
 * Modal: Rules / How to Play
 */
function renderRulesModal() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-overlay">
      <div class="game-card p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-800 modal-content">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xl">📖</span>
            <h3 class="text-base font-bold text-white font-display">How to Play</h3>
          </div>
          <button id="btn-close-rules" aria-label="Close Rules" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition cursor-pointer">
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-blue-400 block mb-1">1. Host Creates Room</strong>
            <p>Host sets player count (2–10) and custom secret number limit (e.g. 1 to 50).</p>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-blue-400 block mb-1">2. Players Join via Invite Link</strong>
            <p>Each player opens the link, enters their name, and privately picks their secret number on their phone.</p>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-blue-400 block mb-1">3. Turns & Elimination</strong>
            <p>Players take turns guessing numbers on their screen. If anyone has that secret number, they are instantly eliminated and marked in red!</p>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-amber-400 block mb-1">⚠️ Special Rules</strong>
            <ul class="list-disc list-inside space-y-1">
              <li>You cannot guess your own secret number.</li>
              <li>Previously guessed numbers cannot be guessed again.</li>
              <li>Every player must pick a unique secret number (no duplicates allowed in the room).</li>
            </ul>
          </div>
        </div>

        <button id="btn-close-rules-bottom" class="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer">
          Got it!
        </button>
      </div>
    </div>
  `;
}

/**
 * Attaches DOM event listeners based on the current screen
 */
function attachEventListeners(container, state) {
  // Top bar listeners
  const brandBtn = container.querySelector('#nav-brand-btn');
  if (brandBtn) {
    brandBtn.addEventListener('click', () => GameActions.goToHome());
  }

  const soundBtn = container.querySelector('#btn-toggle-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = sounds.toggleSound();
      soundBtn.textContent = enabled ? '🔊' : '🔇';
    });
  }

  // Invite Modal Triggers
  const openInviteBtn = container.querySelector('#btn-open-invite');
  if (openInviteBtn) {
    openInviteBtn.addEventListener('click', () => GameActions.toggleInviteModal(true));
  }
  const lobbyInviteBtn = container.querySelector('#btn-lobby-invite');
  if (lobbyInviteBtn) {
    lobbyInviteBtn.addEventListener('click', () => GameActions.toggleInviteModal(true));
  }
  const closeInviteBtn = container.querySelector('#btn-close-invite');
  if (closeInviteBtn) {
    closeInviteBtn.addEventListener('click', () => GameActions.toggleInviteModal(false));
  }
  const closeInviteBtn2 = container.querySelector('#btn-close-invite-btn');
  if (closeInviteBtn2) {
    closeInviteBtn2.addEventListener('click', () => GameActions.toggleInviteModal(false));
  }
  const copyInviteBtn = container.querySelector('#btn-copy-invite-link');
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', () => GameActions.copyInviteLink());
  }
  const shareNativeBtn = container.querySelector('#btn-share-native');
  if (shareNativeBtn) {
    shareNativeBtn.addEventListener('click', () => GameActions.shareInvite());
  }

  // Rules Modal Triggers
  const openRulesBtn = container.querySelector('#btn-open-rules');
  if (openRulesBtn) {
    openRulesBtn.addEventListener('click', () => GameActions.toggleRules(true));
  }
  const closeRulesBtn = container.querySelector('#btn-close-rules');
  if (closeRulesBtn) {
    closeRulesBtn.addEventListener('click', () => GameActions.toggleRules(false));
  }
  const closeRulesBottomBtn = container.querySelector('#btn-close-rules-bottom');
  if (closeRulesBottomBtn) {
    closeRulesBottomBtn.addEventListener('click', () => GameActions.toggleRules(false));
  }

  // Home Screen buttons
  const homeCreateRoomBtn = container.querySelector('#btn-home-create-room');
  if (homeCreateRoomBtn) {
    homeCreateRoomBtn.addEventListener('click', () => GameActions.openHostRoomSetup());
  }
  const homeJoinCodeBtn = container.querySelector('#btn-home-join-code');
  if (homeJoinCodeBtn) {
    homeJoinCodeBtn.addEventListener('click', () => {
      const codeInput = container.querySelector('#home-join-code-input');
      if (codeInput && codeInput.value.trim()) {
        GameActions.openJoinRoomSetup(codeInput.value.trim());
      }
    });
  }
  const homeRulesBtn = container.querySelector('#btn-home-rules');
  if (homeRulesBtn) {
    homeRulesBtn.addEventListener('click', () => GameActions.toggleRules(true));
  }

  // Host Room Setup: Player Count selection buttons (No Slider!)
  const countButtons = container.querySelectorAll('.btn-select-player-count');
  countButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.getAttribute('data-count');
      GameActions.setPlayerCount(count);
    });
  });

  // Host Room Setup: Limit Preset buttons
  const limitButtons = container.querySelectorAll('.btn-select-limit-preset');
  limitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const limit = btn.getAttribute('data-limit');
      GameActions.setMaxNumber(limit);
    });
  });

  // Host Room Setup: Custom max number input
  const hostMaxInput = container.querySelector('#host-max-number-input');
  if (hostMaxInput) {
    hostMaxInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 10) {
        GameActions.setMaxNumber(val);
        const hint = container.querySelector('#host-secret-range-hint');
        if (hint) hint.textContent = `Valid: 1–${val}`;
        const secretInput = container.querySelector('#host-secret-input');
        if (secretInput) secretInput.max = val;
      }
    });
  }

  // Host Room Setup Form Submit
  const hostSetupForm = container.querySelector('#form-host-setup');
  if (hostSetupForm) {
    hostSetupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#host-name-input').value;
      const secret = container.querySelector('#host-secret-input').value;
      const customMax = container.querySelector('#host-max-number-input').value;
      const errorBox = container.querySelector('#host-secret-error');

      const result = GameActions.submitHostRoom(name, secret, state.playerCount, customMax);
      if (!result.valid && errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.remove('hidden');
      }
    });
  }

  // Join Room Code Live Query
  const joinRoomCodeInput = container.querySelector('#join-room-code-input');
  if (joinRoomCodeInput) {
    const handleCodeChange = () => {
      const codeVal = joinRoomCodeInput.value.trim().toUpperCase();
      if (codeVal.length >= 3) {
        network.queryRoomInfo(codeVal);
      }
    };
    joinRoomCodeInput.addEventListener('blur', handleCodeChange);
    joinRoomCodeInput.addEventListener('change', handleCodeChange);
  }

  // Join Room Setup Form Submit
  const joinSetupForm = container.querySelector('#form-join-setup');
  if (joinSetupForm) {
    joinSetupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = container.querySelector('#join-room-code-input').value;
      const name = container.querySelector('#join-player-name-input').value;
      const secret = container.querySelector('#join-secret-input').value;
      const errorBox = container.querySelector('#join-validation-error');
      const result = GameActions.submitJoinRoom(code, name, secret);
      if (!result.valid && errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.remove('hidden');
      }
    });
  }

  // Host Lobby Start Game button
  const hostStartMatchBtn = container.querySelector('#btn-host-start-match');
  if (hostStartMatchBtn) {
    hostStartMatchBtn.addEventListener('click', () => {
      GameActions.hostStartRoomMatch();
    });
  }

  // Guessing Screen Tabs & Number Picking
  const tabGridBtn = container.querySelector('#btn-tab-grid');
  if (tabGridBtn) {
    tabGridBtn.addEventListener('click', () => GameActions.setTrackerTab('grid'));
  }
  const tabHistoryBtn = container.querySelector('#btn-tab-history');
  if (tabHistoryBtn) {
    tabHistoryBtn.addEventListener('click', () => GameActions.setTrackerTab('history'));
  }

  const pickNumberButtons = container.querySelectorAll('.btn-pick-number');
  pickNumberButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-number');
      const guessInput = container.querySelector('#guess-number-input');
      if (guessInput && num) {
        sounds.playClick();
        guessInput.value = num;
        guessInput.focus();
      }
    });
  });

  const guessForm = container.querySelector('#form-make-guess');
  if (guessForm) {
    const input = container.querySelector('#guess-number-input');
    const errorBox = container.querySelector('#guess-validation-error');

    guessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      const result = GameActions.submitGuess(val);
      if (!result.valid && errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.remove('hidden');
      }
    });

    if (input) {
      input.addEventListener('input', () => {
        if (errorBox) errorBox.classList.add('hidden');
      });
    }
  }

  // Rematch Setup Screen: Preset limit buttons
  const rematchLimitBtns = container.querySelectorAll('.btn-select-rematch-limit');
  rematchLimitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const limit = btn.getAttribute('data-limit');
      GameActions.setMaxNumber(limit);
      const maxInput = container.querySelector('#rematch-max-number-input');
      if (maxInput) maxInput.value = limit;
      const badge = container.querySelector('#rematch-range-badge');
      if (badge) badge.textContent = `Valid: 1–${limit}`;
      const secretInput = container.querySelector('#rematch-secret-input');
      if (secretInput) secretInput.max = limit;
    });
  });

  // Rematch Setup Screen: Custom max limit input
  const rematchMaxInput = container.querySelector('#rematch-max-number-input');
  if (rematchMaxInput) {
    rematchMaxInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 10) {
        GameActions.setMaxNumber(val);
        const badge = container.querySelector('#rematch-range-badge');
        if (badge) badge.textContent = `Valid: 1–${val}`;
        const secretInput = container.querySelector('#rematch-secret-input');
        if (secretInput) secretInput.max = val;
      }
    });
  }

  // Rematch Setup Form Submit
  const rematchForm = container.querySelector('#form-rematch-setup');
  if (rematchForm) {
    rematchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const secret = container.querySelector('#rematch-secret-input').value;
      const customMaxInput = container.querySelector('#rematch-max-number-input');
      const customMax = customMaxInput ? customMaxInput.value : null;
      const errorBox = container.querySelector('#rematch-secret-error');
      const result = GameActions.submitRematchSecret(secret, customMax);
      if (!result.valid && errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.remove('hidden');
      }
    });
  }

  // Lobby: Change Secret Number buttons
  const hostChangeSecretBtn = container.querySelector('#btn-host-change-secret');
  if (hostChangeSecretBtn) {
    hostChangeSecretBtn.addEventListener('click', () => {
      sounds.playClick();
      store.setState({ screen: SCREENS.ROOM_RESTART_SETUP });
    });
  }
  const clientChangeSecretBtn = container.querySelector('#btn-client-change-secret');
  if (clientChangeSecretBtn) {
    clientChangeSecretBtn.addEventListener('click', () => {
      sounds.playClick();
      store.setState({ screen: SCREENS.ROOM_RESTART_SETUP });
    });
  }

  // Lobby & Rematch: Leave Room buttons
  const leaveRoomLobbyBtn = container.querySelector('#btn-leave-room-lobby');
  if (leaveRoomLobbyBtn) {
    leaveRoomLobbyBtn.addEventListener('click', () => GameActions.goToHome());
  }
  const leaveRoomWaitingBtn = container.querySelector('#btn-leave-room-waiting');
  if (leaveRoomWaitingBtn) {
    leaveRoomWaitingBtn.addEventListener('click', () => GameActions.goToHome());
  }
  const leaveRoomRematchBtn = container.querySelector('#btn-leave-room-rematch');
  if (leaveRoomRematchBtn) {
    leaveRoomRematchBtn.addEventListener('click', () => GameActions.goToHome());
  }
  const leaveRoomWinnerBtn = container.querySelector('#btn-leave-room-winner');
  if (leaveRoomWinnerBtn) {
    leaveRoomWinnerBtn.addEventListener('click', () => GameActions.goToHome());
  }

  // Room Restart button from Winner Screen
  const roomRestartBtn = container.querySelector('#btn-room-restart');
  if (roomRestartBtn) {
    roomRestartBtn.addEventListener('click', () => {
      GameActions.restartRoomGame();
    });
  }

  // Offline / Single winner buttons
  const playAgainBtn = container.querySelector('#btn-play-again');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      GameActions.playAgain();
    });
  }
  const winnerHomeBtn = container.querySelector('#btn-winner-home');
  if (winnerHomeBtn) {
    winnerHomeBtn.addEventListener('click', () => {
      GameActions.goToHome();
    });
  }
}
