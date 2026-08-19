<script lang="ts" generics="T">
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsRadioGroup from '$lib/components/settings/settings-radio-group.svelte';
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
    disabled?: boolean;
    inset?: boolean;
    optionControl?: Snippet<[T, { labelledBy: string }]>;
  }

  let {
    legend,
    labelledBy,
    id,
    description,
    options,
    value = $bindable(),
    disabled = false,
    inset = false,
    optionControl
  }: Props = $props();
</script>

<SettingsItem {disabled} {inset}>
  <SettingsRadioGroup
    {legend}
    {labelledBy}
    {id}
    {description}
    {options}
    bind:value
    {disabled}
    {optionControl}
  />
</SettingsItem>
