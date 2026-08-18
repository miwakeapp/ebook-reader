<script lang="ts">
  import { browser } from '$app/environment';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';
  import SettingsRadioGroup from '$lib/components/settings/settings-radio-group.svelte';
  import SettingsRow from '$lib/components/settings/settings-row.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSegmentedControl from '$lib/components/settings/settings-segmented-control.svelte';
  import SettingsSwitchRow from '$lib/components/settings/settings-switch-row.svelte';
  import {
    autoBookmark$,
    autoBookmarkTime$,
    avoidPageBreak$,
    confirmClose$,
    customReadingPointEnabled$,
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
  type PageColumnMode = 'automatic' | 'one' | 'two';
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
      description: 'Do not impose a maximum line length.',
      isDefault: true
    },
    {
      id: 'custom' as const,
      label: 'Custom',
      description: 'Limit line length to a fixed size.'
    }
  ];
  const pageColumnOptions = [
    { id: 'automatic' as const, label: 'Auto' },
    { id: 'one' as const, label: '1' },
    { id: 'two' as const, label: '2' }
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
  let pageColumnMode = $state<PageColumnMode>(
    $pageColumns$ === 1 ? 'one' : $pageColumns$ === 2 ? 'two' : 'automatic'
  );
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
    } else if ($firstDimensionMargin$ <= 0) {
      $firstDimensionMargin$ = rememberedPageMargin;
    }
  });

  $effect(() => {
    if (lineLengthMode === 'available') {
      if ($secondDimensionMaxValue$ > 0) rememberedLineLength = $secondDimensionMaxValue$;
      $secondDimensionMaxValue$ = 0;
    } else if ($secondDimensionMaxValue$ <= 0) {
      $secondDimensionMaxValue$ = rememberedLineLength;
    }
  });

  $effect(() => {
    $pageColumns$ = pageColumnMode === 'one' ? 1 : pageColumnMode === 'two' ? 2 : 0;
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

<div class="mx-auto max-w-5xl">
  <SettingsSection title="Layout">
    <SettingsRow
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
    </SettingsRow>

    <SettingsRadioGroup
      legend="Page margins"
      description={vertical
        ? 'Blank space to the left and right of vertical text.'
        : 'Blank space above and below horizontal text.'}
      name="page-margins"
      options={pageMarginOptions}
      bind:value={pageMarginMode}
    />
    {#if pageMarginMode === 'custom'}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Custom page margin"
          description="A fixed CSS-pixel value on each side."
          controlId="reading-custom-page-margin"
        >
          {#snippet control()}
            <SettingsNumberInput
              id="reading-custom-page-margin"
              bind:value={$firstDimensionMargin$}
              unit="px"
              min={1}
              max={1000}
              step={1}
            />
          {/snippet}
        </SettingsRow>
      </div>
    {/if}

    <SettingsRadioGroup
      legend="Maximum line length"
      description={vertical
        ? 'Limits the height of each vertical line.'
        : 'Limits the width of each horizontal line.'}
      name="maximum-line-length"
      options={lineLengthOptions}
      bind:value={lineLengthMode}
    />
    {#if lineLengthMode === 'custom'}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Custom maximum"
          description="A fixed CSS-pixel limit; the reader still shrinks on smaller screens."
          controlId="reading-custom-maximum"
        >
          {#snippet control()}
            <SettingsNumberInput
              id="reading-custom-maximum"
              bind:value={$secondDimensionMaxValue$}
              unit="px"
              min={100}
              max={4000}
              step={10}
            />
          {/snippet}
        </SettingsRow>
      </div>
    {/if}

    {#if paginated && !vertical}
      <SettingsRow
        label="Text columns"
        description="Auto adds another column on sufficiently wide screens."
      >
        {#snippet control()}
          <SettingsSegmentedControl
            label="Text columns"
            options={pageColumnOptions}
            bind:value={pageColumnMode}
          />
        {/snippet}
      </SettingsRow>
    {/if}

    {#if paginated}
      <SettingsSwitchRow
        label="Keep paragraphs on one page"
        description="Avoid splitting a paragraph between pages when possible; this can leave blank space."
        bind:checked={$avoidPageBreak$}
      />
    {/if}
  </SettingsSection>

  <SettingsSection title="Navigation">
    {#if paginated}
      <SettingsSwitchRow
        label="Turn pages with the mouse wheel"
        description="Use vertical wheel movement to move through paginated books."
        bind:checked={$wheelNavigationEnabled$}
      />
      <SettingsSwitchRow
        label="Tap page edges to turn pages"
        description="Reserve a small area on either edge for page turning."
        bind:checked={$enableTapEdgeToFlip$}
      />
      <SettingsRow
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
      </SettingsRow>
    {:else}
      <p class="py-3 text-sm text-gray-600">
        Page-turning controls appear here when Reading flow is set to Pages.
      </p>
    {/if}

    {#if wakeLockSupported}
      <SettingsSwitchRow
        label="Keep the screen awake while reading"
        description="Prevent this device from dimming or locking while the reader is visible."
        bind:checked={$enableReaderWakeLock$}
      />
    {/if}
  </SettingsSection>

  <SettingsSection title="Saving your place">
    <SettingsSwitchRow
      label="Save my position while reading"
      description="Bookmark your position after a short pause in page movement."
      bind:checked={$autoBookmark$}
    />
    {#if $autoBookmark$}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsRow
          label="Save after"
          description="Time without scrolling or changing pages."
          controlId="reading-save-after"
        >
          {#snippet control()}
            <SettingsNumberInput
              id="reading-save-after"
              bind:value={$autoBookmarkTime$}
              unit="seconds"
              min={1}
              max={300}
              step={1}
            />
          {/snippet}
        </SettingsRow>
      </div>
    {/if}

    <SettingsSwitchRow
      label="Save my position when leaving"
      description="Update the bookmark before returning to the library or another app page."
      bind:checked={$savePositionOnExit$}
    />
    {#if !$savePositionOnExit$}
      <div class="ml-7 border-l border-gray-400/40 pl-4">
        <SettingsSwitchRow
          label="Warn before leaving with unsaved progress"
          description="Ask for confirmation when the latest position has not been bookmarked."
          bind:checked={$confirmClose$}
        />
      </div>
    {/if}

    {#if paginated}
      <SettingsSwitchRow
        label="Anchor bookmarks near selected text"
        description="Use current or recently selected text instead of the page start when placing a bookmark."
        bind:checked={$selectionToBookmarkEnabled$}
      />
    {:else}
      <SettingsSwitchRow
        label="Use a fixed reading marker"
        description="Calculate progress and bookmarks from a persistent marker that you position in the reader."
        bind:checked={$customReadingPointEnabled$}
      />
      {#if $customReadingPointEnabled$}
        <div class="ml-7 border-l border-gray-400/40 pl-4">
          {#if $statisticsEnabled$}
            <SettingsSwitchRow
              label="Pause tracking while moving the marker"
              description="Resume tracking automatically after the marker has been placed."
              bind:checked={$pauseTrackerOnCustomPointChange$}
            />
          {/if}
          <SettingsRow
            label="Reset reading marker"
            description="Return the horizontal and vertical markers to their default positions."
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
          </SettingsRow>
        </div>
      {/if}
    {/if}
  </SettingsSection>

  <SettingsSection
    title="Progress footer"
    description="Choose which progress details appear at the bottom of the reader."
  >
    <fieldset class="overflow-x-auto py-3">
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
  </SettingsSection>
</div>
