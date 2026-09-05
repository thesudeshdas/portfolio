import { randomUUID } from 'node:crypto';

import { type NextRequest, NextResponse } from 'next/server';

import { getAllV2Writings } from '@/lib/v2-writings';

interface IWritingsVisitorRouteProps {
  params: Promise<{ slug: string }>;
}

const VISITOR_COOKIE = 'writings_visitor_id';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: IWritingsVisitorRouteProps
) {
  const { slug } = await params;
  const writings = await getAllV2Writings();

  if (!writings.some((writing) => writing.slug === slug)) {
    return NextResponse.json({ error: 'Writing not found' }, { status: 404 });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Visitor counter is not configured' },
      { status: 503 }
    );
  }

  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId =
    existingVisitorId && UUID_PATTERN.test(existingVisitorId)
      ? existingVisitorId
      : randomUUID();
  const supabaseResponse = await fetch(
    `${supabaseUrl}/rest/v1/rpc/record_writing_visit`,
    {
      body: JSON.stringify({
        p_slug: slug,
        p_visitor_id: visitorId
      }),
      cache: 'no-store',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }
  );

  if (!supabaseResponse.ok) {
    return NextResponse.json(
      { error: 'Unable to record this visit' },
      { status: 502 }
    );
  }

  const ordinal = (await supabaseResponse.json()) as number;
  const response = NextResponse.json({ ordinal });

  if (visitorId !== existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      maxAge: ONE_YEAR_IN_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  return response;
}
