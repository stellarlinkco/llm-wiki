import Anthropic from "@anthropic-ai/sdk";
import { ConfigurationError } from "../../domain/errors.js";
import type { AnthropicProviderOptions, LLMMessage, LLMProvider, LLMRequest, LLMResponse } from "../../domain/types.js";
import { extractBundleCitations } from "../markdown.js";

export class AnthropicProvider implements LLMProvider {
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly client: Anthropic;

  constructor(options: AnthropicProviderOptions) {
    const apiKey = typeof options.apiKey === "string" ? options.apiKey.trim() : "";
    if (apiKey === "") {
      throw new ConfigurationError("AnthropicProvider requires a non-empty apiKey.");
    }
    this.model = options.model ?? "claude-3-5-haiku-latest";
    this.maxTokens = options.maxTokens ?? 1024;
    this.client = (options.client as Anthropic | undefined) ?? new Anthropic({ apiKey });
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const wantsJson = request.structuredOutput?.type === "json";
    const { system, messages } = toAnthropicMessages(
      wantsJson ? withJsonInstruction(request.messages) : request.messages,
    );
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      ...(system === "" ? {} : { system }),
      messages,
    });
    return buildAnthropicResponse(response, wantsJson);
  }
}

type AnthropicMessage = Parameters<Anthropic["messages"]["create"]>[0]["messages"][number];

function buildAnthropicResponse(response: Anthropic.Messages.Message, wantsJson: boolean): LLMResponse {
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (text === "") {
    throw new ConfigurationError("Anthropic response did not include text content.");
  }

  const citations = extractBundleCitations(text);
  const result: LLMResponse = citations.length === 0 ? { text } : { text, citations };
  if (wantsJson) {
    result.json = parseJsonResponse(text, "Anthropic");
  }
  result.usage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
  return result;
}

function toAnthropicMessages(messages: LLMMessage[]): { system: string; messages: AnthropicMessage[] } {
  const system: string[] = [];
  const out: AnthropicMessage[] = [];
  for (const message of messages) {
    if (message.role === "system") {
      system.push(message.content);
    } else {
      out.push({ role: message.role, content: message.content });
    }
  }
  return { system: system.join("\n\n"), messages: out };
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
