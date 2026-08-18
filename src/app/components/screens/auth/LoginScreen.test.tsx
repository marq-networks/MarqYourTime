import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('does not present prototype credentials as production login instructions', () => {
    const markup = renderToStaticMarkup(<LoginScreen onLogin={vi.fn()} />);
    expect(markup).not.toContain('platform@workos.io');
    expect(markup).not.toContain('platform123');
    expect(markup).not.toContain('Demo Credentials');
  });
});
