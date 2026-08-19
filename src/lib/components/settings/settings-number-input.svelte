<script lang="ts">
  interface Props {
    id: string;
    value: number;
    unit: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    labelledBy?: string;
    describedBy?: string;
  }

  let {
    id,
    value = $bindable(),
    unit,
    min,
    max,
    step,
    disabled = false,
    labelledBy,
    describedBy
  }: Props = $props();

  const descriptionIds = $derived(
    describedBy === undefined ? `${id}-unit` : `${describedBy} ${id}-unit`
  );

  function inRange(candidate: number) {
    return (
      Number.isFinite(candidate) &&
      (min === undefined || candidate >= min) &&
      (max === undefined || candidate <= max)
    );
  }

  function clamp(candidate: number) {
    return Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min ?? Number.NEGATIVE_INFINITY, candidate)
    );
  }

  let lastValidValue: number | undefined = $state();

  $effect(() => {
    if (inRange(value)) {
      lastValidValue = value;
    } else if (lastValidValue === undefined) {
      lastValidValue = clamp(Number.isFinite(value) ? value : (min ?? 0));
    }
  });

  function normalizeValue() {
    value = Number.isFinite(value) ? clamp(value) : (lastValidValue ?? min ?? 0);
  }
</script>

<div class={['inline-flex min-w-0 items-baseline gap-2', disabled && 'opacity-[0.55]']}>
  <input
    {id}
    type="number"
    class="w-28 min-w-0 rounded-none border-0 border-b-2 border-gray-400/50 bg-transparent px-1.5 py-1 text-inherit transition-colors focus:border-b-black focus:ring-0 focus:outline-none focus:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed"
    aria-labelledby={labelledBy}
    aria-describedby={descriptionIds}
    bind:value
    {min}
    {max}
    {step}
    {disabled}
    onblur={normalizeValue}
  />
  <span id={`${id}-unit`} class="whitespace-nowrap text-sm text-gray-600">{unit}</span>
</div>
