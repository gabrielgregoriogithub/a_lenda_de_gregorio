# Cobertura de assets de criaturas

## Categorias protegidas

Estas referências foram preservadas sem alteração artística nesta revisão:

| Categoria | Recurso de referência | Blob SHA-1 atual |
| --- | --- | --- |
| Slime, morcego e golem | `public/art/atlas.png` | `0d6d6b817649c327a8a25bc335dfdbb9a6e255cc` |
| Chefes | `public/art/bosses-themed.png` | `832607200bb3a377b0d262987ba9785e7f78804f` |

Os mesmos blobs estão registrados no commit histórico `62aeb72`, confirmando que a revisão dos demais assets não alterou as categorias aprovadas.

## Cobertura substituída

- Bestiário de combate não protegido: aranha, arqueiro, esqueleto, toupeira, xamã, brasa, serpente, caranguejo, cavaleiro, escudeiro, lobo, salamandra, sombra, verme e fogo-fátuo.
- Família goblin: `public/art/enemies/goblins.png`, com linhas próprias para arqueiro, guerreiro, xamã e capitão.
- Fauna ambiental: 37 espécies mapeadas para `public/art/ambient/` por atlas, incluindo aves, mamíferos, répteis, anfíbios, insetos, peixes, animais aquáticos, besouro, morcego, vaca e cavalo.
- Biomas: 19 biomas do mundo recebem decoração de atlas em `public/art/biome-props*.png`; o terreno e as colisões existentes permanecem intactos.

## Regra de integração

As espécies substituídas não devem voltar ao desenho procedural como solução final. O procedural permanece somente como fallback de carregamento/execução sem DOM; no jogo, os atlases são pré-carregados pelo `Adventure`, registrados no renderer e causam redraw quando terminam de carregar.
