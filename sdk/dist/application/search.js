export function tokenize(content) {
    const matches = content.toLowerCase().match(/\p{Script=Han}+|[\p{L}\p{N}]+/gu);
    if (matches === null) {
        return [];
    }
    return matches.flatMap((match) => isHanRun(match) ? hanNgrams(match) : [match]);
}
function isHanRun(value) {
    return /^\p{Script=Han}+$/u.test(value);
}
function hanNgrams(value) {
    const chars = Array.from(value);
    if (chars.length <= 1) {
        return chars;
    }
    const tokens = [];
    for (let size = 2; size <= Math.min(3, chars.length); size += 1) {
        for (let index = 0; index <= chars.length - size; index += 1) {
            tokens.push(chars.slice(index, index + size).join(""));
        }
    }
    return tokens;
}
export function extractSnippet(content, queryTokens) {
    const plain = content.replace(/---[\s\S]*?---/, "").replace(/\s+/g, " ").trim();
    const lower = plain.toLowerCase();
    let start = 0;
    for (const token of queryTokens) {
        const index = lower.indexOf(token.toLowerCase());
        if (index !== -1) {
            start = Math.max(0, index - 80);
            break;
        }
    }
    return plain.slice(start, start + 300).trim();
}
