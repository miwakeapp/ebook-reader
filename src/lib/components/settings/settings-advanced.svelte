<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    children?: Snippet;
    open?: boolean;
  }

  let { title, description, children, open = $bindable(false) }: Props = $props();
</script>

<details class="settings-advanced w-full pt-4 pb-8" bind:open>
  <summary class="mb-2 flex cursor-pointer items-center gap-2 border-b border-black pb-1">
    <span class="chevron text-sm text-gray-500" aria-hidden="true">›</span>
    <h2 class="text-xl font-medium capitalize">{title}</h2>
  </summary>

  <div class="pt-2">
    {#if description}
      <p class="mb-4 text-sm text-gray-600">{description}</p>
    {/if}
    {@render children?.()}
  </div>
</details>

<style>
  summary {
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  .chevron {
    transition: transform 150ms ease;
  }

  .settings-advanced[open] .chevron {
    transform: rotate(90deg);
  }
</style>
