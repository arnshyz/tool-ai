
import { redis } from "./redis";
import type { UGCJob } from "./types";

const JOBS = "ugc:jobs";
const QUEUE = "ugc:queue";
const RESULT = "ugc:result:";

export async function enqueue(job: Omit<UGCJob, "id" | "createdAt" | "status" | "imageUrls">) {
  const id = crypto.randomUUID();
  const payload: UGCJob = { id, createdAt: Date.now(), status: "queued", imageUrls: [], ...job };
  await redis.hset(JOBS, { [id]: JSON.stringify(payload) });
  await redis.lpush(QUEUE, id);
  return id;
}

export async function getJob(id: string) {
  const raw = await redis.hget<string>(JOBS, id);
  return raw ? (JSON.parse(raw) as UGCJob) : null;
}

export async function saveJob(job: UGCJob) {
  await redis.hset(JOBS, { [job.id]: JSON.stringify(job) });
}

export async function pushResult(id: string, url: string) {
  await redis.rpush(RESULT + id, url);
}

export async function getResults(id: string) {
  return (await redis.lrange<string>(RESULT + id, 0, -1)) || [];
}

export async function popNextJobId() {
  return await redis.rpop<string>(QUEUE);
}
