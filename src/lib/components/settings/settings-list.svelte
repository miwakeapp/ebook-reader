<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="settings-list">
  {@render children?.()}
</div>

<style>
  .settings-list {
    display: grid;
  }

  .settings-list > :global([data-settings-item]) {
    border-block-end: 0;
  }

  .settings-list > :global([data-settings-item] + [data-settings-item]) {
    border-block-start: 1px solid rgb(156 163 175 / 40%);
  }
</style>
