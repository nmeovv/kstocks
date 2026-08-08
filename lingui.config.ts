import {defineConfig} from '@lingui/cli';
import {formatter} from '@lingui/format-po';

export default defineConfig({
    sourceLocale: 'en',
    locales: ['en', 'pseudo'],
    pseudoLocale: 'pseudo',
    catalogs: [
        {
            path: '<rootDir>/src/i18n/messages/{locale}',
            include: ['src'],
            exclude: ['**/node_modules/**'],
        },
    ],
    format: formatter({lineNumbers: false}),
    orderBy: 'message',
});
