# Creature asset coverage

## Protected categories

These approved resources remain unchanged:

| Category | Reference |
| --- | --- |
| Slime, bat and golem | `public/art/atlas.png` |
| Bosses | `public/art/bosses-themed.png` |

## Replaced coverage

- Unprotected combat bestiary: spider, archer, skeleton, mole, shaman, magmite, serpent, crab, knight, shield knight, wolf, salamander, shade, sandworm and wisp.
- Goblin and shaman family: original sheets in `public/art/enemies/goblin-*-original.png` and `public/art/enemies/shaman-original.png`.
- Ambient fauna: atlas-based assets in `public/art/ambient/`, with the protected Amazon birds and butterflies retained.
- Biome decoration: existing biome atlas resources remain integrated while terrain and collisions stay intact.

## Rendering rule

Replaced species must not return to the old procedural drawing as the final in-game representation. Procedural rendering remains only as a non-DOM fallback; the browser preloads the image assets through `Adventure` and redraws after loading.
