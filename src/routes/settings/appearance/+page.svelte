<script lang="ts">
  import { onMount } from 'svelte';
  import FontPicker from '$lib/components/settings/font-picker.svelte';
  import DisplayReaderPreview from '$lib/components/settings/display/display-reader-preview.svelte';
  import DisplayThemePicker from '$lib/components/settings/display/display-theme-picker.svelte';
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';
  import SettingsNumberItem from '$lib/components/settings/settings-number-item.svelte';
  import SettingsRadioItem from '$lib/components/settings/settings-radio-item.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSegmentedControl from '$lib/components/settings/settings-segmented-control.svelte';
  import SettingsSwitchItem from '$lib/components/settings/settings-switch-item.svelte';
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
      id: true,
      label: 'Simplified',
      description:
        'Hide recognized edition, imprint, and bundled-content suffixes. Stored titles are unchanged.',
      isDefault: true
    },
    {
      id: false,
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
      id: false,
      label: 'Book formatting',
      description: 'Keep the paragraph alignment supplied by the book.',
      isDefault: true
    },
    {
      id: true,
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
      id: false,
      label: 'Standard',
      description: 'Use the font’s normal full-height vertical spacing.',
      isDefault: true
    },
    {
      id: true,
      label: 'Proportional',
      description: 'Use proportional vertical metrics when the selected font provides them.'
    }
  ];

  let prettyTextWrapSupported: boolean | undefined = $state();
  let prettyTextWrapDescription = $derived(
    prettyTextWrapSupported === false
      ? 'This browser does not support improved line breaking; the preference still applies in browsers that do.'
      : 'Use a slower, higher-quality layout pass to improve wrapping; many paragraphs will look unchanged.'
  );

  onMount(() => {
    prettyTextWrapSupported = CSS.supports('text-wrap', 'pretty');
  });
</script>

<svelte:head>
  <title>{formatPageTitle('Appearance Settings')}</title>
</svelte:head>

<div class="appearance-layout">
  <SettingsSection
    class="lg:[grid-area:app]"
    title="Book titles"
    headingId="book-title-display-heading"
  >
    <SettingsRadioItem
      labelledBy="book-title-display-heading"
      options={bookTitleOptions}
      bind:value={$simplifyBookTitles$}
    />
  </SettingsSection>

  <SettingsSection
    class="lg:[grid-area:colors]"
    title="Reader colors"
    description="Choose a built-in palette or create colors that are comfortable for long reading sessions."
  >
    <SettingsItem>
      <DisplayThemePicker />
    </SettingsItem>
  </SettingsSection>

  <DisplayReaderPreview class="min-w-0 lg:[grid-area:preview]" />

  <SettingsSection
    class="lg:[grid-area:typography]"
    title="Reader Typography"
    description="Set the typefaces, size, and paragraph rhythm used in the reader."
  >
    <SettingsItem label="Text direction">
      {#snippet control()}
        <SettingsSegmentedControl
          label="Text direction"
          options={writingDirectionOptions}
          bind:value={$writingMode$}
        />
      {/snippet}
    </SettingsItem>

    <SettingsItem class="grid gap-4 sm:grid-cols-2">
      <FontPicker group="serif" bind:selectedFont={$fontFamilyGroupOne$} />
      <FontPicker group="sans-serif" bind:selectedFont={$fontFamilyGroupTwo$} />
    </SettingsItem>

    <SettingsNumberItem label="Text size" bind:value={$fontSize$} unit="px" min={1} step={1} />

    <SettingsNumberItem
      label="Line height"
      bind:value={$lineHeight$}
      unit="× text size"
      min={1}
      step={0.05}
    />

    <SettingsNumberItem
      label="First-line indent"
      description="Extra indentation at the start of each paragraph."
      bind:value={$textIndentation$}
      unit="rem"
      min={0}
      step={0.5}
    />

    <SettingsItem
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
            labelledBy="appearance-paragraph-gap-label"
            describedBy="appearance-paragraph-gap-description"
            min={0}
            step={0.5}
            disabled={$textMarginMode$ === 'auto'}
          />
        </div>
      {/snippet}
    </SettingsItem>

    <SettingsRadioItem
      legend="Paragraph alignment"
      options={paragraphAlignmentOptions}
      bind:value={$enableTextJustification$}
    />
  </SettingsSection>

  <SettingsSection
    class="lg:[grid-area:aids]"
    title="Reading aids"
    description="Control how language hints and potentially revealing illustrations appear."
  >
    <SettingsRadioItem
      legend="Furigana display"
      description="Choose how pronunciation readings above or beside Japanese text are shown."
      options={furiganaStyleOptions}
      bind:value={$furiganaStyle$}
    />

    <SettingsRadioItem
      legend="Image spoiler protection"
      description="Blur illustrations until you deliberately reveal them. Inline symbols and decorative glyphs are not blurred."
      options={imageSpoilerOptions}
      bind:value={$blurImageMode$}
    />
  </SettingsSection>

  <SettingsSection
    class="lg:[grid-area:advanced]"
    title="Advanced typography"
    description="Fine-tune how the reader handles book styles and browser typography features."
    collapsible
  >
    <SettingsSwitchItem
      label="Prioritize reader paragraph formatting"
      description="Make your paragraph gap, first-line indent, alignment, and improved line breaks override conflicting styles in the book."
      bind:checked={$prioritizeReaderStyles$}
    />

    <SettingsSwitchItem
      label="Improve paragraph line breaks"
      description={prettyTextWrapDescription}
      bind:checked={$enableTextWrapPretty$}
    />

    <SettingsRadioItem
      legend="Latin letters and numbers in vertical text"
      description="Controls the fallback orientation for unformatted halfwidth Latin letters and numbers. Fullwidth forms and vertically combined runs remain upright."
      options={verticalOrientationOptions}
      bind:value={$verticalTextOrientation$}
    />

    <SettingsRadioItem
      legend="Vertical character spacing"
      description="Applies only to vertical text. Proportional spacing changes fonts that provide alternate vertical metrics."
      options={verticalSpacingOptions}
      bind:value={$enableFontVPAL$}
    />
  </SettingsSection>
</div>

<style>
  .appearance-layout {
    display: grid;
    gap: 2rem;
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
      row-gap: 2rem;
      align-items: start;
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
