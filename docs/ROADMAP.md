# Roadmap

A loose, non-binding sequence of work -- if and when there's time.

## Phase 1: Foundation (current state)

- Working browser simulation
- Bounded expansion preset
- Optional mechanics that can be toggled off to recover Hart-Tipler baseline
- Parameter tuning scripts (`tune.mjs`, `quick-tune.mjs`)
- Documentation (this set of files)
- Public on GitHub under MIT
- One follow-up commit per noted bug in `OPEN_ISSUES.md` (II-1, II-2 minimum)

## Phase 2: Validation and instrumentation

- V-1: Reproduce a known result from literature (Landis 1998 or similar)
- V-3: Multi-seed statistical runs in the UI
- V-4: Map parameters to physical regimes (Kardashev / energy budgets)
- E-1: CSV / JSON export of run statistics
- E-5: Time-series visualization

## Phase 3: Conceptual depth

- CG-1: Habitability filter on target cells
- CG-2: Civilization lifespan
- CG-6: Explicit robot motivation logic
- CG-8: Better distance metric (Euclidean on hex grid, or 3D voxel)

## Phase 4: Multi-civilization

- E-3: Multiple home worlds at start
- CG-5: Inter-civilization interaction (merge / conflict / ignore)
- E-7: Berserker / hostile expansion mode

## Phase 5: Writeup

- Working paper documenting the model and findings
- Comparison of bounded-expansion vs Hart-Tipler regimes across parameter sweeps
- Submission to a venue

## Aspirational

- 3D extension with real local stellar data (Gaia DR3)
- Anthropic timing layer (Carter hard-steps integration)
- Integration with cosmological-isolation arguments

## Non-Goals

For clarity, these are *not* planned:

- Trying to be a comprehensive Fermi Paradox model
- Replacing existing tools (Sandberg's work, etc.) -- this is complementary, not competitive
- Realistic propulsion / engineering modeling -- parameters abstract over this
- Game / entertainment features
- Real-time multi-user collaboration
- Mobile-first UI

## How to think about timing

This is a side project. Reasonable expectations:

- **Phase 1** finishing: done with this commit
- **Phase 2** (validation): months of available evenings/weekends
- **Phase 3** (conceptual depth): a year or more
- **Phase 4 / 5**: post-retirement-from-IT timescale (could be sooner than I'd guess)

If the project goes dormant, the documentation and code here should be enough to either resume or hand off.
