import OpenAI from "openai";
import { ConfigurationError } from "../../domain/errors.js";
import type { LLMProvider, LLMRequest, LLMResponse, OpenAIProviderOptions } from "../../domain/types.js";
import { extractBundleCitations } from "../markdown.js";

export class OpenAIProvider implements LLMProvider {
  private readonly model: string;
  private readonly client: OpenAI;

  constructor(options: OpenAIProviderOptions) {
    const apiKey = typeof options.apiKey === "string" ? options.apiKey.trim() : "";
    if (apiKey === "") {
      throw new ConfigurationError("OpenAIProvider requires a non-empty apiKey.");
    }
    this.model = options.model ?? "gpt-4o-mini";
    this.client = (options.client as OpenAI | undefined) ?? new OpenAI({ apiKey, baseURL: options.baseUrl });
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const wantsJson = request.structuredOutput?.type === "json";
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: wantsJson ? withJsonInstruction(request.messages) : request.messages,
      ...(wantsJson ? { response_format: { type: "json_object" as const } } : {}),
    });
    return buildOpenAiResponse(response, wantsJson);
  }
}

function buildOpenAiResponse(response: OpenAI.Chat.Completions.ChatCompletion, wantsJson: boolean): LLMResponse {
  const text = response.choices[0]?.message.content;
  if (typeof text !== "string") {
    throw new ConfigurationError("OpenAI response did not include choices[0].message.content.");
  }

  const citations = extractBundleCitations(text);
  const result: LLMResponse = citations.length === 0 ? { text } : { text, citations };
  if (wantsJson) {
    result.json = parseJsonResponse(text, "OpenAI");
  }
  if (response.usage !== undefined) {
    result.usage = {
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }
  return result;
}

function withJsonInstruction(messages: LLMRequest["messages"]): LLMRequest["messages"] {
  return [
    { role: "system", content: "Return only valid JSON. Do not include markdown fences or explanatory text." },
    ...messages,
  ];
}

function parseJsonResponse(text: string, provider: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new ConfigurationError(`${provider} response did not contain valid JSON.`);
  }
}
