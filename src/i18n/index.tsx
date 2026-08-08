import type {ReactNode} from 'react';
import {i18n} from '@lingui/core';
import {I18nProvider} from '@lingui/react';
import {messages as englishMessages} from '@/i18n/messages/en.po';

i18n.loadAndActivate({locale: 'en', messages: englishMessages});

export {useFormatters} from '@/i18n/formats';

export const AppI18nProvider = ({children}: {children: ReactNode}) => {
    return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};
