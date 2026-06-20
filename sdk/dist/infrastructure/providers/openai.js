import OpenAI from "openai";
import { ConfigurationError } from "../../domain/errors.js";
import { extractBundleCitations } from "../markdown.js";
export class OpenAIProvider {
    model;
    client;
    constructor(options) {
        const apiKey = typeof options.apiKey === "string" ? options.apiKey.trim() : "";
        if (apiKey === "") {
            throw new ConfigurationError("OpenAIProvider requires a non-empty apiKey.");
        }
        this.model = options.model ?? "gpt-4o-mini";
        this.client = options.client ?? new OpenAI({ apiKey, baseURL: options.baseUrl });
    }
    async generate(request) {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: request.structuredOutput?.type === "json" ? withJsonInstruction(request.messages) : request.messages,
            ...(request.structuredOutput?.type === "json" ? { response_format: { type: "json_object" } } : {}),
        });
        const text = response.choices[0]?.message.content;
        if (typeof text !== "string") {
            throw new ConfigurationError("OpenAI response did not include choices[0].message.content.");
        }
        const citations = extractBundleCitations(text);
        const result = citations.length === 0 ? { text } : { text, citations };
        if (request.structuredOutput?.type === "json") {
            result.json = parseJsonResponse(text, "OpenAI");
        }
        if (response.usage !== undefined) {
            result.usage = {
                inputTokens: response.usage.prompt_tokens ?? 0,
                outputTokens: response.usage.completion_tokens ?? 0,
                totalTokens: response.usage.total_tokens ?? 0,
            };
        }
        return result;
    }
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
