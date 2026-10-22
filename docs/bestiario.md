# Bestiário — A Lenda de Gregório

Código em `lib/bestiary.ts`; o motor (`lib/adventure.ts`) só chama `updateBeast`, `beastBlocks`, `beastOnLethal`, `drawBeastSprite` e as zonas de chão. A arte é pixel art desenhada em grade (3 px por pixel), no mesmo estilo do herói e do atlas.

## Famílias novas

Todo ataque tem aviso visual antes de acertar: um "!" vermelho, uma linha de mira, um círculo no chão ou uma aura.

| Família | Papel | Comportamento | Aviso | Fraqueza / estratégia |
|---|---|---|---|---|
| Aranha da Copa | emboscada | fica escondida (só os olhos aparecem), sai quando o herói chega perto e dá o bote | "!" e tremor por 0,5 s | fogo e giro; acertá-la escondida a desmascara |
| Goblin Arqueiro | atirador | mantém distância, recua se o herói avança e circula | linha de mira tracejada; ela trava (vermelha) 0,25 s antes do disparo | míssil e relâmpago; aproxime-se pelos lados |
| Esqueleto Guerreiro | perseguidor | persegue e ergue a espada antes do golpe; no primeiro golpe fatal desmonta e se remonta em 3 s | "!" e espada erguida por 0,45 s; anel vermelho mostra o tempo até remontar | luz e onda; golpeie os ossos no chão |
| Toupeira Escavadora | emboscada subterrânea | um monte de terra persegue o herói; enterrada, não sofre dano | o monte treme e um anel vermelho marca a área por 0,65 s | depois de sair fica exposta; a Onda Arcana a desenterra |
| Xamã do Brejo | suporte | foge do herói, cura aliados feridos (+2) ou faz brotar espinhos sob o herói | aura verde por 0,9 s; os espinhos piscam 0,8 s antes de ferir | fogo e luz; derrube-o primeiro |
| Brasa Viva | área | salta até o herói, incha, explode e deixa brasas no chão por 3 s; depois esfria | anel laranja por 0,75 s | imune a fogo, fraca a gelo e onda; ataque enquanto está fria |
| Serpente das Marés | atiradora aquática | mergulha (imune), reaparece em outro ponto da água e cospe três jatos em leque | bolhas e subida por 0,55 s | relâmpago; ataque durante a janela em que fica à tona |
| Caranguejo-Escudo | defensivo | anda de lado e vira devagar; a carapaça bloqueia golpes de frente; avisa e dá uma pinçada rápida | "!" por 0,5 s antes da pinçada | flanqueie; o giro, a onda e o relâmpago atravessam a carapaça; a Repulsão o vira de barriga |

## Encontros marcantes (elites)

Uma versão maior, com o triplo de vida, coroa e nome sobre a cabeça, aparece em várias regiões do Vale e paga quatro vezes mais cristais:

- **Aranha-Rainha:** Floresta de Outono.
- **Serpente Abissal:** Lago da Lua.
- **Toupeira Colossal:** Deserto do Sol.
- **Xamã Ancião:** Pântano Sombrio.
- **Rei Esqueleto:** Ruínas da Lua.
- **Capitão Goblin:** Desfiladeiro Rubro. Dispara três flechas.
- **Coração de Magma:** Terras de Cinza.
- **Caranguejo-Rei:** Costa das Conchas.

## Fauna por região

| Região | Comuns | Especiais |
|---|---|---|
| Bosque de Elara (início) | slime, morcego | aranha, goblin arqueiro |
| Lago da Lua | slime, cuspidor | serpente (elite) |
| Deserto do Sol | slime, cuspidor | toupeira (elite), arqueiro |
| Montanhas Geladas | morcego, slime | esqueleto, arqueiro, lobos da neve |
| Floresta de Outono | slime, morcego | aranha (elite), arqueiro |
| Pântano Sombrio | slime, morcego, cuspidor | xamã (elite), aranha, sombra |
| Ruínas da Lua | morcego | esqueleto (elite), arqueiro |
| Desfiladeiro Rubro | morcego | arqueiro (elite), toupeira |
| Serra/Picos | morcego | arqueiro, esqueleto, lobos |
| Terras de Cinza | morcego, cuspidor | brasa viva (elite) |
| Floresta da Chuva | slime, cuspidor | aranha, xamã |
| Campos Abertos | slime | arqueiro, toupeira |
| Deserto das Tempestades | morcego, cuspidor | toupeira, brasa viva |
| Costa e Manguezal | morcego | caranguejo (elite), serpente |
| Terras do Norte | cavaleiros, fogos-fátuos, cuspidores | brasa viva, aranha, arqueiro, esqueleto |
| Terras do Sul | sombras, lobos, vermes | esqueleto, xamã, aranha, arqueiro, toupeira, brasa viva |

Nas masmorras, também troquei slimes por:
- **Esqueletos:** Templo da Lua (1º e 3º andares) e Caverna da Luz.
- **Aranha:** a que guarda o coração do 1º andar.
- **Toupeira:** 2º andar do Templo.
- **Caranguejos:** Gruta da Maré, Caverna Submersa e Gruta do Correio.

Os slimes da Cidadela continuam, porque fazem parte do puzzle de gelo.

## Sprites redesenhados

Cavaleiro, cavaleiro de escudo, lobo da neve, salamandra, sombra, verme das areias e fogo-fátuo eram o sprite do golem ou do morcego recolorido, com formas geométricas por cima. Agora cada um tem pixel art própria, com dois quadros de passo quando faz sentido. Os sprites viram para a esquerda ou a direita conforme o movimento. Em cima e embaixo usam a mesma vista 3/4, como o resto do atlas. Slime, morcego, cuspidor, golem e os chefes continuam com a arte original.

## Chefes

Os chefes já tinham fases, fraquezas, introdução e derrota próprias e foram mantidos. As invocações passaram a usar as famílias novas:
- **Guardião de Pedra:** ganhou uma invocação de esqueletos na segunda fase.
- **Armadura Esquecida:** convoca esqueletos em vez de slimes.
- **Rei da Tempestade de Areia:** faz brotar toupeiras em vez de morcegos.
