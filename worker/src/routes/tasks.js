import { json, err, uid, kvGet, kvSet, kvList, kvListAppend, kvListRemove } from '../utils.js';

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

  const validTypes = ['mc', 'text', 'order', 'match'];
  if (!validTypes.includes(type))
    return err(400, `type must be one of: ${validTypes.join(', ')}`);

  // Validate type-specific fields
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

  const task = {
    id: uid(),
    text,
    type,
    difficulty: Number(difficulty),
    ...(type === 'mc'    && { options: body.options, correctIdx: Number(body.correctIdx) }),
    ...(type === 'text'  && { keywords: body.keywords }),
    ...(type === 'order' && { items: body.items }),
    ...(type === 'match' && { pairs: body.pairs }),
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

/** PUT /api/admin/tasks?id=xxx — edit a task */
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
