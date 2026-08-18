<script lang="ts">
  interface Props {
    id: string;
    value: number;
    unit: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }

  let { id, value = $bindable(), unit, min, max, step, disabled = false }: Props = $props();

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

<div class="number-input" class:is-disabled={disabled}>
  <input
    {id}
    type="number"
    aria-describedby={`${id}-description ${id}-unit`}
    bind:value
    {min}
    {max}
    {step}
    {disabled}
    onblur={normalizeValue}
  />
  <span id={`${id}-unit`} class="unit">{unit}</span>
</div>

<style>
  .number-input {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    min-inline-size: 0;

    &.is-disabled {
      opacity: 0.55;
    }

    input {
      inline-size: 7rem;
      min-inline-size: 0;
      padding: 0.25rem 0.375rem;
      border: 0;
      border-block-end: 2px solid rgb(156 163 175 / 50%);
      color: inherit;
      background: transparent;
      transition: border-color 150ms ease;

      &:focus {
        border-block-end-color: black;
        outline: none;
        box-shadow: none;
      }

      &:focus-visible {
        outline: 2px solid rgb(37 99 235);
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
      }
    }
  }

  .unit {
    color: rgb(75 85 99);
    font-size: 0.875rem;
    white-space: nowrap;
  }
</style>
