<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    description?: string;
    controlId?: string;
    control?: Snippet;
    children?: Snippet;
    disabled?: boolean;
  }

  let { label, description, controlId, control, children, disabled = false }: Props = $props();
</script>

<fieldset class="settings-row-fieldset" role="none" {disabled} data-settings-item>
  <div class="settings-row" class:is-disabled={disabled} aria-disabled={disabled}>
    {#if controlId}
      <div class="min-w-0">
        <label for={controlId} class="setting-copy block font-medium">{label}</label>
        {#if description}
          <div id={`${controlId}-description`} class="mt-0.5 text-sm text-gray-600">
            {description}
          </div>
        {/if}
      </div>
    {:else}
      <div class="min-w-0">
        <div class="font-medium">{label}</div>
        {#if description}
          <div class="mt-0.5 text-sm text-gray-600">{description}</div>
        {/if}
      </div>
    {/if}

    {#if control}
      <div class="settings-control">
        {@render control()}
      </div>
    {/if}

    {#if children}
      <div class="settings-children">
        {@render children()}
      </div>
    {/if}
  </div>
</fieldset>

<style>
  .settings-row-fieldset {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    border-block-end: 1px solid rgb(156 163 175 / 40%);
  }

  .settings-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 1.5rem;
    row-gap: 0.75rem;
    padding-block: 0.875rem;

    &.is-disabled {
      opacity: 0.55;

      .setting-copy {
        cursor: not-allowed;
      }
    }
  }

  .setting-copy {
    cursor: pointer;
  }

  .settings-control {
    min-inline-size: 0;
    justify-self: end;
  }

  .settings-children {
    min-inline-size: 0;
    grid-column: 1 / -1;
  }

  @media (width < 30rem) {
    .settings-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .settings-control {
      justify-self: start;
    }
  }
</style>
