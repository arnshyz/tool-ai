
export interface GenerateParams { prompt: string; imageUrl?: string; }
export interface Provider {
  name: string;
  generate(params: GenerateParams): Promise<string>;
}
export { openaiProvider } from "./openai";
