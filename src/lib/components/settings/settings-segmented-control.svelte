<script lang="ts" generics="T">
  interface Option {
    id: T;
    label: string;
  }

  interface Props {
    label: string;
    options: Option[];
    value: T;
    disabled?: boolean;
  }

  let { label, options, value = $bindable(), disabled = false }: Props = $props();

  const componentId = $props.id();
</script>

<fieldset class={['min-w-0', disabled && 'opacity-[0.55]']} {disabled}>
  <legend class="sr-only">{label}</legend>
  <div class="inline-flex max-w-full overflow-x-auto rounded-md border border-gray-400 bg-white">
    {#each options as option, index (option.id)}
      <label
        class={[
          'shrink-0',
          index > 0 && 'border-s border-gray-400',
          disabled && 'cursor-not-allowed'
        ]}
      >
        <input
          type="radio"
          class="peer sr-only"
          name={componentId}
          value={option.id}
          bind:group={value}
        />
        <span
          class="block whitespace-nowrap px-3 py-2 leading-tight text-gray-900 transition-colors peer-checked:bg-gray-700 peer-checked:text-white peer-focus-visible:relative peer-focus-visible:z-10 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue-600"
          >{option.label}</span
        >
      </label>
    {/each}
  </div>
</fieldset>
