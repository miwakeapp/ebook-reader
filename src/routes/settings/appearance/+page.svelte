<script lang="ts">
  import { onMount } from 'svelte';
  import FontPicker from '$lib/components/settings/font-picker.svelte';
  import DisplayReaderPreview from '$lib/components/settings/display/display-reader-preview.svelte';
  import DisplayThemePicker from '$lib/components/settings/display/display-theme-picker.svelte';
  import SettingsAdvanced from '$lib/components/settings/settings-advanced.svelte';
  import SettingsList from '$lib/components/settings/settings-list.svelte';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';
  import SettingsRadioGroup from '$lib/components/settings/settings-radio-group.svelte';
  import SettingsRow from '$lib/components/settings/settings-row.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSegmentedControl from '$lib/components/settings/settings-segmented-control.svelte';
  import SettingsSwitchRow from '$lib/components/settings/settings-switch-row.svelte';
  import { BlurMode } from '$lib/data/blur-mode';
  import { furiganaStyleOptions } from '$lib/data/furigana-style';
  import type { VerticalTextOrientation } from '$lib/data/vertical-text-orientation';
  import {
    blurImageMode$,
    enableFontVPAL$,
    enableTextJustification$,
    enableTextWrapPretty$,
    fontFamilyGroupOne$,
    fontFamilyGroupTwo$,
    fontSize$,
    furiganaStyle$,
    lineHeight$,
    prioritizeReaderStyles$,
    simplifyBookTitles$,
    textIndentation$,
    textMarginMode$,
    textMarginValue$,
    verticalTextOrientation$,
    writingMode$
  } from '$lib/data/store';
  import { formatPageTitle } from '$lib/functions/format-page-title';

  const bookTitleOptions = [
    {
      id: 'simplified' as const,
      label: 'Simplified',
      description:
        'Hide recognized edition, imprint, and bundled-content suffixes. Stored titles are unchanged.',
      isDefault: true
    },
    {
      id: 'full' as const,
      label: 'Full',
      description: 'Show each imported book title exactly as it is stored.'
    }
  ];

  const paragraphSpacingOptions = [
    { id: 'auto' as const, label: 'Book' },
    { id: 'manual' as const, label: 'Custom' }
  ];

  const writingDirectionOptions = [
    { id: 'vertical-rl' as const, label: 'Vertical' },
    { id: 'horizontal-tb' as const, label: 'Horizontal' }
  ];

  const paragraphAlignmentOptions = [
    {
      id: 'book' as const,
      label: 'Book formatting',
      description: 'Keep the paragraph alignment supplied by the book.',
      isDefault: true
    },
    {
      id: 'justified' as const,
      label: 'Justified',
      description: 'Align text evenly along both edges of each paragraph.'
    }
  ];

  const imageSpoilerOptions = [
    {
      id: BlurMode.OFF,
      label: 'Show images',
      description: 'Display illustrations immediately.',
      isDefault: true
    },
    {
      id: BlurMode.AFTER_TOC,
      label: 'Blur story illustrations',
      description: 'Show the cover and table of contents, then blur later illustrations.'
    },
    {
      id: BlurMode.ALL,
      label: 'Blur all illustrations',
      description: 'Blur every non-inline illustration, including the cover.'
    }
  ];

  const verticalOrientationOptions = [
    {
      id: 'mixed' as VerticalTextOrientation,
      label: 'Mixed',
      description: 'Turn unformatted halfwidth Latin letters and numbers sideways.',
      isDefault: true
    },
    {
      id: 'upright' as VerticalTextOrientation,
      label: 'Upright',
      description: 'Keep unformatted halfwidth Latin letters and numbers upright.'
    }
  ];

  const verticalSpacingOptions = [
    {
      id: 'standard' as const,
      label: 'Standard',
      description: 'Use the font’s normal full-height vertical spacing.',
      isDefault: true
    },
    {
      id: 'proportional' as const,
      label: 'Proportional',
      description: 'Use proportional vertical metrics when the selected font provides them.'
    }
  ];

  let verticalMode = $derived($writingMode$ === 'vertical-rl');
  let bookTitleDisplay = $state<'simplified' | 'full'>(
    $simplifyBookTitles$ ? 'simplified' : 'full'
  );
  let paragraphAlignment = $state<'book' | 'justified'>(
    $enableTextJustification$ ? 'justified' : 'book'
  );
  let verticalSpacing = $state<'standard' | 'proportional'>(
    $enableFontVPAL$ ? 'proportional' : 'standard'
  );
  let prettyTextWrapSupported: boolean | undefined = $state();
  let prettyTextWrapDescription = $derived(
    prettyTextWrapSupported === false
      ? 'This browser does not support improved line breaking; the preference still applies in browsers that do.'
      : 'Use a slower, higher-quality layout pass to improve wrapping; many paragraphs will look unchanged.'
  );

  onMount(() => {
    prettyTextWrapSupported = CSS.supports('text-wrap', 'pretty');
  });

  $effect(() => {
    $simplifyBookTitles$ = bookTitleDisplay === 'simplified';
  });

  $effect(() => {
    $enableTextJustification$ = paragraphAlignment === 'justified';
  });

  $effect(() => {
    $enableFontVPAL$ = verticalSpacing === 'proportional';
  });
</script>

<svelte:head>
  <title>{formatPageTitle('Appearance Settings')}</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
  <div class="appearance-layout">
    <div class="app-settings">
      <SettingsSection title="Book titles" headingId="book-title-display-heading">
        <SettingsList>
          <SettingsRadioGroup
            labelledBy="book-title-display-heading"
            name="book-title-display"
            options={bookTitleOptions}
            bind:value={bookTitleDisplay}
          />
        </SettingsList>
      </SettingsSection>
    </div>

    <div class="color-settings">
      <SettingsSection
        title="Reader colors"
        description="Choose a built-in palette or create colors that are comfortable for long reading sessions."
      >
        <DisplayThemePicker />
      </SettingsSection>
    </div>

    <div class="preview-settings">
      <DisplayReaderPreview />
    </div>

    <div class="typography-settings">
      <SettingsSection
        title="Reader Typography"
        description="Set the typefaces, size, and paragraph rhythm used in the reader."
      >
        <SettingsList>
          <SettingsRow label="Text direction">
            {#snippet control()}
              <SettingsSegmentedControl
                label="Text direction"
                options={writingDirectionOptions}
                bind:value={$writingMode$}
              />
            {/snippet}
          </SettingsRow>

          <div class="font-pickers" data-settings-item>
            <FontPicker group="serif" bind:selectedFont={$fontFamilyGroupOne$} />
            <FontPicker group="sans-serif" bind:selectedFont={$fontFamilyGroupTwo$} />
          </div>

          <SettingsRow label="Text size" controlId="appearance-text-size">
            {#snippet control()}
              <SettingsNumberInput
                id="appearance-text-size"
                bind:value={$fontSize$}
                unit="px"
                min={1}
                step={1}
              />
            {/snippet}
          </SettingsRow>

          <SettingsRow label="Line height" controlId="appearance-line-height">
            {#snippet control()}
              <SettingsNumberInput
                id="appearance-line-height"
                bind:value={$lineHeight$}
                unit="× text size"
                min={1}
                step={0.05}
              />
            {/snippet}
          </SettingsRow>

          <SettingsRow
            label="First-line indent"
            description="Extra indentation at the start of each paragraph."
            controlId="appearance-first-line-indent"
          >
            {#snippet control()}
              <SettingsNumberInput
                id="appearance-first-line-indent"
                bind:value={$textIndentation$}
                unit="rem"
                min={0}
                step={0.5}
              />
            {/snippet}
          </SettingsRow>

          <SettingsRow
            label="Paragraph gap"
            description="Custom sets the space before and after each paragraph."
            controlId="appearance-paragraph-gap"
          >
            {#snippet control()}
              <div class="compound-control">
                <SettingsSegmentedControl
                  label="Paragraph spacing source"
                  options={paragraphSpacingOptions}
                  bind:value={$textMarginMode$}
                />
                <SettingsNumberInput
                  id="appearance-paragraph-gap"
                  bind:value={$textMarginValue$}
                  unit="rem"
                  min={0}
                  step={0.5}
                  disabled={$textMarginMode$ === 'auto'}
                />
              </div>
            {/snippet}
          </SettingsRow>

          <SettingsRadioGroup
            legend="Paragraph alignment"
            name="paragraph-alignment"
            options={paragraphAlignmentOptions}
            bind:value={paragraphAlignment}
          />
        </SettingsList>
      </SettingsSection>
    </div>

    <div class="aid-settings">
      <SettingsSection
        title="Reading aids"
        description="Control how language hints and potentially revealing illustrations appear."
      >
        <SettingsList>
          <SettingsRadioGroup
            legend="Furigana display"
            description="Choose how pronunciation readings above or beside Japanese text are shown."
            name="furigana-display"
            options={furiganaStyleOptions}
            bind:value={$furiganaStyle$}
          />

          <SettingsRadioGroup
            legend="Image spoiler protection"
            description="Blur illustrations until you deliberately reveal them. Inline symbols and decorative glyphs are not blurred."
            name="image-spoiler-protection"
            options={imageSpoilerOptions}
            bind:value={$blurImageMode$}
          />
        </SettingsList>
      </SettingsSection>
    </div>

    <div class="advanced-settings">
      <SettingsAdvanced
        title="Advanced typography"
        description="Fine-tune how the reader handles book styles and browser typography features."
      >
        <SettingsList>
          <SettingsSwitchRow
            label="Prioritize reader paragraph formatting"
            description="Make your paragraph gap, first-line indent, alignment, and improved line breaks override conflicting styles in the book."
            bind:checked={$prioritizeReaderStyles$}
          />

          <SettingsSwitchRow
            label="Improve paragraph line breaks"
            description={prettyTextWrapDescription}
            bind:checked={$enableTextWrapPretty$}
          />

          {#if verticalMode}
            <SettingsRadioGroup
              legend="Latin letters and numbers"
              description="Sets the fallback when a book does not specify an orientation. Fullwidth forms and vertically combined runs remain upright in either mode."
              name="vertical-text-orientation"
              options={verticalOrientationOptions}
              bind:value={$verticalTextOrientation$}
            />

            <SettingsRadioGroup
              legend="Vertical character spacing"
              description="Proportional spacing only changes fonts that provide alternate vertical metrics."
              name="vertical-character-spacing"
              options={verticalSpacingOptions}
              bind:value={verticalSpacing}
            />
          {/if}
        </SettingsList>
      </SettingsAdvanced>
    </div>
  </div>
</div>

<style>
  .appearance-layout {
    display: grid;
  }

  .preview-settings {
    min-width: 0;
    padding-bottom: 2rem;
  }

  @media (width >= 64rem) {
    .appearance-layout {
      grid-template-areas:
        'app preview'
        'colors preview'
        'typography preview'
        'aids preview'
        'advanced preview';
      grid-template-columns: minmax(0, 1fr) 20rem;
      column-gap: 1.5rem;
      align-items: start;
    }

    .app-settings {
      grid-area: app;
    }

    .color-settings {
      grid-area: colors;
    }

    .preview-settings {
      grid-area: preview;
      height: 100%;
      padding-top: 1rem;
      padding-bottom: 0;
    }

    .typography-settings {
      grid-area: typography;
    }

    .aid-settings {
      grid-area: aids;
    }

    .advanced-settings {
      grid-area: advanced;
    }
  }

  .font-pickers {
    display: grid;
    gap: 1rem;
    padding-block: 0.875rem;

    @media (width >= 40rem) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    :global(section) {
      padding-bottom: 0;
    }

    :global(h2) {
      font-size: 1rem;
    }
  }

  .compound-control {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
