<script lang="ts">
import { SignUp } from 'svelte-clerk'

let { data } = $props()
</script>

<div class="card">
  <SignUp
    redirectUrl={data.redirectUrl}
    signInUrl={`/sign-in?redirect_url=${encodeURIComponent(data.redirectUrl)}`}
  />
</div>
