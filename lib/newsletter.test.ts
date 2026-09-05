import { describe, expect, it } from 'vitest';

import {
  createNewsletterConfirmationToken,
  normalizeNewsletterEmail,
  renderNewsletterConfirmationHtml,
  verifyNewsletterConfirmationToken
} from './newsletter';

describe('newsletter helpers', () => {
  it('normalizes valid email addresses', () => {
    expect(normalizeNewsletterEmail('  Reader@Example.com ')).toBe(
      'reader@example.com'
    );
  });

  it('rejects invalid email addresses', () => {
    expect(normalizeNewsletterEmail('not-an-email')).toBeNull();
    expect(normalizeNewsletterEmail('')).toBeNull();
  });

  it('creates and verifies a confirmation token', () => {
    const now = 1_800_000_000_000;
    const token = createNewsletterConfirmationToken(
      'reader@example.com',
      'test-secret',
      now
    );

    expect(verifyNewsletterConfirmationToken(token, 'test-secret', now)).toBe(
      'reader@example.com'
    );
  });

  it('rejects expired and modified confirmation tokens', () => {
    const now = 1_800_000_000_000;
    const token = createNewsletterConfirmationToken(
      'reader@example.com',
      'test-secret',
      now
    );

    expect(
      verifyNewsletterConfirmationToken(token, 'test-secret', now + 86_400_001)
    ).toBeNull();
    expect(
      verifyNewsletterConfirmationToken(`${token}changed`, 'test-secret', now)
    ).toBeNull();
  });

  it('escapes the confirmation URL in the HTML email', () => {
    const html = renderNewsletterConfirmationHtml(
      'https://example.com/confirm?token=a&source="email"'
    );

    expect(html).toContain('a&amp;source=&quot;email&quot;');
    expect(html).not.toContain('source="email"');
  });
});
