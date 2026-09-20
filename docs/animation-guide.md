# Generating and reviewing encounter animations

Read this guide before creating or changing a lesson animation, character rig, effect, or catalog preview. It complements the [content guide](content-guide.md#connect-an-animation) and applies to both human and agent contributions.

The target is a short, readable scene from a stylized action game. Characters carry weight, make deliberate movements, and react to their own actions. The scene must also demonstrate the lesson's actual rule. Attractive motion cannot compensate for an impossible escape or a misleading hitbox.

## Define the encounter first

Before drawing or changing timing, write a compact implementation brief in the task notes or change description:

- **Rule:** what the boss does, when it commits, and what can still change afterward.
- **Signal:** the pose and visible cue that announce the action and the commitment moment.
- **Response:** the player's route and the ordinary abilities needed to complete it.
- **Geometry:** origin, active region, player extent, and the time when damage could occur.
- **Motion beats:** preparation, release, contact or passage, follow-through, recovery, and return.
- **Proof:** the frames and conditions that establish full clearance, continuity, and a useful opening.

Resolve ordinary art and implementation choices using the existing scenes. Ask for clarification only when the intended rule or scope cannot be inferred. Do not require approval for every pose or effect.

Keep the current contract of three localized phase names and descriptions. A phase may contain several motion beats; an impact does not need to occupy its entire phase. Do not add a fourth idle phase or change the lesson's meaning merely to simplify animation. Follow the content version and translation process when the rule changes.

## Preserve the shared visual language

- Use original SVG artwork in the established three-quarter view. Keep the boss substantial and the player compact, with readable silhouettes at the actual lesson and thumbnail sizes.
- Reuse `CHARACTER_ART` from [`lib/character-art.mjs`](../lib/character-art.mjs). Extend its rig when needed instead of redrawing a slightly different boss or player for each mechanic. Catalog and builder previews use the same source fragments.
- Reuse the arena and effect markup in [`lib/encounter-view.mjs`](../lib/encounter-view.mjs) and the scene tokens in [`src/encounter.css`](../src/encounter.css). Keep surrounding interface colors and typography aligned with `src/site.css`; do not create a new palette per mechanic.
- Keep the floor quiet, silhouettes distinct, and threats more prominent than decoration. Shadows establish ground contact. A recognizable game scene does not require extra HUD panels, health bars, lore, or clutter.
- Use only localized “boss” and “player” labels. Shared asset IDs such as `kern` and `tavi` are implementation names, not character names for the lesson.
- Keep artwork original and inside the repository's licensing boundaries. External gameplay references inform timing and behavior; do not copy their sprites, frames, logos, or textures into the scene.

## Animate bodies, not just positions

1. **Prepare visibly.** Shift weight, lower the stance, draw an arm back, or raise the body before release. Make the anticipation specific to the attack.
2. **Commit decisively.** Choose acceleration and timing for the mechanic. A charge needs a distinct fast traversal; a steady sweep needs a readable committed angular rate. Do not use the same slow easing curve for every action.
3. **Articulate the movement.** Feet, arms, torso, head, cape, and weapon move around their own pivots. Derive gait from distance traveled and tune stride to the character's size and speed. Feet should not skate, swing sideways during a forward run, or continue stepping after arrival.
4. **Show contact and follow-through.** Compression, a brief recoil, cloth lag, and restrained dust should share the action's timing. Ground impacts originate at the feet or weapon contact, not the torso center. Airborne bodies lift away from their ground shadows.
5. **Let the character settle.** Decelerate or plant the feet and let the body recover. Include enough recovery for the response promised by the lesson. Do not invent movement just to keep every part in motion.
6. **Return intentionally.** Reposition through visible movement before the next loop. Inspect both position and pose at every phase boundary and across the loop seam. No teleport, sudden scale reset, or unexplained facing change may be hidden in the reset.

Keep the world anchor upright. Translate the actor through the arena; use the shared rig for lateral facing, rear views, leaning, and joint rotation. Do not rotate the entire upright sprite like a map marker to aim upward or rotate an attack arc. Attack geometry and body facing are separate. Facing the target while strafing can be intentional; the pose and footwork must communicate it.

Use motion effects sparingly. Dust follows movement, trails follow the path, and impact marks follow contact. They must not obscure the player, extend the apparent damaging region, imply invulnerability, or conceal a discontinuity. Avoid gratuitous screen shake and flashing. Fix the movement before decorating it.

## Make the visible rule true

- Compute safety from the player's complete relevant extent and the active threat, not from the player's center alone or a phase number. A success label must agree with the scene throughout the active interval.
- Distinguish a warning overlay from an active hit region through shape, intensity, timing, and pose; color alone is insufficient. Keep the dangerous edge readable through the action.
- For Charge, preserve aim tracking before lock, fixed direction after lock, full sideways clearance, and useful recovery. Turning the visual rig must not steer the committed path. Ordinary movement must remain sufficient for the illustrated escape.
- For a sweep with an inner safe region, draw and model an annular sector. Neither its active blade nor a filled danger wedge may cross a player marked safe. Choose the inner radius from body clearance; the current example's radius is not a universal rule for all sweeps.
- For a slam, align the wave center with the visible ground contact and start propagation after contact. Do not move the shadow, impact point, and wave independently.
- For projectiles and summons, show where objects originate, how they travel, and when they become active. Staggered entities must each finish their movement and settle; avoid a final progress value that leaves a stationary entity walking forever.
- If the scene includes a hit, block, immunity, or counterattack, give it an observable cause and response. Do not display an attack that silently fails or show a successful action outside its real range.

The existing scenes are implementation examples, not proof that every geometry or outcome calculation is complete. Check the specific rule when reusing one. Do not copy a timing constant, radius, or unconditional success flag merely because it occurs in an existing model.

## Keep one deterministic timeline

Register the adapter in [`lib/animations.mjs`](../lib/animations.mjs) with `render`, `thumbnail`, `styles`, and `scripts`. Keep simulation and threat rules in a pure `src/*-model.mjs`; keep markup in the view and playback/DOM updates in the browser controller.

The current shared rig is created with `createCharacterAnimator(element, kind)` from [`src/character-motion.mjs`](../src/character-motion.mjs). Render it with `(motion, facing)`. A model supplies `bossMotion`, `playerMotion`, `bossFacing`, and `playerFacing` alongside positions and mechanic-specific geometry.

| Value                                         | Contract                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| World positions                               | Arena coordinates: positive x is right, positive y is down. Distinguish the body anchor from the ground-contact point.                |
| Facing                                        | Degrees from positive x: 0 right, 90 down, 180 left, -90 up. This is rig orientation, not a rotation applied to the whole world node. |
| `gait`                                        | Finite radians derived from traveled distance. It is not a normalized pose weight.                                                    |
| `stride`                                      | Locomotion intensity in [0, 1]; zero when planted.                                                                                    |
| `lean`                                        | Signed pose weight in [-1, 1].                                                                                                        |
| `crouch`, `lift`, `attack`, `impact`, `dodge` | Pose weights in [0, 1]. They describe presentation, not collision or invulnerability permissions.                                     |

Keep `data-rig-part` names unique inside each character instance. Animate repeated entities through separate instance roots. Use the same ground-contact mapping for feet, shadows, dust, and impacts; do not copy a current sprite's pixel offset into a differently scaled character without conversion.

All poses, direction blends, particles, and trails must be reproducible from simulation time. Reuse [`src/encounter-effects.mjs`](../src/encounter-effects.mjs) where appropriate. Do not add independent CSS animation clocks, unseeded randomness, accumulated DOM transforms, or timers that continue while playback is paused. Seeking backward and then returning to a timestamp must produce the same frame. Rendering repeatedly at one timestamp must not advance anything.

Keep SVG nodes stable during playback. Cache element references and update their attributes; avoid rebuilding the scene or reading layout on every frame. Reuse shared primitives when the rule fits, and add a separate model when it does not.

## Preserve the teaching interface

- Keep localized text in locale JSON, safely escape SVG/HTML text and embedded configuration, and provide meaningful SVG titles and descriptions.
- Preserve the current compact timeline, current-phase label, keyboard operation, visible focus, and tooltip explanation. Do not add controls or implementation details without a teaching need.
- Disable autoplay under reduced motion and when the document is hidden. Manual seeking must remain usable, and every decorative effect must freeze with the scene.
- Keep labels and controls readable in both themes and Arabic RTL. The arena may keep stable spatial coordinates while the surrounding interface follows the locale.
- Keep both characters, their labels, and the relevant escape route in frame on mobile and short desktop windows. Use `preserveAspectRatio="xMidYMid meet"` or an equally verified fitting strategy; do not crop actors to fill the panel.
- Preserve understandable output without JavaScript. Initial server-rendered positions and labels must agree with the model's initial frame.

## Verify before delivery

For animation changes, run `npm run check`, scoped Prettier checks, and `npm run test:browser`. Install Chromium with `npx playwright install chromium` if needed. Finish the build before starting browser checks: the build replaces `dist/`, so rebuilding during a browser run can invalidate the served pages. Do not reformat unrelated files.

Use [`tests/animation-motion.test.mjs`](../tests/animation-motion.test.mjs) and [`tests/browser/animation-motion.spec.mjs`](../tests/browser/animation-motion.spec.mjs) as starting points. Add checks for the actual new rule: full clearance, commitment, finite poses, contact order, settled feet, continuity, and deterministic seeking. Browser checks should verify the rendered rig, playback preferences, controls, and bounds. Scope actor assertions to their role roots; legitimate shared-art reuse by minions must not be mistaken for duplicate main bosses.

Watch at least two complete loops at normal speed, then inspect anticipation, release, contact, recovery, and reset with the slider. Include movement in each used direction and the last staggered entity. Review both individual poses and the moving sequence: a contact sheet alone cannot establish natural timing.

Inspect desktop, a short desktop such as 1280 × 720, and mobile such as 375 × 812, in both themes. Check an LTR locale, Arabic RTL, affected script fonts, reduced motion, and JavaScript-disabled output. Verify shared previews when artwork changes. Follow the content guide's wider locale and publication checks when publishing a lesson.

Reject the animation if it has unexplained sliding, whole-sprite rotation, abrupt resets, detached ground effects, walking in place after arrival, obscured threats, clipped actors, or a success state contradicted by the visible attack. Passing automated tests does not establish natural motion or subject-matter accuracy. Report the checks actually run and any remaining limitation.
