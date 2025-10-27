
import { prisma } from '@/lib/prisma';

export default async function ModerationPage() {
  const list = await prisma.content.findMany({ where: { status: 'REVIEW' }, orderBy: { createdAt: 'desc' } });
  async function approve(id: string) {
    'use server';
    await prisma.moderation.upsert({
      where: { contentId: id },
      update: { decision: 'APPROVE' },
      create: { contentId: id, decision: 'APPROVE' }
    });
    await prisma.content.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  }
  async function reject(id: string) {
    'use server';
    await prisma.moderation.upsert({
      where: { contentId: id },
      update: { decision: 'REJECT' },
      create: { contentId: id, decision: 'REJECT' }
    });
    await prisma.content.update({ where: { id }, data: { status: 'REJECTED', publishedAt: null } });
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Moderation Queue</h1>
      <div className="space-y-3">
        {list.map(item => (
          <form key={item.id} className="rounded border p-3">
            <div className="text-sm font-medium">{item.title}</div>
            <div className="text-xs text-gray-500">{item.mime} • {(item.size/1024).toFixed(0)} KB</div>
            <div className="mt-2 flex gap-2">
              <button formAction={approve.bind(null, item.id)} className="rounded bg-green-600 px-3 py-1 text-white">Approve</button>
              <button formAction={reject.bind(null, item.id)} className="rounded bg-red-600 px-3 py-1 text-white">Reject</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
