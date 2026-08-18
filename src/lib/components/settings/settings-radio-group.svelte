<script lang="ts" generics="T extends string">
  interface Option {
    id: T;
    label: string;
    description?: string;
    isDefault?: boolean;
  }

  interface Props {
    legend?: string;
    labelledBy?: string;
    id?: string;
    description?: string;
    name: string;
    options: Option[];
    value: T;
    disabled?: boolean;
  }

  let {
    legend,
    labelledBy,
    id,
    description,
    name,
    options,
    value = $bindable(),
    disabled = false
  }: Props = $props();

  const componentId = $props.id();
  const descriptionId = `${componentId}-description`;
</script>

<div class="settings-radio-group" class:is-disabled={disabled} data-settings-item>
  <fieldset
    {id}
    class="radio-fieldset"
    {disabled}
    aria-labelledby={labelledBy}
    aria-describedby={description ? descriptionId : undefined}
  >
    {#if legend}
      <legend class="mb-1 font-medium">{legend}</legend>
    {/if}
    {#if description}
      <p id={descriptionId} class="mb-2 text-sm text-gray-600">{description}</p>
    {/if}

    <div class="radio-options">
      {#each options as option, index (option.id)}
        {@const optionId = `${componentId}-option-${index}`}
        {@const optionLabelId = `${optionId}-label`}
        {@const optionDescriptionId = `${optionId}-description`}
        <label for={optionId} class="radio-option">
          <input
            id={optionId}
            type="radio"
            {name}
            value={option.id}
            bind:group={value}
            aria-labelledby={optionLabelId}
            aria-describedby={option.description ? optionDescriptionId : undefined}
          />
          <span class="min-w-0">
            <span id={optionLabelId} class="block font-medium">
              {option.label}
              {#if option.isDefault}
                <span class="font-normal text-gray-500">(default)</span>
              {/if}
            </span>
            {#if option.description}
              <span id={optionDescriptionId} class="block text-sm text-gray-600">
                {option.description}
              </span>
            {/if}
          </span>
        </label>
      {/each}
    </div>
  </fieldset>
</div>

<style>
  .settings-radio-group {
    padding-block: 0.875rem;
    border-block-end: 1px solid rgb(156 163 175 / 40%);

    &.is-disabled {
      opacity: 0.55;
    }
  }

  .radio-fieldset {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .radio-options {
    display: grid;
    gap: 0.25rem;
  }

  .radio-option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.25rem;
    border-radius: 0.25rem;

    &:not(:has(input:disabled)):hover {
      background: rgb(156 163 175 / 15%);
    }

    &:has(input:disabled) {
      cursor: not-allowed;
    }

    input {
      flex: none;
      margin-block-start: 0.25rem;
      accent-color: rgb(37 99 235);
    }
  }
</style>
