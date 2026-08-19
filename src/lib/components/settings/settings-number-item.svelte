<script lang="ts">
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsNumberInput from '$lib/components/settings/settings-number-input.svelte';

  interface Props {
    id?: string;
    label: string;
    description?: string;
    value: number;
    unit: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    inset?: boolean;
  }

  let {
    id,
    label,
    description,
    value = $bindable(),
    unit,
    min,
    max,
    step,
    disabled = false,
    inset = false
  }: Props = $props();

  const componentId = $props.id();
  const controlId = $derived(id ?? `${componentId}-control`);
</script>

<SettingsItem {label} {description} {controlId} {disabled} {inset}>
  {#snippet control()}
    <SettingsNumberInput
      id={controlId}
      bind:value
      {unit}
      {min}
      {max}
      {step}
      {disabled}
      labelledBy={`${controlId}-label`}
      describedBy={description ? `${controlId}-description` : undefined}
    />
  {/snippet}
</SettingsItem>
