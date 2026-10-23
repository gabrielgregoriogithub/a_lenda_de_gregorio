# Auditoria da fauna NPC — 2026-10-23

## Protegidos

- Aves do atlas amazônico existente (`birds.png`) — preservadas por segurança de origem e aparência.
- Borboletas (`small-fauna.png`, linha correspondente) — preservadas integralmente.

## Substituídos

| Espécie | Novo recurso | Fonte |
|---|---|---|
| deer | `plasticlife-herbivore.png` | `plasticlife-art/animals` |
| fox | `plasticlife-predator.png` | `plasticlife-art/animals` |
| arcticfox | `plasticlife-predator.png` | `plasticlife-art/animals` |
| chicken | `codequest-chicken.png` | `adi555j/codequest-rpg`, LPC |
| cow | `codequest-cow.png` | `adi555j/codequest-rpg`, LPC |
| sheep | `codequest-sheep.png` | `adi555j/codequest-rpg`, LPC |

## Mantidos por ausência de equivalente seguro

Coelho, lebre, esquilo, macaco, sapo, lagarto, escorpião, besouro, tartaruga, peixe, pato, garça, mariposa e demais insetos não protegidos continuam usando seus atlas atuais até existir um substituto que preserve a identidade da espécie. Nenhuma dessas criaturas foi trocada por um animal semanticamente incompatível.

## Compatibilidade

A alteração é apenas visual. A seleção de espécie, velocidade, fuga, natação, voo, distribuição por bioma e demais estados do mundo vivo permanecem no `ambient-data.ts`; somente o caminho de desenho e o recorte do spritesheet foram adaptados.
