/**
 * RDM (Random Dot Motion) — тест направления согласованного движения.
 * Разделение: конфиг, поле точек, план испытаний, контроллер, результаты, UI.
 */

// ——————————————————————————————————————————————————————————————
// Конфиг (легко менять значения по умолчанию)
// ——————————————————————————————————————————————————————————————

const DEFAULT_CONFIG = {
  numPoints: 150,
  areaWidth: 600,
  areaHeight: 400,
  /** Скорость в пикселях в секунду (плавная анимация через delta time) */
  dotSpeed: 120,
  dotSize: 2,
  trialDurationMs: 2000,
  fixationMs: 500,
  /** Список уровней coherence в процентах */
  coherenceLevels: [50, 30, 20, 10],
  repsPerLevel: 5,
  practiceTrials: 5,
  /** Пауза после ответа: показ «верно / неверно» */
  feedbackMs: 450,
};

// ——————————————————————————————————————————————————————————————
// Утилиты
// ——————————————————————————————————————————————————————————————

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wrap(value, max) {
  let v = value;
  while (v < 0) v += max;
  while (v >= max) v -= max;
  return v;
}

function parseCoherenceLevels(text) {
  const t = window.RDM_I18N.t;
  return text
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const n = Number(s);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        throw new Error(t('err.badCoherence', { s }));
      }
      return n;
    });
}

// ——————————————————————————————————————————————————————————————
// Поле точек (генерация + отрисовка + движение)
// ——————————————————————————————————————————————————————————————

/**
 * direction: -1 = согласованное движение влево, +1 = вправо
 */
class DotField {
  /**
   * @param {object} opts
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {number} opts.numPoints
   * @param {number} opts.coherencePercent 0–100
   * @param {number} opts.direction -1 | 1
   * @param {number} opts.dotSize
   * @param {number} opts.speedPxPerSec
   */
  constructor(opts) {
    this.width = opts.width;
    this.height = opts.height;
    this.numPoints = opts.numPoints;
    this.coherencePercent = opts.coherencePercent;
    this.direction = opts.direction;
    this.dotSize = opts.dotSize;
    this.speedPxPerSec = opts.speedPxPerSec;
    /** @type {{ x: number, y: number, coherent: boolean }[]} */
    this.points = [];
    this._initPoints();
  }

  _initPoints() {
    const n = this.numPoints;
    const coherentCount = Math.round((n * this.coherencePercent) / 100);
    const flags = Array(n).fill(false);
    for (let i = 0; i < coherentCount; i += 1) flags[i] = true;
    shuffle(flags);

    this.points = [];
    for (let i = 0; i < n; i += 1) {
      this.points.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        coherent: flags[i],
      });
    }
  }

  /**
   * @param {number} dtSec секунды с предыдущего кадра
   */
  update(dtSec) {
    const spd = this.speedPxPerSec;
    const dir = this.direction;

    for (const p of this.points) {
      if (p.coherent) {
        p.x += dir * spd * dtSec;
        p.y += (Math.random() - 0.5) * 0.15 * spd * dtSec;
      } else {
        const ang = Math.random() * Math.PI * 2;
        p.x += Math.cos(ang) * spd * dtSec;
        p.y += Math.sin(ang) * spd * dtSec;
      }
      p.x = wrap(p.x, this.width);
      p.y = wrap(p.y, this.height);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const w = this.width;
    const h = this.height;
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e8eaef';
    const r = this.dotSize;
    for (const p of this.points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFixationCross(ctx) {
    const w = this.width;
    const h = this.height;
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.min(w, h) * 0.04;
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - len, cy);
    ctx.lineTo(cx + len, cy);
    ctx.moveTo(cx, cy - len);
    ctx.lineTo(cx, cy + len);
    ctx.stroke();
  }
}

// ——————————————————————————————————————————————————————————————
// План испытаний и запись результата
// ——————————————————————————————————————————————————————————————

/**
 * Описание одного trial для очереди
 * @typedef {{ coherence: number, direction: -1 | 1, practice: boolean }} TrialPlan
 */

function buildMainTrialList(config) {
  const list = [];
  const levels = config.coherenceLevels;
  for (const c of levels) {
    for (let r = 0; r < config.repsPerLevel; r += 1) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      list.push({ coherence: c, direction, practice: false });
    }
  }
  return shuffle(list);
}

function buildPracticeTrials(config, count) {
  const levels = config.coherenceLevels;
  if (levels.length === 0 || count <= 0) return [];
  const list = [];
  for (let i = 0; i < count; i += 1) {
    const coherence = levels[Math.floor(Math.random() * levels.length)];
    const direction = Math.random() < 0.5 ? -1 : 1;
    list.push({ coherence, direction, practice: true });
  }
  return list;
}

/**
 * Одна строка результата
 */
class TrialResult {
  constructor({
    trialIndex,
    coherence,
    trueDirection,
    userResponse,
    outcome,
    reactionTimeMs,
    practice,
  }) {
    this.trialIndex = trialIndex;
    this.coherence = coherence;
    this.trueDirection = trueDirection;
    this.userResponse = userResponse;
    this.outcome = outcome;
    this.reactionTimeMs = reactionTimeMs;
    this.practice = practice;
  }
}

// ——————————————————————————————————————————————————————————————
// Контроллер эксперимента (fixation → stimulus → feedback)
// ——————————————————————————————————————————————————————————————

class ExperimentController {
  /**
   * @param {object} deps
   * @param {HTMLCanvasElement} deps.canvas
   * @param {object} deps.config
   * @param {function(string): void} deps.onPhaseMessage
   * @param {function(TrialResult): void} deps.onTrialComplete
   * @param {function(): void} deps.onSessionComplete
   */
  constructor(deps) {
    this.canvas = deps.canvas;
    this.ctx = deps.canvas.getContext('2d');
    this.config = deps.config;
    this.onPhaseMessage = deps.onPhaseMessage;
    this.onTrialComplete = deps.onTrialComplete;
    this.onSessionComplete = deps.onSessionComplete;

    /** @type {TrialPlan[]} */
    this.queue = [];
    this.currentIndex = 0;
    /** @type {DotField | null} */
    this.field = null;

    this.phase = 'idle';
    this._rafId = 0;
    this._trialStartPerf = 0;
    this._stimulusDeadline = 0;
    this._fixationEnd = 0;
    this._feedbackEnd = 0;
    this._responseRecorded = false;
    this._lastFrameTime = 0;
    /** Сквозной номер основного trial (без практики), для таблицы и CSV */
    this._mainTrialCounter = 0;

    this._boundKey = (e) => this._onKeyDown(e);
  }

  startSession(practiceTrials, mainTrials) {
    const c = this.config;
    const practice = buildPracticeTrials(c, practiceTrials);
    const main = mainTrials;
    this.queue = [...practice, ...main];
    this.currentIndex = 0;
    this._mainTrialCounter = 0;
    window.addEventListener('keydown', this._boundKey);
    this._beginTrial();
  }

  abort() {
    this._stopRaf();
    window.removeEventListener('keydown', this._boundKey);
    this.phase = 'idle';
    this.queue = [];
  }

  _beginTrial() {
    if (this.currentIndex >= this.queue.length) {
      window.removeEventListener('keydown', this._boundKey);
      this.onSessionComplete();
      return;
    }

    const plan = this.queue[this.currentIndex];
    const c = this.config;
    this.canvas.width = c.areaWidth;
    this.canvas.height = c.areaHeight;

    this.field = new DotField({
      width: c.areaWidth,
      height: c.areaHeight,
      numPoints: c.numPoints,
      coherencePercent: plan.coherence,
      direction: plan.direction,
      dotSize: c.dotSize,
      speedPxPerSec: c.dotSpeed,
    });

    this._responseRecorded = false;
    this.phase = 'fixation';
    this.onPhaseMessage(this._progressLabel(plan));

    const now = performance.now();
    this._fixationEnd = now + c.fixationMs;
    this._lastFrameTime = now;

    this.field.drawFixationCross(this.ctx);
    this._scheduleFrame();
  }

  _progressLabel(plan) {
    const t = window.RDM_I18N.t;
    const total = this.queue.length;
    const i = this.currentIndex + 1;
    const mode = plan.practice ? t('exp.practice') : t('exp.test');
    return t('exp.progress', { mode, trial: t('exp.trial'), i, total });
  }

  _scheduleFrame() {
    this._stopRaf();
    this._rafId = requestAnimationFrame((t) => this._frame(t));
  }

  _stopRaf() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
  }

  _frame(now) {
    const c = this.config;
    const plan = this.queue[this.currentIndex];

    if (this.phase === 'fixation') {
      if (now < this._fixationEnd) {
        if (this.field) this.field.drawFixationCross(this.ctx);
        this._scheduleFrame();
        return;
      }
      this.phase = 'stimulus';
      this._trialStartPerf = now;
      this._stimulusDeadline = now + c.trialDurationMs;
      this._lastFrameTime = now;
      this.onPhaseMessage(`${this._progressLabel(plan)} · ${window.RDM_I18N.t('exp.judgeDir')}`);
    }

    if (this.phase === 'stimulus') {
      const dtSec = Math.min(0.05, (now - this._lastFrameTime) / 1000);
      this._lastFrameTime = now;

      if (!this._responseRecorded && now >= this._stimulusDeadline) {
        this._finishTrial(null, 'missed');
        return;
      }

      if (this.field) {
        this.field.update(dtSec);
        this.field.draw(this.ctx);
      }

      if (!this._responseRecorded) {
        this._scheduleFrame();
      }
      return;
    }

    if (this.phase === 'feedback') {
      if (now >= this._feedbackEnd) {
        this.currentIndex += 1;
        this._beginTrial();
        return;
      }
      this._scheduleFrame();
    }
  }

  _onKeyDown(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const response = e.key === 'ArrowLeft' ? -1 : 1;
    this.submitResponse(response);
  }

  /**
   * Ответ пользователя из любого источника ввода (клавиатура/кнопки).
   * @param {-1 | 1} response
   */
  submitResponse(response) {
    if (this.phase !== 'stimulus' || this._responseRecorded) return;
    this._responseRecorded = true;
    this._stopRaf();

    const rt = Math.round(performance.now() - this._trialStartPerf);
    const plan = this.queue[this.currentIndex];
    const correct = response === plan.direction;
    this._finishTrial(response, correct ? 'correct' : 'incorrect', rt);
  }

  /**
   * @param {-1 | 1 | null} userResponse
   * @param {'correct' | 'incorrect' | 'missed'} outcome
   * @param {number} [rtMs]
   */
  _finishTrial(userResponse, outcome, rtMs) {
    const plan = this.queue[this.currentIndex];
    const c = this.config;

    let trialIndex = 0;
    if (!plan.practice) {
      this._mainTrialCounter += 1;
      trialIndex = this._mainTrialCounter;
    }

    const result = new TrialResult({
      trialIndex,
      coherence: plan.coherence,
      trueDirection: plan.direction,
      userResponse,
      outcome,
      reactionTimeMs: outcome === 'missed' ? null : rtMs,
      practice: plan.practice,
    });

    this.onTrialComplete(result);

    const t = window.RDM_I18N.t;
    let msg = '';
    if (plan.practice) {
      if (outcome === 'missed') msg = t('fb.missedPractice');
      else if (outcome === 'correct') msg = t('fb.correct', { ms: rtMs });
      else msg = t('fb.incorrect', { ms: rtMs });
    } else {
      if (outcome === 'missed') msg = t('fb.missed');
      else if (outcome === 'correct') msg = t('fb.correct', { ms: rtMs });
      else msg = t('fb.incorrect', { ms: rtMs });
    }

    this.phase = 'feedback';
    this.onPhaseMessage(`${this._progressLabel(plan)} · ${msg}`);

    if (this.field) {
      this.ctx.fillStyle = 'rgba(15, 17, 21, 0.88)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = outcome === 'correct' ? '#86efac' : outcome === 'missed' ? '#9ca3af' : '#fca5a5';
      this.ctx.font = '600 18px "Segoe UI", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(msg, this.canvas.width / 2, this.canvas.height / 2);
    }

    this._feedbackEnd = performance.now() + c.feedbackMs;
    this._lastFrameTime = performance.now();
    this._scheduleFrame();
  }
}

// ——————————————————————————————————————————————————————————————
// Агрегация и CSV
// ——————————————————————————————————————————————————————————————

/** Критерий порога: минимальный coherence с точностью не ниже этого значения (%) */
const THRESHOLD_ACCURACY_PERCENT = 75;

/** Расширенная сводка по сессии (основной блок без практики). */
function summarize(results) {
  const main = results.filter((r) => !r.practice);
  const total = main.length;
  const correctN = main.filter((r) => r.outcome === 'correct').length;
  const accuracy = total ? Math.round((correctN / total) * 1000) / 10 : 0;

  const correctRT = main.filter((r) => r.outcome === 'correct' && r.reactionTimeMs != null);
  const meanRT =
    correctRT.length > 0
      ? Math.round(correctRT.reduce((s, r) => s + r.reactionTimeMs, 0) / correctRT.length)
      : null;

  const byCoh = new Map();
  for (const r of main) {
    if (!byCoh.has(r.coherence)) {
      byCoh.set(r.coherence, { n: 0, ok: 0, rts: [] });
    }
    const b = byCoh.get(r.coherence);
    b.n += 1;
    if (r.outcome === 'correct') {
      b.ok += 1;
      if (r.reactionTimeMs != null) b.rts.push(r.reactionTimeMs);
    }
  }

  const rowsByCoherence = [...byCoh.entries()]
    .map(([coh, { n, ok, rts }]) => {
      const acc = n ? Math.round((ok / n) * 1000) / 10 : 0;
      const meanRtCoh =
        rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
      return { coherence: coh, n, accuracy: acc, meanRT: meanRtCoh };
    })
    .sort((a, b) => a.coherence - b.coherence);

  const accuracyByCoherence = rowsByCoherence.map((r) => ({
    coherence: r.coherence,
    accuracy: r.accuracy,
    n: r.n,
  }));

  let thresholdCoherence = null;
  for (const row of rowsByCoherence) {
    if (row.accuracy >= THRESHOLD_ACCURACY_PERCENT) {
      thresholdCoherence = row.coherence;
      break;
    }
  }

  let bestCoherence = null;
  let bestAccuracy = null;
  for (const row of rowsByCoherence) {
    if (bestAccuracy == null || row.accuracy > bestAccuracy) {
      bestAccuracy = row.accuracy;
      bestCoherence = row.coherence;
    } else if (row.accuracy === bestAccuracy && bestCoherence != null && row.coherence > bestCoherence) {
      bestCoherence = row.coherence;
    }
  }

  return {
    total,
    accuracy,
    meanRT,
    accuracyByCoherence,
    rowsByCoherence,
    thresholdCoherence,
    thresholdReached: thresholdCoherence != null,
    bestCoherence,
    bestAccuracy,
  };
}

function accTierClass(acc) {
  if (acc >= 75) return 'acc-high';
  if (acc >= 50) return 'acc-mid';
  return 'acc-low';
}

function pointColorForAccuracy(acc) {
  if (acc >= 75) return 'rgba(22, 163, 74, 0.95)';
  if (acc >= 50) return 'rgba(202, 138, 4, 0.95)';
  return 'rgba(220, 38, 38, 0.95)';
}

/**
 * 2–3 короткие строки вывода для пользователя без подготовки в статистике.
 */
function buildInterpretationLines(summary) {
  const t = window.RDM_I18N.t;
  const rows = summary.rowsByCoherence;
  const lines = [];
  if (rows.length === 0) {
    return [t('interp.noData')];
  }

  const thr = summary.thresholdCoherence;
  if (thr != null) {
    lines.push(
      t('interp.thresholdOk', { pct: THRESHOLD_ACCURACY_PERCENT, thr })
    );
  } else {
    lines.push(t('interp.thresholdFail', { pct: THRESHOLD_ACCURACY_PERCENT }));
  }

  const confident = rows.filter((r) => r.accuracy >= 80);
  if (confident.length) {
    const minC = Math.min(...confident.map((r) => r.coherence));
    lines.push(t('interp.confident', { min: minC }));
  } else if (rows.some((r) => r.accuracy >= 65)) {
    const minC = Math.min(...rows.filter((r) => r.accuracy >= 65).map((r) => r.coherence));
    lines.push(t('interp.stable', { min: minC }));
  }

  const sortedAsc = [...rows].sort((a, b) => a.coherence - b.coherence);
  for (let i = 0; i < sortedAsc.length - 1; i += 1) {
    const a = sortedAsc[i];
    const b = sortedAsc[i + 1];
    if (a.accuracy - b.accuracy >= 25 && b.accuracy < 55) {
      lines.push(t('interp.drop', { a: a.coherence, b: b.coherence }));
      break;
    }
  }

  return lines.slice(0, 3);
}

function renderInterpretationBlock(summary) {
  const el = document.getElementById('results-interpret');
  const lines = buildInterpretationLines(summary);
  el.innerHTML = lines.map((t) => `<p>${escapeHtml(t)}</p>`).join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderThresholdLine(summary) {
  const t = window.RDM_I18N.t;
  const el = document.getElementById('threshold-line');
  if (summary.rowsByCoherence.length === 0) {
    el.textContent = t('threshold.none');
    return;
  }
  if (summary.thresholdReached) {
    el.textContent = t('threshold.ok', {
      thr: summary.thresholdCoherence,
      pct: THRESHOLD_ACCURACY_PERCENT,
    });
  } else {
    el.textContent = t('threshold.fail', { pct: THRESHOLD_ACCURACY_PERCENT });
  }
}

function renderMetricCards(summary) {
  const t = window.RDM_I18N.t;
  const wrap = document.getElementById('metric-cards');
  const acc = summary.accuracy;
  const accClass = accTierClass(acc);
  const meanStr =
    summary.meanRT != null ? `${summary.meanRT} ${t('unit.ms')}` : t('metric.dash');
  const best =
    summary.bestCoherence != null && summary.bestAccuracy != null
      ? `${summary.bestCoherence}% (${summary.bestAccuracy}%)`
      : t('metric.dash');
  const thrStr = summary.thresholdReached
    ? `~${summary.thresholdCoherence}%`
    : t('metric.thrNA');

  wrap.innerHTML = `
    <div class="metric-card">
      <p class="metric-card__label">${t('metric.acc')}</p>
      <p class="metric-card__value ${accClass}">${acc}%</p>
    </div>
    <div class="metric-card">
      <p class="metric-card__label">${t('metric.rt')}</p>
      <p class="metric-card__value neutral">${meanStr}</p>
      <p class="metric-card__sub">${t('metric.rtSub')}</p>
    </div>
    <div class="metric-card">
      <p class="metric-card__label">${t('metric.best')}</p>
      <p class="metric-card__value neutral metric-card__value--compact">${best}</p>
      <p class="metric-card__sub">${t('metric.bestSub')}</p>
    </div>
    <div class="metric-card">
      <p class="metric-card__label">${t('metric.thr')}</p>
      <p class="metric-card__value neutral metric-card__value--compact">${thrStr}</p>
      <p class="metric-card__sub">${t('metric.thrSub', { pct: THRESHOLD_ACCURACY_PERCENT })}</p>
    </div>
  `;
}

function renderExplainBlock() {
  const t = window.RDM_I18N.t;
  const el = document.getElementById('explain-block');
  el.innerHTML = `
    <h3 class="block-heading">${escapeHtml(t('explain.title'))}</h3>
    <div class="explain-text">
      <p>${t('explain.p1')}</p>
      <p>${t('explain.p2')}</p>
      <p>${t('explain.p3')}</p>
    </div>
  `;
}

function renderAccuracyChart(rows) {
  const canvas = document.getElementById('chart-accuracy');
  const errEl = document.getElementById('chart-error');
  if (errEl) {
    errEl.classList.add('hidden');
    errEl.textContent = '';
  }

  const t = window.RDM_I18N.t;
  if (typeof Chart === 'undefined') {
    if (errEl) {
      errEl.textContent = t('chart.error');
      errEl.classList.remove('hidden');
    }
    return;
  }

  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  if (rows.length === 0) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return;
  }

  const labels = rows.map((r) => `${r.coherence}%`);
  const data = rows.map((r) => r.accuracy);
  const pointColors = rows.map((r) => pointColorForAccuracy(r.accuracy));
  const thresholdLine = labels.map(() => THRESHOLD_ACCURACY_PERCENT);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('chart.dsAccuracy'),
          data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.25,
          borderWidth: 2,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: t('chart.dsCriterion', { pct: THRESHOLD_ACCURACY_PERCENT }),
          data: thresholdLine,
          borderColor: 'rgba(100, 116, 139, 0.75)',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          title: { display: true, text: t('chart.xTitle') },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: t('chart.yTitle') },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          filter: (item) => item.datasetIndex === 0,
          callbacks: {
            label(ctx) {
              const r = rows[ctx.dataIndex];
              return ` ${t('chart.tooltip', { acc: r.accuracy, n: r.n })}`;
            },
          },
        },
      },
    },
  });
}

function renderCoherenceTable(rows) {
  const t = window.RDM_I18N.t;
  const body = document.getElementById('coh-table-body');
  body.innerHTML = '';
  for (const r of rows) {
    const tr = document.createElement('tr');
    const tier = accTierClass(r.accuracy);
    const rtStr = r.meanRT != null ? `${r.meanRT} ${t('unit.ms')}` : t('metric.dash');
    tr.innerHTML = `
      <td>${r.coherence}%</td>
      <td>${r.n}</td>
      <td class="cell-acc ${tier}">${r.accuracy}%</td>
      <td>${rtStr}</td>
    `;
    body.appendChild(tr);
  }
}

function renderTrialResultsTable(results) {
  const t = window.RDM_I18N.t;
  const body = document.getElementById('results-body');
  const main = results.filter((r) => !r.practice);
  body.innerHTML = '';
  for (const r of main) {
    const tr = document.createElement('tr');
    const dir = (d) => (d === -1 ? t('dir.left') : t('dir.right'));
    const resp = r.userResponse == null ? t('metric.dash') : dir(r.userResponse);
    let outcomeClass = 'tag-miss';
    let outcomeText = t('out.missed');
    if (r.outcome === 'correct') {
      outcomeClass = 'tag-ok';
      outcomeText = t('out.correct');
    } else if (r.outcome === 'incorrect') {
      outcomeClass = 'tag-bad';
      outcomeText = t('out.incorrect');
    }
    tr.innerHTML = `
      <td>${r.trialIndex}</td>
      <td>${r.coherence}</td>
      <td>${dir(r.trueDirection)}</td>
      <td>${resp}</td>
      <td class="${outcomeClass}">${outcomeText}</td>
      <td>${r.reactionTimeMs == null ? t('metric.dash') : r.reactionTimeMs}</td>
    `;
    body.appendChild(tr);
  }
}

function pluralRu(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 > 10 && mod100 < 20) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/**
 * Полный экран результатов: интерпретация, порог, карточки, график, таблицы.
 */
function formatTrialMetaLine(n) {
  const { t, getLang } = window.RDM_I18N;
  if (!n) return '';
  if (getLang() === 'en') {
    return `${t('results.metaPrefix')} ${n} ${n === 1 ? 'trial' : 'trials'}`;
  }
  return `${t('results.metaPrefix')} ${n} ${pluralRu(n, 'испытание', 'испытания', 'испытаний')}`;
}

function renderResultsScreen(results) {
  const sum = summarize(results);
  const meta = document.getElementById('results-meta');
  if (meta) {
    meta.textContent = sum.total ? formatTrialMetaLine(sum.total) : '';
  }
  renderInterpretationBlock(sum);
  renderThresholdLine(sum);
  renderMetricCards(sum);
  renderExplainBlock();
  renderCoherenceTable(sum.rowsByCoherence);

  requestAnimationFrame(() => {
    renderAccuracyChart(sum.rowsByCoherence);
  });

  renderTrialResultsTable(results);
}

function resultsToCSV(results) {
  const main = results.filter((r) => !r.practice);
  const headers = [
    'trial',
    'coherence',
    'true_direction',
    'user_response',
    'outcome',
    'reaction_time_ms',
  ];
  const rows = main.map((r) => [
    r.trialIndex,
    r.coherence,
    r.trueDirection === -1 ? 'left' : 'right',
    r.userResponse == null ? '' : r.userResponse === -1 ? 'left' : 'right',
    r.outcome,
    r.reactionTimeMs == null ? '' : String(r.reactionTimeMs),
  ]);
  const esc = (cell) => {
    const s = String(cell);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = [headers, ...rows].map((line) => line.map(esc).join(',')).join('\r\n');
  return `\uFEFF${body}`;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Короткий сигнал о начале теста (Web Audio API, без внешних файлов).
 * Вызывается из обработчика клика — контекст обычно не заблокирован.
 */
function playTestStartSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const run = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ctx.currentTime);
      const t0 = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.11, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      o.start(t0);
      o.stop(t0 + 0.3);
    };
    if (ctx.state === 'suspended') {
      void ctx.resume().then(run);
    } else {
      run();
    }
  } catch (_) {
    /* звук недоступен */
  }
}

// ——————————————————————————————————————————————————————————————
// UI: чтение конфига, экраны, запуск
// ——————————————————————————————————————————————————————————————

function readConfigFromForm() {
  const g = (id) => document.getElementById(id);
  const numPoints = Number(g('cfg-numPoints').value);
  const areaWidth = Number(g('cfg-areaWidth').value);
  const areaHeight = Number(g('cfg-areaHeight').value);
  const dotSpeed = Number(g('cfg-dotSpeed').value);
  const dotSize = Number(g('cfg-dotSize').value);
  const trialDurationMs = Number(g('cfg-trialDurationMs').value);
  const fixationMs = Number(g('cfg-fixationMs').value);
  const repsPerLevel = Number(g('cfg-repsPerLevel').value);
  const practiceTrials = Number(g('cfg-practiceTrials').value);
  const coherenceLevels = parseCoherenceLevels(g('cfg-coherenceLevels').value);

  const tr = window.RDM_I18N.t;
  if ([numPoints, areaWidth, areaHeight, dotSpeed, trialDurationMs, fixationMs, repsPerLevel].some(
    (v) => Number.isNaN(v) || v <= 0
  )) {
    throw new Error(tr('err.params'));
  }
  if (coherenceLevels.length === 0) {
    throw new Error(tr('err.coherenceList'));
  }

  return {
    ...DEFAULT_CONFIG,
    numPoints,
    areaWidth,
    areaHeight,
    dotSpeed,
    dotSize,
    trialDurationMs,
    fixationMs,
    repsPerLevel,
    practiceTrials,
    coherenceLevels,
  };
}

function fillFormDefaults() {
  const c = DEFAULT_CONFIG;
  const g = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };
  g('cfg-numPoints', c.numPoints);
  g('cfg-areaWidth', c.areaWidth);
  g('cfg-areaHeight', c.areaHeight);
  g('cfg-dotSpeed', c.dotSpeed);
  g('cfg-dotSize', c.dotSize);
  g('cfg-trialDurationMs', c.trialDurationMs);
  g('cfg-fixationMs', c.fixationMs);
  g('cfg-repsPerLevel', c.repsPerLevel);
  g('cfg-practiceTrials', c.practiceTrials);
  g('cfg-coherenceLevels', c.coherenceLevels.join(', '));
}

/**
 * Панели стартового экрана: «Главная» (инструкция) или «Параметры» (настройки).
 * @param {'home' | 'params'} panel
 */
function setStartPanel(panel) {
  const home = document.getElementById('start-panel-home');
  const params = document.getElementById('start-panel-params');
  const btnMain = document.getElementById('nav-main');
  const btnParams = document.getElementById('nav-params');
  if (!home || !params) return;
  const isHome = panel === 'home';
  home.classList.toggle('hidden', !isHome);
  params.classList.toggle('hidden', isHome);
  if (btnMain) {
    btnMain.classList.toggle('nav-btn--active', isHome);
    if (isHome) btnMain.setAttribute('aria-current', 'page');
    else btnMain.removeAttribute('aria-current');
  }
  if (btnParams) {
    btnParams.classList.toggle('nav-btn--active', !isHome);
    if (!isHome) btnParams.setAttribute('aria-current', 'page');
    else btnParams.removeAttribute('aria-current');
  }
}

function showScreen(name) {
  document.getElementById('screen-start').classList.toggle('hidden', name !== 'start');
  document.getElementById('screen-run').classList.toggle('hidden', name !== 'run');
  const res = document.getElementById('screen-results');
  res.classList.toggle('hidden', name !== 'results');
  document.body.classList.toggle('results-open', name === 'results');

  const nav = document.getElementById('app-nav');
  if (nav) nav.classList.toggle('hidden', name !== 'start');
  if (name === 'start') {
    setStartPanel('home');
  }

  if (name !== 'results') {
    res.classList.remove('results-screen--visible');
    const chartCanvas = document.getElementById('chart-accuracy');
    if (chartCanvas && typeof Chart !== 'undefined') {
      const ch = Chart.getChart(chartCanvas);
      if (ch) ch.destroy();
    }
  } else {
    requestAnimationFrame(() => {
      res.classList.add('results-screen--visible');
    });
  }
}

/** @type {TrialResult[]} */
let lastResults = [];
let lastConfig = { ...DEFAULT_CONFIG };

function init() {
  window.RDM_I18N.applyDom(document);
  window.RDM_I18N.updateLangButton();

  fillFormDefaults();
  setStartPanel('home');

  const canvas = document.getElementById('rdm-canvas');
  const runProgress = document.getElementById('run-progress');
  const runLabel = document.getElementById('run-label');
  const btnAnswerLeft = document.getElementById('btn-answer-left');
  const btnAnswerRight = document.getElementById('btn-answer-right');

  let controller = null;

  document.getElementById('nav-main').addEventListener('click', () => setStartPanel('home'));
  document.getElementById('nav-params').addEventListener('click', () => setStartPanel('params'));

  document.getElementById('btn-lang').addEventListener('click', () => {
    const I = window.RDM_I18N;
    I.setLang(I.getLang() === 'ru' ? 'en' : 'ru');
    I.applyDom(document);
    I.updateLangButton();
    const res = document.getElementById('screen-results');
    if (res && !res.classList.contains('hidden') && lastResults.length) {
      renderResultsScreen(lastResults);
    }
  });

  document.getElementById('btn-start').addEventListener('click', () => {
    let config;
    try {
      config = readConfigFromForm();
    } catch (err) {
      alert(`${window.RDM_I18N.t('alert.config')}\n${err.message || String(err)}`);
      return;
    }

    lastConfig = config;
    const mainList = buildMainTrialList(config);
    lastResults = [];

    showScreen('run');
    runLabel.textContent = window.RDM_I18N.t('run.label');
    playTestStartSound();

    controller = new ExperimentController({
      canvas,
      config,
      onPhaseMessage: (text) => {
        runProgress.textContent = text;
      },
      onTrialComplete: (result) => {
        lastResults.push(result);
      },
      onSessionComplete: () => {
        renderResultsScreen(lastResults);
        showScreen('results');
        controller = null;
      },
    });

    controller.startSession(config.practiceTrials, mainList);
  });

  document.getElementById('btn-abort').addEventListener('click', () => {
    if (controller) {
      controller.abort();
      controller = null;
    }
    showScreen('start');
  });

  document.getElementById('btn-repeat').addEventListener('click', () => {
    showScreen('start');
  });

  if (btnAnswerLeft) {
    btnAnswerLeft.addEventListener('click', () => {
      if (controller) controller.submitResponse(-1);
    });
  }

  if (btnAnswerRight) {
    btnAnswerRight.addEventListener('click', () => {
      if (controller) controller.submitResponse(1);
    });
  }

  document.getElementById('btn-csv').addEventListener('click', () => {
    const csv = resultsToCSV(lastResults);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadText(`rdm-results-${stamp}.csv`, csv);
  });
}

document.addEventListener('DOMContentLoaded', init);
