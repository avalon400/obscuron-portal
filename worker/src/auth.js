import { err } from './utils.js';

/**
 * Simple password-based admin middleware.
 * Password is stored in the Worker secret: ADMIN_PASSWORD
 * Set via:  wrangler secret put ADMIN_PASSWORD
 *
 * The client sends the password in the X-Admin-Password header.
 */
export function adminMiddleware(request, env) {
  const supplied = request.headers.get('X-Admin-Password');
  const expected = env.ADMIN_PASSWORD || 'admin123'; // fallback for local dev

  if (!supplied || supplied !== expected) {
    return err(401, 'Unauthorised — invalid administrator password.');
  }
  return null; // OK
}
