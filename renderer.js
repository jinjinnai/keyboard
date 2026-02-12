const character = document.getElementById('character');
const keys = document.querySelectorAll('.key');
let typingTimer = null;
let pressedKeys = new Set();

// Init canvas character
CharacterCanvas.init(character);

// === Action state machine ===
let lastKeyTime = Date.now();
let keyTimes = []; // timestamps of recent keydowns
let idleTimer = null;
let currentAction = '';
const ACTION_CLASSES = ['typing', 'stretch', 'nod', 'shake', 'happy', 'sleepy'];

function setAction(action) {
  if (currentAction === action) return;
  ACTION_CLASSES.forEach(c => character.classList.remove(c));
  currentAction = action;
  if (action) character.classList.add(action);
  // show/hide zzz
  document.querySelector('.zzz').classList.toggle('hidden', action !== 'sleepy');
  // sync to canvas
  CharacterCanvas.setTyping(action === 'typing' || action === 'nod' || action === 'happy');
  CharacterCanvas.setAction(action);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (currentAction === 'sleepy' || currentAction === 'stretch') setAction('');
  idleTimer = setTimeout(() => {
    setAction('stretch');
    // after stretch, go sleepy
    setTimeout(() => setAction('sleepy'), 2000);
  }, 30000);
}

function getTypingSpeed() {
  const now = Date.now();
  keyTimes = keyTimes.filter(t => now - t < 2000);
  return keyTimes.length; // keys in last 2s
}

// uiohook key name -> keyboard label mapping
const KEY_LABEL_MAP = {
  Q: 'Q', W: 'W', E: 'E', R: 'R', T: 'T', Y: 'Y', U: 'U', I: 'I', O: 'O', P: 'P',
  A: 'A', S: 'S', D: 'D', F: 'F', G: 'G', H: 'H', J: 'J', K: 'K', L: 'L',
  Z: 'Z', X: 'X', C: 'C', V: 'V', B: 'B', N: 'N', M: 'M',
  Space: 'SPACE', Enter: 'ENT', Backspace: 'BS', Tab: 'TAB',
  Shift: 'SH', ShiftRight: 'SH', Ctrl: 'CT', CtrlRight: 'CT',
  Alt: 'AL', AltRight: 'AL',
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
  Comma: ',', Period: '.', Semicolon: ';', Quote: "'",
  BracketLeft: '[', BracketRight: ']', Slash: '/', Backslash: '\\',
  Minus: '-', Equal: '=', Escape: 'ES',
};

function findKeyEl(keyName) {
  const label = KEY_LABEL_MAP[keyName];
  if (!label) return null;
  for (const k of keys) {
    if (k.dataset.key === label) return k;
  }
  return null;
}

pet.onKeyDown((data) => {
  pressedKeys.add(data.keycode);
  lastKeyTime = Date.now();
  keyTimes.push(Date.now());
  resetIdleTimer();

  const speed = getTypingSpeed();
  if (speed > 12) {
    setAction('happy');
  } else if (speed > 6) {
    setAction('nod');
  } else {
    setAction('typing');
  }

  clearTimeout(typingTimer);
  const el = findKeyEl(data.key);
  if (el) {
    el.classList.add('active');
    // 判断按键在键盘左半还是右半
    const kb = document.getElementById('mini-keyboard');
    const kbRect = kb.getBoundingClientRect();
    const keyRect = el.getBoundingClientRect();
    const keyCenterX = keyRect.left + keyRect.width / 2;
    const kbCenterX = kbRect.left + kbRect.width / 2;
    character.classList.remove('typing-left', 'typing-right');
    character.classList.add(keyCenterX < kbCenterX ? 'typing-left' : 'typing-right');
  }

  // shake on backspace/delete
  if (data.key === 'Backspace' || data.key === 'Delete') {
    setAction('shake');
  }
});

pet.onKeyUp((data) => {
  pressedKeys.delete(data.keycode);
  const el = findKeyEl(data.key);
  if (el) el.classList.remove('active');

  if (pressedKeys.size === 0) {
    typingTimer = setTimeout(() => {
      setAction('');
      character.classList.remove('typing-left', 'typing-right');
    }, 300);
  }
});

// Click-through & drag
const body = document.body;
let dragging = false, dragX, dragY;

body.addEventListener('mouseenter', () => pet.setClickThrough(false));
body.addEventListener('mouseleave', () => {
  if (!dragging) pet.setClickThrough(true);
});

character.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    dragging = true;
    dragX = e.screenX - window.screenX;
    dragY = e.screenY - window.screenY;
  }
});

document.addEventListener('mousemove', (e) => {
  if (dragging) {
    pet.dragMove({ x: e.screenX - dragX, y: e.screenY - dragY });
  }
});

document.addEventListener('mouseup', () => { dragging = false; });

// === Settings via tray IPC ===
const scene = document.getElementById('scene');

const PRESETS = {
  front: { rotY: 0, rotX: 0, rotZ: 0 },
  left: { rotY: -25, rotX: 5, rotZ: -8 },
  right: { rotY: 25, rotX: 5, rotZ: 8 },
  top: { rotY: 0, rotX: -20, rotZ: 0 },
  bottom: { rotY: 0, rotX: 15, rotZ: 0 },
  leftBack: { rotY: -40, rotX: 5, rotZ: 0 },
  rightBack: { rotY: 40, rotX: 5, rotZ: 0 },
};
let currentScale = 100;

function applyView(p, s) {
  scene.style.transform = `translateX(-50%) rotateY(${p.rotY}deg) rotateX(${p.rotX}deg) rotateZ(${p.rotZ}deg) scale(${s / 100})`;
}

pet.onPreset((name) => { if (PRESETS[name]) applyView(PRESETS[name], currentScale); });
pet.onScale((s) => { currentScale = s; applyView(PRESETS.front, s); });

pet.onSkinColor(() => {}); // canvas handles colors now
pet.onClothesColor(() => {});
pet.onAccessory(({ id, on }) => {
  document.querySelector('.' + id).classList.toggle('hidden', !on);
});

pet.onCharType((type) => { character.dataset.char = type; CharacterCanvas.setCharType(type); });
pet.onKbTheme((name) => { document.getElementById('desk').dataset.kbTheme = name; });

// Start idle timer
resetIdleTimer();
