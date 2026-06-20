import { CompositeSourceParser } from "./parsers/composite.js";
export class DefaultSourceParser {
    parser = new CompositeSourceParser();
    async parse(input) {
        return await this.parser.parse(input);
    }
}
