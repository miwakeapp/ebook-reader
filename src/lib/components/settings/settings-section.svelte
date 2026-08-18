<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    headingId?: string;
    description?: string;
    children?: Snippet;
  }

  let { title, headingId, description, children }: Props = $props();

  const componentId = $props.id();
  const titleId = $derived(headingId ?? `${componentId}-title`);
  const descriptionId = `${componentId}-description`;
</script>

<section
  class="w-full pt-4 pb-8"
  aria-labelledby={titleId}
  aria-describedby={description ? descriptionId : undefined}
>
  <h2 id={titleId} class="mb-2 border-b border-black pb-1 text-xl font-medium capitalize">
    {title}
  </h2>
  {#if description}
    <p id={descriptionId} class="mb-4 text-sm text-gray-600">{description}</p>
  {/if}
  {@render children?.()}
</section>
