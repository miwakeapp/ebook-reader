import { expect, type Page } from '@playwright/test';
import {
  listSyncRoot,
  pickSyncRootOnNextPicker,
  SYNC_ASSERTION_TIMEOUT,
  type SyncRootOptions
} from './harness.ts';
import {
  navigateToSettingsAppearance,
  navigateToSettingsReading,
  navigateToSettingsSync,
  navigateToSettingsTracking,
  navigateToStatisticsGoals
} from './navigation.ts';
import { expectBooksInSyncRoot, importBookFixtures, type LibraryBookFixture } from './fixtures.ts';

interface ReaderSettings {
  autoBookmark?: string;
  autoBookmarkTime?: string;
  blurImages?: string;
  closeConfirmation?: string;
  customReadingPoint?: string;
  fontSize?: string;
  fontVPAL?: string;
  furigana?: string;
  lineHeight?: string;
  readerMaxWidth?: string;
  showFooterChapterCharacters?: string;
  showFooterChapterPercentage?: string;
  savePositionOnExit?: string;
  tapToFlip?: string;
  theme?: string;
  verticalTextOrientation?: string;
  viewMode?: string;
  writingMode?: string;
}

export async function connectFS(page: Page, options?: SyncRootOptions) {
  await navigateToSettingsSync(page);
  if (options?.rootName) {
    await pickSyncRootOnNextPicker(page, options.rootName);
  }
  await page.getByRole('button', { name: 'Choose folder' }).click();
  await expect(page.getByText('Connected')).toBeVisible();
  await waitForSyncIdle(page);
}

export async function signOutAndWipe(page: Page) {
  await navigateToSettingsSync(page);
  await page.getByRole('button', { name: 'Sign out and wipe' }).click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading')).toContainText('Sign out and wipe local data?');
  await Promise.all([
    page.waitForURL('/manage'),
    dialog.getByRole('button', { name: 'Sign out and wipe' }).click()
  ]);
}

/**
 * Imports book fixtures, connects a fresh sync source, and waits for those fixtures to appear as
 * top-level source folders.
 *
 * Use this when source copies are setup for the scenario under test. Importing before connection
 * lets the source-connection mirror do the upload; that is less racy than importing into an
 * already-connected source and waiting for the ambient debounced push.
 */
export async function syncBookFixturesToSource(
  page: Page,
  fixtures: readonly LibraryBookFixture[],
  options?: SyncRootOptions
) {
  await importBookFixtures(page, fixtures);
  await connectFS(page, options);
  await expectBooksInSyncRoot(page, fixtures, options);
}

export async function openDisconnectDialog(page: Page) {
  await navigateToSettingsSync(page);
  await page.getByRole('button', { name: 'Disconnect' }).click();

  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading')).toContainText('Disconnect your sync folder?');
  return dialog;
}

export async function openChangeFolderDialog(page: Page) {
  await navigateToSettingsSync(page);
  await page.getByRole('button', { name: 'Change folder' }).click();

  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading')).toContainText('Switch to your sync folder?');
  return dialog;
}

export async function setSyncDirection(page: Page, direction: 'Up only' | 'Down only' | 'Off') {
  await navigateToSettingsSync(page);
  await page.getByText('Advanced').click();
  await page.getByRole('group', { name: 'Sync direction' }).getByLabel(direction).check();
}

export async function useReaderSettings(page: Page, settings: ReaderSettings) {
  const readingSettingsRequested = [
    settings.autoBookmark,
    settings.autoBookmarkTime,
    settings.closeConfirmation,
    settings.customReadingPoint,
    settings.readerMaxWidth,
    settings.savePositionOnExit,
    settings.showFooterChapterCharacters,
    settings.showFooterChapterPercentage,
    settings.tapToFlip,
    settings.viewMode
  ].some((value) => value !== undefined);

  if (readingSettingsRequested) {
    await navigateToSettingsReading(page);

    if (settings.viewMode) {
      await selectSettingsRadio(page, 'Reading flow', mapReadingFlow(settings.viewMode));
    }
    if (settings.readerMaxWidth) {
      await selectSettingsRadio(page, 'Maximum line length', 'Custom');
      await fillSettingsNumber(page, 'Custom maximum', settings.readerMaxWidth);
    }
    if (settings.tapToFlip) {
      await setSettingsSwitch(
        page,
        'Tap page edges to turn pages',
        settingValueIsOn(settings.tapToFlip)
      );
    }
    if (settings.autoBookmark) {
      await setSettingsSwitch(
        page,
        'Save my position while reading',
        settingValueIsOn(settings.autoBookmark)
      );
    }
    if (settings.autoBookmarkTime) {
      await fillSettingsNumber(page, 'Save after', settings.autoBookmarkTime);
    }
    if (settings.savePositionOnExit) {
      await setSettingsSwitch(
        page,
        'Save my position when leaving',
        settingValueIsOn(settings.savePositionOnExit)
      );
    }
    if (settings.closeConfirmation) {
      await setSettingsSwitch(
        page,
        'Warn before leaving with unsaved progress',
        settingValueIsOn(settings.closeConfirmation)
      );
    }
    if (settings.showFooterChapterCharacters) {
      await setProgressFooterField(page, 2, settingValueIsOn(settings.showFooterChapterCharacters));
    }
    if (settings.showFooterChapterPercentage) {
      await setProgressFooterField(page, 3, settingValueIsOn(settings.showFooterChapterPercentage));
    }
    if (settings.customReadingPoint) {
      await setSettingsSwitch(
        page,
        'Use a fixed reading marker',
        settingValueIsOn(settings.customReadingPoint)
      );
    }
  }

  const appearanceSettingsRequested = [
    settings.blurImages,
    settings.fontSize,
    settings.fontVPAL,
    settings.furigana,
    settings.lineHeight,
    settings.theme,
    settings.verticalTextOrientation,
    settings.writingMode
  ].some((value) => value !== undefined);

  if (appearanceSettingsRequested) {
    await navigateToSettingsAppearance(page);

    if (settings.writingMode) {
      await selectSettingsRadio(page, 'Text direction', settings.writingMode);
    }
    if (settings.theme) {
      await page
        .getByRole('button', { name: `${themeDisplayName(settings.theme)} reading colors` })
        .click();
    }
    if (settings.fontSize) {
      await fillSettingsNumber(page, 'Text size', settings.fontSize);
    }
    if (settings.lineHeight) {
      await fillSettingsNumber(page, 'Line height', settings.lineHeight);
    }
    if (settings.furigana) {
      await selectSettingsRadio(page, 'Furigana display', mapFuriganaDisplay(settings.furigana));
    }
    if (settings.blurImages) {
      await selectSettingsRadio(
        page,
        'Image spoiler protection',
        mapImageSpoilerProtection(settings.blurImages)
      );
    }
    if (settings.fontVPAL || settings.verticalTextOrientation) {
      await openSettingsAdvanced(page, 'Advanced typography');
    }
    if (settings.fontVPAL) {
      await selectSettingsRadio(
        page,
        'Vertical character spacing',
        settingValueIsOn(settings.fontVPAL) ? 'Proportional' : 'Standard'
      );
    }
    if (settings.verticalTextOrientation) {
      await selectSettingsRadio(
        page,
        'Latin letters and numbers',
        settings.verticalTextOrientation === 'Upright' ? 'Upright' : 'Mixed'
      );
    }
  }
}

export async function enableStatistics(page: Page) {
  await navigateToSettingsTracking(page);
  const trackingSwitch = page.getByRole('switch', { name: 'Track reading activity' });
  if (!(await trackingSwitch.isChecked())) {
    await trackingSwitch.locator('xpath=ancestor::label[1]').click();
  }
  await expect(trackingSwitch).toBeChecked({ timeout: SYNC_ASSERTION_TIMEOUT });
}

async function selectSettingsRadio(page: Page, groupName: string, optionName: string) {
  const input = page
    .getByRole('group', { name: groupName, exact: true })
    .getByLabel(optionName, { exact: false });
  if (!(await input.isChecked())) {
    await input.locator('xpath=ancestor::label[1]').click();
  }
  await expect(input).toBeChecked();
}

async function fillSettingsNumber(page: Page, label: string, value: string) {
  const input = page.getByLabel(label, { exact: false });
  await input.fill(value);
  await input.blur();
}

async function setSettingsSwitch(page: Page, label: string, checked: boolean) {
  const input = page.getByRole('switch', { name: label, exact: true });
  if ((await input.isChecked()) !== checked) {
    await input.locator('xpath=ancestor::label[1]').click();
  }
  await expect(input).toBeChecked({ checked });
}

async function setProgressFooterField(page: Page, index: number, checked: boolean) {
  const progressFooter = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Progress footer', exact: true })
  });
  await progressFooter.getByRole('checkbox').nth(index).setChecked(checked);
}

async function openSettingsAdvanced(page: Page, title: string) {
  const details = page.locator('details').filter({
    has: page.getByRole('heading', { name: title, exact: true })
  });
  if ((await details.getAttribute('open')) === null) {
    await details.locator('summary').click();
  }
}

function settingValueIsOn(value: string) {
  return value.toLowerCase() === 'on';
}

function mapReadingFlow(value: string) {
  return value === 'Paginated' ? 'Pages' : value === 'Continuous' ? 'Scroll' : value;
}

function mapFuriganaDisplay(value: string) {
  return (
    {
      Default: 'As published',
      Dim: 'Dimmed',
      Toggle: 'Reveal on demand',
      Hide: 'Hidden'
    }[value] ?? value
  );
}

function mapImageSpoilerProtection(value: string) {
  return (
    {
      Off: 'Show images',
      'After ToC': 'Blur story illustrations',
      All: 'Blur all illustrations'
    }[value] ?? value
  );
}

function themeDisplayName(themeId: string) {
  return themeId
    .replace(/-theme$/, '')
    .replaceAll('-', ' ')
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
}

export async function setReadingGoal(
  page: Page,
  { timeGoal, startDate }: { timeGoal: string; startDate: string }
) {
  const { timeGoal: timeGoalInput, startDate: startDateInput } = await openReadingGoals(page);
  await page.getByRole('button', { name: 'Edit' }).click();
  await timeGoalInput.fill(timeGoal);
  await startDateInput.fill(startDate);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  await expect(timeGoalInput).toHaveValue(timeGoal);
  await expect(startDateInput).toHaveValue(startDate);
}

export async function expectReadingGoal(
  page: Page,
  { timeGoal, startDate }: { timeGoal: string; startDate: string }
) {
  const { timeGoal: timeGoalInput, startDate: startDateInput } = await openReadingGoals(page);
  await expect(timeGoalInput).toHaveValue(timeGoal);
  await expect(startDateInput).toHaveValue(startDate);
}

export async function expectReadingGoalsInSyncRoot(page: Page, options?: SyncRootOptions) {
  await expect
    .poll(() => listSyncRoot(page, options), { timeout: SYNC_ASSERTION_TIMEOUT })
    .toEqual([
      {
        kind: 'file',
        name: expect.stringMatching(/^miwake-user-goals_\d+_\d+_\d+\.json$/)
      }
    ]);
}

export async function forceFullResync(
  page: Page,
  direction: 'Keep newest' | 'This device wins' | 'Sync location wins' = 'Keep newest'
) {
  await navigateToSettingsSync(page);
  await waitForSyncIdle(page);
  await forceFullResyncFromSettings(page, direction);
}

/**
 * Drives the Force full re-sync dialog from an already-open Settings → Sync page.
 *
 * Tests that mutate OPFS while already viewing this page use this lower-level helper so the next
 * user action is the re-sync itself. That keeps the test focused on force re-sync instead of route
 * changes or helper setup.
 */
export async function forceFullResyncFromSettings(
  page: Page,
  direction: 'Keep newest' | 'This device wins' | 'Sync location wins' = 'Keep newest'
) {
  await expect(page).toHaveURL('/settings/sync');
  const previousLastSyncedAt = await syncLocationLastSyncedDateTime(page);
  await page.getByRole('button', { name: 'Re-sync' }).click();

  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading')).toContainText('Force full re-sync');

  if (direction !== 'Keep newest') {
    await dialog.getByRole('group', { name: 'Direction' }).getByLabel(direction).check();
  }

  const confirmLabel =
    direction === 'Keep newest'
      ? 'Reconcile'
      : direction === 'This device wins'
        ? 'Push over'
        : 'Pull over';
  await dialog.getByRole('button', { name: confirmLabel }).click();
  await expect(dialog).toHaveCount(0);
  // Settings -> Sync renders the exact last-sync time as `<time datetime>`. Waiting for that
  // value to advance gives the test a durable completion marker, unlike the fleeting "Syncing..."
  // label that fast no-op syncs may never paint.
  await expect
    .poll(() => syncLocationLastSyncedDateTime(page), {
      timeout: SYNC_ASSERTION_TIMEOUT
    })
    .not.toBe(previousLastSyncedAt);
  await waitForSuccessfulSync(page);
}

export async function exportBackup(
  page: Page,
  path: string,
  selection: {
    allBooks?: boolean;
    allBookmarks?: boolean;
    allStatistics?: boolean;
    appSettings?: boolean;
    readingGoals?: boolean;
  }
) {
  await navigateToSettingsSync(page);
  await page.getByRole('button', { name: 'Export' }).click();

  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading', { name: 'Export backup' })).toBeVisible();

  if (selection.readingGoals) {
    await dialog.getByLabel('Reading goals').check();
  }
  if (selection.allBooks) {
    await dialog.getByLabel('Select all').check();
  }
  if (selection.allBookmarks) {
    await dialog.getByLabel('All bookmarks').check();
  }
  if (selection.allStatistics) {
    await dialog.getByLabel('All statistics').check();
  }
  if (selection.appSettings) {
    await dialog.getByLabel('App settings').check();
  }

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Export' }).click()
  ]);
  await download.saveAs(path);
  return download;
}

export async function importBackup(
  page: Page,
  path: string,
  { direction = 'Keep newest' }: { direction?: 'Keep newest' | 'ZIP wins' } = {}
) {
  await navigateToSettingsSync(page);

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Import' }).click()
  ]);
  await fileChooser.setFiles(path);

  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading', { name: 'Import backup' })).toBeVisible();
  await dialog
    .getByRole('group', { name: 'When the ZIP and this device disagree' })
    .getByLabel(direction)
    .check();
  await Promise.all([
    page.waitForURL('/manage', { timeout: 30_000 }),
    dialog.getByRole('button', { name: 'Import' }).click()
  ]);
}

/**
 * Waits for sync work to drain. A connected source only proves the app has a handle or cloud
 * account; it does not prove ambient pushes, boot reconcile, or force re-sync work has finished.
 */
export async function waitForSyncIdle(page: Page) {
  await expect(page.getByRole('link', { name: /^(Synced|Up to date)/ })).toBeVisible({
    timeout: SYNC_ASSERTION_TIMEOUT
  });
}

/**
 * Waits for an explicitly successful sync state. Use this when the scenario needs a completed
 * source operation, not merely an idle "Up to date" state with sync disabled or disconnected.
 */
export async function waitForSuccessfulSync(page: Page) {
  await expect(page.getByRole('link', { name: /^Synced/ })).toBeVisible({
    timeout: SYNC_ASSERTION_TIMEOUT
  });
}

async function openReadingGoals(page: Page) {
  await navigateToStatisticsGoals(page);
  const readingGoalsHeading = page.getByRole('heading', { name: 'Reading Goals' });
  await expect(readingGoalsHeading).toBeVisible({ timeout: SYNC_ASSERTION_TIMEOUT });
  return {
    timeGoal: page.getByLabel('Reading time goal (minutes)'),
    startDate: page.getByLabel('Start date')
  };
}

async function syncLocationLastSyncedDateTime(page: Page) {
  const syncLocationSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Sync location' })
  });
  const lastSyncedTime = syncLocationSection.locator('time[datetime]').first();
  if ((await lastSyncedTime.count()) === 0) return null;

  return lastSyncedTime.getAttribute('datetime');
}
