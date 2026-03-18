import { json, err, uid, kvGet, kvSet, kvList, kvListAppend, kvListRemove } from '../utils.js';

/** GET /api/admin/exams — list all exams with full detail */
export async function list(request, env) {
  const codes = await kvList(env, 'exams:list');
  const exams = await Promise.all(codes.map(c => kvGet(env, `exam:${c}`)));
  return json(exams.filter(Boolean));
}

/** POST /api/admin/exams — create a new exam */
export async function create(request, env) {
  const body = await request.json();
  const { title, category, code, timeMins, desc } = body;

  if (!title || !code || !timeMins)
    return err(400, 'title, code, and timeMins are required.');

  const upperCode = code.toUpperCase();
  if (await kvGet(env, `exam:${upperCode}`))
    return err(409, 'An examination with that code already exists.');

  const exam = {
    id: uid(),
    code: upperCode,
    title,
    category: category || 'General',
    desc: desc || '',
    timeMins: Number(timeMins),
    taskIds: [],
    published: false,
    createdAt: new Date().toISOString(),
  };

  await kvSet(env, `exam:${upperCode}`, exam);
  await kvListAppend(env, 'exams:list', upperCode);

  return json(exam, 201);
}

/** POST /api/admin/exams/assign — assign a task to an exam */
export async function assignTask(request, env) {
  const { examCode, taskId } = await request.json();
  if (!examCode || !taskId) return err(400, 'examCode and taskId required.');

  const exam = await kvGet(env, `exam:${examCode.toUpperCase()}`);
  if (!exam) return err(404, 'Examination not found.');

  const task = await kvGet(env, `task:${taskId}`);
  if (!task) return err(404, 'Task not found.');

  if (exam.taskIds.includes(taskId))
    return err(409, 'Task already assigned to this examination.');

  exam.taskIds.push(taskId);
  await kvSet(env, `exam:${exam.code}`, exam);

  return json({ ok: true, taskCount: exam.taskIds.length });
}

/** GET /api/exam?code=EXAM-2025-001&examineeId=EX-00001
 *  Returns exam + tasks (options only, no correct answers) */
export async function getForExaminee(request, env) {
  const url  = new URL(request.url);
  const code = (url.searchParams.get('code') || '').toUpperCase();
  const eid  = (url.searchParams.get('examineeId') || '').toUpperCase();

  const exam = await kvGet(env, `exam:${code}`);
  if (!exam) return err(404, 'Examination not found.');

  // Verify examinee is registered
  const reg = await env.CG_KV.get(`examinee:${code}:${eid}`);
  if (!reg) return err(403, 'Examinee ID not registered for this examination.');

  // Check not already submitted
  const existing = await kvGet(env, `result:${code}:${eid}`);
  if (existing) return json({ alreadySubmitted: true, released: existing.released });

  // Scrub correct answers from tasks before sending to client
  const tasks = await Promise.all(
    exam.taskIds.map(id => kvGet(env, `task:${id}`))
  );

  const sanitised = tasks.filter(Boolean).map(t => {
    const { correctIdx, keywords, items, pairs, ...safe } = t;
    // For ordering, send items shuffled so client can't infer order
    if (t.type === 'order') safe.items = [...t.items].sort(() => Math.random() - 0.5);
    if (t.type === 'match') safe.pairs = t.pairs.map(([l]) => [l, null]); // send left side only
    if (t.type === 'match') safe.matchOptions = t.pairs.map(([,r]) => r).sort(() => Math.random() - 0.5);
    return safe;
  });

  return json({
    code: exam.code,
    title: exam.title,
    category: exam.category,
    desc: exam.desc,
    timeMins: exam.timeMins,
    tasks: sanitised,
  });
}

/** DELETE /api/admin/exams?code=X */
export async function remove(request, env) {
  const url  = new URL(request.url);
  const code = (url.searchParams.get('code') || '').toUpperCase();
  if (!code) return err(400, 'code query param required.');

  const exam = await kvGet(env, `exam:${code}`);
  if (!exam) return err(404, 'Examination not found.');

  await env.CG_KV.delete(`exam:${code}`);
  await kvListRemove(env, 'exams:list', code);

  return json({ ok: true });
}

/** POST /api/admin/exams/removetask — remove a task from an exam */
export async function removeTask(request, env) {
  const { examCode, taskId } = await request.json();
  if (!examCode || !taskId) return err(400, 'examCode and taskId required.');

  const exam = await kvGet(env, `exam:${examCode.toUpperCase()}`);
  if (!exam) return err(404, 'Examination not found.');

  exam.taskIds = exam.taskIds.filter(id => id !== taskId);
  await kvSet(env, `exam:${exam.code}`, exam);

  return json({ ok: true, taskCount: exam.taskIds.length });
}
