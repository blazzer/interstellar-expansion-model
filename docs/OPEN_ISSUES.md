# Open Issues and Known Limitations

Systematically catalogued for future work. Nothing here is being actively fixed right now -- this is a punch-list to return to when there's time.

Issues are grouped by severity:
- **Conceptual gaps** -- things the model should encode but doesn't
- **Implementation issues** -- bugs, performance, code quality
- **Enhancements** -- would be nice, not urgent
- **Validation gaps** -- checks against literature / sanity

---

## Conceptual Gaps

### CG-1: No habitability filter on targets
All UNCOLONIZED cells are equally valid launch targets. Reality is much harsher: roughly 0.2-0.4% of stars are plausible candidates (F/G/K spectral type, sufficient metallicity, no planet-destroying neighbors). Currently this is hidden inside `colonyFailRate`, but it would be more honest to factor it out.

**Approach when fixing**: Add `f_suitable` parameter; at simulation reset, flag a fraction of cells as suitable. Unsuitable cells either always-fail-on-arrival or are never selectable.

### CG-2: No civilization lifespan
Mature worlds persist forever. Real civilizations have finite lifetimes (10K-1M years on most estimates). Without lifespan, the model overstates the equilibrium colony count.

**Approach when fixing**: Add per-world expiration probability per millennium, or a fixed/distributed lifespan. On expiration, world transitions to a new state (`EXTINCT`?) that no longer launches but doesn't free the cell.

### CG-3: No stellar drift
Cells are stationary. Over the timescales the simulation explores (10s of Myr), real stars drift by ~30 km/s -- roughly 0.1 ly per 100,000 years. Long missions might miss intended targets. For missions under 100K years this is negligible; for the longer ones it matters.

**Approach when fixing**: Cell positions could drift slowly; longer missions need course correction with success penalty.

### CG-4: No technology evolution
Civilization-level parameters (transit speed, success rates, capability) are static across the whole run. Real civilizations advance -- and conversely, can regress after catastrophe.

**Approach when fixing**: Slow drift of key parameters within bounds; perhaps tied to a "civilization age" counter.

### CG-5: No inter-civilization dynamics
Independent expansion bubbles from different human origins can't interact. No conflict, no trade, no knowledge exchange, no contamination.

**Approach when fixing**: When two networks come within coordination range, define interaction outcomes (merge, conflict, ignore). Probably best as opt-in mechanic.

### CG-6: Robot motivation is hand-waved
Robots launch because they have "capability". But why? The simulation works because capability decays, but the underlying motivation is left implicit.

**Approach when fixing**: Make robot launches conditional on explicit goals: "is there a human world in network within X cells?" If yes, expand toward it. If no, slow / stop. Currently the "stand down when human established" rule approximates this only crudely.

### CG-7: No deceleration phase
Probes arrive instantaneously at the end of their transit time. Real missions spend significant fractions of their travel time decelerating.

**Approach when fixing**: Track terminal-phase as a separate state. Minor effect compared to other limits.

### CG-8: 2D grid in a 3D galaxy
Manhattan distance on a square grid underestimates accessible volume (a 3D sphere at radius r contains ~r^3 cells, not ~r^2) but overestimates connectivity (each cell has 4 neighbors, real 3D has ~6). These bias different ways.

**Approach when fixing**: Either move to 3D voxel grid or use Euclidean / hexagonal metric on 2D grid. 3D is significant rewrite; better metric on 2D is shorter.

### CG-9: No Carter / hard-steps timing
Civilizations are assumed to exist at all times in parallel. Real emergence is anthropically biased toward late in habitable windows; most parts of galactic history have no civilizations at all.

**Approach when fixing**: Likely beyond scope of this percolation model. Could be addressed by stochastic civilization start times rather than starting with Sol at t=0.

### CG-10: No cosmological isolation
Model is intra-galactic. Doesn't address intergalactic / supercluster-scale isolation that dominates at universe scale.

**Approach when fixing**: Probably out of scope; better as a separate model layered on top.

---

## Implementation Issues

### II-1: Robot decay period (RESOLVED)
`robotDecayPeriod` is now a real parameter: defined in `CORE_PARAM_DEFS`, surfaced in
the UI, and wired through `normalizeParams` into `robotDecayPeriodYears` (used by
`_getRobotProbeCapability`). `ROBOT_CAPABILITY_DECAY_PERIOD` remains only as the default
fallback. `tune.mjs` mutates the real parameter, and its earlier phantom
`initialLaunchProb` key was corrected to `solInitialLaunchProb` / `humanInitialLaunchProb`
(with a `Number.isFinite` guard so unknown keys are skipped).

### II-2: Missing input validation
**Status**: Fixed -- `normalizeParams` throws on non-finite parameter values and `decisionCycle <= 0`.

### II-3: `humanOrigin` chain can break when origin dies
If a human origin world is somehow lost (currently it can't be, but if civilization lifespan or destruction is added -- see CG-2 -- this matters), robot worlds reference a dead human. Network membership becomes undefined.

**Fix**: When civilization lifespan is added, decide what happens to orphaned robots -- go DEAD? Continue autonomously? Choose a new origin?

### II-4: Mission abandonment is robot-only
Humans only stop expanding via failure-strike timeouts. No analog of "humanity loses interest in space" beyond that.

**Fix**: Add symmetric mechanic for humans, or document why asymmetry is intentional.

### II-5: `_findLaunchTargets` is O(N^2) per call
For 100x100 or larger grids, finding launch targets becomes the dominant cost.

**Fix**: Maintain a sorted spatial index of uncolonized cells per origin.

### II-6: `findNextEventYear` enumerates maturation rolls
For dense states with many maturing colonies, this can be slow.

**Fix**: Sort by next-event-year; maintain a priority queue.

### II-7: `robotFragmentResourceMult` accumulates without bound
Each launch multiplies it by `(1 + resourceDepletion)`. Over hundreds of launches it can become astronomical, which is mostly fine (just means the world won't launch again) but is numerically ugly.

**Fix**: Cap at some maximum; or transition to "exhausted" state explicitly.

### II-8: FNV-1a snapshot has theoretical collision risk
Used to detect grid changes for "forward to next event". Hash collisions would mean missed events.

**Fix**: Track explicit change flag instead of hashing; only use hash as backup.

### II-9: No way to seed RNG from the UI
Repeatable runs require editing `tune.mjs`. The browser UI uses `Math.random` exclusively.

**Fix**: Expose seed field in UI; show it in readout for reproducibility.

### II-10: No export / save state
Long runs cannot be saved and resumed. Results are not exportable.

**Fix**: Add JSON export of full state and history.

### II-11: Failure penalty clustering within the pipeline window
When decisionCycle < transitTime + maturationTime, several in-flight probes can fail within a few ticks, compounding failurePenalty multiple times almost instantly (e.g. 0.5^4 ~ 94% motivation loss). Currently accepted as a 'confidence crisis' dynamic and buffered for Sol via high initial motivation. Possible future refinement: dampen failure penalties that land within one pipeline window of each other so co-launched probes share a single confidence hit rather than stacking.

---

## Enhancements

### E-1: CSV / JSON export of run statistics
For external analysis of many runs (parameter sweeps, plotting, statistics). Should include human colony events, counts over time, parameter set used.

### E-2: Multi-run / sweep mode
Run N seeds in batch; show distribution of outcomes. Currently `tune.mjs` does this but isn't integrated into the UI.

### E-3: Multiple home worlds
Start with M civilizations at random positions, not just Sol. Lets the model explore interaction between independent expansion bubbles (depends on CG-5).

### E-4: Heatmap of "where did colonization stop" across many runs
Plot saturation envelope across N runs of the same parameters. Visualizes the "bubble".

### E-5: Time-series plots
Colonies / motivation over time, not just current state. Helps build intuition for the dynamics.

### E-6: Parameter presets dropdown
Hart-Tipler unconstrained, Rare Earth, Bounded Expansion, etc. as named selections.

### E-7: Berserker / hostile expansion mode
A "civilization" whose successes destroy nearby biospheres (other civs) rather than colonizing them. Asymmetric expansion dynamics.

### E-8: Annotated example runs in docs/
Step-by-step walkthroughs of canonical runs showing interesting moments.

### E-9: Tooltip on parameters
Brief inline help in the UI for each parameter.

### E-10: Light / dark mode UI toggle
Current scheme is dark only.

### E-11: Motivation resurrection under existential pressure
Quiet human worlds (effective motivation floored to 0 via MOTIVATION_FLOOR) retain their stored launchProbability. A future mechanic could 'resurrect' a quiet or declining civilization when it faces imminent collapse or an external threat, lifting motivation back to an active level. Requires defining the trigger (local threat, network near-extinction, etc.) and the restored motivation level. The hard floor (CHANGE 2) is a prerequisite: resurrection should lift from a clean zero, not from floating-point noise.

---

## Validation Gaps

### V-1: No comparison against published percolation results
Should reproduce Landis (1998) or similar known results as a sanity check. Currently no baseline.

### V-2: Parameter sensitivity analysis not formalized
Which parameters matter most? Currently informal -- `tune.mjs` finds local optima but doesn't characterize the sensitivity landscape.

**Approach**: Latin Hypercube Sampling or Sobol indices over parameter space.

### V-3: No statistical characterization of outcomes
Single-seed runs are shown. Need distributions over many seeds: median first-colony time, fraction reaching N humans by time T, etc.

### V-4: Parameter values not grounded in literature
Choices like "transit time 5,000 years/cell" or "robot launch limit 5-15" are intuition-based, not derived from realistic engineering / energy budgets.

**Approach**: Map parameters to physical regimes from energy / propulsion / Kardashev arguments. Cite sources. (Connected to "capability assessment" thinking from background notes.)

### V-5: No falsification criteria stated
What would falsify the model? What observation would force the bounded-expansion interpretation to be revised? Should be made explicit.

---

## Priorities (when work resumes)

If/when this picks back up, rough priority order:

Note: CHANGE 1 (hole-filling) and CHANGE 2 (motivation floor) are now DONE.

1. **V-3** -- Distributions over many seeds (cheap, immediately useful)
2. **V-1** - Validation against known percolation results (sanity check)
3. **V-4** -- Map parameters to physical regimes (frames the model's claims)
4. **CG-1** -- Habitability filter (most impactful conceptual gap)
5. **CG-2** -- Civilization lifespan (the other big one)
6. **E-1** -- Export for external analysis (enables everything else)
7. **II-9** -- Code hygiene (low effort, increases trust); II-1 and II-2 are now resolved
8. Everything else as opportunity allows.