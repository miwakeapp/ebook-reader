import { expect, test } from './helpers/harness.ts';
import { navigateToSettingsAppearance, navigateToSettingsReading } from './helpers/navigation.ts';

test('visible number-setting labels focus and describe their inputs', async ({ page }) => {
  await navigateToSettingsAppearance(page);

  const textSize = page.getByRole('spinbutton', { name: 'Text size', exact: true });
  await page.getByText('Text size', { exact: true }).click();
  await expect(textSize).toBeFocused();
  await expect(textSize).toHaveAccessibleDescription('px');

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

test('switch labels toggle their controls and reading settings fit on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigateToSettingsReading(page);

  const tapEdges = page.getByRole('switch', { name: 'Tap page edges to turn pages' });
  const initiallyChecked = await tapEdges.isChecked();
  await page.getByText('Tap page edges to turn pages', { exact: true }).click();
  await expect(tapEdges).toBeChecked({ checked: !initiallyChecked });
  await page
    .getByText('Reserve a small area on either edge for page turning.', { exact: true })
    .click();
  await expect(tapEdges).toBeChecked({ checked: initiallyChecked });

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(pageWidth).toBe(viewportWidth);
});

test('vertical typography preferences remain available in horizontal mode', async ({ page }) => {
  await navigateToSettingsAppearance(page);

  await page.getByText('Horizontal', { exact: true }).click();
  await page.locator('summary').click();

  await expect(
    page.getByRole('group', { name: 'Latin letters and numbers in vertical text' })
  ).toBeVisible();
  await expect(page.getByRole('group', { name: 'Vertical character spacing' })).toBeVisible();
});

test('choice controls preserve boolean and numeric values', async ({ page }) => {
  await navigateToSettingsAppearance(page);

  const bookTitles = page.getByRole('group', { name: 'Book titles' });
  await bookTitles.getByLabel('Full').check();
  await expect(bookTitles.getByLabel('Full')).toBeChecked();

  await page.getByText('Horizontal', { exact: true }).click();
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
    name: /Maximum reading area (?:width|height)/
  });
  await expect(
    lineLength.getByRole('spinbutton', {
      name: /Maximum reading area (?:width|height) Custom/
    })
  ).toBeDisabled();
});
