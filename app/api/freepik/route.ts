import { NextRequest, NextResponse } from "next/server";
import {
  buildFreepikRequest,
  Mode,
  StartParams,
  ToolId
} from "@/lib/freepik";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const mode: Mode = json.mode;
    const tool: ToolId = json.tool;
    const params: StartParams = json.params ?? {};
    const taskId: string | undefined = json.taskId;

    if (!mode || !tool) {
      return NextResponse.json(
        { error: "mode and tool are required" },
        { status: 400 }
      );
    }

    const cfg = buildFreepikRequest(mode, tool, params, taskId);

    const res = await fetch(cfg.url, {
      method: cfg.method,
      headers: cfg.headers,
      body: cfg.body
    });

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        data
      },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Unknown error"
      },
      { status: 500 }
    );
  }
}
