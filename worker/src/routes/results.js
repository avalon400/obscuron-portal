import { json, err, kvGet, kvSet, kvList, kvListAppend } from '../utils.js';

// ─── Competence points algorithm ─────────────────────────────────────────────
// Difficulty 1–7 uses an exponential weight ramp.
// Score = (earned_weight / total_weight) × 2500
const DIFF_WEIGHT = [0, 1, 1.5, 2.5, 4, 6.5, 10, 16];

function computePoints(tasks, answers, manualGrades) {
  const totalWeight = tasks.reduce((s, t) => s + DIFF_WEIGHT[t.difficulty], 0);
  if (totalWeight === 0) return 0;
  let earned = 0;
  tasks.forEach((t, i) => {
    if (['essay','fileupload'].includes(t.type)) {
      const mg = manualGrades && manualGrades[t.id];
      if (mg) earned += (mg.points / 100) * DIFF_WEIGHT[t.difficulty];
    } else if (checkCorrect(t, answers[i])) {
      earned += DIFF_WEIGHT[t.difficulty];
    }
  });
  return Math.round((earned / totalWeight) * 2500);
}

function checkCorrect(task, ans) {
  if (ans === undefined || ans === null || ans === '') return false;
  switch (task.type) {
    case 'mc':        return Number(ans) === task.correctIdx;
    case 'truefalse': return String(ans) === String(task.correctAnswer);
    case 'text': {
      const a = (ans + '').toLowerCase();
      return task.keywords.some(k => a.includes(k.toLowerCase().trim()));
    }
    case 'numeric': {
      const n = Number(ans);
      if (isNaN(n)) return false;
      if (task.useTolerance) return Math.abs(n - task.correctNumber) <= task.tolerance;
      return n === task.correctNumber;
    }
    case 'order':
      return Array.isArray(ans) && ans.length === task.items.length && ans.every((v,i) => Number(v) === i);
    case 'match': {
      if (typeof ans !== 'object') return false;
      return task.pairs.every(([l,r]) => (ans[l]||'').trim() === r.trim());
    }
    case 'essay':
    case 'fileupload':
      return false; // manually graded
    default: return false;
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** POST /api/submit */
export async function submit(request, env) {
  const body = await request.json();
  const { examCode, examineeId, answers, timeUsed } = body;

  if (!examCode || !examineeId || !answers)
    return err(400, 'examCode, examineeId, and answers are required.');

  const code = examCode.toUpperCase();
  const eid  = examineeId.toUpperCase();

  // Verify registration
  const reg = await env.CG_KV.get(`examinee:${code}:${eid}`);
  if (!reg) return err(403, 'Not registered for this examination.');

  // Prevent double submission
  if (await kvGet(env, `result:${code}:${eid}`))
    return err(409, 'This examination has already been submitted.');

  const exam = await kvGet(env, `exam:${code}`);
  if (!exam) return err(404, 'Examination not found.');

  const tasks = (await Promise.all(exam.taskIds.map(id => kvGet(env, `task:${id}`)))).filter(Boolean);

  const points  = computePoints(tasks, answers, {});
  let   correct = 0;
  tasks.forEach((t, i) => { if (checkCorrect(t, answers[i])) correct++; });

  const record = {
    examCode: code,
    examineeId: eid,
    answers,
    points,
    correct,
    total: tasks.length,
    timeUsed: Number(timeUsed) || 0,
    submittedAt: new Date().toISOString(),
    released: false,
  };

  await kvSet(env, `result:${code}:${eid}`, record);
  await kvListAppend(env, 'results:list', `${code}:${eid}`);

  return json({ ok: true, message: 'Examination submitted. Results will be released by the administrator.' });
}

/** GET /api/result?examCode=X&examineeId=Y — public, but only returns if released */
export async function getForExaminee(request, env) {
  const url  = new URL(request.url);
  const code = (url.searchParams.get('examCode') || '').toUpperCase();
  const eid  = (url.searchParams.get('examineeId') || '').toUpperCase();

  const record = await kvGet(env, `result:${code}:${eid}`);
  if (!record) return err(404, 'No result found for these credentials.');
  if (!record.released) return err(403, 'Results have not yet been released for this examination.');

  const exam  = await kvGet(env, `exam:${code}`);
  const tasks = exam
    ? (await Promise.all(exam.taskIds.map(id => kvGet(env, `task:${id}`)))).filter(Boolean)
    : [];

  // Build per-question review (include correct answers now that it's released)
  const review = tasks.map((t, i) => ({
    name:       t.name || '',
    question:   t.text,
    type:       t.type,
    difficulty: t.difficulty,
    correct:    checkCorrect(t, record.answers[i]),
    yourAnswer: record.answers[i],
    correctAnswer: correctAnsStr(t),
    manualGrade: record.manualGrades?.[t.id] || null,
    needsManualGrade: ['essay','fileupload'].includes(t.type) && !record.manualGrades?.[t.id],
  }));

  return json({ ...record, review, examTitle: exam?.title });
}

function correctAnsStr(t) {
  if (t.type === 'mc')         return t.options[t.correctIdx];
  if (t.type === 'truefalse')  return t.correctAnswer ? 'Igaz' : 'Hamis';
  if (t.type === 'text')       return t.keywords.join(', ');
  if (t.type === 'numeric')    return t.useTolerance ? `${t.correctNumber} (±${t.tolerance})` : String(t.correctNumber);
  if (t.type === 'order')      return t.items.join(' → ');
  if (t.type === 'match')      return t.pairs.map(([l,r]) => `${l} → ${r}`).join('; ');
  if (t.type === 'essay')      return '(manuális értékelés)';
  if (t.type === 'fileupload') return '(feltöltött fájl)';
  return '—';
}

/** GET /api/admin/results */
export async function listAll(request, env) {
  const url      = new URL(request.url);
  const filterCode = (url.searchParams.get('examCode') || '').toUpperCase();

  const keys    = await kvList(env, 'results:list');
  const records = await Promise.all(
    keys
      .filter(k => !filterCode || k.startsWith(filterCode + ':'))
      .map(k => {
        const [code, ...rest] = k.split(':');
        const eid = rest.join(':');
        return kvGet(env, `result:${code}:${eid}`);
      })
  );
  return json(records.filter(Boolean));
}

/** POST /api/admin/results/publish */
export async function publish(request, env) {
  const { examCode } = await request.json();
  if (!examCode) return err(400, 'examCode required.');

  const code = examCode.toUpperCase();
  const keys = await kvList(env, 'results:list');
  const matching = keys.filter(k => k.startsWith(code + ':'));

  let count = 0;
  await Promise.all(matching.map(async k => {
    const [c, ...rest] = k.split(':');
    const eid = rest.join(':');
    const rec = await kvGet(env, `result:${c}:${eid}`);
    if (rec && !rec.released) {
      rec.released = true;
      rec.releasedAt = new Date().toISOString();
      await kvSet(env, `result:${c}:${eid}`, rec);
      count++;
    }
  }));

  // Mark exam as published
  const exam = await kvGet(env, `exam:${code}`);
  if (exam) { exam.published = true; await kvSet(env, `exam:${code}`, exam); }

  return json({ ok: true, published: count });
}
