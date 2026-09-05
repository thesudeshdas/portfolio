import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

import {
  createNewsletterConfirmationToken,
  normalizeNewsletterEmail,
  renderNewsletterConfirmationHtml
} from '@/lib/newsletter';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const CONFIRMATION_COOLDOWN_MS = 60 * 1000;
const confirmationRequests = new Map<string, number>();

interface ISubscribeRequest {
  email?: unknown;
  website?: unknown;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { message: 'Request not allowed.' },
      { status: 403 }
    );
  }

  let body: ISubscribeRequest;

  try {
    body = (await request.json()) as ISubscribeRequest;
  } catch {
    return NextResponse.json(
      { message: 'Enter a valid email address.' },
      { status: 400 }
    );
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ message: 'Check your inbox to confirm.' });
  }

  const email = normalizeNewsletterEmail(body.email);

  if (!email) {
    return NextResponse.json(
      { message: 'Enter a valid email address.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const signingSecret = process.env.NEWSLETTER_SIGNING_SECRET?.trim();

  if (!apiKey || !from || !signingSecret) {
    return NextResponse.json(
      { message: 'Subscriptions are temporarily unavailable.' },
      { status: 503 }
    );
  }

  if (isCoolingDown(email)) {
    return NextResponse.json({ message: 'Check your inbox to confirm.' });
  }

  const token = createNewsletterConfirmationToken(email, signingSecret);
  const confirmationUrl = new URL('/newsletter/confirm', request.url);
  confirmationUrl.searchParams.set('token', token);

  try {
    const resendResponse = await fetch(RESEND_EMAILS_URL, {
      body: JSON.stringify({
        from,
        html: renderNewsletterConfirmationHtml(confirmationUrl.toString()),
        subject: 'Confirm your subscription',
        text: `Confirm your subscription: ${confirmationUrl.toString()}`,
        to: [email]
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': createIdempotencyKey(email)
      },
      method: 'POST'
    });

    if (resendResponse.ok) {
      return NextResponse.json({ message: 'Check your inbox to confirm.' });
    }
  } catch {
    // The generic response below keeps provider details server-side.
  }

  confirmationRequests.delete(email);

  return NextResponse.json(
    { message: 'Something went wrong. Please try again.' },
    { status: 502 }
  );
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin');

  return origin === null || origin === new URL(request.url).origin;
}

function isCoolingDown(email: string) {
  const now = Date.now();
  const lastRequest = confirmationRequests.get(email);

  if (lastRequest && now - lastRequest < CONFIRMATION_COOLDOWN_MS) {
    return true;
  }

  if (confirmationRequests.size >= 1000) {
    confirmationRequests.clear();
  }

  confirmationRequests.set(email, now);
  return false;
}

function createIdempotencyKey(email: string) {
  const minuteBucket = Math.floor(Date.now() / CONFIRMATION_COOLDOWN_MS);

  return createHash('sha256')
    .update(`newsletter-confirmation:${email}:${minuteBucket}`)
    .digest('hex');
}
