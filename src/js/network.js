/**
 * Peer-to-Peer & Cross-Tab Network Manager for Multiplayer Rooms
 * Uses WebRTC (PeerJS) for cross-device connections and BroadcastChannel for same-device multi-tab connections.
 */

import { store, SCREENS } from './state.js';
import { sounds, triggerHaptic } from './utils.js';
import { calculateMaxNumber } from './game.js';

class NetworkManager {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // For host: playerId -> conn
    this.hostConnection = null; // For client: conn to host
    this.broadcastChannel = null;
    this.isHost = false;
    this.myPlayerId = null;
    this.roomCode = null;
  }

  initBroadcastChannel(roomCode) {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    try {
      this.broadcastChannel = new BroadcastChannel(`lns_room_${roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }

  generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `LNS-${code}`;
  }

  getPeerId(roomCode) {
    return `lns-game-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  }

  /**
   * Host creates a new online room with custom maxNumber
   */
  createRoom(hostName, hostSecret, targetPlayerCount, customMaxNumber) {
    this.isHost = true;
    this.roomCode = this.generateRoomCode();
    this.myPlayerId = 'host_' + Math.random().toString(36).substring(2, 8);

    const maxNumber = Math.max(10, parseInt(customMaxNumber, 10) || 40);
    this.initBroadcastChannel(this.roomCode);

    const hostPlayer = {
      id: 1,
      networkId: this.myPlayerId,
      name: hostName || 'Host (Player 1)',
      secretNumber: hostSecret,
      isHost: true,
      ready: true,
      active: true,
      eliminatedInRound: null
    };

    store.setState({
      isHost: true,
      roomCode: this.roomCode,
      myPlayerId: this.myPlayerId,
      playerCount: targetPlayerCount,
      maxNumber,
      players: [hostPlayer],
      screen: SCREENS.ROOM_LOBBY
    });

    // Initialize WebRTC Peer as Host
    this.initHostPeer(this.roomCode);
  }


  initHostPeer(roomCode) {
    const peerId = this.getPeerId(roomCode);
    try {
      if (typeof window.Peer !== 'undefined') {
        if (this.peer) this.peer.destroy();
        this.peer = new window.Peer(peerId, {
          debug: 1
        });

        this.peer.on('open', (id) => {
          console.log('Host Peer opened with ID:', id);
        });

        this.peer.on('connection', (conn) => {
          this.handleClientConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS Host warning/error (Local BroadcastChannel will remain active):', err);
        });
      }
    } catch (e) {
      console.warn('PeerJS initialization skipped:', e);
    }
  }

  handleClientConnection(conn) {
    conn.on('open', () => {
      conn.on('data', (data) => {
        this.handleIncomingMessage(data, conn);
      });
    });

    conn.on('close', () => {
      // Clean up disconnected player
      for (const [id, c] of this.connections.entries()) {
        if (c === conn) {
          this.connections.delete(id);
          break;
        }
      }
    });
  }

  /**
   * Client joins an existing room
   */
  joinRoom(roomCode, playerName, playerSecret) {
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    this.myPlayerId = 'client_' + Math.random().toString(36).substring(2, 8);

    this.initBroadcastChannel(this.roomCode);

    store.setState({
      gameMode: 'ONLINE_ROOM',
      isHost: false,
      roomCode: this.roomCode,
      myPlayerId: this.myPlayerId,
      myPlayerName: playerName,
      myPlayerSecret: playerSecret,
      screen: SCREENS.ROOM_LOBBY_WAITING
    });

    // Attempt WebRTC connect to host
    const hostPeerId = this.getPeerId(this.roomCode);
    try {
      if (typeof window.Peer !== 'undefined') {
        if (this.peer) this.peer.destroy();
        this.peer = new window.Peer({ debug: 1 });

        this.peer.on('open', () => {
          const conn = this.peer.connect(hostPeerId, { reliable: true });
          this.hostConnection = conn;

          conn.on('open', () => {
            conn.send({
              type: 'PLAYER_JOIN',
              networkId: this.myPlayerId,
              name: playerName,
              secretNumber: playerSecret
            });
          });

          conn.on('data', (data) => {
            this.handleIncomingMessage(data);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS Client connection:', err);
        });
      }
    } catch (e) {
      console.warn('Peer connection error', e);
    }

    // Also broadcast on BroadcastChannel for multi-tab support
    this.sendBroadcast({
      type: 'PLAYER_JOIN',
      networkId: this.myPlayerId,
      name: playerName,
      secretNumber: playerSecret
    });
  }

  /**
   * Query host for room configuration (maxNumber limit and playerCount)
   */
  queryRoomInfo(roomCode) {
    if (!roomCode) return;
    const cleanCode = roomCode.toUpperCase().trim();
    this.roomCode = cleanCode;
    this.initBroadcastChannel(cleanCode);

    // Send via BroadcastChannel (for same browser / tabs)
    this.sendBroadcast({
      type: 'QUERY_ROOM_INFO',
      roomCode: cleanCode
    });

    // Send via WebRTC PeerJS (for remote devices)
    const hostPeerId = this.getPeerId(cleanCode);
    try {
      if (typeof window.Peer !== 'undefined') {
        if (!this.peer || this.peer.destroyed) {
          this.peer = new window.Peer({ debug: 1 });
        }

        const sendQuery = () => {
          try {
            const conn = this.peer.connect(hostPeerId, { reliable: true });
            conn.on('open', () => {
              conn.send({ type: 'QUERY_ROOM_INFO', roomCode: cleanCode });
            });
            conn.on('data', (data) => {
              this.handleIncomingMessage(data);
            });
          } catch (e) {
            console.warn('Failed to query peer', e);
          }
        };

        if (this.peer.open) {
          sendQuery();
        } else {
          this.peer.on('open', () => sendQuery());
        }
      }
    } catch (e) {
      console.warn('Query room error:', e);
    }
  }

  /**
   * Central message dispatcher
   */
  handleIncomingMessage(data, senderConn = null) {
    if (!data || !data.type) return;

    if (this.isHost) {
      // HOST HANDLERS
      switch (data.type) {
        case 'PLAYER_JOIN': {
          const state = store.getState();
          // Check if already in players
          const existingIdx = state.players.findIndex(p => p.networkId === data.networkId);
          if (existingIdx !== -1) return;

          if (state.players.length >= state.playerCount) {
            const rejectMsg = { type: 'JOIN_REJECTED', reason: 'Room is already full!' };
            if (senderConn) senderConn.send(rejectMsg);
            this.sendBroadcast(rejectMsg);
            return;
          }

          // STRICT HOST VALIDATION: Secret number MUST be between 1 and host's maxNumber
          const secret = Number(data.secretNumber);
          if (!Number.isInteger(secret) || secret < 1 || secret > state.maxNumber) {
            const rejectMsg = {
              type: 'JOIN_REJECTED',
              networkId: data.networkId,
              reason: `Your secret number (${data.secretNumber}) is out of range! The host set the number limit to 1–${state.maxNumber}.`,
              maxNumber: state.maxNumber
            };
            if (senderConn) senderConn.send(rejectMsg);
            this.sendBroadcast(rejectMsg);
            return;
          }

          if (senderConn) {
            this.connections.set(data.networkId, senderConn);
          }

          const newPlayer = {
            id: state.players.length + 1,
            networkId: data.networkId,
            name: data.name || `Player ${state.players.length + 1}`,
            secretNumber: secret,
            isHost: false,
            ready: true,
            active: true,
            eliminatedInRound: null
          };

          const updatedPlayers = [...state.players, newPlayer];
          sounds.playConfirm();
          triggerHaptic('light');

          store.setState({ players: updatedPlayers });

          // Broadcast lobby state to all clients
          this.broadcastLobbyState(updatedPlayers, state.playerCount, state.maxNumber);
          break;
        }

        case 'QUERY_ROOM_INFO': {
          const state = store.getState();
          const response = {
            type: 'ROOM_INFO_RESPONSE',
            roomCode: state.roomCode,
            maxNumber: state.maxNumber,
            playerCount: state.playerCount
          };
          if (senderConn) {
            senderConn.send(response);
          }
          this.sendBroadcast(response);
          break;
        }

        case 'SUBMIT_GUESS': {
          // A client submitted a guess on their turn
          if (data.networkId) {
            import('./game.js').then(({ GameActions }) => {
              GameActions.submitGuess(data.guess);
            });
          }
          break;
        }

        case 'REQUEST_ROOM_RESTART': {
          // Client requested to restart in same room
          import('./game.js').then(({ GameActions }) => {
            GameActions.restartRoomGame();
          });
          break;
        }

        case 'PLAYER_REMATCH_READY': {
          const state = store.getState();
          const secret = Number(data.secretNumber);
          if (!Number.isInteger(secret) || secret < 1 || secret > state.maxNumber) {
            const rejectMsg = {
              type: 'JOIN_REJECTED',
              networkId: data.networkId,
              reason: `Your secret number (${data.secretNumber}) is out of range! The number limit is 1–${state.maxNumber}.`,
              maxNumber: state.maxNumber
            };
            if (senderConn) senderConn.send(rejectMsg);
            this.sendBroadcast(rejectMsg);
            return;
          }

          const updatedPlayers = state.players.map(p => {
            if (p.networkId === data.networkId) {
              return {
                ...p,
                secretNumber: secret,
                ready: true,
                active: true,
                eliminatedInRound: null
              };
            }
            return p;
          });

          sounds.playConfirm();
          triggerHaptic('light');

          store.setState({ players: updatedPlayers });
          this.broadcastLobbyState(updatedPlayers, state.playerCount, state.maxNumber);
          break;
        }

        case 'PLAYER_LEAVE': {
          const state = store.getState();
          const updatedPlayers = state.players.filter(p => p.networkId !== data.networkId);
          this.connections.delete(data.networkId);
          store.setState({ players: updatedPlayers });
          this.broadcastLobbyState(updatedPlayers, state.playerCount, state.maxNumber);
          break;
        }
      }
    } else {
      // CLIENT HANDLERS
      switch (data.type) {
        case 'JOIN_REJECTED': {
          if (!data.networkId || data.networkId === this.myPlayerId) {
            sounds.playMiss();
            triggerHaptic('heavy');
            store.setState({
              screen: store.getState().screen === SCREENS.ROOM_RESTART_SETUP ? SCREENS.ROOM_RESTART_SETUP : SCREENS.ROOM_JOIN_SETUP,
              maxNumber: data.maxNumber || store.getState().maxNumber
            });
            setTimeout(() => {
              const errorBox = document.querySelector('#join-validation-error') || document.querySelector('#rematch-secret-error');
              if (errorBox) {
                errorBox.textContent = data.reason || 'Secret number out of range!';
                errorBox.classList.remove('hidden');
              }
            }, 50);
          }
          break;
        }

        case 'ROOM_INFO_RESPONSE': {
          if (data.roomCode === this.roomCode || !this.roomCode) {
            store.setState({
              maxNumber: data.maxNumber,
              playerCount: data.playerCount
            });
            const rangeBadge = document.querySelector('#join-range-badge') || document.querySelector('#rematch-range-badge');
            if (rangeBadge) {
              rangeBadge.textContent = `Host Range: 1–${data.maxNumber}`;
            }
            const secretInput = document.querySelector('#join-secret-input') || document.querySelector('#rematch-secret-input');
            if (secretInput) {
              secretInput.max = data.maxNumber;
              secretInput.placeholder = `Pick number (1–${data.maxNumber})`;
            }
          }
          break;
        }

        case 'LOBBY_STATE_SYNC': {
          // Update players and lobby status
          store.setState({
            playerCount: data.playerCount,
            maxNumber: data.maxNumber,
            players: data.players.map(p => ({
              ...p,
              // Keep own secret number in memory, hide others'
              secretNumber: p.networkId === this.myPlayerId ? store.getState().myPlayerSecret : null
            }))
          });
          break;
        }

        case 'ROOM_RESTART_ROUND': {
          sounds.playConfirm();
          store.setState({
            guessedNumbers: [],
            round: 1,
            turnCount: 0,
            lastGuessResult: null,
            winner: null,
            myPlayerSecret: null,
            maxNumber: data.maxNumber || store.getState().maxNumber,
            players: (data.players || store.getState().players).map(p => ({
              ...p,
              ready: false,
              active: true,
              eliminatedInRound: null,
              secretNumber: null
            })),
            screen: SCREENS.ROOM_RESTART_SETUP
          });
          break;
        }

        case 'HOST_LEFT_ROOM': {
          sounds.playMiss();
          alert('The host has left or closed the room.');
          this.leaveRoom();
          store.reset();
          store.setState({ screen: SCREENS.HOME });
          break;
        }


        case 'START_GAME_SYNC': {
          sounds.playConfirm();
          store.setState({
            players: data.players.map(p => ({
              ...p,
              secretNumber: p.networkId === this.myPlayerId ? store.getState().myPlayerSecret : null
            })),
            maxNumber: data.maxNumber,
            currentPlayerIndex: data.currentPlayerIndex,
            round: data.round,
            turnCount: data.turnCount,
            guessedNumbers: data.guessedNumbers,
            screen: SCREENS.GUESSING
          });
          break;
        }

        case 'GUESS_RESULT_SYNC': {
          const eliminatedCount = data.lastGuessResult && data.lastGuessResult.eliminated ? data.lastGuessResult.eliminated.length : 0;
          if (eliminatedCount > 0) {
            sounds.playElimination();
            triggerHaptic('heavy');
          } else {
            sounds.playClick();
          }

          store.setState({
            players: data.players.map(p => ({
              ...p,
              secretNumber: p.networkId === this.myPlayerId ? store.getState().myPlayerSecret : null
            })),
            guessedNumbers: data.guessedNumbers,
            lastGuessResult: data.lastGuessResult,
            turnCount: data.turnCount,
            currentPlayerIndex: data.currentPlayerIndex !== undefined ? data.currentPlayerIndex : store.getState().currentPlayerIndex,
            round: data.round,
            historyLog: data.historyLog,
            stats: data.stats,
            screen: SCREENS.GUESSING
          });
          break;
        }


        case 'TURN_ADVANCE_SYNC': {
          store.setState({
            currentPlayerIndex: data.currentPlayerIndex,
            round: data.round,
            screen: SCREENS.GUESSING
          });
          break;
        }

        case 'WINNER_SYNC': {
          sounds.playVictory();
          store.setState({
            winner: data.winner,
            screen: SCREENS.WINNER
          });
          break;
        }

        case 'RESET_GAME_SYNC': {
          sounds.playClick();
          store.setState({
            screen: SCREENS.HOME
          });
          break;
        }
      }
    }
  }

  /**
   * Broadcast helper for host -> all connected clients
   */
  broadcastToAll(payload) {
    // Send via WebRTC to all clients
    for (const conn of this.connections.values()) {
      if (conn && conn.open) {
        conn.send(payload);
      }
    }
    // Also send via BroadcastChannel
    this.sendBroadcast(payload);
  }

  sendBroadcast(payload) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {
        console.warn('Broadcast send error', e);
      }
    }
  }

  /**
   * Host broadcasts safe public lobby list (omitting secret numbers)
   */
  broadcastLobbyState(players, playerCount, maxNumber) {
    const sanitizedPlayers = players.map(p => ({
      id: p.id,
      networkId: p.networkId,
      name: p.name,
      isHost: p.isHost,
      ready: p.ready,
      active: p.active
    }));

    this.broadcastToAll({
      type: 'LOBBY_STATE_SYNC',
      playerCount,
      maxNumber,
      players: sanitizedPlayers
    });
  }

  /**
   * Host starts the match
   */
  hostStartGame() {
    const state = store.getState();
    const sanitizedPlayers = state.players.map(p => ({
      id: p.id,
      networkId: p.networkId,
      name: p.name,
      isHost: p.isHost,
      ready: p.ready,
      active: p.active
    }));

    this.broadcastToAll({
      type: 'START_GAME_SYNC',
      players: sanitizedPlayers,
      maxNumber: state.maxNumber,
      currentPlayerIndex: 0,
      round: 1,
      turnCount: 0,
      guessedNumbers: []
    });

    store.setState({
      currentPlayerIndex: 0,
      round: 1,
      turnCount: 0,
      guessedNumbers: [],
      screen: SCREENS.GUESSING
    });
  }

  /**
   * Host broadcasts guess results to all players
   */
  hostBroadcastGuessResult(state) {
    const sanitizedPlayers = state.players.map(p => ({
      id: p.id,
      networkId: p.networkId,
      name: p.name,
      isHost: p.isHost,
      ready: p.ready,
      active: p.active,
      eliminatedInRound: p.eliminatedInRound
    }));

    this.broadcastToAll({
      type: 'GUESS_RESULT_SYNC',
      players: sanitizedPlayers,
      guessedNumbers: state.guessedNumbers,
      lastGuessResult: state.lastGuessResult,
      turnCount: state.turnCount,
      currentPlayerIndex: state.currentPlayerIndex,
      round: state.round,
      historyLog: state.historyLog,
      stats: state.stats
    });
  }


  /**
   * Host broadcasts turn advance
   */
  hostBroadcastTurnAdvance(nextPlayerIndex, nextRound) {
    this.broadcastToAll({
      type: 'TURN_ADVANCE_SYNC',
      currentPlayerIndex: nextPlayerIndex,
      round: nextRound
    });
  }

  /**
   * Host broadcasts winner
   */
  hostBroadcastWinner(winner) {
    this.broadcastToAll({
      type: 'WINNER_SYNC',
      winner
    });
  }

  /**
   * Client sends guess to host
   */
  clientSendGuess(guess) {
    const payload = {
      type: 'SUBMIT_GUESS',
      networkId: this.myPlayerId,
      guess
    };

    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }
    this.sendBroadcast(payload);
  }

  /**
   * Client requests continue to next turn
   */
  clientRequestContinue() {
    const payload = {
      type: 'REQUEST_CONTINUE',
      networkId: this.myPlayerId
    };
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }
    this.sendBroadcast(payload);
  }

  /**
   * Host broadcasts restart of round in same room
   */
  broadcastRoomRestart(players, maxNumber) {
    const sanitizedPlayers = players.map(p => ({
      id: p.id,
      networkId: p.networkId,
      name: p.name,
      isHost: p.isHost,
      ready: false,
      active: true,
      eliminatedInRound: null
    }));

    this.broadcastToAll({
      type: 'ROOM_RESTART_ROUND',
      maxNumber,
      players: sanitizedPlayers
    });
  }

  /**
   * Client requests room restart
   */
  clientRequestRestart() {
    const payload = {
      type: 'REQUEST_ROOM_RESTART',
      networkId: this.myPlayerId
    };
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }
    this.sendBroadcast(payload);
  }

  /**
   * Client sends rematch secret number to host
   */
  clientSendRematchSecret(secretNumber) {
    const payload = {
      type: 'PLAYER_REMATCH_READY',
      networkId: this.myPlayerId,
      secretNumber
    };
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }
    this.sendBroadcast(payload);
  }

  /**
   * Leave room and clean up networking
   */
  leaveRoom() {
    if (this.isHost) {
      this.broadcastToAll({ type: 'HOST_LEFT_ROOM' });
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send({
          type: 'PLAYER_LEAVE',
          networkId: this.myPlayerId
        });
      }
      this.sendBroadcast({
        type: 'PLAYER_LEAVE',
        networkId: this.myPlayerId
      });
    }

    // Close connections
    for (const conn of this.connections.values()) {
      if (conn && conn.close) {
        try {
          conn.close();
        } catch (e) {
          // ignore
        }
      }
    }
    this.connections.clear();

    if (this.hostConnection && this.hostConnection.close) {
      try {
        this.hostConnection.close();
      } catch (e) {
        // ignore
      }
      this.hostConnection = null;
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch (e) {
        // ignore
      }
      this.broadcastChannel = null;
    }

    if (this.peer && !this.peer.destroyed) {
      try {
        this.peer.destroy();
      } catch (e) {
        // ignore
      }
      this.peer = null;
    }

    this.isHost = false;
    this.myPlayerId = null;
    this.roomCode = null;
  }
}

export const network = new NetworkManager();
