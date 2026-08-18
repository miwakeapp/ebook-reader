<script lang="ts">
  import {
    TrackerAutoPause,
    TrackerSkipThresholdAction
  } from '$lib/components/book-reader/book-reading-tracker/tracker-domain';
  import { showConfirmDialog } from '$lib/components/confirm-dialog.svelte';
  import { showErrorDialog } from '$lib/components/log-report-dialog.svelte';
  import SettingsAdvanced from '$lib/components/settings/settings-advanced.svelte';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';
  import SettingsRadioGroup from '$lib/components/settings/settings-radio-group.svelte';
  import SettingsRow from '$lib/components/settings/settings-row.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSwitchRow from '$lib/components/settings/settings-switch-row.svelte';
  import {
    addCharactersOnCompletion$,
    adjustStatisticsAfterIdleTime$,
    database,
    keepLocalReadingDataOnDeletion$,
    openTrackerOnCompletion$,
    overwriteBookCompletion$,
    startDayHoursForTracker$,
    statisticsEnabled$,
    trackerAutoPause$,
    trackerAutostartTime$,
    trackerBackwardSkipThreshold$,
    trackerForwardSkipThreshold$,
    trackerIdleTime$,
    trackerPopupDetection$,
    trackerSkipThresholdAction$
  } from '$lib/data/store';
  import { formatPageTitle } from '$lib/functions/format-page-title';

  type TrackerStartMode = 'manual' | 'automatic';

  const trackerStartOptions = [
    {
      id: 'manual' as const,
      label: 'Manually',
      description: 'Start each reading session from the tracker in the reader.',
      isDefault: true
    },
    {
      id: 'automatic' as const,
      label: 'Automatically',
      description: 'Start after your reading position has settled for a short delay.'
    }
  ];
  const trackerAutoPauseOptions = [
    {
      id: TrackerAutoPause.OFF,
      label: 'Only for reader events',
      description: 'Pause only when the reader itself knows that reading has stopped.'
    },
    {
      id: TrackerAutoPause.MODERATE,
      label: 'When the reader tab loses focus',
      description: 'Pause when you switch tabs, windows, or apps.',
      isDefault: true
    },
    {
      id: TrackerAutoPause.STRICT,
      label: 'Whenever the site loses focus',
      description: 'Also pause for popups and other focus changes within the browser.'
    }
  ];
  const completionDateOptions = [
    {
      id: 'first' as const,
      label: 'Keep the first completion date',
      description: 'Finishing the book again does not replace its original completion date.',
      isDefault: true
    },
    {
      id: 'latest' as const,
      label: 'Use the latest completion date',
      description: 'Each completion replaces the previously recorded date.'
    }
  ];
  const retentionOptions = [
    {
      id: 'keep' as const,
      label: 'Keep reading data',
      description: 'Preserve bookmarks and statistics in case you add the book again.',
      isDefault: true
    },
    {
      id: 'delete' as const,
      label: 'Delete reading data',
      description: 'Remove bookmarks and statistics along with the local book copy.'
    }
  ];
  const thresholdActionOptions = [
    {
      id: TrackerSkipThresholdAction.IGNORE,
      label: 'Ignore the jump',
      description: 'Do not count the jumped-over characters, then keep tracking.',
      isDefault: true
    },
    {
      id: TrackerSkipThresholdAction.PAUSE,
      label: 'Pause tracking',
      description: 'Stop the session so you can check the new position before continuing.'
    }
  ];
  const dayBoundaryOptions = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${`${hour}`.padStart(2, '0')}:00`
  }));

  function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  let trackerStartMode = $state<TrackerStartMode>(
    $trackerAutostartTime$ > 0 ? 'automatic' : 'manual'
  );
  let rememberedAutostartTime = $state(
    $trackerAutostartTime$ > 0 && Number.isFinite($trackerAutostartTime$)
      ? clamp(Math.floor($trackerAutostartTime$), 1, 300)
      : 3
  );
  let idlePauseEnabled = $state($trackerIdleTime$ > 0);
  let idleMinutes = $state(
    $trackerIdleTime$ > 0 && Number.isFinite($trackerIdleTime$)
      ? clamp($trackerIdleTime$ / 60, 0.5, 720)
      : 15
  );
  let completionDateMode = $state<'first' | 'latest'>(
    $overwriteBookCompletion$ ? 'latest' : 'first'
  );
  let retentionMode = $state<'keep' | 'delete'>(
    $keepLocalReadingDataOnDeletion$ ? 'keep' : 'delete'
  );
  let forwardThresholdEnabled = $state($trackerForwardSkipThreshold$ > 0);
  let backwardThresholdEnabled = $state($trackerBackwardSkipThreshold$ > 0);
  let rememberedForwardThreshold = $state(
    $trackerForwardSkipThreshold$ > 0 && Number.isFinite($trackerForwardSkipThreshold$)
      ? Math.floor($trackerForwardSkipThreshold$)
      : 2700
  );
  let rememberedBackwardThreshold = $state(
    $trackerBackwardSkipThreshold$ > 0 && Number.isFinite($trackerBackwardSkipThreshold$)
      ? Math.floor($trackerBackwardSkipThreshold$)
      : 2700
  );
  let cleanupInProgress = $state(false);
  let cleanupStatus = $state('');

  $effect(() => {
    if (trackerStartMode === 'manual') {
      if ($trackerAutostartTime$ > 0) rememberedAutostartTime = $trackerAutostartTime$;
      $trackerAutostartTime$ = 0;
    } else {
      const seconds =
        Number.isFinite($trackerAutostartTime$) && $trackerAutostartTime$ > 0
          ? clamp(Math.floor($trackerAutostartTime$), 1, 300)
          : rememberedAutostartTime;
      $trackerAutostartTime$ = seconds;
    }
  });

  $effect(() => {
    if (!idlePauseEnabled) {
      if ($trackerIdleTime$ > 0) idleMinutes = $trackerIdleTime$ / 60;
      $trackerIdleTime$ = 0;
    } else {
      const minutes = Number.isFinite(idleMinutes) ? clamp(idleMinutes, 0.5, 720) : 15;
      idleMinutes = minutes;
      $trackerIdleTime$ = Math.floor(minutes * 60);
    }
  });

  $effect(() => {
    const hour = Number.isFinite($startDayHoursForTracker$)
      ? clamp(Math.floor($startDayHoursForTracker$), 0, 23)
      : 0;
    $startDayHoursForTracker$ = hour;
  });

  $effect(() => {
    $overwriteBookCompletion$ = completionDateMode === 'latest';
  });

  $effect(() => {
    $keepLocalReadingDataOnDeletion$ = retentionMode === 'keep';
  });

  $effect(() => {
    if (!forwardThresholdEnabled) {
      if ($trackerForwardSkipThreshold$ > 0) {
        rememberedForwardThreshold = $trackerForwardSkipThreshold$;
      }
      $trackerForwardSkipThreshold$ = 0;
    } else {
      const characters =
        Number.isFinite($trackerForwardSkipThreshold$) && $trackerForwardSkipThreshold$ > 0
          ? Math.floor($trackerForwardSkipThreshold$)
          : rememberedForwardThreshold;
      $trackerForwardSkipThreshold$ = characters;
    }
  });

  $effect(() => {
    if (!backwardThresholdEnabled) {
      if ($trackerBackwardSkipThreshold$ > 0) {
        rememberedBackwardThreshold = $trackerBackwardSkipThreshold$;
      }
      $trackerBackwardSkipThreshold$ = 0;
    } else {
      const characters =
        Number.isFinite($trackerBackwardSkipThreshold$) && $trackerBackwardSkipThreshold$ > 0
          ? Math.floor($trackerBackwardSkipThreshold$)
          : rememberedBackwardThreshold;
      $trackerBackwardSkipThreshold$ = characters;
    }
  });

  async function deleteOrphanedReadingData() {
    const confirmed = await showConfirmDialog({
      title: 'Delete reading data for removed books?',
      message:
        'This permanently deletes bookmarks and statistics for books that are no longer in your library. Reading data for books still in your library is not affected.',
      confirmLabel: 'Delete reading data',
      danger: true
    });
    if (!confirmed) return;

    cleanupInProgress = true;
    cleanupStatus = '';
    try {
      await database.deleteOrphanedReadingData();
      cleanupStatus = 'Reading data for removed books has been deleted.';
    } catch (error) {
      await showErrorDialog({ title: 'Error deleting reading data', error });
    } finally {
      cleanupInProgress = false;
    }
  }
</script>

<svelte:head>
  <title>{formatPageTitle('Tracking Settings')}</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
  <SettingsSection title="Reading activity">
    <SettingsSwitchRow
      label="Track reading activity"
      description="Show the tracker in the reader and record reading time, characters, and speed."
      bind:checked={$statisticsEnabled$}
    />
  </SettingsSection>

  <SettingsSection
    title="Starting and pausing"
    description="These options apply when reading activity tracking is on."
  >
    <SettingsRadioGroup
      legend="Start tracking"
      name="tracker-start"
      options={trackerStartOptions}
      bind:value={trackerStartMode}
      disabled={!$statisticsEnabled$}
    />
    {#if trackerStartMode === 'automatic'}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Start after"
          description="A short delay avoids counting position changes while a book is still opening."
          controlId="tracking-start-after"
          disabled={!$statisticsEnabled$}
        >
          {#snippet control()}
            <SettingsNumberInput
              id="tracking-start-after"
              bind:value={$trackerAutostartTime$}
              unit="seconds"
              min={1}
              max={300}
              step={1}
              disabled={!$statisticsEnabled$}
            />
          {/snippet}
        </SettingsRow>
      </div>
    {/if}

    <SettingsRadioGroup
      legend="Pause tracking"
      description="Choose how readily focus changes pause an active session."
      name="tracker-auto-pause"
      options={trackerAutoPauseOptions}
      bind:value={$trackerAutoPause$}
      disabled={!$statisticsEnabled$}
    />
    {#if $trackerAutoPause$ !== TrackerAutoPause.OFF}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsSwitchRow
          label="Keep tracking during supported dictionary lookups"
          description="Do not pause when a Yomitan or jpdb Browser Reader lookup is detected. Yomitan requires Secure Container to be off."
          bind:checked={$trackerPopupDetection$}
          disabled={!$statisticsEnabled$}
        />
      </div>
    {/if}

    <SettingsSwitchRow
      label="Pause after no page activity"
      description="Automatically pause a session when you stop turning pages or scrolling."
      bind:checked={idlePauseEnabled}
      disabled={!$statisticsEnabled$}
    />
    {#if idlePauseEnabled}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Idle time"
          description="From 30 seconds to 12 hours."
          controlId="tracking-idle-time"
          disabled={!$statisticsEnabled$}
        >
          {#snippet control()}
            <SettingsNumberInput
              id="tracking-idle-time"
              bind:value={idleMinutes}
              unit="minutes"
              min={0.5}
              max={720}
              step={0.5}
              disabled={!$statisticsEnabled$}
            />
          {/snippet}
        </SettingsRow>
        <SettingsSwitchRow
          label="Remove idle time from the session"
          description="Subtract the idle period when the tracker pauses automatically."
          bind:checked={$adjustStatisticsAfterIdleTime$}
          disabled={!$statisticsEnabled$}
        />
      </div>
    {/if}
  </SettingsSection>

  <SettingsSection title="Completing a book">
    <SettingsSwitchRow
      label="Open the tracker on completion"
      description="Show the current session when you mark a book complete."
      bind:checked={$openTrackerOnCompletion$}
      disabled={!$statisticsEnabled$}
    />
    <SettingsSwitchRow
      label="Count unread characters on completion"
      description="Add the characters between your current position and the end of the book."
      bind:checked={$addCharactersOnCompletion$}
      disabled={!$statisticsEnabled$}
    />
    <SettingsRadioGroup
      legend="Completion date"
      name="completion-date"
      options={completionDateOptions}
      bind:value={completionDateMode}
    />
  </SettingsSection>

  <SettingsSection
    title="Day boundary"
    description="Reading before this time counts toward the previous day."
  >
    <SettingsRow
      label="A new reading day starts at"
      description="This affects daily statistics and reading goals."
      controlId="tracking-day-boundary"
    >
      {#snippet control()}
        <select
          id="tracking-day-boundary"
          class="rounded border border-gray-400 bg-white px-3 py-2"
          aria-describedby="tracking-day-boundary-description"
          bind:value={$startDayHoursForTracker$}
        >
          {#each dayBoundaryOptions as option (option.hour)}
            <option value={option.hour}>{option.label}</option>
          {/each}
        </select>
      {/snippet}
    </SettingsRow>
  </SettingsSection>

  <SettingsSection
    title="Reading data when removing books"
    description="Choose what happens to local bookmarks and statistics when you delete a book copy."
  >
    <SettingsRadioGroup
      legend="After removing a book"
      name="reading-data-retention"
      options={retentionOptions}
      bind:value={retentionMode}
    />
    <SettingsRow
      label="Delete data left by books already removed"
      description="Permanently remove orphaned bookmarks and statistics without affecting books still in your library."
    >
      {#snippet control()}
        <button
          type="button"
          class="rounded border border-red-700 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
          disabled={cleanupInProgress}
          onclick={deleteOrphanedReadingData}
        >
          {cleanupInProgress ? 'Deleting…' : 'Delete old data…'}
        </button>
      {/snippet}
    </SettingsRow>
    <p class="min-h-5 pt-2 text-sm text-gray-600" aria-live="polite">{cleanupStatus}</p>
  </SettingsSection>

  <SettingsAdvanced
    title="Advanced tracking options"
    description="Detect unusually large position jumps so they do not distort reading statistics."
  >
    <SettingsSwitchRow
      label="Detect large forward jumps"
      description="Treat moving forward by more than a set number of characters as a skip."
      bind:checked={forwardThresholdEnabled}
      disabled={!$statisticsEnabled$}
    />
    {#if forwardThresholdEnabled}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Forward jump threshold"
          controlId="tracking-forward-jump-threshold"
          disabled={!$statisticsEnabled$}
        >
          {#snippet control()}
            <SettingsNumberInput
              id="tracking-forward-jump-threshold"
              bind:value={$trackerForwardSkipThreshold$}
              unit="characters"
              min={1}
              step={1}
              disabled={!$statisticsEnabled$}
            />
          {/snippet}
        </SettingsRow>
      </div>
    {/if}
    <SettingsSwitchRow
      label="Detect large backward jumps"
      description="Treat moving backward by more than a set number of characters as a skip."
      bind:checked={backwardThresholdEnabled}
      disabled={!$statisticsEnabled$}
    />
    {#if backwardThresholdEnabled}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Backward jump threshold"
          controlId="tracking-backward-jump-threshold"
          disabled={!$statisticsEnabled$}
        >
          {#snippet control()}
            <SettingsNumberInput
              id="tracking-backward-jump-threshold"
              bind:value={$trackerBackwardSkipThreshold$}
              unit="characters"
              min={1}
              step={1}
              disabled={!$statisticsEnabled$}
            />
          {/snippet}
        </SettingsRow>
      </div>
    {/if}
    {#if forwardThresholdEnabled || backwardThresholdEnabled}
      <SettingsRadioGroup
        legend="When a large jump is detected"
        name="skip-threshold-action"
        options={thresholdActionOptions}
        bind:value={$trackerSkipThresholdAction$}
        disabled={!$statisticsEnabled$}
      />
    {/if}
  </SettingsAdvanced>
</div>
