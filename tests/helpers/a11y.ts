import { expect, type Page } from '@playwright/test';

type AxeNodeResult = {
  target: string[];
  html: string;
  failureSummary: string | null;
};

type AxeViolation = {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNodeResult[];
};

type AxeResults = {
  violations: AxeViolation[];
};

/**
 * Runs axe-core on the current page and asserts that no WCAG 2.1 AA violations exist.
 * Fails the test with a detailed JSON report when violations are found.
 */
export async function checkA11y(page: Page) {
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js',
  });

  // Disable all transitions and animations to prevent color contrast issues during fade-ins
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        animation-iteration-count: 1 !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
    `
  });

  const results = await page.evaluate<AxeResults>(async () => {
    const axe = (window as unknown as Window & {
      axe: { run: (options: { runOnly: { type: string; values: string[] } }) => Promise<AxeResults> };
    }).axe;

    return await axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2aa'],
      },
    });
  });

  if (results.violations.length > 0) {
    const report = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        html: n.html,
        failureSummary: n.failureSummary,
      })),
    }));

    throw new Error(
      `Accessibility violations detected (${results.violations.length}):\n\n${JSON.stringify(report, null, 2)}`
    );
  }

  expect(results.violations).toHaveLength(0);
}

/**
 * Checks that all interactive elements have accessible names.
 * Catches buttons, links, and form inputs without labels.
 */
export async function checkAccessibleNames(page: Page) {
  const interactiveElements = await page.$$eval(
    'button, a[href], input, select, textarea',
    (elements) => {
      return elements
        .filter((el) => {
          // Skip hidden elements
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().slice(0, 50),
          ariaLabel: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          hasAccessibleName: !!(
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            el.textContent?.trim() ||
            el.getAttribute('aria-labelledby') ||
            (el as HTMLInputElement).labels?.length
          ),
        }))
        .filter((el) => !el.hasAccessibleName);
    }
  );

  if (interactiveElements.length > 0) {
    throw new Error(
      `Elements without accessible names (${interactiveElements.length}):\n\n${JSON.stringify(interactiveElements, null, 2)}`
    );
  }
}

/**
 * Checks that all images have alt text.
 */
export async function checkImageAlts(page: Page) {
  const imagesWithoutAlt = await page.$$eval('img:not([alt])', (elements) => {
    return elements.map((el) => ({
      src: el.getAttribute('src')?.slice(0, 100),
      alt: el.getAttribute('alt'),
    }));
  });

  if (imagesWithoutAlt.length > 0) {
    throw new Error(
      `Images without alt text (${imagesWithoutAlt.length}):\n\n${JSON.stringify(imagesWithoutAlt, null, 2)}`
    );
  }
}

/**
 * Checks that the page has a valid heading hierarchy.
 * Ensures h1 exists and heading levels don't skip.
 */
export async function checkHeadingHierarchy(page: Page) {
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => {
    return elements.map((el) => ({
      level: parseInt(el.tagName.charAt(1)),
      text: el.textContent?.trim().slice(0, 100),
    }));
  });

  const errors: string[] = [];

  // Check for h1
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    errors.push('Page has no h1 element');
  } else if (h1Count > 1) {
    errors.push(`Page has ${h1Count} h1 elements (should be exactly 1)`);
  }

  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      errors.push(
        `Heading level skipped from h${headings[i - 1].level} to h${headings[i].level} ("${headings[i].text}")`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Heading hierarchy issues:\n\n${errors.join('\n')}`
    );
  }
}
