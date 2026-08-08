import {mergeConfig} from 'vite';
import {defineConfig} from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            setupFiles: ['./tests/unit/setup.ts'],
            include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
        },
    }),
);
