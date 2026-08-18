import { expect, test } from './helpers/harness.ts';
import { navigateToSettingsAppearance } from './helpers/navigation.ts';

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
});
