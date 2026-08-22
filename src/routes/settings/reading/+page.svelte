<script lang="ts">
  import { browser } from '$app/environment';
  import type { SettingsApplicabilityDetails } from '$lib/components/settings/settings-applicability.svelte';
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';
  import SettingsNumberItem from '$lib/components/settings/settings-number-item.svelte';
  import SettingsRadioItem from '$lib/components/settings/settings-radio-item.svelte';
  import SettingsRestoreDefaults from '$lib/components/settings/settings-restore-defaults.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSegmentedControl from '$lib/components/settings/settings-segmented-control.svelte';
  import SettingsSwitchItem from '$lib/components/settings/settings-switch-item.svelte';
  import { readerModeSettingsDefaults, readingSettingsDefaults } from '$lib/data/settings-defaults';
  import {
    autoBookmark$,
    autoBookmarkTime$,
    avoidPageBreak$,
    confirmClose$,
    enableReaderWakeLock$,
    enableTapEdgeToFlip$,
    firstDimensionMargin$,
    pageColumns$,
    pauseTrackerOnCustomPointChange$,
    savePositionOnExit$,
    secondDimensionMaxValue$,
    selectionToBookmarkEnabled$,
    showCharacterCounter$,
    showFooterChapterCharacterCounter$,
    showFooterChapterPercentage$,
    showPercentage$,
    swipeThreshold$,
    viewMode$,
    writingMode$,
    wheelNavigationEnabled$
  } from '$lib/data/store';
  import { formatPageTitle } from '$lib/functions/format-page-title';

  type DimensionMode = 'automatic' | 'custom';
  type LineLengthMode = 'available' | 'custom';

  const pageMarginOptions = [
    {
      id: 'automatic' as const,
      label: 'Automatic',
      description: 'Lets the reader use the available screen space.',
      isDefault: true
    },
    {
      id: 'custom' as const,
      label: 'Custom',
      description: 'Uses the same fixed margin on both sides of the reading area.'
    }
  ];
  const lineLengthOptions = [
    {
      id: 'available' as const,
      label: 'Fit available space',
      description: 'Does not limit the reading area.',
      isDefault: true
    },
    {
      id: 'custom' as const,
      label: 'Custom',
      description: 'Sets a fixed maximum; the reader still shrinks on smaller screens.'
    }
  ];
  const pageColumnOptions = [
    { id: 0, label: 'Auto' },
    { id: 1, label: '1' },
    { id: 2, label: '2' }
  ];
  const swipeSensitivityOptions = [
    { id: 10, label: 'High' },
    { id: 40, label: 'Medium' },
    { id: 80, label: 'Low' }
  ];

  const horizontalPagesApplicability = {
    label: 'Horizontal pages',
    description:
      'Applies only when text direction is set to Horizontal and reading flow is set to Pages.'
  } satisfies SettingsApplicabilityDetails;
  const pagesApplicability = {
    label: 'Pages',
    description: 'Applies only when reading flow is set to Pages.'
  } satisfies SettingsApplicabilityDetails;
  const scrollApplicability = {
    label: 'Scroll',
    description: 'Applies only when reading flow is set to Scroll.'
  } satisfies SettingsApplicabilityDetails;

  let pageMarginMode = $state<DimensionMode>($firstDimensionMargin$ > 0 ? 'custom' : 'automatic');
  let rememberedPageMargin = $state($firstDimensionMargin$ || 24);
  let lineLengthMode = $state<LineLengthMode>(
    $secondDimensionMaxValue$ > 0 ? 'custom' : 'available'
  );
  let rememberedLineLength = $state($secondDimensionMaxValue$ || 960);

  let wakeLockSupported = $derived(browser && 'wakeLock' in navigator);

  function setPageMarginMode(mode: DimensionMode) {
    pageMarginMode = mode;
    if (mode === 'automatic') {
      if ($firstDimensionMargin$ > 0) rememberedPageMargin = $firstDimensionMargin$;
      $firstDimensionMargin$ = 0;
    } else {
      $firstDimensionMargin$ = rememberedPageMargin;
    }
  }

  function setPageMargin(value: number) {
    rememberedPageMargin = value;
    if (pageMarginMode === 'custom' && Number.isFinite(value)) {
      $firstDimensionMargin$ = value;
    }
  }

  function setLineLengthMode(mode: LineLengthMode) {
    lineLengthMode = mode;
    if (mode === 'available') {
      if ($secondDimensionMaxValue$ > 0) rememberedLineLength = $secondDimensionMaxValue$;
      $secondDimensionMaxValue$ = 0;
    } else {
      $secondDimensionMaxValue$ = rememberedLineLength;
    }
  }

  function setLineLength(value: number) {
    rememberedLineLength = value;
    if (lineLengthMode === 'custom' && Number.isFinite(value)) {
      $secondDimensionMaxValue$ = value;
    }
  }

  function restoreDefaults() {
    $writingMode$ = readerModeSettingsDefaults.writingMode;
    $viewMode$ = readerModeSettingsDefaults.viewMode;

    pageMarginMode = 'automatic';
    rememberedPageMargin = 24;
    $firstDimensionMargin$ = readingSettingsDefaults.firstDimensionMargin;
    lineLengthMode = 'available';
    rememberedLineLength = 960;
    $secondDimensionMaxValue$ = readingSettingsDefaults.secondDimensionMaxValue;

    $pageColumns$ = readingSettingsDefaults.pageColumns;
    $avoidPageBreak$ = readingSettingsDefaults.avoidPageBreak;
    $wheelNavigationEnabled$ = readingSettingsDefaults.wheelNavigationEnabled;
    $enableTapEdgeToFlip$ = readingSettingsDefaults.enableTapEdgeToFlip;
    $swipeThreshold$ = readingSettingsDefaults.swipeThreshold;
    $enableReaderWakeLock$ = readingSettingsDefaults.enableReaderWakeLock;
    $autoBookmark$ = readingSettingsDefaults.autoBookmark;
    $autoBookmarkTime$ = readingSettingsDefaults.autoBookmarkTime;
    $savePositionOnExit$ = readingSettingsDefaults.savePositionOnExit;
    $confirmClose$ = readingSettingsDefaults.confirmClose;
    $selectionToBookmarkEnabled$ = readingSettingsDefaults.selectionToBookmarkEnabled;
    $pauseTrackerOnCustomPointChange$ = readingSettingsDefaults.pauseTrackerOnCustomPointChange;
    $showCharacterCounter$ = readingSettingsDefaults.showCharacterCounter;
    $showPercentage$ = readingSettingsDefaults.showPercentage;
    $showFooterChapterCharacterCounter$ = readingSettingsDefaults.showFooterChapterCharacterCounter;
    $showFooterChapterPercentage$ = readingSettingsDefaults.showFooterChapterPercentage;
  }
</script>

<svelte:head>
  <title>{formatPageTitle('Reading Settings')}</title>
</svelte:head>

<SettingsSection title="Layout">
  <SettingsRadioItem
    legend="Page margins"
    description="Blank space above and below horizontal text, or to the left and right of vertical text."
    options={pageMarginOptions}
    bind:value={() => pageMarginMode, setPageMarginMode}
  >
    {#snippet optionControl(option, { labelledBy })}
      {#if option === 'custom'}
        <SettingsNumberInput
          id="reading-custom-page-margin"
          bind:value={() => rememberedPageMargin, setPageMargin}
          unit="px"
          {labelledBy}
          min={1}
          max={1000}
          step={1}
          disabled={pageMarginMode !== 'custom'}
        />
      {/if}
    {/snippet}
  </SettingsRadioItem>

  <SettingsRadioItem
    legend="Maximum reading area"
    description="Limits the width of horizontal text or the height of vertical text."
    options={lineLengthOptions}
    bind:value={() => lineLengthMode, setLineLengthMode}
  >
    {#snippet optionControl(option, { labelledBy })}
      {#if option === 'custom'}
        <SettingsNumberInput
          id="reading-custom-maximum"
          bind:value={() => rememberedLineLength, setLineLength}
          unit="px"
          {labelledBy}
          min={100}
          max={4000}
          step={10}
          disabled={lineLengthMode !== 'custom'}
        />
      {/if}
    {/snippet}
  </SettingsRadioItem>

  <SettingsItem
    label="Text columns"
    description="Auto adds columns as needed to keep each one roughly 1,000 px wide or less."
    applicability={horizontalPagesApplicability}
  >
    {#snippet control()}
      <SettingsSegmentedControl
        label="Text columns"
        options={pageColumnOptions}
        bind:value={$pageColumns$}
      />
    {/snippet}
  </SettingsItem>

  <SettingsSwitchItem
    label="Keep paragraphs on one page"
    description="Avoids splitting a paragraph when possible; this can leave blank space."
    applicability={pagesApplicability}
    bind:checked={$avoidPageBreak$}
  />
</SettingsSection>

<SettingsSection title="Navigation">
  <SettingsSwitchItem
    label="Turn pages with the mouse wheel"
    description="Uses vertical wheel movement to move through the book."
    applicability={pagesApplicability}
    bind:checked={$wheelNavigationEnabled$}
  />
  <SettingsSwitchItem
    label="Tap page edges to turn pages"
    description="Reserves a small area on either edge for page turning."
    applicability={pagesApplicability}
    bind:checked={$enableTapEdgeToFlip$}
  />
  <SettingsItem
    label="Swipe sensitivity"
    description="How far a swipe must travel before the page turns."
    applicability={pagesApplicability}
  >
    {#snippet control()}
      <SettingsSegmentedControl
        label="Swipe sensitivity"
        options={swipeSensitivityOptions}
        bind:value={$swipeThreshold$}
      />
    {/snippet}
  </SettingsItem>

  {#if wakeLockSupported}
    <SettingsSwitchItem
      label="Keep the screen awake while reading"
      description="Prevents this device from dimming or locking while the reader is visible."
      bind:checked={$enableReaderWakeLock$}
    />
  {/if}
</SettingsSection>

<SettingsSection title="Saving your place">
  <SettingsSwitchItem
    label="Save my position while reading"
    description="Updates the bookmark after you stop scrolling or turning pages."
    bind:checked={$autoBookmark$}
  />
  {#if $autoBookmark$}
    <SettingsNumberItem
      label="Save after"
      description="Time without scrolling or turning a page."
      bind:value={$autoBookmarkTime$}
      unit="seconds"
      min={1}
      max={300}
      step={1}
      inset
    />
  {/if}

  <SettingsSwitchItem
    label="Save my position when leaving"
    description="Updates the bookmark before navigating away from the open book."
    bind:checked={$savePositionOnExit$}
  />
  <SettingsSwitchItem
    label="Warn before leaving with unsaved progress"
    description="Asks before navigating away when your position has changed, and before closing or reloading while syncing is unfinished."
    bind:checked={$confirmClose$}
  />

  <SettingsSwitchItem
    label="Anchor bookmarks near selected text"
    description="Prefers selected text; otherwise uses a set reading position or the start of the visible text."
    applicability={pagesApplicability}
    bind:checked={$selectionToBookmarkEnabled$}
  />
  <SettingsSwitchItem
    label="Pause tracking while positioning the marker"
    description="Excludes time spent positioning the marker from your reading statistics."
    applicability={scrollApplicability}
    bind:checked={$pauseTrackerOnCustomPointChange$}
  />
</SettingsSection>

<SettingsSection
  title="Progress footer"
  description="Choose which progress details appear at the bottom of the reader."
>
  <SettingsItem>
    <fieldset class="max-w-full min-w-0 overflow-x-auto">
      <legend class="sr-only">Progress footer fields</legend>
      <div class="grid min-w-96 grid-cols-[minmax(8rem,1fr)_7rem_7rem] text-sm">
        <span class="border-b border-gray-400/40 p-2"></span>
        <span class="border-b border-gray-400/40 p-2 font-medium">Characters</span>
        <span class="border-b border-gray-400/40 p-2 font-medium">Percentage</span>
        <span class="border-b border-gray-400/40 p-2 font-medium">Whole book</span>
        <label class="flex items-center gap-2 border-b border-gray-400/40 p-2">
          <input type="checkbox" bind:checked={$showCharacterCounter$} /> Show
        </label>
        <label class="flex items-center gap-2 border-b border-gray-400/40 p-2">
          <input type="checkbox" bind:checked={$showPercentage$} /> Show
        </label>
        <span class="p-2 font-medium">Current chapter</span>
        <label class="flex items-center gap-2 p-2">
          <input type="checkbox" bind:checked={$showFooterChapterCharacterCounter$} /> Show
        </label>
        <label class="flex items-center gap-2 p-2">
          <input type="checkbox" bind:checked={$showFooterChapterPercentage$} /> Show
        </label>
      </div>
    </fieldset>
  </SettingsItem>
</SettingsSection>

<div class="flex justify-end border-t border-gray-400/40 pt-6">
  <SettingsRestoreDefaults
    pageName="Reading"
    message="This restores the settings shown on this page, including Text direction and Reading flow, to their original values. Your books, bookmarks, and reading data will not be affected."
    onrestore={restoreDefaults}
  />
</div>
