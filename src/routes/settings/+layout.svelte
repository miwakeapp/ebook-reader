<script lang="ts">
  import type { RouteId } from '$app/types';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import SettingsHeader from '$lib/components/settings/settings-header.svelte';
  import { pxScreen } from '$lib/css-classes';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let activeRouteId = $derived(page.route.id as RouteId | null);
</script>

<div class="elevation-4 fixed inset-x-0 top-0 z-10">
  <SettingsHeader {activeRouteId} />
</div>

<div class="{pxScreen} h-full pt-16">
  <main class="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)] gap-8 pt-4 pb-8">
    {@render children?.()}
  </main>
</div>
