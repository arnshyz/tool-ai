
export type JobStatus = 'queued' | 'running' | 'done' | 'error';
export interface UGCJob {
  id: string;
  createdAt: number;
  productKeys: string[];
  modelKey?: string;
  style: string;
  brief?: string;
  imageUrls: string[];
  status: JobStatus;
  error?: string;
}
