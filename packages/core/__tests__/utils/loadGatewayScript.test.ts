// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ALLOWED_GATEWAY_SDK_ORIGINS,
  isAllowedGatewayScriptUrl,
  loadGatewayScript,
  resetGatewayScriptCache,
} from '../../src/lib/utils/loadGatewayScript';
import { STRIPE_SDK_URL } from '../../src/plugins/Stripe/index';
import { BRAINTREE_DROPIN_SDK_URL } from '../../src/plugins/Braintree/index';

/**
 * Script elements are intercepted rather than connected: a connected <script>
 * makes the test DOM attempt a real fetch, and its own load/error events would
 * race the ones these cases fire deliberately.
 */
let appended: HTMLScriptElement[] = [];

const srcs = (): string[] => appended.map((s) => s.getAttribute('src') ?? '');

beforeEach(() => {
  resetGatewayScriptCache();
  appended = [];
  vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
    appended.push(node as unknown as HTMLScriptElement);
    return node;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isAllowedGatewayScriptUrl', () => {
  it.each(ALLOWED_GATEWAY_SDK_ORIGINS)('accepts an https URL on %s', (origin) => {
    expect(isAllowedGatewayScriptUrl(`${origin}/v1/sdk.js`)).toBe(true);
  });

  it('accepts the SDK URLs the plugins actually use', () => {
    expect(isAllowedGatewayScriptUrl(STRIPE_SDK_URL)).toBe(true);
    expect(isAllowedGatewayScriptUrl(BRAINTREE_DROPIN_SDK_URL)).toBe(true);
  });

  it.each([
    ['an unrelated host', 'https://attacker.example/x.js'],
    ['a lookalike subdomain suffix', 'https://js.stripe.com.attacker.example/x.js'],
    ['a lookalike prefix', 'https://evil-js.stripe.com/x.js'],
    ['userinfo that spoofs an allowed host', 'https://js.stripe.com@attacker.example/x.js'],
    ['plain http on an allowed host', 'http://js.stripe.com/v3/stripe.js'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a data: URL', 'data:text/javascript,alert(1)'],
    ['a protocol-relative URL', '//attacker.example/x.js'],
    ['a relative path', '/assets/x.js'],
    ['an empty string', ''],
  ])('rejects %s', (_label, url) => {
    expect(isAllowedGatewayScriptUrl(url)).toBe(false);
  });
});

describe('loadGatewayScript', () => {
  it('appends a script element for an allowlisted URL and resolves on load', async () => {
    const loading = loadGatewayScript(STRIPE_SDK_URL);
    expect(srcs()).toEqual([STRIPE_SDK_URL]);

    appended[0].onload?.(new Event('load'));
    await expect(loading).resolves.toBeUndefined();
  });

  it('does not create a script element for a non-allowlisted URL', async () => {
    await expect(loadGatewayScript('https://attacker.example/x.js')).rejects.toThrow(
      /non-allowlisted origin/,
    );
    expect(appended).toEqual([]);
  });

  it('reuses a single script element across repeated calls', () => {
    void loadGatewayScript(STRIPE_SDK_URL);
    void loadGatewayScript(STRIPE_SDK_URL);
    expect(srcs()).toEqual([STRIPE_SDK_URL]);
  });

  it('allows a retry after a failed load', async () => {
    const first = loadGatewayScript(BRAINTREE_DROPIN_SDK_URL);
    appended[0].onerror?.(new Event('error'));
    await expect(first).rejects.toThrow(/Failed to load script/);

    const second = loadGatewayScript(BRAINTREE_DROPIN_SDK_URL);
    expect(srcs()).toHaveLength(2);

    appended[1].onload?.(new Event('load'));
    await expect(second).resolves.toBeUndefined();
  });
});
