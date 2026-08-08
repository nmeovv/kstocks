import type {Preview} from '@storybook/react-vite';
import '@fontsource-variable/baloo-2';
import {MemoryRouter} from 'react-router-dom';

import {PopupProvider} from '../src/components/ui/popup';
import {AppI18nProvider} from '../src/i18n';
import '../src/styles/index.css';

const withTheme: NonNullable<Preview['decorators']>[number] = (Story, context) => {
    const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;

    return <Story />;
};

const withAppProviders: NonNullable<Preview['decorators']>[number] = Story => {
    return (
        <AppI18nProvider>
            <MemoryRouter>
                <PopupProvider platform="desktop">
                    <Story />
                </PopupProvider>
            </MemoryRouter>
        </AppI18nProvider>
    );
};

const preview: Preview = {
    decorators: [withTheme, withAppProviders],
    globalTypes: {
        theme: {
            description: 'Global color theme',
            toolbar: {
                dynamicTitle: true,
                icon: 'paintbrush',
                items: [
                    {title: 'Light', value: 'light'},
                    {title: 'Dark', value: 'dark'},
                ],
            },
        },
    },
    initialGlobals: {
        theme: 'light',
    },
    parameters: {
        a11y: {
            test: 'todo',
        },
        backgrounds: {
            options: {
                app: {name: 'App canvas', value: '#fff4dd'},
                paper: {name: 'Paper', value: '#fffdf7'},
                ink: {name: 'Ink', value: '#26201a'},
            },
        },
        controls: {
            expanded: true,
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            canvas: {
                sourceState: 'shown',
            },
        },
        options: {
            storySort: {
                order: ['Introduction', 'Foundations', ['Colors', 'Typography'], 'Components'],
            },
        },
    },
};

export default preview;
