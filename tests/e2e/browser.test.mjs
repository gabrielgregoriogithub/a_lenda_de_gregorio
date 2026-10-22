// Nível C — ponta a ponta no navegador real, sobre o build de produção (dist-pages) servido pelo Vite.
// Usa teclado e cliques de verdade; a página só expõe uma leitura do estado quando aberta com ?e2e.
// Rode com: pnpm test:e2e  (faz o build antes). Navegador: CHROMIUM_PATH, /opt/pw-browsers ou o do Playwright.
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {preview} from 'vite';
import {chromium} from 'playwright-core';

const ROOT=new URL('../../',import.meta.url).pathname;
const exe=process.env.CHROMIUM_PATH??['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p=>fs.existsSync(p));
let server,browser,base;
before(async()=>{
  assert.ok(fs.existsSync(ROOT+'dist-pages/index.html'),'rode pnpm build:pages antes (pnpm test:e2e já faz isso)');
  server=await preview({configFile:ROOT+'vite.pages.config.ts',preview:{port:0,strictPort:false,host:'127.0.0.1'},logLevel:'silent'});
  base=server.resolvedUrls.local[0].replace(/\/$/,'')+'/';
  browser=await chromium.launch(exe?{executablePath:exe}:{});
});
after(async()=>{await browser?.close();await new Promise(r=>server?.httpServer.close(r));});

// abre uma aba nova, registrando erros de console, exceções e requisições que falharam
async function open(init){const ctx=await browser.newContext({viewport:{width:1280,height:860}});if(init)await ctx.addInitScript(init);const page=await ctx.newPage(),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
  await page.goto(base+'?e2e');return {ctx,page,errors,failed,snap:()=>page.evaluate(()=>window.__lendaSnapshot?.())};}
const hold=async(page,key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);};

test('o build publicado abre, carrega todos os assets e começa uma campanha com o teclado',async()=>{
  const {ctx,page,errors,failed,snap}=await open();
  await page.getByRole('button',{name:/Começar aventura/}).click();
  await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');
  const a=await snap();await hold(page,'ArrowLeft',600);const b=await snap();assert.ok(b.x<a.x-30,'as setas movem o herói');
  await hold(page,'ArrowUp',600);const c=await snap();assert.ok(c.y<b.y-30);
  // conversa com Iris usando só o teclado: anda até ela e aperta E
  for(let i=0;i<40;i++){const s=await snap();if(/Iris/.test(s.hint))break;await hold(page,s.x>44*32+16?'ArrowLeft':'ArrowRight',60);const s2=await snap();if(!/Iris/.test(s2.hint))await hold(page,s2.y>40*32+40?'ArrowUp':'ArrowDown',60);}
  await page.keyboard.press('e');await page.waitForSelector('.dialogue-box');assert.match(await page.textContent('.dialogue-box'),/Chave Lunar/);
  await page.keyboard.press('e');const d=await snap();assert.equal(d.met,true,'falar com Iris conclui o primeiro passo');assert.match(d.objective,/Chave Lunar/);
  assert.deepEqual(failed,[],'nenhum asset falhou');assert.deepEqual(errors,[],'sem erros no console');await ctx.close();
});

test('pausa, perda de foco e retomada não deixam o herói andando sozinho',async()=>{
  const {ctx,page,errors,snap}=await open();await page.getByRole('button',{name:/Começar aventura/}).click();await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(200);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  const a=await snap();assert.equal(a.screen,'paused','perder o foco pausa');await page.waitForTimeout(400);assert.equal((await snap()).x,a.x);
  await page.keyboard.up('ArrowRight');await page.getByRole('button',{name:/Continuar aventura/}).click();await page.waitForTimeout(500);
  assert.ok(Math.abs((await snap()).x-a.x)<2,'a seta solta durante a pausa não fica presa');
  await page.keyboard.press('Escape');assert.equal((await snap()).screen,'paused');await page.keyboard.press('Escape');assert.equal((await snap()).screen,'playing');
  assert.deepEqual(errors,[]);await ctx.close();
});

test('fechar e reabrir o navegador continua a jornada pelo save automático',async()=>{
  const {ctx,page,snap}=await open();await page.getByRole('button',{name:/Começar aventura/}).click();await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');
  await hold(page,'ArrowLeft',500);const before=await snap();await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  await page.reload();await page.getByRole('button',{name:/Continuar jornada/}).click();await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');
  const after=await snap();assert.equal(after.zone,before.zone);assert.ok(Math.abs(after.x-before.x)<40,'volta onde parou');await ctx.close();
});

test('um save de versão anterior (v9) não é apagado e carrega com o progresso',async()=>{
  const save=fs.readFileSync(ROOT+'tests/fixtures/save-v9.json','utf8'),meta=JSON.stringify({data:save,location:'Terras do Norte',hp:6,maxHp:7,coins:321,fragments:1,elapsed:0,at:Date.now()});
  const {ctx,page,errors,snap}=await open(`localStorage.setItem('lenda-gregorio:data-version','9');localStorage.setItem('lenda-gregorio:auto',${JSON.stringify(meta)});localStorage.setItem('lenda-gregorio:settings',JSON.stringify({filter:'none',speed:1,zoom:1.3}));`);
  await page.getByRole('button',{name:/Continuar jornada/}).click();await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');
  const s=await snap();assert.equal(s.chapter,4);assert.equal(s.coins,321);assert.equal(s.boots,true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('lenda-gregorio:settings')!==null),true,'as configurações continuam');assert.deepEqual(errors,[]);await ctx.close();
});

test('save corrompido mostra o motivo e não impede começar uma jornada nova',async()=>{
  const meta=JSON.stringify({data:'{"v":10,"zone":',location:'?',hp:1,maxHp:6,coins:0,fragments:0,elapsed:0,at:Date.now()});
  const {ctx,page,errors,snap}=await open(`localStorage.setItem('lenda-gregorio:data-version','10');localStorage.setItem('lenda-gregorio:auto',${JSON.stringify(meta)});`);
  await page.getByRole('button',{name:/Continuar jornada/}).click();await page.waitForSelector('[role=alert]');assert.match(await page.textContent('[role=alert]'),/corrompido/);
  await page.getByRole('button',{name:/Nova jornada/}).click();await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');assert.equal((await snap()).screen,'playing');assert.deepEqual(errors,[]);await ctx.close();
});

test('armazenamento indisponível: o jogo roda e avisa que não pôde salvar',async()=>{
  const {ctx,page,errors,snap}=await open(`Storage.prototype.setItem=function(){throw new DOMException('cheio','QuotaExceededError');};`);
  await page.getByRole('button',{name:/Começar aventura/}).click();await page.waitForFunction(()=>window.__lendaSnapshot?.().screen==='playing');
  await hold(page,'ArrowRight',300);await page.keyboard.press('m');await page.getByRole('button',{name:/^Salvar$/}).first().click();
  await page.waitForFunction(()=>/Não foi possível salvar/.test(window.__lendaSnapshot?.().notice??''));assert.equal((await snap()).screen!=='dead',true);assert.deepEqual(errors,[]);await ctx.close();
});
