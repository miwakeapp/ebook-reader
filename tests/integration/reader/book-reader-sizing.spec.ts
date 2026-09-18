import { expect, test } from '../helpers/harness.ts';
import type { Locator, Page } from '@playwright/test';
import {
  expectBookReaderText,
  importBookFixtures,
  LONG_BOOK,
  MEDIA_SIZING_BOOK,
  openBookFromManage
} from '../helpers/fixtures.ts';
import { openTOC, pressReaderShortcut } from '../helpers/reader.ts';
import { useReaderSettings } from '../helpers/workflows.ts';

test('paginated reader content width follows viewport and reader padding', async ({ page }) => {
  await page.setViewportSize({ width: 1_000, height: 700 });
  await useReaderSettings(page, { viewMode: 'Paginated', writingMode: 'Horizontal' });
  await importBookFixtures(page, [LONG_BOOK]);
  await openBookFromManage(page, LONG_BOOK);
  await expectBookReaderText(page, LONG_BOOK);

  await expectBookContentWidth(page, 936);

  await page.setViewportSize({ width: 700, height: 700 });
  await expectBookContentWidth(page, 668);
});

for (const viewMode of ['Continuous', 'Paginated']) {
  for (const writingMode of ['Horizontal', 'Vertical']) {
    test(`${viewMode.toLowerCase()} ${writingMode.toLowerCase()} reader contains oversized media without resizing inline glyphs`, async ({
      page
    }) => {
      await page.setViewportSize({ width: 1_000, height: 700 });
      await useReaderSettings(page, {
        fontSize: '20',
        theme: 'light-theme',
        viewMode,
        writingMode
      });
      await importBookFixtures(page, [MEDIA_SIZING_BOOK]);
      await openBookFromManage(page, MEDIA_SIZING_BOOK);
      await expectBookReaderText(page, MEDIA_SIZING_BOOK);

      const illustration = page.getByAltText('Oversized portrait illustration');
      await expect(illustration).toHaveCSS('object-fit', 'contain');
      await expect
        .poll(() => mediaDimensions(illustration))
        .toMatchObject({ complete: true, naturalHeight: 128, naturalWidth: 87 });

      const illustrationDimensions = await mediaDimensions(illustration);
      expect(illustrationDimensions.width).toBeLessThanOrEqual(1_000);
      expect(illustrationDimensions.height).toBeLessThanOrEqual(700);

      await expect
        .poll(() => mediaDimensions(page.getByAltText('Inline glyph')))
        .toMatchObject({
          complete: true,
          height: 20,
          naturalHeight: 16,
          naturalWidth: 16,
          width: 20
        });

      await expect
        .poll(() => mediaDimensions(page.getByAltText('Small padded illustration')))
        .toMatchObject({ height: 40, width: 40 });
    });
  }
}

const verticalPaginatedConfigurations: {
  expectedNestedDimensions?: { height: number; width: number };
  name: string;
  viewport: { height: number; width: number };
}[] = [
  {
    expectedNestedDimensions: { height: 636, width: (636 * 128) / 87 },
    name: 'desktop pages',
    viewport: { height: 700, width: 1_000 }
  },
  { name: 'mobile portrait pages', viewport: { height: 844, width: 390 } }
];

for (const configuration of verticalPaginatedConfigurations) {
  test(`vertical paginated reader fits illustration margins and padding inside ${configuration.name}`, async ({
    page
  }) => {
    await page.setViewportSize({ height: 700, width: 1_000 });
    await useReaderSettings(page, {
      blurImages: 'All',
      fontSize: '20',
      theme: 'light-theme',
      viewMode: 'Paginated',
      writingMode: 'Vertical'
    });
    await importBookFixtures(page, [MEDIA_SIZING_BOOK]);
    await page.setViewportSize(configuration.viewport);
    await openBookFromManage(page, MEDIA_SIZING_BOOK);
    await expectBookReaderText(page, MEDIA_SIZING_BOOK);

    const cases = [
      {
        chapter: 'Padded illustration',
        followingText: '#following-text',
        media: () => page.getByAltText('Padded portrait illustration')
      },
      {
        chapter: 'Padded SVG illustration',
        followingText: '#following-svg-text',
        media: () => page.locator('svg[aria-label="Padded SVG illustration"]')
      },
      {
        chapter: 'Nested fixed-layout illustration',
        expectedDimensions: configuration.expectedNestedDimensions,
        media: () => page.getByAltText('Nested fixed-layout illustration')
      }
    ];

    for (const testCase of cases) {
      await openTOC(page);
      await page.getByTitle(`Go to ${testCase.chapter}`).click();

      const media = testCase.media();
      await expect(media).toBeAttached();
      await expect
        .poll(() => media.evaluate((element) => element.style.getPropertyPriority('max-height')))
        .toBe('important');
      await expect
        .poll(async () => {
          const visibleArea = await visibleMediaArea(media);
          if (visibleArea === 0) {
            await pressReaderShortcut(page, 'ArrowLeft');
          }
          return visibleArea;
        })
        .toBeGreaterThan(0);
      await expect
        .poll(() => clippedMediaOverflow(media))
        .toEqual({
          bottom: 0,
          left: 0,
          right: 0,
          top: 0
        });
      if (testCase.expectedDimensions) {
        for (const dimension of ['height', 'width'] as const) {
          await expect
            .poll(async () => (await mediaDimensions(media))[dimension])
            .toBeCloseTo(testCase.expectedDimensions[dimension], 1);
        }
      }
      if (testCase.followingText) {
        expect(await overlappingArea(media, page.locator(testCase.followingText))).toBe(0);
      }
    }
  });
}

for (const writingMode of ['Horizontal', 'Vertical']) {
  for (const blurImages of ['Off', 'All']) {
    for (const viewport of [
      { width: 1_000, height: 700 },
      { width: 1_280, height: 700 },
      { width: 390, height: 844 }
    ]) {
      test(`paginated ${writingMode.toLowerCase()} reader fits consecutive illustrations at width ${viewport.width} with blur ${blurImages.toLowerCase()}`, async ({
        page
      }) => {
        await page.setViewportSize({ width: 1_000, height: 700 });
        await useReaderSettings(page, {
          blurImages,
          fontSize: '20',
          viewMode: 'Paginated',
          writingMode
        });
        await importBookFixtures(page, [MEDIA_SIZING_BOOK]);
        await page.setViewportSize(viewport);
        await openBookFromManage(page, MEDIA_SIZING_BOOK);
        await expectBookReaderText(page, MEDIA_SIZING_BOOK);
        await openTOC(page);
        await page.getByTitle('Go to Consecutive illustrations').click();

        const first = page.getByAltText('First consecutive illustration');
        const second = page.getByAltText('Second consecutive illustration');
        await expect(second).toBeAttached();
        await expect
          .poll(() => second.evaluate((element) => element.style.getPropertyPriority('max-height')))
          .toBe('important');
        const followingText = page.locator('#following-consecutive-text');
        await expect.poll(() => overlappingArea(first, followingText)).toBe(0);
        await expect.poll(() => overlappingArea(second, followingText)).toBe(0);

        for (const media of [first, second]) {
          await expect
            .poll(async () => {
              const area = await visibleMediaArea(media);
              if (area === 0) {
                await pressReaderShortcut(
                  page,
                  writingMode === 'Vertical' ? 'ArrowLeft' : 'ArrowRight'
                );
              }
              return area;
            })
            .toBeGreaterThan(0);
          await expect
            .poll(() => clippedMediaOverflow(media))
            .toEqual({
              bottom: 0,
              left: 0,
              right: 0,
              top: 0
            });
        }

        if (writingMode === 'Vertical' && viewport.width === 1_280) {
          // The images and preceding text fit together and should remain on the same page.
          expect(await visibleMediaArea(first)).toBeGreaterThan(0);
          expect(
            await visibleMediaArea(page.locator('#preceding-consecutive-text'))
          ).toBeGreaterThan(0);
        }
      });
    }
  }
}

async function expectBookContentWidth(page: Page, width: number) {
  await expect
    .poll(async () => {
      const boundingBox = await page.locator('.book-content').boundingBox();
      return Math.round(boundingBox?.width ?? 0);
    })
    .toBe(width);
}

async function overlappingArea(first: Locator, second: Locator) {
  const secondElement = await second.elementHandle();
  expect(secondElement).not.toBeNull();
  return first.evaluate((firstElement, secondElement) => {
    const firstBounds = firstElement.getBoundingClientRect();
    return [...secondElement.getClientRects()].reduce((total, secondBounds) => {
      const width = Math.max(
        0,
        Math.min(firstBounds.right, secondBounds.right) -
          Math.max(firstBounds.left, secondBounds.left)
      );
      const height = Math.max(
        0,
        Math.min(firstBounds.bottom, secondBounds.bottom) -
          Math.max(firstBounds.top, secondBounds.top)
      );
      return total + width * height;
    }, 0);
  }, secondElement!);
}

function mediaDimensions(locator: Locator) {
  return locator.evaluate((element) => {
    const image = element as HTMLImageElement;
    const bounds = image.getBoundingClientRect();
    return {
      complete: image.complete,
      height: bounds.height,
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      width: bounds.width
    };
  });
}

function clippedMediaOverflow(locator: Locator) {
  return locator.evaluate((element) => {
    const mediaBounds = element.getBoundingClientRect();
    const viewportBounds = element.closest('.book-content')!.getBoundingClientRect();
    return {
      bottom: Math.max(0, Math.round(mediaBounds.bottom - viewportBounds.bottom)),
      left: Math.max(0, Math.round(viewportBounds.left - mediaBounds.left)),
      right: Math.max(0, Math.round(mediaBounds.right - viewportBounds.right)),
      top: Math.max(0, Math.round(viewportBounds.top - mediaBounds.top))
    };
  });
}

function visibleMediaArea(locator: Locator) {
  return locator.evaluate((element) => {
    const mediaBounds = element.getBoundingClientRect();
    const viewportBounds = element.closest('.book-content')!.getBoundingClientRect();
    const width = Math.max(
      0,
      Math.min(mediaBounds.right, viewportBounds.right) -
        Math.max(mediaBounds.left, viewportBounds.left)
    );
    const height = Math.max(
      0,
      Math.min(mediaBounds.bottom, viewportBounds.bottom) -
        Math.max(mediaBounds.top, viewportBounds.top)
    );
    return width * height;
  });
}
