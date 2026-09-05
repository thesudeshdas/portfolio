import { createHmac, timingSafeEqual } from 'node:crypto';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const MAX_EMAIL_LENGTH = 254;

interface INewsletterTokenPayload {
  email: string;
  expiresAt: number;
}

export function normalizeNewsletterEmail(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const email = value.trim().toLowerCase();

  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    return null;
  }

  return email;
}

export function createNewsletterConfirmationToken(
  email: string,
  secret: string,
  now = Date.now()
) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      expiresAt: now + TOKEN_LIFETIME_MS
    } satisfies INewsletterTokenPayload)
  ).toString('base64url');
  const signature = signPayload(payload, secret);

  return `${payload}.${signature}`;
}

export function verifyNewsletterConfirmationToken(
  token: string,
  secret: string,
  now = Date.now()
) {
  const [payload, signature, extraPart] = token.split('.');

  if (!payload || !signature || extraPart) {
    return null;
  }

  const expectedSignature = signPayload(payload, secret);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as Partial<INewsletterTokenPayload>;
    const email = normalizeNewsletterEmail(parsed.email);

    if (
      !email ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= now
    ) {
      return null;
    }

    return email;
  } catch {
    return null;
  }
}

export function renderNewsletterConfirmationHtml(confirmationUrl: string) {
  const safeConfirmationUrl = escapeHtml(confirmationUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirm your subscription</title>
  </head>
  <body style="margin:0;background:#f4f4f1;color:#18181b;font-family:Arial,sans-serif;">
    <div style="margin:0 auto;max-width:560px;padding:64px 24px;">
      <p style="margin:0 0 20px;color:#71717a;font-size:14px;line-height:1.6;">Hey, Who Is Dash?</p>
      <h1 style="margin:0 0 20px;font-size:38px;font-weight:300;letter-spacing:-1.5px;line-height:1.05;">Confirm your subscription</h1>
      <p style="margin:0 0 32px;color:#3f3f46;font-size:16px;line-height:1.7;">One more step, then new writing will arrive in your inbox.</p>
      <a href="${safeConfirmationUrl}" style="display:inline-block;background:#18181b;color:#fafaf8;padding:13px 20px;text-decoration:none;font-size:15px;line-height:1.2;">Confirm subscription</a>
      <p style="margin:32px 0 0;color:#71717a;font-size:13px;line-height:1.7;">If you did not request this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}

function signPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
