import { put, get } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  try {
    const pathname = `cache/${key}.json`;
    const result = await get(pathname, { access: 'private' });

    if (result) {
      const str = await new Response(result.stream).text();
      return NextResponse.json({ data: JSON.parse(str) });
    }
  } catch (e) {
    console.error('Error fetching from Vercel Private Blob:', e);
  }

  return NextResponse.json({ data: null });
}

export async function POST(request: Request) {
  try {
    const { key, data } = await request.json();

    if (!key || !data) return NextResponse.json({ error: 'Missing key or data' }, { status: 400 });

    const blob = await put(`cache/${key}.json`, JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json(blob);
  } catch (e) {
    console.error('Error writing to Vercel Private Blob:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

