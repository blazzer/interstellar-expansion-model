# Methodology Notes

## Scope and Aim

The simulation does not attempt to be a comprehensive Fermi Paradox model. It explores one specific question:

> **If we add realistic constraints on motivation, coordination, and self-replication to a standard percolation model of interstellar expansion, does expansion remain bounded - and at what scale?**

The answer the model produces is *yes, at scales much smaller than galactic.* This is not a proof - it's an existence demonstration for a regime that the standard Hart-Tipler exponential argument tends to discount.

## What the Model Encodes

**Hart-Tipler baseline** (recoverable by disabling optional mechanics):

- Mature worlds repeatedly launch probes
- Some fraction of probes succeed
- Successful colonies in turn launch more probes
- Exponential growth, galaxy fills

**Bounded-expansion modifications**:

- Robot worlds have **finite launch budgets** (each world can only mount so many missions before resources run out)
- Robot **capability decays geometrically** with time, independent of usage (entropy, equipment aging)
- Robot **goal coherence** decays per millennium (cultural / programmatic drift toward something other than expansion)
- **Resource depletion** per launch widens the cycle delay (each subsequent launch from one world takes longer)
- **Destination penalty** weights against retrying targets that have already failed
- **Failure strikes** force cooldown periods after consecutive failures
- **Mission abandonment** removes a small fraction of robot worlds per millennium from the active expansion network
- **Distance penalty** divides effective launch probability when only distant targets remain
- A **human success in any network** causes the network's robot worlds to stand down

## What the Model Does NOT Encode

These are deliberate scope decisions. None of them weakens the bounded-expansion conclusion - most would tighten it further.

1. **3D stellar distribution** - modeled as 2D grid
2. **Stellar drift over megayear timescales**
3. **Habitability filter** (all cells are equally targetable)
4. **Civilization lifespan** (mature worlds persist forever)
5. **Technology evolution** (parameters are static)
6. **Anthropic timing** (Carter's hard-steps model)
7. **Inter-civilization interaction**
8. **Cosmological isolation** (intergalactic / supercluster scales)
9. **Deceleration time** (treated as zero)

See `OPEN_ISSUES.md` for systematic listing.

## RNG and Reproducibility

The simulation uses a seedable Mulberry32 RNG (`tune.mjs`, `quick-tune.mjs`). The browser UI uses `Math.random` for variety across resets.

For reproducibility:

```js
import { PercolationSimulation } from './simulation.js';

function mulberry32(seed) { /* see tune.mjs */ }

const sim = new PercolationSimulation(params, { rng: mulberry32(42) });
sim.runTo(20_000_000);
```

Each seed produces identical results for identical parameters.

## Parameter Tuning Approach

`tune.mjs` is a simple hill-climber:

1. Start from a baseline parameter set (`BOUNDED_EXPANSION_PARAMS`)
2. Score across N seeds against a target distribution of outcomes
3. Mutate parameters by small random amounts
4. Keep improvements; iterate

The scoring function in `tune.mjs` targets: first human colony ~500K years, second ~5M years, third rare. This is *one* target distribution chosen to match a "feels right" bounded-expansion story; alternative scoring functions would tune toward different regimes.

## Interpreting Outcomes

Three regimes are commonly observed:

**Regime A - No expansion**
Sol fails repeatedly, motivation collapses, no off-world colonies. Often happens with high failure rates and low success bonuses.

**Regime B - Bounded expansion** (target regime)
A handful of human colonies emerge over millions of years, each potentially seeding its own bubble. Robot worlds peak then decline. Most grid stays empty. This is the default preset.

**Regime C - Fill-the-grid (Hart-Tipler)**
With optional mechanics disabled and forgiving core parameters, expansion accelerates exponentially and saturates the grid in tens of millions of years.

The qualitative gap between B and C is the model's main contribution: it shows how much of the path from one to the other is parametric rather than fundamental.

## Known Numerical Behaviors

- `_findLaunchTargets` is O(grid^2) per call; expensive for large grids
- `findNextEventYear` enumerates per-tick maturation rolls; can dominate runtime in dense states
- `snapshotGrid` is FNV-1a; collisions theoretically possible but unobserved
- Floating-point accumulation in `robotFragmentResourceMult` can grow without bound over millions of years

None of these affect correctness for grids up to ~100x100 over ~50M years.
