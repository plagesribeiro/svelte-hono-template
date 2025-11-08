<script lang="ts">
import { SignIn } from 'svelte-clerk'

let { data } = $props()
</script>

<div class="card">
  <SignIn
    redirectUrl={data.redirectUrl}
    signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(data.redirectUrl)}`}
  />
</div>
