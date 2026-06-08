#!/usr/bin/env node
/**
 * Fixes <Link><Button> nesting to <Button asChild><Link>
 * Run: node scripts/fix-link-button-nesting.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Find all files with the pattern
const files = execSync(
  'rg -l "<Link[^>]*>\\s*<Button" src -g "*.tsx" -g "*.ts"',
  { encoding: "utf-8", cwd: process.cwd() }
).trim().split("\n").filter(Boolean);

console.log(`Found ${files.length} files to fix`);

let totalFixed = 0;

for (const file of files) {
  let content = readFileSync(file, "utf-8");
  let fixed = 0;

  // Pattern: <Link href="..." ...>\n  <Button ...>...</Button>\n</Link>
  // Replace with: <Button asChild ...>\n  <Link href="..." ...>...</Link>\n</Button>
  
  // We need to handle multiple patterns:
  // 1. <Link ...>\n<Button ...>...</Button>\n</Link>
  // 2. <Link ... className="...">\n<Button ...>...</Button>\n</Link>
  // 3. Nested in various ways

  // Use a state machine approach
  const lines = content.split("\n");
  const newLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this line opens a Link that contains a Button on the next line(s)
    const linkMatch = line.match(/^(\s*)<Link\s+([^>]*)>$/);
    if (linkMatch) {
      const indent = linkMatch[1];
      const linkAttrs = linkMatch[2];
      
      // Look ahead for <Button
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      
      if (j < lines.length) {
        const nextLine = lines[j];
        const btnMatch = nextLine.match(/^(\s*)<Button\s+([^>]*)>(.*)$/);
        
        if (btnMatch) {
          const btnIndent = btnMatch[1];
          const btnAttrs = btnMatch[2];
          const btnContent = btnMatch[3];
          
          // Check if Button closes on same line or later
          if (btnContent.includes("</Button>")) {
            // Single line Button: <Button ...>content</Button>
            const innerContent = btnContent.replace("</Button>", "").trim();
            
            // Replace Link attrs: href="..." becomes the Link content
            // Extract href from linkAttrs
            const hrefMatch = linkAttrs.match(/href="([^"]*)"/);
            const href = hrefMatch ? hrefMatch[1] : "";
            const otherLinkAttrs = linkAttrs.replace(/href="[^"]*"/, "").trim();
            
            // Extract Button attrs that aren't variant/size/className/title
            // Add asChild to Button, keep variant/size/className
            let newBtnAttrs = btnAttrs;
            if (!newBtnAttrs.includes("asChild")) {
              newBtnAttrs = "asChild " + newBtnAttrs;
            }
            
            // Check if Link has additional attrs (like className, target)
            let newLinkAttrs = `href="${href}"`;
            if (otherLinkAttrs) {
              // Parse target, className from original Link
              const targetMatch = linkAttrs.match(/target="([^"]*)"/);
              const classNameMatch = linkAttrs.match(/className="([^"]*)"/);
              if (targetMatch) newLinkAttrs += ` target="${targetMatch[1]}"`;
              if (classNameMatch) newLinkAttrs += ` className="${classNameMatch[1]}"`;
            }
            
            // Check for closing </Link> on next line
            let closingLine = j + 1;
            while (closingLine < lines.length && lines[closingLine].trim() === "") closingLine++;
            
            if (closingLine < lines.length && lines[closingLine].trim() === "</Link>") {
              // Multi-line but Button is single line
              newLines.push(`${indent}<Button ${newBtnAttrs.trim()}>`);
              newLines.push(`${indent}  <Link ${newLinkAttrs}>`);
              newLines.push(`${indent}    ${innerContent}`);
              newLines.push(`${indent}  </Link>`);
              newLines.push(`${indent}</Button>`);
              i = closingLine + 1;
              fixed++;
              continue;
            }
          } else {
            // Multi-line Button: find closing </Button>
            let btnEnd = j + 1;
            while (btnEnd < lines.length && !lines[btnEnd].includes("</Button>")) btnEnd++;
            
            if (btnEnd < lines.length) {
              // Check for </Link> after </Button>
              let linkEnd = btnEnd + 1;
              while (linkEnd < lines.length && lines[linkEnd].trim() === "") linkEnd++;
              
              if (linkEnd < lines.length && lines[linkEnd].trim() === "</Link>") {
                const hrefMatch = linkAttrs.match(/href="([^"]*)"/);
                const href = hrefMatch ? hrefMatch[1] : "";
                const otherLinkAttrs = linkAttrs.replace(/href="[^"]*"/, "").trim();
                
                let newBtnAttrs = btnAttrs;
                if (!newBtnAttrs.includes("asChild")) {
                  newBtnAttrs = "asChild " + newBtnAttrs;
                }
                
                let newLinkAttrs = `href="${href}"`;
                if (otherLinkAttrs) {
                  const targetMatch = linkAttrs.match(/target="([^"]*)"/);
                  const classNameMatch = linkAttrs.match(/className="([^"]*)"/);
                  if (targetMatch) newLinkAttrs += ` target="${targetMatch[1]}"`;
                  if (classNameMatch) newLinkAttrs += ` className="${classNameMatch[1]}"`;
                }
                
                // Collect Button content lines
                const btnContentLines = lines.slice(j + 1, btnEnd);
                
                newLines.push(`${indent}<Button ${newBtnAttrs.trim()}>`);
                newLines.push(`${indent}  <Link ${newLinkAttrs}>`);
                for (const bcl of btnContentLines) {
                  newLines.push(`  ${bcl}`);
                }
                newLines.push(`${indent}  </Link>`);
                newLines.push(`${indent}</Button>`);
                i = linkEnd + 1;
                fixed++;
                continue;
              }
            }
          }
        }
      }
    }
    
    newLines.push(line);
    i++;
  }

  if (fixed > 0) {
    writeFileSync(file, newLines.join("\n"));
    console.log(`  Fixed ${fixed} in ${file}`);
    totalFixed += fixed;
  }
}

console.log(`\nTotal fixed: ${totalFixed}`);
