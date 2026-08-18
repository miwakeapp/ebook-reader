<script lang="ts">
  import { browser } from '$app/environment';
  import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { showThemeEditorDialog } from '$lib/components/settings/theme-editor-dialog.svelte';
  import { customThemes$, theme$ } from '$lib/data/store';
  import { availableThemes } from '$lib/data/theme-option';
  import Fa from 'svelte-fa';

  function displayName(id: string) {
    return id
      .replace(/-theme$/, '')
      .replaceAll('-', ' ')
      .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
  }

  let themes = $derived.by(() => {
    const choices = [...availableThemes.entries()];

    if (browser) {
      choices.push(...Object.entries($customThemes$));
    }

    return choices.map(([id, option]) => ({
      id,
      option,
      label: displayName(id),
      custom: !availableThemes.has(id)
    }));
  });

  let editorThemes = $derived(themes.map(({ id, label }) => ({ id, text: label })));

  function removeTheme(id: string) {
    const nextThemes = { ...$customThemes$ };
    delete nextThemes[id];
    $customThemes$ = nextThemes;

    if ($theme$ === id) {
      $theme$ = 'light-theme';
    }
  }
</script>

<div class="theme-grid">
  {#each themes as theme (theme.id)}
    <div class="theme-choice">
      <button
        type="button"
        class="swatch"
        class:selected={$theme$ === theme.id}
        aria-pressed={$theme$ === theme.id}
        aria-label={`${theme.label} reading colors`}
        onclick={() => ($theme$ = theme.id)}
      >
        <span
          class="sample"
          lang="ja"
          style:color={theme.option.fontColor}
          style:background-color={theme.option.backgroundColor}>ぁあ</span
        >
        <span class="label">{theme.label}</span>
      </button>

      {#if theme.custom}
        <div class="theme-actions" aria-label={`${theme.label} actions`}>
          <button
            type="button"
            aria-label={`Edit ${theme.label}`}
            onclick={() =>
              showThemeEditorDialog({ selectedTheme: theme.id, existingThemes: editorThemes })}
          >
            <Fa icon={faPen} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${theme.label}`}
            onclick={() => removeTheme(theme.id)}
          >
            <Fa icon={faTrash} />
          </button>
        </div>
      {/if}
    </div>
  {/each}

  {#if browser}
    <button
      type="button"
      class="new-theme"
      onclick={() => showThemeEditorDialog({ existingThemes: editorThemes })}
    >
      <Fa icon={faPlus} />
      <span>New theme</span>
    </button>
  {/if}
</div>

<style>
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
    gap: 0.75rem;
  }

  .theme-choice {
    position: relative;
    min-width: 0;
  }

  .swatch,
  .new-theme {
    width: 100%;
    min-height: 4.75rem;
    border: 1px solid var(--color-gray-300);
    border-radius: 0.5rem;
    background: white;
    color: black;

    &:hover {
      border-color: var(--color-gray-500);
    }

    &:focus-visible {
      outline: 2px solid var(--color-blue-500);
      outline-offset: 2px;
    }
  }

  .swatch {
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;
    padding: 0;

    &.selected {
      border-color: var(--color-blue-500);
      box-shadow: 0 0 0 2px var(--color-blue-200);
    }
  }

  .sample {
    display: grid;
    min-height: 2.75rem;
    place-items: center;
    font-size: 1.125rem;
  }

  .label {
    overflow: hidden;
    padding: 0.35rem 0.5rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }

  .theme-actions {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    display: flex;
    gap: 0.125rem;

    button {
      display: grid;
      width: 1.75rem;
      height: 1.75rem;
      place-items: center;
      border-radius: 999px;
      background: rgb(255 255 255 / 88%);
      color: black;
      font-size: 0.75rem;

      &:hover {
        background: white;
      }

      &:focus-visible {
        outline: 2px solid var(--color-blue-500);
      }
    }
  }

  .new-theme {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-style: dashed;
    font-size: 0.875rem;
  }
</style>
