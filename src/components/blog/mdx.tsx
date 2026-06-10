import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

/**
 * Internal links use next/link for client-side navigation; external links
 * open safely in a new tab. Used to map MDX anchors in blog content.
 */
function MdxAnchor({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return <Link href={href}>{children}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  a: MdxAnchor,
};
