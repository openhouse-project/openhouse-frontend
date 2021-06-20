<script>
    import { connected } from 'svelte-web3'

    import MonoChain from './MonoChain.svelte'
    import Meeting from './Meeting.svelte'
    export let name
</script>

<svelte:head>    
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
</svelte:head>
  
  <section class="section pb-0">
    <div class="container">
      <h1 class="title">
        Welcome to Openhouse
      </h1>
      
      {#if window.Web3}
      <p>The Web3.js library has been injected in Global window Object (version: {window.Web3.version}).</p>
      {:else}
      <div class="notification is-warning">
        <strong>Error! The Web3.js library has not been detected in the Global window Object.</strong>
        Please check that Web3.js has been correctly added in <em class="is-family-code">public/index.html</em>
        with the line:
        <pre>
        &lt;script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js">&lt;/script>
        </pre>
      </div>
      {/if}
      <p>Browser wallet detected in Global Object window.ethereum : { window.ethereum ? 'yes' : 'no' }</p>
  
    </div>
  </section>
  
  <section class="section">
  
    <div class="container">

      <svelte:component this={MonoChain} />
  
    </div>
  
  </section>

  <section class="section">
      <div class="container">
        {#if $connected}
            <svelte:component this={Meeting} />
        {/if}
      </div>
    </section>