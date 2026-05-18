import { test, expect } from '@playwright/test';
import { checkA11y } from '../helpers/a11y';

test('homepage loads and is accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Impjieg/);
  await expect(page.getByRole('heading', { name: /Your next role/ })).toBeVisible();
  await checkA11y(page);
});

test('browse jobs page loads', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveTitle(/Browse Jobs/);
  await expect(page.getByRole('heading', { name: /Browse Jobs/ })).toBeVisible();
  await checkA11y(page);
});

test('pricing page loads', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page).toHaveTitle(/Pricing/);
  await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/ })).toBeVisible();
  await checkA11y(page);
});

test('companies page loads', async ({ page }) => {
  await page.goto('/companies');
  await expect(page).toHaveTitle(/Companies/);
  await checkA11y(page);
});

test('login page loads and has form', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await checkA11y(page);
});

test('mobile navigation opens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.getByRole('button', { name: /Toggle menu/ }).click();
  await expect(page.getByRole('link', { name: 'Browse Jobs' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Companies' })).toBeVisible();
});

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Toggle theme/ }).click();
  const htmlClass = await page.locator('html').getAttribute('class');
  expect(htmlClass).toContain('dark');
});

test('salary calculator works', async ({ page }) => {
  await page.goto('/salary-calculator');
  await expect(page.getByRole('heading', { name: /Malta Salary Calculator/ })).toBeVisible();
  await page.getByLabel('Gross Annual Salary').fill('35000');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByText('Net Monthly Take-Home')).toBeVisible();
  await checkA11y(page);
});
