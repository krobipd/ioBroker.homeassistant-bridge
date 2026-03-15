import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.mjs', 'test/*.ts'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        // Test files use Mocha globals
        files: ['test/**/*.ts'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                after: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
    },
    {
        ignores: ['build/**', 'node_modules/**', 'admin/**', 'scripts/**'],
    },
];
