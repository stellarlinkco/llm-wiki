import type { AnthropicProviderOptions, LLMProvider, LLMRequest, LLMResponse } from "../../domain/types.js";
export declare class AnthropicProvider implements LLMProvider {
    private readonly model;
    private readonly maxTokens;
    private readonly client;
    constructor(options: AnthropicProviderOptions);
    generate(request: LLMRequest): Promise<LLMResponse>;
}
