# Original goblin and shaman enemy artwork (2026-10-23)

## Integrated resources

| Game enemy | Integrated resource | Design |
|---|---|---|
| Goblin Archer | `public/art/enemies/goblin-archer-original.png` | hooded goblin, bow, quiver and crouched ranged stance |
| Goblin Captain / warrior variant | `public/art/enemies/goblin-warrior-original.png` | armored goblin with shield and axe |
| Swamp Shaman | `public/art/enemies/shaman-original.png` | frog-like swamp goblin, staff, bone charms and green magic |

These are original transparent 4x7 sheets: four facing directions in the columns and idle, movement, attack/cast, hit and defeat states in the rows. The renderer uses nearest-neighbor clipping and chooses the combat-state row while preserving the existing AI.

## Integration

- `lib/adventure.ts` loads the three original sheets with a versioned cache key.
- `lib/bestiary.ts` keeps the 4x7 animation layout, aiming line, cast ring and magic marker.
- AI, attacks, healing, thorn zones, hitboxes, HP, damage and names remain unchanged.
- The previous Ninja Adventure sheets and the former goblin/shaman assets are no longer loaded or distributed.
