const {app,BrowserWindow,Menu,protocol,net,ipcMain,nativeTheme,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');

const ORIGIN='mayor://app';
const CONTENT=path.resolve(__dirname,'../desktop-dist');
protocol.registerSchemesAsPrivileged([{scheme:'mayor',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
app.setName('Мэрия случайностей');
app.setAppUserModelId('ru.mayor.chaos');
// Use one stable profile across portable builds; keep saves out of temporary extraction folders.
app.setPath('userData',path.join(app.getPath('appData'),'MayorOfChaos'));
let window;
if(!app.requestSingleInstanceLock())app.quit();
else {
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus()}});
  app.whenReady().then(()=>{
    Menu.setApplicationMenu(null);
    protocol.handle('mayor',request=>{
      let url;
      try{url=new URL(request.url)}catch{return new Response('Invalid request',{status:400})}
      if(url.host!=='app'||request.method!=='GET')return new Response('Forbidden',{status:403});
      let relative;
      try{relative=decodeURIComponent(url.pathname)}catch{return new Response('Invalid path',{status:400})}
      const file=path.resolve(CONTENT,'.'+(relative==='/'?'/index.html':relative));
      if(!file.startsWith(CONTENT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return new Response('Not found',{status:404});
      return net.fetch(pathToFileURL(file).toString());
    });
    const logFile=path.join(app.getPath('userData'),'startup.log');
    const log=message=>fs.appendFileSync(logFile,new Date().toISOString()+' '+message+'\n');
    window=new BrowserWindow({
      title:'Мэрия случайностей',width:1440,height:1000,minWidth:940,minHeight:700,
      frame:false,show:false,backgroundColor:'#080a10',autoHideMenuBar:true,
      icon:path.join(__dirname,'icon.png'),
      webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,spellcheck:false},
    });
    const trusted=event=>event.sender===window?.webContents && event.senderFrame?.url.startsWith(ORIGIN+'/');
    ipcMain.on('window:minimize',event=>{if(trusted(event))window.minimize()});
    ipcMain.on('window:toggle-maximize',event=>{if(trusted(event)){if(window.isMaximized())window.unmaximize();else window.maximize()}});
    ipcMain.on('window:close',event=>{if(trusted(event))window.close()});
    ipcMain.on('window:theme',(event,theme)=>{if(trusted(event)&&(theme==='dark'||theme==='light')){nativeTheme.themeSource=theme;window.setBackgroundColor(theme==='dark'?'#080a10':'#e9edf7')}});
    ipcMain.handle('chronicle:export',async(event,text)=>{
      if(!trusted(event)||typeof text!=='string'||Buffer.byteLength(text,'utf8')>2_000_000)return false;
      const result=await dialog.showSaveDialog(window,{title:'Сохранить городскую хронику',defaultPath:path.join(app.getPath('documents'),'История Случайногорска.txt'),filters:[{name:'Текстовая хроника',extensions:['txt']}]});
      if(result.canceled||!result.filePath)return false;
      try{await fs.promises.writeFile(result.filePath,'\ufeff'+text,'utf8');return true}catch(error){dialog.showErrorBox('Не удалось сохранить хронику',error.message);return false}
    });
    window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    window.webContents.on('will-navigate',(event,url)=>{if(url!==ORIGIN+'/'&&url!==ORIGIN+'/index.html')event.preventDefault()});
    window.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
    window.webContents.on('did-fail-load',(_e,code,description)=>log(`load error ${code}: ${description}`));
    window.webContents.on('console-message',details=>{if(details.level==='error'||details.level==='warning')log('renderer: '+details.message)});
    window.webContents.on('render-process-gone',(_event,details)=>log('renderer stopped: '+details.reason));
    window.webContents.on('did-finish-load',()=>log('UI loaded from bundled offline assets'));
    window.once('ready-to-show',()=>{window.show();log('Desktop window ready')});
    window.loadURL(ORIGIN+'/index.html');
    window.on('closed',()=>{window=null});
  }).catch(error=>{dialog.showErrorBox('Ошибка запуска',error.message);app.quit()});
}
app.on('window-all-closed',()=>app.quit());
