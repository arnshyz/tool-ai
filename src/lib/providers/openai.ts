
import OpenAI from "openai";
import type { Provider, GenerateParams } from "./index";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const openaiProvider: Provider = {
  name: "openai",
  async generate({ prompt }: GenerateParams) {
    const res = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x768",
    });
    const b64 = res.data[0].b64_json!;
    return `data:image/png;base64,${b64}`;
  }
};
