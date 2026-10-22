# A Lenda de Gregório ✦ A Relíquia

Aventura de ação em pixel art e mundo aberto, feita em React + TypeScript + Canvas.

**Jogar:** https://gabrielgregoriogithub.github.io/a_lenda_de_gregorio/

## A jornada

Gregório começa no **Bosque de Elara**. Ao redor dele ficam as **Ruínas da Lua** (norte, com o templo), o **Deserto do Sol** (oeste), o **Lago da Lua** (leste) e a **Vila de Elara** (sul), além das Montanhas Geladas, da Floresta de Outono, do Pântano Sombrio e do Desfiladeiro Rubro nos cantos do mapa.

1. Converse com Iris e pegue a Chave Lunar no bosque.
2. Recupere os três Fragmentos Lunares (Deserto, Montanhas e Pântano), cada um guardado por um golem.
3. Desça os três andares do Templo da Lua: abismos no 1º andar, o golem e a Chave do Guardião no 2º, e a câmara original do guardião no 3º.

**Missão opcional — Técnica Ancestral:** o Eremita da Neve (noroeste) conta sobre o Portão do Eco. Toque os quatro pilares na ordem Norte → Leste → Sul → Oeste, entre na Câmara do Eco, acenda os símbolos (Lua → Estrela → Sol → Vento), pise nas quatro placas do vento a tempo e abra o grande baú dourado para aprender o **Ataque Giratório** (dano da espada +2, atinge tudo em volta, não atravessa paredes).

**Terras do Norte:** a única entrada da Gruta da Maré fica na ruína do Astrônomo — entre na Caverna da Luz (Planície das Estrelas; abre depois do segundo chefe), leia o mural e acenda Sol → Lua → Estrela. A sequência errada apaga os símbolos; o selo aberto libera o cavaleiro que guarda as Flechas de Luz. Depois, desperte os dois totens da ruína. Com a Onda Arcana, a Caverna Submersa (opcional, sudoeste) tem um novo puzzle: Maré Baixa → Corrente → Maré Alta abre o selo do Arco Tríplice, guardado pelo Guardião das Correntes.

**Terras do Sul:** terceiro mundo aberto, alcançado pela Passagem Inundada (Terras do Norte) ou pela Estrada do Sul (Vale de Elara), ambas com a Onda Arcana. Cada canto é um cenário com clima e música próprios, e cada um guarda a entrada de uma masmorra independente — entra-se, vence-se o chefe e sai-se pela mesma porta para procurar a próxima:

| Cenário | Masmorra | Desperta no |
|---|---|---|
| Floresta das Trevas (noroeste) | Caminho do Eclipse | capítulo 3 |
| Floresta da Chuva (nordeste) | Bastião das Pedras | capítulo 4 (Varinha do Relâmpago) |
| Campos Abertos (sudoeste) | Santuário da Repulsão | capítulo 5 (Luvas da Força) |
| Deserto das Tempestades (sudeste) | Abismo dos Alvos Velozes | capítulo 6 (Varinha da Repulsão) |
| Campos Abertos (centro) | Fortaleza Esquecida (opcional) | com as Luvas da Força |

Ao vencer um chefe e continuar, Gregório fica onde está: o caminho até o próximo desafio é feito a pé.

## Sidequests e relíquias

**Nova evolução de combate:** após o capítulo 3, retorne à Câmara do Eco com o Ataque Giratório. O mural da Tempestade ensina uma prova de maestria: um único giro deve acertar três alvos. O baú libera a **Tempestade Ancestral** (segure J / Espaço por 1,35 s e solte; dano espada +5, alcance ampliado e efeitos de energia azul). Detalhes em [docs/sidequests-e-reliquias.md](docs/sidequests-e-reliquias.md).


O padrão de design, o catálogo de quests por equipamento, as pistas, puzzles, recompensas, dependências e checklist de QA estão em [docs/sidequests-e-reliquias.md](docs/sidequests-e-reliquias.md). A Caverna Submersa agora usa a sequência das Três Marés para abrir o cofre do Arco Tríplice; os testes de motor cobrem a sequência e o selo da Caverna da Luz.

## Controles

| Ação | Teclado | Controle |
|---|---|---|
| Mover | WASD / setas (no celular: joystick) | Analógico / direcional |
| Espada | J / Espaço | A |
| Ataque Giratório (depois de aprender a Técnica Ancestral) | segurar J até brilhar e soltar | segurar A |
| Atirar flecha (depois de achar o arco) | L | clique do analógico direito |
| Trocar flecha (fogo, luz, gelo) | T | clique do analógico esquerdo |
| Zoom da câmera | + / − (ou botões na tela) | |
| Interagir | E / Enter | B |
| Esquiva | Shift | X |
| Poção | Q | Y |
| Salto longo | K | LB |
| Voltar no tempo | segurar R | LT + RT |
| Acelerar | segurar F | RB |
| Mapa em tela cheia | N (ou botão do mapa; toque no mapa para voltar) | |
| Menu (saves, filtros, trapaças) | M | |
| Pausar | Esc | Start |

## Desenvolvimento

```bash
npx --yes --package pnpm@11.25.0 pnpm install --frozen-lockfile
npx --yes --package pnpm@11.25.0 pnpm dev          # http://localhost:5173
npx --yes --package pnpm@11.25.0 pnpm build:pages  # versão estática em dist-pages/ (GitHub Pages)
```

- `lib/adventure.ts`: motor (movimento, combate, salto, andares, animações, saves e voltar no tempo)
- `lib/world.ts`: mundo aberto, regiões, NPCs e posições de baús e inimigos
- `app/page.tsx`: interface, HUD, menu e controles de toque
- `public/art/`: arte original (herói e atlas). As regiões só aplicam filtros de cor por cima dela.

Recursos de menu, saves, voltar no tempo, filtros e trapaças inspirados no [Moon Pearl](https://github.com/DoutorRaposo/moonpearl).


**Nova exploração costeira:** a enseada oriental agora inclui o Manguezal das Lanternas. Acenda os três faróis com Flechas de Fogo na ordem A → B → C, abra o selo e enfrente o Leviatã para conquistar o Coração das Marés.


### Corrida do Anel Verde
A partir do capítulo 3, encontre Lia no Vale de Elara e inscreva-se por 25 cristais. Complete uma volta no circuito circular, acelere com ↑, use Shift para arrancar com fôlego e troque de faixa com ←/→ para evitar os fardos de feno. A vitória concede a Bota do Vento, que aumenta a velocidade de corrida de Gregório; depois, Lia aceita corridas de treino pelo mesmo preço.
