/**
 * Game state management and state constants for Last Number Standing
 */

export const SCREENS = {
  HOME: 'HOME',
  ROOM_HOST_SETUP: 'ROOM_HOST_SETUP',
  ROOM_JOIN_SETUP: 'ROOM_JOIN_SETUP',
  ROOM_LOBBY: 'ROOM_LOBBY',
  ROOM_LOBBY_WAITING: 'ROOM_LOBBY_WAITING',
  GUESSING: 'GUESSING',
  WINNER: 'WINNER'
};

/**
 * Creates a clean default game state
 */
export function createInitialState() {
  return {
    screen: SCREENS.HOME,
    isHost: false,
    roomCode: null,
    myPlayerId: null,
    myPlayerName: '',
    myPlayerSecret: null,
    playerCount: 4,
    maxNumber: 40,
    players: [], // Array of { id, networkId, name, secretNumber, isHost, ready, active, eliminatedInRound }
    currentPlayerIndex: 0,
    guessedNumbers: [], // Array of numbers guessed so far
    round: 1,
    turnCount: 0,
    lastGuessResult: null, // { guesser, guessedNumber, eliminated }
    winner: null,
    historyLog: [],
    rulesModalOpen: false,
    inviteModalOpen: false,
    trackerTab: 'grid', // 'grid' | 'history'
    copiedInviteToast: false,
    stats: {
      totalGuesses: 0,
      totalEliminations: 0
    }
  };
}

class StateStore {
  constructor() {
    this.state = createInitialState();
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    if (typeof updater === 'function') {
      this.state = { ...this.state, ...updater(this.state) };
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  reset() {
    this.state = createInitialState();
    this.notify();
  }
}

export const store = new StateStore();
