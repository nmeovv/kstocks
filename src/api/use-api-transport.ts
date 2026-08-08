import {useCallback} from 'react';

import {useAuth} from '@/auth/auth-context';

import {apiRequest} from './http';

export const useApiTransport = () => {
    const {notifyUnauthenticated} = useAuth();

    const request = useCallback(
        async (path: string, init: RequestInit = {}) => {
            const result = await apiRequest(path, init);
            if (!result.ok && result.kind === 'unauthenticated') {
                notifyUnauthenticated();
            }
            return result;
        },
        [notifyUnauthenticated],
    );

    return {request};
};
