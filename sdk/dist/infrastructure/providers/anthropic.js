import Anthropic from "@anthropic-ai/sdk";
import { ConfigurationError } from "../../domain/errors.js";
import { extractBundleCitations } from "../markdown.js";
export class AnthropicProvider {
    model;
    maxTokens;
    client;
    constructor(options) {
        const apiKey = typeof options.apiKey === "string" ? options.apiKey.trim() : "";
        if (apiKey === "") {
            throw new ConfigurationError("AnthropicProvider requires a non-empty apiKey.");
        }
        this.model = options.model ?? "claude-3-5-haiku-latest";
        this.maxTokens = options.maxTokens ?? 1024;
        this.client = options.client ?? new Anthropic({ apiKey });
    }
    async generate(request) {
        const wantsJson = request.structuredOutput?.type === "json";
        const { system, messages } = toAnthropicMessages(wantsJson ? withJsonInstruction(request.messages) : request.messages);
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            ...(system === "" ? {} : { system }),
            messages,
        });
        return buildAnthropicResponse(response, wantsJson);
    }
}
function buildAnthropicResponse(response, wantsJson) {
    const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
    if (text === "") {
        throw new ConfigurationError("Anthropic response did not include text content.");
    }
    const citations = extractBundleCitations(text);
    const result = citations.length === 0 ? { text } : { text, citations };
    if (wantsJson) {
        result.json = parseJsonResponse(text, "Anthropic");
    }
    result.usage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
    return result;
}
function toAnthropicMessages(messages) {
    const system = [];
    const out = [];
    for (const message of messages) {
        if (message.role === "system") {
            system.push(message.content);
        }
        else {
            out.push({ role: message.role, content: message.content });
        }
    }
    return { system: system.join("\n\n"), messages: out };
}
function withJsonInstruction(messages) {
    return [
        { role: "system", content: "Return only valid JSON. Do not include markdown fences or explanatory text." },
        ...messages,
    ];
}
function parseJsonResponse(text, provider) {
    try {
        return JSON.parse(text);
    }
    catch {
        throw new ConfigurationError(`${provider} response did not contain valid JSON.`);
    }
}
