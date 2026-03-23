import { json, err, uid, kvGet, kvSet, kvList, kvListAppend, kvListRemove } from '../utils.js';

const VALID_TYPES = ['mc', 'text', 'order', 'match', 'truefalse', 'essay', 'numeric', 'fileupload'];

/** GET /api/admin/tasks */
export async function list(request, env) {
  const ids   = await kvList(env, 'tasks:list');
  const tasks = await Promise.all(ids.map(id => kvGet(env, `task:${id}`)));
  return json(tasks.filter(Boolean));
}

/** POST /api/admin/tasks */
export async function create(request, env) {
  const body = await request.json();
  const { text, type, difficulty } = body;

  if (!text || !type || !difficulty)
    return err(400, 'text, type, and difficulty are required.');
  if (difficulty < 1 || difficulty > 7)
    return err(400, 'difficulty must be between 1 and 7.');
  if (!VALID_TYPES.includes(type))
    return err(400, `type must be one of: ${VALID_TYPES.join(', ')}`);

  if (type === 'mc') {
    if (!Array.isArray(body.options) || body.options.length < 2)
      return err(400, 'MC tasks require at least 2 options.');
    if (body.correctIdx === undefined || body.correctIdx < 0 || body.correctIdx >= body.options.length)
      return err(400, 'correctIdx must point to a valid option.');
  }
  if (type === 'text') {
    if (!Array.isArray(body.keywords) || body.keywords.length === 0)
      return err(400, 'Text tasks require at least one keyword.');
  }
  if (type === 'order') {
    if (!Array.isArray(body.items) || body.items.length < 2)
      return err(400, 'Order tasks require at least 2 items.');
  }
  if (type === 'match') {
    if (!Array.isArray(body.pairs) || body.pairs.length < 2)
      return err(400, 'Match tasks require at least 2 pairs.');
  }
  if (type === 'numeric') {
    if (body.correctNumber === undefined || body.correctNumber === null)
      return err(400, 'Numeric tasks require correctNumber.');
  }

  const task = {
    id: uid(),
    name: body.name || '',
    text,
    type,
    difficulty: Number(difficulty),
    image: body.image || null,
    ...(type === 'mc'         && { options: body.options, correctIdx: Number(body.correctIdx) }),
    ...(type === 'text'       && { keywords: body.keywords }),
    ...(type === 'order'      && { items: body.items }),
    ...(type === 'match'      && { pairs: body.pairs }),
    ...(type === 'truefalse'  && { correctAnswer: body.correctAnswer === true || body.correctAnswer === 'true' }),
    ...(type === 'numeric'    && { correctNumber: Number(body.correctNumber), tolerance: Number(body.tolerance) || 0, useTolerance: !!body.useTolerance }),
    ...(type === 'essay'      && { maxWords: Number(body.maxWords) || 0 }),
    ...(type === 'fileupload' && { allowedTypes: body.allowedTypes || ['pdf','jpg','png'] }),
    createdAt: new Date().toISOString(),
  };

  await kvSet(env, `task:${task.id}`, task);
  await kvListAppend(env, 'tasks:list', task.id);
  return json(task, 201);
}

/** DELETE /api/admin/tasks?id=xxx */
export async function remove(request, env) {
  const url = new URL(request.url);
  const id  = url.searchParams.get('id');
  if (!id) return err(400, 'id query param required.');
  const task = await kvGet(env, `task:${id}`);
  if (!task) return err(404, 'Task not found.');
  await env.CG_KV.delete(`task:${id}`);
  await kvListRemove(env, 'tasks:list', id);
  return json({ ok: true });
}

/** PUT /api/admin/tasks?id=xxx */
export async function update(request, env) {
  const url = new URL(request.url);
  const id  = url.searchParams.get('id');
  if (!id) return err(400, 'id query param required.');
  const task = await kvGet(env, `task:${id}`);
  if (!task) return err(404, 'Task not found.');
  const body = await request.json();
  const updated = { ...task, ...body, id, createdAt: task.createdAt };
  await kvSet(env, `task:${id}`, updated);
  return json(updated);
}

/** POST /api/admin/tasks/:id/grade — manually grade essay/fileupload */
export async function grade(request, env) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get('taskId');
  const { examCode, examineeId, points, feedback } = await request.json();
  if (!examCode || !examineeId) return err(400, 'examCode and examineeId required.');

  const code = examCode.toUpperCase();
  const eid  = examineeId.toUpperCase();
  const record = await kvGet(env, `result:${code}:${eid}`);
  if (!record) return err(404, 'Result not found.');

  if (!record.manualGrades) record.manualGrades = {};
  record.manualGrades[taskId] = { points: Number(points), feedback: feedback || '' };

  // Recompute total points including manual grades
  const exam = await kvGet(env, `exam:${code}`);
  if (exam) {
    const tasks = (await Promise.all(exam.taskIds.map(id => kvGet(env, `task:${id}`)))).filter(Boolean);
    const DIFF_WEIGHT = [0,1,1.5,2.5,4,6.5,10,16];
    const totalWeight = tasks.reduce((s,t) => s + DIFF_WEIGHT[t.difficulty], 0);
    if (totalWeight > 0) {
      let earned = 0;
      tasks.forEach((t,i) => {
        if (['essay','fileupload'].includes(t.type)) {
          const mg = record.manualGrades[t.id];
          if (mg) earned += (mg.points / 100) * DIFF_WEIGHT[t.difficulty];
        } else if (checkCorrect(t, record.answers[i])) {
          earned += DIFF_WEIGHT[t.difficulty];
        }
      });
      record.points = Math.round((earned / totalWeight) * 2500);
    }
  }

  await kvSet(env, `result:${code}:${eid}`, record);
  return json({ ok: true, newPoints: record.points });
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
