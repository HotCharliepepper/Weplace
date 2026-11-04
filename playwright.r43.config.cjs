const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/browser',
  testMatch: 'r43.spec.cjs',
  timeout: 30000,
  expect: { timeout: 6000 },
  workers: 1,
  retries: 0,
  outputDir: 'test-results/r43',
  reporter: [['list'], ['json', { outputFile: 'test-results/r43/results.json' }]],
  use: {
    baseURL: process.env.R43_BASE_URL || (process.env.R43_LOCAL_FILES ? 'https://review.weplace.test' : 'http://localhost:4173'),
    locale: 'ko-KR',
    launchOptions: process.env.R43_CHROMIUM_PATH ? {
      executablePath: process.env.R43_CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote'],
    } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
  ],
});
