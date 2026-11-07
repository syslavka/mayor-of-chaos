const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('mayorDesktop',Object.freeze({
  isDesktop:true,
  minimize:()=>ipcRenderer.send('window:minimize'),
  toggleMaximize:()=>ipcRenderer.send('window:toggle-maximize'),
  close:()=>ipcRenderer.send('window:close'),
  setTheme:theme=>{if(theme==='dark'||theme==='light')ipcRenderer.send('window:theme',theme)},
  exportChronicle:text=>ipcRenderer.invoke('chronicle:export',text),
}));
