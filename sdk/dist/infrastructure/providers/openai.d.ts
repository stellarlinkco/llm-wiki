import type { LLMProvider, LLMRequest, LLMResponse, OpenAIProviderOptions } from "../../domain/types.js";
export declare class OpenAIProvider implements LLMProvider {
    private readonly model;
    private readonly client;
    constructor(options: OpenAIProviderOptions);
    generate(request: LLMRequest): Promise<LLMResponse>;
}
