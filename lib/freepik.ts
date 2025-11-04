const API_BASE = "https://api.freepik.com";

export type ToolId =
  | "gemini"
  | "imagen3"
  | "seedream4"
  | "seedream4Edit"
  | "upscaleCreative"
  | "upscalePrecisionV1"
  | "upscalePrecisionV2"
  | "removeBackground"
  | "klingStd21"
  | "klingV25Pro"
  | "seedancePro480"
  | "seedancePro720"
  | "seedancePro1080"
  | "wanV22_480"
  | "latentSync";

export type Mode = "start" | "status";

export interface StartParams {
  prompt?: string;
  negative_prompt?: string;
  aspect_ratio?: string;
  image_url?: string;
  scale?: string;
  duration?: string;
  video_url?: string;
  audio_url?: string;
}

export interface FreepikRequestConfig {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: string | URLSearchParams;
}

function getHeaders(contentType?: string): Record<string, string> {
  const key = process.env.FREEPIK_API_KEY;
  if (!key) {
    throw new Error("FREEPIK_API_KEY is not set");
  }

  const base: Record<string, string> = {
    "x-freepik-api-key": key
  };

  if (contentType) {
    base["Content-Type"] = contentType;
  }

  return base;
}

export function buildFreepikRequest(
  mode: Mode,
  tool: ToolId,
  params: StartParams,
  taskId?: string
): FreepikRequestConfig {
  let url = "";
  let method: "GET" | "POST" = "POST";
  let headers: Record<string, string> = {};
  let body: any = undefined;

  const prompt = params.prompt ?? "";
  const negativePrompt = params.negative_prompt ?? "";
  const aspectRatio = params.aspect_ratio ?? "square_1_1";
  const imageUrl = params.image_url ?? "";
  const scale = params.scale ? Number(params.scale) : 2;
  const duration = params.duration ? Number(params.duration) : 5;

  switch (tool) {
    case "gemini": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/gemini-2-5-flash-image-preview`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Gemini status");
        url = `${API_BASE}/v1/ai/gemini-2-5-flash-image-preview/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "imagen3": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/text-to-image/imagen3`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Imagen3 status");
        url = `${API_BASE}/v1/ai/text-to-image/imagen3/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "seedream4": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/text-to-image/seedream-v4`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Seedream v4 status");
        url = `${API_BASE}/v1/ai/text-to-image/seedream-v4/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "seedream4Edit": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/text-to-image/seedream-v4-edit`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          prompt,
          image: imageUrl,
          aspect_ratio: aspectRatio
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Seedream v4 edit status");
        url = `${API_BASE}/v1/ai/text-to-image/seedream-v4-edit/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "upscaleCreative": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/image-upscaler`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          image: imageUrl,
          scale,
          prompt
        });
      } else {
        if (!taskId) throw new Error("taskId is required for creative upscaler status");
        url = `${API_BASE}/v1/ai/image-upscaler/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "upscalePrecisionV1": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/image-upscaler-precision`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          image: imageUrl,
          scale,
          prompt
        });
      } else {
        if (!taskId) throw new Error("taskId is required for precision V1 status");
        url = `${API_BASE}/v1/ai/image-upscaler-precision/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "upscalePrecisionV2": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/image-upscaler-precision-v2`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          image: imageUrl,
          scale,
          prompt
        });
      } else {
        if (!taskId) throw new Error("taskId is required for precision V2 status");
        url = `${API_BASE}/v1/ai/image-upscaler-precision-v2/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "removeBackground": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/beta/remove-background`;
        method = "POST";
        const form = new URLSearchParams();
        form.set("image_url", imageUrl);
        headers = getHeaders("application/x-www-form-urlencoded");
        body = form;
      } else {
        throw new Error("Status not supported for removeBackground");
      }
      break;
    }

    case "klingStd21": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/image-to-video/kling-v2-1-std`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          image: imageUrl,
          prompt,
          duration
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Kling Std 2.1 status");
        url = `${API_BASE}/v1/ai/image-to-video/kling-v2-1-std/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "klingV25Pro": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/image-to-video/kling-v2-5-pro`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          images: [imageUrl],
          prompt,
          duration
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Kling v2.5 Pro status");
        url = `${API_BASE}/v1/ai/image-to-video/kling-v2-5-pro/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "seedancePro480":
    case "seedancePro720":
    case "seedancePro1080": {
      const quality =
        tool === "seedancePro480"
          ? "480p"
          : tool === "seedancePro720"
          ? "720p"
          : "1080p";

      const basePath = `/v1/ai/image-to-video/seedance-pro-${quality}`;

      if (mode === "start") {
        url = `${API_BASE}${basePath}`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          image: imageUrl,
          prompt,
          duration
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Seedance Pro status");
        url = `${API_BASE}${basePath}/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "wanV22_480": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/image-to-video/wan-v2-2-480p`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          image: imageUrl,
          prompt,
          duration
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Wan v2.2 480p status");
        url = `${API_BASE}/v1/ai/image-to-video/wan-v2-2-480p/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    case "latentSync": {
      if (mode === "start") {
        url = `${API_BASE}/v1/ai/lip-sync/latent-sync`;
        method = "POST";
        headers = getHeaders("application/json");
        body = JSON.stringify({
          video_url: params.video_url,
          audio_url: params.audio_url
        });
      } else {
        if (!taskId) throw new Error("taskId is required for Latent-Sync status");
        url = `${API_BASE}/v1/ai/lip-sync/latent-sync/${taskId}`;
        method = "GET";
        headers = getHeaders();
      }
      break;
    }

    default:
      throw new Error("Unsupported tool");
  }

  return { url, method, headers, body };
}
