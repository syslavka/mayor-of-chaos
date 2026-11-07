import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#302943"/><stop offset="1" stop-color="#10151e"/></linearGradient><linearGradient id="accent" x2=".5" y2="1"><stop stop-color="#d4c3ff"/><stop offset="1" stop-color="#9b80d8"/></linearGradient><radialGradient id="shine" cx=".12" cy="0" r="1"><stop stop-color="#ffffff" stop-opacity=".18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect x="8" y="8" width="496" height="496" rx="120" fill="url(#bg)"/><rect x="9" y="9" width="494" height="494" rx="119" fill="url(#shine)" stroke="#bba3ff" stroke-opacity=".3" stroke-width="2"/><path d="m115 209 141-89 141 89Z" fill="url(#accent)"/><g fill="none" stroke="url(#accent)" stroke-linecap="round" stroke-width="21"><path d="M139 237v118M217 237v118M295 237v118M373 237v118M121 385h270"/></g><circle cx="385" cy="131" r="29" fill="#76e3c2"/><path d="m382 113-10 19h13l-4 16 18-24h-14l5-11Z" fill="#15362e"/></svg>`;
const png=await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(new URL('../desktop/icon.png',import.meta.url),png);
const sizes=[16,32,48,64,128,256];
const entries=await Promise.all(sizes.map(s=>sharp(Buffer.from(svg)).resize(s,s).png().toBuffer()));
const header=Buffer.alloc(6+entries.length*16);header.writeUInt16LE(1,2);header.writeUInt16LE(entries.length,4);
let offset=header.length;
for(let i=0;i<entries.length;i++){const index=6+i*16;header[index]=sizes[i]===256?0:sizes[i];header[index+1]=header[index];header.writeUInt16LE(1,index+4);header.writeUInt16LE(32,index+6);header.writeUInt32LE(entries[i].length,index+8);header.writeUInt32LE(offset,index+12);offset+=entries[i].length}
await writeFile(new URL('../desktop/icon.ico',import.meta.url),Buffer.concat([header,...entries]));
console.log('Created desktop PNG and multi-resolution ICO.');
