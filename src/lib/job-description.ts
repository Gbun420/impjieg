const BLOCK_TAGS = /<\/?(p|div|h[1-6]|li|ul|ol|section|article|blockquote|pre|table|tr|td|th|thead|tbody|tfoot)>/gi;
const LINE_BREAK_TAGS = /<\s*br\s*\/?\s*>/gi;
const DANGEROUS_BLOCK_TAGS =
  /<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const DANGEROUS_VOID_TAGS = /<(script|style|iframe|object|embed|svg|math)\b[^>]*\/?\s*>/gi;
const EVENT_HANDLER_ATTRS = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_ATTRS =
  /\s(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi;
const TAGS_REMAINING = /<[^>]+>/g;

function decodeHtmlEntities(value: string) {
  const decodeCodePoint = (raw: string, radix: 10 | 16) => {
    const codePoint = Number.parseInt(raw, radix);
    if (Number.isNaN(codePoint) || codePoint < 0) {
      return "";
    }

    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return "";
    }
  };

  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => decodeCodePoint(hex, 16))
    .replace(/&#(\d+);/g, (_, codePoint: string) => decodeCodePoint(codePoint, 10));
}

function removeDangerousMarkup(value: string) {
  return value
    .replace(DANGEROUS_BLOCK_TAGS, " ")
    .replace(DANGEROUS_VOID_TAGS, " ")
    .replace(EVENT_HANDLER_ATTRS, " ")
    .replace(JAVASCRIPT_URL_ATTRS, " ");
}

export function sanitizeJobDescription(value: string) {
  if (!value) {
    return "";
  }

  let working = value;

  for (let pass = 0; pass < 2; pass += 1) {
    working = decodeHtmlEntities(working);
    working = removeDangerousMarkup(working);
    working = working
      .replace(LINE_BREAK_TAGS, "\n")
      .replace(BLOCK_TAGS, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(TAGS_REMAINING, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }

  return working
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function sanitizeJobDescriptionForMetadata(value: string) {
  return sanitizeJobDescription(value).slice(0, 160);
}
