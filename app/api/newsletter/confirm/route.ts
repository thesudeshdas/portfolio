import { NextResponse } from 'next/server';

import { verifyNewsletterConfirmationToken } from '@/lib/newsletter';

const RESEND_API_URL = 'https://api.resend.com';

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = formData.get('token');
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim();
  const signingSecret = process.env.NEWSLETTER_SIGNING_SECRET?.trim();

  if (typeof token !== 'string' || !apiKey || !segmentId || !signingSecret) {
    return redirectToStatus(request, 'error');
  }

  const email = verifyNewsletterConfirmationToken(token, signingSecret);

  if (!email) {
    return redirectToStatus(request, 'invalid');
  }

  let result = false;

  try {
    result = await subscribeContact(email, apiKey, segmentId);
  } catch {
    result = false;
  }

  return redirectToStatus(request, result ? 'success' : 'error');
}

async function subscribeContact(
  email: string,
  apiKey: string,
  segmentId: string
) {
  const contactPath = `/contacts/${encodeURIComponent(email)}`;
  const existingContact = await resendRequest(contactPath, apiKey);

  if (existingContact.status === 404) {
    const createdContact = await resendRequest('/contacts', apiKey, {
      body: JSON.stringify({
        email,
        segments: [{ id: segmentId }],
        unsubscribed: false
      }),
      method: 'POST'
    });

    if (createdContact.ok) {
      return true;
    }

    if (createdContact.status !== 409) {
      return false;
    }
  } else if (!existingContact.ok) {
    return false;
  }

  const [updatedContact, addedToSegment] = await Promise.all([
    resendRequest(contactPath, apiKey, {
      body: JSON.stringify({ unsubscribed: false }),
      method: 'PATCH'
    }),
    resendRequest(
      `${contactPath}/segments/${encodeURIComponent(segmentId)}`,
      apiKey,
      { method: 'POST' }
    )
  ]);

  return (
    updatedContact.ok && (addedToSegment.ok || addedToSegment.status === 409)
  );
}

function resendRequest(path: string, apiKey: string, init?: RequestInit) {
  return fetch(`${RESEND_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });
}

function redirectToStatus(request: Request, status: string) {
  const url = new URL('/newsletter/confirmed', request.url);
  url.searchParams.set('status', status);

  return NextResponse.redirect(url, 303);
}
