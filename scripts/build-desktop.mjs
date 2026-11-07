import {build} from 'vite';
import {build as packageApp,Platform,Arch} from 'electron-builder';
import {fileURLToPath} from 'node:url';
import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
process.chdir(root);
await build({configFile:path.join(root,'desktop/vite.config.ts')});
if(!process.argv.includes('--renderer-only')){
  // Stage only the bundled renderer and Electron entry points: no web server or development dependencies.
  const stage=path.join(root,'.desktop-package');
  await mkdir(path.join(stage,'desktop'),{recursive:true});
  for(const name of ['main.cjs','preload.cjs','icon.png','icon.ico'])await cp(path.join(root,'desktop',name),path.join(stage,'desktop',name));
  await cp(path.join(root,'desktop-dist'),path.join(stage,'desktop-dist'),{recursive:true});
  const config=JSON.parse(await readFile(path.join(root,'desktop/builder.json'),'utf8'));
  const electronVersion=JSON.parse(await readFile(path.join(root,'node_modules/electron/package.json'),'utf8')).version;
  await writeFile(path.join(stage,'package.json'),JSON.stringify({...config.extraMetadata,private:true}));
  await packageApp({projectDir:stage,config:{...config,electronVersion,directories:{output:path.join(root,'release'),buildResources:path.join(root,'desktop')},win:{...config.win,icon:path.join(root,'desktop/icon.ico')}},targets:Platform.WINDOWS.createTarget('portable',Arch.x64)});
}
