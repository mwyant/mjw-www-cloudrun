# Void Lancer: First Sortie Asset Manifest

Source of truth for this pass: user-provided prototype summary. The `web-farm-poc-game` source files were not present in the current workspace, so this plan targets the described HTML5 vertical-slice structure directly.

## Goals
- Replace procedural placeholder visuals with a cohesive 32-bit pixel-art space-opera set.
- Preserve readability in a `960x540` HTML5 canvas.
- Keep player, enemies, boss, effects, backgrounds, and UI in one visual family.
- Support staged implementation without forcing a redesign of current gameplay.

## Palette Families
- Player / allied systems: cyan, teal, white, silver, pale blue, restrained gold accents
- Enemy faction: crimson, magenta, amber, gunmetal, deep violet accents
- Boss / empire capital class: dark gunmetal, crimson, gold, ember cores
- Backgrounds: deep navy, black, indigo, restrained luminous cyan and magenta haze
- Pickups / neutral interactables: jade, cyan, gold
- FX family: cyan-white for player fire, amber-red-magenta for enemy fire, white-gold core for explosions

## Asset Manifest
| Current Entity | File Name | Suggested Size | Format | Single / Strip | Notes |
| --- | --- | --- | --- | --- | --- |
| Player ship | `player_ship_idle.png` | `64x48` | PNG | Single | Small, elegant, luminous, strong side silhouette |
| Upgraded player ship state | `player_ship_pulse_plus.png` | `64x48` | PNG | Single | Same hull, stronger engine and weapon glow |
| Player basic bullet | `player_bullet_basic_strip.png` | `16x8` x 4 frames | PNG | Strip | Tiny cyan pulse with soft oscillation |
| Player upgraded bullet | `player_bullet_pulse_plus_strip.png` | `24x10` x 4 frames | PNG | Strip | Heavier cyan-white bolt with gold edge |
| Scout enemy | `enemy_scout_idle.png` | `48x32` | PNG | Single | Fast low-mass attack craft |
| Zigzag enemy | `enemy_zigzag_idle.png` | `56x36` | PNG | Single | Distinct swept body for movement readability |
| Turret enemy | `enemy_turret_idle.png` | `56x40` | PNG | Single | Heavier frontal threat, obvious cannon read |
| Drone enemy | `enemy_drone_idle.png` | `40x40` | PNG | Single | Small orbiting or harassment unit |
| Boss siege carrier | `boss_siege_carrier_base.png` | `320x160` | PNG | Single | Ceremonial-industrial capital silhouette |
| Boss detail overlay or weakpoints | `boss_siege_carrier_glow_overlay.png` | `320x160` | PNG | Single | Optional additive layer for damage states |
| Weapon power-up | `pickup_pulse_plus_strip.png` | `24x24` x 6 frames | PNG | Strip | Jade-cyan core with slow spin/glow |
| Hit spark | `fx_hit_spark_strip.png` | `24x24` x 5 frames | PNG | Strip | Fast white-cyan burst |
| Small explosion | `fx_explosion_small_strip.png` | `32x32` x 6 frames | PNG | Strip | Short punchy enemy-pop explosion |
| Medium explosion | `fx_explosion_medium_strip.png` | `48x48` x 7 frames | PNG | Strip | For turret / larger enemy kills |
| Boss explosion | `fx_explosion_boss_strip.png` | `96x96` x 10 frames | PNG | Strip | Layered gold-white-magenta detonation |
| Starfield layer | `bg_starfield_far.png` | `960x540` | PNG | Single / tileable | Sparse and low contrast |
| Nebula parallax layer | `bg_nebula_mid.png` | `960x540` | PNG | Single | Soft color mass, no gameplay clutter |
| Megastructure corridor | `bg_megastructure_near.png` | `960x540` | PNG | Single | Readable near-field geometry |
| Debris accents | `bg_debris_strip.png` | `64x64` cells x 4 | PNG | Strip / atlas | Breakup pieces for stage dressing |
| HUD frame | `ui_hud_frame.png` | `960x96` | PNG | Single | Integrated empire-tech framing |
| Boss health frame | `ui_boss_bar_frame.png` | `720x48` | PNG | Single | Distinct ceremonial threat plate |
| Title / logo treatment | `ui_title_logo.png` | `768x192` | PNG | Single | Game title treatment for overlay |
| Start / end overlay panel | `ui_overlay_panel.png` | `720x360` | PNG | Single | Reusable mission panel styling |

## Link Map
- Player ship placeholder -> `player_ship_idle.png`
- Pulse+ state or upgraded weapon visual -> `player_ship_pulse_plus.png`
- Basic fire placeholder -> `player_bullet_basic_strip.png`
- Upgraded fire placeholder -> `player_bullet_pulse_plus_strip.png`
- Scout draw routine -> `enemy_scout_idle.png`
- Zigzag draw routine -> `enemy_zigzag_idle.png`
- Turret draw routine -> `enemy_turret_idle.png`
- Drone draw routine -> `enemy_drone_idle.png`
- Siege-carrier boss placeholder -> `boss_siege_carrier_base.png`
- Weapon pickup placeholder -> `pickup_pulse_plus_strip.png`
- Hit particles -> `fx_hit_spark_strip.png`
- Small enemy death effect -> `fx_explosion_small_strip.png`
- Larger enemy death effect -> `fx_explosion_medium_strip.png`
- Boss death sequence -> `fx_explosion_boss_strip.png`
- Starfield / parallax background -> `bg_starfield_far.png`, `bg_nebula_mid.png`, `bg_megastructure_near.png`, `bg_debris_strip.png`
- HUD shell -> `ui_hud_frame.png`
- Boss health presentation -> `ui_boss_bar_frame.png`
- Title card -> `ui_title_logo.png`
- Start / win / lose overlays -> `ui_overlay_panel.png`

## Build First
1. `player_ship_idle.png`
2. `enemy_scout_idle.png`
3. `bg_starfield_far.png`
4. `bg_nebula_mid.png`
5. `ui_hud_frame.png`

These five are enough to make the prototype feel authored quickly.

## Second Wave
1. `enemy_zigzag_idle.png`
2. `enemy_turret_idle.png`
3. `enemy_drone_idle.png`
4. `player_bullet_basic_strip.png`
5. `player_bullet_pulse_plus_strip.png`
6. `pickup_pulse_plus_strip.png`
7. `fx_hit_spark_strip.png`
8. `fx_explosion_small_strip.png`
9. `fx_explosion_medium_strip.png`

## Final First-Level Lock
1. `boss_siege_carrier_base.png`
2. `ui_boss_bar_frame.png`
3. `fx_explosion_boss_strip.png`
4. `bg_megastructure_near.png`
5. `bg_debris_strip.png`
6. `ui_title_logo.png`
7. `ui_overlay_panel.png`

## Practical Implementation Notes
- Keep all gameplay-critical sprites on transparent backgrounds.
- Backgrounds should separate far, mid, and near values clearly to avoid muddy bullet reads.
- Use strips only where the code can easily step frame indexes; otherwise start with single hero frames.
- Player and enemy bullets should stay bright and compact even when the surrounding art becomes more ornate.
- If the prototype currently scales placeholder shapes procedurally, prefer fixed-source sprite sizes and scale in code only when necessary.

## Optional Second-Level Expansion
- Palace-ship graveyard stage with shattered imperial hulls and luminous breach wounds
- Solar-altar defense platforms using the same empire palette but more radiant gold architecture
- New enemy subline that reuses crimson / gunmetal faction colors with stronger ceremonial motifs
