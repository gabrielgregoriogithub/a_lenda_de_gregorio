# Redistribuição de desafios e recompensas — 23/10/2026

## Escopo implementado

Esta alteração reduz a concentração de recompensas importantes em áreas internas sem
desmontar a progressão existente. A nova atividade usa o mapa aberto `world`, na
área das Ruínas da Lua, e preserva os IDs dos conteúdos para que saves anteriores
possam ser migrados.

| Recompensa ou desafio | Local anterior | Local implementado | Desafio |
|---|---|---|---|
| `heart-mountain` — Coração da Serra | Mundo aberto, nas cristas da montanha, em `(105,16)` | Pátio Partido das Ruínas da Lua, em `(38,20)` | Acender `ruins-court-torch-a`, `ruins-court-torch-b` e `ruins-court-torch-c`; derrotar o guardião externo `ruins-warden` |
| `phoenix` — Pena da Fênix | Cofre `fortress-vault` da Fortaleza Esquecida | Cofre `ruins-phoenix-vault` no mesmo pátio externo, em `(43,20)` | Abrir o selo dos três faróis e derrotar o guardião do pátio |
| `ruins-warden` — Guardião do Pátio Partido | Não existia no mundo aberto | Arena externa das Ruínas da Lua, em `(38,17)` | Elite terrestre com visual de guardião, 10 HP, arena cercada por quatro pilares |

## Compatibilidade e não duplicação

- A versão do save foi elevada de 10 para 11.
- Saves antigos mesclam os novos inimigos sem apagar mortes já registradas.
- A Fênix continua identificada pelo flag global `phoenix`.
- Quando um save antigo já possui a Fênix, o novo cofre aparece aberto.
- O antigo `fortress-vault` é removido da lista de recompensas disponíveis durante a
  migração; seu marco visual permanece na Fortaleza, mas agora entrega cristais.
- O Coração da Serra mantém o ID `heart-mountain`, evitando perda de estado de
  abertura em saves compatíveis.
- Nenhum chefe principal foi redesenhado ou teve sua flag global alterada. O novo
  guardião é uma elite externa (`golem` com arte de guardião), não um novo estado de
  chefe final.

## Estrutura da arena

O Pátio Partido usa três faróis, um selo/barreira e quatro pilares. O jogador precisa
resolver o pequeno puzzle ambiental antes de acessar os dois prêmios. A solução usa
os mesmos tipos de propriedades e regras de colisão do mundo atual, portanto não
introduz um segundo sistema de mapas ou de recompensas.

## Validação

- `tsc --noEmit`: aprovado.
- Teste da arena e da migração sem duplicação: aprovado.
- Solver de campanha completa: concluído com `DONE 597 true`.
- Teste existente de chegadas entre mapas: aprovado.

Esta entrega não cria novas cidades ou castelos; ela utiliza uma arena externa nas
Ruínas já existentes. Novas localizações arquitetônicas podem ser adicionadas em uma
etapa posterior sem alterar esta migração.
