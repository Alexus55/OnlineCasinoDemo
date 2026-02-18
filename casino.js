/* ============================================
   ALEXUS CASINO - Game Logic
   ============================================ */

'use strict';

// ============ STATE ============
const State = {
  balance: 100,
  jackpot: 50,

  slots: {
    classic: {
      bet: 0.20,
      betLevels: [0.20, 0.50, 1.00, 2.00, 5.00],
      spinning: false,
      freeSpins: 0,
      freeSpinMultiplier: 3,
      result: null,
    },
    fruit: {
      bet: 0.20,
      betLevels: [0.20, 0.50, 1.00, 2.00, 5.00],
      spinning: false,
      result: null,
    },
    luxury: {
      bet: 0.20,
      betLevels: [0.20, 1.00, 2.00, 5.00, 10.00],
      spinning: false,
      result: null,
    }
  },

  blackjack: {
    deck: [],
    playerHand: [],
    dealerHand: [],
    splitHand: [],
    bet: 0,
    splitBet: 0,
    phase: 'betting', // betting | playing | split-playing | dealer | done
    playingSplit: false,
    wins: 0,
    losses: 0,
    pushes: 0,
  }
};

// ============ SLOT DEFINITIONS ============

const SLOT_CONFIG = {
  classic: {
    // Book of Ra style
    symbols: [
      { id: 'book',    emoji: '📖', weight: 2,  pays: [0,0,10,25,100], name: 'Book (Wild/Scatter)' },
      { id: 'pharaoh', emoji: '👑', weight: 4,  pays: [0,0,8,20,80],  name: 'Pharaoh' },
      { id: 'eye',     emoji: '🔮', weight: 5,  pays: [0,0,5,15,50],  name: 'Eye of Ra' },
      { id: 'scarab',  emoji: '🪲', weight: 6,  pays: [0,0,4,10,30],  name: 'Scarab' },
      { id: 'ankh',    emoji: '☥',  weight: 7,  pays: [0,0,3,8,20],   name: 'Ankh' },
      { id: 'ten',     emoji: '🔟', weight: 12, pays: [0,0,1,3,8],    name: '10' },
      { id: 'jack',    emoji: 'J',  weight: 12, pays: [0,0,1,3,8],    name: 'J' },
      { id: 'queen',   emoji: 'Q',  weight: 12, pays: [0,0,1,3,8],    name: 'Q' },
      { id: 'king',    emoji: 'K',  weight: 12, pays: [0,0,1,3,8],    name: 'K' },
      { id: 'ace',     emoji: 'A',  weight: 10, pays: [0,0,2,5,15],   name: 'A' },
    ],
    wild: 'book',
    scatter: 'book',
    scatterCount: 3,
    freeSpins: 10,
    freeSpinMultiplier: 3,
    lines: 10,
    linePatterns: [
      [1,1,1,1,1], // middle row
      [0,0,0,0,0], // top row
      [2,2,2,2,2], // bottom row
      [0,1,2,1,0], // V shape
      [2,1,0,1,2], // inverted V
      [1,0,1,0,1], // zigzag top
      [1,2,1,2,1], // zigzag bottom
      [0,0,1,2,2], // diagonal down
      [2,2,1,0,0], // diagonal up
      [1,0,0,0,1], // U shape
    ]
  },
  fruit: {
    symbols: [
      { id: 'star',   emoji: '⭐', weight: 2,  pays: [0,0,15,40,150], name: 'Star (Wild)' },
      { id: 'seven',  emoji: '7️⃣', weight: 3,  pays: [0,0,10,25,100], name: 'Lucky 7' },
      { id: 'bell',   emoji: '🔔', weight: 5,  pays: [0,0,6,15,60],   name: 'Bell' },
      { id: 'grape',  emoji: '🍇', weight: 7,  pays: [0,0,4,10,40],   name: 'Grapes' },
      { id: 'orange', emoji: '🍊', weight: 8,  pays: [0,0,3,8,25],    name: 'Orange' },
      { id: 'lemon',  emoji: '🍋', weight: 9,  pays: [0,0,3,7,20],    name: 'Lemon' },
      { id: 'cherry', emoji: '🍒', weight: 10, pays: [0,0,2,5,15],    name: 'Cherry' },
      { id: 'melon',  emoji: '🍉', weight: 10, pays: [0,0,2,5,15],    name: 'Watermelon' },
    ],
    wild: 'star',
    expandingWild: true,
    lines: 10,
    linePatterns: [
      [1,1,1,1,1],
      [0,0,0,0,0],
      [2,2,2,2,2],
      [0,1,2,1,0],
      [2,1,0,1,2],
      [1,0,1,0,1],
      [1,2,1,2,1],
      [0,0,1,2,2],
      [2,2,1,0,0],
      [1,0,0,0,1],
    ]
  },
  luxury: {
    symbols: [
      { id: 'diamond', emoji: '💎', weight: 1,  pays: [0,0,20,60,250], name: 'Diamond (Jackpot)' },
      { id: 'crown',   emoji: '👑', weight: 2,  pays: [0,0,12,35,120], name: 'Crown' },
      { id: 'panther', emoji: '🐆', weight: 3,  pays: [0,0,8,20,80],   name: 'Panther' },
      { id: 'eagle',   emoji: '🦅', weight: 4,  pays: [0,0,6,15,55],   name: 'Eagle' },
      { id: 'rose',    emoji: '🌹', weight: 5,  pays: [0,0,4,10,35],   name: 'Rose' },
      { id: 'ring',    emoji: '💍', weight: 6,  pays: [0,0,3,8,25],    name: 'Ring' },
      { id: 'trophy',  emoji: '🏆', weight: 7,  pays: [0,0,2,6,18],    name: 'Trophy' },
      { id: 'gem',     emoji: '💠', weight: 8,  pays: [0,0,2,5,12],    name: 'Gem' },
    ],
    wild: 'diamond',
    jackpotSymbol: 'diamond',
    lines: 10,
    linePatterns: [
      [1,1,1,1,1],
      [0,0,0,0,0],
      [2,2,2,2,2],
      [0,1,2,1,0],
      [2,1,0,1,2],
      [1,0,1,0,1],
      [1,2,1,2,1],
      [0,0,1,2,2],
      [2,2,1,0,0],
      [1,0,0,0,1],
    ]
  }
};

// ============ UTILITY FUNCTIONS ============

function fmt(amount) {
  return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function loadState() {
  try {
    const saved = localStorage.getItem('alexusCasino');
    if (saved) {
      const data = JSON.parse(saved);
      State.balance = data.balance ?? 100;
      State.jackpot = data.jackpot ?? 50;
      State.blackjack.wins = data.bjWins ?? 0;
      State.blackjack.losses = data.bjLosses ?? 0;
      State.blackjack.pushes = data.bjPushes ?? 0;
    }
  } catch (e) {}
}

function saveState() {
  try {
    localStorage.setItem('alexusCasino', JSON.stringify({
      balance: State.balance,
      jackpot: State.jackpot,
      bjWins: State.blackjack.wins,
      bjLosses: State.blackjack.losses,
      bjPushes: State.blackjack.pushes,
    }));
  } catch (e) {}
}

function updateAllBalances() {
  const displays = ['header-balance', 'home-balance', 'shop-balance'];
  displays.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmt(State.balance);
  });
  saveState();
}

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');

  // Find matching nav button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + name + "'")) {
      btn.classList.add('active');
    }
  });

  if (name === 'classic') initSlot('classic');
  if (name === 'fruit') initSlot('fruit');
  if (name === 'luxury') initSlot('luxury');
  if (name === 'blackjack') initBlackjackUI();
}

// ============ SLOT ENGINE ============

function weightedRandom(symbols) {
  const total = symbols.reduce((sum, s) => sum + s.weight, 0);
  let r = Math.random() * total;
  for (const sym of symbols) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return symbols[symbols.length - 1];
}

function generateReelStrip(config, reelIndex) {
  const strip = [];
  // Add extra symbols above and below for animation
  for (let i = 0; i < 20; i++) {
    strip.push(weightedRandom(config.symbols));
  }
  return strip;
}

function getReelSymbols(config) {
  // Generate 5 reels × 5 rows (3 visible + padding)
  const reels = [];
  for (let r = 0; r < 5; r++) {
    const reel = [];
    for (let row = 0; row < 5; row++) {
      reel.push(weightedRandom(config.symbols));
    }
    reels.push(reel);
  }
  return reels;
}

function initSlot(game) {
  const config = SLOT_CONFIG[game];
  // Render initial reels
  for (let r = 0; r < 5; r++) {
    const reelEl = document.getElementById(game + '-reel-' + r);
    if (!reelEl) continue;
    reelEl.innerHTML = '';
    for (let row = 0; row < 3; row++) {
      const sym = weightedRandom(config.symbols);
      const div = document.createElement('div');
      div.className = 'reel-symbol';
      div.textContent = sym.emoji;
      reelEl.appendChild(div);
    }
  }

  updateBetDisplay(game);
  buildPaytable(game);

  if (game === 'luxury') {
    document.getElementById('jackpot-amount').textContent = fmt(State.jackpot);
  }
}

function buildPaytable(game) {
  const config = SLOT_CONFIG[game];
  const grid = document.getElementById(game + '-paytable');
  if (!grid) return;
  grid.innerHTML = '';
  config.symbols.forEach(sym => {
    const item = document.createElement('div');
    item.className = 'paytable-item';
    item.innerHTML = `
      <div class="paytable-symbols">${sym.emoji}${sym.emoji}${sym.emoji}</div>
      <div class="paytable-mult">×${sym.pays[2]}</div>
      <div class="paytable-desc">${sym.name}</div>
    `;
    grid.appendChild(item);
  });
}

function updateBetDisplay(game) {
  const s = State.slots[game];
  const betEl = document.getElementById(game + '-bet');
  if (betEl) betEl.textContent = fmt(s.bet);
  const totalEl = document.getElementById(game + '-total-bet');
  if (totalEl) totalEl.textContent = fmt(s.bet * 10);
}

function changeBet(game, direction) {
  const s = State.slots[game];
  const levels = s.betLevels;
  let idx = levels.findIndex(l => Math.abs(l - s.bet) < 0.001);
  idx = Math.max(0, Math.min(levels.length - 1, idx + direction));
  s.bet = levels[idx];
  updateBetDisplay(game);
}

function setBet(game, amount) {
  State.slots[game].bet = amount;
  updateBetDisplay(game);
}

// ============ SPIN LOGIC ============

async function spin(game) {
  const s = State.slots[game];
  const config = SLOT_CONFIG[game];

  if (s.spinning) return;

  const totalBet = s.bet * 10; // 10 lines

  // Check free spins
  const isFreeSpinRound = game === 'classic' && s.freeSpins > 0;

  if (!isFreeSpinRound) {
    if (State.balance < totalBet) {
      showNotification('Nicht genug Guthaben! Besuche den Shop.', 'error');
      return;
    }
    State.balance -= totalBet;
    updateAllBalances();
  }

  // Add to jackpot (luxury only)
  if (game === 'luxury') {
    State.jackpot += totalBet * 0.05;
    document.getElementById('jackpot-amount').textContent = fmt(State.jackpot);
  }

  s.spinning = true;
  const spinBtn = document.getElementById(game + '-spin-btn');
  spinBtn.disabled = true;
  spinBtn.classList.add('spinning');
  spinBtn.textContent = '...';

  // Clear win indicators
  document.getElementById(game + '-win-lines').innerHTML = '';

  if (game === 'fruit') {
    document.getElementById('fruit-wild-banner').style.display = 'none';
  }

  // Generate result
  const reelResults = [];
  for (let r = 0; r < 5; r++) {
    const col = [];
    for (let row = 0; row < 3; row++) {
      col.push(weightedRandom(config.symbols));
    }
    reelResults.push(col);
  }

  // Animate reels
  await animateReels(game, reelResults);

  // Check for expanding wild (fruit)
  let expandedReels = null;
  if (game === 'fruit' && config.expandingWild) {
    expandedReels = checkExpandingWild(reelResults, config);
    if (expandedReels) {
      document.getElementById('fruit-wild-banner').style.display = 'block';
      await applyExpandingWild(game, expandedReels);
    }
  }

  const finalReels = expandedReels || reelResults;

  // Check for scatter / free spins (classic)
  if (game === 'classic') {
    const scatterCount = countSymbol(finalReels, config.scatter);
    if (scatterCount >= config.scatterCount && s.freeSpins === 0) {
      await delay(300);
      s.freeSpins = config.freeSpins;
      s.freeSpinMultiplier = config.freeSpinMultiplier;
      document.getElementById('classic-freespins-display').style.display = 'flex';
      document.getElementById('classic-freespins-count').textContent = s.freeSpins;
      document.getElementById('classic-freespins-multi').textContent = s.freeSpinMultiplier;
      showNotification('🎁 FREISPIELE! ' + s.freeSpins + ' Gratis-Spiele mit ×' + s.freeSpinMultiplier, 'success');
    } else if (isFreeSpinRound) {
      s.freeSpins--;
      document.getElementById('classic-freespins-count').textContent = s.freeSpins;
      if (s.freeSpins === 0) {
        document.getElementById('classic-freespins-display').style.display = 'none';
        showNotification('Freispiele beendet!', 'info');
      }
    }
  }

  // Calculate wins
  const { totalWin, winLines } = calculateWin(finalReels, config, s.bet);

  let multiplier = 1;
  if (game === 'classic' && s.freeSpins >= 0 && isFreeSpinRound) {
    multiplier = s.freeSpinMultiplier;
  }

  const finalWin = totalWin * multiplier;

  // Jackpot check (luxury: 5 diamonds)
  if (game === 'luxury') {
    const allDiamonds = finalReels.every(col => col.some(sym => sym.id === 'diamond'));
    const middleDiamonds = finalReels.every(col => col[1].id === 'diamond');
    if (middleDiamonds) {
      // JACKPOT!
      await delay(500);
      const jackpotWin = State.jackpot;
      State.balance += jackpotWin;
      State.jackpot = 50;
      document.getElementById('jackpot-amount').textContent = fmt(State.jackpot);
      updateAllBalances();
      showJackpot(jackpotWin);
      s.spinning = false;
      spinBtn.disabled = false;
      spinBtn.classList.remove('spinning');
      spinBtn.textContent = 'SPIN';
      return;
    }
  }

  // Apply win
  if (finalWin > 0) {
    State.balance += finalWin;
    updateAllBalances();
    markWinningSymbols(game, finalReels, winLines, config);
    showWinLines(game, winLines);
    updateLastWin(game, finalWin, multiplier > 1);
    if (finalWin >= totalBet * 5) {
      showBigWin(finalWin);
    }
  } else {
    updateLastWin(game, 0, false);
  }

  s.spinning = false;
  spinBtn.disabled = false;
  spinBtn.classList.remove('spinning');
  spinBtn.textContent = 'SPIN';
  saveState();
}

function countSymbol(reels, symId) {
  let count = 0;
  reels.forEach(col => col.forEach(sym => { if (sym.id === symId) count++; }));
  return count;
}

function checkExpandingWild(reels, config) {
  // If any middle row symbol is wild, expand that reel
  let hasWild = false;
  for (let r = 0; r < 5; r++) {
    if (reels[r][1].id === config.wild) { hasWild = true; break; }
  }
  if (!hasWild) return null;

  // Clone and expand wilds to full reels
  const expanded = reels.map((col, r) => {
    if (col[1].id === config.wild || col.some(s => s.id === config.wild)) {
      return col.map(() => config.symbols.find(s => s.id === config.wild));
    }
    return col;
  });
  return expanded;
}

async function applyExpandingWild(game, expandedReels) {
  await delay(400);
  for (let r = 0; r < 5; r++) {
    const reelEl = document.getElementById(game + '-reel-' + r);
    const cells = reelEl.querySelectorAll('.reel-symbol');
    cells.forEach((cell, row) => {
      if (expandedReels[r][row].id === SLOT_CONFIG[game].wild) {
        cell.textContent = expandedReels[r][row].emoji;
        cell.style.animation = 'symbol-win 0.4s ease-in-out 3';
      }
    });
  }
  await delay(600);
}

function calculateWin(reels, config, bet) {
  let totalWin = 0;
  const winLines = [];

  config.linePatterns.forEach((pattern, lineIndex) => {
    const line = pattern.map((row, col) => reels[col][row]);

    // Find longest matching sequence from left
    const first = line[0];
    let count = 1;

    for (let i = 1; i < 5; i++) {
      const sym = line[i];
      if (sym.id === first.id || sym.id === config.wild || first.id === config.wild) {
        count++;
      } else {
        break;
      }
    }

    // Get actual symbol (could be wild)
    let matchSym = first;
    if (first.id === config.wild) {
      // find first non-wild
      for (const s of line) {
        if (s.id !== config.wild) { matchSym = s; break; }
      }
      if (matchSym.id === config.wild) matchSym = first; // all wild
    }

    if (count >= 3) {
      const multiplier = matchSym.pays[count - 1] || 0;
      if (multiplier > 0) {
        const lineWin = bet * multiplier;
        totalWin += lineWin;
        winLines.push({ lineIndex, pattern, count, sym: matchSym, win: lineWin });
      }
    }
  });

  return { totalWin, winLines };
}

function markWinningSymbols(game, reels, winLines, config) {
  // Clear previous
  for (let r = 0; r < 5; r++) {
    const reelEl = document.getElementById(game + '-reel-' + r);
    reelEl.querySelectorAll('.reel-symbol').forEach(el => el.classList.remove('winning'));
  }

  winLines.forEach(wl => {
    wl.pattern.forEach((row, col) => {
      const reelEl = document.getElementById(game + '-reel-' + col);
      const cells = reelEl.querySelectorAll('.reel-symbol');
      if (cells[row]) cells[row].classList.add('winning');
    });
  });
}

function showWinLines(game, winLines) {
  const container = document.getElementById(game + '-win-lines');
  container.innerHTML = '';
  winLines.forEach(wl => {
    const badge = document.createElement('div');
    badge.className = 'win-line-badge';
    badge.textContent = wl.sym.emoji + ' ×' + wl.count + ' → ' + fmt(wl.win);
    container.appendChild(badge);
  });
}

function updateLastWin(game, amount, isMultiplied) {
  const el = document.getElementById(game + '-last-win');
  if (amount > 0) {
    el.textContent = 'Letzter Gewinn: ' + fmt(amount) + (isMultiplied ? ' (×3 Multiplikator!)' : '');
    el.className = 'last-win has-win';
  } else {
    el.textContent = 'Letzter Gewinn: —';
    el.className = 'last-win';
  }
}

// ============ REEL ANIMATION ============

async function animateReels(game, finalSymbols) {
  const promises = [];
  for (let r = 0; r < 5; r++) {
    promises.push(animateReel(game, r, finalSymbols[r], r * 120));
  }
  await Promise.all(promises);
}

async function animateReel(game, reelIndex, finalSymbols, delayMs) {
  await delay(delayMs);

  const reelEl = document.getElementById(game + '-reel-' + reelIndex);
  reelEl.classList.add('reel-spinning');

  // Fast-scroll effect: replace symbols rapidly
  const spinDuration = 400 + reelIndex * 150;
  const startTime = Date.now();

  await new Promise(resolve => {
    const interval = setInterval(() => {
      const config = SLOT_CONFIG[game];
      const cells = reelEl.querySelectorAll('.reel-symbol');
      cells.forEach(cell => {
        cell.textContent = weightedRandom(config.symbols).emoji;
      });

      if (Date.now() - startTime >= spinDuration) {
        clearInterval(interval);
        // Set final symbols
        cells.forEach((cell, row) => {
          if (finalSymbols[row]) {
            cell.textContent = finalSymbols[row].emoji;
            cell.classList.remove('winning');
          }
        });
        reelEl.classList.remove('reel-spinning');
        resolve();
      }
    }, 60);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ WIN DISPLAY ============

function showBigWin(amount) {
  const overlay = document.getElementById('win-overlay');
  const title = document.getElementById('win-overlay-title');
  const amountEl = document.getElementById('win-overlay-amount');
  const coins = document.getElementById('win-coins');

  title.textContent = amount >= 50 ? 'MEGA GEWINN! 🎉' : 'GEWINN!';
  amountEl.textContent = fmt(amount);
  coins.textContent = '🪙🪙🪙🪙🪙';

  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 2500);
}

function showJackpot(amount) {
  document.getElementById('jackpot-overlay-amount').textContent = fmt(amount);
  document.getElementById('jackpot-overlay').style.display = 'flex';
}

function closeJackpot() {
  document.getElementById('jackpot-overlay').style.display = 'none';
}

function showNotification(msg, type = 'info') {
  // Simple toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    background:${type === 'success' ? '#00aa44' : type === 'error' ? '#cc2222' : '#444'};
    color:white; padding:12px 24px; border-radius:8px; font-weight:700;
    font-size:14px; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.5);
    animation: fadeIn 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2000);
  setTimeout(() => toast.remove(), 2400);
}

// ============ BLACKJACK ============

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, hidden: false });
    }
  }
  // Shuffle multiple decks (6 deck shoe)
  const shoe = [];
  for (let d = 0; d < 6; d++) shoe.push(...deck.map(c => ({...c})));
  return shuffleDeck(shoe);
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(rank) {
  if (['J','Q','K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
}

function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.hidden) continue;
    total += cardValue(card.rank);
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && handValue(hand) === 21;
}

function isBust(hand) {
  return handValue(hand) > 21;
}

function drawCard() {
  const bj = State.blackjack;
  if (bj.deck.length < 15) bj.deck = createDeck();
  return bj.deck.pop();
}

function initBlackjackUI() {
  const bj = State.blackjack;
  document.getElementById('bj-wins').textContent = bj.wins;
  document.getElementById('bj-losses').textContent = bj.losses;
  document.getElementById('bj-pushes').textContent = bj.pushes;
  if (bj.phase === 'betting') {
    newBlackjackGame();
  }
}

function newBlackjackGame() {
  const bj = State.blackjack;
  bj.playerHand = [];
  bj.dealerHand = [];
  bj.splitHand = [];
  bj.bet = 0;
  bj.splitBet = 0;
  bj.phase = 'betting';
  bj.playingSplit = false;

  if (bj.deck.length < 15) bj.deck = createDeck();

  renderBJHands();
  showBJSection('betting');
  document.getElementById('bj-result').style.display = 'none';
  document.getElementById('split-hand-area').style.display = 'none';
  document.getElementById('bj-bet-display').textContent = '0,00 €';
  document.getElementById('deal-btn').disabled = true;
  document.getElementById('dealer-score-label').textContent = '';
  document.getElementById('player-score-label').textContent = '';
  document.getElementById('split-score-label').textContent = '';
  bj.bet = 0;
}

function placeBet(amount) {
  const bj = State.blackjack;
  if (bj.phase !== 'betting') return;
  const newBet = Math.min(bj.bet + amount, 50);
  if (newBet > State.balance) {
    showNotification('Nicht genug Guthaben!', 'error');
    return;
  }
  bj.bet = newBet;
  document.getElementById('bj-bet-display').textContent = fmt(bj.bet);
  document.getElementById('deal-btn').disabled = bj.bet <= 0;
}

function clearBet() {
  State.blackjack.bet = 0;
  document.getElementById('bj-bet-display').textContent = '0,00 €';
  document.getElementById('deal-btn').disabled = true;
}

function dealBlackjack() {
  const bj = State.blackjack;
  if (bj.bet <= 0 || bj.phase !== 'betting') return;
  if (State.balance < bj.bet) {
    showNotification('Nicht genug Guthaben!', 'error');
    return;
  }

  State.balance -= bj.bet;
  updateAllBalances();

  // Deal cards
  bj.playerHand = [drawCard(), drawCard()];
  bj.dealerHand = [drawCard(), { ...drawCard(), hidden: true }];
  bj.phase = 'playing';

  renderBJHands();
  showBJSection('playing');

  // Check for split
  const canSplit = bj.playerHand[0].rank === bj.playerHand[1].rank && State.balance >= bj.bet;
  document.getElementById('bj-split-btn').style.display = canSplit ? 'inline-block' : 'none';

  // Check player blackjack
  if (isBlackjack(bj.playerHand)) {
    // Reveal dealer
    bj.dealerHand[1].hidden = false;
    renderBJHands();
    if (isBlackjack(bj.dealerHand)) {
      endBlackjack('push');
    } else {
      endBlackjack('blackjack');
    }
    return;
  }
}

function bjHit() {
  const bj = State.blackjack;
  if (bj.phase !== 'playing' && bj.phase !== 'split-playing') return;

  if (bj.playingSplit) {
    bj.splitHand.push(drawCard());
    renderBJHands();
    document.getElementById('split-score-label').textContent = '(' + handValue(bj.splitHand) + ')';
    if (isBust(bj.splitHand)) {
      // Split hand bust, move back to check main
      bj.playingSplit = false;
      bjDealerPlay();
    } else if (handValue(bj.splitHand) === 21) {
      bj.playingSplit = false;
      bjDealerPlay();
    }
  } else {
    bj.playerHand.push(drawCard());
    renderBJHands();
    document.getElementById('player-score-label').textContent = '(' + handValue(bj.playerHand) + ')';
    document.getElementById('bj-double-btn').style.display = 'none';
    document.getElementById('bj-split-btn').style.display = 'none';

    if (isBust(bj.playerHand)) {
      bj.dealerHand[1].hidden = false;
      renderBJHands();
      if (bj.splitHand.length > 0) {
        bj.playingSplit = true;
        bj.phase = 'split-playing';
        renderBJHands();
        updateBJScores();
      } else {
        endBlackjack('bust');
      }
    } else if (handValue(bj.playerHand) === 21) {
      bjStand();
    }
  }
}

function bjStand() {
  const bj = State.blackjack;
  if (bj.phase !== 'playing' && bj.phase !== 'split-playing') return;

  if (bj.splitHand.length > 0 && !bj.playingSplit && bj.phase === 'playing') {
    bj.playingSplit = true;
    bj.phase = 'split-playing';
    updateBJScores();
    return;
  }

  bj.playingSplit = false;
  bjDealerPlay();
}

function bjDouble() {
  const bj = State.blackjack;
  if (bj.phase !== 'playing' || State.balance < bj.bet) return;

  State.balance -= bj.bet;
  bj.bet *= 2;
  updateAllBalances();

  bj.playerHand.push(drawCard());
  renderBJHands();
  document.getElementById('player-score-label').textContent = '(' + handValue(bj.playerHand) + ')';

  if (isBust(bj.playerHand)) {
    bj.dealerHand[1].hidden = false;
    renderBJHands();
    endBlackjack('bust');
  } else {
    bjDealerPlay();
  }
}

function bjSplit() {
  const bj = State.blackjack;
  if (State.balance < bj.bet) {
    showNotification('Nicht genug Guthaben für Split!', 'error');
    return;
  }

  State.balance -= bj.bet;
  bj.splitBet = bj.bet;
  updateAllBalances();

  bj.splitHand = [bj.playerHand.pop()];
  bj.splitHand[0].hidden = false;
  bj.playerHand.push(drawCard());
  bj.splitHand.push(drawCard());

  document.getElementById('split-hand-area').style.display = 'block';
  document.getElementById('bj-split-btn').style.display = 'none';
  renderBJHands();
  updateBJScores();
}

function bjDealerPlay() {
  const bj = State.blackjack;
  bj.dealerHand[1].hidden = false;
  renderBJHands();

  // Dealer draws to 17
  const playDealer = () => {
    if (handValue(bj.dealerHand) < 17) {
      setTimeout(() => {
        bj.dealerHand.push(drawCard());
        renderBJHands();
        document.getElementById('dealer-score-label').textContent = '(' + handValue(bj.dealerHand) + ')';
        playDealer();
      }, 500);
    } else {
      document.getElementById('dealer-score-label').textContent = '(' + handValue(bj.dealerHand) + ')';
      evaluateBlackjack();
    }
  };
  playDealer();
}

function evaluateBlackjack() {
  const bj = State.blackjack;
  const dealer = handValue(bj.dealerHand);
  const player = handValue(bj.playerHand);
  const dealerBust = isBust(bj.dealerHand);

  // Main hand result
  let mainResult;
  if (isBust(bj.playerHand)) {
    mainResult = 'lose';
  } else if (dealerBust || player > dealer) {
    mainResult = 'win';
  } else if (player === dealer) {
    mainResult = 'push';
  } else {
    mainResult = 'lose';
  }

  // Split hand result
  let splitResult = null;
  if (bj.splitHand.length > 0) {
    const split = handValue(bj.splitHand);
    if (isBust(bj.splitHand)) {
      splitResult = 'lose';
    } else if (dealerBust || split > dealer) {
      splitResult = 'win';
    } else if (split === dealer) {
      splitResult = 'push';
    } else {
      splitResult = 'lose';
    }
  }

  endBlackjack(mainResult, splitResult);
}

function endBlackjack(result, splitResult) {
  const bj = State.blackjack;
  bj.phase = 'done';

  let totalPayout = 0;
  let msg = '';
  let msgClass = '';

  if (result === 'blackjack') {
    totalPayout = bj.bet * 2.5; // BJ pays 3:2
    msg = '🃏 BLACKJACK! +' + fmt(totalPayout - bj.bet);
    msgClass = 'result-bj';
    bj.wins++;
  } else if (result === 'win') {
    totalPayout = bj.bet * 2;
    msg = '✅ GEWONNEN! +' + fmt(bj.bet);
    msgClass = 'result-win';
    bj.wins++;
  } else if (result === 'push') {
    totalPayout = bj.bet;
    msg = '🤝 UNENTSCHIEDEN';
    msgClass = 'result-push';
    bj.pushes++;
  } else if (result === 'bust') {
    msg = '💥 BUST! -' + fmt(bj.bet);
    msgClass = 'result-lose';
    bj.losses++;
  } else {
    msg = '❌ VERLOREN! -' + fmt(bj.bet);
    msgClass = 'result-lose';
    bj.losses++;
  }

  // Split hand payout
  if (splitResult === 'win') {
    totalPayout += bj.splitBet * 2;
    msg += ' | SPLIT: ✅ +' + fmt(bj.splitBet);
    bj.wins++;
  } else if (splitResult === 'push') {
    totalPayout += bj.splitBet;
    msg += ' | SPLIT: 🤝';
    bj.pushes++;
  } else if (splitResult === 'lose') {
    msg += ' | SPLIT: ❌';
    bj.losses++;
  }

  State.balance += totalPayout;
  updateAllBalances();

  // Show result
  const resultEl = document.getElementById('bj-result');
  resultEl.textContent = msg;
  resultEl.className = 'bj-result-banner ' + msgClass;
  resultEl.style.display = 'block';

  showBJSection('newgame');
  updateBJScores();
  saveState();

  // Update stats display
  document.getElementById('bj-wins').textContent = bj.wins;
  document.getElementById('bj-losses').textContent = bj.losses;
  document.getElementById('bj-pushes').textContent = bj.pushes;
}

function showBJSection(phase) {
  document.getElementById('bj-bet-section').style.display = phase === 'betting' ? 'block' : 'none';
  document.getElementById('bj-action-section').style.display =
    (phase === 'playing' || phase === 'split-playing') ? 'block' : 'none';
  document.getElementById('bj-new-game').style.display = phase === 'newgame' ? 'block' : 'none';
}

function renderBJHands() {
  renderCards('dealer-cards', State.blackjack.dealerHand);
  renderCards('player-cards', State.blackjack.playerHand);
  renderCards('split-cards', State.blackjack.splitHand);
  updateBJScores();
}

function renderCards(containerId, hand) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  hand.forEach(card => {
    const cardEl = document.createElement('div');
    const isRed = card.suit === '♥' || card.suit === '♦';
    const colorClass = isRed ? 'card-red' : 'card-black';

    if (card.hidden) {
      cardEl.className = 'playing-card card-back';
    } else {
      cardEl.className = 'playing-card ' + colorClass;
      cardEl.innerHTML = `
        <span class="card-rank">${card.rank}${card.suit}</span>
        <span class="card-suit">${card.suit}</span>
        <span class="card-rank-bottom">${card.rank}${card.suit}</span>
      `;
    }
    container.appendChild(cardEl);
  });
}

function updateBJScores() {
  const bj = State.blackjack;
  if (bj.playerHand.length > 0) {
    document.getElementById('player-score-label').textContent = '(' + handValue(bj.playerHand) + ')';
  }
  if (bj.splitHand.length > 0) {
    document.getElementById('split-score-label').textContent = '(' + handValue(bj.splitHand) + ')';
  }
  const dealerVisible = bj.dealerHand.filter(c => !c.hidden);
  if (dealerVisible.length > 0) {
    document.getElementById('dealer-score-label').textContent = '(' + handValue(dealerVisible) + '+)';
    if (!bj.dealerHand.some(c => c.hidden)) {
      document.getElementById('dealer-score-label').textContent = '(' + handValue(bj.dealerHand) + ')';
    }
  }
}

// ============ SHOP ============

function getFreeCredits() {
  State.balance += 100;
  updateAllBalances();
  showBigWin(100);
  showNotification('🎁 +100€ Gratis-Spielgeld gutgeschrieben!', 'success');
}

function buyCredits(amount) {
  State.balance += amount;
  updateAllBalances();
  showBigWin(amount);
  showNotification('✅ +' + fmt(amount) + ' gutgeschrieben!', 'success');
}

// ============ INIT ============

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateAllBalances();

  // Init slots pre-load reels
  ['classic', 'fruit', 'luxury'].forEach(game => initSlot(game));

  // Init Blackjack
  State.blackjack.deck = createDeck();
  showBJSection('betting');

  // Jackpot ticker
  setInterval(() => {
    State.jackpot += 0.01;
    const el = document.getElementById('jackpot-amount');
    if (el) el.textContent = fmt(State.jackpot);
  }, 3000);

  // Keyboard support: Space = Spin on active slot
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      const active = document.querySelector('.section.active');
      if (!active) return;
      const id = active.id;
      if (id === 'section-classic') spin('classic');
      else if (id === 'section-fruit') spin('fruit');
      else if (id === 'section-luxury') spin('luxury');
    }
  });
});
