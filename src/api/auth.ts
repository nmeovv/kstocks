import {apiRequest, type ApiResult} from './http';
import type {components} from './generated/schema';

type GeneratedAuthenticatedUser = components['schemas']['AuthenticatedUser'];
export type AuthenticatedUser = Omit<
    GeneratedAuthenticatedUser,
    'username' | 'firstName' | 'lastName' | 'avatarUrl'
> & {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
};
type AuthSessionResponse = components['schemas']['AuthSessionResponse'];

export type AuthSession = {authenticated: false; user?: never} | {authenticated: true; user: AuthenticatedUser};

export const getAuthSession = async (): Promise<ApiResult<AuthSession>> => {
    const result = await apiRequest('/api/v1/auth/session');
    if (!result.ok) {
        return result;
    }
    if (!isAuthSessionResponse(result.data)) {
        return {ok: false, kind: 'application'};
    }
    if (!result.data.authenticated) {
        return {ok: true, data: {authenticated: false}};
    }
    if (!result.data.user) {
        return {ok: false, kind: 'application'};
    }
    return {
        ok: true,
        data: {
            authenticated: true,
            user: {
                ...result.data.user,
                username: result.data.user.username ?? null,
                firstName: result.data.user.firstName ?? null,
                lastName: result.data.user.lastName ?? null,
                avatarUrl: result.data.user.avatarUrl ?? null,
            },
        },
    };
};

export const loginWithToken = (token: string): Promise<ApiResult<void>> => {
    return requestWithoutResponse('/api/v1/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
    });
};

export const logoutSession = (): Promise<ApiResult<void>> => {
    return requestWithoutResponse('/logout', {method: 'POST'});
};

const requestWithoutResponse = async (path: string, init: RequestInit): Promise<ApiResult<void>> => {
    const result = await apiRequest(path, init);
    return result.ok ? {ok: true, data: undefined} : result;
};

const isAuthSessionResponse = (value: unknown): value is AuthSessionResponse => {
    if (!isRecord(value) || typeof value.authenticated !== 'boolean') {
        return false;
    }
    if (!value.authenticated) {
        return value.user === undefined;
    }
    return isAuthenticatedUser(value.user);
};

const isAuthenticatedUser = (value: unknown): value is components['schemas']['AuthenticatedUser'] => {
    return (
        isRecord(value) &&
        typeof value.id === 'number' &&
        isOptionalString(value.username) &&
        isOptionalString(value.firstName) &&
        isOptionalString(value.lastName) &&
        isOptionalString(value.avatarUrl)
    );
};

const isOptionalString = (value: unknown) => value === undefined || value === null || typeof value === 'string';

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};
