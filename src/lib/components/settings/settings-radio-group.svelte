<script lang="ts" generics="T">
  import SettingsApplicability from '$lib/components/settings/settings-applicability.svelte';
  import type { SettingsApplicabilityDetails } from '$lib/components/settings/settings-applicability.svelte';
  import type { Snippet } from 'svelte';

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
    options: Option[];
    value: T;
    applicability?: SettingsApplicabilityDetails;
    disabled?: boolean;
    optionControl?: Snippet<[T, { labelledBy: string }]>;
  }

  let {
    legend,
    labelledBy,
    id,
    description,
    options,
    value = $bindable(),
    applicability,
    disabled = false,
    optionControl
  }: Props = $props();

  const componentId = $props.id();
  const legendId = `${componentId}-legend`;
  const descriptionId = `${componentId}-description`;

  function getOptionControlLabelledBy(optionLabelId: string) {
    return [legend ? legendId : labelledBy, optionLabelId]
      .filter((labelId) => labelId !== undefined)
      .join(' ');
  }
</script>

<fieldset
  {id}
  class="m-0 min-w-0 border-0 p-0"
  {disabled}
  aria-labelledby={labelledBy}
  aria-describedby={description ? descriptionId : undefined}
>
  {#if legend}
    <legend id={legendId} class="mb-1">
      <span class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span class="font-medium">{legend}</span>
        {#if applicability}<SettingsApplicability {...applicability} />{/if}
      </span>
    </legend>
  {/if}
  {#if description}
    <p id={descriptionId} class="mb-2 text-sm text-gray-600">{description}</p>
  {/if}

  <div class="grid gap-1">
    {#each options as option, index (option.id)}
      {@const optionId = `${componentId}-option-${index}`}
      {@const optionLabelId = `${optionId}-label`}
      {@const optionDescriptionId = `${optionId}-description`}
      <div
        class={[
          'grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 rounded p-1',
          disabled ? 'cursor-not-allowed' : 'hover:bg-gray-400/15'
        ]}
      >
        <label
          for={optionId}
          class={[
            'col-span-2 grid min-w-0 grid-cols-subgrid items-start',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          ]}
        >
          <input
            id={optionId}
            type="radio"
            name={componentId}
            value={option.id}
            class="mt-1 shrink-0 accent-blue-600"
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
        {#if optionControl}
          <div
            class="min-w-0 justify-self-end max-[30rem]:col-start-2 max-[30rem]:justify-self-start"
          >
            {@render optionControl(option.id, {
              labelledBy: getOptionControlLabelledBy(optionLabelId)
            })}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</fieldset>
