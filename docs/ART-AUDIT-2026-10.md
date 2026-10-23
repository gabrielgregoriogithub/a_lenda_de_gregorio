# Auditoria artística global — 2026-10

## Escopo

Foi revisada a linha histórica dos sprites e dos sistemas de renderização, com atenção aos commits `b1dd63f` (famílias novas do bestiário), `4bdd4d3` (fauna procedural) e `736a982` (detalhes de bioma). Os assets preservados foram comparados com os desenhos procedurais introduzidos depois; mecânicas, mapas, colisões e saves não foram revertidos.

## Classificação e decisão

| Grupo | Categoria | Decisão |
| --- | --- | --- |
| Slime, morcego, golem e chefes temáticos | A — asset bom | Preservados |
| Aranha, arqueiro, esqueleto, toupeira, xamã, brasa, serpente e caranguejo | C/D — inadequados ou sem asset próprio | Spritesheets transparentes de quatro frames em `public/art/enemies/` |
| Cavaleiro, escudeiro, lobo, salamandra, sombra, verme e fogo-fátuo | C — frames legados inferiores | Spritesheets próprios em `public/art/enemies/` |
| Pássaros, coelho, raposa, cervo, lebre, raposa ártica, ovelha | B — procedural simplificado | Atlas `public/art/ambient/mammals.png` e `birds.png` |
| Sapo, tartaruga, peixe e borboleta | B — procedural simplificado | Atlas `public/art/ambient/small-fauna.png` |
| Esquilo, macaco, lagarto, lagarto de fogo e escorpião | B — procedural simplificado | Atlas `public/art/ambient/reptiles.png` |
| Abelha, libélula, mariposas e vaga-lume | B — procedural simplificado | Atlas `public/art/ambient/insects.png` |
| Besouro e morcego ambiental | B — procedural simplificado | Atlas `public/art/ambient/cave-fauna.png` |
| Vaca e cavalo | B/D — procedural ou ausente | Assets dedicados `cow.png` e `horse.png` |
| Decoração dos biomas especiais | E — motivos geométricos pequenos | `biome-props.png` |
| Decoração dos demais biomas | E — variações procedurais repetitivas | `biome-props-full.png`, atlas 4×3 |
| Outono, cânion, queda estelar e cristal | E — motivos ainda repetitivos | `biome-props-late.png` |

## Integração

Os atlases usam transparência real, pixel snapping e `imageSmoothingEnabled=false`. O motor mantém fallback procedural durante o carregamento inicial e em testes Node. As imagens são pré-carregadas no módulo, reutilizadas por espécie/bioma e desenhadas em tamanho fixo para evitar reconstrução de arte a cada frame.

## Pendências reais

Não foi possível realizar captura manual em navegador conectado nesta execução. O build e os testes automatizados validam a integração, transparência e ausência de erros; uma inspeção em partida real deve confirmar o enquadramento visual final em cada resolução.
