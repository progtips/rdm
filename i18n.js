/**
 * Локализация RDM: ru / en, localStorage, data-i18n в разметке.
 */
(function (global) {
  const STORAGE_KEY = 'rdm-lang';

  /** @type {Record<string, Record<string, string>>} */
  const STRINGS = {
    ru: {
      'page.title': 'RDM — тест направления движения точек',
      'header.subtitle': 'Оценка порога восприятия направления движения',
      'nav.aria': 'Разделы стартового экрана',
      'nav.main': 'Главная',
      'nav.params': 'Параметры',
      'lang.switch': 'Язык: English',
      'lang.switchToRu': 'Переключить на русский',
      'lang.switchToEn': 'Switch to English',

      'home.whatTitle': '🧠 Что это за тест?',
      'home.whatP1':
        'Тест Random Dot Motion (RDM) проверяет, насколько хорошо вы улавливаете слабые визуальные сигналы.',
      'home.whatP2':
        'На экране появляется множество движущихся точек. Большинство из них движется хаотично, но небольшая часть — в одном направлении (влево или вправо).',
      'home.whatP3': 'Ваша задача — определить это направление.',
      'home.whyTitle': '🎯 Зачем проходить тест?',
      'home.whyLead': 'Этот тест позволяет:',
      'home.whyLi1': 'Оценить чувствительность зрительного восприятия',
      'home.whyLi2': 'Понять, насколько хорошо вы замечаете слабые закономерности в шуме',
      'home.whyLi3': 'Измерить свой порог восприятия (насколько слабый сигнал вы способны уловить)',
      'home.whyLi4': 'Проверить скорость реакции и интуицию',
      'home.whyP2':
        'Чем меньший процент «упорядоченных» точек вы можете распознать — тем выше ваша точность восприятия.',
      'home.howTitle': '▶️ Как пройти тест?',
      'home.how1': 'Нажмите кнопку «Начать»',
      'home.how2': 'Смотрите на движущиеся точки в центре экрана',
      'home.how3lead': 'Определите, куда движется основная масса точек:',
      'home.how3a': '⬅️ Стрелка влево — если движение влево',
      'home.how3b': '➡️ Стрелка вправо — если движение вправо',
      'home.how4': 'Отвечайте как можно быстрее и точнее',
      'home.how5': 'После серии попыток вы увидите свои результаты',
      'home.tip':
        '💡 Совет: не пытайтесь «разглядеть каждую точку» — лучше доверяйте общему ощущению движения.',
      'btn.start': 'Начать',

      'params.lead':
        'Настройте условия эксперимента. Значения сохраняются при переключении на «Главная».',
      'params.legend': 'Параметры теста',
      'cfg.numPoints': 'Количество точек',
      'cfg.areaWidth': 'Ширина области (px)',
      'cfg.areaHeight': 'Высота области (px)',
      'cfg.dotSpeed': 'Скорость (px/с)',
      'cfg.dotSize': 'Размер точки (px)',
      'cfg.trialDurationMs': 'Длительность trial (мс)',
      'cfg.fixationMs': 'Фиксация креста (мс)',
      'cfg.repsPerLevel': 'Повторов на уровень coherence',
      'cfg.practiceTrials': 'Практика (число trial)',
      'cfg.coherenceLevels': 'Уровни coherence (%), через запятую',

      'run.label': 'Тест',
      'run.progressInit': 'Испытание 0 из 0',
      'run.hint': 'Смотрите на точки и отвечайте кнопками ниже или клавишами со стрелками.',
      'run.controlsAria': 'Кнопки ответа на направление движения',
      'run.answerLeft': '⬅️ Влево',
      'run.answerRight': '➡️ Вправо',
      'run.abort': 'Прервать',
      'canvas.aria': 'Поле с движущимися точками',

      'results.title': 'Результаты теста',
      'results.metaPrefix': 'Основной блок:',
      'chart.title': 'Точность по уровням coherence',
      'chart.hint':
        'По горизонтали — доля согласованно движущихся точек; по вертикали — процент верных ответов. Пунктирная линия — критерий порога 75%.',
      'chart.aria': 'График точности по coherence',
      'chart.error': 'Не удалось загрузить график. Проверьте подключение к интернету (Chart.js загружается с CDN).',
      'table.summary.title': 'Сводка по уровням',
      'table.summary.coh': 'Coherence',
      'table.summary.n': 'Trial',
      'table.summary.acc': 'Точность',
      'table.summary.rt': 'Среднее RT',
      'table.trials.hash': '#',
      'table.trials.coh': 'Coherence %',
      'table.trials.dir': 'Направление',
      'table.trials.ans': 'Ответ',
      'table.trials.out': 'Исход',
      'table.trials.rt': 'RT (мс)',
      'details.trials': 'Все испытания (подробно)',
      'btn.csv': 'Скачать CSV',
      'btn.repeat': 'Пройти тест заново',

      'err.params': 'Проверьте числовые параметры (должны быть положительными).',
      'err.coherenceList': 'Укажите хотя бы один уровень coherence.',
      'err.badCoherence': 'Некорректный уровень coherence: "{s}"',

      'exp.practice': 'Практика',
      'exp.test': 'Тест',
      'exp.trial': 'Испытание',
      'exp.progress': '{mode} · {trial} {i} из {total}',
      'exp.judgeDir': 'определите направление',

      'fb.missed': 'Пропуск',
      'fb.missedPractice': 'Пропуск · время вышло',
      'fb.correct': 'Верно · {ms} мс',
      'fb.incorrect': 'Неверно · {ms} мс',

      'interp.noData': 'Нет данных по основному блоку испытаний.',
      'interp.thresholdOk':
        'Вы уверенно удерживаете не менее {pct}% точности начиная с coherence {thr}% — это ориентир «вашего порога» в этой сессии.',
      'interp.thresholdFail':
        'Ни на одном из проверенных уровней coherence не набрано {pct}% верных ответов — порог в этом смысле не достигнут.',
      'interp.confident': 'Вы уверенно различаете направление при coherence {min}% и выше.',
      'interp.stable': 'Вы достаточно стабильно справляетесь с задачей примерно с {min}% coherence.',
      'interp.drop': 'Снижение точности заметно между {a}% и {b}% coherence.',

      'threshold.none': 'Недостаточно данных для оценки порога.',
      'threshold.ok': 'Ваш порог восприятия: ~{thr}% coherence (критерий {pct}% верных ответов).',
      'threshold.fail': 'Порог восприятия ({pct}% точности) не достигнут на выбранных уровнях.',

      'metric.acc': 'Общая точность',
      'metric.rt': 'Среднее время реакции',
      'metric.rtSub': 'по верным ответам',
      'metric.best': 'Лучший уровень',
      'metric.bestSub': 'coherence (доля верных на уровне)',
      'metric.thr': 'Порог восприятия',
      'metric.thrSub': 'coherence при {pct}% точности',
      'metric.thrNA': 'не достигнут',
      'metric.dash': '—',

      'explain.title': 'Что это значит',
      'explain.p1':
        '<strong>Coherence (согласованность)</strong> — это доля точек, которые движутся в одном направлении; остальные движутся хаотично. Чем ниже coherence, тем слабее «сигнал» среди шума и тем сложнее увидеть общее направление.',
      'explain.p2':
        '<strong>Лучшая чувствительность</strong> — когда вы сохраняете высокую точность даже при <strong>низком</strong> coherence: слабый сигнал среди шума вам всё ещё «виден». Если точность заметно падает уже при <strong>высоком</strong> coherence, в этой сессии задача даётся тяжелее: для уверенного ответа нужен более сильный сигнал.',
      'explain.p3':
        'Чем ниже процент coherence, при котором вы всё ещё стабильно угадываете направление, тем выше чувствительность к слабым сигналам в этой короткой проверке. Это не медицинский диагноз, а удобная оценка для самонаблюдения и тренировки.',

      'chart.dsAccuracy': 'Точность',
      'chart.dsCriterion': 'Критерий {pct}%',
      'chart.xTitle': 'Coherence, %',
      'chart.yTitle': 'Точность, %',
      'chart.tooltip': 'Точность: {acc}% · {n} trial',
      'unit.ms': 'мс',

      'dir.left': 'влево',
      'dir.right': 'вправо',
      'out.missed': 'пропуск',
      'out.correct': 'верно',
      'out.incorrect': 'неверно',

      'alert.config': 'Ошибка параметров',
    },
    en: {
      'page.title': 'RDM — direction of dot motion',
      'header.subtitle': 'Measuring motion-direction perception threshold',
      'nav.aria': 'Start screen sections',
      'nav.main': 'Home',
      'nav.params': 'Settings',
      'lang.switch': 'Language: Русский',
      'lang.switchToRu': 'Switch to Russian',
      'lang.switchToEn': 'Switch to English',

      'home.whatTitle': '🧠 What is this test?',
      'home.whatP1':
        'The Random Dot Motion (RDM) test measures how well you pick up weak visual signals.',
      'home.whatP2':
        'Many dots move on the screen. Most move at random, but a small fraction moves together to the left or right.',
      'home.whatP3': 'Your task is to tell which direction that coordinated motion is.',
      'home.whyTitle': '🎯 Why take the test?',
      'home.whyLead': 'This test lets you:',
      'home.whyLi1': 'Gauge sensitivity of visual perception',
      'home.whyLi2': 'See how well you spot weak patterns in noise',
      'home.whyLi3': 'Estimate your perception threshold (how weak a signal you can detect)',
      'home.whyLi4': 'Check reaction speed and intuition',
      'home.whyP2':
        'The lower the proportion of “ordered” dots you can still judge correctly, the sharper your perception in this task.',
      'home.howTitle': '▶️ How to run the test',
      'home.how1': 'Click “Start”',
      'home.how2': 'Watch the moving dots in the centre of the screen',
      'home.how3lead': 'Decide where the bulk of the dots is moving:',
      'home.how3a': '⬅️ Left arrow — if motion is to the left',
      'home.how3b': '➡️ Right arrow — if motion is to the right',
      'home.how4': 'Respond as quickly and accurately as you can',
      'home.how5': 'After a series of trials you will see your results',
      'home.tip':
        '💡 Tip: do not try to track every dot — trust the overall sense of motion.',
      'btn.start': 'Start',

      'params.lead':
        'Adjust the experiment settings. Values are kept when you switch back to Home.',
      'params.legend': 'Test parameters',
      'cfg.numPoints': 'Number of dots',
      'cfg.areaWidth': 'Field width (px)',
      'cfg.areaHeight': 'Field height (px)',
      'cfg.dotSpeed': 'Speed (px/s)',
      'cfg.dotSize': 'Dot size (px)',
      'cfg.trialDurationMs': 'Trial duration (ms)',
      'cfg.fixationMs': 'Fixation cross (ms)',
      'cfg.repsPerLevel': 'Repetitions per coherence level',
      'cfg.practiceTrials': 'Practice trials',
      'cfg.coherenceLevels': 'Coherence levels (%), comma-separated',

      'run.label': 'Test',
      'run.progressInit': 'Trial 0 of 0',
      'run.hint': 'Watch the dots and respond using the buttons below or the arrow keys.',
      'run.controlsAria': 'Direction response buttons',
      'run.answerLeft': '⬅️ Left',
      'run.answerRight': '➡️ Right',
      'run.abort': 'Abort',
      'canvas.aria': 'Moving dot field',

      'results.title': 'Test results',
      'results.metaPrefix': 'Main block:',
      'chart.title': 'Accuracy by coherence level',
      'chart.hint':
        'Horizontal axis: fraction of dots moving together; vertical axis: percent correct. Dashed line: 75% criterion.',
      'chart.aria': 'Accuracy by coherence chart',
      'chart.error': 'Could not load the chart. Check your internet connection (Chart.js is loaded from a CDN).',
      'table.summary.title': 'Summary by level',
      'table.summary.coh': 'Coherence',
      'table.summary.n': 'Trials',
      'table.summary.acc': 'Accuracy',
      'table.summary.rt': 'Mean RT',
      'table.trials.hash': '#',
      'table.trials.coh': 'Coherence %',
      'table.trials.dir': 'Direction',
      'table.trials.ans': 'Response',
      'table.trials.out': 'Outcome',
      'table.trials.rt': 'RT (ms)',
      'details.trials': 'All trials (details)',
      'btn.csv': 'Download CSV',
      'btn.repeat': 'Take the test again',

      'err.params': 'Check numeric parameters (must be positive).',
      'err.coherenceList': 'Enter at least one coherence level.',
      'err.badCoherence': 'Invalid coherence level: "{s}"',

      'exp.practice': 'Practice',
      'exp.test': 'Test',
      'exp.trial': 'Trial',
      'exp.progress': '{mode} · {trial} {i} of {total}',
      'exp.judgeDir': 'judge the direction',

      'fb.missed': 'Miss',
      'fb.missedPractice': 'Miss · time out',
      'fb.correct': 'Correct · {ms} ms',
      'fb.incorrect': 'Incorrect · {ms} ms',

      'interp.noData': 'No data for the main block.',
      'interp.thresholdOk':
        'You maintain at least {pct}% accuracy from coherence {thr}% upward — an estimate of your threshold this session.',
      'interp.thresholdFail':
        'No coherence level reached {pct}% correct answers — the threshold was not met in this sense.',
      'interp.confident': 'You judge direction confidently at coherence {min}% and above.',
      'interp.stable': 'You perform fairly steadily from about {min}% coherence.',
      'interp.drop': 'Accuracy drops clearly between {a}% and {b}% coherence.',

      'threshold.none': 'Not enough data to estimate a threshold.',
      'threshold.ok': 'Your perception threshold: ~{thr}% coherence ({pct}% correct criterion).',
      'threshold.fail': 'Perception threshold ({pct}% accuracy) was not reached at the levels tested.',

      'metric.acc': 'Overall accuracy',
      'metric.rt': 'Mean reaction time',
      'metric.rtSub': 'correct trials only',
      'metric.best': 'Best level',
      'metric.bestSub': 'coherence (accuracy at that level)',
      'metric.thr': 'Perception threshold',
      'metric.thrSub': 'coherence at {pct}% accuracy',
      'metric.thrNA': 'not reached',
      'metric.dash': '—',

      'explain.title': 'What this means',
      'explain.p1':
        '<strong>Coherence</strong> is the fraction of dots moving in one direction; the rest move randomly. Lower coherence means a weaker signal in the noise and a harder direction judgment.',
      'explain.p2':
        '<strong>Better sensitivity</strong> means you stay accurate even at <strong>low</strong> coherence — a weak signal still “reads” to you. If accuracy drops already at <strong>high</strong> coherence, the task is harder in this session: you need a stronger signal to respond confidently.',
      'explain.p3':
        'The lower the coherence at which you still judge direction reliably, the higher your sensitivity to weak signals in this short check. This is not a medical diagnosis — just a handy self-assessment.',

      'chart.dsAccuracy': 'Accuracy',
      'chart.dsCriterion': '{pct}% criterion',
      'chart.xTitle': 'Coherence, %',
      'chart.yTitle': 'Accuracy, %',
      'chart.tooltip': 'Accuracy: {acc}% · {n} trials',
      'unit.ms': 'ms',

      'dir.left': 'left',
      'dir.right': 'right',
      'out.missed': 'miss',
      'out.correct': 'correct',
      'out.incorrect': 'incorrect',

      'alert.config': 'Settings error',
    },
  };

  function getLang() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'en' ? 'en' : 'ru';
    } catch {
      return 'ru';
    }
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'ru') return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }

  /**
   * @param {string} key
   * @param {Record<string, string | number>} [params]
   */
  function t(key, params) {
    const lang = getLang();
    let s = STRINGS[lang]?.[key] ?? STRINGS.ru[key] ?? key;
    s = String(s);
    if (params) {
      s = s.replace(/\{(\w+)\}/g, (_, name) =>
        params[name] != null ? String(params[name]) : `{${name}}`
      );
    }
    return s;
  }

  function applyDom(root) {
    const elRoot = root || document;
    elRoot.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const attr = el.getAttribute('data-i18n-attr');
      const html = el.getAttribute('data-i18n-html');
      if (attr) {
        el.setAttribute(attr, t(key));
      } else if (html === '1' || html === 'true') {
        el.innerHTML = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'ru';
    const titleEl = document.querySelector('title[data-i18n-key]');
    if (titleEl) {
      const k = titleEl.getAttribute('data-i18n-key');
      if (k) document.title = t(k);
    }
  }

  function updateLangButton() {
    const btn = document.getElementById('btn-lang');
    if (!btn) return;
    const lang = getLang();
    btn.textContent = lang === 'ru' ? 'EN' : 'RU';
    btn.setAttribute('title', lang === 'ru' ? t('lang.switchToEn') : t('lang.switchToRu'));
    btn.setAttribute('aria-label', lang === 'ru' ? t('lang.switchToEn') : t('lang.switchToRu'));
  }

  global.RDM_I18N = {
    STRINGS,
    getLang,
    setLang,
    t,
    applyDom,
    updateLangButton,
  };
})(typeof window !== 'undefined' ? window : globalThis);
