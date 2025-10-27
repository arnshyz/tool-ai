
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { contentId, autoScore = 0.9, autoFlags = [], decision = 'APPROVE' } = await req.json();
  await prisma.$transaction([
    prisma.moderation.upsert({
      where: { contentId },
      update: { autoScore, autoFlags, decision },
      create: { contentId, autoScore, autoFlags, decision }
    }),
    prisma.content.update({
      where: { id: contentId },
      data: {
        status: decision === 'APPROVE' ? 'PUBLISHED' : 'REJECTED',
        publishedAt: decision === 'APPROVE' ? new Date() : null
      }
    })
  ]);
  return new Response('ok');
}
