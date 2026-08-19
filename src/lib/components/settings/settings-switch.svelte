<script lang="ts">
  interface Props {
    id: string;
    checked: boolean;
    disabled?: boolean;
    labelledBy?: string;
    describedBy?: string;
  }

  let { id, checked = $bindable(), disabled = false, labelledBy, describedBy }: Props = $props();
</script>

<label for={id} class="relative inline-flex">
  <input
    {id}
    type="checkbox"
    role="switch"
    class="peer sr-only"
    bind:checked
    {disabled}
    aria-labelledby={labelledBy}
    aria-describedby={describedBy}
  />
  <span
    class="inline-block h-6 w-10 rounded-full bg-gray-500 transition-colors peer-checked:bg-blue-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 peer-disabled:cursor-not-allowed"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute top-1 inset-s-1 size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/25%)] transition-transform peer-checked:translate-x-4"
    aria-hidden="true"
  ></span>
</label>
