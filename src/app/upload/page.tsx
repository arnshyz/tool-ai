
'use client';
import { useState } from 'react';
import axios from 'axios';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState<number>(0);

  async function handleUpload() {
    if (!file) return;
    const { data: up } = await axios.post('/api/upload-url', {
      filename: file.name,
      mime: file.type,
      size: file.size
    });

    await axios.put(up.url, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: e => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
    });

    const type = file.type.startsWith('image') ? 'IMAGE' : file.type.startsWith('video') ? 'VIDEO' : 'TEXT';

    await axios.post('/api/content/complete', {
      title: title || file.name,
      key: up.key,
      mime: file.type,
      size: file.size,
      type
    });
    alert('Uploaded. Masuk antrean moderasi.');
    setFile(null); setTitle(''); setProgress(0);
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Upload Konten</h1>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <input className="mt-3 w-full rounded border p-2" placeholder="Judul" value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={handleUpload} className="mt-3 rounded bg-black px-3 py-2 text-white">Upload</button>
      {progress > 0 && <div className="mt-2 text-sm">Progress: {progress}%</div>}
    </div>
  );
}
