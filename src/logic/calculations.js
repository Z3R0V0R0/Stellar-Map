// ─── calculations.js ──────────────────────────────────────────────────────────

// ── Constante principal ──────────────────────────────────────────────────────
export const PULL_COST = 160;

// ── Derivações de tempo ──────────────────────────────────────────────────────

export const calcEndgameCycles = (versionDays) => Math.max(1, Math.floor(versionDays / 14));
export const calcWeeks = (versionDays) => Math.floor(versionDays / 7);

export function calcMondaysInRange(startDateStr, endDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const end   = new Date(endDateStr   + "T00:00:00");

  if (isNaN(start) || isNaN(end) || end <= start) return 0;

  let count = 0;
  const cur = new Date(start);

  while (cur.getDay() !== 1) {
    cur.setDate(cur.getDate() + 1);
  }

  while (cur < end) {
    count++;
    cur.setDate(cur.getDate() + 7);
  }

  return count;
}

export function calcEndgameCyclesFromDates(startDateStr, endDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const end   = new Date(endDateStr   + "T00:00:00");

  if (isNaN(start) || isNaN(end) || end <= start) return 1;

  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 14));
}

export function calcDaysBetween(startDateStr, endDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const end   = new Date(endDateStr   + "T00:00:00");

  if (isNaN(start) || isNaN(end) || end <= start) return 0;

  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ── Hoyolab Check-in ─────────────────────────────────────────────────────────
export function calcHoyolabCheckins(startDateStr, endDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const end   = new Date(endDateStr   + "T00:00:00");

  if (isNaN(start) || isNaN(end) || end <= start) return 0;

  const CHECKIN_DAYS = [5, 13, 20];
  let count = 0;

  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= endMonth) {
    const year  = cur.getFullYear();
    const month = cur.getMonth();

    for (const day of CHECKIN_DAYS) {
      const candidate = new Date(year, month, day);
      if (candidate >= start && candidate < end) {
        count++;
      }
    }

    cur.setMonth(cur.getMonth() + 1);
  }

  return count;
}

// ── Cálculo principal de Jades ───────────────────────────────────────────────
export function calcTotalJades({
  versionDays,
  dailyJades,
  expressPass,
  expressQty,
  odyssey,

  // ⭐ Endgames
  mocStars,
  pfStars,
  apocStars,

  // 🌟 Modo Estelar
  starwardMode,

  // 💠 Passes e extras
  battlePass,
  bpMedal,
  convertFragments,
  initialJades,
  initialPasses,
  du,
  duNewCycle,
  duLevelCount,
  cwNewCycle,
  customEvents,
  anniversary,
  anniversaryJades,
  extraJades,
  trialCount,
  monthlyResets,
  bonusPulls,
  newCycleJades,
  levelUpJades,
  liveCode,
  maintenanceJades,
  versionEventJades,
  pastEventJades,
  hoyolabCheckinJades,

  // Calendário (opcionais — se ausentes, usa versionDays)
  startDate,
  endDate,
}) {
  const useCalendar = !!(startDate && endDate);

  const days  = useCalendar ? calcDaysBetween(startDate, endDate) : versionDays;
  const weeks = useCalendar ? calcMondaysInRange(startDate, endDate) : calcWeeks(versionDays);

  let total = 0;

  total += initialJades         ?? 0;
  total += (initialPasses ?? 0) * PULL_COST;

  // ── Base ──
  total += dailyJades * days;

  if (expressPass) total += 90 * 30 * (expressQty ?? 1);
  if (odyssey)     total += 10 * PULL_COST;

  // ── ⭐ Endgames ──
  total += calcMoCJades(mocStars   ?? 0);
  total += calcPFJades(pfStars     ?? 0);
  total += calcApocJades(apocStars ?? 0);

  // ── 🌟 Modo Estelar (+100 jades por endgame ativado, se tiver pelo menos 1 estrela) ──
  if (starwardMode?.moc  && (mocStars  ?? 0) > 0) total += 100;
  if (starwardMode?.pf   && (pfStars   ?? 0) > 0) total += 100;
  if (starwardMode?.apoc && (apocStars ?? 0) > 0) total += 100;

  // ── 💠 Passes e conversão ──
  if (battlePass)       total += 680 + (5 * PULL_COST);
  if (bpMedal)          total += 200;
  if (convertFragments) total += convertFragments;

  // ── Universo Divergente ──
  if (du)         total += 225 * weeks;
  if (duNewCycle) total += 3500;
  total += (duLevelCount ?? 0) * 120;
  if (cwNewCycle) total += 520;

  // ── Eventos ──
  (customEvents ?? []).forEach(ev => { total += ev.jades; });
  total += (versionEventJades  ?? 0);
  total += (pastEventJades     ?? 0);

  // ── Aniversário ──
  if (anniversary) total += (anniversaryJades ?? 0);

  // ── Extras ──
  total += extraJades      ?? 0;
  total += (trialCount     ?? 0) * 20;
  total += (monthlyResets  ?? 0) * 5 * PULL_COST;
  total += (bonusPulls     ?? 0) * PULL_COST;
  total += newCycleJades   ?? 0;
  total += levelUpJades    ?? 0;

  // ── Atualização de Conteúdo ──
  if (liveCode)         total += 300;
  if (maintenanceJades) total += 600;

  // ── Hoyolab Check-in ──
  total += (hoyolabCheckinJades ?? 0);

  return Math.floor(total);
}

// ── Conversão ────────────────────────────────────────────────────────────────
export const jadesToPulls = (jades) => Math.floor(jades / PULL_COST);
export const pullsToJades = (pulls) => pulls * PULL_COST;

// ── Meta ─────────────────────────────────────────────────────────────────────
export function calcGoalProgress(totalPulls, goalPulls) {
  const hasGoal     = goalPulls > 0;
  const goalMet     = hasGoal && totalPulls >= goalPulls;
  const pullsNeeded = hasGoal ? Math.max(0, goalPulls - totalPulls) : 0;
  const jadesNeeded = pullsNeeded * PULL_COST;
  const progressPct = hasGoal ? Math.min(100, (totalPulls / goalPulls) * 100) : 0;
  const surplus     = totalPulls - goalPulls;

  return { hasGoal, goalMet, pullsNeeded, jadesNeeded, progressPct, surplus };
}

// ── Subtotais ────────────────────────────────────────────────────────────────
export const subtotalDaily   = (dailyJades, versionDays) => dailyJades * versionDays;
export const subtotalExpress = (expressQty) => 90 * 30 * expressQty;

export const subtotalEndgamesStars = ({ mocStars, pfStars, apocStars }) =>
  calcMoCJades(mocStars) + calcPFJades(pfStars) + calcApocJades(apocStars);

// ── Cálculo individual ───────────────────────────────────────────────────────

export function calcMoCJades(stars) {
  if (stars < 0) return 0;
  const stages = Math.floor(stars / 3);
  let jades = 0;
  for (let i = 1; i <= stages; i++) {
    jades += i <= 8 ? 60 : 80;
  }
  return jades;
}

export function calcPFJades(stars) {
  if (stars <= 0) return 0;
  let jades = 0;
  for (let i = 1; i <= stars; i++) {  
    jades += i <= 8 ? 60 : 80;
  }
  return jades;
}

export const calcApocJades = calcPFJades;