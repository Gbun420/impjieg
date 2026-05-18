import { expect, type Page } from '@playwright/test';

/**
 * Runs axe-core on the current page and asserts that no WCAG 2.1 AA violations exist.
 * Fails the test with a detailed JSON report when violations are found.
 */
export async function checkA11y(page: Page) {
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js',
  });

  const results = await page.evaluate(async () => {
    // @ts-ignore – axe is attached to window by the script tag
    return await (window as any).axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2aa'],
      },
    });
  });

  if (results.violations.length > 0) {
    const report = results.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
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
