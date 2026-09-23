# Boss mechanics audit

Last reviewed: September 20, 2026.

## What “complete” means here

This is a normalized vocabulary of mechanics found in a selected corpus of games. It does not list every named attack. Similar moves are reduced to reusable rules a designer can apply. Malenia's Waterfowl Dance, for example, does not require a separate term because it can already be described as an attack combination with target tracking, sweeping strikes, and short recovery windows.

The review corpus includes:

- the full boss catalogs of Demon's Souls, Dark Souls I–III, Bloodborne, Sekiro, and Elden Ring, plus characteristic systems from Lies of P and Nioh 2;
- the full The Binding of Isaac: Rebirth catalog of [102 bosses and 20 minibosses](https://bindingofisaacrebirth.wiki.gg/wiki/Bosses);
- Shadow of the Colossus, The Legend of Zelda, Undertale, Metal Gear Solid, Cuphead, Hollow Knight, Hades, Terraria, Monster Hunter, Portal 2, and the common raid language of Final Fantasy XIV.

Each candidate was checked to see whether one existing term, or a combination of existing terms, described it precisely. A rule entered the expanded list only when the starting vocabulary lacked a distinct concept for it. Fan-maintained wikis provide broad coverage and behavior details; official wikis, documentation, and developer material were used for cross-checking where available.

## Starting vocabulary: 66 terms

This is the baseline against which the reviewed encounters were compared.

1. **Body and melee:** wide swing, lunge, ground slam, leaping slam, charge, grab, sweep, burrow and emerge.
2. **Projectiles:** single shot, fan, ring volley, spiral barrage, wall with a gap, crossfire, ricochet, splitting projectile, returning projectile, orbiting projectiles.
3. **Beams:** straight beam, scanning beam, rotating beams, pulsing beam.
4. **Areas and traps:** marked-area strike, explosion chain, shockwave, lingering hazard, mine, hazardous trail.
5. **Arena:** moving hazard, converging threats, collapsing platform, shrinking safe area, pull, knockback.
6. **Secondary targets:** reinforcement summon, turret placement, threat generator, decoy.
7. **Targeting and rhythm:** lock-on targeting, predictive targeting, source tracking, homing projectile, burst, volley, attack combination, delayed activation, speed change, constrained spread.
8. **Defense:** directional shield, damage-type resistance, situational immunity, weak point, part break, attack reflection, counter stance, empowered absorption, interruptible preparation, arsenal adaptation.
9. **Structure and readability:** warning, wind-up, attack lock, active phase, recovery, encounter phase, enrage, survival phase.

## Added mechanics: 58 terms

### Space, movement, and perception

| Mechanic                             | Concise definition                                                                                                          | Verified example                                                                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Teleport / blink**                 | The boss changes position instantly; the arrival point and following attack form one readable action.                       | Lorian teleports before attacking during the [Twin Princes](https://darksouls3.wikidot.com/bosses%3Athe-twin-princes) encounter.                          |
| **Boundary / off-screen attack**     | The source sits outside the normal play space or enters through a wall, door, or the edge of the screen.                    | [Mom](https://bindingofisaacrebirth.wiki.gg/wiki/Mom) attacks with a foot and other body parts through the room boundary.                                 |
| **Forced scrolling**                 | The camera or arena moves independently of the player, making pace maintenance part of the rule.                            | [The Beast](https://bindingofisaacrebirth.wiki.gg/wiki/The_Beast) scrolls the screen through stalactites and stalagmites.                                 |
| **Chase / herding**                  | The temporary goal is to catch the boss or steer it into a required part of the space.                                      | [Micolash](https://www.bloodborne-wiki.com/2015/03/micolash-host-of-nightmare.html) must be herded into a dead-end room.                                  |
| **Escape phase**                     | After a threshold, the boss attempts to leave and the outcome may depend on stopping it.                                    | [Hornfel](https://bindingofisaacrebirth.wiki.gg/wiki/Hornfel) leaves the minecart and runs for the exit.                                                  |
| **Nested / relocated arena**         | The encounter moves the player into a new space and geometry without ending the current fight.                              | A late [Rotgut](https://bindingofisaacrebirth.wiki.gg/wiki/Rotgut) phase moves the action inside the boss.                                                |
| **Perspective / control-mode shift** | The encounter changes how movement and space are read, not only which attacks are available.                                | The Beast turns the fight into a side-scroller; Undertale [SOUL modes](https://undertale.wiki/w/SOUL_mode) alter movement rules, including gravity.       |
| **Boss as terrain**                  | The player moves across the boss's body, and access to the objective depends on grip and route choice.                      | [Shadow of the Colossus](https://en.wikipedia.org/wiki/Shadow_of_the_Colossus) requires climbing the colossi to reach glowing sigils.                     |
| **Cover / line of sight**            | A physical object creates safety by blocking a directional threat.                                                          | The central tree blocks Living Failures meteors, as described in this [encounter analysis](https://www.bloodborne-wiki.com/2015/11/living-failures.html). |
| **Forced inertia / ice floor**       | A surface or effect prevents stopping at the chosen point, so the final position must be planned in advance.                | FFXIV [Ice Floor](https://ffxiv.consolegameswiki.com/wiki/Other_Mechanics) makes a character slide in a straight line.                                    |
| **Wraparound projectile**            | A projectile that leaves one arena edge returns from the opposite edge.                                                     | [Hush](https://bindingofisaacrebirth.wiki.gg/wiki/Hush) uses Continuum projectiles that cross screen boundaries and accelerate.                           |
| **Beat-synced attack**               | Attack timing follows an audible regular beat that functions as part of the rule, not just accompaniment.                   | Most [Mom's Heart](https://bindingofisaacrebirth.wiki.gg/wiki/Mom%27s_Heart) attacks synchronize with the heartbeat and accelerate with it.               |
| **Invisibility / secondary cues**    | The boss hides its model or primary position cue, so the player reads tracks, particles, audio, or environmental reactions. | Invisible [Crossbreed Priscilla](https://darksouls.wikidot.com/crossbreed-priscilla) can be located by footprints and revealed by breaking stance.        |
| **Sound detection**                  | The boss records audible events instead of the player's live position, making movement and attack noise part of stealth.    | The blind [Old Hero](https://demonssouls.wikidot.com/walk4-2-boss) approaches the source of damage while silent movement hinders detection.               |

### Encounter objective and vulnerability

| Mechanic                                 | Concise definition                                                                                                                                     | Verified example                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective-linked invulnerability**     | Complete a finite, visible set of protection objectives before the boss opens a timed damage window.                                                   | [Rennala](https://eldenring.wiki.gg/wiki/Rennala) requires finding and striking three singing scholars to break the sphere.                                                                                    |
| **Wave-clear objective**                 | A wave advances only after its finite spawn queue is sealed and its registered enemy roster is empty.                                                  | [Great Gideon](https://bindingofisaacrebirth.wiki.gg/wiki/Great_Gideon) ends after six enemy waves.                                                                                                            |
| **Environmental weapon / device**        | A fixed arena device must be reached and prepared; its resolved shot, not ordinary weapon damage, owns boss progress.                                  | [Dragon God](https://demonssouls.wikidot.com/walk2-3-boss) is defeated with two ballistae after a stealth route between cover points.                                                                          |
| **Encounter-specific tool**              | The encounter grants or activates a portable tool whose rule-specific action is unusually effective against this boss.                                 | [Serpent-Hunter](https://eldenring.wiki.gg/wiki/Serpent-Hunter) activates its ranged attacks against the God-Devouring Serpent and Rykard.                                                                     |
| **Player-controlled boss**               | A real participant occupies an encounter-owned boss role with bounded actions; compatible AI preserves the fight when that controller is absent.       | A network player can become Old Monk under the conditions described in [Old Monk Summon](https://demonssouls.wikidot.com/black-phantoms), while an NPC replaces them offline or when no candidate is found.    |
| **Projectile rally / dead man's volley** | One encounter-owned projectile alternates between boss and player until a missed response resolves the accelerating exchange.                          | Zelda's [Dead Man's Volley](https://www.zeldadungeon.net/wiki/Dead_Man%27s_Volley) repeatedly transfers the same attack and exposes the boss when it misses. This is narrower than a one-step reflection.      |
| **Baited collision / self-hit**          | A prepared object or position becomes boss damage only when a committed boss action completes the qualifying contact.                                  | [Chub](https://bindingofisaacrebirth.wiki.gg/wiki/Chub) eats bombs placed in its charge path; [Scaldera](https://www.zeldadungeon.net/skyward-sword-walkthrough/earth-temple/) swallows a bomb while inhaling. |
| **Posture stagger gauge**                | Authored attacks and counters pressure a separate gauge; a break opens a bounded critical state that an explicit finisher or critical action consumes. | Sekiro centers fights on posture and Deathblow; Sifu's official combat overview separates Structure break from the takedown that consumes it.                                                                  |
| **Pacifist resolution**                  | A visible nonviolent condition makes a separate spare action eligible, ending the encounter without emptying boss health.                              | [Baby Plum](https://bindingofisaacrebirth.wiki.gg/wiki/Baby_Plum) leaves and drops a different reward after taking no damage for 30 seconds.                                                                   |
| **Persistent encounter progress**        | Authored encounter objectives commit before player defeat and reconstruct the next attempt with those milestones still complete.                       | Destroyed [Bed of Chaos](https://darksouls.wikidot.com/the-bed-of-chaos) roots remain destroyed on the next attempt.                                                                                           |

### States, resources, and scaling

| Mechanic                             | Concise definition                                                                                                                 | Verified example                                                                                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status buildup**                   | Hits fill a separate gauge; the effect occurs only at its threshold.                                                               | [Guardian Ape](https://www.gamespot.com/articles/sekiro-guide-for-guardian-ape-boss-beating-the-bru/1100-6465875/) builds Terror with its scream.                                                         |
| **Instant-kill / execution**         | A separate condition bypasses ordinary damage and ends the attempt immediately.                                                    | [Olmec](<https://spelunky.fandom.com/wiki/Olmec_(HD)>) crushes instantly; daytime [Empress of Light](https://terraria.wiki.gg/wiki/Empress_of_Light) attacks normally kill in one hit.                    |
| **Maximum-health reduction**         | An attack lowers the health ceiling temporarily or permanently, rather than only current health.                                   | [Maliketh's](https://eldenring.wiki.gg/wiki/Destined_Death_%28Status_Effect%29) Destined Death reduces maximum HP and deals damage over time.                                                             |
| **Ability / healing lock**           | A hit temporarily disables a specific part of the player's kit.                                                                    | [Great Shinobi Owl's](https://sekiro-shadows-die-twice.fandom.com/wiki/Great_Shinobi_-_Owl) bomb blocks healing.                                                                                          |
| **Resource steal / drop**            | The boss removes currency, charges, or ammunition, or forces the player to drop a resource into the arena.                         | [Ultra Greed](https://bindingofisaacrebirth.wiki.gg/wiki/Ultra_Greedier) makes Isaac drop coins that the boss can collect.                                                                                |
| **On-hit healing / lifesteal**       | Successful contact restores boss health, including explicitly defined blocked hits.                                                | [Malenia](https://eldenring.fandom.com/wiki/Malenia%2C_Blade_of_Miquella) heals on every successful hit, including hits against a shield.                                                                 |
| **Self-heal / regeneration cast**    | The boss spends readable time restoring health, and the player decides whether to interrupt, counter, or accept the lost progress. | Below half health, [Vicar Amelia](https://www.bloodborne-wiki.com/2015/03/vicar-amelia.html) restores 16.67% HP over 3.7 seconds; the action can be interrupted or temporarily blocked with Numbing Mist. |
| **External healing source**          | Targets or resources appear and must be intercepted before they restore the boss.                                                  | Heart Coins heal [Ultra Greed](https://bindingofisaacrebirth.wiki.gg/wiki/Ultra_Greedier) unless destroyed.                                                                                               |
| **DPS scaling / damage-rate cap**    | Effective incoming damage falls according to recent DPS so a power spike cannot skip the encounter.                                | [Damage Scaling](https://bindingofisaacrebirth.wiki.gg/wiki/Damage_Scaling) applies to Hush, Ultra Greed, and forms of Delirium.                                                                          |
| **Loadout mirror**                   | The boss copies the player's current statistics, weapons, spells, or items.                                                        | [Mimic Tear](https://eldenring.wiki.gg/wiki/Silver_Tear) adopts the player's form, equipment, spells, and statistics.                                                                                     |
| **Moveset shapeshifting**            | The boss switches between complete movesets belonging to other opponents.                                                          | [Delirium](https://bindingofisaacrebirth.wiki.gg/wiki/Delirium) becomes previously encountered bosses and uses their health-ratio phases.                                                                 |
| **Ally theft / charm**               | Player-summoned helpers temporarily join the boss or turn their effects against their owner.                                       | [The Siren](https://bindingofisaacrebirth.wiki.gg/wiki/The_Siren) charms collected familiars.                                                                                                             |
| **False death / resurrection**       | Empty health presents a victory, after which the same boss returns with a new body or rule.                                        | [Guardian Ape](https://sekiro-shadows-die-twice.fandom.com/wiki/Guardian_Ape) rises after decapitation.                                                                                                   |
| **Action-reactive punish**           | The boss selects a response after the player starts healing, using an item, casting, or another long command.                      | [Isshin Ashina](https://sekiro-shadows-die-twice.fandom.com/wiki/Isshin_Ashina_%28Shura%29) has a specific healing punish that should be designed as a readable reaction with a reachable response.       |
| **Run-history manifestation**        | Encounter composition or difficulty depends on decisions accumulated before entering the boss fight.                               | [The Sorrow](https://metalgear.neoseeker.com/wiki/Bosses_%28MGS3%29) fills the encounter with ghosts of characters the player killed.                                                                     |
| **Real-time progression**            | Encounter state changes while the game is closed, according to real time or the system clock.                                      | [The End](https://metalgear.fandom.com/wiki/The_End) dies of old age if the saved fight is resumed more than a week later.                                                                                |
| **Hardware / interface interaction** | The player changes an input channel or another element outside the normal game world to disable a boss ability.                    | [Psycho Mantis](https://metalgear.fandom.com/wiki/Psycho_Mantis) stops predicting input after the controller port changes.                                                                                |
| **World-state encounter variant**    | Time, region, mode, or world state changes the fight's rules and reward, not only numerical difficulty.                            | Daytime [Empress of Light](https://terraria.wiki.gg/wiki/Empress_of_Light) gains one-hit kills and a separate reward.                                                                                     |
| **Party-size scaling**               | Health, defense, or other parameters recalculate as participants enter or leave.                                                   | Elden Ring [Multiplayer Correction](https://eldenring.wiki.gg/wiki/Multiplayer_Correction) raises boss health and stance when an ally is summoned.                                                        |

### Relationships between multiple bosses

| Mechanic                   | Concise definition                                                                                                            | Verified example                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Partner revival**        | The remaining opponent restores the defeated one, creating an interrupt window and a requirement to align their defeat times. | [Throne Watcher and Defender](https://darksouls.fandom.com/wiki/Throne_Watcher_and_Defender) revive one another indefinitely unless both are defeated in time.                                 |
| **Kill-order inheritance** | The surviving member gains the fallen member's properties, so the first target changes the next phase.                        | The survivor of [Ornstein and Smough](https://darksouls.wikidot.com/dragon-slayer-ornstein-executioner-smough) recovers and inherits the partner's power.                                      |
| **Shared group health**    | Several active bodies consume one health bar even though they may appear and disappear independently.                         | Living Failures use multiple bodies and one health bar; their behavior and shared meteor are described on this [encounter page](https://www.bloodborne-wiki.com/2015/11/living-failures.html). |
| **Coordinated duo attack** | Two participants perform one composite move in which one participant's position defines the other's action.                   | Theseus directs Asterius's Bull Rush into the shield to create a wave in [Theseus/Combat](https://hades.fandom.com/wiki/Theseus/Combat).                                                       |

### Cooperative coordination

| Mechanic                        | Concise definition                                                                                             | Verified example                                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stack**                       | Damage is divided among all players inside the marker; a solo target usually cannot survive.                   | The standard FFXIV [Stack marker](https://ffxiv.consolegameswiki.com/wiki/Stack_marker).                                                                                |
| **Spread**                      | Several players receive unavoidable areas that must not overlap.                                               | FFXIV [Spread markers](https://ffxiv.consolegameswiki.com/wiki/Area_of_Effect).                                                                                         |
| **Tower / soak**                | One or an exact number of players must enter a marked area before activation or the whole party is punished.   | FFXIV [Tower](https://ffxiv.consolegameswiki.com/wiki/Tower) variants include solo, role-based, and multi-player soaks.                                                 |
| **Tether**                      | A visible connection requires maintaining, breaking, or transferring a defined distance between targets.       | FFXIV [Tether](https://ffxiv.consolegameswiki.com/wiki/Tether_%28mechanic%29) links players to one another, a boss, or an object.                                       |
| **Gaze**                        | The outcome depends on whether the character faces the source at activation.                                   | FFXIV [Gaze](https://ffxiv.consolegameswiki.com/wiki/Gaze) usually requires looking away to avoid petrification or another status.                                      |
| **Proximity / falloff damage**  | Damage is calculated from distance to the source, so there may be no binary safe boundary.                     | FFXIV [Proximity AoE](https://ffxiv.consolegameswiki.com/wiki/Other_Mechanics) deals more damage near its center.                                                       |
| **Tankbuster / tank swap**      | An attack targets a role with defensive resources and may require changing the boss's current target.          | FFXIV defines [tankbuster and tank swap](https://ffxiv.consolegameswiki.com/wiki/Acronyms%2C_abbreviations%2C_and_common_terms) as a standard pair of concepts.         |
| **Debuff handoff / contagion**  | Contact transfers an effect, requiring the party to control ownership, timing, and compatible combinations.    | Judgment Nisi in [The Epic of Alexander](https://ffxiv.consolegameswiki.com/wiki/The_Epic_of_Alexander) must be passed without mixing colors.                           |
| **Ordered targets / limit cut** | Markers assign an attack order; one player's error changes the space available to later targets.               | Palladion in [Anabaseios: The Twelfth Circle](https://ffxiv.consolegameswiki.com/wiki/Anabaseios%3A_The_Twelfth_Circle_%28Savage%29) numbers players from one to eight. |
| **Pairing / polarity**          | Players must form pairs by matching or opposing properties without collecting extra participants.              | Light and Dark Rings appear among FFXIV [Stack marker](https://ffxiv.consolegameswiki.com/wiki/Stack_marker) variants.                                                  |
| **Party split**                 | The group temporarily divides across areas or objectives that must be completed simultaneously or in sequence. | High-level FFXIV fights combine role groups, separate soaks, and ordered tasks; [P8S](https://ffxiv.consolegameswiki.com/wiki/P8S) is one example.                      |

## Candidates that did not become new mechanics

- **Long delayed chains, roll catches, and tempo changes** are already described by combinations, delayed activation, lock, and recovery.
- **A new boss form** remains a phase unless it copies an external moveset, restores a defeated participant, or changes the encounter objective.
- **Flight, diving, and mounts** need no separate term without a distinct rule; their attacks decompose into leaps, charges, targeting, and areas.
- **Elemental weakness, high defense, and temporary armor** are covered by resistance, immunity, shields, and weak points.
- **Breakable arms, weapons, and tails** belong to part breaking even when Lies of P Perfect Guard or a Monster Hunter damage type changes the method.
- **Low-health speed increases** are enrage; the trigger and new rhythm matter more than a separate name for every variant.
- **Ordinary summons, clones, and turrets** are represented by reinforcements, decoys, turrets, and threat generators.

## Priorities for future atlas pages

These topics add the most to the five current lessons:

1. **Posture stagger gauge** — changes the damage model and clearly connects defense with offense.
2. **Objective-linked invulnerability** — teaches a clear causal chain between a secondary target and a damage window.
3. **Teleport** — raises useful questions about space, camera, arrival cues, and protection from untelegraphed hits.
4. **On-hit healing** — addresses boss resilience against powerful builds without simply increasing HP.
5. **DPS scaling / damage-rate cap** — requires exceptional care because a hidden formula can invalidate progression.
6. **Loadout mirror** — makes the player's build part of the encounter while introducing pre-fight menu exploits.
7. **Projectile rally** — turns a defensive action into a method for exposing boss vulnerability.
8. **Partner revival** — creates a clear health-management objective across several opponents.
9. **Perspective / control-mode shift** — strongly differentiates phases but requires teaching the controls again without losing readability.
10. **Pacifist resolution** — shows how a boss's character and story can be expressed through the victory condition.

## Primary catalogs and references

- [Dark Souls boss list](https://darksouls.fandom.com/wiki/Boss)
- [Dark Souls II boss list](https://darksouls.fandom.com/wiki/Boss_%28Dark_Souls_II%29)
- [Dark Souls III boss list](https://darksouls3.wikidot.com/bosses)
- [Demon's Souls boss list](https://demonssouls.wikidot.com/bosses)
- [Bloodborne bosses, defenses, and weak points](https://www.bloodborne-wiki.com/2015/10/bosses-defenses.html)
- [Sekiro boss list](https://sekiro-shadows-die-twice.fandom.com/wiki/Category%3ABosses)
- [Elden Ring boss list](https://eldenring.wiki.gg/wiki/Boss)
- [The Binding of Isaac: all bosses](https://bindingofisaacrebirth.wiki.gg/wiki/All_Bosses_%28Bosses%29)
- [The Binding of Isaac: final bosses](https://bindingofisaacrebirth.wiki.gg/wiki/Final_Bosses_%28Bosses%29)
- [Final Fantasy XIV common mechanics and markers](https://ffxiv.consolegameswiki.com/wiki/Common_mechanics_and_markers)
- [Cuphead boss list](https://cuphead.wiki.gg/wiki/List_of_Bosses)
- [Hollow Knight combat and stagger](https://hollowknight.wiki/w/Combat_%28Hollow_Knight%29)
- [Nioh 2 boss list and Ki/Yokai Realm](https://www.powerpyx.com/nioh-2-boss-guide-all-bosses/)
- [Terraria: Empress of Light](https://terraria.wiki.gg/wiki/Empress_of_Light)

Audit result: **124 normalized mechanics and encounter structures** — 66 starting terms and 58 additions. This is a vocabulary for the current corpus, not a claim of universal closure. Add a term only when a new encounter cannot be described precisely with existing rules and combinations.
