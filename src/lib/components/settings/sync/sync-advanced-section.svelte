<script lang="ts">
  import { onMount } from 'svelte';
  import { AutoReplicationType } from '$lib/functions/replication/replication-options';
  import {
    autoReplication$,
    cacheStorageData$,
    importHTMLFixMode$,
    readingGoalsMergeMode$,
    restrictImportFixToAnchor$,
    statisticsMergeMode$
  } from '$lib/data/store';
  import { ImportHTMLFixMode } from '$lib/data/import-html-fix-mode';
  import { syncState } from '$lib/data/sync/sync-store.svelte';
  import { storage } from '$lib/data/window/navigator/storage';
  import SettingsItem from '$lib/components/settings/settings-item.svelte';
  import SettingsRadioItem from '$lib/components/settings/settings-radio-item.svelte';
  import SettingsSection from '$lib/components/settings/settings-section.svelte';
  import SettingsSwitchItem from '$lib/components/settings/settings-switch-item.svelte';
  import { describeSyncLocation } from '$lib/components/settings/sync/sync-utils';

  let hasLocation = $derived(syncState.location !== null);
  let locationLabel = $derived(describeSyncLocation(syncState.location) || 'your sync location');
  let advancedDescription = $derived(
    `Fine-tune how syncing works. Defaults are safe for most users.${
      hasLocation ? '' : ' These settings take effect once you connect a sync location above.'
    }`
  );

  let advancedOpen = $state(false);
  let storagePersisted = $state<boolean | null>(null);
  let storageQuota = $state<string | null>(null);

  onMount(() => {
    if (window.location.hash === '#sync-direction') {
      advancedOpen = true;
    }

    storage.persisted().then((p) => {
      storagePersisted = p;
    });
    storage.estimate().then((est) => {
      if (est.usage !== undefined && est.quota !== undefined && est.quota > 0) {
        storageQuota = `${Math.round(((est.usage / est.quota) * 100 + Number.EPSILON) * 100) / 100}% used`;
      }
    });
  });

  let importHTMLFixOptions = [
    {
      id: ImportHTMLFixMode.OFF,
      label: 'Off',
      description: 'Imports EPUB files as-is.',
      isDefault: true
    },
    {
      id: ImportHTMLFixMode.STANDARD,
      label: 'Standard',
      description:
        'Fixes common malformed-HTML issues during EPUB import (e.g. wrong self-closing elements). Try this if a book looks broken in the reader.'
    },
    {
      id: ImportHTMLFixMode.EXTENDED,
      label: 'Extended',
      description:
        'Standard fixes plus more aggressive cleanups (control characters, HTML entities). Use only if Standard didn’t fix it.'
    }
  ];

  let directionOptions = $derived([
    {
      id: AutoReplicationType.All,
      label: 'Both',
      description: `Changes on this device are pushed to ${locationLabel}, and changes there are pulled down.`,
      isDefault: true
    },
    {
      id: AutoReplicationType.Up,
      label: 'Up only',
      description: `Push changes from this device to ${locationLabel}, but don't pull changes from there. Useful if this device is the canonical source.`
    },
    {
      id: AutoReplicationType.Down,
      label: 'Down only',
      description: `Pull changes from ${locationLabel}, but don't push. Useful for read-only devices.`
    },
    {
      id: AutoReplicationType.Off,
      label: 'Off',
      description: 'Nothing is synced. Your library stays local until you turn this back on.'
    }
  ]);

  let statisticsMergeOptions = [
    {
      id: 'merge' as const,
      label: 'Merge',
      description:
        'Days that only exist on one side are kept. When the same day has statistics on both sides, the more recently updated entry wins.',
      isDefault: true
    },
    {
      id: 'replace' as const,
      label: 'Replace',
      description: `When sync copies statistics for a book, the receiving side's entire set for that book is replaced with the source side's set. Days that only existed on the receiving side are lost.`
    }
  ];

  let goalsMergeOptions = [
    {
      id: 'merge' as const,
      label: 'Merge',
      description:
        'Goals from both sides are combined. When the same goal exists on both sides, the more recently updated version wins.',
      isDefault: true
    },
    {
      id: 'replace' as const,
      label: 'Replace',
      description: `When sync copies goals, the receiving side's entire set of goals is replaced with the source side's set, including deletions.`
    }
  ];
</script>

<SettingsSection
  title="Advanced"
  description={advancedDescription}
  collapsible
  bind:open={advancedOpen}
>
  <SettingsRadioItem
    id="sync-direction"
    legend="Sync direction"
    options={directionOptions}
    bind:value={$autoReplication$}
  />

  <SettingsRadioItem
    legend="How to combine reading statistics"
    options={statisticsMergeOptions}
    bind:value={$statisticsMergeMode$}
  />

  <SettingsRadioItem
    legend="How to combine reading goals"
    options={goalsMergeOptions}
    bind:value={$readingGoalsMergeMode$}
  />

  <SettingsSwitchItem
    label="Cache remote file list"
    description="Remember the remote file list for the rest of this session to save network traffic. Changes from other devices will not appear until you reload the page or open a new tab."
    bind:checked={$cacheStorageData$}
  />

  <SettingsRadioItem
    legend="EPUB import fixes"
    options={importHTMLFixOptions}
    bind:value={$importHTMLFixMode$}
  />

  {#if $importHTMLFixMode$ !== ImportHTMLFixMode.OFF}
    <SettingsSwitchItem
      label="Restrict self-closing-tag fixes to links"
      description="Only fix anchor tags, leaving other elements as the EPUB had them. Try this if Standard or Extended is over-correcting."
      bind:checked={$restrictImportFixToAnchor$}
      inset
    />
  {/if}

  <SettingsItem
    label={storageQuota ? `Local storage status · ${storageQuota}` : 'Local storage status'}
  >
    <div class="text-sm text-gray-700">
      {#if storagePersisted === null}
        Checking…
      {:else if storagePersisted}
        Persistent. Your browser has marked this site's local data as durable — it won't be evicted
        under disk pressure.
      {:else}
        Temporary. Your browser may evict this site's local data if it runs low on disk. The reader
        re-asks for persistence on every sync; browsers grant it once you've used the site enough,
        bookmarked it, or installed it as a PWA.
      {/if}
    </div>
  </SettingsItem>
</SettingsSection>
