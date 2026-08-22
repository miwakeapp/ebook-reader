<script lang="ts">
  import { showConfirmDialog } from '$lib/components/confirm-dialog.svelte';
  import SettingsButton from '$lib/components/settings/settings-button.svelte';

  interface Props {
    pageName: string;
    message: string;
    onrestore: () => void;
  }

  let { pageName, message, onrestore }: Props = $props();

  async function confirmRestore() {
    const confirmed = await showConfirmDialog({
      title: `Restore ${pageName.toLowerCase()} defaults?`,
      message,
      confirmLabel: 'Restore defaults'
    });
    if (confirmed) onrestore();
  }
</script>

<SettingsButton onclick={confirmRestore}>Restore defaults…</SettingsButton>
