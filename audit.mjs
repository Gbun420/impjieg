import { chromium } from 'playwright';

const PAGES = [
  { url: '/', name: 'Home', expectH1: 'Your next role, sorted.' },
  { url: '/jobs', name: 'Jobs Listing', expectH1: 'Browse Jobs' },
  { url: '/companies', name: 'Companies Directory', expectH1: 'Companies' },
  { url: '/pricing', name: 'Pricing', expectH1: 'Simple, Transparent Pricing' },
  { url: '/about', name: 'About', expectH1: 'About Impjieg' },
  { url: '/contact', name: 'Contact', expectH1: 'Contact Us' },
  { url: '/privacy', name: 'Privacy Policy', expectH1: 'Privacy Policy' },
  { url: '/terms', name: 'Terms of Service', expectH1: 'Terms of Service' },
  { url: '/salary-calculator', name: 'Salary Calculator', expectH1: 'Malta Salary Calculator' },
  { url: '/alerts', name: 'Job Alerts', expectH1: 'Job Alerts' },
  { url: '/auth/login', name: 'Login', expectH1: 'Welcome back' },
  { url: '/auth/signup', name: 'Signup', expectH1: 'Create your account' },
  { url: '/employer/dashboard', name: 'Employer Dashboard (protected)', expectRedirect: '/auth/login' },
  { url: '/employer/post-job', name: 'Post Job (protected)', expectRedirect: '/auth/login' },
  { url: '/employer/jobs', name: 'My Jobs (protected)', expectRedirect: '/auth/login' },
  { url: '/employer/applications', name: 'Applications (protected)', expectRedirect: '/auth/login' },
  { url: '/employer/settings', name: 'Settings (protected)', expectRedirect: '/auth/login' },
  { url: '/employer/checkout/success', name: 'Checkout Success (protected)', expectRedirect: '/auth/login' },
];

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const errors = [];

  for (const { url, name, expectH1, expectRedirect } of PAGES) {
    console.log(`\n🔍 Testing: ${name} (${url})`);

    try {
      const response = await page.goto(`http://localhost:3000${url}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const finalUrl = page.url();
      const status = response?.status() ?? 0;
      const title = await page.title();
      const h1Texts = await page.locator('h1').allTextContents();
      const h1Text = h1Texts[0] || '(none)';

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => img.naturalWidth === 0 && img.src && !img.src.includes('data:') && !img.src.includes('localhost')).map(img => img.alt || img.src);
      });

      // Check for JS console errors
      const consoleErrors = [];
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      // Check for horizontal scroll (layout issue)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.documentElement.clientWidth;
      });

      // Check key elements exist
      const hasHeader = await page.locator('header').count() > 0;
      const hasFooter = await page.locator('footer').count() > 0;
      const hasLogo = await page.locator('img[src*="logo"]').count() > 0;

      // Screenshot
      await page.screenshot({ path: `audit-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`, fullPage: true });

      // Validation
      let pageOk = true;

      if (expectRedirect) {
        if (!finalUrl.includes(expectRedirect)) {
          errors.push(`${name}: Expected redirect to ${expectRedirect}, but went to ${finalUrl}`);
          pageOk = false;
        } else {
          console.log(`   ✅ Correctly redirected to ${finalUrl}`);
        }
      }

      if (expectH1 && !expectRedirect) {
        if (h1Text !== expectH1) {
          errors.push(`${name}: Expected H1 "${expectH1}", got "${h1Text}"`);
          pageOk = false;
        } else {
          console.log(`   ✅ H1 correct: "${h1Text}"`);
        }
      }

      if (brokenImages.length > 0) {
        errors.push(`${name}: Broken images: ${brokenImages.join(', ')}`);
        pageOk = false;
      } else {
        console.log(`   ✅ No broken images`);
      }

      if (hasHorizontalScroll) {
        errors.push(`${name}: Horizontal overflow detected`);
        pageOk = false;
      } else {
        console.log(`   ✅ No horizontal overflow`);
      }

      if (!hasHeader) {
        errors.push(`${name}: Missing header`);
        pageOk = false;
      } else {
        console.log(`   ✅ Header present`);
      }

      if (!hasFooter) {
        errors.push(`${name}: Missing footer`);
        pageOk = false;
      } else {
        console.log(`   ✅ Footer present`);
      }

      if (!hasLogo) {
        errors.push(`${name}: Missing logo`);
        pageOk = false;
      } else {
        console.log(`   ✅ Logo present`);
      }

      if (pageOk) {
        console.log(`   ✅ ${name} PASS`);
      } else {
        console.log(`   ❌ ${name} FAIL`);
      }

    } catch (error) {
      errors.push(`${name}: ${error.message}`);
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  // Test mobile viewport
  console.log('\n📱 Testing mobile viewport (375x812)...');
  await page.setViewportSize({ width: 375, height: 812 });

  const mobilePages = ['/', '/jobs', '/pricing', '/auth/login'];
  for (const url of mobilePages) {
    await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle', timeout: 15000 });
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalScroll) {
      errors.push(`Mobile ${url}: Horizontal overflow on 375px viewport`);
      console.log(`   ❌ ${url}: Horizontal overflow on mobile`);
    } else {
      console.log(`   ✅ ${url}: OK on mobile`);
    }
    await page.screenshot({ path: `audit-mobile-${url.replace(/\//g, '')}.png`, fullPage: true });
  }

  // Test navigation links
  console.log('\n🔗 Testing navigation links...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });

  const navLinks = await page.locator('header a').all();
  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    if (href && href.startsWith('/')) {
      try {
        const resp = await page.goto(`http://localhost:3000${href}`, { waitUntil: 'commit', timeout: 10000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) {
          errors.push(`Nav link ${href}: HTTP ${status}`);
          console.log(`   ❌ ${href}: HTTP ${status}`);
        } else {
          console.log(`   ✅ ${href}: HTTP ${status}`);
        }
        await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
      } catch {
        errors.push(`Nav link ${href}: Failed to load`);
        console.log(`   ❌ ${href}: Failed`);
      }
    }
  }

  await browser.close();

  // Summary
  console.log('\n========================================');
  console.log('          AUDIT SUMMARY');
  console.log('========================================');

  if (errors.length === 0) {
    console.log('✅ ALL CHECKS PASSED');
  } else {
    console.log(`❌ ${errors.length} issue(s) found:\n`);
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

runAudit().catch(console.error);
