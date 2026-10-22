# Auditoria técnica — A Lenda de Gregório

Registro da auditoria total de outubro de 2026: o que foi verificado, como verificar de novo e o que continua sendo limitação conhecida.

## Como verificar

| Verificação | Comando | O que cobre |
|---|---|---|
| Tipos | `pnpm typecheck` | TypeScript estrito, sem `@ts-nocheck` em nenhum arquivo |
| Estilo | `pnpm lint` | ESLint (Next + React Hooks), 0 erros e 0 avisos |
| Unidade e integração | `pnpm test` | `tests/game.test.mjs` (motor, mapas, jogador automático da campanha inteira) e `tests/regressions.test.mjs` (regressões da auditoria) |
| Navegador | `pnpm test:e2e` | build de produção servido pelo Vite e aberto no Chromium com teclado real |
| Balanceamento | `node --import ./tests/register.mjs tests/balance.mjs` | equipamento real do herói ao chegar em cada mapa e golpes para cada inimigo |
| CI | `.github/workflows/ci.yml` | roda tudo acima a cada push em `main` e publica o build no GitHub Pages |

## Inventário de missões opcionais

Todas as recompensas são únicas: o baú ou a flag fica gravado no save e a recompensa não se repete. Os puzzles de sequência podem ser repetidos à vontade até serem resolvidos; depois de abertos, os selos continuam abertos após salvar e carregar.

| Missão | Onde | Quem indica | Requisitos | Etapas | Guardiões | Recompensa | Persistência |
|---|---|---|---|---|---|---|---|
| Correio das Moedas | Gruta do Correio, Costa das Conchas | Nilo e mural | capítulo 2 | 3 sinos em ordem (toque) | Caranguejo-Correio e 2 morcegos | Anel do Ímã | flag `magnet` + baú `mail-magnet` |
| O Ensaio das Sombras | Teatro das Três Sombras, Floresta de Outono | Lenhadora e cartaz | capítulo 3 | 3 marcas em ordem (toque) | Mestre de Cena e 2 atiradores | Manto do Eco | `echoCloak` + baú `theater-cloak` |
| As Pedras do Vento | Desfiladeiro dos Ventos, Terras do Norte | Guardiã do Portão e marco | capítulo 3 | 3 pedras em ordem, saltando entre ilhas | cavaleiro e 2 lobos | Lâmina do Vento | `windBlade` + baú `gorge-wind-blade` |
| O Julgamento do Sino | Cripta do Sino, Montanhas Geladas | Eremita e inscrição | capítulo 4 | 3 sinos em ordem (toque) | Guardião do Sino e 2 sentinelas | Armadura de Granito | `armor` + baú `crypt-armor` |
| A Prova dos Quatro Elementos | Torre Rúnica, Campos Abertos | Viajante do Sul e pergaminho | capítulo 4 + flechas de Fogo, Gelo e Luz | 4 runas, cada uma com a sua flecha | cavaleiro de escudo, salamandra e 2 fogos-fátuos | Arco Rúnico | `runeBow` + baú `tower-rune-bow` |
| O Teste das Três Varinhas | Cofre das Varinhas, Deserto das Tempestades | Viajante do Sul e placa | capítulo 6 + 3 varinhas | 3 selos, cada um com a sua varinha | Verme das Areias e 2 sombras | Varinha das Varinhas | `wandMaster` + baú `vault-wand-master` |
| A Gruta das Botas Aladas | Terras do Norte | Diário e mural | — | 8 plataformas (1/3/5/7 fixas, 2/4/6/8 móveis); queda custa 1 coração e volta ao início | — | Botas Aladas | `boots` + baú `wingcave-boots` |
| Corrida do Anel Verde | Estrada do Sul, com Lia | Diário (pista opcional) | capítulo 3, 25 cristais por tentativa | vencer Lia | — | Bota do Vento | `swiftBoots`; a cobrança acontece uma vez por corrida |
| Corrida de Mestre | Estrada do Sul, com Lia | Diário | Bota do Vento, 25 cristais | vencer Lia mais rápida | — | Coração do Anel Verde (+1 coração) | `raceHeart` |
| A técnica do Eremita | Dojo do Eremita da Neve | Eremita | — | prova do dojo | — | Golpe Giratório | `spinUnlocked`; aviso ao obter |
| O segundo giro | Dojo do Eremita da Neve | aviso ao avançar o suficiente | progresso da campanha | voltar ao dojo | — | Giro do Mestre | `spinMasterUnlocked`, aviso `spinMasterNotified` |

O Diário mostra, na seção **Missões opcionais**, apenas as missões já descobertas (cenário visitado, pista recebida ou recompensa obtida), com o lugar e a recompensa quando concluída. A ordem dos puzzles nunca aparece ali; ela fica nos murais dentro de cada cenário. Há um teste que garante isso.

## Balanceamento (medido)

Medição com `tests/balance.mjs`: o jogador automático percorre a campanha inteira (capítulos 1 a 7, todos os baús) com a colisão real, e o equipamento é registrado na primeira chegada a cada mapa. Como ele abre todos os baús assim que pode, o herói medido é o **mais bem equipado possível** em cada ponto; um jogador real chega um pouco mais fraco.

| Mapa | Cap. | Poder da espada | Vida | Inimigos | Golpes p/ comum | Golpes p/ chefe |
|---|---|---|---|---|---|---|
| Cavernas 1 e 2 | 1 | 3 | 9–10 | 6 / 10 | 2–3 | — |
| Templo | 1 | 3 | 10 | 3 | 2 | 16 (chefe, 48) |
| Terras do Norte | 2 | 4 | 10 | 27 | 2 | — |
| Cidadela | 2 | 4 | 12 | 6 | 1 | 26 (colosso, 104) |
| Gruta da Maré | 3 | 4 | 13 | 4 | 2 | 18 (guardiã, 72) |
| Caminho do Eclipse | 3 | 4 | 13 | 6 | 2 | 12 (48) |
| Terras do Sul | 3 | 4 | 13 | 28 | 3 | — |
| Bastião | 4 | 4 | 15 | 7 | 2 | 24 (fera de pedra, 96) |
| Fortaleza | 4 | 4 | 15 | 7 | 2 | 12 (48) |
| Santuário | 5 | 4 | 16 + armadura | 5 | 2 | 12 (48) |
| Ninho | 6 | 4 | 17 + armadura | 6 | 3 | 12 (48) |
| Bosque Eterno | 7 | 4 | 17 + armadura | 6 | 2 | 33 (fera das vinhas, 132) |

Vale aberto: 104 inimigos; comuns com 2 a 5 de vida, golens com 8, elites com o triplo (9 a 15). Fim da campanha: poder 4, 18 corações, 6080 cristais ganhos. Compras únicas na loja e no mercador somam 2450.

**Leitura:**
- Inimigos comuns caem em 1 a 3 golpes durante todo o jogo, e o herói aguenta de 9 a 18 golpes (o dobro com a armadura). O risco vem dos padrões dos chefes e das elites, não do desgaste.
- O poder da espada chega ao máximo (4) no capítulo 2. Do capítulo 3 ao 6, os quatro chefes do tipo "chefe" têm a mesma vida (48); a diferença entre eles está nos padrões de ataque. Se os playtests indicarem que os chefes do meio do jogo ficaram fáceis, o ajuste natural é escalar essa vida por capítulo. Não alterei os números sem playtest humano.
- A economia é folgada: sobram cerca de 3600 cristais depois de todas as compras únicas. As poções (25) e as corridas com Lia (25 por tentativa) são os gastos recorrentes.
- `tests/regressions.test.mjs` trava essas faixas (vida de comuns até 10, elites até 15, chefes entre 40 e 140, compras únicas até metade da renda da campanha, dano de 1 coração ou meio com armadura) para que uma mudança acidental apareça nos testes.

## Saves

- Versão atual do save: 10. Saves das versões 7 a 9 são migrados (`migrateSave`) em vez de apagados; há saves reais das versões 8 e 9 em `tests/fixtures`, gerados com o motor antigo.
- A troca de versão dos dados (`DATA_VERSION`) só limpa caches e service workers. Saves e configurações continuam.
- Um save corrompido é recusado com o motivo na tela e o jogo atual não é alterado (o carregamento é atômico, com volta ao estado anterior). Os outros espaços de save não são tocados.
- Se o armazenamento estiver cheio ou bloqueado, o jogo continua e avisa que não pôde salvar.

## Bugs encontrados e corrigidos (todos com teste)

1. Salvar enquanto o herói erguia um coração gravava o baú como aberto sem o coração: o coração se perdia para sempre.
2. A corrida contra Lia podia cobrar 25 cristais duas vezes (interação por toque ou ações durante a corrida).
3. Perigos e zonas de chefes continuavam ativos no ponto de renascimento depois de uma morte.
4. Toda mudança de versão dos dados apagava todos os saves, e o motor recusava saves de versões anteriores.
5. Falha ao carregar era silenciosa e podia deixar o jogo em estado parcial.
6. O chão do vale usava o filtro de neve para todos os tiles desde a expansão de biomas; a região e o clima ficavam presos em "neve".
7. O `@ts-nocheck` em `lib/adventure.ts` e `app/page.tsx` escondia 48 erros reais de tipo (inclusive código morto de chefes e ramos que nunca rodavam).

## Limitações conhecidas

- Não houve playtest humano: o equilíbrio foi medido pelo motor (golpes, vida, economia) e pelo jogador automático, que usa a colisão real mas resolve combates sem medir a habilidade do jogador.
- Os detalhes de bioma são desenhados em pixel art no próprio código; não foram adicionados arquivos de imagem novos.
- O ambiente da auditoria não acessa `github.io` pela linha de comando; a publicação é conferida pelo estado remoto do branch `gh-pages` e pela página buscada externamente.
- A publicação automática pelo workflow depende de o repositório permitir que o `GITHUB_TOKEN` grave no branch `gh-pages` (Settings → Actions → Workflow permissions).
