
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

function clsx(...a) { return a.filter(Boolean).join(' '); }

export default function UGCDashboardConnected() {
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [style, setStyle] = useState('basic');
  const [brief, setBrief] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [slots, setSlots] = useState(
    [1,2,3,4].map(i => ({ id: i, title: `UGC Image #${i}`, status: 'idle', url: undefined as string|undefined }))
  );

  const polling = useRef<any>(null);
  const completed = useMemo(() => slots.filter(s => s.status === 'done').length, [slots]);

  async function toSignedUpload(file: File) {
    const { data } = await axios.post('/api/upload-url', { filename: file.name, mime: file.type, size: file.size });
    await axios.put(data.url, file, { headers: { 'Content-Type': file.type } });
    return data.key as string;
  }

  async function handleGenerate() {
    if (!productFiles.length) return;
    const productKeys = await Promise.all(productFiles.map(toSignedUpload));
    const modelKey = modelFile ? await toSignedUpload(modelFile) : undefined;
    const { data } = await axios.post('/api/generate/start', { productKeys, modelKey, style, brief });
    setJobId(data.id);
    polling.current && clearInterval(polling.current);
    polling.current = setInterval(checkStatus, 1200);
    setSlots(prev => prev.map((s, i) => ({ ...s, status: i < productKeys.length ? 'queued' : 'idle' })));
  }

  async function checkStatus() {
    if (!jobId) return;
    const { data } = await axios.get('/api/generate/status', { params: { id: jobId } });
    const { status, imageUrls } = data as { status: string; imageUrls: string[] };
    setSlots(prev => prev.map((s, i) => {
      const url = imageUrls[i];
      let st = s.status as string;
      if (status === 'queued') st = 'queued';
      if (status === 'running') st = i < imageUrls.length ? 'done' : 'running';
      if (status === 'done') st = i < imageUrls.length ? 'done' : 'idle';
      return { ...s, status: st, url };
    }));
    if (status === 'done') { clearInterval(polling.current); }
  }

  useEffect(() => () => { polling.current && clearInterval(polling.current); }, []);

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-slate-50 text-slate-900 lg:grid-cols-[240px_1fr_320px]">
      <aside className="hidden border-r bg-white lg:block">
        <div className="p-4 text-sm font-semibold">UGC Tool</div>
      </aside>
      <main className="p-4 lg:p-6">
        <h1 className="text-xl font-semibold">UGC Prompt Generator</h1>
        <p className="text-sm text-slate-500">{completed}/4 images completed</p>
        <div className="mt-4 space-y-4">
          {slots.map((slot, idx) => (
            <div key={slot.id} className="rounded-lg border bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-b from-fuchsia-500/10 to-indigo-500/10">
                  {slot.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot.url} alt={`img-${idx}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-sm text-slate-600">{slot.status === 'idle' ? `Image ${idx + 1}` : slot.status}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">{slot.title}</div>
                  <div className="text-xs text-slate-500">Status: {slot.status}</div>
                  <div className="mt-3 flex gap-2">
                    <a href={slot.url} target="_blank" className={clsx('rounded px-3 py-2 text-sm', slot.url ? 'bg-black text-white' : 'bg-slate-200 text-slate-500 pointer-events-none')}>Open</a>
                    <a href={slot.url} download className={clsx('rounded px-3 py-2 text-sm', slot.url ? 'border' : 'border opacity-50 pointer-events-none')}>Download</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <aside className="border-l bg-white p-4 lg:p-6">
        <div className="text-sm font-medium">Upload & Settings</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {productFiles.map((f, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
              <button className="absolute right-1 top-1 rounded bg-white/80 px-1 text-xs" onClick={() => setProductFiles(prev => prev.filter((_, idx) => idx !== i))}>x</button>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50">
            <input type="file" multiple accept="image/*" className="hidden" onChange={e => setProductFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
            <span>+</span>
          </label>
        </div>

        <div className="mt-6 text-sm font-medium">Model Image (Optional)</div>
        <label className="mt-2 flex aspect-video cursor-pointer items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50">
          <input type="file" accept="image/*" className="hidden" onChange={e => setModelFile(e.target.files?.[0] || null)} />
          {modelFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={URL.createObjectURL(modelFile)} alt="model" className="h-full w-full object-cover" />
          ) : (<span className="text-xs">Click to upload</span>)}
        </label>

        <div className="mt-6 text-sm">Style</div>
        <select className="mt-1 w-full rounded border p-2 text-sm" value={style} onChange={e => setStyle(e.target.value)}>
          <option value="basic">Basic</option>
          <option value="fashion">Fashion</option>
          <option value="food">Food & Beverage</option>
          <option value="skincare">Skincare</option>
          <option value="tech">Tech/Gadgets</option>
        </select>

        <div className="mt-4 text-sm">Product Brief</div>
        <textarea className="mt-1 w-full rounded border p-2 text-sm" rows={4} value={brief} onChange={e => setBrief(e.target.value)} placeholder="Describe product, target audience, must‑have scenes..." />

        <button className="mt-4 w-full rounded bg-black px-3 py-2 text-sm text-white disabled:bg-slate-300" disabled={!productFiles.length} onClick={handleGenerate}>Generate</button>
      </aside>
    </div>
  );
}
