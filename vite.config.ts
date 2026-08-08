import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import {lingui, linguiTransformerBabelPreset} from '@lingui/vite-plugin';
import path from 'node:path';

export default defineConfig({
    plugins: [react(), lingui(), babel({presets: [linguiTransformerBabelPreset()]})],
    server: {
        proxy: {
            '/api': 'http://127.0.0.1:8080',
            '/oauth2': 'http://127.0.0.1:8080',
            '/login': 'http://127.0.0.1:8080',
            '/logout': 'http://127.0.0.1:8080',
        },
    },
    resolve: {
        alias: {'@': path.resolve(import.meta.dirname, 'src')},
    },
});
