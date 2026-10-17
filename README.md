# A Lenda de Gregório ✦ A Relíquia Lunar

Aventura de ação em pixel art no estilo dos Zeldas clássicos de 16 bits, feita só com HTML, CSS e JavaScript (sem bibliotecas, sem servidor).

A lua se apagou sobre o Vale de Elara. Gregório, filho do ferreiro, precisa encontrar a chave do bosque, atravessar a Caverna do Eco, ativar os selos do Templo da Lua e despertar a Relíquia Lunar.

## Como jogar

Abra o `index.html` no Chrome, Edge ou Firefox e clique em **Começar aventura**.

| Ação | Teclado | Controle |
|---|---|---|
| Mover | WASD / setas | Analógico / direcional |
| Espada | J / Espaço | A |
| Interagir | E | B |
| Esquivar | Shift | X |
| Poção | Q | Y |
| Voltar no tempo | segurar R | LT + RT |
| Acelerar | segurar F | RB |
| Menu | Esc / M | Start |
| Pausar | P | Select |

No celular aparecem controles de toque (direcional + botões).

## Capítulos

1. **Vila de Elara**: fale com Iris, abra o baú e pegue a chave do bosque.
2. **Bosque de Elara**: corte os arbustos e encontre a entrada da caverna.
3. **Caverna do Eco**: caverna escura com morcegos, chaves pequenas, portas trancadas e um Coração Lunar.
4. **Templo da Lua**: ative os dois selos, derrote o guardião (que dispara orbes lunares) e alcance o altar.

## Recursos

Inspirados no [Moon Pearl](https://github.com/DoutorRaposo/moonpearl), o port para Android de *A Link to the Past*:

- **Menu no jogo** com 3 espaços de save, ir para o início de qualquer capítulo já alcançado e novo jogo.
- **Salvamento automático** ao sair da página, com botão **Continuar** na tela inicial.
- **Voltar no tempo**: segure R para retroceder até ~60 segundos de jogo. Também funciona depois de morrer.
- **Avanço rápido** em 2×, 3× ou velocidade máxima.
- **Filtros de imagem**: pixels nítidos, suave, CRT (scanlines) e LCD.
- **Trapaças**: vida infinita, atravessar paredes, chaves infinitas e carteira cheia.
- **Controle** (Xbox, PlayStation e outros) e **toque** com vibração.
- Moedas e corações caem de inimigos e arbustos; Iris vende poções por 10 moedas.

## Arquivos

- `index.html`: estrutura da página
- `style.css`: visual, filtros e controles de toque
- `game.js`: toda a lógica do jogo
