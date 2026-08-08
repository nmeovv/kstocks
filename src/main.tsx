import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import '@fontsource-variable/baloo-2';

import {App} from '@/app';
import {AuthProvider} from '@/auth/auth-context';
import {AppI18nProvider} from '@/i18n';
import '@/styles/index.css';

const root = document.getElementById('root');

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {staleTime: 30_000},
    },
});

if (!root) {
    throw new Error('Root element not found');
}

createRoot(root).render(
    <StrictMode>
        <AppI18nProvider>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </AppI18nProvider>
    </StrictMode>,
);
