"use client";

import { useEffect, useMemo, useState } from "react";
import type { ToolId } from "@/lib/freepik";

type FieldType = "text" | "textarea" | "number" | "select";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  acceptsUpload?: boolean;
  helperText?: string;
}

interface ToolConfig {
  id: ToolId;
  label: string;
  group: "image" | "video" | "upscale" | "bg" | "lip-sync";
  fields: Field[];
}

interface HistoryItem {
  id: string;
  tool: string;
  createdAt: string;
  request: Record<string, string>;
  response: any;
}

function collectUrls(payload: any, urls: Set<string>, visited: WeakSet<object>) {
  if (typeof payload === "string") {
    if (/^https?:\/\//.test(payload)) {
      urls.add(payload);
    }
    return;
  }

  if (Array.isArray(payload)) {
    payload.forEach((item) => collectUrls(item, urls, visited));
    return;
  }

  if (payload && typeof payload === "object") {
    if (visited.has(payload)) return;
    visited.add(payload);
    Object.values(payload).forEach((value) => collectUrls(value, urls, visited));
  }
}

function extractUrlsFromResponse(payload: any): string[] {
  if (!payload) return [];
  const urls = new Set<string>();
  const visited = new WeakSet<object>();
  collectUrls(payload, urls, visited);
  return Array.from(urls);
}

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: "gemini",
    label: "Gemini 2.5 Flash",
    group: "image",
    fields: [
      { name: "prompt", label: "Prompt", type: "textarea", placeholder: "Deskripsi gambar..." },
      {
        name: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { label: "Square 1:1", value: "square_1_1" },
          { label: "Portrait 9:16", value: "portrait_9_16" },
          { label: "Landscape 16:9", value: "landscape_16_9" }
        ]
      }
    ]
  },
  {
    id: "imagen3",
    label: "Google Imagen 3",
    group: "image",
    fields: [
      { name: "prompt", label: "Prompt", type: "textarea" },
      {
        name: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { label: "Square 1:1", value: "square_1_1" },
          { label: "Portrait 3:4", value: "portrait_3_4" },
          { label: "Landscape 16:9", value: "landscape_16_9" }
        ]
      }
    ]
  },
  {
    id: "seedream4",
    label: "Seedream 4 (Text-to-Image)",
    group: "image",
    fields: [
      { name: "prompt", label: "Prompt", type: "textarea" },
      {
        name: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { label: "Portrait 9:16", value: "portrait_9_16" },
          { label: "Landscape 16:9", value: "landscape_16_9" },
          { label: "Square 1:1", value: "square_1_1" }
        ]
      }
    ]
  },
  {
    id: "seedream4Edit",
    label: "Seedream 4 Edit (Image-to-Image)",
    group: "image",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        placeholder: "https://...",
        acceptsUpload: true,
        helperText: "Upload gambar atau masukkan URL langsung."
      },
      { name: "prompt", label: "Edit Prompt", type: "textarea" },
      {
        name: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { label: "Square 1:1", value: "square_1_1" },
          { label: "Portrait 9:16", value: "portrait_9_16" },
          { label: "Landscape 16:9", value: "landscape_16_9" }
        ]
      }
    ]
  },
  {
    id: "upscaleCreative",
    label: "Upscaler Creative",
    group: "upscale",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar resolusi tinggi atau masukkan URL."
      },
      { name: "scale", label: "Scale (1-16)", type: "number", placeholder: "2" },
      { name: "prompt", label: "Creative Prompt (opsional)", type: "textarea" }
    ]
  },
  {
    id: "upscalePrecisionV1",
    label: "Upscale Precision V1",
    group: "upscale",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar resolusi tinggi atau masukkan URL."
      },
      { name: "scale", label: "Scale (1-16)", type: "number", placeholder: "2" },
      { name: "prompt", label: "Detail Prompt (opsional)", type: "textarea" }
    ]
  },
  {
    id: "upscalePrecisionV2",
    label: "Upscale Precision V2",
    group: "upscale",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar resolusi tinggi atau masukkan URL."
      },
      { name: "scale", label: "Scale (1-16)", type: "number", placeholder: "2" },
      { name: "prompt", label: "Detail Prompt (opsional)", type: "textarea" }
    ]
  },
  {
    id: "removeBackground",
    label: "Remove Background",
    group: "bg",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar untuk menghapus background atau gunakan URL."
      }
    ]
  },
  {
    id: "klingStd21",
    label: "Kling Std 2.1 (Image-to-Video)",
    group: "video",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar sumber video atau gunakan URL."
      },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "klingV25Pro",
    label: "Kling v2.5 Pro (Image-to-Video)",
    group: "video",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar sumber video atau gunakan URL."
      },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "seedancePro480",
    label: "Seedance Pro 480p",
    group: "video",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar sumber video atau gunakan URL."
      },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "seedancePro720",
    label: "Seedance Pro 720p",
    group: "video",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar sumber video atau gunakan URL."
      },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "seedancePro1080",
    label: "Seedance Pro 1080p",
    group: "video",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar sumber video atau gunakan URL."
      },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "wanV22_480",
    label: "Wan v2.2 480p",
    group: "video",
    fields: [
      {
        name: "image_url",
        label: "Image URL",
        type: "text",
        acceptsUpload: true,
        helperText: "Upload gambar sumber video atau gunakan URL."
      },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "latentSync",
    label: "Latent-Sync (Lip Sync)",
    group: "lip-sync",
    fields: [
      { name: "video_url", label: "Video URL", type: "text", placeholder: "https://video.mp4" },
      { name: "audio_url", label: "Audio URL", type: "text", placeholder: "https://audio.mp3" }
    ]
  }
];

function groupLabel(group: ToolConfig["group"]) {
  switch (group) {
    case "image":
      return "Image Generation";
    case "video":
      return "Image-to-Video";
    case "upscale":
      return "Upscaling";
    case "bg":
      return "Background";
    case "lip-sync":
      return "Lip Sync";
  }
}

export default function Page() {
  const [selectedTool, setSelectedTool] = useState<ToolId>("gemini");
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [uploadedNames, setUploadedNames] = useState<Record<string, string>>({});
  const [showRawResult, setShowRawResult] = useState(false);

  const config = useMemo(
    () => TOOL_CONFIGS.find((t) => t.id === selectedTool)!,
    [selectedTool]
  );

  useEffect(() => {
    const defaults: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.type === "select" && f.options?.length) {
        defaults[f.name] = f.options[0].value;
      }
    });
    setForm(defaults);
    setUploadedNames({});
    setShowRawResult(false);
  }, [config]);

  function handleChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (!value) {
      setUploadedNames((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleUploadFile(name: string, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange(name, reader.result);
        setUploadedNames((prev) => ({ ...prev, [name]: file.name }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function callApi(mode: "start" | "status") {
    setLoading(true);
    setResult(null);
    setShowRawResult(false);

    try {
      const res = await fetch("/api/freepik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          tool: selectedTool,
          params: mode === "start" ? form : undefined,
          taskId: mode === "status" ? taskId : undefined
        })
      });

      const data = await res.json();
      setResult(data);

      const newTaskId =
        data?.data?.data?.task_id ??
        data?.data?.task_id ??
        data?.data?.data?.[0]?.task_id ??
        null;

      if (mode === "start" && newTaskId) {
        setTaskId(newTaskId);
      }

      const hist: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        tool: config.label,
        createdAt: new Date().toLocaleString(),
        request: form,
        response: data
      };
      setHistory((prev) => [hist, ...prev]);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message ?? "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await callApi("start");
  }

  async function handleStatus() {
    if (!taskId) return;
    await callApi("status");
  }

  const generatedUrls = useMemo(() => extractUrlsFromResponse(result), [result]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-[0.3em] text-indigo-300/70">
              Creative Workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              AKAY AI Generator
            </h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Satu dashboard elegan untuk Gemini, Imagen 3, Seedream 4, Upscaler, Kling, Seedance, Wan, dan Latent-Sync. Optimalkan alur kerja generatif Anda dengan preview ringan dan histori yang rapi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-[11px] font-medium text-emerald-300 shadow-inner">
              Role: Admin
            </span>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-1.5 text-[11px] font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800/80"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[260px,1fr]">
          <aside className="space-y-5 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Pilih Model
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Kelompokkan tools berdasarkan jenis workflow.
              </p>
            </div>
            <div className="space-y-4">
              {["image", "video", "upscale", "bg", "lip-sync"].map((grp) => {
                const tools = TOOL_CONFIGS.filter((t) => t.group === grp);
                if (!tools.length) return null;
                return (
                  <div key={grp} className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {groupLabel(grp as any)}
                    </div>
                    <div className="space-y-1.5">
                      {tools.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTool(t.id);
                            setForm({});
                            setResult(null);
                            setTaskId(null);
                            setUploadedNames({});
                          }}
                          className={`group flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
                            selectedTool === t.id
                              ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100 shadow"
                              : "border-transparent bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
                          }`}
                        >
                          <span className="font-medium">{t.label}</span>
                          <span className="text-[10px] text-slate-500 group-hover:text-slate-300">
                            •
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="space-y-6">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-xl shadow-black/20 backdrop-blur md:p-7"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-50">
                    {config.label}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sesuaikan parameter sebelum mengirim tugas ke Freepik API.
                  </p>
                </div>
                {taskId && (
                  <div className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-1 text-[10px] text-slate-300">
                    Last task: <span className="font-mono">{taskId}</span>
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {config.fields.map((f) => {
                  const value = form[f.name] ?? (f.type === "select" ? f.options?.[0]?.value ?? "" : "");
                  return (
                    <div
                      key={f.name}
                      className={
                        f.type === "textarea" ? "md:col-span-2 space-y-2" : "space-y-2"
                      }
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold tracking-wide text-slate-200">
                          {f.label}
                        </label>
                        {uploadedNames[f.name] && (
                          <span className="text-[10px] text-slate-500">
                            {uploadedNames[f.name]}
                          </span>
                        )}
                      </div>
                      {f.type === "textarea" ? (
                        <textarea
                          className="h-28 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                          placeholder={f.placeholder}
                          value={value}
                          onChange={(e) => handleChange(f.name, e.target.value)}
                        />
                      ) : f.type === "select" ? (
                        <div className="relative">
                          <select
                            className="w-full appearance-none rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                            value={value}
                            onChange={(e) => handleChange(f.name, e.target.value)}
                          >
                            {f.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] text-slate-500">
                            ▼
                          </span>
                        </div>
                      ) : (
                        <input
                          className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                          type={f.type === "number" ? "number" : "text"}
                          placeholder={f.placeholder}
                          value={value}
                          onChange={(e) => handleChange(f.name, e.target.value)}
                        />
                      )}
                      {f.acceptsUpload && (
                        <div className="space-y-2 text-[11px] text-slate-400">
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 px-4 py-3 font-medium text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleUploadFile(
                                  f.name,
                                  e.currentTarget.files?.[0] ?? null
                                )
                              }
                            />
                            <span>Upload gambar</span>
                          </label>
                          {f.helperText && (
                            <p className="text-[10px] text-slate-500">
                              {f.helperText}
                            </p>
                          )}
                          {value && value.startsWith("data:image") && (
                            <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/60">
                              <img
                                src={value}
                                alt="Preview upload"
                                className="h-32 w-full object-cover"
                              />
                              <button
                                type="button"
                                className="block w-full bg-slate-900/70 px-3 py-2 text-[10px] text-slate-300 transition hover:text-rose-300"
                                onClick={() => handleChange(f.name, "")}
                              >
                                Hapus upload
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Generate / Submit Task"}
                </button>

                <button
                  type="button"
                  disabled={!taskId || loading}
                  onClick={handleStatus}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cek Status Task
                </button>

                <span className="text-[10px] text-slate-500">
                  Semua panggilan lewat <code className="font-mono text-emerald-300">/api/freepik</code> → Freepik API.
                </span>
              </div>
            </form>

            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-xl shadow-black/20 backdrop-blur md:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Hasil Terakhir
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Preview ringan untuk menjaga performa server.
                  </p>
                </div>
                {result && (
                  <button
                    type="button"
                    onClick={() => setShowRawResult((prev) => !prev)}
                    className="text-[11px] font-medium text-indigo-300 transition hover:text-indigo-200"
                  >
                    {showRawResult ? "Sembunyikan raw JSON" : "Lihat raw JSON"}
                  </button>
                )}
              </div>
              {result == null ? (
                <p className="text-xs text-slate-500">
                  Belum ada output. Kirim request dulu.
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>
                      Status: <span className="font-mono text-slate-200">{String(result.status)}</span>
                    </span>
                    <span>
                      ok: <span className="font-mono text-emerald-300">{String(result.ok ?? result.data?.ok ?? "")}</span>
                    </span>
                    {taskId && (
                      <span>
                        Task ID: <span className="font-mono text-slate-300">{taskId}</span>
                      </span>
                    )}
                  </div>

                  {generatedUrls.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">Preview ({Math.min(generatedUrls.length, 12)})</span>
                        {generatedUrls.length > 12 && (
                          <span className="text-[10px] text-slate-500">
                            Menampilkan 12 dari {generatedUrls.length} file.
                          </span>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {generatedUrls.slice(0, 12).map((url) => (
                          <div
                            key={url}
                            className="group rounded-2xl border border-slate-800/70 bg-slate-950/60 p-3 shadow-sm transition hover:border-indigo-400"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-slate-900">
                              <img
                                src={url}
                                alt="Result preview"
                                loading="lazy"
                                className="h-32 w-full rounded-xl object-cover object-center"
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <a
                                href={url}
                                download
                                className="inline-flex items-center gap-1 rounded-full bg-indigo-500/80 px-3 py-1 text-[10px] font-medium text-white transition hover:bg-indigo-400"
                              >
                                Download
                              </a>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-slate-400 transition hover:text-slate-200"
                              >
                                Buka Tab
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Tidak ada file yang dapat dipreview.
                    </p>
                  )}

                  {showRawResult && (
                    <pre className="max-h-80 overflow-auto rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-[11px] leading-relaxed text-slate-100 shadow-inner">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-xl shadow-black/20 backdrop-blur md:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Queue / History (local)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Semua data tersimpan di browser Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[11px] font-medium text-rose-300 transition hover:text-rose-200"
                >
                  Clear
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-slate-500">
                  History kosong. Setiap request baru akan muncul di sini.
                </p>
              ) : (
                <div className="max-h-96 space-y-4 overflow-auto pr-1 text-[11px]">
                  {history.map((h) => {
                    const historyUrls = extractUrlsFromResponse(h.response).slice(0, 4);
                    return (
                      <div
                        key={h.id}
                        className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-100">
                            {h.tool}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {h.createdAt}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          <span className="font-semibold text-slate-300">Prompt:</span>{" "}
                          <span className="line-clamp-2">
                            {h.request.prompt ?? "-"}
                          </span>
                        </div>
                        {historyUrls.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-wide text-slate-500">
                              Preview
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {historyUrls.map((url) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group relative overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/60"
                                >
                                  <img
                                    src={url}
                                    alt="History preview"
                                    loading="lazy"
                                    className="h-20 w-full object-cover opacity-90 transition group-hover:opacity-100"
                                  />
                                  <span className="absolute bottom-1 right-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] text-slate-200">
                                    Open
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
