/** Shared response helpers */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
};

export function handleCORS(response) {
  const r = new Response(response.body, response);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => r.headers.set(k, v));
  return r;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function err(status, message) {
  return json({ error: message }, status);
}

export function uid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

/** KV list helper — returns parsed array or [] */
export async function kvList(env, key) {
  const raw = await env.CG_KV.get(key);
  return raw ? JSON.parse(raw) : [];
}

/** KV get parsed JSON or null */
export async function kvGet(env, key) {
  const raw = await env.CG_KV.get(key);
  return raw ? JSON.parse(raw) : null;
}

/** KV set JSON */
export async function kvSet(env, key, value) {
  await env.CG_KV.put(key, JSON.stringify(value));
}

/** Append an item to a KV list atomically (best-effort) */
export async function kvListAppend(env, listKey, item) {
  const list = await kvList(env, listKey);
  if (!list.includes(item)) {
    list.push(item);
    await kvSet(env, listKey, list);
  }
}

/** Remove item from a KV list */
export async function kvListRemove(env, listKey, item) {
  const list = await kvList(env, listKey);
  await kvSet(env, listKey, list.filter(i => i !== item));
}
