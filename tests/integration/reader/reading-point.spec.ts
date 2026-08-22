import { expect, test } from '../helpers/harness.ts';
import {
  expectBookReaderText,
  importBookFixtures,
  LONG_BOOK,
  openBookFromManage
} from '../helpers/fixtures.ts';
import { showReaderHeader } from '../helpers/reader.ts';
import { useReaderSettings } from '../helpers/workflows.ts';

test('legacy disabled reading markers migrate to the default positions', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('customReadingPointEnabled', '0');
    localStorage.setItem('horizontalCustomReadingPosition', '42');
    localStorage.setItem('verticalCustomReadingPosition', '37');
  });

  await page.goto('/settings/reading');

  await expect
    .poll(() =>
      page.evaluate(() => ({
        enabled: localStorage.getItem('customReadingPointEnabled'),
        horizontal: localStorage.getItem('horizontalCustomReadingPosition'),
        vertical: localStorage.getItem('verticalCustomReadingPosition')
      }))
    )
    .toEqual({ enabled: null, horizontal: '0', vertical: '100' });
});

test('legacy enabled reading markers retain their positions', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('customReadingPointEnabled', '1');
    localStorage.setItem('horizontalCustomReadingPosition', '42');
    localStorage.setItem('verticalCustomReadingPosition', '37');
  });

  await page.goto('/settings/reading');

  await expect
    .poll(() =>
      page.evaluate(() => ({
        enabled: localStorage.getItem('customReadingPointEnabled'),
        horizontal: localStorage.getItem('horizontalCustomReadingPosition'),
        vertical: localStorage.getItem('verticalCustomReadingPosition')
      }))
    )
    .toEqual({ enabled: null, horizontal: '42', vertical: '37' });
});

test('continuous reader always lets users move and show the reading marker', async ({ page }) => {
  await useReaderSettings(page, {
    viewMode: 'Continuous',
    writingMode: 'Horizontal'
  });
  await importBookFixtures(page, [LONG_BOOK]);
  await openBookFromManage(page, LONG_BOOK);
  await expectBookReaderText(page, LONG_BOOK);

  await page.keyboard.press('Shift+T');
  await expect(page.locator('body')).not.toHaveClass(/cursor-crosshair/);

  await page.keyboard.press('t');
  await expect(page.locator('body')).toHaveClass(/cursor-crosshair/);

  const bookContentBox = await page.locator('.book-content').boundingBox();
  if (!bookContentBox) throw new Error('Expected book content to have a bounding box');
  await page.mouse.click(
    bookContentBox.x + bookContentBox.width / 2,
    bookContentBox.y + bookContentBox.height / 2
  );
  await expect(page.locator('body')).not.toHaveClass(/cursor-crosshair/);

  const updatedHeader = await showReaderHeader(page);
  const markerMenu = updatedHeader.getByRole('button', { name: 'Marker ▾', exact: true });
  await expect(markerMenu).toHaveAttribute('title', 'Open reading marker actions');

  await markerMenu.click();
  await page.getByRole('button', { name: 'About reading marker…', exact: true }).click();
  const markerDialog = page.getByRole('dialog', { name: 'Reading marker' });
  await expect(markerDialog).toContainText(
    'The reading marker represents where your eyes normally rest on the screen.'
  );
  await expect(markerDialog).toContainText(
    'By default, it is at the top edge of the reading area for horizontal text and the right edge for vertical text.'
  );
  await expect(markerDialog).toContainText(
    'Miwake Reader updates your progress, characters read, and bookmark position.'
  );
  await markerDialog.getByRole('button', { name: 'OK' }).click();

  const reopenedHeader = await showReaderHeader(page);
  await reopenedHeader.getByRole('button', { name: 'Marker ▾', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Reset reading marker', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show reading marker', exact: true }).click();
  await expect(page.locator('.border-red-500')).toHaveCount(2);
});

test('paginated reader explains its temporary current position', async ({ page }) => {
  await useReaderSettings(page, {
    viewMode: 'Paginated',
    writingMode: 'Horizontal'
  });
  await importBookFixtures(page, [LONG_BOOK]);
  await openBookFromManage(page, LONG_BOOK);
  await expectBookReaderText(page, LONG_BOOK);

  const header = await showReaderHeader(page);
  const positionMenu = header.getByRole('button', { name: 'Position ▾', exact: true });
  await expect(positionMenu).toHaveAttribute('title', 'Open current reading position actions');

  await positionMenu.click();
  await expect(
    page.getByRole('button', { name: 'Set current reading position', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'About reading position…', exact: true }).click();

  const positionDialog = page.getByRole('dialog', { name: 'Current reading position' });
  await expect(positionDialog).toContainText(
    'Miwake Reader normally estimates your position to be the start of the visible page.'
  );
  await expect(positionDialog).toContainText(
    'This position is used to calculate progress, characters read, and bookmarks saved on this page.'
  );
});
