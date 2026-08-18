<script lang="ts">
  import { resolve } from '$app/paths';
  import SettingsReadingGoals from '$lib/components/settings/settings-reading-goals.svelte';
  import type { BooksDbReadingGoal } from '$lib/data/database/books-db/versions/books-db';
  import { statisticsEnabled$ } from '$lib/data/store';

  interface Props {
    onspinner?: (value: boolean) => void;
    ongoalschange?: (readingGoals: BooksDbReadingGoal[]) => void;
  }

  let { onspinner, ongoalschange }: Props = $props();
</script>

<div class="mx-auto w-full max-w-5xl pt-4">
  {#if !$statisticsEnabled$}
    <div class="mb-6 rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-sm" role="status">
      Reading activity tracking is off. You can manage goals now, but progress will update only
      while tracking is on.
      <a class="font-medium underline hover:no-underline" href={resolve('/settings/tracking')}
        >Turn on tracking.</a
      >
    </div>
  {/if}
  <SettingsReadingGoals {onspinner} {ongoalschange} />
</div>
