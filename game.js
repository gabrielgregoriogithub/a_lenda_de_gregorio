'use strict';
// A Lenda de Gregório: aventura em grade, sem bibliotecas.
const canvas = document.querySelector('#world'), ctx = canvas.getContext('2d');
const T = 32, C = 25, R = 17;
const $ = s => document.querySelector(s);
const STORE = 'lenda-gregorio';
const HISTORY_EVERY = 6, HISTORY_MAX = 600; // ~60 s de "voltar no tempo"
const CHAPTERS = ['Vila de Elara', 'Bosque de Elara', 'Caverna do Eco', 'Templo da Lua'];

let keys = {}, state = 'title', prevState = 'playing', muted = false, frame = 0, lastMove = 0;
let attackTime = 0, dodgeTime = 0, invincible = 0, speed = 1, fastSpeed = 3;
let history = [], chapterStart = null, touchRewind = false;
let cheats = { life: false, walls: false, keys: false };
let tiles, enemies, objects, drops, shots, p, stage, seals, boss, won;

/* ---------- som ---------- */
let audioCtx;
function beep(freq = 440, duration = .08) {
  if (muted || speed > 1) return;
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = freq; g.gain.value = .035;
    o.connect(g); g.connect(audioCtx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
    o.stop(audioCtx.currentTime + duration);
  } catch {}
}

/* ---------- mapas ---------- */
// # parede  t arbusto  L porta trancada (chave pequena)  ~ água
const patterns = [[
  '#########################',
  '#.......................#',
  '#......tt...............#',
  '#....tttt...............#',
  '#.......................#',
  '#.............tt........#',
  '#..t..........tt........#',
  '#..t....................#',
  '#.......................#',
  '#.......................#',
  '#.........ttt...........#',
  '#.........ttt...~~~.....#',
  '#...............~~~.....#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#########################'], [
  '#########################',
  '#.......................#',
  '#....t.....t............#',
  '#....t..................#',
  '#...........tt..........#',
  '#...tt......tt..........#',
  '#...tt..................#',
  '#.......................#',
  '#.............tt........#',
  '#.............tt........#',
  '#...tt..................#',
  '#...tt.............ttt..#',
  '#..................t.t..#',
  '#........t..........t...#',
  '#........t..............#',
  '#.......................#',
  '#########################'], [
  '#########################',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '############L############',
  '#..t....................#',
  '#..t............#.......#',
  '#..t............#.......#',
  '#ttt....................#',
  '############L############',
  '#.......................#',
  '#.......................#',
  '#.....###.......###.....#',
  '#.......................#',
  '#.......................#',
  '#########################'], [
  '#########################',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#....######.######......#',
  '#.......................#',
  '#.......................#',
  '#.........t...t.........#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#.......................#',
  '#########################']];

const STAGES = [
  {
    spawn: [3, 12], msg: 'Encontre Iris e escute a história de Elara.',
    objects: () => [{ x: 7, y: 6, type: 'iris' }, { x: 4, y: 9, type: 'sign' }, { x: 20, y: 3, type: 'chest', item: 'key' }, { x: 23, y: 8, type: 'gate' }],
    enemies: () => [mob(12, 8), mob(18, 13), mob(15, 3)]
  },
  {
    spawn: [1, 8], msg: 'Atravesse o bosque até a entrada da caverna.',
    objects: () => [{ x: 23, y: 1, type: 'cave' }, { x: 20, y: 12, type: 'chest', item: 'potion' }],
    enemies: () => [mob(8, 4), mob(18, 5), mob(16, 12), mob(8, 13), mob(12, 8, 'bat')]
  },
  {
    spawn: [2, 14], msg: 'A Caverna do Eco. Portas trancadas pedem chaves pequenas.',
    objects: () => [{ x: 21, y: 12, type: 'chest', item: 'small' }, { x: 1, y: 7, type: 'chest', item: 'small' }, { x: 2, y: 2, type: 'chest', item: 'heart' }, { x: 22, y: 2, type: 'stairs' }],
    enemies: () => [mob(10, 12, 'bat'), mob(18, 14), mob(8, 7), mob(20, 8, 'bat'), mob(12, 3), mob(17, 2, 'bat')]
  },
  {
    spawn: [12, 15], msg: 'Ative os dois selos e enfrente o guardião!',
    objects: () => [{ x: 4, y: 3, type: 'seal', active: false }, { x: 20, y: 3, type: 'seal', active: false }, { x: 12, y: 1, type: 'altar' }],
    enemies: () => [mob(7, 10), mob(18, 10), mob(12, 12, 'bat')]
  }
];

/* ---------- estado ---------- */
function newHero() {
  return { x: 3, y: 12, hp: 6, max: 6, potions: 2, coins: 0, key: false, smallKeys: 0, dir: 'down', reached: 0 };
}
function setup() {
  p = newHero(); seals = 0; boss = null; won = false;
  load(0); state = 'title'; updateUI();
}
function load(n) {
  const s = STAGES[n];
  stage = n; tiles = patterns[n].map(r => r.split(''));
  objects = s.objects(); enemies = s.enemies(); drops = []; shots = [];
  [p.x, p.y] = s.spawn; p.reached = Math.max(p.reached, n);
  if (n === 3) { seals = 0; boss = { x: 12, y: 6, hp: 10, max: 10 }; } else boss = null;
  history = []; chapterStart = snapshot();
  updateUI(); message(s.msg);
}
function mob(x, y, kind = 'slime') { return { x, y, hp: kind === 'bat' ? 1 : 3, kind }; }
function snapshot() { return JSON.stringify({ stage, tiles, objects, enemies, drops, shots, p, seals, boss, won }); }
function restore(json) {
  ({ stage, tiles, objects, enemies, drops, shots, p, seals, boss, won } = JSON.parse(json));
  updateUI();
}

/* ---------- interface ---------- */
function message(s) { $('#message').textContent = s; }
function updateUI() {
  $('#region').textContent = '✦ ' + CHAPTERS[stage];
  $('#hearts').textContent = '♥'.repeat(p.hp) + '♡'.repeat(p.max - p.hp);
  $('#potions').textContent = 'Poções: ' + p.potions;
  $('#coins').textContent = 'Moedas: ' + p.coins;
  $('#smallkeys').textContent = stage === 2 ? '🗝 ' + (cheats.keys ? '∞' : p.smallKeys) : '';
  $('#inventory').textContent = p.potions + (p.potions === 1 ? ' poção' : ' poções') + ' de vida';
  $('#key').textContent = p.key ? 'Chave do bosque ✓' : 'Uma chave a encontrar';
  $('#q1').classList.toggle('complete', p.key);
  $('#q2').classList.toggle('complete', p.reached >= 3);
  $('#q3').classList.toggle('complete', stage === 3 && seals === 2);
  $('#q4').classList.toggle('complete', won);
  $('#quest').textContent = questText();
}
function questText() {
  if (won) return 'A Relíquia brilha novamente. A lenda de Gregório começou!';
  if (stage === 0) return p.key ? 'Atravesse o portão a leste.' : 'Converse com Iris e encontre o baú a nordeste.';
  if (stage === 1) return 'Encontre a entrada da caverna no nordeste do bosque.';
  if (stage === 2) return 'Abra os baús, use as chaves pequenas nas portas e suba a escada.';
  return seals < 2 ? 'Ative os dois selos com E.' : 'Derrote o guardião e interaja com o altar.';
}
function showOverlay(title, text, buttons, hint = '') {
  const o = $('#overlay');
  o.replaceChildren();
  const h = document.createElement('h2'); h.textContent = title;
  const t = document.createElement('p'); t.textContent = text;
  const row = document.createElement('div'); row.className = 'row';
  for (const [label, fn, ghost] of buttons) {
    const b = document.createElement('button');
    b.textContent = label; b.onclick = fn; if (ghost) b.className = 'ghost';
    row.append(b);
  }
  o.append(h, t, row);
  if (hint) { const s = document.createElement('p'); s.className = 'hint'; s.textContent = hint; o.append(s); }
  o.style.display = 'flex';
}
function hideOverlay() { $('#overlay').style.display = 'none'; }

/* ---------- mundo ---------- */
function blocked(x, y) {
  if (x < 1 || x >= C - 1 || y < 1 || y >= R - 1) return true;
  if (cheats.walls) return false;
  return '#tL~'.includes(tiles[y][x]) || objects.some(o => o.x === x && o.y === y && !['altar', 'stairs', 'cave'].includes(o.type));
}
function facing() {
  return { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.dir];
}
function move(dx, dy) {
  if (!dx && !dy) return;
  p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
  const x = p.x + dx, y = p.y + dy, tile = tiles[y]?.[x];
  if (tile === 'L' && !cheats.walls) return openDoor(x, y);
  if (!blocked(x, y)) {
    p.x = x; p.y = y; beep(170, .015); pickup(); stepOn();
  } else if (tile === 't') message('Um arbusto bloqueia o caminho. Use a espada!');
  else if (tile === '~') message('A água é funda demais para atravessar.');
  else if (objects.some(o => o.x === x && o.y === y)) message('Pressione E para interagir.');
  updateUI();
}
function openDoor(x, y) {
  if (p.smallKeys > 0 || cheats.keys) {
    if (!cheats.keys) p.smallKeys--;
    tiles[y][x] = '.'; beep(620, .2); message('A porta se abriu com um estalo!');
  } else message('Porta trancada. Encontre uma chave pequena.');
  updateUI();
}
function stepOn() {
  const o = objects.find(o => o.x === p.x && o.y === p.y);
  if (o?.type === 'cave') load(2);
  else if (o?.type === 'stairs') load(3);
}
function pickup() {
  const d = drops.find(d => d.x === p.x && d.y === p.y);
  if (!d) return;
  drops = drops.filter(o => o !== d);
  if (d.kind === 'coin') { p.coins += d.value; message('+' + d.value + ' moedas'); beep(990, .06); }
  else { p.hp = Math.min(p.max, p.hp + 2); message('Você recuperou vida!'); beep(760, .1); }
}
function drop(x, y, coinChance, heartChance) {
  const r = Math.random();
  if (r < heartChance) drops.push({ x, y, kind: 'heart' });
  else if (r < heartChance + coinChance) drops.push({ x, y, kind: 'coin', value: Math.random() < .25 ? 5 : 1 });
}
function near(a, x, y, d = 1) { return Math.abs(a.x - x) <= d && Math.abs(a.y - y) <= d; }

/* ---------- ações ---------- */
function slash() {
  if (state !== 'playing') return;
  attackTime = 14; beep(440);
  const [dx, dy] = facing(), x = p.x + dx, y = p.y + dy;
  if (tiles[y]?.[x] === 't') { tiles[y][x] = '.'; drop(x, y, .3, .12); message('Você abriu passagem entre os arbustos!'); }
  let hit = false;
  for (const e of enemies) {
    if (!near(e, x, y)) continue;
    e.hp--; hit = true;
    if (e.hp <= 0) { drop(e.x, e.y, .5, .25); message('Inimigo derrotado!'); }
  }
  enemies = enemies.filter(e => e.hp > 0);
  const blockedShots = shots.filter(s => s.x === x && s.y === y);
  if (blockedShots.length) { hit = true; shots = shots.filter(s => !blockedShots.includes(s)); }
  if (boss?.hp > 0 && near(boss, x, y)) {
    if (seals < 2) message('O guardião está protegido pelos selos!');
    else {
      boss.hp--; hit = true; message('Você acertou o guardião!');
      if (boss.hp <= 0) { p.coins += 20; message('Guardião derrotado! Alcance o altar.'); }
    }
  }
  if (hit) beep(700, .12);
  updateUI();
}
function dodge() {
  if (state !== 'playing') return;
  invincible = Math.max(invincible, 14); dodgeTime = 14;
  const [dx, dy] = facing(); move(dx, dy); beep(650);
}
function interact() {
  if (state !== 'playing') return;
  const o = objects.find(o => Math.abs(o.x - p.x) + Math.abs(o.y - p.y) <= 2);
  if (!o) return message('Nada para interagir por aqui.');
  beep(530, .12);
  const actions = { iris: talkIris, sign: () => message('Placa: "Aqui nasceu Gregório, filho do ferreiro. Que sua espada guie a lua de volta."'), chest: openChest, gate: openGate, cave: () => load(2), stairs: () => load(3), seal: activateSeal, altar: useAltar };
  actions[o.type](o);
  updateUI();
}
function talkIris() {
  if (!p.key) return message('Iris: "Gregório, a lua precisa de você. A chave do bosque está no baú a nordeste."');
  if (p.coins >= 10) { p.coins -= 10; p.potions++; return message('Iris: "Leve esta poção. São 10 moedas, e boa sorte!"'); }
  message('Iris: "Junte 10 moedas e eu te vendo uma poção. Siga pelo portão a leste!"');
}
function openChest(o) {
  if (o.open) return message('O baú já está vazio.');
  o.open = true;
  if (o.item === 'key') { p.key = true; p.potions++; message('Você encontrou a CHAVE DO BOSQUE e uma poção!'); }
  if (o.item === 'potion') { p.potions++; message('Uma poção de vida!'); }
  if (o.item === 'small') { p.smallKeys++; message('Uma chave pequena! Use-a numa porta trancada.'); }
  if (o.item === 'heart') { p.max += 2; p.hp = p.max; message('Um CORAÇÃO LUNAR! Sua vida máxima aumentou.'); }
  beep(880, .25);
}
function openGate() { p.key ? load(1) : message('Portão trancado. Encontre a chave no baú!'); }
function activateSeal(o) {
  if (o.active) return message('Este selo já está ativo.');
  o.active = true; seals++; message('Selo lunar ativado! ' + seals + '/2');
}
function useAltar() {
  if (seals < 2 || boss.hp > 0) return message('O altar aguarda os dois selos e a derrota do guardião.');
  won = true; state = 'win'; clearAutosave(); beep(880, .4);
  showOverlay('✦ A Lenda de Gregório', 'A Relíquia Lunar despertou e devolveu a luz a Elara. Gregório voltou para a vila como herói. Moedas juntadas: ' + p.coins + '.', [['Jogar novamente', newGame]]);
}
function potion() {
  if (state !== 'playing') return;
  if (p.potions && p.hp < p.max) { p.potions--; p.hp = p.max; message('Você recuperou toda a vida!'); beep(850, .18); updateUI(); }
  else message(p.potions ? 'Sua vida já está cheia.' : 'Você não tem poções.');
}
function damage() {
  if (invincible > 0 || state !== 'playing' || cheats.life) return;
  p.hp--; invincible = 55; beep(110, .25); message('Você foi atingido!');
  if (p.hp <= 0) die();
  updateUI();
}
function die() {
  state = 'dead';
  showOverlay('Gregório caiu…', 'O vale ainda precisa da sua luz. Volte no tempo ou recomece o capítulo.', [
    ['⟲ Voltar 5 segundos', () => rewindBy(50)],
    ['Recomeçar capítulo', () => { restore(chapterStart); history = []; resume(); }],
    ['Novo jogo', newGame, true]
  ], 'Dica: segure R durante o jogo para voltar no tempo a qualquer momento.');
}

/* ---------- inimigos ---------- */
function stepEnemy(e) {
  const dist = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
  if (dist === 1) return damage();
  if (dist >= (e.kind === 'bat' ? 9 : 7)) return;
  const sx = Math.sign(p.x - e.x), sy = Math.sign(p.y - e.y);
  const horiz = e.kind === 'bat' && Math.random() < .3 ? Math.random() < .5 : Math.abs(p.x - e.x) > Math.abs(p.y - e.y);
  const tx = e.x + (horiz ? sx : 0), ty = e.y + (horiz ? 0 : sy);
  const free = !blocked(tx, ty) || (cheats.walls && !'#tL~'.includes(tiles[ty][tx]));
  if (free && !(tx === p.x && ty === p.y) && !enemies.some(o => o !== e && o.x === tx && o.y === ty)) { e.x = tx; e.y = ty; }
}
function stepBoss() {
  if (!boss || boss.hp <= 0) return;
  const dist = Math.abs(boss.x - p.x) + Math.abs(boss.y - p.y);
  if (frame % 36 === 0 && dist <= 2) damage();
  if (frame % 72 === 0 && dist > 2) {
    const bx = boss.x + Math.sign(p.x - boss.x), by = boss.y + Math.sign(p.y - boss.y);
    if (!'#t'.includes(tiles[by][bx])) { boss.x = bx; boss.y = by; }
  }
  if (frame % (seals === 2 ? 70 : 110) === 0) {
    const horiz = Math.abs(p.x - boss.x) > Math.abs(p.y - boss.y);
    shots.push({ x: boss.x, y: boss.y, dx: horiz ? Math.sign(p.x - boss.x) : 0, dy: horiz ? 0 : Math.sign(p.y - boss.y) });
    beep(300, .1);
  }
}
function stepShots() {
  for (const s of shots) {
    s.x += s.dx; s.y += s.dy;
    if (s.x === p.x && s.y === p.y) { damage(); s.dead = true; }
    else if ('#t'.includes(tiles[s.y]?.[s.x] ?? '#')) s.dead = true;
  }
  shots = shots.filter(s => !s.dead);
}

/* ---------- laço principal ---------- */
function step() {
  frame++;
  if (invincible > 0) invincible--;
  if (attackTime > 0) attackTime--;
  if (dodgeTime > 0) dodgeTime--;
  let dx = Number(!!(keys.arrowright || keys.d || pad.right)) - Number(!!(keys.arrowleft || keys.a || pad.left));
  let dy = Number(!!(keys.arrowdown || keys.s || pad.down)) - Number(!!(keys.arrowup || keys.w || pad.up));
  if (frame - lastMove >= 8 && (dx || dy)) { if (dx) dy = 0; move(dx, dy); lastMove = frame; }
  if (frame % 36 === 0) enemies.filter(e => e.kind !== 'bat').forEach(stepEnemy);
  if (frame % 16 === 0) enemies.filter(e => e.kind === 'bat').forEach(stepEnemy);
  if (frame % 6 === 0) stepShots();
  stepBoss();
  if (frame % HISTORY_EVERY === 0) {
    history.push(snapshot());
    if (history.length > HISTORY_MAX) history.shift();
  }
}
function update() {
  pollGamepad();
  const rewinding = (keys.r || touchRewind || pad.rewind) && (state === 'playing' || state === 'dead');
  $('#rewindbar').hidden = !rewinding;
  if (rewinding) return rewindTick();
  if (state !== 'playing') return;
  speed = keys.f || pad.fast ? fastSpeed : 1;
  $('#speed').textContent = speed > 1 ? '▶▶ ' + (speed >= 6 ? 'máx' : speed + '×') : '';
  for (let i = 0; i < speed; i++) step();
}
function rewindTick() {
  frame++;
  $('#rewindleft').textContent = Math.ceil(history.length * HISTORY_EVERY / 60) + ' s';
  if (frame % 2 || !history.length) return;
  restore(history.pop());
  if (state === 'dead') { hideOverlay(); state = 'playing'; }
  invincible = 30;
}
function rewindBy(n) {
  if (!history.length) { restore(chapterStart); resume(); return; }
  const target = Math.max(0, history.length - n);
  restore(history[target]); history.length = target; invincible = 60; resume();
}

/* ---------- desenho ---------- */
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
const PALETTE = [
  { floor: ['#426c4a', '#477451'], wall: ['#253f43', '#415b61', '#66818a'] },
  { floor: ['#3b6544', '#406b49'], wall: ['#1f3a2b', '#2f5240', '#4c7559'] },
  { floor: ['#2e2a3b', '#332e42'], wall: ['#15121d', '#2a2537', '#463f5c'] },
  { floor: ['#4f5470', '#555a78'], wall: ['#25283d', '#3b3f5c', '#6a6f94'] }
];
function drawTile(x, y) {
  const px = x * T, py = y * T, t = tiles[y][x], pal = PALETTE[stage];
  rect(px, py, T, T, pal.floor[(x + y) % 2]);
  if (t === '#') { rect(px, py, T, T, pal.wall[0]); rect(px + 3, py + 2, 26, 27, pal.wall[1]); rect(px + 5, py + 3, 22, 5, pal.wall[2]); return; }
  if (t === '~') { rect(px, py, T, T, '#2c6e8f'); rect(px + 4 + (frame >> 4) % 8, py + 10, 10, 2, '#7cc3db'); rect(px + 14 - (frame >> 4) % 8, py + 22, 10, 2, '#7cc3db'); return; }
  if (t === 'L') { rect(px, py, T, T, pal.wall[0]); rect(px + 4, py + 2, 24, 30, '#7a4a26'); rect(px + 13, py + 12, 6, 8, '#f0c75a'); return; }
  if (stage < 2 && (x * 13 + y * 19) % 11 === 0) rect(px + 9, py + 8, 4, 3, '#9dc47a');
  if (stage < 2 && (x * 7 + y * 9) % 17 === 0) rect(px + 20, py + 15, 3, 3, '#7baf59');
  if (stage === 2 && (x * 5 + y * 3) % 13 === 0) rect(px + 12, py + 14, 5, 3, '#4b4460');
  if (t === 't') { rect(px + 3, py + 11, 26, 19, '#15462e'); rect(px + 8, py + 3, 17, 20, '#267643'); rect(px + 4, py + 10, 22, 7, '#4b9b53'); }
}
function drawObject(o) {
  const x = o.x * T, y = o.y * T;
  switch (o.type) {
    case 'iris': rect(x + 6, y + 5, 20, 24, '#986ab7'); rect(x + 10, y + 1, 12, 12, '#eabf8e'); rect(x + 9, y, 14, 5, '#ead18e'); break;
    case 'sign': rect(x + 14, y + 16, 4, 14, '#6a4a2c'); rect(x + 5, y + 5, 22, 13, '#b58a52'); rect(x + 8, y + 9, 16, 2, '#5d4026'); rect(x + 8, y + 13, 12, 2, '#5d4026'); break;
    case 'chest':
      rect(x + 3, y + 11, 26, 19, '#6a3d23');
      rect(x + 4, y + (o.open ? 2 : 6), 24, 13, o.open ? '#8a5a2c' : '#ae7336');
      if (!o.open) rect(x + 14, y + 12, 5, 12, o.item === 'small' ? '#c9d2dc' : '#eec860');
      break;
    case 'gate': rect(x + 3, y, 26, 32, '#c99c62'); rect(x + 8, y + 4, 16, 28, p.key ? '#2a1d14' : '#69452c'); rect(x + 18, y + 17, 3, 3, '#ffdf79'); break;
    case 'cave': rect(x, y, T, T, '#3d3a33'); rect(x + 5, y + 8, 22, 24, '#0c0b10'); rect(x + 2, y + 3, 28, 6, '#5b5649'); break;
    case 'stairs': for (let i = 0; i < 4; i++) rect(x + 4 + i * 3, y + 4 + i * 7, 24 - i * 6, 6, i % 2 ? '#8d86a8' : '#a9a2c4'); break;
    case 'seal': rect(x + 5, y + 5, 22, 22, o.active ? '#a2edeb' : '#575e8c'); rect(x + 10, y + 10, 12, 12, o.active ? '#efffff' : '#9795d5'); break;
    case 'altar': rect(x + 2, y + 7, 28, 23, '#9991b7'); rect(x + 11, y, 10, 24, won ? '#fff6c8' : '#d4eaff'); break;
  }
}
function drawEnemy(e) {
  const x = e.x * T, y = e.y * T;
  if (e.kind === 'bat') {
    const flap = (frame >> 3) % 2 ? 6 : 0;
    rect(x + 2, y + 10 + flap, 10, 6, '#3b2d52'); rect(x + 20, y + 10 + flap, 10, 6, '#3b2d52');
    rect(x + 10, y + 8, 12, 14, '#5d4685'); rect(x + 12, y + 12, 3, 3, '#ff6b6b'); rect(x + 18, y + 12, 3, 3, '#ff6b6b');
    return;
  }
  rect(x + 4, y + 8, 24, 19, '#9b4647'); rect(x + 8, y + 3, 16, 13, '#cb7063');
  rect(x + 9, y + 15, 4, 3, '#fff'); rect(x + 20, y + 15, 4, 3, '#fff');
}
function drawBoss() {
  if (!boss || boss.hp <= 0) return;
  const x = boss.x * T, y = boss.y * T;
  if (seals < 2) { ctx.globalAlpha = .35 + .15 * Math.sin(frame / 10); rect(x - 9, y - 12, 50, 51, '#9ad8ff'); ctx.globalAlpha = 1; }
  rect(x - 5, y - 8, 42, 43, '#533462'); rect(x + 2, y - 3, 28, 29, '#9f64a1');
  rect(x + 5, y + 6, 5, 5, '#e9d4a1'); rect(x + 22, y + 6, 5, 5, '#e9d4a1');
  rect(x - 8, y - 16, 48, 5, '#371c29'); rect(x - 8, y - 16, 48 * boss.hp / boss.max, 5, '#d75d74');
}
function drawHero() {
  const x = p.x * T, y = p.y * T;
  if (invincible > 0 && frame % 8 >= 4) return;
  rect(x + 5, y + 7, 22, 20, '#8e2b2b');                               // capa
  rect(x + 7, y + 5, 18, 24, dodgeTime ? '#bce8b7' : '#3a7eb8');       // túnica
  rect(x + 7, y + 17, 18, 3, '#5a3b20');                               // cinto
  rect(x + 11, y, 11, 12, '#e6b98b');                                  // rosto
  rect(x + 9, y - 2, 14, 6, '#2e231b');                                // cabelo
  rect(x + 10, y + 21, 6, 9, '#554537'); rect(x + 19, y + 21, 6, 9, '#554537');
  if (attackTime > 0) {
    const [dx, dy] = facing();
    rect(x + 13 + dx * 22, y + 10 + dy * 22, dx ? 20 : 5, dy ? 20 : 5, '#e8f5d1');
  }
}
function draw() {
  ctx.clearRect(0, 0, 800, 544);
  for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) drawTile(x, y);
  objects.forEach(drawObject);
  for (const d of drops) {
    const x = d.x * T, y = d.y * T + Math.sin((frame + d.x * 9) / 8) * 2;
    if (d.kind === 'coin') { rect(x + 11, y + 9, 10, 14, d.value > 1 ? '#7fd3ff' : '#f3cf4f'); rect(x + 13, y + 11, 3, 8, '#fff6'); }
    else { rect(x + 9, y + 10, 6, 6, '#e3505f'); rect(x + 17, y + 10, 6, 6, '#e3505f'); rect(x + 10, y + 14, 12, 6, '#e3505f'); rect(x + 13, y + 19, 6, 4, '#e3505f'); }
  }
  enemies.forEach(drawEnemy);
  drawBoss();
  for (const s of shots) { rect(s.x * T + 9, s.y * T + 9, 14, 14, '#c9b6ff'); rect(s.x * T + 13, s.y * T + 13, 6, 6, '#fff'); }
  drawHero();
  if (stage === 2) { // caverna escura: luz ao redor de Gregório
    const g = ctx.createRadialGradient(p.x * T + 16, p.y * T + 16, 40, p.x * T + 16, p.y * T + 16, 230);
    g.addColorStop(0, '#0000'); g.addColorStop(1, '#000c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 544);
  }
  if (state === 'paused') {
    rect(0, 0, 800, 544, '#09100ec0');
    ctx.fillStyle = '#f1dc9d'; ctx.font = 'bold 36px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('PAUSADO', 400, 260);
    ctx.font = '17px Arial'; ctx.fillText('Pressione P para continuar', 400, 298);
  }
  requestAnimationFrame(draw);
}

/* ---------- saves (localStorage) ---------- */
function storeGet(k) { try { return JSON.parse(localStorage.getItem(STORE + k)); } catch { return null; } }
function storeSet(k, v) { try { localStorage.setItem(STORE + k, JSON.stringify(v)); return true; } catch { return false; } }
function clearAutosave() { try { localStorage.removeItem(STORE + '-auto'); } catch {} }
function saveData() { return { snap: snapshot(), stage, hp: p.hp, max: p.max, coins: p.coins, at: Date.now() }; }
function autosave() { if (['playing', 'paused', 'menu'].includes(state) && !won) storeSet('-auto', saveData()); }
function loadData(d) {
  restore(d.snap); history = []; chapterStart = d.snap;
  closeMenu(true); resume(); message('Jogo carregado: ' + CHAPTERS[stage] + '.');
}
function renderSlots() {
  const box = $('#slots'); box.replaceChildren();
  for (let i = 1; i <= 3; i++) {
    const d = storeGet('-slot' + i), row = document.createElement('div'), info = document.createElement('div');
    row.className = 'slot'; info.className = 'info';
    const title = document.createElement('b'); title.textContent = 'Espaço ' + i;
    info.append(title, document.createElement('br'),
      d ? CHAPTERS[d.stage] + ' • ♥ ' + d.hp + '/' + d.max + ' • ' + d.coins + ' moedas • ' + new Date(d.at).toLocaleString('pt-BR') : 'Vazio');
    const save = document.createElement('button'); save.textContent = 'Salvar';
    save.onclick = () => { storeSet('-slot' + i, saveData()) ? message('Jogo salvo no espaço ' + i + '.') : message('Não foi possível salvar neste navegador.'); renderSlots(); };
    const load = document.createElement('button'); load.textContent = 'Carregar'; load.disabled = !d;
    load.onclick = () => loadData(d);
    const del = document.createElement('button'); del.textContent = 'Apagar'; del.className = 'ghost'; del.disabled = !d;
    del.onclick = () => { try { localStorage.removeItem(STORE + '-slot' + i); } catch {} renderSlots(); };
    row.append(info, save, load, del); box.append(row);
  }
}
function renderChapters() {
  const box = $('#chapters'); box.replaceChildren();
  CHAPTERS.forEach((name, n) => {
    const b = document.createElement('button');
    b.textContent = (n + 1) + '. ' + name; b.disabled = n > p.reached;
    b.onclick = () => { if (n >= 1) p.key = true; p.smallKeys = 0; load(n); closeMenu(true); resume(); };
    box.append(b);
  });
}

/* ---------- menu no jogo ---------- */
function openMenu() {
  if (!['playing', 'paused'].includes(state)) return;
  prevState = state; state = 'menu';
  renderSlots(); renderChapters(); syncSettingsUI();
  $('#menu').hidden = false; $('#closemenu').focus();
}
function closeMenu(silent) {
  if (state !== 'menu' && !silent) return;
  $('#menu').hidden = true;
  if (state === 'menu') state = prevState;
}
function showTab(name) {
  document.querySelectorAll('.menu-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.menu-panel').forEach(p => p.hidden = p.dataset.panel !== name);
}
function setFilter(f) {
  $('#screen').className = 'screen filter-' + f;
  storeSet('-filter', f); syncSettingsUI();
}
function syncSettingsUI() {
  const f = ($('#screen').className.match(/filter-(\w+)/) || [])[1];
  document.querySelectorAll('#filters button').forEach(b => b.classList.toggle('on', b.dataset.filter === f));
  document.querySelectorAll('#speeds button').forEach(b => b.classList.toggle('on', Number(b.dataset.speed) === fastSpeed));
  $('#cheat-life').checked = cheats.life; $('#cheat-walls').checked = cheats.walls; $('#cheat-keys').checked = cheats.keys;
}

/* ---------- fluxo ---------- */
function resume() { state = 'playing'; hideOverlay(); }
function newGame() { clearAutosave(); setup(); resume(); message('A aventura de Gregório começou. Boa sorte!'); }
function togglePause() {
  if (state === 'playing') state = 'paused';
  else if (state === 'paused') state = 'playing';
}
function titleScreen() {
  const auto = storeGet('-auto'), buttons = [['Começar aventura', newGame]];
  if (auto) buttons.unshift(['Continuar (' + CHAPTERS[auto.stage] + ')', () => loadData(auto)]);
  showOverlay('✦ A Lenda de Gregório', 'A lua se apagou sobre Elara. Converse com Iris, encontre a chave, desça à Caverna do Eco e desperte a Relíquia Lunar.', buttons,
    'WASD/setas • J/Espaço: espada • E: interagir • Shift: esquivar • Q: poção • R: voltar no tempo • Esc: menu');
}

/* ---------- controle (gamepad) ---------- */
const pad = { prev: [], rewind: false, fast: false };
const PAD_ACTIONS = { 0: slash, 1: interact, 2: dodge, 3: potion, 9: () => state === 'menu' ? closeMenu() : openMenu(), 8: togglePause };
function pollGamepad() {
  const gp = navigator.getGamepads?.().find(g => g);
  if (!gp) return;
  const b = gp.buttons.map(x => x.pressed);
  for (const [i, fn] of Object.entries(PAD_ACTIONS)) if (b[i] && !pad.prev[i]) fn();
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  pad.left = b[14] || ax < -.5; pad.right = b[15] || ax > .5;
  pad.up = b[12] || ay < -.5; pad.down = b[13] || ay > .5;
  pad.rewind = !!(b[6] && b[7]);        // LT + RT, como no Moon Pearl
  pad.fast = !!(b[5] && !b[4]);         // RB acelera
  pad.prev = b;
}

/* ---------- toque ---------- */
function bindTouch() {
  const acts = { slash, interact, dodge, potion, menu: openMenu };
  document.querySelectorAll('#touch [data-dir]').forEach(btn => {
    const k = btn.dataset.dir.toLowerCase();
    const on = e => { e.preventDefault(); keys[k] = true; btn.classList.add('held'); };
    const off = () => { keys[k] = false; btn.classList.remove('held'); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerenter', e => e.buttons && on(e)); // deslizar entre botões
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, off));
  });
  document.querySelectorAll('#touch [data-act]').forEach(btn => {
    const a = btn.dataset.act;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); navigator.vibrate?.(12);
      if (a === 'rewind') touchRewind = true; else acts[a]();
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, () => { if (a === 'rewind') touchRewind = false; }));
  });
}

/* ---------- eventos ---------- */
const KEY_ACTIONS = { j: slash, ' ': slash, e: interact, q: potion, shift: dodge, p: togglePause, m: () => state === 'menu' ? closeMenu() : openMenu(), escape: () => state === 'menu' ? closeMenu() : openMenu() };
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(k) && e.target.tagName !== 'INPUT') e.preventDefault();
  keys[k] = true;
  if (!e.repeat) KEY_ACTIONS[k]?.();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { keys = {}; autosave(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) autosave(); });
window.addEventListener('pagehide', autosave);

$('#fullscreen').onclick = () => document.documentElement.requestFullscreen?.();
$('#mute').onclick = () => { muted = !muted; $('#mute').textContent = muted ? '♪ Sem som' : '♫ Som'; };
$('#openmenu').onclick = () => state === 'menu' ? closeMenu() : openMenu();
$('#closemenu').onclick = () => closeMenu();
$('#restart').onclick = () => { closeMenu(true); newGame(); };
document.querySelectorAll('.menu-tabs button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
document.querySelectorAll('#filters button').forEach(b => b.onclick = () => setFilter(b.dataset.filter));
document.querySelectorAll('#speeds button').forEach(b => b.onclick = () => { fastSpeed = Number(b.dataset.speed); storeSet('-speed', fastSpeed); syncSettingsUI(); });
for (const c of ['life', 'walls', 'keys']) $('#cheat-' + c).onchange = e => { cheats[c] = e.target.checked; updateUI(); };
$('#cheat-wallet').onclick = () => { p.coins = 999; updateUI(); message('Carteira cheia!'); };

bindTouch();
setFilter(storeGet('-filter') || 'sharp');
fastSpeed = storeGet('-speed') || 3;
setup();
titleScreen();
requestAnimationFrame(draw);
setInterval(update, 1000 / 60);
