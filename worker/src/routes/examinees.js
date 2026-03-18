import { json, err, kvGet, kvSet, kvList, kvListAppend } from '../utils.js';

/** POST /api/admin/examinees — register an examinee ID for an exam */
export async function register(request, env) {
  const { examCode, examineeId } = await request.json();
  if (!examCode || !examineeId) return err(400, 'examCode and examineeId required.');

  const code = examCode.toUpperCase();
  const eid  = examineeId.toUpperCase();

  const exam = await kvGet(env, `exam:${code}`);
  if (!exam) return err(404, 'Examination not found.');

  const key = `examinee:${code}:${eid}`;
  if (await env.CG_KV.get(key)) return err(409, 'Examinee already registered for this examination.');

  await env.CG_KV.put(key, '1');

  // Keep an index for listing
  await kvListAppend(env, `examinees:${code}`, eid);

  return json({ ok: true, examCode: code, examineeId: eid }, 201);
}

/** GET /api/admin/examinees?examCode=EXAM-2025-001 */
export async function list(request, env) {
  const url  = new URL(request.url);
  const code = (url.searchParams.get('examCode') || '').toUpperCase();
  if (!code) return err(400, 'examCode query param required.');

  const ids = await kvList(env, `examinees:${code}`);
  return json({ examCode: code, examinees: ids });
}

/** POST /api/verify — check credentials before starting exam */
export async function verify(request, env) {
  const { examCode, examineeId } = await request.json();
  if (!examCode || !examineeId) return err(400, 'examCode and examineeId required.');

  const code = examCode.toUpperCase();
  const eid  = examineeId.toUpperCase();

  const exam = await kvGet(env, `exam:${code}`);
  if (!exam) return err(404, 'Examination code not recognised.');

  const reg = await env.CG_KV.get(`examinee:${code}:${eid}`);
  if (!reg) return err(403, 'Examinee ID not registered for this examination.');

  // Already submitted?
  const existing = await kvGet(env, `result:${code}:${eid}`);
  if (existing) {
    return json({
      status: 'already_submitted',
      released: existing.released,
      examTitle: exam.title,
    });
  }

  return json({
    status: 'ok',
    examTitle: exam.title,
    category: exam.category,
    desc: exam.desc,
    timeMins: exam.timeMins,
    taskCount: exam.taskIds.length,
  });
}

/** DELETE /api/admin/examinees?examCode=X&examineeId=Y */
export async function unregister(request, env) {
  const url  = new URL(request.url);
  const code = (url.searchParams.get('examCode') || '').toUpperCase();
  const eid  = (url.searchParams.get('examineeId') || '').toUpperCase();
  if (!code || !eid) return err(400, 'examCode and examineeId required.');

  await env.CG_KV.delete(`examinee:${code}:${eid}`);

  const ids = await kvList(env, `examinees:${code}`);
  await kvSet(env, `examinees:${code}`, ids.filter(i => i !== eid));

  return json({ ok: true });
}
