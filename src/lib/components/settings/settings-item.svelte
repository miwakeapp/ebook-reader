<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    label?: string;
    description?: string;
    controlId?: string;
    control?: Snippet;
    children?: Snippet;
    disabled?: boolean;
    inset?: boolean;
  }

  let {
    class: className,
    label,
    description,
    controlId,
    control,
    children,
    disabled = false,
    inset = false
  }: Props = $props();
</script>

<div
  class={[
    'min-w-0 py-3.5',
    disabled && 'opacity-[0.55]',
    inset && 'ms-7 border-s border-gray-400/40 ps-4',
    className
  ]}
  aria-disabled={disabled}
>
  {#if label || control}
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 max-[30rem]:grid-cols-[minmax(0,1fr)]"
    >
      {#if controlId}
        <label
          for={controlId}
          class={['block min-w-0', disabled ? 'cursor-not-allowed' : 'cursor-pointer']}
        >
          <span id={`${controlId}-label`} class="block font-medium">{label}</span>
          {#if description}
            <span id={`${controlId}-description`} class="mt-0.5 block text-sm text-gray-600">
              {description}
            </span>
          {/if}
        </label>
      {:else}
        <div class="min-w-0">
          <div class="font-medium">{label}</div>
          {#if description}
            <div class="mt-0.5 text-sm text-gray-600">{description}</div>
          {/if}
        </div>
      {/if}

      {#if control}
        <div class="min-w-0 justify-self-end max-[30rem]:justify-self-start">
          {@render control()}
        </div>
      {/if}

      {#if children}
        <div class="col-span-full min-w-0">
          {@render children()}
        </div>
      {/if}
    </div>
  {:else if children}
    {@render children()}
  {/if}
</div>
