import { expect, test } from './helpers/harness.ts';

declare global {
  interface Window {
    recordServiceWorkerURL: (url: string) => Promise<void>;
  }
}

test('service worker registration survives a settings redirect before window load', async ({
  page
}) => {
  const registeredURLs: string[] = [];
  await page.exposeFunction('recordServiceWorkerURL', (url: string) => {
    registeredURLs.push(url);
  });
  await page.addInitScript(() => {
    const register = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function (scriptURL, options) {
      void window.recordServiceWorkerURL(new URL(String(scriptURL), document.baseURI).href);
      return register.call(this, scriptURL, options);
    };
  });

  // Hold `load` until the client-side redirect has changed the document URL.
  const { promise: loadBarrier, resolve: releaseLoad } = Promise.withResolvers<void>();
  await page.route('**/load-barrier.png', async (route) => {
    await loadBarrier;
    await route.abort();
  });
  await page.route('**/settings', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      '</body>',
      '<img src="/load-barrier.png" alt="" /></body>'
    );
    await route.fulfill({ response, body });
  });

  try {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/settings/appearance');
    expect(registeredURLs).toEqual([]);
  } finally {
    releaseLoad();
  }

  await page.waitForLoadState('load');
  await expect.poll(() => registeredURLs).toEqual([new URL('/service-worker.js', page.url()).href]);
});
