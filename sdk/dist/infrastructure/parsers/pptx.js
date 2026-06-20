import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as PptxParserModule from "node-pptx-parser";
import { ParserError } from "../../domain/errors.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";
const PPTX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const PptxParser = (PptxParserModule.default ?? PptxParserModule);
export class PptxSourceParser {
    name = "pptx";
    supports(input) {
        const contentType = mediaType(input);
        if (hasKnownMediaType(contentType)) {
            return contentType === PPTX_CONTENT_TYPE;
        }
        return extension(input) === ".pptx";
    }
    async parse(input) {
        let tempDir;
        try {
            let sourcePath = input.path;
            if (sourcePath === undefined) {
                tempDir = await mkdtemp(join(tmpdir(), "llm-wiki-pptx-"));
                sourcePath = join(tempDir, "source.pptx");
                await writeFile(sourcePath, input.bytes);
            }
            const parser = new PptxParser(sourcePath);
            const slides = await parser.extractText();
            const sections = slides.flatMap((slide, index) => {
                const lines = slide.text
                    .map((line) => line.trim())
                    .filter((line) => line !== "");
                return lines.length === 0 ? [] : [`## Slide ${index + 1}`, ...lines];
            });
            return parsedMarkdown(input, this.name, sourceName(input), sections.join("\n\n"));
        }
        catch (error) {
            if (error instanceof ParserError) {
                throw error;
            }
            throw new ParserError("PARSE_FAILED", `PPTX parsing failed: ${error instanceof Error ? error.message : String(error)}`, sourceContext(input));
        }
        finally {
            if (tempDir !== undefined) {
                await rm(tempDir, { force: true, recursive: true });
            }
        }
    }
}
