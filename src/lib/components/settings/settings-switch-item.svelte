<script lang="ts">
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsSwitch from '$lib/components/settings/settings-switch.svelte';
  import type { SettingsApplicabilityDetails } from '$lib/components/settings/settings-applicability.svelte';

  interface Props {
    label: string;
    description?: string;
    checked: boolean;
    applicability?: SettingsApplicabilityDetails;
    disabled?: boolean;
    inset?: boolean;
  }

  let {
    label,
    description,
    checked = $bindable(),
    applicability,
    disabled = false,
    inset = false
  }: Props = $props();

  const componentId = $props.id();
  const controlId = `${componentId}-control`;
</script>

<SettingsItem {label} {description} {controlId} {applicability} {disabled} {inset}>
  {#snippet control()}
    <SettingsSwitch
      id={controlId}
      bind:checked
      {disabled}
      labelledBy={`${controlId}-label`}
      describedBy={[
        description ? `${controlId}-description` : undefined,
        applicability ? `${controlId}-applicability` : undefined
      ]
        .filter((id) => id !== undefined)
        .join(' ') || undefined}
    />
  {/snippet}
</SettingsItem>
