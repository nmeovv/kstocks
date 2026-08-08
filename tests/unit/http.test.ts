import {afterEach, describe, expect, it, vi} from 'vitest';

import {apiRequest} from '@/api/http';

describe('apiRequest', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
    });

    it('attaches the readable CSRF cookie to mutations', async () => {
        document.cookie = 'XSRF-TOKEN=csrf-token; path=/';
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, {status: 204}));
        vi.stubGlobal('fetch', fetchMock);

        await apiRequest('/logout', {method: 'POST'});

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.credentials).toBe('same-origin');
        expect(new Headers(init.headers).get('X-XSRF-TOKEN')).toBe('csrf-token');
    });

    it.each([
        [401, 'unauthenticated'],
        [403, 'forbidden'],
    ] as const)('classifies a %s response as %s', async (status, kind) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, {status})));

        await expect(apiRequest('/api/v1/protected', {method: 'POST'})).resolves.toMatchObject({
            ok: false,
            kind,
        });
    });
});
