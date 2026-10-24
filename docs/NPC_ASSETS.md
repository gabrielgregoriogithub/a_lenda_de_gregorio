# Cadastro de assets de NPCs

## Política do projeto

Os NPCs importantes usam o sprite-base original já presente no projeto, com acessórios e silhuetas procedurais em `lib/adventure.ts`. Isso evita dependências externas em tempo de execução, mantém a escala do atlas e permite que cada profissão tenha uma leitura visual própria.

## Pesquisa de referências compatíveis

- [12x16 Top Down NPCs — 5yvalia](https://5yvalia.itch.io/rpg-type-retro-top-down-npc-sprites): CC0. Possui caminhada cardinal e partes modulares. Não incorporado porque a paleta de quatro cores e a escala 12×16 não combinam com o atlas atual.
- [NPC and Enemies — Refo](https://opengameart.org/content/npc-and-enemies-0): CC0. Spritesheet 12×16 com ciclos de caminhada. Não incorporado pelo mesmo motivo de escala e proporção.
- [Town Guards Vol.1 — hnnnnnnn](https://opengameart.org/content/free-pixel-art-guards-%E2%80%94-spearman-sword-shield-archer-heavy-guard-samples): amostra CC0. Adequado para guardas, mas a amostra publicada é direcional e não cobre todos os NPCs necessários.
- [Hero character sprite sheet — Fry](https://opengameart.org/content/hero-character-sprite-sheet): CC0. Referência de caminhada top-down, não usada como NPC porque é um sprite de herói.

Nenhum arquivo externo foi copiado para o projeto nesta revisão. As identidades novas são originais e estão catalogadas em `lib/npc-catalog.ts`.
