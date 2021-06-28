<script>
  import { onMount } from "svelte";
  let loading = true;
  let wallets = {};

  onMount(async () => {
    loading = true;
    const req = await fetch("https://registry.walletconnect.org/data/wallets.json");
    const wallets = await req.json();
    loading = false;
  });
</script>

<section class="wallets">
  {#if Object.keys(wallets).length}
  {#each Object.keys(wallets) as [id, wallet]}
  <div class="wallet">
    <img src=""
  </div>
  {/each}
  {:else}
  Loading wallets...
  {/if}
</section>