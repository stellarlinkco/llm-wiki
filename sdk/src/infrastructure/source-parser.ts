import type { ParserSourceInput, ParsedSource, SourceParser } from "../domain/types.js";
import { CompositeSourceParser } from "./parsers/composite.js";

export class DefaultSourceParser implements SourceParser {
  private readonly parser = new CompositeSourceParser();

  async parse(input: string | ParserSourceInput): Promise<ParsedSource> {
    return await this.parser.parse(input);
  }
}
