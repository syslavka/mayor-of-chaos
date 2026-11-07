import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import {fileURLToPath} from "node:url";
import path from "node:path";
const root=fileURLToPath(new URL(".",import.meta.url));
export default defineConfig({
  root,
  base:"./",
  plugins:[react()],
  publicDir:path.resolve(root,"../public"),
  css:{postcss:{plugins:[tailwindcss()]}},
  build:{outDir:path.resolve(root,"../desktop-dist"),emptyOutDir:true,target:"es2022"},
});
