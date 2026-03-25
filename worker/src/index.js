/**
 * CompetenceGate — Cloudflare Worker API
 * All data is stored in Cloudflare KV (namespace: CG_KV)
 *
 * KV Key scheme:
 *   exam:{code}              → Exam object
 *   exams:list               → [ code, code, … ]
 *   task:{id}                → Task object
 *   tasks:list               → [ id, id, … ]
 *   examinee:{examCode}:{id} → true  (registration)
 *   result:{examCode}:{id}   → Result object
 *   results:list             → [ "examCode:id", … ]
 */

import { handleCORS, json, err } from './utils.js';
import { adminMiddleware }        from './auth.js';
import * as examRoutes            from './routes/exams.js';
import * as taskRoutes            from './routes/tasks.js';
import * as examineeRoutes        from './routes/examinees.js';
import * as resultRoutes          from './routes/results.js';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS pre-flight
    if (request.method === 'OPTIONS') {
      return handleCORS(new Response(null, { status: 204 }));
    }

    const url      = new URL(request.url);
    const path     = url.pathname;
    const method   = request.method;

    try {
      // ── PUBLIC ROUTES ──────────────────────────────────
      // Examinee login / verification
      if (path === '/api/verify' && method === 'POST')
        return handleCORS(await examineeRoutes.verify(request, env));

      // Submit exam answers
      if (path === '/api/submit' && method === 'POST')
        return handleCORS(await resultRoutes.submit(request, env));

      // Fetch a single exam (questions, no answers) for an authorised examinee
      if (path === '/api/exam' && method === 'GET')
        return handleCORS(await examRoutes.getForExaminee(request, env));

      // Examinee views own result (only if released)
      if (path === '/api/result' && method === 'GET')
        return handleCORS(await resultRoutes.getForExaminee(request, env));

      // ── ADMIN ROUTES (password-protected) ─────────────
      if (path.startsWith('/api/admin/')) {
        const authErr = adminMiddleware(request, env);
        if (authErr) return handleCORS(authErr);

        // Exams
        if (path === '/api/admin/exams'         && method === 'GET')  return handleCORS(await examRoutes.list(request, env));
        if (path === '/api/admin/exams'         && method === 'POST') return handleCORS(await examRoutes.create(request, env));
        if (path === '/api/admin/exams'         && method === 'DELETE') return handleCORS(await examRoutes.remove(request, env));
        if (path === '/api/admin/exams/assign'  && method === 'POST') return handleCORS(await examRoutes.assignTask(request, env));
        if (path === '/api/admin/exams/removetask' && method === 'POST') return handleCORS(await examRoutes.removeTask(request, env));

        // Tasks
        if (path === '/api/admin/tasks'         && method === 'GET')  return handleCORS(await taskRoutes.list(request, env));
        if (path === '/api/admin/tasks'         && method === 'POST') return handleCORS(await taskRoutes.create(request, env));
        if (path === '/api/admin/tasks'         && method === 'DELETE') return handleCORS(await taskRoutes.remove(request, env));
        if (path === '/api/admin/tasks'         && method === 'PUT') return handleCORS(await taskRoutes.update(request, env));
        if (path === '/api/admin/tasks/grade'    && method === 'POST') return handleCORS(await taskRoutes.grade(request, env));

        // Examinees
        if (path === '/api/admin/examinees'     && method === 'POST') return handleCORS(await examineeRoutes.register(request, env));
        if (path === '/api/admin/examinees'     && method === 'GET')  return handleCORS(await examineeRoutes.list(request, env));
        if (path === '/api/admin/examinees'     && method === 'DELETE') return handleCORS(await examineeRoutes.unregister(request, env));

        // Results
        if (path === '/api/admin/results'       && method === 'GET')  return handleCORS(await resultRoutes.listAll(request, env));
        if (path === '/api/admin/results/publish' && method === 'POST') return handleCORS(await resultRoutes.publish(request, env));

        // Settings — logo & signing
        if (path === '/api/admin/settings/logo' && method === 'GET') {
          const logo = await env.CG_KV.get('settings:logo');
          return handleCORS(json({ logo: logo || null }));
        }
        if (path === '/api/admin/settings/logo' && method === 'POST') {
          const { logo } = await request.json();
          if (!logo) return handleCORS(err(400, 'logo required'));
          await env.CG_KV.put('settings:logo', logo);
          return handleCORS(json({ ok: true }));
        }
        if (path === '/api/admin/settings/logo' && method === 'DELETE') {
          await env.CG_KV.delete('settings:logo');
          return handleCORS(json({ ok: true }));
        }
        if (path === '/api/admin/settings/signstatus' && method === 'GET') {
          const available = !!(env.SIGN_CERT && env.SIGN_KEY);
          return handleCORS(json({ available }));
        }

        return handleCORS(err(404, 'Route not found'));
      }

      return handleCORS(err(404, 'Not found'));

    } catch (e) {
      console.error(e);
      return handleCORS(err(500, 'Internal server error: ' + e.message));
    }
  }
};
