
import { NextRequest } from 'next/server';
import { getJob, getResults } from '@/lib/queue';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return new Response('id required', { status: 400 });
  const job = await getJob(id);
  if (!job) return new Response('not found', { status: 404 });
  const imageUrls = await getResults(id);
  return Response.json({ id: job.id, status: job.status, imageUrls, error: job.error });
}
