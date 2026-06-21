import type { OkfFrontmatter, WriteConceptOptions } from "../domain/types.js";
export declare function mergeWriteConceptFrontmatter(existingFrontmatter: OkfFrontmatter, options: WriteConceptOptions, now: string): OkfFrontmatter;
export declare function collectGuardedUpdateFailures(existingFrontmatter: Record<string, unknown>, existingBody: string, nextFrontmatter: Record<string, unknown>, nextBody: string, options: WriteConceptOptions): string[];
export declare function collectSynthesizeGuardedUpdateFailures(existingFrontmatter: Record<string, unknown> | undefined, concept: WriteConceptOptions): string[];
