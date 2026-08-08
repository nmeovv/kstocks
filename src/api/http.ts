export type ApiFailure = {
    ok: false;
    kind: 'unauthenticated' | 'forbidden' | 'network' | 'application';
    status?: number;
    body?: unknown;
};

export type ApiResult<T> = {ok: true; data: T} | ApiFailure;

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const apiRequest = async (path: string, init: RequestInit = {}): Promise<ApiResult<unknown>> => {
    const method = (init.method ?? 'GET').toUpperCase();
    const headers = new Headers(init.headers);

    if (MUTATION_METHODS.has(method)) {
        const csrfToken = readCookie('XSRF-TOKEN');
        if (csrfToken) {
            headers.set('X-XSRF-TOKEN', csrfToken);
        }
    }

    try {
        const response = await fetch(path, {...init, method, headers, credentials: 'same-origin'});
        if (response.status === 401) {
            return {ok: false, kind: 'unauthenticated', status: 401};
        }
        if (response.status === 403) {
            return {ok: false, kind: 'forbidden', status: 403};
        }
        if (!response.ok) {
            return {ok: false, kind: 'application', status: response.status, body: await readErrorBody(response)};
        }
        if (response.status === 204) {
            return {ok: true, data: undefined};
        }
        const data: unknown = await response.json();
        return {ok: true, data};
    } catch {
        return {ok: false, kind: 'network'};
    }
};

const readErrorBody = async (response: Response): Promise<unknown> => {
    try {
        return await response.json();
    } catch {
        return undefined;
    }
};

const readCookie = (name: string) => {
    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie.split('; ').find(value => value.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
};
