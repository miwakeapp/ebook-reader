import { expect, test } from '../helpers/harness.ts';
import { navigateToSettingsTracking } from '../helpers/navigation.ts';
import {
  enableStatistics,
  exportBackup,
  importBackup,
  signOutAndWipe
} from '../helpers/workflows.ts';

test('backup import with "ZIP wins" overwrites local app settings', async ({ page }, testInfo) => {
  const backupPath = testInfo.outputPath('app-settings-backup.zip');

  await enableStatistics(page);
  await exportBackup(page, backupPath, { appSettings: true });

  await signOutAndWipe(page);
  await enableStatistics(page);
  await navigateToSettingsTracking(page);
  const trackingSwitch = page.getByRole('switch', { name: 'Track reading activity' });
  await trackingSwitch.locator('xpath=ancestor::label[1]').click();
  await expect(trackingSwitch).not.toBeChecked();

  await importBackup(page, backupPath, { direction: 'ZIP wins' });

  await navigateToSettingsTracking(page);
  await expect(page.getByRole('switch', { name: 'Track reading activity' })).toBeChecked();
});
