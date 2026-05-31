// -------------------------------------------------------------------------
// Constants & configuration defaults
// -------------------------------------------------------------------------

export const STATE = Object.freeze({
  UNCOLONIZED: 'UNCOLONIZED',
  IN_TRANSIT:  'IN_TRANSIT',
  MATURING:    'MATURING',
  MATURE:      'MATURE',
  DORMANT:     'DORMANT',
  DEAD:        'DEAD',
});

export const COLONY_TYPE = Object.freeze({
  HUMAN: 'HUMAN',
  ROBOT: 'ROBOT',
});

/** Base colors for non-mature states */
export const STATE_COLORS = Object.freeze({
  [STATE.UNCOLONIZED]: '#3a3a3a',
  [STATE.IN_TRANSIT]:  '#22d3ee',
  [STATE.MATURING]:    '#e87830',
  [STATE.DORMANT]:     '#5a7090',
  [STATE.DEAD]:        '#e04040',
});

/** Mature colony colors by type */
export const MATURE_COLORS = Object.freeze({
  sol:   '#ffd700',
  human: '#3ddc60',
  robot: '#5eb3ff',
});

/** Core parameter definitions */
export const CORE_PARAM_DEFS = [
  { id: 'gridSize',           label: 'Grid Size',                  default: 50,    unit: 'cells',  min: 10,  max: 200, step: 1    },
  { id: 'transitTime',        label: 'Transit Time',               default: 5000,  unit: 'years',  min: 0,   max: 1e6, step: 1000 },
  { id: 'maturationTime',     label: 'Maturation Time',            default: 5000,  unit: 'years',  min: 0,   max: 1e6, step: 1000 },
  { id: 'decisionCycle',      label: 'Decision Cycle',             default: 3000,  unit: 'years',  min: 1000,max: 1e6, step: 1000 },
  { id: 'solInitialLaunchProb', label: 'Sol Initial Motivation',   default: 5000,  unit: '%',      min: 0,   max: 10000, step: 1    },
  { id: 'humanInitialLaunchProb', label: 'Human Colony Initial Motivation', default: 50, unit: '%', min: 0, max: 100, step: 1 },
  { id: 'transitFailRate',    label: 'Transit Failure Rate',       default: 50,    unit: '%',      min: 0,   max: 100, step: 1    },
  { id: 'colonyFailRate',     label: 'Colony Failure Rate',        default: 50,    unit: '% cum.', min: 0,   max: 100, step: 1    },
  { id: 'robotColonyRate',    label: 'Robot Colony Rate',          default: 90,    unit: '%',      min: 0,   max: 100, step: 1    },
  { id: 'robotSuccessBonus',  label: 'Robot Success Bonus',        default: 10,    unit: '% bonus',min: 0,   max: 500, step: 1    },
  { id: 'robotCapabilityDecay',label: 'Robot Capability Decay',    default: 20,    unit: '%/period',min: 0,  max: 100, step: 1    },
  { id: 'robotDecayPeriod',   label: 'Robot Decay Period',         default: 100000,unit: 'years',  min: 1000,max: 1e7, step: 1000 },
  { id: 'successBonus',       label: 'Human Success Bonus',        default: 20,    unit: '% bonus',min: 0,   max: 500, step: 1    },
  { id: 'failurePenalty',     label: 'Failure Probability Penalty',default: 50,    unit: '% penalty',min:0,  max: 100, step: 1    },
  { id: 'distancePenalty',    label: 'Distance Motivation Penalty',default: 1.2,   unit: 'x/step', min: 1,   max: 10,  step: 0.1  },
];

/** All four must be satisfied for strict bounded mode (see isStrictBoundedMode) */
export const STRICT_BOUNDED_TRIGGER_DEFS = [
  { id: 'robotStandDown',     label: 'Robot Stand Down',           default: 100,   unit: '% on human success', min: 0, max: 100, step: 1 },
  { id: 'humanStandDown',     label: 'Human Stand Down',           default: 70,    unit: '% motivation drop', min: 0, max: 100, step: 1 },
  { id: 'goalCoherence',      label: 'Goal Coherence / Millennium',default: 0.999, unit: '1=off',    min: 0.9, max: 1,   step: 0.001},
  { id: 'missionAbandonment', label: 'Mission Abandonment',        default: 0.1,   unit: '%/mill',   min: 0,   max: 10,  step: 0.01 },
];

/** Launch-motivation penalties applied only when strict bounded mode is active */
export const STRICT_BOUNDED_PENALTY_DEFS = [
  { id: 'humanFoundedLaunchPct', label: 'Human-Founded Launch Motivation', default: 5,  unit: '% kept', min: 0, max: 100, step: 1 },
  { id: 'nonPreferredLaunchPct', label: 'Non-Preferred Launcher Motivation', default: 25, unit: '% kept', min: 0, max: 100, step: 1 },
];

/** Other optional mechanics -- 0 or 1 often disables the feature */
export const GENERAL_OPTIONAL_PARAM_DEFS = [
  { id: 'robotLaunchMin',     label: 'Robot Launch Min',           default: 5,     unit: 'launches', min: 0,   max: 100, step: 1    },
  { id: 'robotLaunchMax',     label: 'Robot Launch Max',           default: 15,    unit: '0=off',    min: 0,   max: 100, step: 1    },
  { id: 'resourceDepletion',  label: 'Resource Depletion',         default: 5,     unit: '%/launch', min: 0,   max: 100, step: 1    },
  { id: 'destFailPenalty',    label: 'Destination Fail Penalty',   default: 20,    unit: '%/fail',   min: 0,   max: 100, step: 1    },
  { id: 'failureStrikeLimit', label: 'Failure Strike Limit',       default: 5,     unit: '0=off',    min: 0,   max: 20,  step: 1    },
  { id: 'failureTimeoutYears',label: 'Failure Timeout',            default: 100,   unit: 'x1,000 y', min: 1,   max: 1e6, step: 1    },
  { id: 'robotSiteHumanPenalty', label: 'Former Robot -> Human Penalty', default: 0, unit: '%/robot pass', min: 0, max: 100, step: 1 },
];

export const OPTIONAL_PARAM_DEFS = [
  ...STRICT_BOUNDED_TRIGGER_DEFS,
  ...STRICT_BOUNDED_PENALTY_DEFS,
  ...GENERAL_OPTIONAL_PARAM_DEFS,
];

export const PARAM_DEFS = [...CORE_PARAM_DEFS, ...OPTIONAL_PARAM_DEFS];

/** True when all strict-bounded trigger thresholds are met (bounded preset profile). */
export function isStrictBoundedMode(params) {
  return params.robotStandDown >= 100
    && params.humanStandDown > 0
    && params.goalCoherence < 1
    && params.missionAbandonment > 0;
}

export const DEFAULT_RAW_PARAMS = Object.fromEntries(
  PARAM_DEFS.map((def) => [def.id, def.default])
);

/** Tuned preset: ~5-10 human worlds by 10M y, ~4-6% sector fill, robot-led probes */
export const BOUNDED_EXPANSION_PARAMS = {
  gridSize: 50,
  transitTime: 5000,
  maturationTime: 4000,
  decisionCycle: 3000,
  solInitialLaunchProb: 5000,
  humanInitialLaunchProb: 10,
  transitFailRate: 28,
  colonyFailRate: 32,
  robotColonyRate: 95,
  robotSuccessBonus: 14,
  robotCapabilityDecay: 5,
  robotDecayPeriod: 100000,
  successBonus: 12,
  failurePenalty: 44,
  distancePenalty: 1.28,
  robotLaunchMin: 0,
  robotLaunchMax: 0,
  resourceDepletion: 2,
  goalCoherence: 0.9983,
  destFailPenalty: 12,
  failureStrikeLimit: 6,
  failureTimeoutYears: 90,
  missionAbandonment: 1.2,
  robotSiteHumanPenalty: 45,
  robotStandDown: 100,
  humanStandDown: 70,
  humanFoundedLaunchPct: 5,
  nonPreferredLaunchPct: 25,
};

/** Hart-Tipler unconstrained: self-replicating probes, no robot stand-down on human success */
export const HART_TIPLER_PARAMS = {
  gridSize: 50,
  transitTime: 1500,
  maturationTime: 1500,
  decisionCycle: 1500,
  solInitialLaunchProb: 5000,
  humanInitialLaunchProb: 50,
  transitFailRate: 8,
  colonyFailRate: 10,
  robotColonyRate: 96,
  robotSuccessBonus: 20,
  robotCapabilityDecay: 0,
  robotDecayPeriod: 100000,
  successBonus: 25,
  failurePenalty: 20,
  distancePenalty: 1.05,
  robotLaunchMin: 0,
  robotLaunchMax: 0,
  resourceDepletion: 0,
  goalCoherence: 1,
  destFailPenalty: 0,
  failureStrikeLimit: 0,
  failureTimeoutYears: 100,
  missionAbandonment: 0,
  robotSiteHumanPenalty: 0,
  robotStandDown: 0,
  humanStandDown: 0,
  humanFoundedLaunchPct: 5,
  nonPreferredLaunchPct: 25,
};


export const TICK = 1000; // simulation step size in years
export const MAX_YEAR = 1_000_000_000; // hard cap for forward-to-event jumps

export const MOTIVATION_FLOOR = 0.001; // below this, a human world is "quiet"

/** Robot capability decays by robotCapabilityDecay % over each interval */
export const ROBOT_CAPABILITY_DECAY_PERIOD = 100_000;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function nowMs() {
  // In browser: performance.now(); in node: performance may exist; fallback to Date.now().
  return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
}

/** Schedule an event at the next tick boundary on or after fromYear + delay */
export function scheduleAt(fromYear, delayYears) {
  const target = fromYear + Math.max(0, delayYears);
  return Math.ceil(target / TICK) * TICK;
}

/** Human colony share at maturation, reduced after prior robot colonizations at the site */
export function effectiveHumanColonyFrac(baseHumanFrac, priorRobotColonizations, penaltyFrac) {
  const human = clamp(baseHumanFrac, 0, 1);
  if (penaltyFrac <= 0 || priorRobotColonizations <= 0) return human;
  return clamp(human * Math.pow(1 - clamp(penaltyFrac, 0, 1), priorRobotColonizations), 0, 1);
}

/** Normalize raw parameter values into simulation-ready derived fields */
export function normalizeParams(raw) {
  const p = { ...DEFAULT_RAW_PARAMS, ...raw };

  for (const def of PARAM_DEFS) {
    p[def.id] = Number(p[def.id]);
    if (!Number.isFinite(p[def.id])) {
      throw new TypeError(`Invalid or missing parameter: ${def.id}`);
    }
  }
  if (p.decisionCycle <= 0) {
    throw new RangeError('decisionCycle must be > 0');
  }

  p.robotStandDownFrac = clamp(p.robotStandDown / 100, 0, 1);
  p.humanStandDownMult = 1 - clamp(p.humanStandDown / 100, 0, 1);

  // Convert percentages to fractions / multipliers
  p.solInitialLaunchProbFrac = Math.max(0, p.solInitialLaunchProb / 100);
  p.humanInitialLaunchProbFrac = clamp(p.humanInitialLaunchProb / 100, 0, 1);
  p.maxStoredMotivation = Math.max(1, p.solInitialLaunchProbFrac);
  p.successBonusMult      = 1 + p.successBonus / 100;
  p.robotSuccessBonusMult = 1 + p.robotSuccessBonus / 100;
  p.failurePenaltyMult    = 1 - p.failurePenalty / 100;
  p.robotColonyFrac       = clamp(p.robotColonyRate / 100, 0, 1);
  p.robotCapabilityDecayFrac = clamp(p.robotCapabilityDecay / 100, 0, 1);
  p.robotDecayPeriodYears = p.robotDecayPeriod > 0
    ? p.robotDecayPeriod
    : ROBOT_CAPABILITY_DECAY_PERIOD;

  p.transitFailFrac = clamp(p.transitFailRate / 100, 0, 1);
  p.colonyFailFrac  = clamp(p.colonyFailRate / 100, 0, 1);
  p.humanColonyFrac = 1 - p.robotColonyFrac;
  p.transitSurvivalFrac = 1 - p.transitFailFrac;
  p.colonySurvivalFrac  = 1 - p.colonyFailFrac;
  p.endToEndHumanFrac   = p.transitSurvivalFrac * p.colonySurvivalFrac * p.humanColonyFrac;
  p.endToEndRobotFrac   = p.transitSurvivalFrac * p.colonySurvivalFrac * p.robotColonyFrac;

  // Optional mechanics (0 or threshold disables)
  p.robotLaunchLimitOn  = p.robotLaunchMax > 0;
  p.robotLaunchMinVal   = Math.max(0, Math.floor(p.robotLaunchMin));
  p.robotLaunchMaxVal   = Math.max(0, Math.floor(p.robotLaunchMax));
  p.resourceDepletionFrac = p.resourceDepletion > 0 ? p.resourceDepletion / 100 : 0;
  p.goalCoherenceOn     = p.goalCoherence < 1;
  p.destFailPenaltyFrac = p.destFailPenalty > 0 ? p.destFailPenalty / 100 : 0;
  p.failureStrikeOn     = p.failureStrikeLimit > 0;
  p.failureTimeoutYearsVal = Math.max(TICK, Math.floor(p.failureTimeoutYears) * TICK);
  p.missionAbandonmentOn = p.missionAbandonment > 0;
  p.missionAbandonmentPerMill = p.missionAbandonment / 100;
  p.missionAbandonmentPerTick = 1 - Math.pow(
    1 - p.missionAbandonmentPerMill, TICK / 1000
  );
  p.robotSiteHumanPenaltyFrac = clamp(p.robotSiteHumanPenalty / 100, 0, 1);
  p.robotSiteHumanPenaltyOn = p.robotSiteHumanPenalty > 0;
  p.humanFoundedLaunchMult = clamp(p.humanFoundedLaunchPct / 100, 0, 1);
  p.nonPreferredLaunchMult = clamp(p.nonPreferredLaunchPct / 100, 0, 1);
  p.strictBoundedModeOn = isStrictBoundedMode(p);

  // Spread cumulative colony failure across independent 1 000-year rolls.
  const maturationTicks = Math.max(0, Math.round(p.maturationTime / TICK));
  p.perTickColonyFailRate = maturationTicks > 0
    ? 1 - Math.pow(1 - p.colonyFailFrac, 1 / maturationTicks)
    : 0;

  return p;
}

function createNode() {
  return {
    state: STATE.UNCOLONIZED,
    launchProbability: 0,
    nextDecisionYear: Infinity,
    transitEndYear: Infinity,
    maturationStartYear: Infinity,
    maturationEndYear: Infinity,
    parent: null,
    humanOrigin: null,
    colonyType: null,
    isSol: false,
    robotNetworkNextDecisionYear: Infinity,
    robotFragmentResourceMult: 1,
    robotProbeCapability: 0,
    robotFoundedYear: 0,
    robotLaunchesUsed: 0,
    robotLaunchLimit: Infinity,
    robotFailureStrikes: 0,
    robotLaunchTimeoutUntil: 0,
    humanFailureStrikes: 0,
    launchTimeoutUntil: 0,
    revertStateOnFail: null,
    failedMissionAttempts: 0,
    hasNewHumanHomeworld: false,
    missionCompleteCause: null,
    probesSent: 0,
    networkRobotProbesSent: 0,
    priorRobotColonizations: 0,
    humanFoundedYear: 0,
    spawnedFromRobot: false,
    lastFoundTargetDistance: 1,
    humanCanLaunch: false,
    activeHumanLauncher: null,
    inboundFromR: null,
    inboundFromC: null,
    inboundFromLabel: null,
    history: [],
  };
}

function manhattanDistance(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

/** Motivation fades with distance: prob / penalty^(distance - 1) */
function effectiveLaunchProbability(baseProb, distance, penaltyBase) {
  if (distance <= 1) return baseProb;
  return baseProb / Math.pow(penaltyBase, distance - 1);
}

/** Grid fill / colony mix for tests and analysis */
export function getColonizationStats(sim) {
  const total = sim.gridSize * sim.gridSize;
  let uncolonized = 0;
  let inTransit = 0;
  let maturing = 0;
  let mature = 0;
  let dormant = 0;
  let dead = 0;

  for (let r = 0; r < sim.gridSize; r++) {
    for (let c = 0; c < sim.gridSize; c++) {
      switch (sim.grid[r][c].state) {
        case STATE.UNCOLONIZED: uncolonized++; break;
        case STATE.IN_TRANSIT:  inTransit++;  break;
        case STATE.MATURING:    maturing++;    break;
        case STATE.MATURE:      mature++;       break;
        case STATE.DORMANT:     dormant++;     break;
        case STATE.DEAD:        dead++;        break;
      }
    }
  }

  const counts = sim.getCounts();
  const engaged = total - uncolonized;

  return {
    total,
    uncolonized,
    inTransit,
    maturing,
    mature,
    dormant,
    dead,
    engaged,
    fillRatio: engaged / total,
    matureRatio: mature / total,
    counts,
    humanColonyEvents: sim.humanColonyEvents.length,
    year: sim.currentYear,
  };
}

export class PercolationSimulation {
  constructor(rawParams = {}, options = {}) {
    this._rng = options.rng ?? Math.random;
    this._rawParams = { ...DEFAULT_RAW_PARAMS, ...rawParams };
    this._params = normalizeParams(this._rawParams);
    this._grid = [];
    this._gridSize = Math.floor(this._params.gridSize);
    this._currentYear = 0;

    // Profiling (off by default): accumulators updated only when enabled.
    this._profilingEnabled = false;
    this._profile = {
      tickMs: 0,
      phases: Object.create(null),
      fns: Object.create(null),
      counts: Object.create(null),
    };

    // Cache of manhattan-distance offset lists: d -> Array<[dr, dc]>
    this._distanceOffsets = new Map();

    // Fast counts for "are there any targets?" checks.
    this._uncolonizedCount = 0;
    this._dormantCount = 0;

    this.humanColonyEvents = [];
    this.totalProbesSent = 0;
    this.humanProbesSent = 0;
    this.robotProbesSent = 0;
    this.reset();
  }

  setProfilingEnabled(enabled) {
    this._profilingEnabled = !!enabled;
  }

  resetProfiling() {
    this._profile.tickMs = 0;
    this._profile.phases = Object.create(null);
    this._profile.fns = Object.create(null);
    this._profile.counts = Object.create(null);
  }

  getProfiling() {
    return {
      enabled: this._profilingEnabled,
      tickMs: this._profile.tickMs,
      phases: { ...this._profile.phases },
      fns: { ...this._profile.fns },
      counts: { ...this._profile.counts },
    };
  }

  _profCount(key, inc = 1) {
    if (!this._profilingEnabled) return;
    this._profile.counts[key] = (this._profile.counts[key] ?? 0) + inc;
  }

  _profTimePhase(bucket, startMs) {
    if (!this._profilingEnabled) return;
    const dt = nowMs() - startMs;
    this._profile.phases[bucket] = (this._profile.phases[bucket] ?? 0) + dt;
  }

  _profTimeFn(bucket, startMs) {
    if (!this._profilingEnabled) return;
    const dt = nowMs() - startMs;
    this._profile.fns[bucket] = (this._profile.fns[bucket] ?? 0) + dt;
  }

  random() {
    return this._rng();
  }

  get grid() {
    return this._grid;
  }

  get currentYear() {
    return this._currentYear;
  }

  get gridSize() {
    return this._gridSize;
  }

  setRawParams(rawParams) {
    this._rawParams = { ...DEFAULT_RAW_PARAMS, ...rawParams };
    this._params = normalizeParams(this._rawParams);
  }

  reset(rawParams) {
    if (rawParams) this._rawParams = { ...DEFAULT_RAW_PARAMS, ...rawParams };
    this._params = normalizeParams(this._rawParams);
    this._gridSize = Math.floor(this._params.gridSize);
    this._currentYear = 0;
    this._distanceOffsets?.clear?.();
    this.humanColonyEvents = [];
    this.totalProbesSent = 0;
    this.humanProbesSent = 0;
    this.robotProbesSent = 0;

    this._grid = [];
    for (let r = 0; r < this._gridSize; r++) {
      const row = [];
      for (let c = 0; c < this._gridSize; c++) row.push(createNode());
      this._grid.push(row);
    }

    this._uncolonizedCount = this._gridSize * this._gridSize;
    this._dormantCount = 0;

    const mid = Math.floor(this._gridSize / 2);
    const home = this._grid[mid][mid];
    home.state = STATE.MATURE;
    home.colonyType = COLONY_TYPE.HUMAN;
    home.isSol = true;
    home.humanOrigin = home;
    home.launchProbability = this._params.solInitialLaunchProbFrac;
    home.nextDecisionYear = 0;
    home.robotNetworkNextDecisionYear = Infinity;
    home.hasNewHumanHomeworld = false;
    home.missionCompleteCause = null;
    home.humanFailureStrikes = 0;
    home.launchTimeoutUntil = 0;
    home.probesSent = 0;
    home.networkRobotProbesSent = 0;
    home.humanFoundedYear = 0;
    home.humanCanLaunch = true;
    home.activeHumanLauncher = home;
    home.history = [];

    // Sol is no longer uncolonized.
    this._uncolonizedCount--;
  }

  _handoffActiveHumanLauncher(origin, node, params) {
    if (!origin || !params || node.isSol) return;
    // "Active launcher" is a coordination hint, not a hard disable.
    // Non-active launchers still attempt launches but at reduced effective motivation.
    origin.activeHumanLauncher = node;
    node.humanCanLaunch = true;
    node.launchProbability = params.humanInitialLaunchProbFrac;
    node.nextDecisionYear = scheduleAt(this._currentYear, params.decisionCycle);
  }

  _standDownRobotNetwork(origin) {
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.ROBOT) continue;
        if (node.humanOrigin !== origin) continue;
        this._logNodeEvent(node, { type: 'stand_down' });
        this._setDormant(node, r, c);
      }
    }
  }

  _setMissionComplete(node, cause, extra = {}) {
    node.hasNewHumanHomeworld = true;
    node.missionCompleteCause = cause;
    this._logNodeEvent(node, { type: 'mission_complete', via: cause, ...extra });
  }

  _isBoundedExpansion(params) {
    return params.robotStandDown > 0 || params.humanStandDown > 0;
  }

  _logNodeEvent(node, event) {
    if (!node.history) node.history = [];
    node.history.push({ year: this._currentYear, ...event });
  }

  _nodeLabel(r, c, node) {
    if (node.isSol) return 'Sol';
    if (node.state === STATE.MATURE && node.colonyType === COLONY_TYPE.HUMAN) {
      return `Human (${r},${c})`;
    }
    if (node.state === STATE.MATURE && node.colonyType === COLONY_TYPE.ROBOT) {
      return `Robot (${r},${c})`;
    }
    return `Site (${r},${c})`;
  }

  _findNodeCoords(target) {
    if (!target) return null;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        if (this._grid[r][c] === target) return { r, c };
      }
    }
    return null;
  }

  _explainHumanLaunchStatus(node, params) {
    if (node.colonyType !== COLONY_TYPE.HUMAN) {
      return {
        launchBlockedReasons: [],
        canLaunchExplanation: '--',
        missionCompleteExplanation: '--',
      };
    }

    const launchBlockedReasons = [];
    const storedMotivation = this._getStoredHumanMotivation(node, params);

    let missionCompleteExplanation;
    if (node.hasNewHumanHomeworld) {
      const cause = node.missionCompleteCause ?? 'unknown';
      const causeText = {
        child_human_colony: 'this world spawned a direct human child colony',
        robot_born_human: 'network established a robot-born human colony',
      }[cause] ?? cause;
      missionCompleteExplanation = `Mission complete: ${causeText}`;
    } else {
      missionCompleteExplanation = 'Mission complete: no (only set when a direct human child colony succeeds)';
    }

    let canLaunchExplanation;
    let robotNetworkPriorityExplanation = null;

    if (isStrictBoundedMode(params) && node.isSol && node.humanCanLaunch) {
      const activeRobots = this._countActiveRobots(params);
      if (activeRobots > 0) {
        const motPct = (storedMotivation * 100).toFixed(1);
        robotNetworkPriorityExplanation =
          `Bounded mode pauses Sol human launches while the robot network is still active `
          + `(${activeRobots} mature robot ${activeRobots === 1 ? 'colony' : 'colonies'}). `
          + `Robots own expansion until stand-down; remaining stored motivation (${motPct}%) `
          + `does not override this pause.`;
        launchBlockedReasons.push(
          `Blocked while robot network is still active (${activeRobots} robot ${activeRobots === 1 ? 'colony' : 'colonies'})`
        );
        canLaunchExplanation =
          `Paused -- robot network still expanding; human motivation (${motPct}%) held until stand-down`;
      }
    }

    if (canLaunchExplanation == null) {
      if (node.humanCanLaunch) {
        canLaunchExplanation = node.isSol
          ? 'Sol can launch (network root)'
          : 'Human colony can launch (autonomous; may be penalized if not the preferred launcher)';
      } else if (node.isSol) {
        const handoff = node.activeHumanLauncher && node.activeHumanLauncher !== node;
        if (handoff) {
          const pos = this._findNodeCoords(node.activeHumanLauncher);
          const where = pos ? `Human (${pos.r},${pos.c})` : 'another human colony';
          canLaunchExplanation = `Sol launch role handed to ${where}`;
        } else if (node.hasNewHumanHomeworld) {
          canLaunchExplanation = 'Sol launches ended due to mission complete';
        } else {
          canLaunchExplanation = 'Sol launches disabled for this network root';
        }
      } else if (node.hasNewHumanHomeworld) {
        canLaunchExplanation = 'This world is mission complete (launches disabled)';
      } else {
        canLaunchExplanation = 'Launches disabled for this world';
      }
    }

    if (node.launchTimeoutUntil > this._currentYear) {
      launchBlockedReasons.push(
        `Failure-strike timeout until year ${node.launchTimeoutUntil.toLocaleString()}`
      );
    }

    // Note: strict bounded mode no longer hard-blocks non-preferred human launchers;
    // it applies a motivation penalty instead (see _getHumanLaunchMotivation).

    if (storedMotivation <= 0) {
      launchBlockedReasons.push('Stored motivation is 0% -- failure penalties exhausted launch budget');
    } else if (storedMotivation < 0.01 && launchBlockedReasons.length === 0) {
      launchBlockedReasons.push(
        `Very low stored motivation (${(storedMotivation * 100).toFixed(1)}%) -- launches unlikely even when not blocked`
      );
    }

    return {
      launchBlockedReasons,
      canLaunchExplanation,
      missionCompleteExplanation,
      robotNetworkPriorityExplanation,
    };
  }

  _explainRobotLaunchStatus(node, params) {
    const launchBlockedReasons = [];
    if (node.robotLaunchTimeoutUntil > this._currentYear) {
      launchBlockedReasons.push(
        `Failure-strike timeout until year ${node.robotLaunchTimeoutUntil.toLocaleString()}`
      );
    }
    if (node.robotLaunchLimit < Infinity && node.robotLaunchesUsed >= node.robotLaunchLimit) {
      launchBlockedReasons.push('Launch limit reached for this robot fragment');
    }
    const cap = this._getRobotProbeCapability(node, params);
    if (cap <= 0) {
      launchBlockedReasons.push('Probe capability is 0% (decay / goal coherence)');
    }
    let canLaunchExplanation = 'Robot colony on its decision cycle';
    if (launchBlockedReasons.length > 0) {
      canLaunchExplanation = `Blocked: ${launchBlockedReasons[0]}`;
    }
    return {
      launchBlockedReasons,
      launchBlocked: this._isRobotLaunchBlocked(node) || cap <= 0,
      canLaunchExplanation,
    };
  }

  getNodeDetails(r, c) {
    const node = this._grid[r]?.[c];
    if (!node) return null;
    const params = this._params;
    const motivation = node.colonyType === COLONY_TYPE.HUMAN
      ? this._getHumanLaunchMotivation(node, params)
      : node.colonyType === COLONY_TYPE.ROBOT
        ? this._getRobotProbeCapability(node, params)
        : null;

    const launchStatus = node.colonyType === COLONY_TYPE.HUMAN
      ? this._explainHumanLaunchStatus(node, params)
      : null;
    const robotLaunchStatus = node.colonyType === COLONY_TYPE.ROBOT
      ? this._explainRobotLaunchStatus(node, params)
      : null;

    return {
      r,
      c,
      label: this._nodeLabel(r, c, node),
      state: node.state,
      colonyType: node.colonyType,
      isSol: node.isSol,
      currentYear: this._currentYear,
      motivation,
      launchProbability: node.launchProbability,
      probesSent: node.probesSent,
      networkRobotProbesSent: node.networkRobotProbesSent ?? 0,
      priorRobotColonizations: node.priorRobotColonizations,
      failedMissionAttempts: node.failedMissionAttempts,
      humanFoundedYear: node.humanFoundedYear,
      humanCanLaunch: node.humanCanLaunch,
      robotFoundedYear: node.robotFoundedYear,
      hasNewHumanHomeworld: node.hasNewHumanHomeworld,
      missionCompleteCause: node.missionCompleteCause,
      humanFailureStrikes: node.humanFailureStrikes,
      launchTimeoutUntil: node.launchTimeoutUntil,
      launchBlocked: node.colonyType === COLONY_TYPE.HUMAN
        ? launchStatus.launchBlockedReasons.length > 0
        : node.colonyType === COLONY_TYPE.ROBOT
          ? robotLaunchStatus.launchBlocked
          : false,
      launchBlockedReasons: launchStatus?.launchBlockedReasons ?? robotLaunchStatus?.launchBlockedReasons ?? [],
      canLaunchExplanation: launchStatus?.canLaunchExplanation ?? '--',
      missionCompleteExplanation: launchStatus?.missionCompleteExplanation ?? '--',
      robotNetworkPriorityExplanation: launchStatus?.robotNetworkPriorityExplanation ?? null,
      robotLaunchExplanation: robotLaunchStatus?.canLaunchExplanation ?? '--',
      robotCapability: node.colonyType === COLONY_TYPE.ROBOT
        ? this._getRobotProbeCapability(node, params)
        : null,
      history: [...(node.history ?? [])],
    };
  }

  tick() {
    const params = this._params;
    const tTick = this._profilingEnabled ? nowMs() : 0;

    // -- Phase 1a: Human worlds launch independently --
    const tHumans = this._profilingEnabled ? nowMs() : 0;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.HUMAN) continue;
        if (this._currentYear < node.nextDecisionYear) continue;
    if (!this._isHumanLaunchBlocked(node, params)) {
      this._attemptLaunch(r, c, node, params);
    }
    if (node.humanCanLaunch) {
      node.nextDecisionYear = scheduleAt(this._currentYear, params.decisionCycle);
    }
      }
    }
    this._profTimePhase('phase_human_launch', tHumans);

    // -- Phase 1b: Robot colonies launch on their own decision cycle --
    const tRobots = this._profilingEnabled ? nowMs() : 0;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.ROBOT) continue;
        if (!node.humanOrigin) continue;
        if (this._currentYear < node.robotNetworkNextDecisionYear) continue;

        this._attemptLaunch(r, c, node, params);
        node.robotNetworkNextDecisionYear =
          scheduleAt(this._currentYear, params.decisionCycle * node.robotFragmentResourceMult);

        if (this._isRobotResourceExhausted(node)) {
          node.state = STATE.DEAD;
        }
      }
    }
    this._profTimePhase('phase_robot_launch', tRobots);

    const tPostLaunch = this._profilingEnabled ? nowMs() : 0;
    this._processMissionAbandonment(params);
    this._processRobotScopeDrift(params);

    this._profTimePhase('phase_robot_post', tPostLaunch);

    // -- Phase 2: Transit resolution --
    const tTransit = this._profilingEnabled ? nowMs() : 0;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.IN_TRANSIT) continue;
        if (this._currentYear < node.transitEndYear) continue;

        if (this.random() < params.transitFailFrac) {
          const sponsor = node.parent;
          const isRobot = sponsor && sponsor.colonyType === COLONY_TYPE.ROBOT;
          this._recordMissionFailure(sponsor, node, params, isRobot);
          this._logNodeEvent(node, {
            type: 'transit_failed',
            from: node.inboundFromLabel,
            fromR: node.inboundFromR,
            fromC: node.inboundFromC,
          });
          const revert = node.revertStateOnFail ?? STATE.UNCOLONIZED;
          node.state = revert;
          node.revertStateOnFail = null;
          node.transitEndYear = Infinity;
          node.inboundFromLabel = null;
          node.inboundFromR = null;
          node.inboundFromC = null;
          this._notifyFailure(node, params);
          node.parent = null;

          if (revert === STATE.UNCOLONIZED) this._uncolonizedCount++;
          else if (revert === STATE.DORMANT) this._dormantCount++;
        } else {
          this._logNodeEvent(node, {
            type: 'transit_arrived',
            from: node.inboundFromLabel,
            fromR: node.inboundFromR,
            fromC: node.inboundFromC,
          });
          node.state = STATE.MATURING;
          node.maturationStartYear = this._currentYear;
          node.maturationEndYear = scheduleAt(this._currentYear, params.maturationTime);
        }
      }
    }
    this._profTimePhase('phase_transit', tTransit);

    // -- Phase 3: Maturation -- per-tick colony failure rolls, then completion --
    const tMaturation = this._profilingEnabled ? nowMs() : 0;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURING) continue;

        const maturationTicks = Math.round(
          (node.maturationEndYear - node.maturationStartYear) / TICK
        );

        if (maturationTicks <= 0) {
          this._succeedColony(node, params, r, c);
          continue;
        }

        if (this._currentYear >= node.maturationEndYear) {
          this._succeedColony(node, params, r, c);
          continue;
        }

        if (this._currentYear > node.maturationStartYear
            && (this._currentYear - node.maturationStartYear) % TICK === 0) {
          if (this.random() < params.perTickColonyFailRate) {
            this._failColony(node, params);
          }
        }
      }
    }
    this._profTimePhase('phase_maturation', tMaturation);

    this._currentYear += TICK;
    if (this._profilingEnabled) this._profile.tickMs += (nowMs() - tTick);
  }

  runTo(maxYear) {
    while (this._currentYear < maxYear && this._currentYear < MAX_YEAR) {
      this.tick();
    }
  }

  getCounts() {
    const counts = {
      humanMature: 0,
      robotMature: 0,
      maturing:    0,
      inTransit:   0,
      dormant:     0,
      dead:        0,
    };
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        switch (node.state) {
          case STATE.MATURE:
            if (node.colonyType === COLONY_TYPE.ROBOT) counts.robotMature++;
            else counts.humanMature++;
            break;
          case STATE.MATURING:   counts.maturing++;  break;
          case STATE.IN_TRANSIT: counts.inTransit++; break;
          case STATE.DORMANT:    counts.dormant++;   break;
          case STATE.DEAD:       counts.dead++;      break;
        }
      }
    }
    return counts;
  }

  getSolNode() {
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        if (this._grid[r][c].isSol) return this._grid[r][c];
      }
    }
    return null;
  }

  getStats(params) {
    const p = params ?? this._params;
    const counts = this.getCounts();
    const prob = this._collectProbabilities(p);
    const sol = this.getSolNode();
    const totalProbes = this.totalProbesSent;

    return {
      currentYear: this._currentYear,
      counts,
      sol: sol ? {
        launchProbability: sol.launchProbability,
        humanFailureStrikes: sol.humanFailureStrikes,
        launchTimeoutUntil: sol.launchTimeoutUntil,
        launchBlocked: this._isHumanLaunchBlocked(sol, p),
      } : null,
      totalProbesSent: totalProbes,
      humanProbesSent: this.humanProbesSent,
      robotProbesSent: this.robotProbesSent,
      humanProbePct: totalProbes > 0 ? this.humanProbesSent / totalProbes : 0,
      robotProbePct: totalProbes > 0 ? this.robotProbesSent / totalProbes : 0,
      humanProbs: prob.humanProbs,
      avgRobotCapability: prob.avgRobot,
      minRobotCapability: prob.minRobot,
      maxRobotCapability: prob.maxRobot,
      robotFragments: prob.robotFragments,
      robotsAtLimit: prob.robotsAtLimit,
      humanTimedOut: prob.humanTimedOut,
      robotTimedOut: prob.robotTimedOut,
      params: {
        transitSurvivalFrac: p.transitSurvivalFrac,
        colonySurvivalFrac: p.colonySurvivalFrac,
        perTickColonyFailRate: p.perTickColonyFailRate,
        humanColonyFrac: p.humanColonyFrac,
        robotColonyFrac: p.robotColonyFrac,
        endToEndHumanFrac: p.endToEndHumanFrac,
        endToEndRobotFrac: p.endToEndRobotFrac,
        robotLaunchLimitOn: p.robotLaunchLimitOn,
        robotLaunchMinVal: p.robotLaunchMinVal,
        robotLaunchMaxVal: p.robotLaunchMaxVal,
        resourceDepletionFrac: p.resourceDepletionFrac,
        goalCoherenceOn: p.goalCoherenceOn,
        goalCoherence: p.goalCoherence,
        destFailPenaltyFrac: p.destFailPenaltyFrac,
        failureStrikeOn: p.failureStrikeOn,
        failureStrikeLimit: p.failureStrikeLimit,
        failureTimeoutYearsVal: p.failureTimeoutYearsVal,
        missionAbandonmentOn: p.missionAbandonmentOn,
        missionAbandonment: p.missionAbandonment,
        solInitialLaunchProb: p.solInitialLaunchProb,
        humanInitialLaunchProb: p.humanInitialLaunchProb,
        robotStandDown: p.robotStandDown,
        humanStandDown: p.humanStandDown,
        robotSiteHumanPenaltyOn: p.robotSiteHumanPenaltyOn,
        robotSiteHumanPenalty: p.robotSiteHumanPenalty,
      },
    };
  }

  findNextEventYear(fromYear) {
    let next = Infinity;

    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];

        if (node.state === STATE.MATURE && node.colonyType === COLONY_TYPE.HUMAN
            && node.nextDecisionYear >= fromYear) {
          next = Math.min(next, node.nextDecisionYear);
        }
        if (node.state === STATE.MATURE && node.colonyType === COLONY_TYPE.HUMAN
            && node.launchTimeoutUntil > fromYear) {
          next = Math.min(next, node.launchTimeoutUntil);
        }
        if (node.state === STATE.MATURE && node.colonyType === COLONY_TYPE.ROBOT
            && node.robotNetworkNextDecisionYear >= fromYear) {
          next = Math.min(next, node.robotNetworkNextDecisionYear);
        }
        if (node.state === STATE.MATURE && node.colonyType === COLONY_TYPE.ROBOT
            && node.robotLaunchTimeoutUntil > fromYear) {
          next = Math.min(next, node.robotLaunchTimeoutUntil);
        }
        if (node.state === STATE.IN_TRANSIT && node.transitEndYear >= fromYear) {
          next = Math.min(next, node.transitEndYear);
        }
        if (node.state === STATE.MATURING) {
          const maturationTicks = Math.round(
            (node.maturationEndYear - node.maturationStartYear) / TICK
          );
          for (let i = 1; i <= maturationTicks; i++) {
            const rollYear = node.maturationStartYear + i * TICK;
            if (rollYear >= fromYear) next = Math.min(next, rollYear);
          }
        }
      }
    }

    return next;
  }

  /** Fast FNV-1a hash of render-visible grid state */
  snapshotGrid() {
    let h = 2166136261;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const n = this._grid[r][c];
        h ^= n.state.charCodeAt(0);
        h = Math.imul(h, 16777619);
        h ^= (n.colonyType ? n.colonyType.charCodeAt(0) : 0);
        h = Math.imul(h, 16777619);
        h ^= n.isSol ? 1 : 0;
        h = Math.imul(h, 16777619);
      }
    }
    return h >>> 0;
  }

  // -- Private simulation helpers --

  _assignRobotLaunchLimit(node, params) {
    if (!params.robotLaunchLimitOn) {
      node.robotLaunchLimit = Infinity;
      return;
    }
    const lo = Math.min(params.robotLaunchMinVal, params.robotLaunchMaxVal);
    const hi = params.robotLaunchMaxVal;
    node.robotLaunchLimit = lo + Math.floor(this.random() * (hi - lo + 1));
  }

  _isHumanLaunchBlocked(node, params) {
    if (node.launchTimeoutUntil > this._currentYear) return true;
    if (!node.humanCanLaunch) return true;
    if (isStrictBoundedMode(params) && node.isSol) {
      if (this._countActiveRobots(params) > 0) return true;
    }
    if (this._getStoredHumanMotivation(node, params) <= 0) return true;
    return false;
  }

  _isRobotLaunchBlocked(node) {
    return node.robotLaunchTimeoutUntil > this._currentYear
      || (node.robotLaunchLimit < Infinity && node.robotLaunchesUsed >= node.robotLaunchLimit);
  }

  _probabilisticRobotStandDown(humanOrigin, params) {
    if (params.robotStandDownFrac <= 0 || !humanOrigin) return;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.ROBOT) continue;
        if (node.humanOrigin !== humanOrigin) continue;
        if (this.random() >= params.robotStandDownFrac) continue;
        this._logNodeEvent(node, { type: 'stand_down' });
        this._setDormant(node, r, c);
      }
    }
  }

  _isRobotResourceExhausted(node) {
    return node.robotLaunchLimit < Infinity
      && node.robotLaunchesUsed >= node.robotLaunchLimit;
  }

  _setDormant(node, r, c) {
    this._logNodeEvent(node, { type: 'dormant', reason: 'scope_drift_or_stand_down' });
    node.state = STATE.DORMANT;
    node.colonyType = null;
    this._dormantCount++;
    node.failedMissionAttempts++;
    node.transitEndYear = Infinity;
    node.maturationStartYear = Infinity;
    node.maturationEndYear = Infinity;
    node.parent = null;
    node.nextDecisionYear = Infinity;
    node.robotNetworkNextDecisionYear = Infinity;
  }

  _processRobotScopeDrift(params) {
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.ROBOT) continue;
        if (this._isRobotResourceExhausted(node)) {
          this._logNodeEvent(node, { type: 'dead', reason: 'resource_exhausted' });
          node.state = STATE.DEAD;
          node.colonyType = null;
          continue;
        }
        if (this._getRobotProbeCapability(node, params) <= 0) {
          this._setDormant(node, r, c);
        }
      }
    }
  }

  _recordMissionFailure(sponsor, targetNode, params, isRobot) {
    if (targetNode) targetNode.failedMissionAttempts++;

    if (!params.failureStrikeOn || !sponsor) return;

    if (isRobot) {
      sponsor.robotFailureStrikes++;
      if (sponsor.robotFailureStrikes >= params.failureStrikeLimit) {
        sponsor.robotFailureStrikes = 0;
        sponsor.robotLaunchTimeoutUntil = this._currentYear + params.failureTimeoutYearsVal;
      }
    } else {
      sponsor.humanFailureStrikes++;
      if (sponsor.humanFailureStrikes >= params.failureStrikeLimit) {
        sponsor.humanFailureStrikes = 0;
        sponsor.launchTimeoutUntil = this._currentYear + params.failureTimeoutYearsVal;
      }
    }
  }

  _recordMissionSuccess(sponsor, isRobot) {
    if (!sponsor) return;
    if (isRobot) sponsor.robotFailureStrikes = 0;
    else sponsor.humanFailureStrikes = 0;
  }

  _getAccountableHuman(node) {
    if (node.humanOrigin) return node.humanOrigin;
    if (!node.parent) return null;
    if (node.parent.colonyType === COLONY_TYPE.HUMAN) return node.parent;
    return node.parent.humanOrigin;
  }

  _applyMotivationBoost(human, multiplier) {
    if (!human || human.colonyType !== COLONY_TYPE.HUMAN) return;
    human.launchProbability = clamp(
      human.launchProbability * multiplier, 0, this._params.maxStoredMotivation
    );
  }

  _capStoredHumanMotivationAfterHumanSuccess(human) {
    if (!human || human.colonyType !== COLONY_TYPE.HUMAN) return;
    // Sol may start far above 100% as a "first colony buffer", but *human* success ends that buffer.
    human.launchProbability = Math.min(human.launchProbability, 1);
  }

  _applyHumanStandDown(human, params, sourceNode) {
    if (!human || human.colonyType !== COLONY_TYPE.HUMAN || params.humanStandDown <= 0) return;
    const before = human.launchProbability;
    human.launchProbability = clamp(
      human.launchProbability * params.humanStandDownMult,
      0,
      params.maxStoredMotivation
    );
    if (human.launchProbability === before) return;
    this._logNodeEvent(human, {
      type: 'human_stand_down',
      from: sourceNode?.inboundFromLabel ?? null,
      fromR: sourceNode?.inboundFromR ?? null,
      fromC: sourceNode?.inboundFromC ?? null,
      before,
      after: human.launchProbability,
    });
  }

  _applyMotivationPenalty(human, params, sourceNode) {
    if (!human || human.colonyType !== COLONY_TYPE.HUMAN) return;
    const before = human.launchProbability;
    human.launchProbability = clamp(
      human.launchProbability * params.failurePenaltyMult,
      0,
      params.maxStoredMotivation
    );
    if (human.launchProbability === before) return;
    this._logNodeEvent(human, {
      type: 'motivation_penalty',
      from: sourceNode?.inboundFromLabel ?? null,
      fromR: sourceNode?.inboundFromR ?? null,
      fromC: sourceNode?.inboundFromC ?? null,
      before,
      after: human.launchProbability,
    });
  }

  _notifyFailure(node, params) {
    this._applyMotivationPenalty(this._getAccountableHuman(node), params, node);
  }

  _failColony(node, params) {
    const sponsor = node.parent;
    const isRobot = sponsor && sponsor.colonyType === COLONY_TYPE.ROBOT;
    this._logNodeEvent(node, {
      type: 'maturation_failed',
      from: node.inboundFromLabel,
      fromR: node.inboundFromR,
      fromC: node.inboundFromC,
    });
    node.state = STATE.DEAD;
    node.colonyType = null;
    this._notifyFailure(node, params);
    this._recordMissionFailure(sponsor, node, params, isRobot);
  }

  _getStoredHumanMotivation(node, params) {
    if (node.colonyType !== COLONY_TYPE.HUMAN) return 0;
    let motivation = node.launchProbability;
    if (!node.isSol) {
      const age = Math.max(0, this._currentYear - node.humanFoundedYear);
      if (age > 0 && params.goalCoherenceOn) {
        motivation *= Math.pow(params.goalCoherence, age / 1000);
      }
    }
    return Math.max(0, motivation);
  }

  /** Stored motivation (may exceed 1.0); launch rolls cap via _effectiveRollProbability */
  _getHumanLaunchMotivation(node, params) {
    let motivation = this._getStoredHumanMotivation(node, params);

    // In strict bounded mode, favour the network's current "active" launcher
    // but do not hard-disable other human worlds.
    if (isStrictBoundedMode(params) && !node.isSol) {
      const root = this.getSolNode();

      // Human worlds that were founded directly by other humans are allowed to launch,
      // but are heavily disfavoured to keep the expansion "bounded" in practice.
      // (They still "try" -- autonomy is preserved -- but they are much less effective.)
      if (!node.spawnedFromRobot) {
        motivation *= params.humanFoundedLaunchMult;
      }
      if (root?.activeHumanLauncher && root.activeHumanLauncher !== node) {
        motivation *= params.nonPreferredLaunchMult;
      }
    }

    if (motivation < MOTIVATION_FLOOR) return 0;
    return motivation;
  }

  _effectiveRollProbability(baseMotivation, distance, params) {
    return clamp(
      effectiveLaunchProbability(baseMotivation, distance, params.distancePenalty),
      0,
      1
    );
  }

  _getRobotProbeCapability(node, params) {
    if (node.colonyType !== COLONY_TYPE.ROBOT) return 0;
    let cap = node.robotProbeCapability;
    const age = Math.max(0, this._currentYear - node.robotFoundedYear);
    if (age > 0 && params.robotCapabilityDecayFrac > 0) {
      cap *= Math.pow(
        1 - params.robotCapabilityDecayFrac,
        age / params.robotDecayPeriodYears
      );
    }
    if (age > 0 && params.goalCoherenceOn) {
      cap *= Math.pow(params.goalCoherence, age / 1000);
    }
    return clamp(cap, 0, 1);
  }

  _getRobotCycleDelay(node, params) {
    return params.decisionCycle * node.robotFragmentResourceMult;
  }

  _countActiveRobots(params) {
    let count = 0;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.ROBOT) continue;
        if (!node.humanOrigin) continue;
        count++;
      }
    }
    return count;
  }

  _effectiveHumanColonyFrac(node, params) {
    return effectiveHumanColonyFrac(
      params.humanColonyFrac,
      node.priorRobotColonizations,
      params.robotSiteHumanPenaltyFrac
    );
  }

  _succeedColony(node, params, r, c) {
    const origin = this._getAccountableHuman(node);
    const siteHumanShare = this._effectiveHumanColonyFrac(node, params);
    let rollHumanShare = siteHumanShare;
    const humanSponsorForcedRobot = this._isBoundedExpansion(params)
      && node.parent?.colonyType === COLONY_TYPE.HUMAN;
    if (humanSponsorForcedRobot) {
      rollHumanShare = 0;
    }

    if (this.random() >= rollHumanShare) {
      node.priorRobotColonizations++;
      node.state = STATE.MATURE;
      node.colonyType = COLONY_TYPE.ROBOT;
      node.humanFoundedYear = 0;
      this._logNodeEvent(node, {
        type: 'colonized_robot',
        from: node.inboundFromLabel,
        fromR: node.inboundFromR,
        fromC: node.inboundFromC,
        siteHumanShare,
        rollHumanShare,
        humanSponsorForcedRobot,
      });
      node.humanOrigin = origin;
      node.launchProbability = 0;
      node.nextDecisionYear = Infinity;
      node.robotProbeCapability = params.humanInitialLaunchProbFrac;
      node.robotFoundedYear = this._currentYear;
      node.robotLaunchesUsed = 0;
      node.robotFailureStrikes = 0;
      node.robotLaunchTimeoutUntil = 0;
      node.robotFragmentResourceMult = 1;
      this._assignRobotLaunchLimit(node, params);
      node.robotNetworkNextDecisionYear =
        scheduleAt(this._currentYear, 0);
      node.probesSent = 0;
      if (origin) {
        this._applyMotivationBoost(origin, params.robotSuccessBonusMult);
      }
      this._recordMissionSuccess(node.parent, !!(node.parent && node.parent.colonyType === COLONY_TYPE.ROBOT));
      node.failedMissionAttempts = 0;
      node.revertStateOnFail = null;
      return;
    }

    node.state = STATE.MATURE;
    node.colonyType = COLONY_TYPE.HUMAN;
    node.humanOrigin = node;
    node.humanFoundedYear = this._currentYear;
    const spawnedFromRobot = node.parent?.colonyType === COLONY_TYPE.ROBOT;
    node.spawnedFromRobot = !!spawnedFromRobot;
    const strictBounded = isStrictBoundedMode(params);

    if (node.isSol) {
      node.humanCanLaunch = true;
      node.launchProbability = params.solInitialLaunchProbFrac;
      node.nextDecisionYear = scheduleAt(this._currentYear, params.decisionCycle);
    } else {
      node.humanCanLaunch = true;
      node.launchProbability = params.humanInitialLaunchProbFrac;
      node.nextDecisionYear = scheduleAt(this._currentYear, params.decisionCycle);
    }

    // In strict bounded mode, robot-born humans become the network's "preferred launcher"
    // (others still launch, but at a penalty; see _getHumanLaunchMotivation).
    if (strictBounded && spawnedFromRobot && origin) {
      origin.activeHumanLauncher = node;
    }
    node.probesSent = 0;
    node.robotNetworkNextDecisionYear = Infinity;
    node.hasNewHumanHomeworld = false;
    node.missionCompleteCause = null;
    node.humanFailureStrikes = 0;
    node.launchTimeoutUntil = 0;
    this._logNodeEvent(node, {
      type: 'colonized_human',
      from: node.inboundFromLabel,
      fromR: node.inboundFromR,
      fromC: node.inboundFromC,
      siteHumanShare,
      rollHumanShare,
      humanSponsorForcedRobot: false,
    });

    if (!node.isSol) {
      this.humanColonyEvents.push({ year: this._currentYear, r, c });
    }

    if (node.parent?.colonyType === COLONY_TYPE.HUMAN) {
      this._setMissionComplete(node.parent, 'child_human_colony', { childR: r, childC: c });
    }

    if (origin && node !== origin && !node.isSol) {
      if (strictBounded) {
        if (spawnedFromRobot && origin) {
          this._probabilisticRobotStandDown(origin, params);
        }
      } else {
        this._probabilisticRobotStandDown(origin, params);
        if (spawnedFromRobot) {
          this._logNodeEvent(origin, {
            type: 'mission_complete',
            childR: r,
            childC: c,
            via: 'robot_born_human',
          });
        }
      }
    }

    node.failedMissionAttempts = 0;
    node.revertStateOnFail = null;

    if (node.parent) {
      this._recordMissionSuccess(node.parent, node.parent.colonyType === COLONY_TYPE.ROBOT);
      if (node.parent.colonyType === COLONY_TYPE.HUMAN) {
        this._applyMotivationBoost(node.parent, params.successBonusMult);
        this._capStoredHumanMotivationAfterHumanSuccess(node.parent);
      } else if (origin) {
        this._applyMotivationBoost(origin, params.successBonusMult);
        this._capStoredHumanMotivationAfterHumanSuccess(origin);
      }
    }

    if (origin && node !== origin && !node.isSol && !strictBounded) {
      this._applyHumanStandDown(origin, params, node);
    }
  }

  _getLaunchContext(node, params) {
    if (node.colonyType === COLONY_TYPE.HUMAN) {
      return { sponsor: node, motivation: this._getHumanLaunchMotivation(node, params) };
    }
    if (node.colonyType === COLONY_TYPE.ROBOT && node.humanOrigin) {
      return { sponsor: node, motivation: this._getRobotProbeCapability(node, params) };
    }
    return null;
  }

  _pickWeightedTarget(targets, params) {
    if (params.destFailPenaltyFrac <= 0 || targets.length === 1) {
      return targets[Math.floor(this.random() * targets.length)];
    }
    const weights = targets.map(([nr, nc]) =>
      Math.pow(1 - params.destFailPenaltyFrac, this._grid[nr][nc].failedMissionAttempts)
    );
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) return targets[0];
    let roll = this.random() * total;
    for (let i = 0; i < targets.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return targets[i];
    }
    return targets[targets.length - 1];
  }

  _getLaunchableAtDistance(r, c, distance, includeDormant) {
    const t0 = this._profilingEnabled ? nowMs() : 0;
    const uncolonized = [];
    const dormant = [];

    let offsets = this._distanceOffsets.get(distance);
    if (!offsets) {
      offsets = [];
      for (let dr = -distance; dr <= distance; dr++) {
        const dcAbs = distance - Math.abs(dr);
        offsets.push([dr, dcAbs]);
        if (dcAbs !== 0) offsets.push([dr, -dcAbs]);
      }
      this._distanceOffsets.set(distance, offsets);
    }

    for (const [dr, dc] of offsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= this._gridSize || nc < 0 || nc >= this._gridSize) continue;
      const cell = this._grid[nr][nc];
      if (cell.state === STATE.UNCOLONIZED) uncolonized.push([nr, nc]);
      else if (includeDormant && cell.state === STATE.DORMANT) dormant.push([nr, nc]);
    }

    this._profCount('launchable_checks', offsets.length);
    this._profCount('launchable_hits', uncolonized.length + dormant.length);
    this._profTimeFn('fn_getLaunchableAtDistance', t0);
    return { uncolonized, dormant };
  }

  _findLaunchTargets(r, c, isRobot) {
    const maxDist = (this._gridSize - 1) * 2;

    // Fast-path: if there are no launchable cells at all, avoid scanning rings.
    // Robots can target dormant sites; humans cannot.
    const hasUncolonized = this._uncolonizedCount > 0;
    const hasDormant = this._dormantCount > 0;
    if (!hasUncolonized && (!isRobot || !hasDormant)) return null;

    // Cache: for each launcher, remember the last distance where any valid targets existed.
    // This avoids re-checking d=1..k repeatedly once a launcher is locally boxed-in.
    const node = this._grid[r]?.[c];
    const cached = node?.lastFoundTargetDistance ?? 1;
    // Start-distance policy:
    // - In pure Hart-Tipler-like runs (no stand-down; no dormant targets), the frontier mostly moves outward,
    //   so starting at cached avoids many wasted ring scans.
    // - In bounded/stand-down modes, closer targets can reappear (dormant retargeting, failures),
    //   so we start at cached-1 to reduce behavioral drift.
    const p = this._params;
    const pureHT = p.robotStandDown <= 0 && p.humanStandDown <= 0 && this._dormantCount === 0;
    const start = Math.max(1, Math.min(maxDist, pureHT ? cached : (cached - 1)));

    // PASS 1: prefer virgin frontier (uncolonized) targets.
    if (hasUncolonized) {
      for (let d = start; d <= maxDist; d++) {
        const { uncolonized } = this._getLaunchableAtDistance(r, c, d, false);
        if (uncolonized.length > 0) {
          if (node) node.lastFoundTargetDistance = d;
          return { targets: uncolonized, distance: d };
        }
      }
    }

    // PASS 2: robots may reclaim dormant sites, but only if no uncolonized target exists.
    if (isRobot && hasDormant) {
      for (let d = 1; d <= maxDist; d++) {
        const { dormant } = this._getLaunchableAtDistance(r, c, d, true);
        if (dormant.length > 0) {
          return { targets: dormant, distance: d };
        }
      }
    }

    return null;
  }

  _attemptLaunch(r, c, node, params) {
    const isRobot = node.colonyType === COLONY_TYPE.ROBOT;
    if (isRobot ? this._isRobotLaunchBlocked(node) : this._isHumanLaunchBlocked(node, params)) return;

    const ctx = this._getLaunchContext(node, params);
    if (!ctx || ctx.motivation <= 0) return;

    const tFind = this._profilingEnabled ? nowMs() : 0;
    const launch = this._findLaunchTargets(r, c, isRobot);
    this._profTimeFn('fn_findLaunchTargets', tFind);
    if (!launch) return;

    const { targets, distance } = launch;
    if (node && distance > 0) node.lastFoundTargetDistance = distance;
    const launchProb = this._effectiveRollProbability(
      ctx.motivation, distance, params
    );
    if (this.random() > launchProb) return;

    const tPick = this._profilingEnabled ? nowMs() : 0;
    const [nr, nc] = this._pickWeightedTarget(targets, params);
    this._profTimeFn('fn_pickWeightedTarget', tPick);
    const target = this._grid[nr][nc];
    target.revertStateOnFail =
      target.state === STATE.DORMANT ? STATE.DORMANT : STATE.UNCOLONIZED;
    if (target.state === STATE.UNCOLONIZED) this._uncolonizedCount--;
    else if (target.state === STATE.DORMANT) this._dormantCount--;
    target.state = STATE.IN_TRANSIT;
    target.transitEndYear = scheduleAt(this._currentYear, params.transitTime * distance);
    target.parent = ctx.sponsor;
    target.inboundFromR = r;
    target.inboundFromC = c;
    target.inboundFromLabel = this._nodeLabel(r, c, node);
    target.humanOrigin = isRobot ? node.humanOrigin : node;

    this.totalProbesSent++;
    if (isRobot) {
      this.robotProbesSent++;
      node.probesSent++;
      if (node.humanOrigin) node.humanOrigin.networkRobotProbesSent++;
    } else {
      this.humanProbesSent++;
      node.probesSent++;
    }
    this._logNodeEvent(node, {
      type: 'probe_launched',
      toR: nr,
      toC: nc,
      distance,
      targetLabel: `(${nr},${nc})`,
      sponsor: isRobot ? 'robot' : 'human',
    });
    this._logNodeEvent(target, {
      type: 'probe_inbound',
      from: this._nodeLabel(r, c, node),
      fromR: r,
      fromC: c,
      distance,
    });

    if (isRobot) {
      node.robotLaunchesUsed++;
      if (params.resourceDepletionFrac > 0) {
        node.robotFragmentResourceMult *= (1 + params.resourceDepletionFrac);
      }
    }
  }

  _processMissionAbandonment(params) {
    if (!params.missionAbandonmentOn) return;
    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE || node.colonyType !== COLONY_TYPE.ROBOT) continue;
        if (this.random() < params.missionAbandonmentPerTick) {
          this._logNodeEvent(node, { type: 'dead', reason: 'mission_abandonment' });
          node.state = STATE.DEAD;
          node.colonyType = null;
        }
      }
    }
  }

  _collectProbabilities(params) {
    const humanProbs = [];
    const robotCaps = [];
    let robotsAtLimit = 0;
    let humanTimedOut = 0;
    let robotTimedOut = 0;

    for (let r = 0; r < this._gridSize; r++) {
      for (let c = 0; c < this._gridSize; c++) {
        const node = this._grid[r][c];
        if (node.state !== STATE.MATURE) continue;
        if (node.colonyType === COLONY_TYPE.HUMAN) {
          humanProbs.push({
            label: node.isSol ? 'Sol' : `Human @ ${r},${c}`,
            r,
            c,
            value: node.launchProbability,
            probesSent: node.probesSent,
            networkRobotProbesSent: node.networkRobotProbesSent ?? 0,
            strikes: node.humanFailureStrikes,
            timedOut: node.launchTimeoutUntil > this._currentYear,
          });
          if (node.launchTimeoutUntil > this._currentYear) humanTimedOut++;
        } else if (node.colonyType === COLONY_TYPE.ROBOT) {
          robotCaps.push(this._getRobotProbeCapability(node, params));
          if (node.robotLaunchLimit < Infinity
              && node.robotLaunchesUsed >= node.robotLaunchLimit) robotsAtLimit++;
          if (node.robotLaunchTimeoutUntil > this._currentYear) robotTimedOut++;
        }
      }
    }

    const robotFragments = this._countActiveRobots(params);

    const avgRobot = robotCaps.length
      ? robotCaps.reduce((a, b) => a + b, 0) / robotCaps.length
      : 0;
    const minRobot = robotCaps.length ? Math.min(...robotCaps) : 0;
    const maxRobot = robotCaps.length ? Math.max(...robotCaps) : 0;

    return {
      humanProbs, avgRobot, minRobot, maxRobot, robotCaps,
      robotFragments, robotsAtLimit, humanTimedOut, robotTimedOut,
    };
  }
}
