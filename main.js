const { app, BrowserWindow, ipcMain, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const { uIOhook, UiohookKey } = require('uiohook-napi');

app.disableHardwareAcceleration();

let win, tray;

// uiohook keycode -> key name mapping
const KEY_MAP = {};
Object.entries(UiohookKey).forEach(([name, code]) => {
  KEY_MAP[code] = name;
});

function createWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 400,
    height: 350,
    x: sw - 420,
    y: sh - 370,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
  win.setIgnoreMouseEvents(true, { forward: true });

  // Tray
  // Tray — 用代码生成图标，避免 asar 路径问题
  const size = 16;
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - 8, dy = y - 8;
      if (dx*dx + dy*dy <= 56) { buf[i]=255; buf[i+1]=180; buf[i+2]=200; buf[i+3]=255; }
    }
  }
  const trayIcon = nativeImage.createFromBuffer(buf, { width: size, height: size });
  tray = new Tray(trayIcon);
  tray.setToolTip('键盘桌宠');

  const skinColors = [
    { label: '默认', color: '#ffdd99' },
    { label: '白皙', color: '#ffeedd' },
    { label: '小麦', color: '#ddb896' },
    { label: '棕色', color: '#c68642' },
  ];
  const clothesColors = [
    { label: '蓝色', color: '#7eb8e0' },
    { label: '红色', color: '#e07e7e' },
    { label: '绿色', color: '#7ec07e' },
    { label: '紫色', color: '#b07eb8' },
    { label: '橙色', color: '#e0a87e' },
  ];
  const send = (ch, val) => { if (win && !win.isDestroyed()) win.webContents.send(ch, val); };

  const buildMenu = () => Menu.buildFromTemplate([
    { label: '角色', submenu: [
      { label: '人物', type: 'radio', checked: true, click: () => send('char-type', 'human') },
      { label: '小兔子', type: 'radio', click: () => send('char-type', 'bunny') },
      { label: '小猫', type: 'radio', click: () => send('char-type', 'cat') },
      { label: '小熊', type: 'radio', click: () => send('char-type', 'bear') },
      { label: '小狗', type: 'radio', click: () => send('char-type', 'dog') },
      { label: '企鹅', type: 'radio', click: () => send('char-type', 'penguin') },
      { label: '小鸭', type: 'radio', click: () => send('char-type', 'duck') },
    ]},
    { label: '视角', submenu: [
      { label: '正面', click: () => send('preset', 'front') },
      { label: '左斜视', click: () => send('preset', 'left') },
      { label: '右斜视', click: () => send('preset', 'right') },
      { label: '俯视', click: () => send('preset', 'top') },
      { label: '仰视', click: () => send('preset', 'bottom') },
      { label: '左后方', click: () => send('preset', 'leftBack') },
      { label: '右后方', click: () => send('preset', 'rightBack') },
    ]},
    { label: '缩放', submenu: [
      { label: '50%', click: () => send('scale', 50) },
      { label: '75%', click: () => send('scale', 75) },
      { label: '100%', click: () => send('scale', 100) },
      { label: '125%', click: () => send('scale', 125) },
      { label: '150%', click: () => send('scale', 150) },
    ]},
    { type: 'separator' },
    { label: '肤色', submenu: skinColors.map(s => ({
      label: s.label, click: () => send('skin-color', s.color),
    }))},
    { label: '衣服颜色', submenu: clothesColors.map(c => ({
      label: c.label, click: () => send('clothes-color', c.color),
    }))},
    { type: 'separator' },
    { label: '帽子', type: 'checkbox', checked: false, click: (m) => send('accessory', { id: 'hat', on: m.checked }) },
    { label: '眼镜', type: 'checkbox', checked: false, click: (m) => send('accessory', { id: 'glasses', on: m.checked }) },
    { label: '蝴蝶结', type: 'checkbox', checked: false, click: (m) => send('accessory', { id: 'bowtie', on: m.checked }) },
    { type: 'separator' },
    { label: '键盘样式', submenu: [
      { label: '经典', type: 'radio', checked: true, click: () => send('kb-theme', 'classic') },
      { label: '暗夜', type: 'radio', click: () => send('kb-theme', 'dark') },
      { label: '樱花粉', type: 'radio', click: () => send('kb-theme', 'sakura') },
      { label: '薄荷绿', type: 'radio', click: () => send('kb-theme', 'mint') },
      { label: '日落橙', type: 'radio', click: () => send('kb-theme', 'sunset') },
      { label: '海洋蓝', type: 'radio', click: () => send('kb-theme', 'ocean') },
      { label: '薰衣草', type: 'radio', click: () => send('kb-theme', 'lavender') },
      { label: '柠檬黄', type: 'radio', click: () => send('kb-theme', 'lemon') },
      { label: '复古棕', type: 'radio', click: () => send('kb-theme', 'retro') },
      { label: '赛博朋克', type: 'radio', click: () => send('kb-theme', 'cyber') },
    ]},
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]);
  tray.setContextMenu(buildMenu());
}

function startHook() {
  uIOhook.on('keydown', (e) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('key-down', { keycode: e.keycode, key: KEY_MAP[e.keycode] || '' });
    }
  });
  uIOhook.on('keyup', (e) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('key-up', { keycode: e.keycode, key: KEY_MAP[e.keycode] || '' });
    }
  });
  uIOhook.start();
}

ipcMain.on('set-click-through', (_, through) => {
  if (win) win.setIgnoreMouseEvents(through, { forward: true });
});

ipcMain.on('drag-start', () => {
  // no-op, drag handled via mouse move
});

let dragOffset = null;
ipcMain.on('drag-move', (_, { x, y }) => {
  if (win) win.setPosition(x, y);
});

app.whenReady().then(() => {
  createWindow();
  startHook();
});

app.on('will-quit', () => {
  uIOhook.stop();
});

app.on('window-all-closed', () => app.quit());
