import { test, expect } from '@playwright/test';
import { checkA11y, checkAccessibleNames, checkImageAlts, checkHeadingHierarchy } from '../helpers/a11y';

test('homepage loads and is accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Impjieg/);
  await expect(page.getByRole('heading', { name: /Your next role/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('browse jobs page loads', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveTitle(/Browse Jobs/);
  await expect(page.getByRole('heading', { name: /Browse Jobs/ })).toBeVisible();
  await checkA11y(page);
  await checkHeadingHierarchy(page);
});

test('pricing page loads', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page).toHaveTitle(/Pricing/);
  await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/ })).toBeVisible();
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
  await expect(page.getByRole('link', { name: 'Browse Jobs' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Companies' })).toBeVisible();
  await checkAccessibleNames(page);
});

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/');
  const themeButton = page.getByRole('button', { name: /Toggle theme/ });
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
  const searchInput = page.getByPlaceholder(/Search jobs/);
  await expect(searchInput).toBeVisible();
  await checkAccessibleNames(page);
  const filterButton = page.getByRole('button', { name: /Filters/ });
  await expect(filterButton).toBeVisible();
  await filterButton.click();
  await checkAccessibleNames(page);
});

test('about page loads', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveTitle(/About/);
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
