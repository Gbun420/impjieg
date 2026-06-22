import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal, dependency-free Markdown renderer for blog articles.
 * Supports the controlled subset our posts use: ## / ### headings, paragraphs,
 * - / * bullet lists, 1. ordered lists, **bold**, [links](/path), | tables |,
 * > blockquotes, and --- rules. Server-rendered (good for SEO), brand-styled.
 */

const LINK_CLS =
  "font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 transition-colors hover:text-primary";

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold text-foreground">
          {m[1]}
        </strong>
      );
    } else {
      const label = m[2];
      const href = m[3];
      if (href.startsWith("/")) {
        nodes.push(
          <Link key={`${keyBase}-l${i}`} href={href} className={LINK_CLS}>
            {label}
          </Link>
        );
      } else {
        nodes.push(
          <a key={`${keyBase}-a${i}`} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLS}>
            {label}
          </a>
        );
      }
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      i++;
      continue;
    }
    if (trimmed === "---") {
      blocks.push(<hr key={key++} className="my-8 border-border" />);
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-7 mb-2 text-lg font-bold tracking-tight text-foreground">
          {renderInline(trimmed.slice(4), `h3-${key}`)}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-10 mb-3 text-2xl font-bold tracking-tight text-foreground">
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote key={key++} className="my-5 border-l-4 border-accent bg-muted/50 px-4 py-3 italic text-foreground/80">
          {renderInline(trimmed.slice(2), `q-${key}`)}
        </blockquote>
      );
      i++;
      continue;
    }
    // Table: header row + separator row + body rows
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|[\s:|-]+\|?$/.test(lines[i + 1].trim())
    ) {
      const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim());
      const header = cells(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="my-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/60">
              <tr>
                {header.map((h, hi) => (
                  <th key={hi} className="px-4 py-2.5 text-left font-semibold text-foreground">
                    {renderInline(h, `th-${key}-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-border/60">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-muted-foreground">
                      {renderInline(c, `td-${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^[-*] /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-4 space-y-2">
          {items.map((it, ii) => (
            <li key={ii} className="flex gap-2.5 leading-7 text-muted-foreground">
              <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{renderInline(it, `li-${key}-${ii}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-4 space-y-2">
          {items.map((it, ii) => (
            <li key={ii} className="flex gap-2.5 leading-7 text-muted-foreground">
              <span className="shrink-0 font-bold text-foreground">{ii + 1}.</span>
              <span>{renderInline(it, `ol-${key}-${ii}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    // Paragraph
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{2,3} |[-*] |\d+\. |> |\||---$)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="my-4 leading-7 text-muted-foreground">
        {renderInline(para.join(" "), `p-${key}`)}
      </p>
    );
  }

  return <div className="text-[15px]">{blocks}</div>;
}
