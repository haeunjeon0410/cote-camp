const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  plan: () => ipcRenderer.invoke('plan:get'),
  factoryMake: o => ipcRenderer.invoke('factory:make', o),
  factoryStatus: () => ipcRenderer.invoke('factory:status'),
  winSize: d => ipcRenderer.invoke('win:size', d),
  winCtl: a => ipcRenderer.invoke('win:ctl', a),
  winResize: w => ipcRenderer.invoke('win:resize', w),
  onFullscreen: cb => ipcRenderer.on('win:fs', (_, v) => cb(v)),
  problems: () => ipcRenderer.invoke('problems:list'),
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: s => ipcRenderer.invoke('state:save', s),
  detect: settings => ipcRenderer.invoke('env:detect', settings),
  judge: opts => ipcRenderer.invoke('judge:run', opts),
});
