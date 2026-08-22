import { expect, test } from './helpers/harness.ts';
import {
  navigateToSettingsAppearance,
  navigateToSettingsReading,
  navigateToSettingsTracking
} from './helpers/navigation.ts';

test('normalizes redesigned numeric settings when the app starts', async ({ page }) => {
  await page.addInitScript(() => {
    const values = {
      fontSize: '2700',
      firstDimensionMargin: '1250',
      secondDimensionMaxValue: '50',
      swipeThreshold: '26',
      autoBookmarkTime: '999',
      pageColumns: '3',
      trackerAutoStartTime: '500',
      trackerIdleTime: '86400'
    };
    for (const [key, value] of Object.entries(values)) {
      localStorage.setItem(key, value);
    }
  });

  await page.goto('/manage');

  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.fromEntries(
          [
            'fontSize',
            'firstDimensionMargin',
            'secondDimensionMaxValue',
            'swipeThreshold',
            'autoBookmarkTime',
            'pageColumns',
            'trackerAutoStartTime',
            'trackerIdleTime'
          ].map((key) => [key, localStorage.getItem(key)])
        )
      )
    )
    .toEqual({
      fontSize: '200',
      firstDimensionMargin: '1000',
      secondDimensionMaxValue: '100',
      swipeThreshold: '40',
      autoBookmarkTime: '300',
      pageColumns: '2',
      trackerAutoStartTime: '300',
      trackerIdleTime: '43200'
    });
});

test('stores the day boundary as a time without importing the legacy hour', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('startDayHoursForTracker', '7'));
  await navigateToSettingsTracking(page);

  const dayBoundary = page.getByLabel('A new reading day starts at');
  await expect(dayBoundary).toHaveValue('00:00');

  await dayBoundary.fill('04:30');
  await expect
    .poll(() =>
      page.evaluate(() => ({
        current: localStorage.getItem('dayBoundaryTime'),
        legacy: localStorage.getItem('startDayHoursForTracker')
      }))
    )
    .toEqual({ current: '04:30', legacy: '7' });
});

test('visible number-setting labels focus and describe their inputs', async ({ page }) => {
  await navigateToSettingsAppearance(page);

  const textSize = page.getByRole('spinbutton', { name: 'Text size', exact: true });
  await page.getByText('Text size', { exact: true }).click();
  await expect(textSize).toBeFocused();
  await expect(textSize).toHaveAccessibleDescription('px');
  await expect(textSize).toHaveAttribute('max', '200');

  await textSize.fill('2700');
  await textSize.blur();
  await expect(textSize).toHaveValue('200');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('fontSize'))).toBe('200');

  const lineHeight = page.getByRole('spinbutton', { name: 'Line height', exact: true });
  await page.getByText('Line height', { exact: true }).click();
  await expect(lineHeight).toBeFocused();
  await expect(lineHeight).toHaveAccessibleDescription('× text size');

  const indentation = page.getByRole('spinbutton', { name: 'First-line indent', exact: true });
  await page
    .getByText('Extra indentation at the start of each paragraph.', { exact: true })
    .click();
  await expect(indentation).toBeFocused();
  await expect(indentation).toHaveAccessibleDescription(
    'Extra indentation at the start of each paragraph. rem'
  );
});

test('restores appearance defaults without deleting custom resources', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('customThemes', JSON.stringify({ preserved: {} }));
  });
  await navigateToSettingsAppearance(page);

  await page.getByRole('group', { name: 'Book titles' }).getByLabel('Full').check();
  await page.getByRole('group', { name: 'Text direction' }).getByText('Horizontal').click();
  await page.getByRole('group', { name: 'Reading flow' }).getByText('Scroll').click();
  await page.getByRole('spinbutton', { name: 'Text size', exact: true }).fill('48');

  await page.locator('summary').getByText('Advanced', { exact: true }).click();
  await expect(page.getByText('Restore appearance defaults', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore defaults…' }).click();
  const dialog = page.getByRole('dialog', { name: 'Restore appearance defaults?' });
  await expect(dialog).toContainText('Custom themes and imported fonts will not be deleted.');
  await dialog.getByRole('button', { name: 'Restore defaults' }).click();

  await expect(
    page.getByRole('group', { name: 'Book titles' }).getByLabel('Simplified')
  ).toBeChecked();
  await expect(
    page.getByRole('group', { name: 'Text direction' }).getByRole('radio', { name: 'Vertical' })
  ).toBeChecked();
  await expect(
    page.getByRole('group', { name: 'Reading flow' }).getByRole('radio', { name: 'Pages' })
  ).toBeChecked();
  await expect(page.getByRole('spinbutton', { name: 'Text size', exact: true })).toHaveValue('20');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('customThemes')))
    .toBe(JSON.stringify({ preserved: {} }));
});

test('restores reading defaults and its local compound-control state', async ({ page }) => {
  await navigateToSettingsReading(page);

  await page.getByRole('group', { name: 'Text direction' }).getByText('Horizontal').click();
  await page.getByRole('group', { name: 'Reading flow' }).getByText('Scroll').click();
  const pageMargins = page.getByRole('group', { name: 'Page margins' });
  await pageMargins.getByRole('radio', { name: 'Custom', exact: true }).check();
  await pageMargins.getByRole('spinbutton', { name: 'Page margins Custom' }).fill('72');
  await page.getByText('Save my position when leaving', { exact: true }).click();

  await page.getByRole('button', { name: 'Restore defaults…' }).click();
  const dialog = page.getByRole('dialog', { name: 'Restore reading defaults?' });
  await dialog.getByRole('button', { name: 'Restore defaults' }).click();

  await expect(pageMargins.getByRole('radio', { name: 'Automatic (default)' })).toBeChecked();
  await expect(pageMargins.getByRole('spinbutton', { name: 'Page margins Custom' })).toHaveValue(
    '24'
  );
  await expect(page.getByRole('switch', { name: 'Save my position when leaving' })).toBeChecked();
  await expect(
    page.getByRole('group', { name: 'Text direction' }).getByRole('radio', { name: 'Vertical' })
  ).toBeChecked();
  await expect(
    page.getByRole('group', { name: 'Reading flow' }).getByRole('radio', { name: 'Pages' })
  ).toBeChecked();
});

test('restores tracking preferences without deleting reading data', async ({ page }) => {
  await navigateToSettingsTracking(page);

  await page.getByText('Track reading activity', { exact: true }).click();
  await page.getByLabel('A new reading day starts at').fill('04:30');
  await page
    .getByRole('group', { name: 'After removing a book' })
    .getByLabel('Delete reading data')
    .check();

  await page.locator('summary').getByText('Advanced', { exact: true }).click();
  await expect(page.getByText('Restore tracking defaults', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore defaults…' }).click();
  const dialog = page.getByRole('dialog', { name: 'Restore tracking defaults?' });
  await expect(dialog).toContainText(
    'Recorded reading data and reading goals will not be deleted.'
  );
  await dialog.getByRole('button', { name: 'Restore defaults' }).click();

  await expect(page.getByRole('switch', { name: 'Track reading activity' })).not.toBeChecked();
  await expect(page.getByLabel('A new reading day starts at')).toHaveValue('00:00');
  await expect(
    page.getByRole('group', { name: 'After removing a book' }).getByLabel('Keep reading data')
  ).toBeChecked();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('trackerForwardSkipThreshold')))
    .toBe('2700');
});

test('switch labels toggle their controls and reading settings fit on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigateToSettingsReading(page);

  const tapEdges = page.getByRole('switch', { name: 'Tap page edges to turn pages' });
  await expect(tapEdges).toHaveAccessibleDescription(
    'Reserves a small area on either edge for page turning. Applies only when reading flow is set to Pages.'
  );
  const initiallyChecked = await tapEdges.isChecked();
  await page.getByText('Tap page edges to turn pages', { exact: true }).click();
  await expect(tapEdges).toBeChecked({ checked: !initiallyChecked });
  await page
    .getByText('Reserves a small area on either edge for page turning.', { exact: true })
    .click();
  await expect(tapEdges).toBeChecked({ checked: initiallyChecked });

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(pageWidth).toBe(viewportWidth);
});

test('saving on exit and warning before exit remain independent', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('manualBookmark', '0');
    localStorage.setItem('confirmClose', '1');
  });
  await navigateToSettingsReading(page);

  const saveOnExit = page.getByRole('switch', { name: 'Save my position when leaving' });
  const warnOnExit = page.getByRole('switch', {
    name: 'Warn before leaving with unsaved progress'
  });
  await expect(saveOnExit).toBeChecked();
  await expect(warnOnExit).toBeChecked();

  await page.getByText('Save my position when leaving', { exact: true }).click();
  await expect(saveOnExit).not.toBeChecked();
  await expect(warnOnExit).toBeChecked();
  await page.getByText('Save my position when leaving', { exact: true }).click();
  await expect(saveOnExit).toBeChecked();
  await expect(warnOnExit).toBeChecked();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('confirmClose'))).toBe('1');
});

test('vertical typography preferences remain available in horizontal mode', async ({ page }) => {
  await navigateToSettingsAppearance(page);

  await page.getByRole('group', { name: 'Text direction' }).getByText('Horizontal').click();
  await page.locator('summary').click();

  await expect(
    page.getByRole('group', { name: 'Latin letters and numbers in vertical text' })
  ).toBeVisible();
  await expect(page.getByRole('group', { name: 'Vertical character spacing' })).toBeVisible();

  const verticalApplicability = page.getByTitle(
    'Applies only when text direction is set to Vertical.'
  );
  await expect(verticalApplicability).toHaveCount(2);
  await expect(verticalApplicability.first()).toHaveCSS('cursor', 'help');
});

test('choice controls preserve boolean and numeric values', async ({ page }) => {
  await navigateToSettingsAppearance(page);

  const bookTitles = page.getByRole('group', { name: 'Book titles' });
  await bookTitles.getByLabel('Full').check();
  await expect(bookTitles.getByLabel('Full')).toBeChecked();

  await page.getByRole('group', { name: 'Text direction' }).getByText('Horizontal').click();
  await navigateToSettingsReading(page);

  const textColumns = page.getByRole('group', { name: 'Text columns' });
  await textColumns.getByText('2', { exact: true }).click();
  await expect(textColumns.getByRole('radio', { name: '2' })).toBeChecked();

  await page.reload();
  await expect(
    page.getByRole('group', { name: 'Text columns' }).getByRole('radio', { name: '2' })
  ).toBeChecked();

  await navigateToSettingsAppearance(page);
  await expect(page.getByRole('group', { name: 'Book titles' }).getByLabel('Full')).toBeChecked();
});

test('custom layout values stay with their radio options', async ({ page }) => {
  await navigateToSettingsReading(page);

  const pageMargins = page.getByRole('group', { name: 'Page margins' });
  const customMargin = pageMargins.getByRole('spinbutton', { name: 'Page margins Custom' });

  await expect(customMargin).toBeDisabled();
  await expect(customMargin).toHaveValue('24');

  await pageMargins.getByRole('radio', { name: 'Custom', exact: true }).check();
  await expect(customMargin).toBeEnabled();
  await customMargin.fill('36');
  await customMargin.blur();

  await pageMargins.getByRole('radio', { name: 'Automatic (default)' }).check();
  await expect(customMargin).toBeDisabled();
  await expect(customMargin).toHaveValue('36');

  await pageMargins.getByRole('radio', { name: 'Custom', exact: true }).check();
  await expect(customMargin).toBeEnabled();
  await expect(customMargin).toHaveValue('36');

  await page.reload();
  const reloadedPageMargins = page.getByRole('group', { name: 'Page margins' });
  await expect(
    reloadedPageMargins.getByRole('radio', { name: 'Custom', exact: true })
  ).toBeChecked();
  await expect(
    reloadedPageMargins.getByRole('spinbutton', { name: 'Page margins Custom' })
  ).toHaveValue('36');

  const lineLength = page.getByRole('group', {
    name: 'Maximum reading area'
  });
  await expect(
    lineLength.getByRole('spinbutton', {
      name: 'Maximum reading area Custom'
    })
  ).toBeDisabled();
});

test('reader modes stay available while mode-specific preferences remain configurable', async ({
  page
}) => {
  await navigateToSettingsAppearance(page);

  const appearanceModes = page.locator('[data-reader-mode-settings]');
  await appearanceModes
    .getByRole('group', { name: 'Text direction' })
    .getByText('Horizontal')
    .click();
  await appearanceModes.getByRole('group', { name: 'Reading flow' }).getByText('Scroll').click();

  await navigateToSettingsReading(page);

  const readingModes = page.locator('[data-reader-mode-settings]');
  await expect(
    readingModes
      .getByRole('group', { name: 'Text direction' })
      .getByRole('radio', { name: 'Horizontal' })
  ).toBeChecked();
  await expect(
    readingModes.getByRole('group', { name: 'Reading flow' }).getByRole('radio', { name: 'Scroll' })
  ).toBeChecked();

  await expect(page.getByRole('group', { name: 'Text columns' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Keep paragraphs on one page' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Turn pages with the mouse wheel' })).toBeVisible();
  await expect(
    page.getByRole('switch', { name: 'Anchor bookmarks near selected text' })
  ).toBeVisible();
  await expect(
    page.getByRole('switch', { name: 'Pause tracking while positioning the marker' })
  ).toBeVisible();

  await readingModes.getByRole('group', { name: 'Text direction' }).getByText('Vertical').click();
  await readingModes.getByRole('group', { name: 'Reading flow' }).getByText('Pages').click();

  await expect(page.getByRole('group', { name: 'Text columns' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Keep paragraphs on one page' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Turn pages with the mouse wheel' })).toBeVisible();
  await expect(
    page.getByRole('switch', { name: 'Anchor bookmarks near selected text' })
  ).toBeVisible();
  await expect(
    page.getByRole('switch', { name: 'Pause tracking while positioning the marker' })
  ).toBeVisible();
});
