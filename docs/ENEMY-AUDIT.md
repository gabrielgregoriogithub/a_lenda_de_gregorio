# Auditoria de inimigos — recuperação seletiva

## Histórico consultado

O clone local contém a linha histórica que parte de `f9ca542` (retorno ao projeto React original), passa por `62aeb72` (chefes temáticos), `fd7f840` (acabamento visual), e chega aos commits recentes de expansão do mundo, incluindo `1fb518d` e `f038092`. Os hashes `b1dd63f21f`, `77b700bf3abdb45bed9ac1a40401dbf1bb37159a` e `37ad5cabbd` não existem nas referências locais deste clone; por isso não foram tratados como evidência disponível.

## Resultado objetivo

| Família | Antes | Ação | Mecânica preservada |
| --- | --- | --- | --- |
| Slime / spitter | Atlas pixel-art existente | Mantidos | Sim |
| Bat / wisp | Atlas e efeitos temáticos | Mantidos | Sim |
| Knight / shieldknight | Atlas com overlay de arma/escudo | Mantidos | Sim |
| Frostwolf | Corpo procedural compacto e pouco anatômico | Reconstruído com quadrúpede, focinho, orelhas, cauda e patas | Sim |
| Salamander | Elipse e chamas genéricas | Reconstruída com corpo reptiliano, olhos, cauda e crista | Sim |
| Shade | Círculo com olhos | Reconstruída como espectro com manto, braços e runa | Sim |
| Sandworm | Elipse segmentada simples | Reconstruído com segmentos, cabeça e mandíbula | Sim |
| Tidewarden | Aura e marcador geométrico | Reconstruído como criatura aquática com carapaça e pinças | Sim |
| Stonebeast / Colossus / Vinebeast / bosses | Assets e efeitos dedicados | Mantidos; referências de acabamento | Sim |

A renderização continua com `imageSmoothingEnabled=false`, CSS `image-rendering: pixelated`, tiles de 32 px e o sistema de zoom existente. Os oito sprites substitutos estão em `public/art/enemies/` e são spritesheets transparentes de quatro frames, carregados com fallback seguro para os testes sem DOM. Não foram alterados HP, dano, IA, colisões, mapas, progressão ou formato de save.

## Limitação de validação visual

O ambiente desta execução não disponibilizou um navegador/app conectado para captura de tela do jogo. O build de produção foi executado com sucesso e a inspeção dos assets existentes foi feita diretamente; a inspeção manual em partida real deve ser repetida no ambiente com navegador disponível.
