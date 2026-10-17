// Build estático para https://gabrielgregoriogithub.github.io/a_lenda_de_gregorio/
import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

const root=fileURLToPath(new URL('.',import.meta.url));

export default defineConfig({
  root:`${root}pages`,
  base:'/a_lenda_de_gregorio/',
  publicDir:`${root}public`,
  plugins:[react()],
  resolve:{alias:{'@':root}},
  build:{outDir:`${root}dist-pages`,emptyOutDir:true},
});
