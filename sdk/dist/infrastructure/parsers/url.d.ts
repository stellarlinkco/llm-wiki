import type { ParserSourceInput } from "../../domain/types.js";
import { type ResolvedParserInput } from "./shared.js";
interface StaticUrlResponse {
    status: number;
    headers: {
        get(name: string): string | null;
    };
    body: Uint8Array;
}
type HostResolver = (hostname: string) => Promise<readonly string[]>;
type StaticUrlRequester = (url: URL, address: string, publicUrl: string) => Promise<StaticUrlResponse>;
export declare function setUrlHostResolverForTesting(resolver: HostResolver): () => void;
export declare function setUrlRequesterForTesting(requester: StaticUrlRequester): () => void;
export declare function fetchUrlInput(input: Extract<ParserSourceInput, {
    kind: "url";
}>): Promise<ResolvedParserInput>;
export {};
