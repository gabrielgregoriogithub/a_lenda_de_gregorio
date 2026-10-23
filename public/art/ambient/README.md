# Fauna ambiental — fontes e licenças

## Assets preservados

`birds.png` e as linhas de borboleta em `small-fauna.png` permanecem no atlas original do jogo. Eles são tratados como recursos protegidos e não foram substituídos nesta revisão.

## Assets integrados nesta revisão

- `plasticlife-herbivore.png`, `plasticlife-predator.png` e `plasticlife-wolf.png`: atlas derivados e redistribuídos pelo projeto [plasticlife-art/animals](https://github.com/plasticlife-art/animals), em `assets/sprites/`. O projeto documenta os atlas runtime como os recursos distribuíveis do jogo; os pacotes-fonte CraftPix não são copiados.
- `codequest-chicken.png`, `codequest-cow.png` e `codequest-sheep.png`: folhas LPC do [adi555j/codequest-rpg](https://github.com/adi555j/codequest-rpg), originalmente por Daniel Eddeland (daneeklu), sob CC-BY 3.0 / GPL 2.0+ conforme a documentação do projeto. Atribuição e link da submissão OpenGameArt são mantidos aqui para redistribuição.

## Integração

Os atlas `plasticlife-*` usam frames de 32px em quatro direções, com linhas para idle, caminhada, corrida, alimentação e morte. As folhas `codequest-*` usam três frames por direção em quatro linhas. O renderer mantém nearest-neighbor, escala proporcional e o comportamento de exploração/fuga existente.

Espécies sem equivalente exato (por exemplo coelho, sapo, peixe, réptil e insetos) continuam temporariamente nos atlas originais para não descaracterizar a espécie. Elas ficam registradas como pendência de arte, em vez de receberem um animal incompatível.
