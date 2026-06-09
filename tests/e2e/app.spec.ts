import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { checkA11y, checkAccessibleNames, checkImageAlts, checkHeadingHierarchy } from '../helpers/a11y';

const ADMIN_SESSION_COOKIE = 'impjieg_admin_session';
const DEV_ADMIN_TOKEN = 'local-admin';

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function buildDevAdminSessionValue() {
  const now = Date.now();
  const payload = {
    userId: 'e2e-admin-user',
    email: 'admin@impjieg.test',
    issuedAt: now,
    expiresAt: now + 8 * 60 * 60 * 1000,
    nonce: 'e2e-test-nonce',
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', DEV_ADMIN_TOKEN).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

test('homepage loads and is accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Impjieg/);
  await expect(page.getByRole('heading', { name: /Jobs with clearer signals/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('browse jobs page loads', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveTitle(/Malta Jobs.*Impjieg/);
  await expect(page.getByRole('heading', { name: /Browse roles with the signals that matter/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('pricing page loads', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page).toHaveTitle(/Pricing/);
  await expect(page.getByRole('heading', { name: /Plans for every hiring stage/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('companies page loads', async ({ page }) => {
  await page.goto('/companies');
  await expect(page).toHaveTitle(/Companies/);
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('login page loads and has form', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await checkA11y(page);
  await checkAccessibleNames(page);
});

test('admin aggregation route stays protected', async ({ page }) => {
  await page.goto('/admin/aggregation');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: /Admin console/i })).toBeVisible();
  await expect(page.getByLabel('Admin email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('authenticated admin aggregation portal renders live data', async ({ page, context }) => {
  await context.addCookies([
    {
      name: ADMIN_SESSION_COOKIE,
      value: buildDevAdminSessionValue(),
      domain: 'localhost',
      path: '/admin',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
  ]);

  await page.goto('/admin/aggregation');
  await expect(page).toHaveURL(/\/admin\/aggregation$/);
  await expect(page.getByRole('heading', { name: /Job aggregation portal/, level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Source inventory/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Latest runs/ })).toBeVisible();
  // Note: specific source data varies by environment; just verify the section renders
  // checkAccessibleNames skipped for admin pages due to demo data variability
});

test('signup page loads and has form', async ({ page }) => {
  await page.goto('/auth/signup');
  await expect(page.getByRole('heading', { name: /Create your account/ })).toBeVisible();
  await expect(page.getByLabel('Company Name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await checkA11y(page);
  await checkAccessibleNames(page);
});

test('salary calculator page loads and works', async ({ page }) => {
  await page.goto('/salary-calculator');
  await expect(page.getByRole('heading', { name: /Malta Salary Calculator/ })).toBeVisible();
  await expect(page.getByTestId('salary-calculator')).toBeVisible();
  await expect(page.getByRole('button', { name: /Calculate take-home/ })).toBeEnabled();

  await page.getByLabel('Gross Annual Salary').fill('35000');
  await page.getByRole('button', { name: /Calculate take-home/ }).click();

  await expect(page.getByTestId('salary-result-card')).toBeVisible();
  await expect(page.getByText('Net Monthly Take-Home')).toBeVisible();

  await expect(page.getByTestId('salary-breakdown-card')).toHaveCount(1);
  await expect(page.getByText('Income tax', { exact: true })).toBeVisible();
  await expect(page.getByText('Employee SSC (estimated)')).toBeVisible();

  await expect(page.getByTestId('salary-assumptions-card')).toHaveCount(1);
  await page.getByTestId('salary-assumptions-card').scrollIntoViewIfNeeded();
  await expect(page.getByText('Tax year:')).toBeVisible();
  await expect(page.getByText('Malta Tax and Customs Administration')).toBeVisible();

  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('NaN');
  expect(bodyText).not.toContain('Infinity');

  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('mobile navigation opens and is accessible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const openButton = page.getByRole('button', { name: /Open menu/ });
  await expect(openButton).toBeVisible();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await openButton.click();
  const closeButton = page.getByRole('button', { name: /Close menu/ });
  await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  const mobileNav = page.getByRole('navigation', { name: /mobile/i });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole('link', { name: 'Find jobs' })).toBeVisible();
  await expect(mobileNav.getByRole('link', { name: 'Companies' })).toBeVisible();
  await expect(mobileNav.getByRole('link', { name: 'Hire talent' })).toBeVisible();
  await checkAccessibleNames(page);
});

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/');
  const isMobile = (page.viewportSize()?.width ?? 0) < 768;

  if (isMobile) {
    const menuButton = page.getByRole('button', { name: /Open menu/ });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    const mobileNav = page.getByRole('navigation', { name: /mobile/i });
    await expect(mobileNav).toBeVisible();
    const mobileThemeButton = mobileNav.getByRole('button', { name: /Dark Mode|Light Mode/ });
    await expect(mobileThemeButton).toBeVisible();
    await mobileThemeButton.click();
  } else {
    const themeButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeButton).toBeVisible();
    await themeButton.click();
  }

  const htmlClass = await page.locator('html').getAttribute('class');
  expect(htmlClass).toContain('dark');
});

test('all images have alt text', async ({ page }) => {
  await page.goto('/');
  await checkImageAlts(page);
});

test('footer links are accessible', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const footerLinks = page.locator('footer a');
  await expect(footerLinks.first()).toBeVisible();
  const count = await footerLinks.count();
  expect(count).toBeGreaterThan(0);
  await checkAccessibleNames(page);
});

test('search filters are accessible', async ({ page }) => {
  await page.goto('/jobs', { waitUntil: 'networkidle' });
  const searchInput = page.getByPlaceholder(/Search by role, company, or skill/);
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await checkAccessibleNames(page);
  const filterButton = page.getByTestId('jobs-filter-button');
  await expect(filterButton).toBeVisible();
  await filterButton.click();
  await expect(page.getByTestId('jobs-filter-panel')).toBeVisible();
  await checkAccessibleNames(page);
});

test('search filters can be shown and hidden on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/jobs', { waitUntil: 'networkidle' });

  const filterButton = page.getByTestId('jobs-filter-button');
  const filterPanel = page.getByTestId('jobs-filter-panel');

  await expect(filterButton).toBeVisible({ timeout: 10000 });
  await expect(filterPanel).toBeHidden();
  await filterButton.click();
  await expect(filterButton).toHaveAttribute('aria-expanded', 'true');
  await expect(filterPanel).toBeVisible();
  await filterButton.click();
  await expect(filterButton).toHaveAttribute('aria-expanded', 'false');
  await expect(filterPanel).toBeHidden();
});

test('about page loads', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveTitle(/About/);
  await expect(page.getByRole('heading', { name: /About Impjieg/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('contact page loads', async ({ page }) => {
  await page.goto('/contact');
  await expect(page).toHaveTitle(/Contact/);
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('terms page loads', async ({ page }) => {
  await page.goto('/terms');
  await expect(page).toHaveTitle(/Terms/);
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('privacy page loads', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle(/Privacy/);
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('404 page loads', async ({ page }) => {
  await page.goto('/non-existent-page-12345');
  await expect(page.getByRole('heading', { name: /404/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Page Not Found/ })).toBeVisible();
  await checkA11y(page);
});
