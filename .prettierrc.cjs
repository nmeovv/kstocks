module.exports = {
    printWidth: 120,
    tabWidth: 4,
    arrowParens: 'avoid',
    bracketSameLine: false,
    bracketSpacing: false,
    endOfLine: 'lf',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    useTabs: false,

    overrides: [
        {
            files: '*.jsx?',
            options: {
                parser: 'babel',
            },
        },
        {
            files: '*.tsx?',
            options: {
                parser: 'typescript',
            },
        },
        {
            files: '*.json',
            options: {
                parser: 'json',
            },
        },
    ],
};
