
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function Home() {
  const items = await prisma.content.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 24
  });

  const cdn = process.env.PUBLIC_CDN_DOMAIN;

  return (
    <main className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {items.map(i => (
        <a key={i.id} href={`#`} className="block rounded-lg border p-2">
          {i.type === 'IMAGE' && (
            <Image
              src={cdn ? `https://${cdn}/${i.fileKey}` : `/api/proxy/${i.fileKey}`}
              alt={i.title}
              width={480}
              height={360}
              className="h-auto w-full rounded"
            />
          )}
          <div className="mt-2 text-sm">{i.title}</div>
        </a>
      ))}
    </main>
  );
}
