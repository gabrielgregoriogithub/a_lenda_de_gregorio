# Guia de direção artística — A Lenda de Gregório

Este documento registra o padrão visual recuperado para impedir novas regressões.

## Padrão mínimo

- A silhueta deve identificar a espécie sem depender da cor.
- O sprite precisa ter contorno escuro, plano de sombra, luz principal e pelo menos um detalhe temático legível em tamanho real.
- Anatomias diferentes não devem compartilhar o mesmo corpo recolorido: quadrúpedes têm patas e focinho; voadores têm asas; espectros têm véus e membros dissolvidos; elementais têm núcleo e partículas.
- Blocos, polígonos e curvas devem usar coordenadas inteiras. O canvas usa `imageSmoothingEnabled = false` e o CSS usa `image-rendering: pixelated`.
- Filtros de bioma podem ajustar a paleta, mas não podem substituir o desenho do personagem.

## Escala e renderização

O mundo usa tiles de 32 px. Criaturas comuns aparecem entre 42 e 66 px; inimigos pesados entre 74 e 112 px; chefes usam assets dedicados e uma escala própria. Toda nova arte deve ser verificada na escala normal de jogo, com zoom e em cenário claro/escuro.

## Famílias recuperadas nesta revisão

As oito famílias do bestiário introduzidas em `b1dd63f` agora usam spritesheets originais em `public/art/enemies/`, com quatro frames transparentes por criatura. Os PNGs são carregados com pixel snapping e substituem os mapas procedurais do commit coautorado pelo Claude.

- `frostwolf`: quadrúpede com focinho, orelhas, cauda e patas articuladas.
- `salamander`: corpo reptiliano segmentado, olhos, cauda e crista de fogo.
- `shade`: manto espectral, braços dissolvidos, olhos e runa central.
- `sandworm`: segmentos repetidos, cabeça emergente, olhos e mandíbula.
- `tidewarden`: carapaça aquática, pinças e olhos expressivos.

Chefes continuam usando `public/art/bosses-themed.png`, que é a referência de acabamento e contraste superior. O atlas base em `public/art/atlas.png` permanece para terreno, NPCs e criaturas clássicas preservadas.

Fauna ambiental revisada usa `public/art/ambient/birds.png`, `mammals.png`, `small-fauna.png`, `reptiles.png`, `insects.png`, `cave-fauna.png`, `cow.png` e `horse.png`. A decoração usa `public/art/biome-props.png`, `biome-props-full.png` e `biome-props-late.png` para dar identidade própria aos biomas. Esses assets são originais, transparentes e divididos em células de atlas; a implementação mantém fallback apenas para carregamento inicial e execução sem DOM.

## Animação

Idle deve comunicar respiração, flutuação, chama ou deslocamento de peso. Ataques devem conservar antecipação e recuperação já implementadas pela simulação. A arte pode responder a `timer`, `hit`, `frozen` e `dying`, mas não deve alterar IA, dano, hitbox, progressão ou saves.

## Checklist para novos inimigos

1. Nomear a família e o bioma.
2. Desenhar a silhueta em uma cor só.
3. Adicionar anatomia, contorno, sombra, luz e detalhe de identidade.
4. Implementar idle/ataque/dano/morte sem reconstruir o desenho a cada frame de forma desnecessária.
5. Conferir contraste e legibilidade em tamanho real.
6. Executar `pnpm lint`, `pnpm test` e `pnpm build` antes de publicar.

Não aceitar placeholders geométricos como arte final e não criar variantes apenas por recoloração quando a espécie exigir anatomia diferente.
