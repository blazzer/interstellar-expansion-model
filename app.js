import {
  STATE,
  COLONY_TYPE,
  TICK,
  MAX_YEAR,
  STATE_COLORS,
  MATURE_COLORS,
  CORE_PARAM_DEFS,
  STRICT_BOUNDED_TRIGGER_DEFS,
  STRICT_BOUNDED_PENALTY_DEFS,
  GENERAL_OPTIONAL_PARAM_DEFS,
  PARAM_DEFS,
  BOUNDED_EXPANSION_PARAMS,
  HART_TIPLER_PARAMS,
  PercolationSimulation,
  isStrictBoundedMode,
  normalizeParams,
} from './simulation.js';
import { STAT_HELP, PARAM_HELP, formatHistoryEvent } from './help-content.js';

const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');
const controlsEl = document.getElementById('controls');
const readoutEl = document.getElementById('readout');
const legendEl = document.getElementById('legend');
const btnAdvance = document.getElementById('btnAdvance');
const btnNextEvent = document.getElementById('btnNextEvent');
const btnStop = document.getElementById('btnStop');
const btnReset = document.getElementById('btnReset');
const btnRules = document.getElementById('btnRules');
const btnPreset = document.getElementById('btnPreset');
const btnHartTipler = document.getElementById('btnHartTipler');
const btnCloseRules = document.getElementById('btnCloseRules');
const rulesDialog = document.getElementById('rulesDialog');
const rulesContent = document.getElementById('rulesContent');
const helpDialog = document.getElementById('helpDialog');
const helpDialogTitle = document.getElementById('helpDialogTitle');
const helpDialogContent = document.getElementById('helpDialogContent');
const btnCloseHelp = document.getElementById('btnCloseHelp');
const nodeDialog = document.getElementById('nodeDialog');
const nodeDialogTitle = document.getElementById('nodeDialogTitle');
const nodeDialogContent = document.getElementById('nodeDialogContent');
const btnCloseNode = document.getElementById('btnCloseNode');
const timeJumpEl = document.getElementById('timeJump');
const chkProfiling = document.getElementById('chkProfiling');
const btnResetProfiling = document.getElementById('btnResetProfiling');
const btnViewProfiling = document.getElementById('btnViewProfiling');
const appEl = document.querySelector('.app');
const btnAdvanceMobile = document.getElementById('btnAdvanceMobile');
const btnNextEventMobile = document.getElementById('btnNextEventMobile');
const btnStopMobile = document.getElementById('btnStopMobile');
const btnResetMobile = document.getElementById('btnResetMobile');
const runStatusBanner = document.getElementById('runStatusBanner');
const runStatusYear = document.getElementById('runStatusYear');
const runHeaderYear = document.getElementById('runHeaderYear');
const MQ_MOBILE = window.matchMedia('(max-width: 768px)');

function isMobileLayout() {
  return MQ_MOBILE.matches;
}

function formatJumpYears(years) {
  const abs = Math.abs(years);
  if (abs >= 1e9) {
    const n = years / 1e9;
    return `${Number.isInteger(n) ? n : n.toFixed(1)}B yr`;
  }
  if (abs >= 1e6) {
    const n = years / 1e6;
    return `${Number.isInteger(n) ? n : n.toFixed(1)}M yr`;
  }
  if (abs >= 1e3) {
    const n = years / 1e3;
    return `${Number.isInteger(n) ? n : n.toFixed(1)}k yr`;
  }
  return `${years} yr`;
}

function updateAdvanceButtonLabels() {
  const ticks = Math.max(1, Math.floor(parseFloat(timeJumpEl?.value) || 1));
  const text = `Advance ${formatJumpYears(ticks * TICK)}`;
  for (const el of document.querySelectorAll('.js-btn-advance')) {
    el.textContent = text;
  }
}

function setView(view) {
  if (!appEl) return;
  appEl.dataset.view = view;
  const onSetup = view === 'setup';
  for (const el of document.querySelectorAll('.js-view-setup')) {
    el.setAttribute('aria-current', onSetup ? 'page' : 'false');
  }
  for (const el of document.querySelectorAll('.js-view-run')) {
    el.setAttribute('aria-current', onSetup ? 'false' : 'page');
  }
  if (view === 'run') {
    requestAnimationFrame(() => {
      resizeCanvas();
      render();
    });
  }
}

function maybeEnterRunView() {
  if (isMobileLayout()) setView('run');
}

function helpBtn(id) {
  return `<button type="button" class="help-btn" data-help="${id}" aria-label="Help">?</button>`;
}

function buildParamLabel(def) {
  const label = document.createElement('label');
  label.innerHTML = `<span class="label-row"><span>${def.label}</span>${helpBtn(def.id)}</span>
    <span>${def.unit}</span>
    <input type="number" id="param-${def.id}"
      value="${BOUNDED_EXPANSION_PARAMS[def.id] ?? def.default}" min="${def.min}" max="${def.max}" step="${def.step}">`;
  return label;
}

for (const def of CORE_PARAM_DEFS) {
  controlsEl.appendChild(buildParamLabel(def));
}

const strictPanel = document.createElement('div');
strictPanel.className = 'strict-bounded-panel';
strictPanel.innerHTML = `
  <div class="strict-bounded-status inactive" id="strictBoundedStatus">
    <span id="strictBoundedStatusText">Strict bounded mode: Deactivated</span>
    ${helpBtn('strictBoundedMode')}
  </div>
  <p class="param-section-note">All four triggers below must be set for activation (see help). Penalty params apply only when active.</p>
`;
controlsEl.appendChild(strictPanel);

const strictParamsEl = document.createElement('div');
strictParamsEl.className = 'strict-bounded-params';
strictPanel.appendChild(strictParamsEl);

for (const def of [...STRICT_BOUNDED_TRIGGER_DEFS, ...STRICT_BOUNDED_PENALTY_DEFS]) {
  strictParamsEl.appendChild(buildParamLabel(def));
}

const optNote = document.createElement('p');
optNote.className = 'param-section-note';
optNote.textContent = 'Other optional -- set to 0 (or 1 for coherence) to disable.';
controlsEl.appendChild(optNote);

for (const def of GENERAL_OPTIONAL_PARAM_DEFS) {
  controlsEl.appendChild(buildParamLabel(def));
}

function updateStrictBoundedStatus() {
  const on = isStrictBoundedMode(normalizeParams(readRawParams()));
  const el = document.getElementById('strictBoundedStatus');
  const text = document.getElementById('strictBoundedStatusText');
  if (!el || !text) return;
  el.classList.toggle('active', on);
  el.classList.toggle('inactive', !on);
  text.textContent = on
    ? 'Strict bounded mode: Activated'
    : 'Strict bounded mode: Deactivated';
}

const LEGEND_ITEMS = [
  { color: MATURE_COLORS.sol, label: 'Sol (Homeworld)' },
  { color: MATURE_COLORS.human, label: 'Human Colony' },
  { color: MATURE_COLORS.robot, label: 'Robot Colony' },
  { color: STATE_COLORS[STATE.IN_TRANSIT], label: 'In Transit' },
  { color: STATE_COLORS[STATE.MATURING], label: 'Maturing' },
  { color: STATE_COLORS[STATE.UNCOLONIZED], label: 'Uncolonized' },
  { color: STATE_COLORS[STATE.DORMANT], label: 'Dormant Robot Site' },
  { color: STATE_COLORS[STATE.DEAD], label: 'Dead' },
];

for (const item of LEGEND_ITEMS) {
  const el = document.createElement('div');
  el.className = 'legend-item';
  el.innerHTML = `<div class="swatch" style="background:${item.color}"></div>${item.label}`;
  legendEl.appendChild(el);
}

rulesContent.innerHTML = `
  <h4>Overview</h4>
  <ul>
    <li>Time advances in 1,000-year steps from Sol, the human homeworld at the grid centre.</li>
    <li>Sol starts at <strong>Sol Initial Motivation</strong> (default 100%) and may launch at year 0.</li>
    <li>New human colonies start at <strong>Human Colony Initial Motivation</strong> (default 50%).</li>
    <li>Success is implied: survive transit and all maturation rolls.</li>
  </ul>
  <h4>Human vs Robot Colonies</h4>
  <ul>
    <li>When a colony finishes maturation, a roll decides whether it becomes <strong>human</strong> or <strong>robotic</strong> (Robot Colony Rate).</li>
    <li><strong>Human worlds</strong> have their own launch motivation and decide independently.</li>
    <li><strong>Robot colonies</strong> each launch on their own decision cycle until their network establishes a new human homeworld.</li>
    <li>Robot probe capability decays by <strong>Robot Capability Decay</strong> % every 100,000 years (0 = off).</li>
    <li>Robots that stand down (mission complete or scope drift) become <strong>dormant</strong> -- not dead. Dormant sites can be retargeted by robots; destination-fail penalties apply.</li>
    <li>Robots prefer virgin (uncolonized) systems and only fall back to reclaiming dormant sites when no uncolonized target is reachable.</li>
    <li><strong>Robot Stand Down</strong> (% on human success): when an off-world human colony matures in a sponsor network, each robot in that network has this probability of going dormant (100% = all stand down; 0% = Hart-Tipler).</li>
    <li><strong>Human Stand Down</strong> (% motivation drop): on human colony success, the accountable sponsor human's stored motivation is multiplied by (100 - drop)% -- mission accomplished, not a permanent launch ban.</li>
    <li>Resource-exhausted or abandoned robots become <strong>dead</strong>.</li>
    <li><strong>Former Robot -> Human Penalty</strong> (%/robot pass): each time a site has matured as a robot colony, later attempts to establish a human colony there multiply the base human share by (100 - penalty)% per prior robot pass (0 = off).</li>
    <li><strong>Strict bounded mode</strong> (see Parameters panel): activates when Robot Stand Down >= 100%, Human Stand Down &gt; 0%, Goal Coherence &lt; 1, and Mission Abandonment &gt; 0. Sol pauses human launches while robots expand; robot-born humans become preferred launchers; robots stand down when a robot-born human colony succeeds.</li>
    <li><strong>Bounded mode</strong> (non-zero stand-down params): direct human settlements from human-launched probes do not launch further probes. Robot-born human colonies launch until stand-down rolls fire; sponsor humans get a motivation drop but may launch again if motivation recovers.</li>
    <li>Failures and successes of robotic systems always affect the sponsoring human world immediately.</li>
  </ul>
  <h4>Controls</h4>
  <ul>
    <li><strong>Advance Time</strong> -- jump forward by the Time Jump value (x1,000 years).</li>
    <li><strong>Forward to Next Event</strong> -- advance to the next time the grid changes (cap: 1 billion years).</li>
    <li><strong>Bounded Expansion Preset</strong> -- slow, limited expansion (robot stand-down 100%, human stand-down 70%).</li>
    <li><strong>Hart-Tipler Preset</strong> -- aggressive self-replicating probes, both stand-down params at 0%.</li>
  </ul>
  <p>All rates and bonuses are configurable in the Parameters panel.</p>`;

let sim = null;
let isRunning = false;
let simulationRunId = 0;
let readoutYearEl = null;
const TICKS_PER_FRAME = 25;

const READOUT_HELP = {
  ...STAT_HELP,
  totalProbes: STAT_HELP.totalProbesSent,
  humanProbs: STAT_HELP.humanProbes,
  optionalMech: STAT_HELP.optionalMechanics,
  modelProbs: STAT_HELP.modelProbabilities,
};

const DIALOG_VIEWPORT_MARGIN = 12;

function anchorRect(anchor) {
  if (!anchor) return null;
  if (anchor instanceof DOMRect) return anchor;
  return anchor.getBoundingClientRect();
}

function positionDialogAtAnchor(dialog, anchor) {
  const rect = anchorRect(anchor);
  if (!rect) return;

  const w = dialog.offsetWidth;
  const h = dialog.offsetHeight;
  let left = rect.left + rect.width / 2 - w / 2;
  let top = rect.top + rect.height / 2 - h / 2;

  const maxLeft = window.innerWidth - w - DIALOG_VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - h - DIALOG_VIEWPORT_MARGIN;
  left = Math.max(DIALOG_VIEWPORT_MARGIN, Math.min(left, maxLeft));
  top = Math.max(DIALOG_VIEWPORT_MARGIN, Math.min(top, maxTop));

  dialog.style.left = `${left}px`;
  dialog.style.top = `${top}px`;
}

function showDialogAtAnchor(dialog, anchor) {
  dialog.showModal();
  positionDialogAtAnchor(dialog, anchor);
}

function showHelp(id, title, anchor) {
  const text = READOUT_HELP[id] ?? PARAM_HELP[id];
  if (!text) return;
  helpDialogTitle.textContent = title ?? id;
  helpDialogContent.innerHTML = `<p>${text}</p>`;
  showDialogAtAnchor(helpDialog, anchor);
}

function formatProbesSent(stats) {
  const total = stats.totalProbesSent.toLocaleString();
  if (stats.totalProbesSent === 0) return total;
  return `${total}<br><span style="color:var(--muted);font-size:0.85em">Human: ${pct(stats.humanProbePct)} . Robot: ${pct(stats.robotProbePct)}</span>`;
}

function readRawParams() {
  const p = {};
  for (const def of PARAM_DEFS) {
    p[def.id] = parseFloat(document.getElementById(`param-${def.id}`).value);
  }
  return p;
}

function applyParamsToInputs(raw) {
  for (const def of PARAM_DEFS) {
    const val = raw[def.id] ?? def.default;
    document.getElementById(`param-${def.id}`).value = val;
  }
  updateStrictBoundedStatus();
}

function pct(v, digits = 1) {
  return `${(v * 100).toFixed(digits)}%`;
}

function formatSolReadout(sol, currentYear) {
  if (!sol) return '--';
  let s = pct(sol.launchProbability);
  if (sol.humanFailureStrikes > 0) s += ` . ${sol.humanFailureStrikes} strikes`;
  if ((sol.launchTimeoutUntil ?? 0) > (currentYear ?? 0)) {
    s += ` . timeout until ${sol.launchTimeoutUntil.toLocaleString()}`;
  }
  return s;
}

function formatHumanProbs(humanProbs) {
  if (humanProbs.length === 0) return '--';
  return humanProbs.map((h) => {
    let s = `${h.label}: ${pct(h.value)} . ${h.probesSent} direct`;
    if (h.networkRobotProbesSent > 0) {
      s += ` + ${h.networkRobotProbesSent} via robots`;
    }
    if (h.strikes > 0) s += ` (${h.strikes} strikes)`;
    if (h.timedOut) s += ' [paused]';
    return s;
  }).join('<br>');
}

function formatOptionalStatus(p) {
  const lines = [];
  lines.push(
    p.strictBoundedModeOn
      ? 'Strict bounded mode: activated'
      : 'Strict bounded mode: deactivated'
  );
  if (p.strictBoundedModeOn) {
    lines.push(
      `Human-founded launch: ${p.humanFoundedLaunchPct}% kept . `
      + `Non-preferred: ${p.nonPreferredLaunchPct}% kept`
    );
  }
  if (p.robotLaunchLimitOn) {
    lines.push(`Launch limits: ${p.robotLaunchMinVal}-${p.robotLaunchMaxVal}`);
  }
  if (p.resourceDepletionFrac > 0) {
    lines.push(`Depletion: ${pct(p.resourceDepletionFrac)}/launch`);
  }
  lines.push(
    p.goalCoherenceOn
      ? `Coherence: ${p.goalCoherence}/mill (decay on)`
      : `Coherence: ${p.goalCoherence} (off)`
  );
  if (p.destFailPenaltyFrac > 0) {
    lines.push(`Dest penalty: ${pct(p.destFailPenaltyFrac)}/fail`);
  }
  if (p.failureStrikeOn) {
    lines.push(`Strikes: ${p.failureStrikeLimit} -> ${p.failureTimeoutYearsVal.toLocaleString()}y`);
  }
  if (p.missionAbandonmentOn) {
    lines.push(`Abandonment: ${p.missionAbandonment}%/mill`);
  }
  if (p.robotSiteHumanPenaltyOn) {
    lines.push(`Former robot -> human: -${p.robotSiteHumanPenalty}% human share/pass`);
  }
  lines.push(`Robot stand-down: ${p.robotStandDown}% on human success`);
  lines.push(`Human stand-down: ${p.humanStandDown}% motivation drop`);
  return lines.length ? lines.join('<br>') : 'All optional mechanics off';
}

function formatHumanTimeline(events) {
  if (!events.length) return 'No off-world human colonies yet';
  return events.map((e, i) =>
    `#${i + 1}: year ${e.year.toLocaleString()} @ (${e.r},${e.c})`
  ).join('<br>');
}

function canvasCellRect(r, c) {
  const canvasRect = canvas.getBoundingClientRect();
  const cellW = canvasRect.width / sim.gridSize;
  const cellH = canvasRect.height / sim.gridSize;
  return new DOMRect(
    canvasRect.left + c * cellW,
    canvasRect.top + r * cellH,
    cellW,
    cellH,
  );
}

function showNodeDetails(r, c, anchor) {
  const details = sim.getNodeDetails(r, c);
  if (!details) return;

  nodeDialogTitle.textContent = `${details.label} . (${r}, ${c})`;

  const motivationStr = details.motivation != null ? pct(details.motivation) : '--';
  const blockedStr = details.launchBlocked
    ? `yes -- ${(details.launchBlockedReasons ?? []).join('; ') || 'see below'}`
    : 'no';
  const humanCanLaunchLabel = details.robotNetworkPriorityExplanation
    ? 'no'
    : details.humanCanLaunch ? 'yes' : 'no';
  const meta = [
    ['State', details.state],
    ['Colony type', details.colonyType ?? '--'],
    ['Motivation / capability', motivationStr],
    ['Launch probability (stored)', pct(details.launchProbability ?? 0)],
    ['Probes sent (direct)', String(details.probesSent ?? 0)],
    ...(details.colonyType === COLONY_TYPE.HUMAN
      ? [['Network robot probes', String(details.networkRobotProbesSent ?? 0)]]
      : []),
    ['Prior robot passes', String(details.priorRobotColonizations ?? 0)],
    ['Failed mission attempts', String(details.failedMissionAttempts ?? 0)],
    ['Human founded', details.humanFoundedYear ? details.humanFoundedYear.toLocaleString() : '--'],
    ['Robot founded', details.robotFoundedYear ? details.robotFoundedYear.toLocaleString() : '--'],
    ['Launch blocked', blockedStr],
    ...(details.robotNetworkPriorityExplanation
      ? [['Robot network priority (bounded)', details.robotNetworkPriorityExplanation]]
      : []),
    ['Can launch probes', details.colonyType === COLONY_TYPE.HUMAN
      ? `${humanCanLaunchLabel} -- ${details.canLaunchExplanation ?? '--'}`
      : details.colonyType === COLONY_TYPE.ROBOT
        ? `${details.launchBlocked ? 'no' : 'yes'} -- ${details.robotLaunchExplanation ?? '--'}`
        : '--'],
    ['Mission complete flag', details.hasNewHumanHomeworld
      ? `yes -- ${details.missionCompleteCause ?? 'unknown'}`
      : 'no'],
    ['Why mission complete (or not)', details.missionCompleteExplanation ?? '--'],
  ];

  const metaHtml = meta.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  const history = details.history ?? [];
  const historyHtml = history.length
    ? `<ol class="node-history">${history.map((ev) => `<li>${formatHistoryEvent(ev)}</li>`).join('')}</ol>`
    : '<p class="node-history">No events recorded yet for this cell.</p>';

  nodeDialogContent.innerHTML = `
    <dl class="node-meta">${metaHtml}</dl>
    <h4>History (${history.length} events)</h4>
    ${historyHtml}`;

  showDialogAtAnchor(nodeDialog, anchor ?? canvasCellRect(r, c));
}

function canvasCellFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
  const c = Math.floor((x / rect.width) * sim.gridSize);
  const r = Math.floor((y / rect.height) * sim.gridSize);
  if (r < 0 || c < 0 || r >= sim.gridSize || c >= sim.gridSize) return null;
  return { r, c };
}

function initSimulation(rawParams) {
  sim = new PercolationSimulation(rawParams);
  // Keep profiling checkbox sticky across resets/presets.
  if (chkProfiling?.checked) {
    sim.setProfilingEnabled(true);
    sim.resetProfiling?.();
  }
  resizeCanvas();
  render();
  updateReadout();
}

function formatProfilingHtml(profiling) {
  const fmtBuckets = (obj, n = 10) => Object.entries(obj ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `<div><strong>${k.replace(/^phase_/, '').replace(/^fn_/, '')}</strong>: ${v.toFixed(1)} ms</div>`)
    .join('');

  const counts = Object.entries(profiling.counts ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k, v]) => `<div><strong>${k}</strong>: ${Number(v).toLocaleString()}</div>`)
    .join('');

  return `
    <p><strong>Total tick time</strong>: ${(profiling.tickMs ?? 0).toFixed(1)} ms (accumulated)</p>
    <h4>Phases</h4>
    ${fmtBuckets(profiling.phases)}
    <h4>Functions</h4>
    ${fmtBuckets(profiling.fns)}
    <h4>Counters</h4>
    ${counts || '<div>--</div>'}
    <p style="color:var(--muted);margin-top:10px">
      Tip: hit <strong>Reset Profiling</strong>, then run <strong>Forward to Next Event</strong> for a few seconds.
    </p>
  `;
}

function showProfiling(anchor) {
  if (!sim?.getProfiling) return;
  const profiling = sim.getProfiling();
  helpDialogTitle.textContent = 'Profiling';
  helpDialogContent.innerHTML = formatProfilingHtml(profiling);
  showDialogAtAnchor(helpDialog, anchor ?? btnViewProfiling ?? chkProfiling ?? null);
}

function resizeCanvas() {
  const wrap = canvas.parentElement;
  const availW = wrap.clientWidth - 24;
  const availH = wrap.clientHeight - 24;
  const size = Math.min(availW, availH, sim.gridSize * 12);
  canvas.width = sim.gridSize;
  canvas.height = sim.gridSize;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
}

function getNodeColor(node) {
  if (node.state === STATE.MATURE) {
    if (node.isSol) return MATURE_COLORS.sol;
    if (node.colonyType === COLONY_TYPE.ROBOT) return MATURE_COLORS.robot;
    return MATURE_COLORS.human;
  }
  return STATE_COLORS[node.state] || STATE_COLORS[STATE.UNCOLONIZED];
}

function render() {
  const grid = sim.grid;
  const gridSize = sim.gridSize;
  const img = ctx.createImageData(gridSize, gridSize);
  const data = img.data;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const hex = getNodeColor(grid[r][c]);
      const n = parseInt(hex.slice(1), 16);
      const i = (r * gridSize + c) * 4;
      data[i] = (n >> 16) & 255;
      data[i + 1] = (n >> 8) & 255;
      data[i + 2] = n & 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

function updateReadout() {
  const stats = sim.getStats();
  const p = stats.params;
  const c = stats.counts;
  const profiling = sim.getProfiling?.() ?? { enabled: false };

  const profilingHtml = profiling.enabled
    ? (() => {
      const fmtBuckets = (obj, n = 6) => Object.entries(obj ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k, v]) => `${k.replace(/^phase_/, '').replace(/^fn_/, '')}: ${v.toFixed(1)}ms`)
        .join('<br>');

      return `
        <div class="stat wide">
          <div class="value xs">
            Total tick time: ${(profiling.tickMs ?? 0).toFixed(1)}ms<br>
            <span style="color:var(--muted)">Phases</span><br>
            ${fmtBuckets(profiling.phases)}<br>
            <span style="color:var(--muted)">Functions</span><br>
            ${fmtBuckets(profiling.fns)}
          </div>
          <div class="label">Profiling (hotspots)</div>
        </div>`;
    })()
    : '';

  readoutEl.innerHTML = `
    <div class="stat wide">
      <div class="value" id="readoutYear">${stats.currentYear.toLocaleString()}</div>
      <div class="label">Current Year${helpBtn('currentYear')}</div>
    </div>
    <div class="stat wide">
      <div class="value sm">${formatSolReadout(stats.sol, stats.currentYear)}</div>
      <div class="label">Sol Motivation (launch probability)${helpBtn('solMotivation')}</div>
    </div>
    <div class="stat">
      <div class="value">${c.humanMature}</div>
      <div class="label">Human Worlds${helpBtn('humanWorlds')}</div>
    </div>
    <div class="stat">
      <div class="value">${c.robotMature}</div>
      <div class="label">Robot Worlds${helpBtn('robotWorlds')}</div>
    </div>
    <div class="stat">
      <div class="value">${c.maturing}</div>
      <div class="label">Maturing Colonies${helpBtn('maturing')}</div>
    </div>
    <div class="stat">
      <div class="value">${c.inTransit}</div>
      <div class="label">Probes In Transit (now)${helpBtn('inTransit')}</div>
    </div>
    <div class="stat">
      <div class="value">${c.dormant}</div>
      <div class="label">Dormant Sites${helpBtn('dormant')}</div>
    </div>
    <div class="stat">
      <div class="value">${c.dead}</div>
      <div class="label">Dead Colonies${helpBtn('dead')}</div>
    </div>
    <div class="stat wide">
      <div class="value xs">${formatHumanTimeline(sim.humanColonyEvents)}</div>
      <div class="label">Human Colony Timeline (off-world)${helpBtn('humanTimeline')}</div>
    </div>
    <div class="stat wide">
      <div class="value sm">${formatProbesSent(stats)}</div>
      <div class="label">Total Probes Sent${helpBtn('totalProbes')}</div>
    </div>
    <div class="stat wide">
      <div class="value xs">${formatHumanProbs(stats.humanProbs)}</div>
      <div class="label">Human Worlds (motivation . probes sent)${helpBtn('humanProbs')}</div>
    </div>
    <div class="stat">
      <div class="value sm">${stats.avgRobotCapability ? pct(stats.avgRobotCapability) : '--'}</div>
      <div class="label">Avg Robot Capability${helpBtn('avgRobotCap')}</div>
    </div>
    <div class="stat">
      <div class="value sm">${stats.avgRobotCapability
        ? `${pct(stats.minRobotCapability)} - ${pct(stats.maxRobotCapability)}`
        : '--'}</div>
      <div class="label">Robot Capability Range${helpBtn('robotCapRange')}</div>
    </div>
    <div class="stat">
      <div class="value sm">${stats.robotFragments}</div>
      <div class="label">Active Robots${helpBtn('activeRobots')}</div>
    </div>
    <div class="stat">
      <div class="value sm">${stats.robotsAtLimit}</div>
      <div class="label">Robots at Launch Limit${helpBtn('robotsAtLimit')}</div>
    </div>
    <div class="stat wide">
      <div class="value xs">${formatOptionalStatus(p)}</div>
      <div class="label">Optional Mechanics${helpBtn('optionalMech')}</div>
    </div>
    <div class="stat wide">
      <div class="value xs">
        Transit survival: ${pct(p.transitSurvivalFrac)}<br>
        Colony survival: ${pct(p.colonySurvivalFrac)}<br>
        Maturation roll/tick: ${pct(p.perTickColonyFailRate)} fail<br>
        -> Human colony: ${pct(p.humanColonyFrac)} . Robot: ${pct(p.robotColonyFrac)}<br>
        End-to-end human: ${pct(p.endToEndHumanFrac, 2)} . robot: ${pct(p.endToEndRobotFrac, 2)}<br>
        Sol motivation: ${pct(p.solInitialLaunchProb / 100)} . Human start: ${pct(p.humanInitialLaunchProb / 100)}<br>
        Timeouts: ${stats.humanTimedOut} human . ${stats.robotTimedOut} robot
      </div>
      <div class="label">Model Probabilities${helpBtn('modelProbs')}</div>
    </div>
    ${profilingHtml}`;
  readoutYearEl = document.getElementById('readoutYear');
  const yearText = stats.currentYear.toLocaleString();
  if (runStatusYear) runStatusYear.textContent = yearText;
  if (runHeaderYear) runHeaderYear.textContent = `Year ${yearText}`;

  readoutEl.querySelectorAll('.help-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const label = btn.closest('.stat')?.querySelector('.label')?.textContent?.replace('?', '').trim();
      showHelp(btn.dataset.help, label, btn.closest('.stat') ?? btn);
    });
  });
}

controlsEl.addEventListener('input', (e) => {
  if (e.target.matches('input[type="number"]')) {
    updateStrictBoundedStatus();
  }
});

controlsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.help-btn');
  if (!btn || !btn.dataset.help) return;
  e.preventDefault();
  const def = PARAM_DEFS.find((d) => d.id === btn.dataset.help);
  showHelp(btn.dataset.help, def?.label ?? btn.dataset.help, btn.closest('label') ?? btn);
});

function setRunningUI(running) {
  isRunning = running;
  for (const el of [btnAdvance, btnAdvanceMobile]) {
    if (el) el.disabled = running;
  }
  for (const el of [btnNextEvent, btnNextEventMobile]) {
    if (el) el.disabled = running;
  }
  for (const el of [btnReset, btnResetMobile]) {
    if (el) el.disabled = running;
  }
  btnPreset.disabled = running;
  btnHartTipler.disabled = running;
  for (const el of [btnStop, btnStopMobile]) {
    if (el) el.disabled = !running;
  }
  if (runStatusBanner) runStatusBanner.hidden = !running;
  if (running) maybeEnterRunView();
}

function yieldToUI() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

async function runTicksProgressive(maxTicks, runId, stopWhen) {
  let run = 0;
  let lastYield = performance?.now ? performance.now() : Date.now();
  while (run < maxTicks && sim.currentYear < MAX_YEAR && runId === simulationRunId) {
    const batch = Math.min(TICKS_PER_FRAME, maxTicks - run);
    for (let i = 0; i < batch; i++) {
      if (runId !== simulationRunId) return run;
      sim.setRawParams(readRawParams());
      sim.tick();
      run++;
      if (stopWhen && stopWhen()) {
        updateReadout();
        render();
        return run;
      }

      // Keep UI responsive during heavy forward runs.
      const t = performance?.now ? performance.now() : Date.now();
      if (t - lastYield > 12) {
        lastYield = t;
        updateReadout();
        render();
        await yieldToUI();
        if (runId !== simulationRunId) return run;
      }
    }
    updateReadout();
    render();
    await yieldToUI();
  }
  return run;
}

function finishTimeStep() {
  setRunningUI(false);
  render();
  updateReadout();
}

function stopSimulation() {
  if (!isRunning) return;
  simulationRunId++;
  finishTimeStep();
}

async function advanceTime() {
  if (isRunning) return;
  setRunningUI(true);
  const runId = ++simulationRunId;
  const jumpYears = Math.max(1, Math.floor(parseFloat(timeJumpEl.value))) * TICK;
  const targetYear = Math.min(sim.currentYear + jumpYears, MAX_YEAR);
  const ticksNeeded = Math.ceil((targetYear - sim.currentYear) / TICK);
  await runTicksProgressive(ticksNeeded, runId);
  if (runId === simulationRunId) finishTimeStep();
}

async function forwardToNextEvent() {
  if (isRunning) return;
  setRunningUI(true);
  const runId = ++simulationRunId;
  const before = sim.snapshotGrid();
  const startYear = sim.currentYear;
  const yearLimit = Math.min(startYear + MAX_YEAR, MAX_YEAR);
  const maxTicks = Math.ceil((yearLimit - startYear) / TICK);
  let ticksRun = 0;

  while (sim.currentYear < yearLimit && ticksRun < maxTicks && runId === simulationRunId) {
    const nextEvent = sim.findNextEventYear(sim.currentYear);
    if (nextEvent === Infinity || nextEvent > yearLimit) break;

    const ticksToEvent = Math.floor((nextEvent - sim.currentYear) / TICK) + 1;
    const remaining = maxTicks - ticksRun;

    if (ticksToEvent > 1) {
      const silent = Math.min(ticksToEvent - 1, remaining);
      ticksRun += await runTicksProgressive(silent, runId);
      if (runId !== simulationRunId) return;
    }

    if (ticksRun >= maxTicks || sim.currentYear >= yearLimit) break;

    ticksRun += await runTicksProgressive(1, runId, () =>
      sim.snapshotGrid() !== before
    );
    if (runId !== simulationRunId) return;
    if (sim.snapshotGrid() !== before) break;
  }

  if (runId === simulationRunId) finishTimeStep();
}

function loadPreset(rawParams) {
  simulationRunId++;
  setRunningUI(false);
  applyParamsToInputs(rawParams);
  initSimulation(readRawParams());
}

function loadBoundedPreset() {
  loadPreset(BOUNDED_EXPANSION_PARAMS);
}

function loadHartTiplerPreset() {
  loadPreset(HART_TIPLER_PARAMS);
}

btnAdvance.addEventListener('click', advanceTime);
btnAdvanceMobile?.addEventListener('click', advanceTime);
btnNextEvent.addEventListener('click', forwardToNextEvent);
btnNextEventMobile?.addEventListener('click', forwardToNextEvent);
btnStop.addEventListener('click', stopSimulation);
btnStopMobile?.addEventListener('click', stopSimulation);
for (const el of document.querySelectorAll('.js-view-setup')) {
  el.addEventListener('click', () => setView('setup'));
}
for (const el of document.querySelectorAll('.js-view-run')) {
  el.addEventListener('click', () => setView('run'));
}
timeJumpEl?.addEventListener('input', updateAdvanceButtonLabels);
timeJumpEl?.addEventListener('change', updateAdvanceButtonLabels);
MQ_MOBILE.addEventListener('change', () => {
  if (!isMobileLayout() && appEl) {
    appEl.dataset.view = 'setup';
  } else if (isMobileLayout()) {
    setView(isRunning ? 'run' : 'setup');
  }
  requestAnimationFrame(() => {
    resizeCanvas();
    render();
  });
});
btnPreset.addEventListener('click', loadBoundedPreset);
btnHartTipler.addEventListener('click', loadHartTiplerPreset);
btnRules.addEventListener('click', () => showDialogAtAnchor(rulesDialog, btnRules));
btnCloseRules.addEventListener('click', () => rulesDialog.close());
rulesDialog.addEventListener('click', (e) => {
  if (e.target === rulesDialog) rulesDialog.close();
});
btnCloseHelp.addEventListener('click', () => helpDialog.close());
helpDialog.addEventListener('click', (e) => {
  if (e.target === helpDialog) helpDialog.close();
});
btnCloseNode.addEventListener('click', () => nodeDialog.close());
nodeDialog.addEventListener('click', (e) => {
  if (e.target === nodeDialog) nodeDialog.close();
});
canvas.addEventListener('click', (e) => {
  if (isRunning || !sim) return;
  const cell = canvasCellFromEvent(e);
  if (cell) showNodeDetails(cell.r, cell.c, canvasCellRect(cell.r, cell.c));
});
function resetSimulation() {
  simulationRunId++;
  setRunningUI(false);
  initSimulation(readRawParams());
}

btnReset.addEventListener('click', resetSimulation);
btnResetMobile?.addEventListener('click', resetSimulation);

chkProfiling?.addEventListener('change', () => {
  if (!sim) return;
  sim.setProfilingEnabled(!!chkProfiling.checked);
  sim.resetProfiling?.();
  updateReadout();
});

btnResetProfiling?.addEventListener('click', () => {
  if (!sim) return;
  sim.resetProfiling?.();
  updateReadout();
});

btnViewProfiling?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  showProfiling(btnViewProfiling);
});

window.addEventListener('resize', () => {
  resizeCanvas();
  render();
});

if (appEl && isMobileLayout()) {
  setView('setup');
}

updateAdvanceButtonLabels();
applyParamsToInputs(BOUNDED_EXPANSION_PARAMS);
initSimulation(readRawParams());
