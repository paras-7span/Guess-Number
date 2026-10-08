/**
 * Application Entry Point
 */

import '../css/styles.css';
import { initUI } from './ui.js';
import { GameActions } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  GameActions.loadFromUrlParams();
  initUI();
});

