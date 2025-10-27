
import { NextRequest } from 'next/server';
import { enqueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  const { productKeys = [], modelKey, style = 'basic', brief = '' } = await req.json();
  if (!productKeys.length) return new Response('productKeys required', { status: 400 });
  const id = await enqueue({ productKeys, modelKey, style, brief });
  return Response.json({ id, status: 'queued' });
}
