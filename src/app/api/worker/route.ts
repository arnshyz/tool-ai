
import { NextRequest } from 'next/server';
import { getJob, popNextJobId, saveJob, pushResult } from '@/lib/queue';
import { openaiProvider } from '@/lib/providers';

const provider = openaiProvider;

export const runtime = 'nodejs';

function makePrompt(style: string, brief: string) {
  const base = 'High quality product photo for ecommerce';
  const map: Record<string,string> = {
    basic: 'clean studio, soft shadows',
    fashion: 'lifestyle outfit, mirror selfie look',
    food: 'ingredients, overhead lighting',
    skincare: 'before after, bathroom counter',
    tech: 'unboxing, size compare on desk'
  };
  return `${base}, ${map[style] || map.basic}. ${brief}`.slice(0, 700);
}

export async function GET(_req: NextRequest) {
  let processed = 0;
  for (let i = 0; i < 4; i++) {
    const id = await popNextJobId();
    if (!id) break;
    const job = await getJob(id);
    if (!job) continue;
    job.status = 'running';
    await saveJob(job);
    try {
      const slots = Math.max(1, Math.min(4, job.productKeys.length || 4));
      const prompt = makePrompt(job.style, job.brief || '');
      for (let k = 0; k < slots; k++) {
        const url = await provider.generate({ prompt });
        await pushResult(job.id, url);
      }
      job.status = 'done';
    } catch (e: any) {
      job.status = 'error';
      job.error = String(e?.message || e);
    }
    await saveJob(job);
    processed++;
  }
  return Response.json({ ok: true, processed });
}
