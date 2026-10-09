/**
 * Core game rules, validation, room networking actions, and live turn processing
 */

import { store, SCREENS, createInitialState } from './state.js';
import { sounds, triggerHaptic } from './utils.js';
import { network } from './network.js';

/**
 * Calculates default max number based on player count
 */
export function calculateMaxNumber(playerCount) {
  const count = parseInt(playerCount, 10);
  if (isNaN(count) || count < 2) return 20;
  if (count > 10) return 100;
  return count * 10;
}

/**
 * Validates a secret number selection against custom maxNumber
 */

export function validateSecretNumberInput(val, maxNumber) {
  if (val === '' || val === null || val === undefined) {
    return { valid: false, error: 'Please enter a secret number.' };
  }
  const num = Number(val);
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Please enter a whole integer without decimals.' };
  }
  if (num < 1) {
    return { valid: false, error: 'Number must be at least 1.' };
  }
  if (num > maxNumber) {
    return { valid: false, error: `Number cannot exceed the room limit of ${maxNumber}.` };
  }
  return { valid: true, number: num };
}

/**
 * Validates a player's guess
 */
export function validateGuessInput(val, maxNumber, guessedNumbers, currentGuesserSecret) {
  if (val === '' || val === null || val === undefined) {
    return { valid: false, error: 'Please enter a guess.' };
  }
  const num = Number(val);
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Please enter a whole integer.' };
  }
  if (num < 1 || num > maxNumber) {
    return { valid: false, error: `Please enter a valid number between 1 and ${maxNumber}.` };
  }
  if (guessedNumbers.includes(num)) {
    return { valid: false, error: `Number ${num} has already been guessed. Try another number!` };
  }
  if (currentGuesserSecret !== null && num === currentGuesserSecret) {
    return { valid: false, error: 'You cannot guess your own secret number!' };
  }
  return { valid: true, number: num };
}

/**
 * Finds the index of the next active player, skipping eliminated players.
 */
export function getNextActivePlayerIndex(players, currentIndex) {
  const total = players.length;
  for (let step = 1; step <= total; step++) {
    const nextIdx = (currentIndex + step) % total;
    if (players[nextIdx] && players[nextIdx].active) {
      return nextIdx;
    }
  }
  return currentIndex;
}

/**
 * Game Actions Controller
 */
export const GameActions = {
  /**
   * Open Host Online Room Setup
   */
  openHostRoomSetup() {
    sounds.playClick();
    store.setState({
      screen: SCREENS.ROOM_HOST_SETUP
    });
  },

  /**
   * Open Join Online Room Setup
   */
  openJoinRoomSetup(prefilledCode = '') {
    sounds.playClick();
    const code = (prefilledCode || store.getState().roomCode || '').toUpperCase().trim();
    store.setState({
      roomCode: code,
      screen: SCREENS.ROOM_JOIN_SETUP
    });
    if (code) {
      network.queryRoomInfo(code);
    }
  },

  /**
   * Set target player count in host setup (automatically calculates default maxNumber range)
   */
  setPlayerCount(count) {
    const playerCount = Math.max(2, Math.min(10, parseInt(count, 10) || 2));
    const autoMax = calculateMaxNumber(playerCount);
    store.setState({ playerCount, maxNumber: autoMax });
  },

  /**
   * Set custom max number limit in host setup
   */
  setMaxNumber(limit) {
    const maxNumber = Math.max(10, Math.min(1000, parseInt(limit, 10) || 40));
    store.setState({ maxNumber });
  },

  /**
   * Host configures and creates an Online Room with custom player count & custom number limit
   */
  submitHostRoom(hostName, hostSecretVal, targetCount, customMaxNumber) {
    const count = Math.max(2, Math.min(10, parseInt(targetCount, 10) || 4));
    const maxNum = Math.max(10, parseInt(customMaxNumber, 10) || 40);

    const validation = validateSecretNumberInput(hostSecretVal, maxNum);
    if (!validation.valid) {
      return validation;
    }

    sounds.playConfirm();
    network.createRoom(hostName.trim() || 'Host', validation.number, count, maxNum);
    return { valid: true };
  },

  /**
   * Player joins an online room with Room Code, Name, and Secret Number
   */
  submitJoinRoom(code, name, secretVal) {
    if (!code || code.trim().length < 3) {
      return { valid: false, error: 'Please enter a valid Room Code (e.g. LNS-4821)' };
    }
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Please enter your player name.' };
    }
    const state = store.getState();
    const maxNum = state.maxNumber || 40;
    const validation = validateSecretNumberInput(secretVal, maxNum);

    if (!validation.valid) {
      return validation;
    }

    sounds.playConfirm();
    network.joinRoom(code.trim(), name.trim(), validation.number);
    return { valid: true };
  },

  /**
   * Host starts the room match when players have joined
   */
  hostStartRoomMatch() {
    const state = store.getState();
    if (state.players.length < 2) {
      alert('Need at least 2 players in the room to start the game!');
      return;
    }
    const unreadyPlayers = state.players.filter(p => !p.ready || p.secretNumber === null || p.secretNumber === undefined);
    if (unreadyPlayers.length > 0) {
      alert(`Waiting for ${unreadyPlayers.map(p => p.name).join(', ')} to choose their secret number!`);
      return;
    }

    // Check for duplicate secret numbers
    const seen = new Map();
    const duplicatePairs = [];
    for (const p of state.players) {
      if (seen.has(p.secretNumber)) {
        duplicatePairs.push(`"${seen.get(p.secretNumber).name}" & "${p.name}" both picked #${p.secretNumber}`);
      } else {
        seen.set(p.secretNumber, p);
      }
    }

    if (duplicatePairs.length > 0) {
      alert(`⚠️ Duplicate secret numbers found!\n\n${duplicatePairs.join('\n')}\n\nEach player must have a unique secret number. Please have them select a different number before starting.`);
      return;
    }

    sounds.playConfirm();
    network.hostStartGame();
  },

  /**
   * Restart game in the same room, prompting each player to enter a new secret number
   */
  restartRoomGame() {
    sounds.playClick();
    const state = store.getState();

    if (state.isHost) {
      const resetPlayers = state.players.map(p => ({
        ...p,
        ready: false,
        active: true,
        eliminatedInRound: null,
        secretNumber: null
      }));

      store.setState({
        screen: SCREENS.ROOM_RESTART_SETUP,
        guessedNumbers: [],
        round: 1,
        turnCount: 0,
        lastGuessResult: null,
        winner: null,
        myPlayerSecret: null,
        players: resetPlayers
      });

      network.broadcastRoomRestart(resetPlayers, state.maxNumber);
    } else {
      network.clientRequestRestart();
    }
  },

  /**
   * Submit new secret number for a rematch in the same room
   */
  submitRematchSecret(secretVal, updatedMaxNumber = null) {
    const state = store.getState();
    let maxNum = state.maxNumber || 40;
    if (state.isHost && updatedMaxNumber) {
      const parsedMax = parseInt(updatedMaxNumber, 10);
      if (!isNaN(parsedMax) && parsedMax >= 10) {
        maxNum = parsedMax;
        store.setState({ maxNumber: maxNum });
      }
    }

    const validation = validateSecretNumberInput(secretVal, maxNum);
    if (!validation.valid) {
      return validation;
    }

    if (state.isHost) {
      // Check if another ready player already picked this secret number
      const duplicatePlayer = state.players.find(p => !p.isHost && p.ready && p.secretNumber === validation.number);
      if (duplicatePlayer) {
        return { valid: false, error: `Number ${validation.number} is already taken by ${duplicatePlayer.name}! Please select a different secret number.` };
      }

      sounds.playConfirm();

      const updatedPlayers = state.players.map(p => {
        if (p.isHost || p.networkId === state.myPlayerId) {
          return {
            ...p,
            secretNumber: validation.number,
            ready: true,
            active: true,
            eliminatedInRound: null
          };
        }
        return p;
      });

      store.setState({
        myPlayerSecret: validation.number,
        players: updatedPlayers,
        screen: SCREENS.ROOM_LOBBY
      });

      network.broadcastLobbyState(updatedPlayers, state.playerCount, maxNum);
    } else {
      sounds.playConfirm();
      store.setState({
        myPlayerSecret: validation.number,
        screen: SCREENS.ROOM_LOBBY_WAITING
      });

      network.clientSendRematchSecret(validation.number);
    }

    return { valid: true };
  },

  /**
   * Leave room and clean up peer connections
   */
  leaveRoom() {
    sounds.playClick();
    network.leaveRoom();
    store.reset();
    store.setState({ screen: SCREENS.HOME });
  },

  /**
   * Submit Guess with instant response across all devices
   */
  submitGuess(guessVal) {
    const state = store.getState();
    const currentPlayer = state.players[state.currentPlayerIndex];

    // If client, send guess to host
    if (!state.isHost) {
      const mySecret = state.myPlayerSecret;
      const validation = validateGuessInput(
        guessVal,
        state.maxNumber,
        state.guessedNumbers,
        mySecret
      );
      if (!validation.valid) {
        sounds.playMiss();
        triggerHaptic('heavy');
        return validation;
      }
      network.clientSendGuess(validation.number);
      return { valid: true };
    }

    // Host evaluation
    const validation = validateGuessInput(
      guessVal,
      state.maxNumber,
      state.guessedNumbers,
      currentPlayer ? currentPlayer.secretNumber : null
    );

    if (!validation.valid) {
      sounds.playMiss();
      triggerHaptic('heavy');
      return validation;
    }

    const guessedNumber = validation.number;
    const updatedGuessedNumbers = [...state.guessedNumbers, guessedNumber];

    // Check all other ACTIVE players for matching secret number
    const eliminated = [];
    const updatedPlayers = state.players.map(p => {
      if (p.active && p.id !== currentPlayer.id && p.secretNumber === guessedNumber) {
        eliminated.push(p);
        return { ...p, active: false, eliminatedInRound: state.round };
      }
      return p;
    });

    if (eliminated.length > 0) {
      sounds.playElimination();
      triggerHaptic('heavy');
    } else {
      sounds.playClick();
    }

    const historyEntry = {
      round: state.round,
      turn: state.turnCount + 1,
      guesser: currentPlayer ? currentPlayer.name : 'Player',
      guessedNumber,
      eliminatedNames: eliminated.map(p => p.name)
    };

    const activePlayers = updatedPlayers.filter(p => p.active);

    // Check Winner Condition
    if (activePlayers.length === 1) {
      sounds.playVictory();
      const winState = {
        players: updatedPlayers,
        guessedNumbers: updatedGuessedNumbers,
        turnCount: state.turnCount + 1,
        lastGuessResult: {
          guesser: currentPlayer,
          guessedNumber,
          eliminated
        },
        historyLog: [historyEntry, ...state.historyLog],
        stats: {
          totalGuesses: state.stats.totalGuesses + 1,
          totalEliminations: state.stats.totalEliminations + eliminated.length
        },
        winner: activePlayers[0],
        screen: SCREENS.WINNER
      };
      store.setState(winState);

      if (state.isHost) {
        network.hostBroadcastWinner(activePlayers[0]);
        network.hostBroadcastGuessResult(winState);
      }
      return { valid: true, eliminatedCount: eliminated.length };
    }

    // Advance to next active player directly
    const nextPlayerIndex = getNextActivePlayerIndex(updatedPlayers, state.currentPlayerIndex);
    const isNewRound = nextPlayerIndex <= state.currentPlayerIndex;
    const nextRound = isNewRound ? state.round + 1 : state.round;

    const nextGameState = {
      players: updatedPlayers,
      guessedNumbers: updatedGuessedNumbers,
      turnCount: state.turnCount + 1,
      currentPlayerIndex: nextPlayerIndex,
      round: nextRound,
      lastGuessResult: {
        guesser: currentPlayer,
        guessedNumber,
        eliminated
      },
      historyLog: [historyEntry, ...state.historyLog],
      stats: {
        totalGuesses: state.stats.totalGuesses + 1,
        totalEliminations: state.stats.totalEliminations + eliminated.length
      },
      screen: SCREENS.GUESSING
    };

    store.setState(nextGameState);

    if (state.isHost) {
      network.hostBroadcastGuessResult(nextGameState);
    }

    return { valid: true, eliminatedCount: eliminated.length };
  },

  /**
   * Reset game for "Play Again"
   */
  playAgain() {
    const state = store.getState();
    if (state.roomCode) {
      this.restartRoomGame();
    } else {
      sounds.playClick();
      store.reset();
      store.setState({
        screen: SCREENS.HOME
      });
    }
  },

  /**
   * Return to Home screen and reset all state
   */
  goToHome() {
    sounds.playClick();
    const state = store.getState();
    if (state.roomCode) {
      const confirmLeave = confirm('Are you sure you want to leave the game room?');
      if (!confirmLeave) return;
      this.leaveRoom();
    } else {
      store.reset();
      store.setState({ screen: SCREENS.HOME });
    }
  },

  /**
   * Toggle Rules modal
   */
  toggleRules(open) {
    sounds.playClick();
    store.setState(s => ({
      rulesModalOpen: typeof open === 'boolean' ? open : !s.rulesModalOpen
    }));
  },

  /**
   * Toggle Invite modal
   */
  toggleInviteModal(open) {
    sounds.playClick();
    store.setState(s => ({
      inviteModalOpen: typeof open === 'boolean' ? open : !s.inviteModalOpen,
      copiedInviteToast: false
    }));
  },

  /**
   * Switch tracker view tab between 'grid' and 'history'
   */
  setTrackerTab(tab) {
    sounds.playClick();
    store.setState({ trackerTab: tab });
  },

  /**
   * Generates a direct shareable invite URL
   */
  getInviteLink() {
    const state = store.getState();
    const url = new URL(window.location.href);

    if (state.roomCode) {
      url.searchParams.set('room', state.roomCode);
      url.searchParams.set('limit', state.maxNumber.toString());
    }
    return url.toString();
  },

  /**
   * Copy invite link to clipboard
   */
  async copyInviteLink() {
    const link = this.getInviteLink();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      sounds.playConfirm();
      store.setState({ copiedInviteToast: true });
      setTimeout(() => {
        store.setState({ copiedInviteToast: false });
      }, 3000);
      return true;
    } catch (err) {
      console.error('Failed to copy link: ', err);
      return false;
    }
  },

  /**
   * Native Web Share API
   */
  async shareInvite() {
    const link = this.getInviteLink();
    const state = store.getState();
    const roomText = state.roomCode ? ` (Room Code: ${state.roomCode})` : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Last Number Standing - Join Room!',
          text: `Join our Last Number Standing game room!${roomText} (Number Limit: 1–${state.maxNumber}).`,
          url: link
        });
        sounds.playConfirm();
      } catch (e) {
        // cancelled
      }
    } else {
      await this.copyInviteLink();
    }
  },

  /**
   * Parses URL invite search params on initial load
   * DIRECTLY opens ROOM_JOIN_SETUP screen with pre-filled room code & maxNumber limit
   */
  loadFromUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      const limitParam = params.get('limit');

      if (roomParam) {
        const cleanRoom = roomParam.toUpperCase().trim();
        const maxNumber = limitParam ? Math.max(10, parseInt(limitParam, 10) || 40) : 40;
        store.setState({
          roomCode: cleanRoom,
          maxNumber,
          screen: SCREENS.ROOM_JOIN_SETUP // Directly opens Join Screen!
        });
        setTimeout(() => {
          network.queryRoomInfo(cleanRoom);
        }, 150);
        return true;
      }
    } catch (e) {
      console.warn('Could not parse invite params', e);
    }
    return false;
  }
};
