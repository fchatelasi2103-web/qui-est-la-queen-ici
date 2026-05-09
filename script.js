/* =============================================
   QUI EST LA QUEEN — script.js
   Version : soirée entre potes 👑
   ============================================= */

/* ================================================
   🎨 CONFIGURATION — MODIFIE ICI tes joueuses !
   ================================================
   Chaque joueuse a :
   - name      : prénom affiché sur la carte
   - emoji     : emoji affiché si pas de photo
   - photo     : chemin image (ex: "photos/lea.jpg") ou null
   - anecdote  : fun fact secret affiché au joueur au début
   ================================================ */
const PLAYERS = [
  {
    name: "Léa",
    emoji: "💅",
    photo: null,
    anecdote: "A déjà commandé un kebab à 3h du mat pour tout le groupe."
  },
  {
    name: "Camille",
    emoji: "🍷",
    photo: null,
    anecdote: "Connaît le barman de chaque bar du quartier par son prénom."
  },
  {
    name: "Zoé",
    emoji: "🎤",
    photo: null,
    anecdote: "Lance spontanément du karaoké n'importe où, n'importe quand."
  },
  {
    name: "Sarah",
    emoji: "📸",
    photo: null,
    anecdote: "Prend 47 photos avant d'en poster une sur Instagram."
  },
  {
    name: "Manon",
    emoji: "🛋️",
    photo: null,
    anecdote: "Préférerait rester en pyjama mais finit toujours à s'amuser le plus."
  },
  {
    name: "Chloé",
    emoji: "🕺",
    photo: null,
    anecdote: "Peut danser sur n'importe quelle chanson, même la pub Free."
  },
  {
    name: "Emma",
    emoji: "🌮",
    photo: null,
    anecdote: "Propose des tacos en guise de solution à tous les problèmes de la vie."
  },
  {
    name: "Julie",
    emoji: "🔮",
    photo: null,
    anecdote: "Croit aux horoscopes mais prétend que non."
  }
  /*
  ─── Comment personnaliser ───────────────────────
  Ajouter une joueuse : copie un bloc { } ci-dessus.
  Supprimer : retire le bloc entier.
  Photo locale : photo: "photos/prenom.jpg"
    (crée un dossier /photos/ à côté de index.html)
  Photo en ligne : photo: "https://ton-url.com/img.jpg"
  ─────────────────────────────────────────────── */
];

/* ================================================
   🎲 QUESTIONS INSPIRATIONS
   ================================================ */
const QUESTIONS = [
  "A déjà ghosté quelqu'un pendant plus de 3 semaines ? 👻",
  "Toujours en retard (au moins 15 min) ? ⏰",
  "La plus bordélique chez elle ? 🌀",
  "Boit des spritz à n'importe quelle heure ? 🍊",
  "A pleuré devant une pub ? 🎭",
  "A un crush secret qu'elle nie absolument ? 😳",
  "Serait la première éliminée dans Koh Lanta ? 🏝️",
  "Utilise encore des filtres Snapchat en 2024 ? 😂",
  "A déjà fait du shopping alors qu'elle avait 'rien à mettre' ? 🛍️",
  "La plus susceptible de passer la soirée à scroller TikTok ? 📱",
  "A un ex qu'elle stalke encore en mode ninja ? 🔍",
  "Pleure dès le générique d'un film ? 🎬",
  "Fait le moins de vaisselle quand elle vient dormir ? 🍽️",
  "La plus accro à son téléphone pendant une soirée ? 📲",
  "A déjà commandé de la nourriture pour elle seule à 2h du mat ? 🌙",
  "La reine du drama pour un oui ou un non ? 👑",
  "Oublie les anniversaires même en ayant des rappels ? 🎂",
  "La plus susceptible de rater son stop de métro ? 🚇",
  "Fait des plans et les annule le jour même ? 🤦",
  "La plus susceptible de se perdre même avec Google Maps ? 🗺️"
];

/* ================================================
   🔥 GAGES MODE SOIRÉE
   ================================================ */
const GAGES_WIN = [
  "🥂 Tout le monde boit en ton honneur, queen !",
  "🎤 Tu choisis la prochaine chanson !",
  "🏆 Tu distribues 3 gorgées à qui tu veux.",
  "👑 Tu es officiellement queen jusqu'à la fin de la manche.",
  "🎉 Tout le monde t'applaudit pendant 10 secondes !"
];
const GAGES_LOSE = [
  "🍺 Bois une gorgée pour chaque manche jouée !",
  "😬 Tu racontes une anecdote gênante sur toi.",
  "🙈 Tout le groupe vote ta péripétie la plus embarrassante.",
  "🎭 Tu fais une imitation de quelqu'un dans le groupe.",
  "🔥 Le groupe te pose une question, tu réponds honnêtement."
];

/* ================================================
   🔊 SONS (Web Audio API — aucun fichier requis)
   ================================================ */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type = 'sine', duration = .15, vol = .3) {
  if (!gameState.sound) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}
function soundEliminate() { playTone(220, 'sawtooth', .2, .2); }
function soundRestore()   { playTone(600, 'sine', .15, .2); }
function soundQuestion()  {
  [440, 550, 660].forEach((f, i) => setTimeout(() => playTone(f, 'sine', .12, .2), i * 80));
}
function soundWin()  {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', .3, .3), i * 120));
}
function soundLose() {
  [330, 262, 196].forEach((f, i) => setTimeout(() => playTone(f, 'sawtooth', .3, .2), i * 120));
}

/* ================================================
   🎊 CONFETTIS (canvas)
   ================================================ */
const confCanvas = document.getElementById('confetti-canvas');
const confCtx = confCanvas.getContext('2d');
let confPieces = [];
let confAnimId = null;

function launchConfetti() {
  confCanvas.width  = window.innerWidth;
  confCanvas.height = window.innerHeight;
  const colors = ['#ff3fa4', '#a855f7', '#ffd93d', '#06d6a0', '#ff4d6d', '#fff'];
  confPieces = Array.from({ length: 130 }, () => ({
    x: Math.random() * confCanvas.width,
    y: Math.random() * -confCanvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 80 + 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltSpeed: Math.random() * .08 + .04
  }));
  if (confAnimId) cancelAnimationFrame(confAnimId);
  animateConf();
  setTimeout(stopConfetti, 5500);
}
function animateConf() {
  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  confPieces.forEach(p => {
    p.tiltAngle += p.tiltSpeed;
    p.y += (Math.cos(p.d + p.r) + 2.5);
    p.x += Math.sin(p.tiltAngle) * .8;
    p.tilt = Math.sin(p.tiltAngle) * 12;
    if (p.y > confCanvas.height) { p.y = -20; p.x = Math.random() * confCanvas.width; }
    confCtx.beginPath();
    confCtx.lineWidth = p.r / 2;
    confCtx.strokeStyle = p.color;
    confCtx.moveTo(p.x + p.tilt + p.r / 4, p.y);
    confCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
    confCtx.stroke();
  });
  confAnimId = requestAnimationFrame(animateConf);
}
function stopConfetti() {
  if (confAnimId) { cancelAnimationFrame(confAnimId); confAnimId = null; }
  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
}

/* ================================================
   🎮 ÉTAT GLOBAL DU JEU
   ================================================ */
const gameState = {
  manche: 1,
  partyMode: false,
  sound: true,
  secretIdx: null,
  eliminated: new Set()
};

/* ================================================
   🖥️ ÉCRANS
   ================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ================================================
   🃏 CARTES
   ================================================ */
function avatarInner(player) {
  if (player.photo) {
    return `<img src="${player.photo}" alt="${player.name}">`;
  }
  return player.emoji;
}

function buildCards() {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';
  PLAYERS.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'player-card' + (gameState.eliminated.has(i) ? ' eliminated' : '');
    card.dataset.index = i;
    card.innerHTML = `
      <div class="card-avatar">${avatarInner(p)}</div>
      <span class="card-name">${p.name}</span>
    `;
    card.addEventListener('click', () => toggleCard(i, card));
    grid.appendChild(card);
  });
}

function toggleCard(i, card) {
  if (gameState.eliminated.has(i)) {
    gameState.eliminated.delete(i);
    card.classList.remove('eliminated');
    soundRestore();
  } else {
    gameState.eliminated.add(i);
    card.classList.add('eliminated');
    card.classList.add('card-pop');
    card.addEventListener('animationend', () => card.classList.remove('card-pop'), { once: true });
    soundEliminate();
  }
}

/* ================================================
   👑 QUEEN SECRÈTE
   ================================================ */
function pickSecret() {
  gameState.secretIdx = Math.floor(Math.random() * PLAYERS.length);
}

function showSecretScreen() {
  const p = PLAYERS[gameState.secretIdx];
  document.getElementById('secret-avatar').innerHTML = avatarInner(p);
  document.getElementById('secret-name').textContent = p.name;
  document.getElementById('secret-anecdote').textContent = p.anecdote || '';
  showScreen('screen-secret');
}

/* ================================================
   🎲 QUESTION
   ================================================ */
let lastQIdx = -1;
function randomQuestion() {
  let idx;
  do { idx = Math.floor(Math.random() * QUESTIONS.length); }
  while (idx === lastQIdx && QUESTIONS.length > 1);
  lastQIdx = idx;
  return QUESTIONS[idx];
}

/* ================================================
   🔥 GAGE
   ================================================ */
function randomGage(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ================================================
   🎯 MODAL DEVINER
   ================================================ */
function openGuessModal() {
  const grid = document.getElementById('guess-grid');
  grid.innerHTML = '';
  PLAYERS.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'guess-item';
    item.innerHTML = `
      <div class="guess-avatar">${avatarInner(p)}</div>
      <span class="guess-name">${p.name}</span>
    `;
    item.addEventListener('click', () => resolveGuess(i));
    grid.appendChild(item);
  });
  document.getElementById('modal-guess').classList.remove('hidden');
}
function closeGuessModal() {
  document.getElementById('modal-guess').classList.add('hidden');
}

/* ================================================
   🏆 RÉSOLUTION DU GUESS
   ================================================ */
function resolveGuess(guessedIdx) {
  closeGuessModal();
  const correct = guessedIdx === gameState.secretIdx;
  const secret  = PLAYERS[gameState.secretIdx];
  const guessed = PLAYERS[guessedIdx];

  if (correct) {
    soundWin();
    launchConfetti();
    document.getElementById('win-sub').textContent =
      `Tu as trouvé ! C'était bien ${secret.name} 🎉`;
    document.getElementById('win-avatar').innerHTML = avatarInner(secret);
    document.getElementById('win-name').textContent = secret.name;
    const gEl = document.getElementById('win-gage');
    if (gameState.partyMode) {
      gEl.textContent = randomGage(GAGES_WIN);
      gEl.classList.remove('hidden');
    } else {
      gEl.classList.add('hidden');
    }
    showScreen('screen-win');
  } else {
    soundLose();
    document.getElementById('lose-sub').textContent =
      `Faux ! Tu as dit ${guessed.name}… mais c'était ${secret.name} 😬`;
    document.getElementById('lose-avatar').innerHTML = avatarInner(secret);
    document.getElementById('lose-name').textContent = secret.name;
    const gEl = document.getElementById('lose-gage');
    if (gameState.partyMode) {
      gEl.textContent = randomGage(GAGES_LOSE);
      gEl.classList.remove('hidden');
    } else {
      gEl.classList.add('hidden');
    }
    showScreen('screen-lose');
  }
}

/* ================================================
   🔄 REJOUER
   ================================================ */
function replay() {
  stopConfetti();
  gameState.manche++;
  gameState.eliminated.clear();
  syncMancheUI();
  startGame();
}

function syncMancheUI() {
  document.getElementById('home-manche').textContent = gameState.manche;
  document.getElementById('game-manche').textContent = gameState.manche;
}

/* ================================================
   🚀 DÉMARRER UNE PARTIE
   ================================================ */
function startGame() {
  pickSecret();
  buildCards();
  document.getElementById('question-text').textContent = '💬 Appuie pour une question inspiration !';
  syncMancheUI();
  showSecretScreen();
}

/* ================================================
   👁️ MODAL VOIR QUEEN
   ================================================ */
function openRevealModal() {
  const p = PLAYERS[gameState.secretIdx];
  document.getElementById('modal-avatar').innerHTML = avatarInner(p);
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-reveal').classList.remove('hidden');
}
function closeRevealModal() {
  document.getElementById('modal-reveal').classList.add('hidden');
}

/* ================================================
   🎛️ INITIALISATION
   ================================================ */
function init() {
  // Paramètres accueil
  document.getElementById('toggle-party').addEventListener('change', e => {
    gameState.partyMode = e.target.checked;
  });
  document.getElementById('toggle-sound').addEventListener('change', e => {
    gameState.sound = e.target.checked;
  });

  // Commencer
  document.getElementById('btn-start').addEventListener('click', () => {
    gameState.partyMode = document.getElementById('toggle-party').checked;
    gameState.sound     = document.getElementById('toggle-sound').checked;
    startGame();
  });

  // Secret → jeu
  document.getElementById('btn-secret-ok').addEventListener('click', () => {
    showScreen('screen-game');
    // Afficher bouton gage selon mode
    document.getElementById('btn-gage').classList.toggle('hidden', !gameState.partyMode);
  });

  // Retour accueil
  document.getElementById('btn-home').addEventListener('click', () => {
    stopConfetti();
    syncMancheUI();
    showScreen('screen-home');
  });

  // Voir queen
  document.getElementById('btn-reveal').addEventListener('click', openRevealModal);
  document.getElementById('btn-modal-close').addEventListener('click', closeRevealModal);
  document.getElementById('modal-reveal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeRevealModal();
  });

  // Question
  document.getElementById('btn-question').addEventListener('click', () => {
    const q = randomQuestion();
    document.getElementById('question-text').textContent = q;
    soundQuestion();
    const card = document.getElementById('question-card');
    card.style.borderColor = 'var(--violet)';
    setTimeout(() => card.style.borderColor = '', 600);
  });

  // Gage
  document.getElementById('btn-gage').addEventListener('click', () => {
    const all = [...GAGES_WIN, ...GAGES_LOSE];
    document.getElementById('question-text').textContent = '🔥 GAGE : ' + randomGage(all);
    soundQuestion();
  });

  // Deviner
  document.getElementById('btn-guess').addEventListener('click', openGuessModal);
  document.getElementById('btn-guess-cancel').addEventListener('click', closeGuessModal);
  document.getElementById('modal-guess').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeGuessModal();
  });

  // Rejouer
  document.getElementById('btn-replay').addEventListener('click', replay);
  document.getElementById('btn-replay2').addEventListener('click', replay);

  // Resize canvas
  window.addEventListener('resize', () => {
    confCanvas.width  = window.innerWidth;
    confCanvas.height = window.innerHeight;
  });

  syncMancheUI();
  showScreen('screen-home');
}

document.addEventListener('DOMContentLoaded', init);
