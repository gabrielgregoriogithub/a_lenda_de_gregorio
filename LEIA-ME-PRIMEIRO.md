# Vale da Lua — projeto original completo

Este pacote contém o código-fonte original do jogo criado nesta conversa, com os mesmos assets da primeira versão publicada.

Jogo de referência: https://vale-da-lua-greg.gabrielgregorio10.chatgpt.site
Versão publicada: 1
Commit original: 5afb9f5c7a201457b935d193827e1f05f69809e2

## Como executar no Windows

1. Extraia TODO o arquivo ZIP para uma pasta, por exemplo `C:\Jogos\Vale-da-Lua`.
2. Instale o Node.js 22.13 ou superior, com npm disponível no PATH.
3. Clique duas vezes em `INICIAR-WINDOWS.bat`.
4. Na primeira execução, aguarde a instalação das bibliotecas; essa etapa exige internet.
5. Quando o servidor estiver pronto, abra `http://localhost:5173` no navegador.
6. Mantenha a janela do terminal aberta enquanto joga. Para parar, pressione Ctrl+C.

O iniciador usa a versão do pnpm declarada no projeto (11.25.0) e o arquivo de versões travadas. As dependências externas são baixadas na primeira execução. A pasta node_modules não é incluída, pois contém bibliotecas instaláveis e arquivos específicos do sistema operacional.

O jogo é um projeto de navegador em TypeScript e React/Canvas. Para editar, abra esta pasta no VS Code. O arquivo não é um projeto do Godot; não há arquivo project.godot.

## Execução manual

No terminal, dentro desta pasta:

```bash
npx --yes --package pnpm@11.25.0 pnpm install --frozen-lockfile
npx --yes --package pnpm@11.25.0 pnpm dev
```

Depois abra `http://localhost:5173`.

macOS/Linux: você também pode usar `bash INICIAR.sh`.

## Controles

- WASD ou setas: movimentar.
- J ou Espaço: atacar com espada e cortar arbustos.
- E ou Enter: conversar, abrir baús, ativar selos e entrar no templo.
- Shift: esquivar.
- Q: usar poção.
- Esc: pausar/continuar.

Converse com Iris, encontre a chave no bosque leste, entre no templo ao norte, ative os dois selos e derrote o guardião. Recolha a relíquia no altar para concluir a aventura.

## Onde está cada parte

- `lib/adventure.ts`: motor 2D, mapas, movimento, colisões, combate, inimigos e progressão.
- `app/page.tsx`: interface, HUD, inventário, diálogos e controles.
- `app/globals.css`: aparência e adaptação para diferentes telas.
- `public/art/hero.png`: spritesheet original do herói (quatro direções).
- `public/art/atlas.png`: spritesheet original de terrenos, objetos e inimigos.
- `public/favicon.svg`: ícone do jogo.
- `components/`, `scripts/`, `build/`, `vendor/` e configurações: estrutura original e suporte à execução.
- `pnpm-lock.yaml`: versões exatas das dependências.
- `ORIGEM-E-INTEGRIDADE.json`: identificação da versão e hashes SHA-256 de todos os arquivos originais.

Os dois spritesheets foram gerados com ImageGen e têm 1254 × 1254 pixels, com transparência.

## Fidelidade ao original

Todos os arquivos rastreados no commit original foram preservados byte a byte. Os únicos acréscimos deste ZIP são este guia, os dois iniciadores e o manifesto de integridade. O README.md original do starter também foi preservado; para rodar este jogo, siga primeiro este guia.

Não foram incluídas credenciais, tokens, cache de execução, histórico Git nem dependências já instaladas. O arquivo `.openai/hosting.json` preserva a identificação original do site e suas configurações; ele não contém uma chave de acesso.

Esta versão não salva o progresso entre sessões e não possui multiplayer. A execução local não precisa de conta ChatGPT nem chave de API.
