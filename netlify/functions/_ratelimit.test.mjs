import { describe, it, expect } from 'vitest';
import { rateLimit, clientIp } from './_ratelimit.mjs';

const cors = { 'Content-Type': 'application/json' };

/** A request carrying just the headers the limiter reads. */
const req = (ip, header = 'x-nf-client-connection-ip') =>
  new Request('https://tomchi.test/.netlify/functions/chat', {
    method: 'POST',
    headers: { [header]: ip },
  });

describe('clientIp', () => {
  it('prefers the Netlify connection header', () => {
    expect(clientIp(req('203.0.113.7'))).toBe('203.0.113.7');
  });

  it('falls back to the first hop of x-forwarded-for', () => {
    expect(clientIp(req('203.0.113.9, 10.0.0.1', 'x-forwarded-for'))).toBe('203.0.113.9');
  });

  it('does not throw when the caller has no identifiable address', () => {
    const bare = new Request('https://tomchi.test/x', { method: 'POST' });
    expect(clientIp(bare)).toBe('unknown');
  });
});

describe('rateLimit', () => {
  it('lets a caller through up to the cap', () => {
    const ip = '198.51.100.1';
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(req(ip), { perMinute: 5, cors })).toBeNull();
    }
  });

  it('turns the caller away once the cap is passed', () => {
    const ip = '198.51.100.2';
    for (let i = 0; i < 3; i++) rateLimit(req(ip), { perMinute: 3, cors });

    const blocked = rateLimit(req(ip), { perMinute: 3, cors });
    expect(blocked).not.toBeNull();
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });

  it('names the reason and when to come back', async () => {
    const ip = '198.51.100.3';
    rateLimit(req(ip), { perMinute: 1, cors });
    const blocked = rateLimit(req(ip), { perMinute: 1, cors });

    const body = await blocked.json();
    expect(body.error).toBe('rate_limited');
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(60);
  });

  it('counts each caller separately', () => {
    const noisy = '198.51.100.4';
    const quiet = '198.51.100.5';
    for (let i = 0; i < 4; i++) rateLimit(req(noisy), { perMinute: 2, cors });

    expect(rateLimit(req(noisy), { perMinute: 2, cors })).not.toBeNull();
    expect(rateLimit(req(quiet), { perMinute: 2, cors })).toBeNull();
  });

  it('keeps the CORS headers on the rejection so the browser can read it', () => {
    const ip = '198.51.100.6';
    rateLimit(req(ip), { perMinute: 1, cors });
    const blocked = rateLimit(req(ip), { perMinute: 1, cors });
    expect(blocked.headers.get('Content-Type')).toBe('application/json');
  });
});
