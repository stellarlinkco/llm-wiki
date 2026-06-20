export function tokenize(content: string): string[] {
  const matches = content.toLowerCase().match(/\p{Script=Han}+|[\p{L}\p{N}]+/gu);
  if (matches === null) {
    return [];
  }
  return matches.flatMap((match) => isHanRun(match) ? hanNgrams(match) : [match]);
}

function isHanRun(value: string): boolean {
  return /^\p{Script=Han}+$/u.test(value);
}

function hanNgrams(value: string): string[] {
  const chars = Array.from(value);
  if (chars.length <= 1) {
    return chars;
  }
  const tokens: string[] = [];
  for (let size = 2; size <= Math.min(3, chars.length); size += 1) {
    for (let index = 0; index <= chars.length - size; index += 1) {
      tokens.push(chars.slice(index, index + size).join(""));
    }
  }
  return tokens;
}

export function scoreDocument(queryTokens: string[], documentTokens: string[]): number {
  if (documentTokens.length === 0) {
    return 0;
  }
  const counts = new Map<string, number>();
  for (const token of documentTokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  let score = 0;
  for (const token of new Set(queryTokens)) {
    const count = counts.get(token) ?? 0;
    if (count > 0) {
      score += 10 + Math.min(count, 3);
    }
  }
  return score;
}

export function extractSnippet(content: string, queryTokens: string[]): string {
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
