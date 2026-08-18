<script lang="ts">
  interface Props {
    label: string;
    description?: string;
    checked: boolean;
    disabled?: boolean;
  }

  let { label, description, checked = $bindable(), disabled = false }: Props = $props();

  const componentId = $props.id();
  const labelId = `${componentId}-label`;
  const descriptionId = `${componentId}-description`;
</script>

<label class="settings-switch-row" class:is-disabled={disabled} data-settings-item>
  <span class="min-w-0">
    <span id={labelId} class="block font-medium">{label}</span>
    {#if description}
      <span id={descriptionId} class="mt-0.5 block text-sm text-gray-600">{description}</span>
    {/if}
  </span>

  <span class="switch-control">
    <input
      type="checkbox"
      role="switch"
      class="switch-input"
      bind:checked
      {disabled}
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
    />
    <span class="switch-track" aria-hidden="true">
      <span class="switch-thumb"></span>
    </span>
  </span>
</label>

<style>
  .settings-switch-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 1.5rem;
    row-gap: 0.75rem;
    padding-block: 0.875rem;
    border-block-end: 1px solid rgb(156 163 175 / 40%);
    user-select: none;

    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  }

  .switch-control {
    position: relative;
    display: inline-flex;
    justify-self: end;
  }

  .switch-input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .switch-track {
    position: relative;
    display: inline-block;
    inline-size: 2.5rem;
    block-size: 1.5rem;
    border-radius: 9999px;
    background: rgb(107 114 128);
    transition: background-color 150ms ease;
  }

  .switch-thumb {
    position: absolute;
    inset-block-start: 0.25rem;
    inset-inline-start: 0.25rem;
    inline-size: 1rem;
    block-size: 1rem;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 2px rgb(0 0 0 / 25%);
    transition: transform 150ms ease;
  }

  .switch-input:checked + .switch-track {
    background: rgb(37 99 235);

    .switch-thumb {
      transform: translateX(1rem);
    }
  }

  .switch-input:focus-visible + .switch-track {
    outline: 2px solid rgb(37 99 235);
    outline-offset: 2px;
  }

  .switch-input:disabled + .switch-track {
    cursor: not-allowed;
  }

  @media (width < 30rem) {
    .settings-switch-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .switch-control {
      justify-self: start;
    }
  }
</style>
