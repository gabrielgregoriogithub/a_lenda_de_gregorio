# Enemy asset swap: goblin and shaman (2026-10-23)

## Integrated resources

| Game enemy | Integrated resource | Origin |
|---|---|---|
| Goblin Archer | `public/art/enemies/ninja-adventure-archer.png` | `pixel-boy/NinjaAdventure`, `content/character/ninja_blue/sprite.png` |
| Goblin Captain / warrior variant | `public/art/enemies/ninja-adventure-goblin.png` | `pixel-boy/NinjaAdventure`, `content/character/samurai_green/samurai_green.png` |
| Swamp Shaman | `public/art/enemies/ninja-adventure-shaman.png` | `pixel-boy/NinjaAdventure`, `content/character/samurai_blue/sprite.png` |

These are 4x7 Ninja Adventure sheets: four directions in columns and idle, movement, attack and special states in rows. The renderer selects the row for the current combat state while preserving the existing combat behavior.

## Integration

- `lib/adventure.ts` loads each resource separately; the former goblin atlas is no longer loaded.
- `lib/bestiary.ts` clips the 4x7 layout with nearest-neighbor rendering and keeps the aiming and casting effects.
- AI, attacks, healing, thorn zones, hitboxes, HP, damage and names remain unchanged.
- The former `goblins.png` and `shaman.png` files are no longer distributed.

## License note

The source repository was supplied by the requester. No LICENSE file was visible in the clone inspected, so the source was recorded for traceability; public redistribution remains subject to the source author's applicable permission.
