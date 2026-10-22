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
**Estado:** implementação em andamento no motor; a sequência Sol → Lua → Estrela e o cavaleiro foram adicionados. A validação de jogo ainda é necessária.

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
**Estado:** novo puzzle adicionado à Caverna Submersa; falta executar o teste completo no jogo.

- **Gancho:** a Caverna Submersa só aceita Gregório com a Onda Arcana. O mural diz: “A água recua, a corrente chama, a maré retorna”.
- **Ato I:** encontrar o mural perto da entrada.
- **Ato II:** ativar três marcos na ordem Maré Baixa → Corrente → Maré Alta. Errar reinicia os marcos; acertar remove o selo do salão nordeste.
- **Ato III:** derrotar o Guardião das Correntes, que alterna perseguição curta e uma onda radial. Esquivar da onda é a prova de combate.
- **Recompensa:** Arco Tríplice; cada disparo abre um leque de três flechas e funciona com flechas mágicas.
- **Uso posterior:** acertar vários alvos, quebrar grupos e combinar com Flecha de Gelo ou Fogo.
- **Critério de teste:** sem a Onda Arcana não entra; sem sequência não alcança o cofre; com sequência o baú é alcançável; o guardião não pode ser ignorado; o item é único e salvo.

### 6. Botas Aladas — O Bosque de Cristal
**Estado:** item e guardião existem; proposta de transformar a obtenção em percurso de domínio.

- **Gancho:** um cavaleiro guarda as botas numa clareira separada por um abismo.
- **Ato I:** pista da Guardiã do Portão aponta para o Bosque de Cristal.
- **Ato II:** primeiro salto longo opcional sobre um vão pequeno, com plataforma de retorno.
- **Ato III:** sequência de três plataformas com larguras diferentes; uma rota tem poção e outra leva ao cavaleiro. Não exigir que o jogador acerte um salto cego.
- **Recompensa:** Botas Aladas, que ampliam o salto.
- **Uso posterior:** cruzar o abismo até os Picos do Céu e alcançar o Amuleto da Brasa.
- **Regra de fairness:** cair deve devolver Gregório à última plataforma segura, com dano moderado e pista do ponto de salto, nunca ao começo de uma região longa.

### 7. Varinha do Relâmpago — O Caminho do Eclipse
**Estado:** baú e inimigos existem; os espelhos/totem já estão presentes na área.

- **Gancho:** o Astrônomo explica que fogos-fátuos ficam intangíveis e que o relâmpago procura um novo alvo.
- **Ato I:** derrotar ou contornar um fogo-fátuo para encontrar o baú da varinha.
- **Ato II:** alinhar três espelhos para fazer o relâmpago alcançar um totem distante. O jogador aprende a ler ângulos e alvos.
- **Ato III:** abrir a câmara do Guardião do Eclipse ativando dois selos; o chefe alterna armadura e vulnerabilidade, convidando o jogador a trocar espada, arco e varinha.
- **Recompensa:** Varinha do Relâmpago; raio em linha reta que ricocheteia entre inimigos próximos.
- **Uso posterior:** grupos de wisps e salas de espelhos. O puzzle não deve exigir que o jogador já possua a própria varinha que está tentando obter; a varinha é a recompensa do baú e os espelhos servem como tutorial opcional depois.

### 8. Armadura de Granito — A Prova do Bastião
**Estado:** desafio de combate implementado no código; ainda precisa de teste manual no jogo.

- **Gancho:** o baú exclusivo da Armadura fica na Ala Leste do Bastião das Pedras.
- **Prova:** três guardiões bloqueiam a recompensa: duas Sentinelas de Granito (cavaleiros) posicionadas na aproximação da ala e o Golem da Armadura junto ao baú. Todos precisam ser derrotados; enquanto qualquer um estiver vivo, interagir com o baú mostra a instrução para concluir a prova e não entrega o item.
- **Recompensa:** só depois dos três inimigos derrotados, o baú concede a Armadura de Granito, que reduz pela metade o dano recebido e altera a aparência de Gregório.
- **Independência:** a prova não exige Luvas, Manto ou outra recompensa do próprio Bastião.
- **Critério de teste:** confirmar que os três inimigos aparecem e podem ser derrotados sem a Armadura, que o baú permanece bloqueado enquanto qualquer guardião estiver vivo, que a redução de dano é exatamente 50% e que a recompensa persiste após salvar/carregar.

**Limite atual:** as sentinelas estão colocadas no mapa como encontro simultâneo; não foi criado sistema de ondas, mural, marcas no chão ou sequência dinâmica de salas.
### 9. Manto do Eco — O Vigia das Três Reverberações
**Estado:** quest dedicada planejada para o Bastião; o baú atual já é exclusivo, mas ainda usa o guardião wisp existente. O puzzle abaixo é especificação de implementação, não declarar como jogável até codificar e testar.

- **Gancho:** perto da ala oeste, uma inscrição no pedestal do Manto diz: “O eco não nasce do primeiro golpe, mas da resposta”. O diário do Bastião registra que o antigo vigia dispara três rajadas: uma direta, uma atrasada e uma em leque.
- **Ato I — Aprender o ritmo:** na antecâmara do Manto, o Vigia do Eco dispara uma sequência curta de projéteis. O jogador precisa observar e sobreviver a três padrões distintos: linha reta, rajada com pausa e leque. O pedestal acende uma marca após cada padrão ser evitado ou refletido.
- **Ato II — Devolver o eco:** com as três marcas acesas, o Vigia concentra um projétil azul lento. Gregório deve posicionar-se no caminho dele e deixar o Manto ancestral (a proteção do pedestal) refletir a esfera contra o próprio Vigia. O combate ensina o efeito que a recompensa terá, sem exigir o Manto que está sendo buscado.
- **Ato III — Câmara da Reverberação:** depois de vencer o Vigia, alinhar os três símbolos gravados no chão — Pulso → Pausa → Retorno. Erro reinicia só os símbolos; a luta e os padrões não reaparecem. O baú individual do Manto se abre.
- **Recompensa:** Manto do Eco. Ao equipá-lo, Gregório rebate automaticamente um projétil inimigo e a proteção recarrega em 6 segundos; o anel azul no personagem indica quando está pronto.
- **Uso posterior:** Fortaleza Esquecida e Santuário da Repulsão, onde refletir ou evitar projéteis oferece uma rota/abertura alternativa.
- **Fairness e persistência:** pistas no pedestal e no diário; dicas graduais; sequência não depende de timing de pixel; derrota permite tentar novamente; baú e quest persistem no save e não duplicam.
- **Critério de teste:** confirmar que o Vigia pode ser vencido sem o Manto, padrões legíveis, reflexão válida, símbolos e reinício, coleta única e persistência após salvar/carregar. Testar teclado, toque e controle.

### 9. Varinha da Repulsão — Santuário da Repulsão
**Estado:** orbe, botões e barreiras já existem.

- **Gancho:** um orbe está do outro lado de um fosso; empurrá-lo com as Luvas o joga no vazio.
- **Ato I:** encontrar a Varinha da Repulsão num baú protegido.
- **Ato II:** disparar o raio roxo da margem para empurrar o orbe até o primeiro botão.
- **Ato III:** contornar o muro e repetir o movimento até o segundo botão; o núcleo abre.
- **Recompensa:** Varinha da Repulsão; empurra inimigos, pedras e orbes à distância.
- **Uso posterior:** Abismo dos Alvos Velozes e placas de pressão.
- **Critério de teste:** a solução deve ser possível sem Luvas da Força; a força da varinha é o centro do puzzle, não um complemento dispensável.

### 10. Varinha Míssil e Varinha das Varinhas — Abismo dos Alvos Velozes
**Estado:** alvos, ponte de vento e recompensas já existem.

- **Gancho:** alvos flutuam em uma área de vento; espada e flechas comuns não os alcançam.
- **Ato I:** obter a Varinha Míssil no baú da entrada.
- **Ato II:** acertar três alvos de vento na ordem indicada pelo mural. O míssil persegue o alvo, mas o jogador ainda precisa escolher o momento de disparar.
- **Ato III:** derrotar o Guardião das Dunas e os inimigos voadores para materializar a ponte.
- **Recompensa principal:** Varinha Míssil; projétil teleguiado.
- **Recompensa opcional:** Varinha das Varinhas, na alcova do outro lado da placa de borda; amplifica varinhas.
- **Uso posterior:** atravessar o Abismo e abrir o caminho ao Santuário das Raízes.
- **Expansão futura:** introduzir um alvo que muda de posição entre disparos, mas manter uma janela longa o bastante para controles de toque.

### 11. Pena da Fênix — Fortaleza Esquecida
**Estado:** pedras, placas, Cartógrafo e guardião já existem; a pena está no cofre.

- **Gancho:** o Cartógrafo perdeu o mapa e pede ajuda para recuperar o atalho.
- **Ato I:** mover três pedras até três placas de pressão.
- **Ato II:** abrir a ala leste e derrotar o guardião do cofre.
- **Ato III:** abrir o baú opcional da Pena da Fênix.
- **Recompensa:** uma ressurreição automática com metade dos corações, consumida uma única vez.
- **Uso posterior:** exploração de masmorras longas e chefes com segunda fase.
- **Regra de fairness:** mostrar claramente que a pena foi consumida; não prometer ressurreição infinita nem duplicar após rewind/save.

### 12. Anel do Ímã e Lâmina do Vento — recompensas de exploração
**Estado:** itens já existem como pickups/baús; propostas de quest de descoberta.

- **Anel do Ímã:** pequenas trilhas de cristais conduzem a um baú fora da estrada. O puzzle é perceber o rastro de partículas e encontrar uma passagem que não exige combate. Recompensa: atrair cristais e corações caídos.
- **Lâmina do Vento:** uma sala opcional do Santuário da Repulsão apresenta arbustos alinhados e inimigos atrás de uma grade. Recompensa: golpe lança corte de ar e corta vegetação, abrindo uma rota alternativa.
- **Princípio:** quests de utilidade passiva ou combate também precisam de descoberta e payoff; não precisam sempre de chefe.

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
| Manto do Eco | Bastião das Pedras | projéteis |
| Varinha da Repulsão | Santuário da Repulsão | orbes e placas à distância |
| Varinha Míssil | Abismo dos Alvos Velozes | alvos de vento |
| Varinha das Varinhas | alcova do Abismo | aprimora todas as varinhas |
| Pena da Fênix | Fortaleza Esquecida | uma recuperação de emergência |
| Anel do Ímã | exploração opcional | coleta mais confortável |
| Lâmina do Vento | exploração opcional | cortes à distância e vegetação |

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
**Estado:** implementada no motor; teste automatizado adicionado, execução de jogo ainda pendente.

- **Momento:** após o capítulo 3, quando Gregório já conquistou o Ataque Giratório.
- **Gancho:** ao retornar à Câmara do Eco, o mural da Tempestade revela uma prova de maestria que não existia no primeiro treinamento.
- **Puzzle:** três alvos celestes estão alinhados na sala superior. Um único Ataque Giratório precisa alcançar os três. O selo desaparece e libera o baú da Tempestade Ancestral.
- **Recompensa:** Tempestade Ancestral, uma evolução do Ataque Giratório.
- **Entrada:** segure J / Espaço por 1,35 s (mais que o brilho normal) e solte. A carga maior é visualmente indicada por aura azul-clara, mais faíscas e oito raios de foco.
- **Balanceamento atual:** dano = poder da espada +5 (Ataque Giratório original: espada +2); raio de alcance aproximado de 138 px contra 82 px no golpe original; animação dura 0,72 s.
- **Impacto:** onda circular azul e branca, anéis de energia amplos, flash curto, tremor de câmera, partículas em leque e uma assinatura sonora grave seguida de tons ascendentes e um estalo agudo. O golpe continua bloqueado por paredes e exige linha livre para atingir inimigos.
- **Persistência:** spinMasterUnlocked é salvo e restaurado. A prova e o baú ficam resolvidos para evitar repetir ou duplicar a recompensa.
- **QA:** o teste cobre os três alvos, remoção do selo, pickup, persistência e dano/duração do golpe evoluído. Ainda é necessário validar a legibilidade do charge, o som com áudio habilitado e o percurso real em teclado, toque e controle.


## Expansão do Vale — Serra dos Sinos e Costa das Conchas
**Estado:** mapa e ganchos adicionados; percurso e clima precisam de validação em jogo.

- **Expansão:** o Vale de Elara passa de 96×72 para 128×96 tiles. A nova faixa oriental e meridional acrescenta rotas de altitude e costa, com estradas ligando as áreas antigas aos novos pontos de interesse.
- **Serra dos Sinos:** Téo, o Alpinista, dá a pista de uma travessia de cristas. O Coração da Serra fica em um baú próprio, guardado por um cavaleiro e acompanhado por uma patrulha de criatura da neve. A recompensa não está em um baú comum no caminho.
- **Costa das Conchas:** Marina, a Marinheira, aponta para três faróis. Acendê-los abre o selo da enseada; o Coração das Marés está separado e protegido por um guardião marítimo. Nilo, o Faroleiro, fornece uma pista de vento e rota costeira.
- **Fauna e clima:** o renderizador adiciona silhuetas ambientais de aves em passagem, pequenos animais saltando e macacos entre as copas; a costa usa ondas/espuma, a serra usa rajadas de vento, a floresta tropical usa chuva e o deserto mantém partículas de areia. Áreas vulcânicas usam partículas de brasa/erupção. Esses efeitos são decorativos e não devem bloquear colisão ou combate.
- **Limite de assets desta etapa:** a fauna ambiente é desenhada em canvas e os novos encontros usam tipos/sprites já presentes com paletas regionais. Spritesheets originais de animais, marinheiros e monstros costeiros ainda precisam ser adicionados separadamente para substituir os placeholders visuais.
- **QA:** confirmar caminhos até os dois corações, gatilhos dos faróis, combate obrigatório, limites do mapa, transição/save, desempenho dos efeitos e controles por toque. O teste automatizado verifica dimensões, NPCs, baús e guardiões, mas não substitui playtest.
