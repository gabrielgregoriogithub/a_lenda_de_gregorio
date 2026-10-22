# Guia de sidequests e relíquias — A Lenda de Gregório

Este documento é o padrão de design para quests opcionais de equipamento. A referência principal é **Técnica Ancestral / Ataque Giratório**: a quest precisa existir no mundo, dar uma pista legível, pedir que o jogador aprenda uma mecânica, aumentar a complexidade sem esconder a solução por tentativa cega, entregar uma recompensa com apresentação e deixar a habilidade útil em áreas posteriores.

## Regras de qualidade para novas quests

1. **Pista em pelo menos dois lugares.** Uma fala ou mural dá a regra; o próprio espaço mostra a ordem, os símbolos ou o tipo de obstáculo.
2. **A mecânica é ensinada antes da prova.** A primeira sala tem poucos elementos; a sala final combina os mesmos elementos sob pressão.
3. **Erro custa tempo, não progresso.** Sequências erradas reiniciam símbolos, mas não removem itens, não causam dano gratuito e não fecham uma porta para sempre.
4. **A recompensa muda a exploração.** O item deve abrir uma rota, resolver um obstáculo recorrente ou oferecer uma opção de combate diferente. Baú com item sem contexto não conta como quest completa.
5. **O guardião tem uma leitura justa.** Mostrar investida, pausa de vulnerabilidade, projétil ou fase antes de exigir uma estratégia específica.
6. **Retorno e persistência.** Portas, símbolos, baús e itens conquistados devem permanecer resolvidos no save. Reentrar não pode duplicar item nem repetir a recompensa.
7. **Dicas graduais.** Primeiro apontar região; depois o mecanismo; por fim, a sequência. A solução completa deve estar disponível sem obrigar o jogador a procurar fora do jogo.
8. **Compatibilidade com controles.** Tudo que usa teclado também deve ser resolvível por toque e controle; nenhuma sequência depende de precisão de pixel impossível no celular.

## Catálogo de quests

Os estados abaixo distinguem conteúdo que já está no motor de propostas que ainda exigem implementação. Não tratar uma ideia deste guia como mecânica já disponível até ela ser codificada e testada.

### 1. Técnica Ancestral — Ataque Giratório
**Estado:** implementada; modelo de referência.

- **Gancho:** o Eremita da Neve fala de um antigo dojo escondido no gelo.
- **Ato I — Portão do Eco:** quatro pilares no vale são tocados na ordem Norte → Leste → Sul → Oeste. A pista vem do Eremita e do desenho circular do portão.
- **Ato II — Câmara do Eco:** mural e quatro símbolos (Lua → Estrela → Sol → Vento). Errar apaga a sequência.
- **Ato III — Prova do Vento:** quatro placas precisam ser pisadas dentro do limite de tempo. Correr é útil, mas o jogador deve escolher a rota e não só apertar um botão.
- **Recompensa:** pergaminho do Ataque Giratório, com revelação visual e tutorial de segurar/soltar o ataque.
- **Uso posterior:** dano em área, grupos de inimigos e cavaleiros que bloqueiam golpes frontais. Não atravessa paredes.
- **O que outras quests devem copiar:** rumor → exploração → puzzle em sequência → prova de domínio → recompensa que transforma combate.

### 2. Flecha de Fogo — O Primeiro Braseiro
**Estado:** implementada no primeiro andar do Templo da Lua.

- **Gancho:** o primeiro corredor tem duas tochas apagadas e uma passagem que não pode ser aberta com espada.
- **Ato I:** salto e exploração até o baú da flecha.
- **Ato II:** usar a Flecha de Fogo para acender tochas; o jogador aprende que flechas mágicas interagem com objetos, não só inimigos.
- **Ato III:** três alvos no corredor leste precisam ser atingidos com flechas comuns para destravar o baú de Fogo. A composição alterna alvos, morcegos e linha de tiro.
- **Recompensa:** Flechas de Fogo; queimam inimigos vulneráveis, acendem mecanismos e destroem vegetação.
- **Uso posterior:** abrir o segundo andar do templo, queimar a parede de madeira da Cidadela e ativar braseiros do Santuário das Raízes.
- **Expansão futura:** incluir um alvo atrás de uma grade e um espelho de fogo em uma sala opcional, sem transformar a quest inicial em requisito obrigatório para terminar o jogo.

### 3. Flecha de Luz — A Caverna da Luz
**Estado:** implementada e coberta por teste automatizado (ordem, reinício, selo e baú). A muralha da câmara foi fechada nas laterais para o selo não poder ser contornado.

- **Gancho:** o Astrônomo Errante descreve uma estrela que se esconde ao meio-dia.
- **Ato I:** entrar na Planície das Estrelas depois do segundo chefe e ler o mural.
- **Ato II:** ativar os símbolos Sol → Lua → Estrela. Uma ordem errada apaga apenas a sequência.
- **Ato III:** vencer o cavaleiro que protege o baú; depois usar a flecha em dois totens da ruína astral para abrir a entrada da Gruta da Maré.
- **Recompensa:** Flecha de Luz; energiza totens, quebra selos mágicos e revela caminhos astralmente ocultos.
- **Uso posterior:** os selos das Ruínas do Sol Afundado, os mecanismos do Caminho do Eclipse e os puzzles de espelho.
- **Critério de teste:** comprovar a entrada no capítulo correto, a ordem, o reinício, a abertura do selo, o combate, o pickup e a persistência após salvar/carregar.

### 4. Flecha de Gelo — O Terraço das Brasas
**Estado:** implementação existente na Cidadela da Aurora.

- **Gancho:** a Galeria dos Ecos ensina que fogo abre a madeira, mas não atravessa um lago de lava.
- **Ato I:** acender as duas tochas da galeria e queimar a parede de madeira (10 impactos de fogo).
- **Ato II:** alcançar o baú das Flechas de Gelo.
- **Ato III:** no Terraço das Brasas, congelar slimes e empurrá-los até dois botões. A sala exige leitura do impulso e do alinhamento.
- **Recompensa:** Flecha de Gelo; congela inimigos pequenos, cria superfícies temporárias em água e atordoa o Colosso.
- **Uso posterior:** criar ponte até a Arena do Colosso, interromper ameaças e preparar inimigos para empurrões.
- **Expansão futura:** incluir uma sala de gelo com duas rotas possíveis: uma segura e lenta, outra curta com inimigos que descongelam o caminho.

### 5. Arco Tríplice — As Três Marés
**Estado:** implementada e coberta por teste automatizado. A linha de água do salão norte virou parede com uma única passagem no selo, porque antes dava para saltar a água e contornar o puzzle.

- **Gancho:** a Caverna Submersa só aceita Gregório com a Onda Arcana. O mural diz: “A água recua, a corrente chama, a maré retorna”.
- **Ato I:** encontrar o mural perto da entrada.
- **Ato II:** ativar três marcos na ordem Maré Baixa → Corrente → Maré Alta. Errar reinicia os marcos; acertar remove o selo do salão nordeste.
- **Ato III:** derrotar o Guardião das Correntes, que alterna perseguição curta e uma onda radial. Esquivar da onda é a prova de combate.
- **Recompensa:** Arco Tríplice; cada disparo abre um leque de três flechas e funciona com flechas mágicas.
- **Uso posterior:** acertar vários alvos, quebrar grupos e combinar com Flecha de Gelo ou Fogo.
- **Critério de teste:** sem a Onda Arcana não entra; sem sequência não alcança o cofre; com sequência o baú é alcançável; o guardião não pode ser ignorado; o item é único e salvo.

### 6. Botas Aladas — A Gruta das Botas Aladas
**Estado:** implementada (`lib/wingcave.ts`) e coberta por teste automatizado com travessia real no motor.

- **Entrada:** o baú do Bosque de Cristal (Terras do Norte, posição 6,31) foi trocado pela entrada da gruta; o cavaleiro de pedra continua vigiando a entrada. Não há outra forma de obter as botas.
- **Gruta:** margem inicial segura, um abismo que não se atravessa andando e a margem das Botas Aladas do outro lado. Um aviso na entrada explica a regra.
- **Plataformas:** oito, numeradas de 1 a 8, separadas por vãos calculados para o salto comum (cerca de 115 px). As ímpares (1, 3, 5 e 7) são fixas. As pares se movem em ciclos senoidais previsíveis: 2 sobe e desce, 4 vai e volta, 6 sobe e desce, 8 vai e volta. Elas nunca se tocam e o herói é carregado junto com a plataforma em que está.
- **Ordem:** cada plataforma acende quando é alcançada na ordem certa; o baú só abre com a travessia 8/8.
- **Queda:** cair no abismo tira exatamente um coração, devolve o herói à entrada e reinicia o ciclo das plataformas. Uma trava curta impede penalidade repetida; sem corações, entra a tela de derrota que o jogo já usa.
- **Recompensa:** Botas Aladas pelo sistema de equipamentos existente, salvas no save e mantidas após a morte. Uma passagem na margem final leva de volta ao Bosque de Cristal.

### 7. Varinha do Relâmpago — O Caminho do Eclipse
**Estado:** baú e inimigos existem; os espelhos/totem já estão presentes na área.

- **Gancho:** o Astrônomo explica que fogos-fátuos ficam intangíveis e que o relâmpago procura um novo alvo.
- **Ato I:** derrotar ou contornar um fogo-fátuo para encontrar o baú da varinha.
- **Ato II:** alinhar três espelhos para fazer o relâmpago alcançar um totem distante. O jogador aprende a ler ângulos e alvos.
- **Ato III:** abrir a câmara do Guardião do Eclipse ativando dois selos; o chefe alterna armadura e vulnerabilidade, convidando o jogador a trocar espada, arco e varinha.
- **Recompensa:** Varinha do Relâmpago; raio em linha reta que ricocheteia entre inimigos próximos.
- **Uso posterior:** grupos de wisps e salas de espelhos. O puzzle não deve exigir que o jogador já possua a própria varinha que está tentando obter; a varinha é a recompensa do baú e os espelhos servem como tutorial opcional depois.

### 8. Armadura de Granito — O Julgamento do Sino (Cripta do Sino)
**Estado:** implementada num cenário próprio e coberta por teste automatizado. A Armadura saiu do Bastião das Pedras.

- **Entrada:** encosta sul das Montanhas Geladas, logo a sudeste do Eremita da Neve; desperta no capítulo 4.
- **Pistas:** o Eremita fala dos sinos debaixo da neve; a inscrição da cripta ensina Grave → Agudo → Médio; cada sino mostra o próprio tom.
- **Puzzle:** tocar os três sinos (que não estão em fila) na ordem Grave → Agudo → Médio. Erro apaga a sequência; acerto abre o portão da cripta.
- **Guardiões:** Guardião do Sino (cavaleiro) e duas Sentinelas de Granito (cavaleiros de escudo). O baú só abre com os três derrotados.
- **Recompensa:** Armadura de Granito, metade do dano recebido. Opcional: não é requisito de capítulo, porta ou chefe.
- **Bastião:** a antiga Prova do Bastião (duas sentinelas e o golem da Ala Leste) continua lá, mas agora guarda um cofre de cristais.

### 9. Manto do Eco — O Ensaio das Sombras (Teatro das Três Sombras)
**Estado:** implementada num cenário próprio e coberta por teste automatizado. O Manto saiu do Bastião das Pedras.

- **Entrada:** extremo leste da Floresta de Outono; desperta no capítulo 3. A Lenhadora menciona o teatro.
- **Puzzle:** marcas do palco Pulso → Pausa → Retorno (toque). Erro apaga as marcas, sem fechar o teatro; acerto ergue a cortina.
- **Guardiões:** Mestre de Cena (sombra) e dois atiradores que disparam projéteis: a luta ensina o que o Manto faz.
- **Recompensa:** Manto do Eco, rebate um projétil e recarrega em 6 s.

### 9-A. Varinha da Repulsão — Santuário da Repulsão
**Estado:** orbe, botões e barreiras já existem.

- **Gancho:** um orbe está do outro lado de um fosso; empurrá-lo com as Luvas o joga no vazio.
- **Ato I:** encontrar a Varinha da Repulsão num baú protegido.
- **Ato II:** disparar o raio roxo da margem para empurrar o orbe até o primeiro botão.
- **Ato III:** contornar o muro e repetir o movimento até o segundo botão; o núcleo abre.
- **Recompensa:** Varinha da Repulsão; empurra inimigos, pedras e orbes à distância.
- **Uso posterior:** Abismo dos Alvos Velozes e placas de pressão.
- **Critério de teste:** a solução deve ser possível sem Luvas da Força; a força da varinha é o centro do puzzle, não um complemento dispensável.

### 10. Varinha Míssil — Abismo dos Alvos Velozes
**Estado:** alvos, ponte de vento e recompensa existem.

- **Gancho:** alvos flutuam em uma área de vento; espada e flechas comuns não os alcançam.
- **Ato I:** obter a Varinha Míssil no baú da entrada.
- **Ato II:** acertar três alvos de vento na ordem indicada pelo mural.
- **Ato III:** derrotar o Guardião das Dunas e os inimigos voadores para materializar a ponte.
- **Alcova:** a alcova do outro lado da placa de borda agora guarda poções; a Varinha das Varinhas tem quest própria (seção 17).

### 11. Pena da Fênix — Fortaleza Esquecida
**Estado:** pedras, placas, Cartógrafo e guardião já existem; a pena está no cofre.

- **Gancho:** o Cartógrafo perdeu o mapa e pede ajuda para recuperar o atalho.
- **Ato I:** mover três pedras até três placas de pressão.
- **Ato II:** abrir a ala leste e derrotar o guardião do cofre.
- **Ato III:** abrir o baú opcional da Pena da Fênix.
- **Recompensa:** uma ressurreição automática com metade dos corações, consumida uma única vez.
- **Uso posterior:** exploração de masmorras longas e chefes com segunda fase.
- **Regra de fairness:** mostrar claramente que a pena foi consumida; não prometer ressurreição infinita nem duplicar após rewind/save.

### 12. Anel do Ímã e Lâmina do Vento
**Estado:** os dois saíram das cenas compartilhadas (Gruta da Maré e Santuário da Repulsão) e ganharam quests próprias; veja a seção 17. A alcova do Santuário agora guarda cristais.

## Matriz de dependências e uso posterior

| Recompensa | Quest/área | Abre ou melhora |
|---|---|---|
| Flecha de Fogo | 1º andar do Templo da Lua | tochas, madeira, Santuário das Raízes |
| Flecha de Gelo | Cidadela / Terraço das Brasas | slimes, ponte do Colosso |
| Flecha de Luz | Caverna da Luz | totens, selos, espelhos |
| Ataque Giratório | Câmara do Eco | grupos e cavaleiros |
| Botas Aladas | Bosque de Cristal | abismo dos Picos do Céu |
| Onda Arcana | Gruta da Maré | travessia para Terras do Sul |
| Arco Tríplice | Caverna Submersa | alvos múltiplos |
| Varinha do Relâmpago | Caminho do Eclipse | wisps e encadeamento de inimigos |
| Luvas da Força | Bastião das Pedras | pedras, placas e atalhos |
| Manto do Eco | Teatro das Três Sombras (Floresta de Outono) | projéteis |
| Armadura de Granito | Cripta do Sino (Montanhas Geladas) | metade do dano |
| Anel do Ímã | Gruta do Correio (Costa das Conchas) | coleta mais confortável |
| Lâmina do Vento | Desfiladeiro dos Ventos (Bosque de Cristal) | cortes à distância e vegetação |
| Arco Rúnico | Torre Rúnica (Campos Abertos, Sul) | disparo carregado com flechas mágicas |
| Varinha da Repulsão | Santuário da Repulsão | orbes e placas à distância |
| Varinha Míssil | Abismo dos Alvos Velozes | alvos de vento |
| Varinha das Varinhas | Cofre das Varinhas (Deserto das Tempestades) | aprimora todas as varinhas |
| Pena da Fênix | Fortaleza Esquecida | uma recuperação de emergência |
| Bota do Vento | Corrida do Anel Verde | velocidade de corrida |

## Checklist de implementação e QA

Para cada quest antes de marcar como concluída:

- [ ] NPC, mural ou diário aponta para a região e explica a motivação.
- [ ] O caminho e a entrada estão alcançáveis com os itens exigidos, sem teleportar para dentro de paredes.
- [ ] A pista é lida perto do mecanismo e existe uma dica gradual.
- [ ] A ordem correta abre a barreira; erro reinicia sem softlock.
- [ ] A recompensa só pode ser coletada uma vez.
- [ ] A recompensa aparece no inventário/HUD e tem texto de uso.
- [ ] O item resolve pelo menos um obstáculo posterior documentado.
- [ ] Salvar, carregar e voltar no tempo não duplicam nem apagam o desbloqueio.
- [ ] Teste teclado, toque e controle.
- [ ] Teste o percurso completo em jogo; testes de reachability sozinhos não validam sensação, leitura visual ou dificuldade.


## 13. Tempestade Ancestral — evolução do Ataque Giratório
**Estado:** implementada e coberta por teste automatizado.

- **Momento:** após o capítulo 3, quando Gregório já conquistou o Ataque Giratório.
- **Puzzle:** três alvos celestes no salão central da Câmara do Eco. Um único Ataque Giratório comum, no meio dos três, precisa alcançar todos; se acertar só alguns, eles se apagam e o jogador tenta de novo. O mural e o Diário descrevem exatamente isso (antes diziam para carregar mais o golpe, o que não correspondia ao motor).
- **Correção de mapa:** o mural ficava na frente da passagem do selo dos símbolos e bloqueava o caminho até as placas do vento; foi movido para o lado.
- **Recompensa:** Tempestade Ancestral (segure J / Espaço por 1,35 s e solte; espada +5, alcance ~138 px, onda azul). spinMasterUnlocked é salvo.

## Expansão do Vale — Serra dos Sinos e Costa das Conchas
**Estado:** mapa e ganchos adicionados; percurso e clima precisam de validação em jogo.

- **Expansão:** o Vale de Elara passa de 96×72 para 128×96 tiles. A nova faixa oriental e meridional acrescenta rotas de altitude e costa, com estradas ligando as áreas antigas aos novos pontos de interesse.
- **Serra dos Sinos:** Téo, o Alpinista, dá a pista de uma travessia de cristas. O Coração da Serra fica em um baú próprio, guardado por um cavaleiro e acompanhado por uma patrulha de criatura da neve. A recompensa não está em um baú comum no caminho.
- **Costa das Conchas:** Marina, a Marinheira, aponta para três faróis. Acendê-los abre o selo da enseada; o Coração das Marés está separado e protegido por um guardião marítimo. Nilo, o Faroleiro, fornece uma pista de vento e rota costeira.
- **Fauna e clima:** o renderizador adiciona silhuetas ambientais de aves em passagem, pequenos animais saltando e macacos entre as copas; a costa usa ondas/espuma, a serra usa rajadas de vento, a floresta tropical usa chuva e o deserto mantém partículas de areia. Áreas vulcânicas usam partículas de brasa/erupção. Esses efeitos são decorativos e não devem bloquear colisão ou combate.
- **Limite de assets desta etapa:** a fauna ambiente é desenhada em canvas e os novos encontros usam tipos/sprites já presentes com paletas regionais. Spritesheets originais de animais, marinheiros e monstros costeiros ainda precisam ser adicionados separadamente para substituir os placeholders visuais.
- **QA:** confirmar caminhos até os dois corações, gatilhos dos faróis, combate obrigatório, limites do mapa, transição/save, desempenho dos efeitos e controles por toque. O teste automatizado verifica dimensões, NPCs, baús e guardiões, mas não substitui playtest.

## 14. Manguezal das Lanternas — O Coração das Marés
**Estado:** bioma, puzzle sequencial e arte procedural costeira adicionados ao motor; precisa de playtest visual e de combate.

- **Exploração:** a faixa oriental do Vale inclui o Manguezal das Lanternas, com paleta e vegetação próprias.
- **Gancho:** Marina ensina a ordem Enseada (A) → Copa (B) → Ponta (C).
- **Puzzle:** acertar os três faróis com Flechas de Fogo nessa ordem. Errar apaga a sequência; o acerto final remove o selo da enseada.
- **Combate e recompensa:** o Leviatã da Enseada continua protegendo o Coração das Marés. O puzzle abre o acesso, mas não entrega o coração sem derrotar o guardião.
- **Assets:** caranguejos costeiros e Leviatã usam sprites pixel-art desenhados em Canvas, com silhuetas e paletas próprias.
- **QA automatizado:** verifica bioma, reinício por ordem errada, abertura do selo e bloqueio da recompensa. Ainda precisa validar trajeto, leitura dos faróis, combate e controles no jogo.

## 15. Corrida do Anel Verde — A Bota do Vento
**Estado:** implementada e coberta por teste automatizado (inscrição, vitória, derrota, faixas e Corrida de Mestre).

- **NPC e acesso:** Lia fica perto da Estrada do Sul no Vale e aparece a partir do capítulo 3. A Bota do Vento só vem da vitória.
- **Inscrição:** 25 cristais por tentativa, cobrados só quando há saldo.
- **Circuito:** uma volta no Anel Verde contra Lia, montada. Três fardos de feno em faixas diferentes (meio, externa, meio). A faixa do meio é a linha mais rápida (as outras custam 4% de ritmo), então o jogador precisa ler a pista e voltar ao meio depois de desviar.
- **Equilíbrio (simulado com o motor):** só acelerar no meio bate em dois fardos e perde; desviar no tempo certo vence; desviar e usar a arrancada vence com folga.
- **Corrida de Mestre:** com a Bota, Lia corre 16% mais rápido. Vencer concede um Coração uma única vez (raceHeart salvo); só ganha quem desvia cedo e usa bem o fôlego.
- **Referência de design:** gerenciamento de aceleração e fôlego das corridas de chocobo de Final Fantasy VII; percurso, NPC, arte e economia são próprios do jogo.

## 16. Distribuição das relíquias
**Estado:** concluída. Nenhuma masmorra entrega dois equipamentos especiais (a única exceção é a Câmara do Eco, que guarda o Ataque Giratório e, depois do capítulo 3, a sua evolução). Um teste automatizado garante isso.

## 17. Seis relíquias com cenário próprio
**Estado:** implementadas em `lib/sidequests.ts`, com mapas, portas, murais, sequências, guardiões, objetivos do Diário e teste automatizado de ponta a ponta para cada uma (entrada, ordem errada, sequência certa, selo, guardiões, baú, save e não duplicação).

| Relíquia | Cenário | Entrada | Desperta | Sequência | Guardiões |
|---|---|---|---|---|---|
| Anel do Ímã | Gruta do Correio | Costa das Conchas, ao sul do farol de Nilo | cap. 2 | Concha → Âncora → Farol (toque) | Caranguejo-Correio e dois morcegos |
| Manto do Eco | Teatro das Três Sombras | leste da Floresta de Outono | cap. 3 | Pulso → Pausa → Retorno (toque) | Mestre de Cena e dois atiradores |
| Lâmina do Vento | Desfiladeiro dos Ventos | sul do Bosque de Cristal | cap. 3 | Leste → Oeste → Centro, saltando entre ilhas | cavaleiro e dois lobos |
| Armadura de Granito | Cripta do Sino | sul das Montanhas Geladas | cap. 4 | Grave → Agudo → Médio (toque) | Guardião do Sino e duas Sentinelas |
| Arco Rúnico | Torre Rúnica | oeste dos Campos Abertos | cap. 4 + Fogo, Gelo e Luz | Brasa (fogo) → Geada (gelo) → Aurora (luz) → Eco (comum) | cavaleiro de escudo, salamandra e dois fogos-fátuos |
| Varinha das Varinhas | Cofre das Varinhas | Deserto das Tempestades | cap. 6 + três varinhas | Relâmpago → Míssil → Repulsão | Verme das Areias e duas sombras |

- **Pistas:** NPC próximo (Nilo, Lenhadora, Guardiã do Portão, Eremita e Viajante do Sul), mural na entrada com a ordem exata, rótulo em cada marco e o Diário, que mostra o próximo passo.
- **Meio errado:** atirar a flecha ou a varinha errada numa runa não apaga a sequência; só explica qual meio ela aceita. A ordem errada apaga os marcos.
- **Progressão:** nenhuma dessas relíquias é exigida por porta, capítulo ou chefe. A Varinha do Relâmpago permaneceu no Caminho do Eclipse.
- **Limites desta etapa:** os guardiões usam tipos de inimigo já existentes, com paletas próprias; não foram desenhados sprites novos. O equilíbrio de dano foi validado pelo motor e pelos testes, não por playtest humano.
