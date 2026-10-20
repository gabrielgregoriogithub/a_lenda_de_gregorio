// Resolve imports sem extensão (./world) para arquivos .ts, permitindo rodar o motor do jogo direto no Node.
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export async function resolve(specifier,context,next){
  if((specifier.startsWith('./')||specifier.startsWith('../'))&&!/\.[cm]?[jt]s$/.test(specifier)){
    const url=new URL(specifier+'.ts',context.parentURL);
    if(existsSync(fileURLToPath(url)))return next(url.href,context);
  }
  return next(specifier,context);
}
