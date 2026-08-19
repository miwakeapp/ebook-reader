<script lang="ts">
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsSwitch from '$lib/components/settings/settings-switch.svelte';

  interface Props {
    label: string;
    description?: string;
    checked: boolean;
    disabled?: boolean;
    inset?: boolean;
  }

  let {
    label,
    description,
    checked = $bindable(),
    disabled = false,
    inset = false
  }: Props = $props();

  const componentId = $props.id();
  const controlId = `${componentId}-control`;
</script>

<SettingsItem {label} {description} {controlId} {disabled} {inset}>
  {#snippet control()}
    <SettingsSwitch
      id={controlId}
      bind:checked
      {disabled}
      labelledBy={`${controlId}-label`}
      describedBy={description ? `${controlId}-description` : undefined}
    />
  {/snippet}
</SettingsItem>
