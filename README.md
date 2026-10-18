# A Lenda de Gregório ✦ A Relíquia

Aventura de ação em pixel art e mundo aberto, feita em React + TypeScript + Canvas.

**Jogar:** https://gabrielgregoriogithub.github.io/a_lenda_de_gregorio/

## A jornada

Gregório começa no **Bosque de Elara**. Ao redor dele ficam as **Ruínas da Lua** (norte, com o templo), o **Deserto do Sol** (oeste), o **Lago da Lua** (leste) e a **Vila de Elara** (sul), além das Montanhas Geladas, da Floresta de Outono, do Pântano Sombrio e do Desfiladeiro Rubro nos cantos do mapa.

1. Converse com Iris e pegue a Chave Lunar no bosque.
2. Recupere os três Fragmentos Lunares (Deserto, Montanhas e Pântano), cada um guardado por um golem.
3. Desça os três andares do Templo da Lua: abismos no 1º andar, o golem e a Chave do Guardião no 2º, e a câmara original do guardião no 3º.

## Controles

| Ação | Teclado | Controle |
|---|---|---|
| Mover | WASD / setas | Analógico / direcional |
| Espada | J / Espaço | A |
| Golpe giratório | segurar J e soltar | segurar A |
| Atirar flecha (depois de achar o arco) | L | clique do analógico direito |
| Trocar flecha (fogo, luz, gelo) | T | clique do analógico esquerdo |
| Zoom da câmera | + / − (ou botões na tela) | |
| Interagir | E / Enter | B |
| Esquiva | Shift | X |
| Poção | Q | Y |
| Salto longo | K | LB |
| Voltar no tempo | segurar R | LT + RT |
| Acelerar | segurar F | RB |
| Menu (saves, filtros, trapaças) | M | |
| Pausar | Esc | Start |

## Desenvolvimento

```bash
npx --yes --package pnpm@11.25.0 pnpm install --frozen-lockfile
npx --yes --package pnpm@11.25.0 pnpm dev          # http://localhost:5173
npx --yes --package pnpm@11.25.0 pnpm build:pages  # versão estática em dist-pages/ (GitHub Pages)
```

- `lib/adventure.ts`: motor (movimento, combate, salto, andares, animações, saves e voltar no tempo)
- `lib/world.ts`: mundo aberto, regiões, NPCs e posições de baús e inimigos
- `app/page.tsx`: interface, HUD, menu e controles de toque
- `public/art/`: arte original (herói e atlas). As regiões só aplicam filtros de cor por cima dela.

Recursos de menu, saves, voltar no tempo, filtros e trapaças inspirados no [Moon Pearl](https://github.com/DoutorRaposo/moonpearl).
