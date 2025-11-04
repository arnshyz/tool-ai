"use client";

import { useMemo, useState } from "react";
import type { ToolId } from "@/lib/freepik";

type FieldType = "text" | "textarea" | "number";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type: FieldType;
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

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: "gemini",
    label: "Gemini 2.5 Flash",
    group: "image",
    fields: [
      { name: "prompt", label: "Prompt", type: "textarea", placeholder: "Deskripsi gambar..." },
      { name: "aspect_ratio", label: "Aspect Ratio", type: "text", placeholder: "mis: square_1_1, portrait_9_16" }
    ]
  },
  {
    id: "imagen3",
    label: "Google Imagen 3",
    group: "image",
    fields: [
      { name: "prompt", label: "Prompt", type: "textarea" },
      { name: "aspect_ratio", label: "Aspect Ratio", type: "text", placeholder: "square_1_1" }
    ]
  },
  {
    id: "seedream4",
    label: "Seedream 4 (Text-to-Image)",
    group: "image",
    fields: [
      { name: "prompt", label: "Prompt", type: "textarea" },
      { name: "aspect_ratio", label: "Aspect Ratio", type: "text", placeholder: "landscape_16_9, portrait_9_16" }
    ]
  },
  {
    id: "seedream4Edit",
    label: "Seedream 4 Edit (Image-to-Image)",
    group: "image",
    fields: [
      { name: "image_url", label: "Image URL", type: "text", placeholder: "https://..." },
      { name: "prompt", label: "Edit Prompt", type: "textarea" },
      { name: "aspect_ratio", label: "Aspect Ratio", type: "text", placeholder: "square_1_1" }
    ]
  },
  {
    id: "upscaleCreative",
    label: "Upscaler Creative",
    group: "upscale",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "scale", label: "Scale (1-16)", type: "number", placeholder: "2" },
      { name: "prompt", label: "Creative Prompt (opsional)", type: "textarea" }
    ]
  },
  {
    id: "upscalePrecisionV1",
    label: "Upscale Precision V1",
    group: "upscale",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "scale", label: "Scale (1-16)", type: "number", placeholder: "2" },
      { name: "prompt", label: "Detail Prompt (opsional)", type: "textarea" }
    ]
  },
  {
    id: "upscalePrecisionV2",
    label: "Upscale Precision V2",
    group: "upscale",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "scale", label: "Scale (1-16)", type: "number", placeholder: "2" },
      { name: "prompt", label: "Detail Prompt (opsional)", type: "textarea" }
    ]
  },
  {
    id: "removeBackground",
    label: "Remove Background",
    group: "bg",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" }
    ]
  },
  {
    id: "klingStd21",
    label: "Kling Std 2.1 (Image-to-Video)",
    group: "video",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "klingV25Pro",
    label: "Kling v2.5 Pro (Image-to-Video)",
    group: "video",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "seedancePro480",
    label: "Seedance Pro 480p",
    group: "video",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "seedancePro720",
    label: "Seedance Pro 720p",
    group: "video",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "seedancePro1080",
    label: "Seedance Pro 1080p",
    group: "video",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
      { name: "prompt", label: "Motion Prompt", type: "textarea" },
      { name: "duration", label: "Duration (detik)", type: "number", placeholder: "5" }
    ]
  },
  {
    id: "wanV22_480",
    label: "Wan v2.2 480p",
    group: "video",
    fields: [
      { name: "image_url", label: "Image URL", type: "text" },
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

  const config = useMemo(
    () => TOOL_CONFIGS.find((t) => t.id === selectedTool)!,
    [selectedTool]
  );

  function handleChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function callApi(mode: "start" | "status") {
    setLoading(true);
    setResult(null);

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              AKAY AI GENERATOR
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Satu dashboard untuk Gemini, Imagen3, Seedream 4, Upscaler, Kling, Seedance, Wan, dan Latent-Sync (Freepik API).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300">
              Role: Admin
            </span>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[260px,1fr]">
          <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-sm font-medium text-slate-200">
              Pilih Model
            </h2>
            <div className="space-y-3">
              {["image", "video", "upscale", "bg", "lip-sync"].map((grp) => {
                const tools = TOOL_CONFIGS.filter((t) => t.group === grp);
                if (!tools.length) return null;
                return (
                  <div key={grp}>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {groupLabel(grp as any)}
                    </div>
                    <div className="space-y-1">
                      {tools.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTool(t.id);
                            setForm({});
                            setResult(null);
                            setTaskId(null);
                          }}
                          className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                            selectedTool === t.id
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {t.label}
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
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    {config.label}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Konfigurasi request untuk model ini.
                  </p>
                </div>
                {taskId && (
                  <div className="rounded-full bg-slate-800 px-3 py-1 text-[10px] text-slate-300">
                    Last task: <span className="font-mono">{taskId}</span>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {config.fields.map((f) => (
                  <div
                    key={f.name}
                    className={
                      f.type === "textarea" ? "md:col-span-2" : "col-span-1"
                    }
                  >
                    <label className="mb-1 block text-xs font-medium text-slate-200">
                      {f.label}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        className="h-28 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                        placeholder={f.placeholder}
                        value={form[f.name] ?? ""}
                        onChange={(e) =>
                          handleChange(f.name, e.target.value)
                        }
                      />
                    ) : (
                      <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                        type={f.type === "number" ? "number" : "text"}
                        placeholder={f.placeholder}
                        value={form[f.name] ?? ""}
                        onChange={(e) =>
                          handleChange(f.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Generate / Submit Task"}
                </button>

                <button
                  type="button"
                  disabled={!taskId || loading}
                  onClick={handleStatus}
                  className="rounded-full border border-slate-600 px-4 py-2 text-xs text-slate-200 disabled:opacity-40"
                >
                  Cek Status Task
                </button>

                <span className="text-[10px] text-slate-500">
                  Semua panggilan lewat /api/freepik → Freepik API.
                </span>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-100">
                Hasil Terakhir
              </h2>
              {result == null ? (
                <p className="text-xs text-slate-500">
                  Belum ada output. Kirim request dulu.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400">
                    Status:{" "}
                    <span className="font-mono">
                      {String(result.status)} | ok:{" "}
                      {String(result.ok ?? result.data?.ok ?? "")}
                    </span>
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950/70 p-3 text-[11px] text-slate-100">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  Queue / History (local)
                </h2>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-slate-500">
                  History kosong. Setiap request baru akan muncul di sini.
                </p>
              ) : (
                <div className="max-h-80 space-y-3 overflow-auto text-[11px]">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-lg border border-slate-700 bg-slate-950/60 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-slate-100">
                          {h.tool}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {h.createdAt}
                        </span>
                      </div>
                      <div className="mb-1 text-slate-400">
                        <span className="font-semibold">Prompt:</span>{" "}
                        <span className="line-clamp-2">
                          {h.request.prompt ?? "-"}
                        </span>
                      </div>
                      {h.response?.data?.data?.generated && (
                        <div className="mt-1 space-y-1">
                          <div className="font-semibold text-slate-300">
                            Generated URLs:
                          </div>
                          <ul className="list-disc pl-4">
                            {(h.response.data.data.generated as string[]).map(
                              (u) => (
                                <li key={u} className="truncate text-cyan-300">
                                  <a
                                    href={u}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {u}
                                  </a>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
