import {
  PercolationSimulation,
  BOUNDED_EXPANSION_PARAMS,
} from './simulation.js';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runScenario(rawParams, seed, maxYear = 50_000_000) {
  const sim = new PercolationSimulation(rawParams, { rng: mulberry32(seed) });
  sim.runTo(maxYear);
  const events = sim.humanColonyEvents.map((e) => e.year);
  const counts = sim.getCounts();
  return {
    events,
    finalHuman: counts.humanMature,
    finalRobot: counts.robotMature,
    finalDead: counts.dead,
    year: sim.currentYear,
  };
}

function scoreRun(result) {
  const [y1, y2, y3] = result.events;
  let score = 0;

  // Want exactly 1st human colony in ~200k-700k window
  if (y1 != null) {
    const d1 = Math.abs(y1 - 500_000);
    score += Math.max(0, 400_000 - d1) / 4000;
    if (y1 > 1_500_000) score -= 80;
    if (y1 < 50_000) score -= 40;
  } else {
    score -= 120;
  }

  // Want 2nd human colony in ~1M-10M window, ideally ~5M
  if (y2 != null) {
    const d2 = Math.abs(y2 - 5_000_000);
    score += Math.max(0, 4_000_000 - d2) / 8000;
    if (y2 < y1 + 200_000) score -= 30;
  } else {
    score -= 40;
  }

  // Prefer no 3rd human colony (bounded)
  if (y3 != null) score -= 60;
  else score += 25;

  // Fizzle: few robots left at end
  if (result.finalRobot <= 3) score += 15;
  if (result.finalRobot > 15) score -= result.finalRobot;

  // Cap total humans at 2-3 (Sol + 1-2 colonies)
  if (result.finalHuman === 2) score += 20;
  if (result.finalHuman === 3) score += 10;
  if (result.finalHuman > 4) score -= (result.finalHuman - 3) * 25;

  return score;
}

function evaluateParams(rawParams, seeds = 24) {
  let total = 0;
  const summaries = [];
  for (let s = 0; s < seeds; s++) {
    const r = runScenario(rawParams, s + 1);
    total += scoreRun(r);
    summaries.push(r);
  }
  const med = (arr) => {
    const a = arr.filter((x) => x != null).sort((a, b) => a - b);
    if (!a.length) return null;
    return a[Math.floor(a.length / 2)];
  };
  return {
    avgScore: total / seeds,
    medY1: med(summaries.map((r) => r.events[0])),
    medY2: med(summaries.map((r) => r.events[1])),
    pctThird: summaries.filter((r) => r.events[2] != null).length / seeds,
    avgHumans: summaries.reduce((a, r) => a + r.finalHuman, 0) / seeds,
    avgRobots: summaries.reduce((a, r) => a + r.finalRobot, 0) / seeds,
  };
}

function mutate(base, scale = 1) {
  const p = { ...base };
  const tweak = (key, delta, min, max) => {
    if (!Number.isFinite(base[key])) return;
    p[key] = Math.max(min, Math.min(max, p[key] + delta * scale));
    if (Number.isInteger(base[key])) p[key] = Math.round(p[key]);
  };

  tweak('solInitialLaunchProb', (Math.random() - 0.5) * 800, 2000, 8000);
  tweak('humanInitialLaunchProb', (Math.random() - 0.5) * 4, 5, 20);
  tweak('transitFailRate', (Math.random() - 0.5) * 8, 35, 60);
  tweak('colonyFailRate', (Math.random() - 0.5) * 8, 40, 70);
  tweak('robotColonyRate', (Math.random() - 0.5) * 4, 85, 96);
  tweak('decisionCycle', (Math.random() - 0.5) * 2000, 2500, 6000);
  tweak('transitTime', (Math.random() - 0.5) * 3000, 5000, 12000);
  tweak('maturationTime', (Math.random() - 0.5) * 2000, 4000, 9000);
  tweak('robotCapabilityDecay', (Math.random() - 0.5) * 6, 15, 40);
  tweak('robotDecayPeriod', (Math.random() - 0.5) * 30000, 50000, 150000);
  tweak('failurePenalty', (Math.random() - 0.5) * 10, 40, 70);
  tweak('distancePenalty', (Math.random() - 0.5) * 0.15, 1.15, 1.6);
  tweak('robotLaunchMax', (Math.random() - 0.5) * 4, 6, 18);
  tweak('resourceDepletion', (Math.random() - 0.5) * 4, 3, 15);
  tweak('goalCoherence', (Math.random() - 0.5) * 0.0004, 0.997, 0.9995);
  tweak('missionAbandonment', (Math.random() - 0.5) * 0.05, 0.05, 0.25);
  tweak('failureStrikeLimit', (Math.random() - 0.5) * 2, 3, 6);
  tweak('failureTimeoutYears', (Math.random() - 0.5) * 40, 80, 250);
  tweak('robotStandDown', (Math.random() - 0.5) * 10, 80, 100);
  tweak('humanStandDown', (Math.random() - 0.5) * 10, 50, 90);
  tweak('robotSiteHumanPenalty', (Math.random() - 0.5) * 10, 30, 60);
  return p;
}

console.log('Evaluating BOUNDED_EXPANSION_PARAMS seed sweep...');
const baseline = evaluateParams(BOUNDED_EXPANSION_PARAMS);
console.log(JSON.stringify(baseline, null, 2));

let best = { params: BOUNDED_EXPANSION_PARAMS, ...baseline };
for (let i = 0; i < 80; i++) {
  const candidate = mutate(best.params, i < 40 ? 1 : 0.5);
  const ev = evaluateParams(candidate, 16);
  if (ev.avgScore > best.avgScore) {
    best = { params: candidate, ...ev };
    console.log(`[${i}] new best score=${ev.avgScore.toFixed(1)}`, ev);
  }
}

console.log('\n=== BEST PARAMS ===');
console.log(JSON.stringify(best.params, null, 2));
console.log('\n=== METRICS (24 seeds) ===');
console.log(JSON.stringify(evaluateParams(best.params, 24), null, 2));
