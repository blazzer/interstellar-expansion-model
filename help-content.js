/** Help text for readout stats and simulation parameters */

export const STAT_HELP = {
  currentYear: 'Simulation time in years. The model advances in fixed 1,000-year ticks; all scheduled events (transit, maturation, launch decisions) snap to tick boundaries.',
  solMotivation: 'Sol\'s stored launch motivation (%). Values above 100% act as a failure buffer; effective launch rolls cap at 100%. After a human-colony success credited to a sponsor, that sponsor\'s stored motivation is capped at 100% and then continues to decay via failure penalties. In bounded mode, Sol human launches pause while the robot network is still active -- remaining motivation is held until robots stand down, then Sol may launch again if motivation > 0%.',
  humanWorlds: 'Count of mature human colonies including Sol. Off-world humans launch with Human Colony Initial Motivation; human stand-down on success reduces sponsor motivation but allows relaunch if motivation stays above roll thresholds.',
  robotWorlds: 'Mature self-replicating probe colonies. Each launches on its own robot decision cycle until stand-down, scope drift, abandonment, or resource exhaustion.',
  maturing: 'Sites where a probe has arrived and is surviving periodic colony-failure rolls during maturation. Resolves to human or robot when maturation completes.',
  inTransit: 'Instantaneous count of probes currently en route--not cumulative. Hart-Tipler often keeps this at 1-2 while new probes replace arriving ones.',
  dormant: 'Former robot colonies that stood down (mission complete or zero capability). Dormant sites can be retargeted; each failed attempt adds destination penalties.',
  dead: 'Colonies that failed in transit, failed all maturation rolls, were abandoned, or exhausted resources. Dead sites accumulate failed-attempt history for targeting penalties.',
  humanTimeline: 'Chronological list of off-world human colonies when they finished maturation. Sol is excluded. Useful for checking bounded milestones (~1 by 500k y, ~2 by 5M y).',
  totalProbesSent: 'Cumulative probes launched by all human and robot sponsors since year 0. Does not count probes that failed the launch roll.',
  humanProbes: 'Per human world: current effective launch motivation and total probes that world has sent. Includes strikes/time-out markers when failure limits apply.',
  avgRobotCap: 'Mean probe capability across all mature robot colonies right now--after capability decay and goal-coherence drift. Zero means robots are about to go dormant.',
  robotCapRange: 'Min-max capability among mature robots. Wide spread indicates fragments of different ages or resource-depletion states.',
  activeRobots: 'Robots still launching (not dormant from stand-down, scope drift, or resource exhaustion).',
  robotsAtLimit: 'Robots that hit their per-colony launch cap when Robot Launch Max is enabled.',
  optionalMechanics: 'Summary of non-zero optional parameters: coherence decay, destination penalties, strikes, abandonment, former-robot human penalty, and stand-down percentages.',
  modelProbabilities: 'Derived per-tick and end-to-end probabilities from current parameter inputs. Used internally for transit rolls, maturation survival, and human vs robot colony type.',
  profiling: 'When enabled, shows accumulated runtime hotspots since the last profiling reset. Useful for finding expensive steps (often launch target selection) that can lock up long forward runs.',
};

export const PARAM_HELP = {
  gridSize: 'Number of cells per side. Sol sits at the centre. Larger grids mean longer distances and slower percolation.',
  transitTime: 'Years a probe spends in transit (x distance in grid steps). Scheduled to the next 1,000-year tick boundary.',
  maturationTime: 'Years a site spends maturing after transit. Colony failure is spread across maturation ticks.',
  decisionCycle: 'Years between launch decisions for human worlds and the base interval for robot colonies.',
  solInitialLaunchProb: 'Sol\'s starting launch motivation (%). May far exceed 100% to absorb early failures; each launch roll still caps at 100% until stored motivation is depleted by penalties.',
  humanInitialLaunchProb: 'Starting motivation for off-world human colonies (%) once they can launch probes. Unchanged until probes succeed or failures penalize the sponsor network.',
  transitFailRate: 'Probability (%) that a probe is lost in transit.',
  colonyFailRate: 'Cumulative probability (%) of colony failure during entire maturation.',
  robotColonyRate: 'On successful maturation, probability (%) the site becomes a robot colony vs human.',
  robotSuccessBonus: 'Multiplier applied to sponsor human motivation when a robot colony succeeds (bounded: off-world humans excluded).',
  robotCapabilityDecay: 'Percent of robot probe capability lost over each Robot Decay Period (default 100,000 years). 0 = off.',
  robotDecayPeriod: 'Time span over which Robot Capability Decay is applied: capability multiplies by (1 - decay)^(age / period). Larger values mean slower decay.',
  successBonus: 'Multiplier on human sponsor motivation when a human colony succeeds.',
  failurePenalty: 'Multiplier applied to sponsor motivation after a failure (bounded: Sol exempt).',
  distancePenalty: 'Motivation divided by this factor raised to (distance-1) power for each launch target.',
  robotLaunchMin: 'Minimum random launch cap per robot when Robot Launch Max > 0.',
  robotLaunchMax: 'Maximum launches per robot colony; 0 = unlimited.',
  resourceDepletion: 'Percent increase to robot cycle time after each launch (%/launch).',
  goalCoherence: 'Per millennium, robot capability and off-world human motivation multiply by this factor. 1 = off. Must be < 1.0 (with the other three strict-bounded triggers) for strict bounded mode.',
  destFailPenalty: 'Each failed mission at a site reduces its selection weight by this percent.',
  failureStrikeLimit: 'Failures before sponsor enters launch time-out; 0 = off.',
  failureTimeoutYears: 'Launch pause duration after hitting strike limit (x1,000 years).',
  missionAbandonment: 'Per millennium, each active robot colony has this % chance to become dead. Must be > 0 (with the other three strict-bounded triggers) for strict bounded mode.',
  robotSiteHumanPenalty: 'Each prior robot colonization at a site multiplies human colony share by (100-penalty)% per pass.',
  robotStandDown: 'When an off-world human colony succeeds in a sponsor network, each robot in that network has this probability (%) of going dormant. 100% reproduces deterministic stand-down; 0% is pure Hart-Tipler. Must be >= 100% (with the other three strict-bounded triggers) to activate strict bounded mode.',
  humanStandDown: 'On human colony success, the accountable sponsor human\'s stored motivation is multiplied by (100 - drop)%. Does not permanently block launches -- humans may probe again if motivation recovers. Must be > 0% (with the other three triggers) for strict bounded mode.',
  strictBoundedMode: 'Strict bounded mode coordinates robot-led expansion with limited human worlds. It activates when ALL four triggers are set: Robot Stand Down >= 100%, Human Stand Down > 0%, Goal Coherence < 1.0, Mission Abandonment > 0%. When active: Sol pauses human launches while mature robots remain; robot-born humans become the preferred launcher; human-founded colonies and non-preferred launchers use the motivation-keep percentages below; robots stand down (per Robot Stand Down %) when a robot-born human colony succeeds. To deactivate: set any trigger outside those thresholds (e.g. Robot Stand Down below 100%, Human Stand Down to 0, Goal Coherence to 1.0, or Mission Abandonment to 0).',
  humanFoundedLaunchPct: 'In strict bounded mode only: off-world human colonies founded directly by other humans (not robot-born) retain this percentage of launch motivation. Lower values suppress exponential human-launcher growth. Ignored when strict bounded mode is off.',
  nonPreferredLaunchPct: 'In strict bounded mode only: human colonies that are not the network\'s current preferred launcher retain this percentage of launch motivation. The preferred launcher is usually the most recent robot-born human. Ignored when strict bounded mode is off.',
};

export function formatHistoryEvent(ev) {
  switch (ev.type) {
    case 'probe_inbound':
      return `Year ${ev.year.toLocaleString()}: probe inbound from ${ev.from ?? '?'} (dist ${ev.distance ?? '?'})`;
    case 'probe_launched':
      return `Year ${ev.year.toLocaleString()}: launched probe -> (${ev.toR},${ev.toC})` +
        (ev.sponsor === 'robot' ? ' (robot)' : ev.sponsor === 'human' ? ' (human)' : '');
    case 'transit_arrived':
      return `Year ${ev.year.toLocaleString()}: transit complete from ${ev.from ?? '?'}`;
    case 'transit_failed':
      return `Year ${ev.year.toLocaleString()}: transit failed from ${ev.from ?? '?'}`;
    case 'maturation_failed':
      return `Year ${ev.year.toLocaleString()}: maturation failed (from ${ev.from ?? '?'})`;
    case 'colonized_robot': {
      const site = (ev.siteHumanShare ?? ev.humanShare ?? 0) * 100;
      if (ev.humanSponsorForcedRobot) {
        return `Year ${ev.year.toLocaleString()}: robot colony established (site human share ${site.toFixed(1)}%; human sponsor -> robot only)`;
      }
      return `Year ${ev.year.toLocaleString()}: robot colony established (human share ${site.toFixed(1)}%)`;
    }
    case 'colonized_human': {
      const site = (ev.siteHumanShare ?? ev.humanShare ?? 0) * 100;
      return `Year ${ev.year.toLocaleString()}: human colony established (human share ${site.toFixed(1)}%)`;
    }
    case 'dormant':
      return `Year ${ev.year.toLocaleString()}: went dormant (${ev.reason ?? 'stand-down'})`;
    case 'stand_down':
      return `Year ${ev.year.toLocaleString()}: robot network stand-down`;
    case 'dead':
      return `Year ${ev.year.toLocaleString()}: dead (${ev.reason ?? 'failure'})`;
    case 'mission_complete': {
      const via = ev.via ?? 'unknown';
      if (via === 'child_human_colony') {
        return `Year ${ev.year.toLocaleString()}: mission complete -- direct human child at (${ev.childR},${ev.childC})`;
      }
      if (via === 'robot_born_human') {
        return `Year ${ev.year.toLocaleString()}: mission complete -- robot-born human at (${ev.childR},${ev.childC})`;
      }
      if (ev.childR != null) {
        return `Year ${ev.year.toLocaleString()}: mission complete -- child at (${ev.childR},${ev.childC})`;
      }
      return `Year ${ev.year.toLocaleString()}: mission complete (${via})`;
    }
    case 'motivation_penalty':
      return `Year ${ev.year.toLocaleString()}: motivation penalty ${((ev.before ?? 0) * 100).toFixed(1)}% -> ${((ev.after ?? 0) * 100).toFixed(1)}%` +
        (ev.from ? ` (failure toward ${ev.from})` : '');
    case 'human_stand_down':
      return `Year ${ev.year.toLocaleString()}: human stand-down ${((ev.before ?? 0) * 100).toFixed(1)}% -> ${((ev.after ?? 0) * 100).toFixed(1)}%` +
        (ev.from ? ` (human colony at ${ev.from})` : '');
    default:
      return `Year ${ev.year.toLocaleString()}: ${ev.type}`;
  }
}
