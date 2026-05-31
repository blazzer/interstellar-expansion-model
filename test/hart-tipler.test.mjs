/**
 * Hart-Tipler preset tests
 *
 * Pure Hart-Tipler (robotStandDown = 0, humanStandDown = 0):
 *   Self-replicating probes never pause because a human world appeared in their
 *   sponsor network. Sol still launches at year 0; robot fronts expand until the
 *   grid saturates (decay / abandonment / launch limits all off in preset).
 *
 * Stand-down variant (robotStandDown = 100, humanStandDown = 70):
 *   When an off-Sol human colony matures, all robots with the same humanOrigin
 *   become dormant. Expansion must continue via human launchers -- much slower
 *   fill, many dormant sites. Sponsor humans get a motivation drop but are not
 *   permanently blocked from launching.
 *
 * Documented snapshot (16x16, fast-test params, seed 42, 25 000 y):
 *   Pure:       ~100% fill, ~6 human colonies, ~122 active robots, 0 dormant
 *   Stand-down: ~22% fill,  ~2 human colonies,  ~27 active robots, ~15 dormant
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PercolationSimulation,
  HART_TIPLER_PARAMS,
  BOUNDED_EXPANSION_PARAMS,
  effectiveHumanColonyFrac,
  getColonizationStats,
  isStrictBoundedMode,
  normalizeParams,
  STATE,
  COLONY_TYPE,
} from '../simulation.js';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEST_GRID = 16;
const TEST_SEED = 42;

/** Aggressive timing for fast, deterministic grid fill in unit tests */
const HART_TIPLER_FAST_TEST = {
  ...HART_TIPLER_PARAMS,
  gridSize: TEST_GRID,
  transitTime: 1000,
  maturationTime: 1000,
  decisionCycle: 1000,
  transitFailRate: 5,
  colonyFailRate: 5,
};

function runScenario(standDown, maxYear, seed = TEST_SEED) {
  const params = {
    ...HART_TIPLER_FAST_TEST,
    robotStandDown: standDown ? 100 : 0,
    humanStandDown: standDown ? 70 : 0,
  };
  const sim = new PercolationSimulation(params, { rng: mulberry32(seed) });
  sim.runTo(maxYear);
  return { sim, stats: getColonizationStats(sim) };
}

test('normalizeParams rejects non-numeric and zero decisionCycle', () => {
  assert.throws(
    () => normalizeParams({ ...BOUNDED_EXPANSION_PARAMS, decisionCycle: 0 }),
    RangeError
  );
  assert.throws(
    () => normalizeParams({ ...BOUNDED_EXPANSION_PARAMS, gridSize: NaN }),
    TypeError
  );
});

test('isStrictBoundedMode activates only when all four triggers are set', () => {
  assert.equal(isStrictBoundedMode(normalizeParams(BOUNDED_EXPANSION_PARAMS)), true);
  assert.equal(isStrictBoundedMode(normalizeParams(HART_TIPLER_PARAMS)), false);
  assert.equal(
    isStrictBoundedMode(normalizeParams({ ...BOUNDED_EXPANSION_PARAMS, robotStandDown: 99 })),
    false
  );
  assert.equal(
    isStrictBoundedMode(normalizeParams({ ...BOUNDED_EXPANSION_PARAMS, goalCoherence: 1 })),
    false
  );
});

test('transit resolves when transit time is not a multiple of 1000 years', () => {
  const sim = new PercolationSimulation(
    {
      ...HART_TIPLER_PARAMS,
      gridSize: 10,
      transitTime: 1500,
      maturationTime: 1500,
      decisionCycle: 1_000_000, // single launch -- avoid masking arrival with a relaunch
      robotStandDown: 0,
      humanStandDown: 0,
    },
    { rng: mulberry32(7) }
  );
  sim.tick(); // year 0 -> launch, then advance to 1000
  assert.equal(sim.getCounts().inTransit, 1, 'probe launched');
  sim.tick(); // year 1000 -- arrival not due until 2000
  assert.equal(sim.getCounts().inTransit, 1);
  sim.tick(); // year 2000 -- transitEndYear 2000 (1500 snapped to tick boundary)
  assert.equal(sim.getCounts().inTransit, 0, 'probe should not stay in transit forever');
  assert.equal(sim.getCounts().maturing, 1, 'probe should enter maturation after transit');
});

test('pure Hart-Tipler fills most of the grid quickly', () => {
  const { stats } = runScenario(false, 25_000);

  assert.ok(
    stats.fillRatio >= 0.85,
    `expected >=85% cells engaged by 25k y, got ${(stats.fillRatio * 100).toFixed(1)}%`
  );
  assert.ok(
    stats.counts.robotMature > 50,
    'robot-led wave should dominate (active robots > 50)'
  );
});

test('Sol launches a probe at year 0 under Hart-Tipler', () => {
  const sim = new PercolationSimulation(
    { ...HART_TIPLER_FAST_TEST, robotStandDown: 0, humanStandDown: 0 },
    { rng: mulberry32(1) }
  );
  sim.tick();
  assert.equal(sim.currentYear, 1000);
  assert.equal(sim.getCounts().inTransit, 1);
});

test('stand-down after first human colony -- explored behaviour', () => {
  const pure = runScenario(false, 25_000);
  const standDown = runScenario(true, 25_000);

  console.log('\n-- Hart-Tipler stand-down comparison (seed 42, 25k y, 16x16) --');
  console.log('  Pure fill:        ', (pure.stats.fillRatio * 100).toFixed(1) + '%');
  console.log('  Stand-down fill:  ', (standDown.stats.fillRatio * 100).toFixed(1) + '%');
  console.log('  Pure humans:      ', pure.stats.humanColonyEvents);
  console.log('  Stand-down humans:', standDown.stats.humanColonyEvents);
  console.log('  Pure robots:      ', pure.stats.counts.robotMature);
  console.log('  Stand-down robots:', standDown.stats.counts.robotMature);
  console.log('  Stand-down dormant:', standDown.stats.dormant);
  console.log('------------------------------------------------------------\n');

  assert.ok(
    standDown.stats.fillRatio < pure.stats.fillRatio,
    'stand-down should slow grid fill vs pure Hart-Tipler'
  );
  assert.ok(
    standDown.stats.humanColonyEvents >= 1,
    'stand-down scenario should produce at least one off-world human colony'
  );
  assert.ok(
    standDown.stats.dormant > 0,
    'sponsor-network robots should become dormant after human success'
  );
  assert.ok(
    standDown.stats.counts.robotMature < pure.stats.counts.robotMature,
    'fewer active robots when stand-down is enabled'
  );
});

test('100% robot stand-down dormancies all network robots on human success', () => {
  const sim = new PercolationSimulation(
    {
      ...HART_TIPLER_FAST_TEST,
      robotStandDown: 100,
      humanStandDown: 0,
      colonyFailRate: 0,
      transitFailRate: 0,
    },
    { rng: mulberry32(42) }
  );
  while (sim.currentYear < 50_000 && sim.humanColonyEvents.length === 0) {
    sim.tick();
  }
  assert.ok(sim.humanColonyEvents.length >= 1, 'expected a robot-born human colony');
  assert.ok(sim.getCounts().dormant > 0, 'robots should stand down at 100%');
});

const BOUNDED_FAST_TEST = {
  ...BOUNDED_EXPANSION_PARAMS,
  gridSize: 50,
  transitTime: 2000,
  maturationTime: 2000,
  decisionCycle: 2000,
  transitFailRate: 10,
  colonyFailRate: 10,
};

test('human stand-down reduces sponsor motivation on human colony success', () => {
  const sim = new PercolationSimulation(
    {
      ...BOUNDED_FAST_TEST,
      goalCoherence: 1,
      missionAbandonment: 0,
      humanStandDown: 70,
      successBonus: 0,
      robotSuccessBonus: 0,
    },
    { rng: mulberry32(4) }
  );
  const solBefore = sim.getSolNode().launchProbability;
  while (sim.currentYear < 500_000 && sim.humanColonyEvents.length === 0) {
    sim.tick();
  }
  assert.ok(sim.humanColonyEvents.length >= 1, 'expected at least one off-world human');
  const sol = sim.getSolNode();
  assert.ok(
    sol.history.some((ev) => ev.type === 'human_stand_down'),
    'Sol history should record human stand-down'
  );
  assert.ok(
    sol.launchProbability < solBefore,
    'human colony success should reduce sponsor motivation'
  );
  assert.equal(
    sim.getNodeDetails(
      Math.floor(sim.gridSize / 2),
      Math.floor(sim.gridSize / 2)
    ).launchBlocked,
    false,
    'Sol should not be permanently launch-blocked'
  );
});

test('former robot site reduces human colony share per robot pass', () => {
  const baseHuman = 0.04; // 96% robot / 4% human
  assert.equal(
    effectiveHumanColonyFrac(baseHuman, 0, 0.6),
    baseHuman,
    'virgin site uses base human share'
  );
  assert.ok(
    Math.abs(effectiveHumanColonyFrac(baseHuman, 1, 0.6) - 0.016) < 1e-12,
    'one prior robot pass -> 40% of base human share (1.6%)'
  );
  assert.ok(
    Math.abs(effectiveHumanColonyFrac(baseHuman, 2, 0.6) - 0.0064) < 1e-12,
    'two prior robot passes compound multiplicatively'
  );
});

test('bounded preset applies stand-down and former-robot human penalty', () => {
  const sim = new PercolationSimulation(BOUNDED_EXPANSION_PARAMS);
  assert.equal(sim._params.robotSiteHumanPenalty, BOUNDED_EXPANSION_PARAMS.robotSiteHumanPenalty);
  assert.equal(sim._params.robotSiteHumanPenaltyOn, true);
  assert.ok(sim._params.humanInitialLaunchProb <= 10);
  assert.equal(sim._params.solInitialLaunchProb, 5000);
  assert.equal(sim._params.robotStandDown, 100);
  assert.equal(sim._params.humanStandDown, 70);
});

test('bounded expansion at 10M y: ~5-10 human worlds, robot-led probes', () => {
  const seeds = [1, 2, 3, 4, 5, 42];
  const results = seeds.map((seed) => {
    const sim = new PercolationSimulation(
      { ...BOUNDED_EXPANSION_PARAMS, gridSize: 50 },
      { rng: mulberry32(seed) }
    );
    sim.runTo(10_000_000);
    const stats = getColonizationStats(sim);
    const st = sim.getStats();
    return {
      seed,
      humans: stats.counts.humanMature,
      fill: stats.fillRatio,
      robotPct: st.robotProbePct,
    };
  });

  console.log('\n-- Bounded expansion 10M y (50x50) --');
  for (const r of results) {
    console.log(
      `  seed ${r.seed}: ${r.humans} humans, ${(r.fill * 100).toFixed(1)}% fill, ${(r.robotPct * 100).toFixed(0)}% robot probes`
    );
  }
  console.log('------------------------------------\n');

  const avgHumans = results.reduce((a, b) => a + b.humans, 0) / results.length;
  const avgRobotPct = results.reduce((a, b) => a + b.robotPct, 0) / results.length;
  const inRange = results.filter((r) => r.humans >= 5 && r.humans <= 10).length;
  const maxHumans = Math.max(...results.map((r) => r.humans));

  assert.ok(avgHumans >= 1 && avgHumans <= 12, `avg human worlds should be modest, got ${avgHumans.toFixed(1)}`);
  assert.ok(inRange >= 1 || maxHumans <= 12, 'should usually produce a handful of humans by 10M y');
  assert.ok(avgRobotPct > 0.5, `robots should send majority of probes, got ${(avgRobotPct * 100).toFixed(0)}%`);
  for (const r of results) {
    assert.ok(r.fill < 0.12, `fill should stay a small sector (seed ${r.seed}: ${(r.fill * 100).toFixed(1)}%)`);
  }
});

test('bounded expansion stays limited vs Hart-Tipler on 50x50', () => {
  const seed = 42;
  const bounded = new PercolationSimulation(
    { ...BOUNDED_EXPANSION_PARAMS, gridSize: 50 },
    { rng: mulberry32(seed) }
  );
  bounded.runTo(10_000_000);
  const bStats = getColonizationStats(bounded);

  const ht = new PercolationSimulation(
    { ...HART_TIPLER_PARAMS, gridSize: 50 },
    { rng: mulberry32(seed) }
  );
  ht.runTo(100_000);
  const htStats = getColonizationStats(ht);

  assert.ok(
    bStats.humanColonyEvents <= 8,
    `bounded should produce few off-world humans by 10M y, got ${bStats.humanColonyEvents}`
  );
  assert.ok(
    bStats.fillRatio < 0.15,
    `bounded fill should stay partial, got ${(bStats.fillRatio * 100).toFixed(1)}%`
  );
  assert.ok(
    bStats.fillRatio < htStats.fillRatio,
    'bounded must fill far less than Hart-Tipler at 100k y'
  );
  assert.ok(
    htStats.counts.humanMature > 20,
    'Hart-Tipler control should still expand aggressively'
  );
});

test('probe launches tracked by human vs robot sponsor', () => {
  const sim = new PercolationSimulation(
    { ...HART_TIPLER_FAST_TEST, robotStandDown: 0, humanStandDown: 0 },
    { rng: mulberry32(1) }
  );
  sim.tick();
  assert.equal(sim.totalProbesSent, 1);
  assert.equal(sim.humanProbesSent, 1);
  assert.equal(sim.robotProbesSent, 0);

  sim.runTo(50_000);
  assert.ok(sim.robotProbesSent > 0, 'robot wave should launch probes');
  assert.equal(
    sim.humanProbesSent + sim.robotProbesSent,
    sim.totalProbesSent,
    'human + robot probes should equal total'
  );

  const stats = sim.getStats();
  assert.equal(stats.humanProbesSent, sim.humanProbesSent);
  assert.equal(stats.robotProbesSent, sim.robotProbesSent);
  assert.ok(Math.abs(stats.humanProbePct + stats.robotProbePct - 1) < 1e-12);
});

test('Sol initial motivation above 200% is stored and used as failure buffer', () => {
  const sim = new PercolationSimulation({
    ...HART_TIPLER_PARAMS,
    gridSize: 10,
    solInitialLaunchProb: 2500,
  });
  assert.equal(sim._params.solInitialLaunchProb, 2500);
  assert.equal(sim._params.solInitialLaunchProbFrac, 25);
  assert.equal(sim.getSolNode().launchProbability, 25);
  assert.equal(sim._effectiveRollProbability(25, 1, sim._params), 1);
});

test('human-sponsored robot colony logs natural site human share', () => {
  const sim = new PercolationSimulation(
    {
      ...BOUNDED_EXPANSION_PARAMS,
      gridSize: 10,
      transitTime: 1000,
      maturationTime: 1000,
      decisionCycle: 1000,
      transitFailRate: 0,
      colonyFailRate: 0,
      robotColonyRate: 95,
    },
    { rng: () => 0.5 }
  );
  sim.tick();
  while (sim.getCounts().robotMature === 0 && sim.currentYear < 50_000) {
    sim.tick();
  }
  assert.ok(sim.getCounts().robotMature >= 1, 'expected a robot colony from Sol');

  let colonized = null;
  for (let r = 0; r < sim.gridSize; r++) {
    for (let c = 0; c < sim.gridSize; c++) {
      const ev = sim.grid[r][c].history?.find((e) => e.type === 'colonized_robot');
      if (ev?.from === 'Sol') {
        colonized = ev;
        break;
      }
    }
    if (colonized) break;
  }
  assert.ok(colonized, 'expected colonized_robot history from Sol');
  assert.ok(
    Math.abs(colonized.siteHumanShare - 0.05) < 1e-9,
    `site share should be 5%, got ${colonized.siteHumanShare}`
  );
  assert.equal(colonized.rollHumanShare, 0);
  assert.equal(colonized.humanSponsorForcedRobot, true);
});

test('Sol launch status explains robot deferral and handoff', () => {
  const sim = new PercolationSimulation(
    {
      ...BOUNDED_EXPANSION_PARAMS,
      gridSize: 10,
      transitTime: 1000,
      maturationTime: 1000,
      decisionCycle: 1000,
      transitFailRate: 0,
      colonyFailRate: 0,
    },
    { rng: () => 0.5 }
  );
  sim.tick();
  while (sim.getCounts().robotMature === 0 && sim.currentYear < 20_000) {
    sim.tick();
  }
  assert.ok(sim.getCounts().robotMature >= 1, 'need active robots');

  const mid = Math.floor(sim.gridSize / 2);
  const solDetails = sim.getNodeDetails(mid, mid);
  assert.ok(solDetails.launchBlockedReasons.some((r) => r.includes('robot network')),
    'Sol should explain deferral while robots active');
  assert.ok(solDetails.robotNetworkPriorityExplanation, 'Sol should show bounded robot-network priority note');
  assert.match(solDetails.canLaunchExplanation, /Paused|robot network/i);
  assert.equal(solDetails.hasNewHumanHomeworld, false);
  assert.match(solDetails.missionCompleteExplanation, /^Mission complete: no/);
});

test('robot-born human colony gets initial motivation and can launch', () => {
  const sim = new PercolationSimulation(
    BOUNDED_FAST_TEST,
    { rng: mulberry32(4) }
  );
  while (sim.currentYear < 500_000 && sim.humanColonyEvents.length === 0) {
    sim.tick();
  }
  assert.ok(sim.humanColonyEvents.length >= 1, 'expected at least one off-world human');
  const { r, c, year } = sim.humanColonyEvents[0];
  assert.equal(sim.currentYear, year + 1000, 'should inspect right after founding tick');
  const details = sim.getNodeDetails(r, c);
  assert.equal(details.humanCanLaunch, true);
  assert.equal(details.launchProbability, sim._params.humanInitialLaunchProbFrac);
  assert.equal(details.launchBlocked, false);
  assert.equal(details.hasNewHumanHomeworld, false);
  assert.equal(details.missionCompleteCause, null);
});

test('robot-born human in strict bounded stands down robots without mission-complete', () => {
  const sim = new PercolationSimulation(BOUNDED_FAST_TEST, { rng: () => 0.001 });
  const mid = Math.floor(sim.gridSize / 2);
  const sol = sim.getSolNode();
  const handoff = sim.grid[mid + 1][mid];
  const robotParent = sim.grid[mid][mid + 1];

  for (let r = 0; r < sim.gridSize; r++) {
    for (let c = 0; c < sim.gridSize; c++) {
      if (sim.grid[r][c].isSol) continue;
      if (r === mid + 1 && c === mid) continue;
      const cell = sim.grid[r][c];
      cell.state = STATE.MATURE;
      cell.colonyType = COLONY_TYPE.ROBOT;
      cell.humanOrigin = sol;
    }
  }

  robotParent.colonyType = COLONY_TYPE.ROBOT;
  robotParent.humanOrigin = sol;

  handoff.state = STATE.MATURING;
  handoff.parent = robotParent;
  handoff.humanOrigin = sol;
  handoff.inboundFromLabel = 'Robot (test)';

  sim._succeedColony(handoff, sim._params, mid + 1, mid);

  assert.equal(sol.hasNewHumanHomeworld, false, 'robot-born human must not set mission-complete');
  assert.equal(handoff.hasNewHumanHomeworld, false);
  assert.equal(handoff.colonyType, COLONY_TYPE.HUMAN);
  assert.equal(handoff.humanCanLaunch, true);
  assert.equal(sim.getCounts().robotMature, 0, 'robots should stand down at 100% robotStandDown');
});

test('robot probes count on robot node and network tally on Sol, not Sol direct count', () => {
  const sim = new PercolationSimulation(
    {
      ...BOUNDED_EXPANSION_PARAMS,
      gridSize: 10,
      transitTime: 1000,
      maturationTime: 1000,
      decisionCycle: 1000,
      transitFailRate: 0,
      colonyFailRate: 0,
    },
    { rng: () => 0.01 }
  );
  sim.tick();
  sim.runTo(100_000);
  const sol = sim.getSolNode();
  assert.ok(sol.networkRobotProbesSent >= 1, 'robots should add to network tally');
  const directLaunches = sol.history.filter((ev) => ev.type === 'probe_launched').length;
  assert.equal(sol.probesSent, directLaunches, 'Sol probesSent should match direct launch history only');
  assert.ok(sim.robotProbesSent >= 1, 'sim should count robot-sponsored launches');
  assert.ok(
    sol.networkRobotProbesSent <= sim.robotProbesSent,
    'Sol network robot probes should be a subset of total robot probes (networks can branch away from Sol)'
  );
});

test('failures reduce Sol stored motivation in bounded mode', () => {
  const sim = new PercolationSimulation(
    {
      ...BOUNDED_EXPANSION_PARAMS,
      gridSize: 20,
      transitFailRate: 100,
      colonyFailRate: 0,
      decisionCycle: 1000,
      failurePenalty: 50,
      solInitialLaunchProb: 150,
    },
    { rng: mulberry32(3) }
  );
  const solStart = sim.getSolNode().launchProbability;
  assert.equal(solStart, 1.5);
  sim.runTo(10_000);
  const sol = sim.getSolNode();
  assert.ok(sol.launchProbability < solStart, 'transit failure should penalize Sol stored motivation');
  assert.ok(
    sol.history.some((ev) => ev.type === 'motivation_penalty'),
    'Sol history should record motivation penalty'
  );
});

test('robots launch on multiple decision cycles before stand-down', () => {
  const sim = new PercolationSimulation(
    {
      ...BOUNDED_EXPANSION_PARAMS,
      gridSize: 50,
      missionAbandonment: 0,
      transitFailRate: 0,
      colonyFailRate: 0,
      robotColonyRate: 100,
      decisionCycle: 3000,
    },
    { rng: mulberry32(42) }
  );
  sim.runTo(50_000);

  let maxLaunches = 0;
  for (let r = 0; r < sim.gridSize; r++) {
    for (let c = 0; c < sim.gridSize; c++) {
      const node = sim.grid[r][c];
      const launches = node.history?.filter((ev) => ev.type === 'probe_launched').length ?? 0;
      if (launches > maxLaunches) maxLaunches = launches;
    }
  }
  assert.ok(
    maxLaunches >= 3,
    `expected a robot to launch at least 3 times before stand-down, got max ${maxLaunches}`
  );
});
