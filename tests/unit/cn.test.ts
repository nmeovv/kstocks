import {describe, expect, it} from 'vitest';

import {cn} from '@/lib/cn';

describe('cn', () => {
    it('merges conditional class names', () => {
        expect(cn('card', false && 'hidden', ['featured', {pressed: true}])).toBe('card featured pressed');
    });
});
