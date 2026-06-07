import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { checkA11y, checkAccessibleNames, checkImageAlts, checkHeadingHierarchy } from '../helpers/a11y';

const ADMIN_SESSION_COOKIE = 'impjieg_admin_session';
const ADMIN_SESSION_MESSAGE = 'impjieg-admin-session';
const DEV_ADMIN_TOKEN = 'local-admin';

function buildDevAdminSessionValue() {
  return createHmac('sha256', DEV_ADMIN_TOKEN).update(ADMIN_SESSION_MESSAGE).digest('hex');
}

test('homepage loads and is accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Impjieg/);
  await expect(page.getByRole('heading', { name: /The sharper marketplace for Malta/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('browse jobs page loads', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveTitle(/Browse Malta Jobs/);
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
  await expect(page.getByText('Primary XML feed used for search discovery', { exact: true })).toBeVisible();
  await checkAccessibleNames(page);
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
  await page.getByLabel('Gross Annual Salary').fill('35000');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByText('Net Monthly Take-Home')).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('mobile navigation opens and is accessible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: /Toggle menu/ });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  const mobileNav = page.locator('.md\\:hidden nav');
  await expect(mobileNav.getByRole('link', { name: 'Find jobs' })).toBeVisible();
  await expect(mobileNav.getByRole('link', { name: 'Companies' })).toBeVisible();
  await expect(mobileNav.getByRole('link', { name: 'Hire talent' })).toBeVisible();
  await checkAccessibleNames(page);
});

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/');
  const isMobile = (page.viewportSize()?.width ?? 0) < 768;
  let themeButton;
  
  if (isMobile) {
    const menuButton = page.getByRole('button', { name: /Toggle menu/ });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    themeButton = page.getByRole('button', { name: /Light Mode|Dark Mode/ });
  } else {
    themeButton = page.getByRole('button', { name: /Switch to (light|dark) mode/i });
  }
  await expect(themeButton).toBeVisible();
  await themeButton.click();
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
  await page.goto('/jobs');
  const searchInput = page.getByPlaceholder(/Search by role, company, or skill/);
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await checkAccessibleNames(page);
  const filterButton = page.getByRole('button', { name: /Show filters/ });
  await expect(filterButton).toBeVisible();
  await filterButton.click();
  await checkAccessibleNames(page);
});

test('search filters can be shown and hidden on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/jobs');

  const filterButton = page.getByRole('button', { name: 'Show filters' });
  const filterPanel = page.locator('#job-filters-panel');

  await expect(filterButton).toBeVisible({ timeout: 10000 });
  await expect(filterPanel).toBeHidden();
  await filterButton.click();
  await expect(page.getByRole('button', { name: 'Hide filters' })).toBeVisible({ timeout: 5000 });
  await expect(filterPanel).toBeVisible();
  await page.getByRole('button', { name: 'Hide filters' }).click();
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
