
import { getUploadUrl } from '@/lib/storage';
import { RequestUploadSchema } from '@/lib/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const { filename, mime, size } = RequestUploadSchema.parse(body);
  const key = `uploads/${crypto.randomUUID()}-${filename}`;
  const url = await getUploadUrl(key, mime);
  return Response.json({ url, key });
}
