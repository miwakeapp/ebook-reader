<script lang="ts">
  import { browser } from '$app/environment';
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';
  import SettingsNumberItem from '$lib/components/settings/settings-number-item.svelte';
  import SettingsRadioItem from '$lib/components/settings/settings-radio-item.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSegmentedControl from '$lib/components/settings/settings-segmented-control.svelte';
  import SettingsSwitchItem from '$lib/components/settings/settings-switch-item.svelte';
  import {
    autoBookmark$,
    autoBookmarkTime$,
    avoidPageBreak$,
    confirmClose$,
    enableReaderWakeLock$,
    enableTapEdgeToFlip$,
    firstDimensionMargin$,
    horizontalCustomReadingPosition$,
    pageColumns$,
    pauseTrackerOnCustomPointChange$,
    savePositionOnExit$,
    secondDimensionMaxValue$,
    selectionToBookmarkEnabled$,
    showCharacterCounter$,
    showFooterChapterCharacterCounter$,
    showFooterChapterPercentage$,
    showPercentage$,
    statisticsEnabled$,
    swipeThreshold$,
    verticalCustomReadingPosition$,
    viewMode$,
    wheelNavigationEnabled$,
    writingMode$
  } from '$lib/data/store';
  import { ViewMode } from '$lib/data/view-mode';
  import { formatPageTitle } from '$lib/functions/format-page-title';

  type DimensionMode = 'automatic' | 'custom';
  type LineLengthMode = 'available' | 'custom';
  type SwipeSensitivity = 'high' | 'medium' | 'low';

  const readingFlowOptions = [
    { id: ViewMode.Paginated, label: 'Pages' },
    { id: ViewMode.Continuous, label: 'Scroll' }
  ];
  const pageMarginOptions = [
    {
      id: 'automatic' as const,
      label: 'Automatic',
      description: 'Let the reader use the available screen space.',
      isDefault: true
    },
    {
      id: 'custom' as const,
      label: 'Custom',
      description: 'Use the same fixed margin on both sides of the reading area.'
    }
  ];
  const lineLengthOptions = [
    {
      id: 'available' as const,
      label: 'Fit available space',
      description: 'Do not limit the reading area.',
      isDefault: true
    },
    {
      id: 'custom' as const,
      label: 'Custom',
      description: 'Set a fixed maximum; the reader still shrinks on smaller screens.'
    }
  ];
  const pageColumnOptions = [
    { id: 0, label: 'Auto' },
    { id: 1, label: '1' },
    { id: 2, label: '2' }
  ];
  const swipeSensitivityOptions = [
    { id: 'high' as const, label: 'High' },
    { id: 'medium' as const, label: 'Medium' },
    { id: 'low' as const, label: 'Low' }
  ];

  let pageMarginMode = $state<DimensionMode>($firstDimensionMargin$ > 0 ? 'custom' : 'automatic');
  let rememberedPageMargin = $state($firstDimensionMargin$ || 24);
  let lineLengthMode = $state<LineLengthMode>(
    $secondDimensionMaxValue$ > 0 ? 'custom' : 'available'
  );
  let rememberedLineLength = $state($secondDimensionMaxValue$ || 960);
  let swipeSensitivity = $state<SwipeSensitivity>(
    $swipeThreshold$ <= 15 ? 'high' : $swipeThreshold$ <= 55 ? 'medium' : 'low'
  );

  let paginated = $derived($viewMode$ === ViewMode.Paginated);
  let vertical = $derived($writingMode$ === 'vertical-rl');
  let wakeLockSupported = $derived(browser && 'wakeLock' in navigator);

  $effect(() => {
    if (pageMarginMode === 'automatic') {
      if ($firstDimensionMargin$ > 0) rememberedPageMargin = $firstDimensionMargin$;
      $firstDimensionMargin$ = 0;
    } else {
      $firstDimensionMargin$ = rememberedPageMargin;
    }
  });

  $effect(() => {
    if (lineLengthMode === 'available') {
      if ($secondDimensionMaxValue$ > 0) rememberedLineLength = $secondDimensionMaxValue$;
      $secondDimensionMaxValue$ = 0;
    } else {
      $secondDimensionMaxValue$ = rememberedLineLength;
    }
  });

  $effect(() => {
    $swipeThreshold$ = swipeSensitivity === 'high' ? 10 : swipeSensitivity === 'medium' ? 40 : 80;
  });

  $effect(() => {
    if (!$autoBookmarkTime$ || $autoBookmarkTime$ < 1) $autoBookmarkTime$ = 3;
  });

  $effect(() => {
    if ($savePositionOnExit$) $confirmClose$ = false;
  });

  function resetReadingMarker() {
    $verticalCustomReadingPosition$ = 100;
    $horizontalCustomReadingPosition$ = 0;
  }
</script>

<svelte:head>
  <title>{formatPageTitle('Reading Settings')}</title>
</svelte:head>

<SettingsSection title="Layout">
  <SettingsItem
    label="Reading flow"
    description="Turn pages or scroll through one continuous document."
  >
    {#snippet control()}
      <SettingsSegmentedControl
        label="Reading flow"
        options={readingFlowOptions}
        bind:value={$viewMode$}
      />
    {/snippet}
  </SettingsItem>

  {#if paginated && !vertical}
    <SettingsItem
      label="Text columns"
      description="Auto adds columns as needed to keep each one roughly 1,000 px wide or less."
      inset
    >
      {#snippet control()}
        <SettingsSegmentedControl
          label="Text columns"
          options={pageColumnOptions}
          bind:value={$pageColumns$}
        />
      {/snippet}
    </SettingsItem>
  {/if}

  {#if paginated}
    <SettingsSwitchItem
      label="Keep paragraphs on one page"
      description="Avoid splitting a paragraph between pages when possible; this can leave blank space."
      bind:checked={$avoidPageBreak$}
      inset
    />
  {/if}

  <SettingsRadioItem
    legend="Page margins"
    description={vertical
      ? 'Blank space to the left and right of vertical text.'
      : 'Blank space above and below horizontal text.'}
    options={pageMarginOptions}
    bind:value={pageMarginMode}
  >
    {#snippet optionControl(option, { labelledBy })}
      {#if option === 'custom'}
        <SettingsNumberInput
          id="reading-custom-page-margin"
          bind:value={rememberedPageMargin}
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
    legend={vertical ? 'Maximum reading area height' : 'Maximum reading area width'}
    description={vertical
      ? 'Limits the overall height available to vertical text.'
      : 'Limits the overall width available to horizontal text.'}
    options={lineLengthOptions}
    bind:value={lineLengthMode}
  >
    {#snippet optionControl(option, { labelledBy })}
      {#if option === 'custom'}
        <SettingsNumberInput
          id="reading-custom-maximum"
          bind:value={rememberedLineLength}
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
</SettingsSection>

<SettingsSection title="Navigation">
  {#if paginated}
    <SettingsSwitchItem
      label="Turn pages with the mouse wheel"
      description="Use vertical wheel movement to move through paginated books."
      bind:checked={$wheelNavigationEnabled$}
    />
    <SettingsSwitchItem
      label="Tap page edges to turn pages"
      description="Reserve a small area on either edge for page turning."
      bind:checked={$enableTapEdgeToFlip$}
    />
    <SettingsItem
      label="Swipe sensitivity"
      description="How far a swipe must travel before the page turns."
    >
      {#snippet control()}
        <SettingsSegmentedControl
          label="Swipe sensitivity"
          options={swipeSensitivityOptions}
          bind:value={swipeSensitivity}
        />
      {/snippet}
    </SettingsItem>
  {:else}
    <SettingsItem>
      <p class="text-sm text-gray-600">
        Page-turning controls appear here when Reading flow is set to Pages.
      </p>
    </SettingsItem>
  {/if}

  {#if wakeLockSupported}
    <SettingsSwitchItem
      label="Keep the screen awake while reading"
      description="Prevent this device from dimming or locking while the reader is visible."
      bind:checked={$enableReaderWakeLock$}
    />
  {/if}
</SettingsSection>

<SettingsSection title="Saving your place">
  <SettingsSwitchItem
    label="Save my position while reading"
    description="Bookmark your position after a short pause in page movement."
    bind:checked={$autoBookmark$}
  />
  {#if $autoBookmark$}
    <SettingsNumberItem
      label="Save after"
      description="Time without scrolling or changing pages."
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
    description="Update the bookmark before returning to the library or another app page."
    bind:checked={$savePositionOnExit$}
  />
  {#if !$savePositionOnExit$}
    <SettingsSwitchItem
      label="Warn before leaving with unsaved progress"
      description="Ask for confirmation when the latest position has not been bookmarked."
      bind:checked={$confirmClose$}
      inset
    />
  {/if}

  {#if paginated}
    <SettingsSwitchItem
      label="Anchor bookmarks near selected text"
      description="Use current or recently selected text instead of the page start when placing a bookmark."
      bind:checked={$selectionToBookmarkEnabled$}
    />
  {:else}
    {#if $statisticsEnabled$}
      <SettingsSwitchItem
        label="Pause tracking while moving the marker"
        description="Resume tracking automatically after the marker has been placed."
        bind:checked={$pauseTrackerOnCustomPointChange$}
      />
    {/if}
    <SettingsItem
      label="Reset reading marker"
      description="Return the marker to its default position for each text direction."
    >
      {#snippet control()}
        <button
          type="button"
          class="rounded border border-gray-500 px-3 py-1.5 text-sm font-medium hover:bg-gray-400/15"
          onclick={resetReadingMarker}
        >
          Reset marker
        </button>
      {/snippet}
    </SettingsItem>
  {/if}
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
