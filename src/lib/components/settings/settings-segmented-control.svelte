<script lang="ts" generics="T extends string">
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

<fieldset class="segmented-control" class:is-disabled={disabled} {disabled}>
  <legend class="sr-only">{label}</legend>
  <div class="segments">
    {#each options as option (option.id)}
      <label class="segment">
        <input
          type="radio"
          class="sr-only"
          name={componentId}
          value={option.id}
          bind:group={value}
        />
        <span>{option.label}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .segmented-control {
    min-inline-size: 0;

    &.is-disabled {
      opacity: 0.55;
    }
  }

  .segments {
    display: inline-flex;
    max-inline-size: 100%;
    overflow-x: auto;
    border: 1px solid rgb(156 163 175);
    border-radius: 0.375rem;
    background: white;
  }

  .segment {
    flex: none;

    & + & {
      border-inline-start: 1px solid rgb(156 163 175);
    }

    &:has(input:disabled) {
      cursor: not-allowed;
    }

    span {
      display: block;
      padding: 0.5rem 0.75rem;
      color: rgb(17 24 39);
      line-height: 1.25;
      white-space: nowrap;
      transition:
        color 150ms ease,
        background-color 150ms ease;
    }

    input:checked + span {
      color: white;
      background: rgb(55 65 81);
    }

    input:focus-visible + span {
      position: relative;
      z-index: 1;
      outline: 2px solid rgb(37 99 235);
      outline-offset: -2px;
    }
  }
</style>
