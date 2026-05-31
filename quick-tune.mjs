import { PercolationSimulation } from './simulation.js';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function evaluate(params, seeds = 12, maxYear = 20_000_000) {
  const y1 = [];
  const y2 = [];
  const y3 = [];
  const humans = [];
  const robots = [];

  for (let s = 1; s <= seeds; s++) {
    const sim = new PercolationSimulation(params, { rng: mulberry32(s * 7919) });
    sim.runTo(maxYear);
    const ev = sim.humanColonyEvents.map((e) => e.year);
    y1.push(ev[0] ?? null);
    y2.push(ev[1] ?? null);
    y3.push(ev[2] ?? null);
    const c = sim.getCounts();
    humans.push(c.humanMature);
    robots.push(c.robotMature);
  }

  const med = (arr) => {
    const a = arr.filter((x) => x != null).sort((x, y) => x - y);
    return a.length ? a[Math.floor(a.length / 2)] : null;
  };

  let score = 0;
  const m1 = med(y1);
  const m2 = med(y2);
  if (m1) score += Math.max(0, 600_000 - Math.abs(m1 - 500_000)) / 6000;
  else score -= 60;
  if (m2) score += Math.max(0, 4_000_000 - Math.abs(m2 - 5_000_000)) / 20_000;
  else score -= 15;
  score -= y3.filter((x) => x != null).length / seeds * 50;
  score += humans.filter((h) => h === 2).length / seeds * 30;
  score -= humans.filter((h) => h > 3).length / seeds * 40;
  const avgRobots = robots.reduce((a, b) => a + b, 0) / seeds;
  score += avgRobots <= 4 ? 12 : -avgRobots * 2;

  return {
    score,
    medY1: m1,
    medY2: m2,
    pctY2: y2.filter((x) => x != null).length / seeds,
    pctY3: y3.filter((x) => x != null).length / seeds,
    avgHumans: humans.reduce((a, b) => a + b, 0) / seeds,
    avgRobots,
  };
}

const candidates = [
  {
    name: 'A',
    params: {
      gridSize: 50,
      transitTime: 5000,
      maturationTime: 4000,
      decisionCycle: 2800,
      solInitialLaunchProb: 100,
      humanInitialLaunchProb: 58,
      transitFailRate: 40,
      colonyFailRate: 50,
      robotColonyRate: 87,
      robotSuccessBonus: 10,
      robotCapabilityDecay: 32,
      successBonus: 15,
      failurePenalty: 62,
      distancePenalty: 1.4,
      robotLaunchMin: 3,
      robotLaunchMax: 9,
      resourceDepletion: 12,
      goalCoherence: 0.998,
      destFailPenalty: 32,
      failureStrikeLimit: 4,
      failureTimeoutYears: 200,
      missionAbandonment: 0.22,
    },
  },
  {
    name: 'B',
    params: {
      gridSize: 50,
      transitTime: 4800,
      maturationTime: 4200,
      decisionCycle: 3000,
      solInitialLaunchProb: 100,
      humanInitialLaunchProb: 54,
      transitFailRate: 42,
      colonyFailRate: 51,
      robotColonyRate: 88,
      robotSuccessBonus: 9,
      robotCapabilityDecay: 30,
      successBonus: 14,
      failurePenalty: 60,
      distancePenalty: 1.38,
      robotLaunchMin: 4,
      robotLaunchMax: 10,
      resourceDepletion: 10,
      goalCoherence: 0.9981,
      destFailPenalty: 30,
      failureStrikeLimit: 4,
      failureTimeoutYears: 175,
      missionAbandonment: 0.2,
    },
  },
  {
    name: 'C',
    params: {
      gridSize: 50,
      transitTime: 5200,
      maturationTime: 3800,
      decisionCycle: 2600,
      solInitialLaunchProb: 100,
      humanInitialLaunchProb: 56,
      transitFailRate: 41,
      colonyFailRate: 49,
      robotColonyRate: 86,
      robotSuccessBonus: 11,
      robotCapabilityDecay: 34,
      successBonus: 16,
      failurePenalty: 65,
      distancePenalty: 1.42,
      robotLaunchMin: 3,
      robotLaunchMax: 8,
      resourceDepletion: 14,
      goalCoherence: 0.9978,
      destFailPenalty: 35,
      failureStrikeLimit: 3,
      failureTimeoutYears: 220,
      missionAbandonment: 0.25,
    },
  },
];

let best = null;
for (const c of candidates) {
  const r = evaluate(c.params);
  console.log(c.name, r);
  if (!best || r.score > best.score) best = { name: c.name, params: c.params, ...r };
}

console.log('\nBEST', best);
