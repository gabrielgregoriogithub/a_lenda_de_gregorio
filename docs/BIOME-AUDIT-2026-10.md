# Auditoria de biomas e tilesets — 2026-10

## Arquitetura encontrada

O mundo usa tiles de 32 px, mapas em `lib/world.ts`, cache de chão em `Adventure.groundLayer()` e decoração determinística em `lib/decor.ts`. A base antiga tinha um atlas próprio para o terreno, filtros de cor por bioma e motivos procedurais pequenos. A revisão preserva essa base e acrescenta uma camada de tileset externo real, sem alterar os índices de mapa ou colisões.

## Classificação

| Grupo | Categoria | Tratamento |
| --- | --- | --- |
| Atlas protegido de personagens aprovados | A | Preservado |
| Terreno base e cache de chão | B | Preservado como fallback e harmonizado com os tilesets |
| Floresta, tropical, outono, mangue, costa, lago, planície e vila | C/E | Camada `forest-tilemap-cc0.png` com grama, água e caminhos |
| Deserto, neve, vulcão, pântano, ruínas, cristal, céu, starfall, darkwood e cânion | C/E | Camada `punyworld-overworld-tileset.png` + decoração específica por atlas |
| Decorações de 19 biomas | C/D | Atlases `biome-props.png`, `biome-props-full.png` e `biome-props-late.png` |
| Cavernas e masmorras | B/C | Paredes, lava e colisões existentes preservados; nova camada externa fica limitada ao mundo aberto para não quebrar puzzles internos |

## Referências

O repositório `bastiao_do_vale` foi inspecionado como referência de composição amazônica: camadas de chão, rios, floresta, açaí, helicônias, árvores tropicais e fauna regional. A inspiração foi aplicada à densidade/organização visual, sem copiar código ou arte.

Os tilesets incorporados estão documentados em `public/art/tilesets/README.md`, com fonte, autor e licença CC0.

## Limitação de validação visual

O build estático foi gerado com sucesso, mas o teste E2E de navegador não pôde iniciar neste ambiente porque `playwright-core` não está instalado/visível. Os testes de motor, fauna, colisões e build passaram; a inspeção manual em navegador deve ser repetida em ambiente com Chromium disponível.
