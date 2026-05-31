# Interstellar Expansion Percolation Model

A grid-based simulation exploring **bounded expansion dynamics** for hypothetical interstellar civilizations. Models both biological (human) and robotic colonization waves with constraints on motivation, coordination, and self-replication.

## What This Explores

The Hart-Tipler argument (1975, 1980) says that even at slow expansion rates, an exponentially-replicating civilization should fill a galaxy in 1-100 million years. Since we don't see this, civilizations must be extremely rare, or something prevents expansion.

This simulation explores the possibility that under various constraints — including cultural goal drift, finite mission budgets, failure cascades, and resource depletion — expansion can remain limited at scales far below galactic.

**With the current Bounded Expansion Preset**, runs typically saturate at a handful of worlds within a small region, after which activity fizzles out. 
This fine-tuned outcome *can* produce results consistent with a "quiet sky", though the model has significant known limitations (see below), and results are parameter-dependent.

## Quick Start

### In the browser

Open `index.html`. No build step. It's also available on [GitHub page](https://blazzer.github.io/interstellar-expansion-model/).

```bash
# Optional local server (some browsers restrict ES modules over file://)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

Click **Bounded Expansion Preset** to load tuned parameters, then **Forward to Next Event** to watch the simulation step through colony events. The grid shows Sol in the center and colonization spreading outward.

### From Node.js (parameter tuning)

Experimental hill-climbing scripts for offline parameter search (seeded RNG, not integrated with the browser UI):

```bash
npm run tune         # Mutation-based search from BOUNDED_EXPANSION_PARAMS
npm run quick-tune   # Compare a few named candidate sets
```

Robot capability decay uses a fixed 100,000-year period in the engine (`ROBOT_CAPABILITY_DECAY_PERIOD`); only `robotCapabilityDecay` (%) is tunable.

## Model Overview

### Two-tier expansion

**Human worlds**
- Each makes independent launch decisions on its own cycle
- Initial motivation: The home world (Sol) has very high motivation to seed a colony. 
Daughter colonies, once established, have far lower motivation to seed further worlds -- they lack the existential pressure that drove the original expansion.
- Motivation (launch probability) rises with successes, falls with failures
- Distance penalty: motivation is divided by `distancePenalty^(d-1)` for target at distance `d`

**Robot worlds**
- Sponsored by a human world (the `humanOrigin`)
- Each runs its own decision cycle (no synchronized coordination in current version)
- Capability decays with time (current bounded preset: 5% per 100,000 years)
- Goal coherence decays per millennium
- Per-launch resource depletion increases time between attempts
- Each world has a finite launch limit (random within configurable range)
- Robot success/failure feeds back into the human origin's motivation
- When a human colony succeeds in the network, the network's robots **stand down** (to support the new colony - optional parameter, expansion still limited even if not).
Note:  testing suggests the robot stand-down rule contributes far less to boundedness than the heterogeneous seed motivation (Sol 5000% vs. colonies 10%) and distance decay. It is a candidate for removal.

### Lifecycle

-   **UNCOLONIZED**
    -   _State  changes to_ **IN_TRANSIT** (Probe launched)
       
-   **IN_TRANSIT**
    -   _State changes to_ **MATURING** (Probe arrives successfully)
    -   _State reverts to_ **UNCOLONIZED** (Transit fails)
        
-   **MATURING**
    -   _State changes to_ **MATURE** (Colony succeeds; becomes human or robot)
    -   _State changes to_ **DEAD** (Colony fails to establish)

- **Transit failure** is rolled on arrival; cell reverts to uncolonized.
- **Colony failure** is spread across maturation as independent 1,000-year rolls, summing to the configured cumulative rate.
- **Mission abandonment** is a Poisson process on mature robot worlds (they go DEAD).

### Bounded-expansion mechanisms

| Mechanism | Parameter | Effect |
|---|---|---|
| Distance motivation decay | `distancePenalty` | Far missions less likely to be attempted |
| Cultural drift | `goalCoherence` | Robot capability decays per millennium |
| Capability decay | `robotCapabilityDecay` | Robot capability decays per 100K years |
| Robot launch budget | `robotLaunchMin/Max` | Hard cap on launches per robot world |
| Resource depletion | `resourceDepletion` | Each launch slows the next one |
| Destination penalty | `destFailPenalty` | Avoid previously-failed targets |
| Failure strikes | `failureStrikeLimit` | Pause launches after N consecutive failures |
| Mission abandonment | `missionAbandonment` | Robot worlds randomly stop (go DEAD) |

Set most parameters to 0 (or 1 for `goalCoherence`) to disable that mechanism. This lets you compare bounded-expansion runs against the unconstrained Hart-Tipler baseline.

## Parameters

See `docs/PARAMETERS.md` for full descriptions of every parameter, valid ranges, and how each one affects expansion dynamics.

## What to expect from the default preset

With the **Bounded Expansion Preset**, typical runs over 2-5 million simulated years show:

- First off-world human colony: ~100K - 700K years
- Second human colony (when it occurs): ~1M - 2M years
- Third human colony: rare (but can go to ~5, even ~20 if "robot stand down" set to 0%).
- Peak robot world count: ~20-50, then declining
- Final state: a few human worlds and a few robot worlds clustered near Sol, dead robot worlds in between; most of the grid uncolonized 

Running without the bounded mechanisms produces something closer to the Hart-Tipler outcome.

These behaviors illustrate the qualitative difference between the tuned bounded regime and the unconstrained Hart–Tipler-like outcome. Results are highly parameter-dependent and should not be treated as robust predictions.

## Architecture

| File | Role |
|---|---|
| index.html | UI shell
| app.js |  Browser UI (parameter binding, render loop, controls)
| simulation.js | Core simulation engine (works in browser & Node.js)
| tune.mjs | Iterative parameter search via mutation
| quick-tune.mjs | Compare named candidate parameter sets
| docs/ | Methodology, parameter reference, open issues, roadmap

## What This Model Does NOT Capture

This is a deliberately simple first-order **toy model**. Known omissions are documented in [`docs/OPEN_ISSUES.md`](docs/OPEN_ISSUES.md) and include:

- 2D grid instead of realistic 3D stellar distribution
- No stellar drift or galactic dynamics
- No habitability filter (all cells are equally targetable)
- No civilization lifespan (mature worlds persist forever)
- No technology evolution over time
- No inter-civilization interaction (conflict, trade)
- No anthropic timing effects (Carter's hard steps)
- Deceleration time treated as zero

These are deliberate scope decisions. The simulation *attempts* to explore whether motivational and coordination constraints, in combination, can produce limited expansion in this simplified framework.
## Current central weakness

A known central weakness is that bounded behavior currently emerges from a collection of tuned friction parameters rather than emerging cleanly from one or two principled mechanisms. 

On the roadmap is an attempt to collapse many of these into a coherence-length framework (signal-lag vs. civilizational coherence time) combined with a hard maximum colonization radius. This should recover Landis (1998)-style percolation behavior in the appropriate limits. However, moving to 3D and properly validating against literature results remains non-trivial.

## Status

**Exploratory code / toy model.** Parameters, mechanics, and fundamental approach may change. Use it for thought experiments and scenario exploration. **Not suitable as the basis for published claims** at this stage.

The intended trajectory is:
1. Refine the model based on use and feedback (current phase)
2. Write up methodology and findings as a working paper
3. Eventually publish (long-term goal).

The model is being developed slowly as a side project. No commitment to a timeline.

## Related Literature

The model engages with ideas from:
- Hart (1975), Tipler (1980) -- exponential colonization argument
- Landis (1998) -- percolation model of galactic colonization
- Bjork (2007) -- probe-based exploration limits
- Hanson (1998) -- Great Filter and burning the cosmic commons
- Kennedy et al. (2006) -- the wait calculation
- Sandberg, Drexler & Ord (2018) -- Bayesian dissolution of the Fermi paradox
- Carter (1983) -- anthropic hard-steps model

It includes an explicit (though relatively simple) mechanism for **cultural-informational decay** (`goalCoherence`) as one possible constraint alongside physical and economic limits.

## Contributing

This is a personal project, but issues and PRs are welcome -- especially around:
- Validation against existing literature
- Parameter regimes that produce interesting outcomes
- Realistic constraints not yet modeled
- Performance improvements for large grids
- 3D extension

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for planned work and [`docs/OPEN_ISSUES.md`](docs/OPEN_ISSUES.md) for known limitations.

## License

MIT -- see [`LICENSE`](LICENSE).

If you use this in academic work, a citation is appreciated. See [`CITATION.cff`](CITATION.cff).

## Acknowledgments

The conceptual framework was developed through extended discussion with Claude (Anthropic). The implementation and any errors are mine.
