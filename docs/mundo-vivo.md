# Mundo vivo — clima, fauna e ambiente

O vale continua se movendo mesmo com Gregório parado: árvores balançam, folhas caem, animais circulam, a água corre e o clima muda aos poucos. Tudo isso é **decorativo**: nada entra no save, na colisão, no combate ou nos puzzles.

## Onde fica

| Arquivo | O que faz |
|---|---|
| `lib/ambient-data.ts` | Configuração de cada bioma e de cada interior: vento, climas possíveis, fauna, folhas, partículas, pegadas, névoa, sons e eventos |
| `lib/ambient.ts` | O sistema: vento e rajadas, clima com transições, fauna com estados, partículas, reações ao herói, água/lava animadas, eventos e qualidade automática |
| `lib/ambient-sprites.ts` | Os animais em pixel art feitos de retângulos (sem imagens novas), por família: quadrúpedes, aves, insetos, peixes, sapos, tartarugas, morcegos |
| `lib/ambient-audio.ts` | Som ambiente sintetizado com Web Audio: leitos de vento, chuva, água e lava, mais chamados de animais e trovões |
| `lib/decor.ts` | Detalhes do chão; os que se movem (grama, flores, juncos, cogumelos, cristais) são desenhados a cada quadro pelo ambiente |

**Cenário novo:** basta usar um bioma existente ou criar uma entrada em `BIOME_PROFILE` (ao ar livre) ou `ZONE_PROFILE` (interior). Fauna, clima, sons, partículas e eventos passam a funcionar automaticamente nele.

## O que acontece em cada bioma

| Bioma | Clima | Fauna ambiente | Detalhes |
|---|---|---|---|
| Vila de Elara | sol, garoa, chuva | galinhas, pássaros, borboletas, abelhas, ovelhas | pólen, grama alta, grilos à noite |
| Bosque de Elara | sol, garoa, chuva, tempestade, névoa | coelhos, esquilos, pássaros, borboletas, veados, raposas | folhas caindo, raposa caçando coelho, animal bebendo no lago |
| Floresta de Outono | sol, garoa, chuva, névoa | esquilos, veados, raposas, corvos, coelhos | muitas folhas caindo, folhas levantadas pelos passos, redemoinhos |
| Montanhas Geladas | neve, nevasca, sol, névoa | lebres brancas, raposas árticas, corujas, aves | pegadas na neve, neve acumulando em árvores e pedras, nevasca reduzindo a visão |
| Deserto do Sol | sol, poeira, tempestade de areia | lagartos, escorpiões, besouros, abutres | pegadas na areia, redemoinhos, ondas de calor |
| Deserto das Tempestades | poeira, tempestade de areia, tempestade | lagartos, escorpiões, besouros, abutres, morcegos | vento forte e areia atravessando a tela |
| Desfiladeiro Rubro | sol, poeira | lagartos, abutres, besouros, corvos, lebres | areia rasteira, uivos à noite |
| Pântano Sombrio | névoa, garoa, chuva | sapos, libélulas, garças, peixes, mariposas | bolhas na água, vitórias-régias, coaxar |
| Ruínas da Lua | sol, névoa, garoa | corvos, lagartos, mariposas | poeira suspensa, morcegos |
| Terras de Cinza | cinzas, brasas | lagartos de fogo, mariposas de brasa, besouros | lava borbulhando, fumaça, tremores leves, ondas de calor |
| Lago da Lua | sol, garoa, chuva, névoa | patos, peixes saltando, libélulas, tartarugas, garças | correnteza, espuma nas margens, ave mergulhando para pescar |
| Floresta da Chuva | chuva, tempestade, névoa, sol | tucanos, araras, macacos, sapos, borboletas, vaga-lumes | gotas pingando das copas depois da chuva |
| Campos Abertos | sol, garoa, chuva, tempestade | ovelhas, vacas, lebres, abelhas, pássaros | grama alta ondulando em ondas de vento |
| Costa das Conchas | sol, garoa, névoa, tempestade | gaivotas, tartarugas, peixes | pegadas na areia, ondas na margem |
| Manguezal das Lanternas | névoa, chuva, garoa | garças, peixes, sapos, libélulas, corvos | raízes, bolhas |
| Picos do Céu | ventania, sol, neve | aves de montanha, abutres | nuvens passando, rajadas |
| Bosque de Cristal Vulcânico | sol, brasas | mariposas de cristal, lagartos de fogo | brilhos mágicos |
| Planície das Estrelas | sol, névoa, neve | mariposas de cristal, corujas, vaga-lumes | estrelas cadentes, motas brilhantes |
| Floresta das Trevas | névoa, garoa, tempestade | corvos, morcegos, mariposas, corujas | luz que oscila, sombras passando ao longe, folhas secas, rangidos |

Interiores também têm perfil: cavernas com gotejamento e eco, morcegos e poeira; cavernas de lava com brasas, tremores e borbulhar; grutas de água com bolhas e peixes; salões sombrios com esporos.

## Sistemas

- **Vento:** força média por bioma, oscilação lenta e rajadas ocasionais. Ele inclina árvores, arbustos, grama, flores e juncos, empurra folhas, poeira, neve, fumaça e as chamas das tochas. Cada planta tem fase e velocidade próprias, então nada balança em sincronia.
- **Clima:** cada bioma sorteia entre os seus estados com pesos, a cada 1 a 3 minutos. A intensidade muda devagar (no máximo 1/7 por segundo), então não há cortes bruscos. Ao trocar de bioma, um clima que não pertence ao novo lugar some antes de o novo começar. A chuva cria respingos, anéis na água e gotas nos passos, e escurece o céu. A tempestade traz relâmpagos com trovão. A neve acumula aos poucos nas árvores, pedras e arbustos e derrete depois.
- **Fauna:** cada animal tem estados simples: parado, explorando, comendo, descansando e fugindo, além de pousar, voar, pairar, nadar, saltar, subir em árvore, beber e atravessar. Os terrestres só pisam em chão livre e ficam a pelo menos 46 px de baús, portas, escadas, alavancas, tochas, totens e barreiras. Não são sólidos, então nunca bloqueiam o herói. Eles fogem também dos monstros.
- **Reações ao herói:**
  - aves pousadas levantam voo;
  - coelhos e sapos correm para arbustos;
  - esquilos sobem na árvore e descem depois;
  - galinhas correm batendo as asas e cacarejando;
  - insetos se dispersam;
  - a grama se abre para os lados;
  - os passos deixam pegadas na areia e na neve, levantam folhas no outono, areia no deserto, gotas nas poças e na chuva.
- **Eventos espontâneos:** acontecem a cada 22 a 60 segundos e nunca durante uma luta:
  - bando de pássaros;
  - raposa atrás de um coelho;
  - borboletas;
  - redemoinho;
  - rajada;
  - estrela cadente;
  - vaga-lumes;
  - animal bebendo água;
  - ave mergulhando para pescar;
  - sombra passando;
  - revoada de morcegos;
  - fumaça;
  - tremor.
- **Som:** leitos contínuos de vento, chuva, correnteza e lava com volume seguindo o clima e a água próxima, mais chamados curtos de animais em intervalos irregulares. À noite entram grilos, corujas, sapos e uivos. Nas cavernas os sons ganham eco. O som ambiente fica bem abaixo da trilha musical e desliga junto com o som do jogo.

## Desempenho

- No máximo 18 animais ao ar livre e 7 em interiores, mais um pequeno extra durante eventos.
- Os animais longe da câmera são removidos, e as partículas reaproveitam um conjunto fixo de 260.
- A grama viva é calculada uma vez por mapa, e só os tiles visíveis são desenhados.
- **Qualidade automática:** se o desenho passar de 16 ms por alguns segundos, o ambiente cai para metade de animais e partículas. Ele volta ao completo quando o desempenho se normaliza. Com "reduzir movimento" ativo no sistema, o jogo usa a qualidade leve e não treme a tela.
- Durante lutas de chefe, a intensidade do clima é limitada e os eventos param, para não atrapalhar a leitura dos ataques.
- **Medição** no navegador de teste (Chromium sem GPU), no início do jogo: em média 16,6 ms por quadro, ou seja 60 quadros por segundo, antes e depois desta mudança. A atualização do ambiente custa menos de 0,1 ms por quadro no motor.

## Limitações

- Não existem cachoeiras nem fogueiras nos mapas atuais, então esses efeitos não foram criados. As tochas acesas ganharam brasas, fumaça e chama irregular que se inclina com o vento.
- A neve acumulada aparece como cobertura nas árvores, pedras e arbustos, não no chão inteiro.
- Os sons são sintetizados; não foram adicionados arquivos de áudio.
- O efeito visual e sonoro foi conferido por capturas de tela e por testes, não por playtest humano com som.
