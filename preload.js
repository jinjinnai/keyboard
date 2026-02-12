const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pet', {
  onKeyDown: (cb) => ipcRenderer.on('key-down', (_, data) => cb(data)),
  onKeyUp: (cb) => ipcRenderer.on('key-up', (_, data) => cb(data)),
  setClickThrough: (v) => ipcRenderer.send('set-click-through', v),
  dragMove: (pos) => ipcRenderer.send('drag-move', pos),
  onPreset: (cb) => ipcRenderer.on('preset', (_, v) => cb(v)),
  onScale: (cb) => ipcRenderer.on('scale', (_, v) => cb(v)),
  onSkinColor: (cb) => ipcRenderer.on('skin-color', (_, v) => cb(v)),
  onClothesColor: (cb) => ipcRenderer.on('clothes-color', (_, v) => cb(v)),
  onAccessory: (cb) => ipcRenderer.on('accessory', (_, v) => cb(v)),
  onCharType: (cb) => ipcRenderer.on('char-type', (_, v) => cb(v)),
  onKbTheme: (cb) => ipcRenderer.on('kb-theme', (_, v) => cb(v)),
});
