
import { prisma } from '@/lib/prisma';
import slugify from '@sindresorhus/slugify';
import { CompleteSchema } from '@/lib/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, key, mime, size, width, height, type } = CompleteSchema.parse(body);

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2,7)}`;

  const content = await prisma.content.create({
    data: {
      ownerId: 'anonymous',
      title,
      slug,
      type,
      fileKey: key,
      mime,
      size,
      width,
      height,
      status: 'REVIEW'
    }
  });

  return Response.json({ id: content.id, slug: content.slug });
}
