# Parameter Reference

All parameters are configurable through the UI or by passing a parameters object to `PercolationSimulation`. See `BOUNDED_EXPANSION_PARAMS` in `simulation.js` for a tuned preset.

## Conventions

- **Time** is measured in years. Internal step (`TICK`) is 1,000 years.
- **Distances** are cells; the Manhattan metric is used.
- **Percentages** are 0-100 in the UI; converted internally to fractions.
- **0 disables** most optional mechanics (1 disables `goalCoherence`, since 1.0 means "no decay per millennium").

## Core Mechanics

### `gridSize` (default 50)
Square grid dimensions. Sol is placed at the center. Larger grids run slower (O(N^2) per tick).

### `transitTime` (default 5,000 years)
Years to traverse one cell. Total transit time scales linearly with distance.

### `maturationTime` (default 5,000 years)
Years between arrival and a colony becoming MATURE. Maturation rolls happen every 1,000 years.

### `decisionCycle` (default 3,000 years)
Years between launch attempts for a mature world.

### `initialLaunchProb` (default 50%)
Starting launch probability for new mature worlds (also the initial robot probe capability). Successes and failures multiply this number from here.

### `transitFailRate` (default 50%)
Probability a probe fails during transit. On failure the target cell reverts to UNCOLONIZED and the accountable human world takes a motivation penalty.

### `colonyFailRate` (default 50%, cumulative)
Total probability a maturing colony fails. Spread across the maturation period as independent per-tick rolls: `1 - (1 - r)^(1/n)` where `n = maturationTime / 1000`.

### `robotColonyRate` (default 90%)
Probability a successful colony becomes robotic rather than human. Robotic outcomes are much more common because building a robotic outpost is far cheaper than seeding a viable biosphere.

### `robotSuccessBonus` (default 10%) / `successBonus` (default 20%)
Motivation multipliers applied to the sponsoring human world when a robot / human colony succeeds.

### `failurePenalty` (default 50%)
Motivation multiplier applied to the accountable human world when a mission fails. (`launchProbability *= 1 - failurePenalty/100`)

### `distancePenalty` (default 1.2x per step)
Motivation is divided by `distancePenalty^(distance - 1)` when targets at distance 1 are unavailable. Encourages local expansion, penalizes long shots.

NOTE: distancePenalty is the dominant lever in the model. Because effective launch motivation is divided by `distancePenalty^(distance-1)`, worlds far behind the expansion frontier are strongly suppressed from projecting probes outward ('backline cannot supply the frontline'). This is intentional -- it is the core bounded-expansion mechanism, the numeric expression of motivation/information decaying with distance. The brittle, frontier-driven wave front it produces is a feature, not an artifact. Its severity is a tuning question; see sensitivity analysis (OPEN_ISSUES V-2/V-4).

### `robotCapabilityDecay` (default 20% per decay period)
Robot launch capability decays geometrically over time: `capability *= (1 - robotCapabilityDecay/100)^(age / robotDecayPeriod)`. `0` disables.

### `robotDecayPeriod` (default 100,000 years)
The time span over which `robotCapabilityDecay` is applied. Larger values mean slower decay. Used as the divisor on world age when computing capability decay.

## Strict bounded mode

Strict bounded mode is **not** a separate parameter -- it is inferred when all four triggers are satisfied:

| Trigger | Required for activation |
|---------|-------------------------|
| `robotStandDown` | >= 100% |
| `humanStandDown` | > 0% |
| `goalCoherence` | < 1.0 |
| `missionAbandonment` | > 0 |

When active, the simulation applies coordinated network rules: Sol defers human launches while robots remain mature; robot-born humans become the preferred launcher; human-founded and non-preferred launchers use the motivation-keep percentages below; robots stand down per `robotStandDown` when a robot-born human colony succeeds.

The Parameters panel shows **Strict bounded mode: Activated / Deactivated** and updates live as knobs change.

### `humanFoundedLaunchPct` (default 5%)
In strict bounded mode only: motivation retained by off-world human colonies founded directly by other humans (not robot-born). 0 = effectively silent.

### `nonPreferredLaunchPct` (default 25%)
In strict bounded mode only: motivation retained by human colonies that are not the network's current preferred launcher.

## Optional Mechanics

These are additional constraints beyond the strict-bounded trigger group.

### `robotLaunchMin` / `robotLaunchMax` (default 5 / 15)
Each robot world is assigned a random launch budget between these values. After exhausting it, the world stops launching. Set `robotLaunchMax = 0` to disable.

### `resourceDepletion` (default 5% per launch)
Each robot launch multiplies that world's cycle delay by `(1 + r)`. Models the increasing cost of subsequent missions from the same system.

### `goalCoherence` (default 0.999 per millennium)
Robot capability is multiplied by `goalCoherence^(age/1000)`. Off-world human motivation also decays. Set to `1.0` to disable. Also a strict-bounded trigger (must be < 1.0).

### `robotStandDown` / `humanStandDown` (default 100% / 70%)
See strict bounded mode section above. Probabilistic robot dormancy and human motivation drop on off-world human colony success.

### `destFailPenalty` (default 20% per prior failure)
When choosing among multiple equidistant targets, weight each by `(1 - penalty)^(prior_failures)`. Models learning to avoid bad systems. Set to `0` to disable.

### `failureStrikeLimit` / `failureTimeoutYears` (default 5 / 100K years)
After N consecutive failures, a world enters a timeout for the configured duration. Set `failureStrikeLimit = 0` to disable.

### `missionAbandonment` (default 0.1% per millennium)
Probability per millennium that a mature robot world abandons its mission and goes DEAD. Also a strict-bounded trigger (must be > 0).

## Pipeline dynamics

When decisionCycle is shorter than transitTime + maturationTime, a motivated world launches several probes before the first resolves. If those colonies then fail in a cluster, the parent's motivation takes several compounding failurePenalty hits in quick succession -- a sudden 'crisis of confidence' rather than gradual waning. This is most acute for Sol's opening salvo and is intentionally buffered by the very high solInitialLaunchProb (default 5000%), so early clustered failures do not extinguish Sol. For later colonies the effect is accepted as modeled behavior.

## Notable Derived / Internal Values

Visible in the UI readout:
- **End-to-end human probability**: `transitSurvival x colonySurvival x humanColonyFrac`
- **End-to-end robot probability**: `transitSurvival x colonySurvival x robotColonyFrac`
- **Per-tick colony failure rate**: per-millennium fail probability that integrates to `colonyFailRate`

Hidden constants in `simulation.js`:
- `TICK = 1000` (years per simulation step)
- `MAX_YEAR = 1_000_000_000` (cap on forward-event seeking)
- `ROBOT_CAPABILITY_DECAY_PERIOD = 100_000` (decay timescale for robot capability)

## Tuning Notes

- **For bounded expansion** (the default preset): use the `BOUNDED_EXPANSION_PARAMS` values. Expansion typically stalls after a few colonies.
- **For Hart-Tipler baseline**: set all OPTIONAL parameters to 0 (`goalCoherence` to 1.0), lower transit/colony failure rates, raise launch probability. The grid fills quickly.
- **For Carter-flavored "rare success"**: raise `colonyFailRate` to 80-90% and `transitFailRate` to 60-70%. Watch how few cells ever become mature.
- **For "robots are pointless"**: raise `robotColonyRate` to 99% and `missionAbandonment` to 1-2%. Robots peak fast and die off.