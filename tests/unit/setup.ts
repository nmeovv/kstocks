import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
        addEventListener: () => undefined,
        dispatchEvent: () => false,
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: () => undefined,
    }),
    writable: true,
});

Object.defineProperties(HTMLElement.prototype, {
    hasPointerCapture: {value: () => false},
    releasePointerCapture: {value: () => undefined},
    setPointerCapture: {value: () => undefined},
});

Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => null,
    writable: true,
});

afterEach(cleanup);
