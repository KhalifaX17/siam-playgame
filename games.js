let playerMode = 1;
let soundEnabled = true;
let activeTimer = null;
let activeAnimFrame = null;
let keydownHandler = null;
let keyupHandler = null;
let currentFilter = 'all';

let questionsBank = JSON.parse(localStorage.getItem('kh_questions')) || [...DEFAULT_QUESTIONS];
let unlockedStamps = JSON.parse(localStorage.getItem('kh_stamps')) || [];
let communityIdeas = JSON.parse(localStorage.getItem('kh_ideas')) || [
  { author: 'น้องต้นกล้า ป.5', text: 'อยากให้เพิ่มเกมแข่งเรือยาวประเพณี 4 ภาค', votes: 14 },
  { author: 'อ.สมศรี (บรรณารักษ์)', text: 'เพิ่มชุดโจทย์วันสุนทรภู่และวรรณคดีไทย', votes: 11 },
  { author: 'น้องใบบัว ม.2', text: 'เพิ่มสกินชุดไทยให้ตัวละครในโหมดต่อสู้คีย์บอร์ด', votes: 9 }
];
let templeBestScore = Number(localStorage.getItem('kh_temple_best')) || 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type = 'sine', duration = 0.12) {
  if (!soundEnabled) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function speakThai(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'th-TH';
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
  } catch (e) {}
}

window.addEventListener('DOMContentLoaded', () => {
  renderGamesGrid('all');
  updateCounters();
});

function updateCounters() {
  document.getElementById('stampCount').textContent = unlockedStamps.length;
  document.getElementById('ideaCount').textContent = communityIdeas.length;
}

function setPlayerMode(mode) {
  playerMode = mode;
  document.getElementById('btnMode1P').classList.toggle('active', mode === 1);
  document.getElementById('btnMode2P').classList.toggle('active', mode === 2);
  document.getElementById('hudModeLabel').textContent = mode === 1 ? '👤 เล่น 1 คน' : '👥 เล่น 2 คนจอเดียว';
  playTone(520, 'triangle', 0.1);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById('btnSound').textContent = soundEnabled ? '🔊 เสียง: เปิด' : '🔇 เสียง: ปิด';
}

function mascotTalk(region) {
  const lines = MASCOT_DIALOGUES[region];
  const line = lines[Math.floor(Math.random() * lines.length)];
  const names = { north: 'น้องช้างล้านนา', isan: 'พี่แคนม่วนซื่น', central: 'น้องหนุมาน', south: 'น้องพะยูน' };
  document.getElementById('mascotSpeech').innerHTML = `💬 <strong>${names[region]}:</strong> "${line}"`;
  playTone(660, 'sine', 0.15);
  speakThai(line);
}

function filterGames(region, btn) {
  currentFilter = region;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderGamesGrid(region);
}

function renderGamesGrid(filter) {
  const grid = document.getElementById('gamesGrid');
  const list = filter === 'all' ? GAMES_CATALOG : GAMES_CATALOG.filter(g => g.region === filter);
  grid.innerHTML = list.map(g => `
    <div class="game-card region-${g.region}">
      <div>
        <div class="card-top">
          <span class="card-icon">${g.icon}</span>
          <span class="card-badge">${g.regionLabel}</span>
        </div>
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
      </div>
      <div class="card-footer">
        <span class="card-meta">${g.id === 'temple_fair' ? '🏆 สถิติ: ' + templeBestScore : '⏱️ คงที่ตามด่าน'}</span>
        <button class="btn-play" onclick="launchGame('${g.id}')">เข้าเล่น ▶</button>
      </div>
    </div>
  `).join('');
}

function cleanupActiveGame() {
  if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
  if (activeAnimFrame) { cancelAnimationFrame(activeAnimFrame); activeAnimFrame = null; }
  if (keydownHandler) { window.removeEventListener('keydown', keydownHandler); keydownHandler = null; }
  if (keyupHandler) { window.removeEventListener('keyup', keyupHandler); keyupHandler = null; }
  document.getElementById('quizOverlay').classList.add('hidden');
}

function goHome() {
  exitGame();
}

function exitGame() {
  cleanupActiveGame();
  document.getElementById('gameView').classList.add('hidden');
  document.getElementById('lobbyView').classList.remove('hidden');
  renderGamesGrid(currentFilter);
}

function unlockStamp(stampId) {
  if (!stampId || unlockedStamps.includes(stampId)) return;
  unlockedStamps.push(stampId);
  localStorage.setItem('kh_stamps', JSON.stringify(unlockedStamps));
  updateCounters();
  playTone(880, 'triangle', 0.25);
}

function triggerQuiz(region, hintText, onSuccess, onFail) {
  const pool = questionsBank.filter(q => region === 'special' || q.region === region);
  const chosen = (pool.length ? pool : questionsBank)[Math.floor(Math.random() * (pool.length || questionsBank.length))];

  const overlay = document.getElementById('quizOverlay');
  document.getElementById('quizCategoryBadge').textContent = '📚 คำถามความรู้ประจำด่าน';
  document.getElementById('quizQuestionText').textContent = chosen.q;
  document.getElementById('quizHintText').textContent = hintText || 'ตอบถูกเพื่อรับโบนัสพิเศษ!';

  const optBox = document.getElementById('quizOptions');
  optBox.innerHTML = chosen.options.map((opt, idx) => `
    <button class="quiz-opt-btn" onclick="handleQuizAnswer(${idx === chosen.correct})">${opt}</button>
  `).join('');

  window._quizSuccess = onSuccess;
  window._quizFail = onFail;
  overlay.classList.remove('hidden');
  speakThai(chosen.q);
}

window.handleQuizAnswer = function(isCorrect) {
  document.getElementById('quizOverlay').classList.add('hidden');
  if (isCorrect) {
    playTone(780, 'triangle', 0.2);
    if (window._quizSuccess) window._quizSuccess();
  } else {
    playTone(220, 'sawtooth', 0.25);
    if (window._quizFail) window._quizFail();
  }
};

function launchGame(gameId) {
  cleanupActiveGame();
  const game = GAMES_CATALOG.find(g => g.id === gameId);
  if (!game) return;

  document.getElementById('lobbyView').classList.add('hidden');
  document.getElementById('gameView').classList.remove('hidden');
  document.getElementById('activeGameRegion').textContent = game.regionLabel;
  document.getElementById('activeGameTitle').textContent = game.title;
  document.getElementById('hudModeLabel').textContent = playerMode === 1 ? '👤 เล่น 1 คน' : '👥 เล่น 2 คนจอเดียว';

  if (game.gameType === 'temple_fair') startTempleFairGame(game);
  else if (game.gameType === 'keyboard_fight') startKeyboardFightGame(game);
  else if (game.gameType === 'hide_seek') startHideSeekGame(game);
  else if (game.gameType === 'prop_hunt') startPropHuntGame(game);
  else startRegionalRaceGame(game);
}

function startTempleFairGame(game) {
  let timeLeft = 60;
  let score = 0;
  let combo = 0;
  let feverTimer = 0;
  let pausedForQuiz = false;

  const goodItems = [
    { icon: '🏮', name: 'โคมยี่เป็ง', pts: 100 },
    { icon: '🎶', name: 'แคนอีสาน', pts: 100 },
    { icon: '🪁', name: 'ว่าวจุฬา', pts: 100 },
    { icon: '🐬', name: 'พะยูนน้อย', pts: 100 },
    { icon: '🥥', name: 'กะลามงคล', pts: 120 }
  ];

  const stage = document.getElementById('gameStage');
  stage.innerHTML = `
    <div class="temple-hud" id="templeHud">
      <div>🎯 คะแนน: <strong id="tfScore">0</strong> (สูงสุด: ${templeBestScore})</div>
      <div>🔥 คอมโบ: <strong id="tfCombo">0</strong>/10 <span id="tfFeverBadge" class="hidden" style="color:#dc2626;font-weight:800;">⚡ FEVER x2!</span></div>
      <div>💡 ยิงของดี +100 | 📕 หนังสือทอง = ตอบคำถามต่อเวลา | 💣 ระเบิด -150</div>
    </div>
    <div class="booths-grid" id="boothsGrid">
      ${Array.from({ length: 9 }).map((_, i) => `<div class="booth-slot" id="slot_${i}" onclick="hitBooth(${i})"></div>`).join('')}
    </div>
  `;

  const slotStates = Array(9).fill(null);

  function renderSlots() {
    for (let i = 0; i < 9; i++) {
      const el = document.getElementById(`slot_${i}`);
      const st = slotStates[i];
      if (!st) {
        el.innerHTML = `<span style="opacity:0.25;font-size:1.5rem;">🎪</span>`;
      } else {
        el.innerHTML = `<div class="booth-item">${st.icon}</div><div class="booth-label">${st.name}</div>`;
      }
    }
  }

  window.hitBooth = function(idx) {
    if (pausedForQuiz || timeLeft <= 0) return;
    const st = slotStates[idx];
    if (!st) return;
    slotStates[idx] = null;

    if (st.type === 'bomb') {
      score = Math.max(0, score - 150);
      combo = 0;
      playTone(180, 'sawtooth', 0.25);
    } else if (st.type === 'book') {
      score += 300;
      combo++;
      pausedForQuiz = true;
      playTone(720, 'triangle', 0.2);
      triggerQuiz('special', 'ตอบถูกได้โบนัส +400 แต้ม และต่อเวลา +3 วินาที!', () => {
        score += 400;
        timeLeft += 3;
        pausedForQuiz = false;
        updateHud();
      }, () => {
        pausedForQuiz = false;
      });
    } else {
      const mult = feverTimer > 0 ? 2 : 1;
      score += st.pts * mult;
      combo++;
      playTone(540 + combo * 20, 'sine', 0.1);
      if (combo >= 10 && feverTimer <= 0) {
        feverTimer = 5;
        combo = 0;
        speakThai('เข้าสู่โหมดงานวัดรื่นเริง คะแนนคูณสอง!');
      }
    }
    updateHud();
    renderSlots();
  };

  function updateHud() {
    document.getElementById('tfScore').textContent = score;
    document.getElementById('tfCombo').textContent = combo;
    document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;
    const hud = document.getElementById('templeHud');
    const badge = document.getElementById('tfFeverBadge');
    if (feverTimer > 0) {
      hud.classList.add('fever-active');
      badge.classList.remove('hidden');
    } else {
      hud.classList.remove('fever-active');
      badge.classList.add('hidden');
    }
  }

  updateHud();
  renderSlots();

  activeTimer = setInterval(() => {
    if (pausedForQuiz) return;
    timeLeft--;
    if (feverTimer > 0) feverTimer--;

    for (let i = 0; i < 9; i++) {
      if (Math.random() < 0.35) slotStates[i] = null;
    }
    const emptyIndices = slotStates.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
    const spawnCount = Math.min(emptyIndices.length, 3);
    for (let s = 0; s < spawnCount; s++) {
      const pickIdx = emptyIndices.splice(Math.floor(Math.random() * emptyIndices.length), 1)[0];
      const r = Math.random();
      if (feverTimer > 0) {
        const g = goodItems[Math.floor(Math.random() * goodItems.length)];
        slotStates[pickIdx] = { type: 'good', icon: '🌟', name: g.name + ' x2', pts: g.pts };
      } else if (r < 0.16) {
        slotStates[pickIdx] = { type: 'book', icon: '📕', name: 'หนังสือความรู้!', pts: 300 };
      } else if (r < 0.34) {
        slotStates[pickIdx] = { type: 'bomb', icon: '💣', name: 'ระวังระเบิด!', pts: -150 };
      } else {
        const g = goodItems[Math.floor(Math.random() * goodItems.length)];
        slotStates[pickIdx] = { type: 'good', ...g };
      }
    }

    renderSlots();
    updateHud();

    if (timeLeft <= 0) {
      cleanupActiveGame();
      if (score > templeBestScore) {
        templeBestScore = score;
        localStorage.setItem('kh_temple_best', templeBestScore);
      }
      if (score >= 800) unlockStamp(game.stampId);
      stage.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:4rem;">🎪🏆</div>
          <h2>หมดเวลาซุ้มงานวัด 4 ภาค!</h2>
          <p style="font-size:1.3rem;margin:12px 0;">คะแนนรวมของคุณ: <strong style="color:#2563eb;">${score} แต้ม</strong></p>
          <p style="color:#64748b;margin-bottom:20px;">สถิติสูงสุด: ${templeBestScore} แต้ม ${score >= 800 ? '(ปลดล็อกแสตมป์เซียนซุ้มงานวัดแล้ว!)' : '(ทำ 800 แต้มเพื่อรับแสตมป์)'}</p>
          <button class="btn-primary" onclick="launchGame('temple_fair')">🔄 เล่นอีกครั้ง</button>
        </div>
      `;
    }
  }, 900);
}

function startKeyboardFightGame(game) {
  let timeLeft = 60;
  document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;

  const stage = document.getElementById('gameStage');
  stage.innerHTML = `
    <div class="fight-hud">
      <div class="fighter-stat-box">
        <div style="display:flex;justify-content:space-between;font-weight:800;">
          <span>🐘 P1: น้องช้างล้านนา</span>
          <span id="p1HpText">100/100</span>
        </div>
        <div class="hp-bar-bg"><div class="hp-bar-fill" id="p1HpBar" style="width:100%"></div></div>
        <div class="stack-dots">
          <span>Stack ท่าไม้ตาย:</span>
          <span class="stack-dot" id="p1St1"></span>
          <span class="stack-dot" id="p1St2"></span>
          <span class="stack-dot" id="p1St3"></span>
          <span id="p1UltReady" style="color:#d97706;"></span>
        </div>
      </div>

      <div style="font-size:1.6rem;font-weight:900;color:#dc2626;">VS</div>

      <div class="fighter-stat-box">
        <div style="display:flex;justify-content:space-between;font-weight:800;">
          <span>🐒 ${playerMode === 1 ? 'AI: น้องหนุมาน' : 'P2: น้องหนุมาน'}</span>
          <span id="p2HpText">100/100</span>
        </div>
        <div class="hp-bar-bg"><div class="hp-bar-fill p2" id="p2HpBar" style="width:100%"></div></div>
        <div class="stack-dots">
          <span>Stack ท่าไม้ตาย:</span>
          <span class="stack-dot" id="p2St1"></span>
          <span class="stack-dot" id="p2St2"></span>
          <span class="stack-dot" id="p2St3"></span>
          <span id="p2UltReady" style="color:#d97706;"></span>
        </div>
      </div>
    </div>

    <canvas id="fightCanvas" width="860" height="310"></canvas>

    <div class="fight-controls-guide">
      <div class="ctrl-card">
        <strong>🎮 ผู้เล่น 1 (P1):</strong> <code>A / D</code> เดินซ้าย-ขวา | <code>W</code> กระโดด | <code>S</code> นั่งหลบ | <code>Spacebar</code> ต่อย (ครบ 3 Stack กด <code>E</code> หรือ <code>Space</code> ปล่อยท่าไม้ตาย!)
      </div>
      <div class="ctrl-card">
        <strong>🎮 ผู้เล่น 2 (P2):</strong> <code>◀ / ▶</code> เดินซ้าย-ขวา | <code>▲</code> กระโดด | <code>▼</code> นั่งหลบ | <code>เลข 0</code> ต่อย (ครบ 3 Stack กด <code>Enter</code> หรือ <code>0</code> ปล่อยท่าไม้ตาย!)
      </div>
    </div>
  `;

  const canvas = document.getElementById('fightCanvas');
  const ctx = canvas.getContext('2d');
  const groundY = 225;

  const p1 = { x: 180, y: groundY, vy: 0, w: 54, h: 74, hp: 100, stacks: 0, crouch: false, punching: 0, facing: 1, color: '#2563eb', icon: '🐘' };
  const p2 = { x: 640, y: groundY, vy: 0, w: 54, h: 74, hp: 100, stacks: 0, crouch: false, punching: 0, facing: -1, color: '#dc2626', icon: '🐒' };
  const projectiles = [];
  const keys = {};
  let gameEnded = false;

  function updateFightHud() {
    document.getElementById('p1HpText').textContent = `${Math.max(0, p1.hp)}/100`;
    document.getElementById('p2HpText').textContent = `${Math.max(0, p2.hp)}/100`;
    document.getElementById('p1HpBar').style.width = `${Math.max(0, p1.hp)}%`;
    document.getElementById('p2HpBar').style.width = `${Math.max(0, p2.hp)}%`;

    for (let i = 1; i <= 3; i++) {
      document.getElementById(`p1St${i}`).classList.toggle('filled', p1.stacks >= i);
      document.getElementById(`p2St${i}`).classList.toggle('filled', p2.stacks >= i);
    }
    document.getElementById('p1UltReady').textContent = p1.stacks >= 3 ? '🔥 พร้อมปล่อยท่าไม้ตาย!' : '';
    document.getElementById('p2UltReady').textContent = p2.stacks >= 3 ? '🔥 พร้อมปล่อยท่าไม้ตาย!' : '';
  }

  function performAttack(attacker, defender) {
    if (attacker.punching > 0 || gameEnded) return;
    attacker.punching = 14;
    playTone(360, 'square', 0.08);

    if (attacker.stacks >= 3) {
      attacker.stacks = 0;
      playTone(820, 'sawtooth', 0.25);
      projectiles.push({
        x: attacker.x + (attacker.facing === 1 ? 50 : -20),
        y: attacker.y + 20,
        vx: attacker.facing * 11,
        owner: attacker,
        target: defender,
        icon: attacker === p1 ? '🌊' : '☄️'
      });
      updateFightHud();
      return;
    }

    const reachX = attacker.facing === 1 ? attacker.x + attacker.w : attacker.x - 42;
    const hitBoxW = 42;
    const hitOverlap = reachX < defender.x + defender.w && reachX + hitBoxW > defender.x;
    const vertOverlap = Math.abs(attacker.y - defender.y) < 55;

    if (hitOverlap && vertOverlap) {
      const dmg = defender.crouch ? 4 : 9;
      defender.hp = Math.max(0, defender.hp - dmg);
      attacker.stacks = Math.min(3, attacker.stacks + 1);
      defender.x += attacker.facing * 18;
      playTone(220, 'triangle', 0.12);
      updateFightHud();
      checkFightWinner();
    }
  }

  function checkFightWinner() {
    if (gameEnded) return;
    if (p1.hp <= 0 || p2.hp <= 0 || timeLeft <= 0) {
      gameEnded = true;
      cleanupActiveGame();
      let winnerText = 'เสมอกันอย่างดุเดือด!';
      if (p1.hp > p2.hp) {
        winnerText = '🏆 ผู้ชนะคือ P1: น้องช้างล้านนา!';
        unlockStamp(game.stampId);
      } else if (p2.hp > p1.hp) {
        winnerText = playerMode === 1 ? '🤖 บอท AI น้องหนุมานชนะ ลองใหม่อีกครั้ง!' : '🏆 ผู้ชนะคือ P2: น้องหนุมาน!';
        if (playerMode === 2) unlockStamp(game.stampId);
      }
      stage.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:4rem;">🥊👑</div>
          <h2>${winnerText}</h2>
          <p style="margin:12px 0;color:#475569;">พลังชีวิตคงเหลือ — P1: ${p1.hp} HP | P2: ${p2.hp} HP</p>
          <button class="btn-primary" onclick="launchGame('keyboard_fight')">🔄 ดวลกันอีกรอบ</button>
        </div>
      `;
    }
  }

  keydownHandler = (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    keys[e.code] = true;

    if (e.code === 'KeyW' && p1.y >= groundY) p1.vy = -13;
    if (e.code === 'Space' || e.code === 'KeyE') performAttack(p1, p2);

    if (playerMode === 2) {
      if (e.code === 'ArrowUp' && p2.y >= groundY) p2.vy = -13;
      if (e.code === 'Numpad0' || e.code === 'Digit0' || e.code === 'Enter') performAttack(p2, p1);
    }
  };

  keyupHandler = (e) => {
    keys[e.code] = false;
  };

  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('keyup', keyupHandler);

  activeTimer = setInterval(() => {
    if (gameEnded) return;
    timeLeft--;
    document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) checkFightWinner();
  }, 1000);

  function loop() {
    if (gameEnded) return;

    p1.crouch = !!keys['KeyS'];
    if (!p1.crouch) {
      if (keys['KeyA']) { p1.x -= 5; p1.facing = -1; }
      if (keys['KeyD']) { p1.x += 5; p1.facing = 1; }
    }

    if (playerMode === 2) {
      p2.crouch = !!keys['ArrowDown'];
      if (!p2.crouch) {
        if (keys['ArrowLeft']) { p2.x -= 5; p2.facing = -1; }
        if (keys['ArrowRight']) { p2.x += 5; p2.facing = 1; }
      }
    } else {
      const dist = p1.x - p2.x;
      p2.facing = dist >= 0 ? 1 : -1;
      if (Math.abs(dist) > 75) {
        p2.x += p2.facing * 3.2;
      } else if (Math.random() < 0.045) {
        performAttack(p2, p1);
      }
      if (p2.stacks >= 3) performAttack(p2, p1);
    }

    [p1, p2].forEach(p => {
      p.y += p.vy;
      if (p.y < groundY) p.vy += 0.75;
      else { p.y = groundY; p.vy = 0; }
      p.x = Math.max(20, Math.min(canvas.width - p.w - 20, p.x));
      if (p.punching > 0) p.punching--;
    });

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.vx;
      const t = pr.target;
      if (pr.x > t.x && pr.x < t.x + t.w && Math.abs(pr.y - (t.y + 20)) < 50) {
        t.hp = Math.max(0, t.hp - 24);
        t.x += (pr.vx > 0 ? 35 : -35);
        projectiles.splice(i, 1);
        updateFightHud();
        checkFightWinner();
        continue;
      }
      if (pr.x < 0 || pr.x > canvas.width) projectiles.splice(i, 1);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    [p1, p2].forEach(p => {
      const drawH = p.crouch ? p.h * 0.6 : p.h;
      const drawY = p.crouch ? p.y + (p.h - drawH) : p.y;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(p.x, drawY, p.w, drawH, 14);
      ctx.fill();

      ctx.font = '34px Prompt';
      ctx.fillText(p.icon, p.x + 8, drawY + (p.crouch ? 32 : 44));

      if (p.punching > 0) {
        ctx.fillStyle = '#facc15';
        const fistX = p.facing === 1 ? p.x + p.w + 4 : p.x - 28;
        ctx.beginPath();
        ctx.arc(fistX + 12, drawY + 28, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    projectiles.forEach(pr => {
      ctx.font = '36px Prompt';
      ctx.fillText(pr.icon, pr.x, pr.y);
    });

    activeAnimFrame = requestAnimationFrame(loop);
  }

  updateFightHud();
  loop();
}

function startHideSeekGame(game) {
  let selectedRegion = 'north';
  let timeLeft = 45;
  let hiddenSpotIdx = Math.floor(Math.random() * 5);
  let phase = playerMode === 2 ? 'hide' : 'seek';

  const stage = document.getElementById('gameStage');

  function renderHideSeek() {
    const mapData = HIDE_MAPS[selectedRegion];
    document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;

    stage.innerHTML = `
      <div class="map-selector">
        ${Object.keys(HIDE_MAPS).map(r => `
          <button class="map-btn ${r === selectedRegion ? 'active' : ''}" onclick="switchHideMap('${r}')">${HIDE_MAPS[r].name}</button>
        `).join('')}
      </div>

      <div style="background:#fef9c3;padding:10px 14px;border-radius:12px;margin-bottom:12px;font-weight:700;">
        ${phase === 'hide'
          ? '🙈 [ตาของ P1 ซ่อนตัว]: คลิกเลือกจุดซ่อนตัว 1 แห่ง (P2 อย่าแอบดูนะ!)'
          : `🔦 [${playerMode === 2 ? 'ตาของ P2 ตามหา' : 'โหมดตามหา'}]: คลิกส่องตามจุดต่างๆ เพื่อหาเพื่อนที่แอบอยู่!`}
      </div>

      <div class="scene-board" style="background:${mapData.bg};">
        ${mapData.spots.map((sp, idx) => `
          <div class="scene-spot" style="left:${sp.x}%;top:${sp.y}%;" onclick="clickHideSpot(${idx})">
            <div style="text-align:center;">
              <div>${sp.icon}</div>
              <span style="background:rgba(255,255,255,0.9);font-size:0.75rem;padding:2px 8px;border-radius:8px;font-weight:700;">${sp.label}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  window.switchHideMap = function(r) {
    selectedRegion = r;
    hiddenSpotIdx = Math.floor(Math.random() * HIDE_MAPS[r].spots.length);
    phase = playerMode === 2 ? 'hide' : 'seek';
    renderHideSeek();
  };

  window.clickHideSpot = function(idx) {
    if (phase === 'hide') {
      hiddenSpotIdx = idx;
      phase = 'seek';
      playTone(600, 'sine', 0.15);
      renderHideSeek();
      return;
    }

    if (idx === hiddenSpotIdx) {
      playTone(750, 'triangle', 0.2);
      triggerQuiz(selectedRegion, 'เจอตัวแล้ว! ตอบคำถามประจำภาคให้ถูกเพื่อจับตัวสำเร็จ!', () => {
        cleanupActiveGame();
        unlockStamp(game.stampId);
        stage.innerHTML = `
          <div style="text-align:center;padding:40px 20px;">
            <div style="font-size:4rem;">🎉🙈</div>
            <h2>จับตัวได้สำเร็จ! ยอดนักซ่อนแอบ 4 ภาค</h2>
            <p style="margin:12px 0;color:#475569;">คุณหาเจอที่จุด "${HIDE_MAPS[selectedRegion].spots[idx].label}" และตอบคำถามถูกต้อง!</p>
            <button class="btn-primary" onclick="launchGame('hide_seek')">🔄 เล่นซ่อนแอบอีกครั้ง</button>
          </div>
        `;
      }, () => {
        hiddenSpotIdx = (idx + 2) % HIDE_MAPS[selectedRegion].spots.length;
        alert('ตอบผิด! เพื่อนวิ่งย้ายจุดซ่อนไปแล้ว ลองหาใหม่อีกครั้ง!');
      });
    } else {
      playTone(260, 'sine', 0.1);
      alert(`ตรง "${HIDE_MAPS[selectedRegion].spots[idx].label}" ไม่มีใครซ่อนอยู่ ลองหาจุดอื่น!`);
    }
  };

  activeTimer = setInterval(() => {
    if (phase === 'hide') return;
    timeLeft--;
    const tEl = document.getElementById('hudTimer');
    if (tEl) tEl.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      cleanupActiveGame();
      stage.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:4rem;">⏰🙈</div>
          <h2>หมดเวลา! คนซ่อนเป็นฝ่ายชนะ!</h2>
          <button class="btn-primary" onclick="launchGame('hide_seek')">🔄 ลองใหม่อีกครั้ง</button>
        </div>
      `;
    }
  }, 1000);

  renderHideSeek();
}

function startPropHuntGame(game) {
  let selectedRegion = 'north';
  let foundIndices = [];
  let timeLeft = 45;
  const stage = document.getElementById('gameStage');

  function renderPropHunt() {
    const mapData = PROP_MAPS[selectedRegion];
    document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;

    stage.innerHTML = `
      <div class="map-selector">
        ${Object.keys(PROP_MAPS).map(r => `
          <button class="map-btn ${r === selectedRegion ? 'active' : ''}" onclick="switchPropMap('${r}')">${PROP_MAPS[r].name}</button>
        `).join('')}
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center;">
        <strong>🎒 รายการของที่ต้องหา (${foundIndices.length}/${mapData.items.length}):</strong>
        ${mapData.items.map((it, i) => `
          <span style="padding:4px 10px;border-radius:10px;font-size:0.85rem;font-weight:700;background:${foundIndices.includes(i) ? '#dcfce7' : '#f1f5f9'};text-decoration:${foundIndices.includes(i) ? 'line-through' : 'none'};">
            ${it.icon} ${it.name}
          </span>
        `).join('')}
      </div>

      <div class="scene-board" style="background:${mapData.bg};">
        ${mapData.items.map((it, i) => `
          <div class="scene-spot ${foundIndices.includes(i) ? 'found' : ''}" style="left:${it.x}%;top:${it.y}%;" onclick="collectProp(${i})" title="คลิกเก็บ ${it.name}">
            ${it.icon}
          </div>
        `).join('')}
      </div>
    `;
  }

  window.switchPropMap = function(r) {
    selectedRegion = r;
    foundIndices = [];
    renderPropHunt();
  };

  window.collectProp = function(idx) {
    if (foundIndices.includes(idx)) return;
    foundIndices.push(idx);
    playTone(680, 'triangle', 0.15);
    renderPropHunt();

    if (foundIndices.length === PROP_MAPS[selectedRegion].items.length) {
      triggerQuiz(selectedRegion, 'เก็บของครบแล้ว! ตอบคำถามความรู้ประจำบ้านเพื่อรับแสตมป์!', () => {
        cleanupActiveGame();
        unlockStamp(game.stampId);
        stage.innerHTML = `
          <div style="text-align:center;padding:40px 20px;">
            <div style="font-size:4rem;">🏡✨</div>
            <h2>สำรวจ ${PROP_MAPS[selectedRegion].name} สำเร็จ!</h2>
            <p style="margin:12px 0;color:#475569;">คุณค้นพบของมงคลครบทุกชิ้นและตอบคำถามถูกต้อง!</p>
            <button class="btn-primary" onclick="launchGame('prop_hunt')">🔄 สำรวจบ้านหลังอื่น</button>
          </div>
        `;
      }, () => {
        cleanupActiveGame();
        unlockStamp(game.stampId);
        stage.innerHTML = `
          <div style="text-align:center;padding:40px 20px;">
            <div style="font-size:4rem;">🏡👏</div>
            <h2>ค้นพบสิ่งของครบทุกชิ้นแล้ว!</h2>
            <button class="btn-primary" onclick="launchGame('prop_hunt')">🔄 เล่นอีกครั้ง</button>
          </div>
        `;
      });
    }
  };

  activeTimer = setInterval(() => {
    timeLeft--;
    const tEl = document.getElementById('hudTimer');
    if (tEl) tEl.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      cleanupActiveGame();
      stage.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:4rem;">⏰🏡</div>
          <h2>หมดเวลาสำรวจบ้าน!</h2>
          <button class="btn-primary" onclick="launchGame('prop_hunt')">🔄 ลองใหม่อีกครั้ง</button>
        </div>
      `;
    }
  }, 1000);

  renderPropHunt();
}

function startRegionalRaceGame(game) {
  let timeLeft = 30;
  let p1Prog = 0;
  let p2Prog = 0;
  let ended = false;
  document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;

  const stage = document.getElementById('gameStage');
  stage.innerHTML = `
    <p style="text-align:center;color:#475569;font-weight:600;">
      เป้าหมาย: กดปุ่มส่งพลังให้ถึงเส้นชัย 100% ก่อนหมดเวลา 30 วินาที! (กดปุ่มคำถามความรู้เพื่อพุ่งทะยาน +25%)
    </p>

    <div class="race-track">
      <div class="lane">
        <div class="lane-header">
          <span>${game.p1Emoji} ผู้เล่น 1 (P1) — กดปุ่ม <code>A</code> หรือ <code>D</code></span>
          <span id="p1Pct">0%</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill" id="p1Bar" style="width:0%"></div>
          <div class="runner-avatar" id="p1Runner" style="left:4%">${game.p1Emoji}</div>
        </div>
      </div>

      <div class="lane">
        <div class="lane-header">
          <span>${game.p2Emoji} ${playerMode === 1 ? 'คู่แข่ง AI ประจำภาค' : 'ผู้เล่น 2 (P2) — กดลูกศร ◀ / ▶'}</span>
          <span id="p2Pct">0%</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill p2" id="p2Bar" style="width:0%"></div>
          <div class="runner-avatar" id="p2Runner" style="left:4%">${game.p2Emoji}</div>
        </div>
      </div>
    </div>

    <div class="action-pad">
      <button class="big-tap-btn" onclick="pushP1(5)">${game.p1Emoji} P1: ${game.actionText}</button>
      <button class="big-tap-btn quiz-boost-btn" onclick="boostQuiz()">📚 ตอบคำถามความรู้ (+25%)</button>
      ${playerMode === 2 ? `<button class="big-tap-btn p2-btn" onclick="pushP2(5)">${game.p2Emoji} P2: ${game.actionText}</button>` : ''}
    </div>
  `;

  function updateBars() {
    p1Prog = Math.min(100, p1Prog);
    p2Prog = Math.min(100, p2Prog);
    document.getElementById('p1Pct').textContent = `${Math.round(p1Prog)}%`;
    document.getElementById('p2Pct').textContent = `${Math.round(p2Prog)}%`;
    document.getElementById('p1Bar').style.width = `${p1Prog}%`;
    document.getElementById('p2Bar').style.width = `${p2Prog}%`;
    document.getElementById('p1Runner').style.left = `${Math.max(4, Math.min(96, p1Prog))}%`;
    document.getElementById('p2Runner').style.left = `${Math.max(4, Math.min(96, p2Prog))}%`;

    if (!ended && (p1Prog >= 100 || p2Prog >= 100)) {
      finishRace();
    }
  }

  window.pushP1 = function(amt) {
    if (ended) return;
    p1Prog += amt;
    playTone(520, 'sine', 0.06);
    updateBars();
  };

  window.pushP2 = function(amt) {
    if (ended) return;
    p2Prog += amt;
    playTone(440, 'sine', 0.06);
    updateBars();
  };

  window.boostQuiz = function() {
    if (ended) return;
    triggerQuiz(game.region, 'ตอบถูกพุ่งทะยานไปข้างหน้า +25% ทันที!', () => {
      pushP1(25);
    }, () => {});
  };

  function finishRace() {
    ended = true;
    cleanupActiveGame();
    const p1Win = p1Prog >= p2Prog;
    if (p1Win) unlockStamp(game.stampId);
    stage.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:4rem;">${p1Win ? '🏆🎉' : '👏🔥'}</div>
        <h2>${p1Win ? 'ผู้เล่น 1 เข้าเส้นชัยคว้าชัยชนะ!' : (playerMode === 1 ? 'คู่แข่ง AI เข้าเส้นชัยก่อน ลองใหม่อีกครั้ง!' : 'ผู้เล่น 2 เข้าเส้นชัยคว้าชัยชนะ!')}</h2>
        <p style="margin:12px 0;color:#475569;">ผลคะแนน — P1: ${Math.round(p1Prog)}% | P2: ${Math.round(p2Prog)}%</p>
        <button class="btn-primary" onclick="launchGame('${game.id}')">🔄 เล่นด่านนี้อีกครั้ง</button>
      </div>
    `;
  }

  keydownHandler = (e) => {
    if (e.code === 'KeyA' || e.code === 'KeyD') pushP1(4.5);
    if (playerMode === 2 && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) pushP2(4.5);
  };
  window.addEventListener('keydown', keydownHandler);

  activeTimer = setInterval(() => {
    if (ended) return;
    timeLeft--;
    document.getElementById('hudTimer').textContent = `⏱️ ${timeLeft}s`;

    if (playerMode === 1) {
      p2Prog += 3.1;
      updateBars();
    }

    if (timeLeft <= 0 && !ended) {
      finishRace();
    }
  }, 1000);
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  if (id === 'teacherModal') renderTeacherQuestions();
  if (id === 'ideaModal') renderIdeaList();
  if (id === 'passportModal') renderPassport();
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function renderTeacherQuestions() {
  document.getElementById('totalQCount').textContent = questionsBank.length;
  const ul = document.getElementById('teacherQuestionList');
  ul.innerHTML = questionsBank.map((item, idx) => `
    <li>
      <span>[${item.region.toUpperCase()}] ${item.q} (เฉลย: ${item.options[item.correct]})</span>
      <button class="btn-small btn-danger" onclick="deleteQuestion(${idx})">ลบ</button>
    </li>
  `).join('');
}

function addTeacherQuestion(e) {
  e.preventDefault();
  const newQ = {
    region: document.getElementById('qRegion').value,
    q: document.getElementById('qText').value.trim(),
    options: [
      document.getElementById('qOpt0').value.trim(),
      document.getElementById('qOpt1').value.trim(),
      document.getElementById('qOpt2').value.trim(),
      document.getElementById('qOpt3').value.trim()
    ],
    correct: Number(document.getElementById('qCorrect').value)
  };
  questionsBank.unshift(newQ);
  localStorage.setItem('kh_questions', JSON.stringify(questionsBank));
  e.target.reset();
  renderTeacherQuestions();
  playTone(760, 'triangle', 0.2);
}

function deleteQuestion(idx) {
  if (questionsBank.length <= 1) return alert('ต้องมีคำถามอย่างน้อย 1 ข้อในระบบ');
  questionsBank.splice(idx, 1);
  localStorage.setItem('kh_questions', JSON.stringify(questionsBank));
  renderTeacherQuestions();
}

function loadPresetQuestions(packKey) {
  questionsBank = [...PRESET_PACKS[packKey], ...questionsBank];
  localStorage.setItem('kh_questions', JSON.stringify(questionsBank));
  renderTeacherQuestions();
  playTone(700, 'triangle', 0.2);
}

function resetQuestions() {
  questionsBank = [...DEFAULT_QUESTIONS];
  localStorage.setItem('kh_questions', JSON.stringify(questionsBank));
  renderTeacherQuestions();
}

function renderIdeaList() {
  const box = document.getElementById('ideaList');
  box.innerHTML = communityIdeas.map((item, idx) => `
    <div class="idea-item">
      <div>
        <strong>${item.text}</strong>
        <div style="font-size:0.78rem;color:#64748b;">เสนอโดย: ${item.author}</div>
      </div>
      <button class="vote-btn" onclick="voteIdea(${idx})">❤️ ${item.votes}</button>
    </div>
  `).join('');
}

function submitIdea(e) {
  e.preventDefault();
  const author = document.getElementById('ideaAuthor').value.trim();
  const text = document.getElementById('ideaText').value.trim();
  communityIdeas.unshift({ author, text, votes: 1 });
  localStorage.setItem('kh_ideas', JSON.stringify(communityIdeas));
  e.target.reset();
  updateCounters();
  renderIdeaList();
  playTone(680, 'sine', 0.15);
}

function voteIdea(idx) {
  communityIdeas[idx].votes++;
  localStorage.setItem('kh_ideas', JSON.stringify(communityIdeas));
  renderIdeaList();
  playTone(620, 'sine', 0.1);
}

function renderPassport() {
  const grid = document.getElementById('passportGrid');
  grid.innerHTML = STAMPS_LIST.map(st => {
    const isUnlocked = unlockedStamps.includes(st.id);
    return `
      <div class="stamp-card ${isUnlocked ? 'unlocked' : ''}">
        <div style="font-size:2.2rem;">${st.icon}</div>
        <div style="font-weight:800;margin:4px 0;">${st.name}</div>
        <div style="font-size:0.78rem;color:${isUnlocked ? '#15803d' : '#64748b'};">
          ${isUnlocked ? '✅ ประทับตราแล้ว' : '🔒 ยังไม่ปลดล็อก'}
        </div>
      </div>
    `;
  }).join('');
}

// PWA Installation & Service Worker Setup
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

async function installWebApp() {
  if (!deferredPrompt) {
    alert('หากเปิดบนมือถือ/แท็บเล็ต สามารถกดเมนูเบราว์เซอร์ (แชร์ / จุด 3 จุด) แล้วเลือก "เพิ่มลงหน้าจอหลัก (Add to Home Screen)" เพื่อติดตั้งเป็นแอปได้ทันที!');
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    const installBtn = document.getElementById('btnInstallPwa');
    if (installBtn) installBtn.classList.add('hidden');
  }
  deferredPrompt = null;
}
