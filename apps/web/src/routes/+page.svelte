<script lang="ts">
import { client, json } from '$lib/api.svelte'

let { data } = $props()

let getWhoamiData = $state<string>('')
const getWhoami = async () => {
	const whoami = await json(client.whoami.$get())
	getWhoamiData = whoami.userRef
}
</script>

<div class="flex w-full items-center p-6">
  <div class="w-full flex flex-col space-y-4">
    <h1 class="text-4xl font-bold">Demo Page</h1>
    <p>You are logged in as: {data.whoami.userRef}</p>
  </div>
</div>

<a href="/secret?code=gotcha&password=1234" class="btn btn-warning">
  Take me to the protected page
</a>

<button class="btn btn-primary" onclick={getWhoami}> Get Whoami </button>
{#if getWhoamiData}
  API Response: {getWhoamiData}
{/if}

<div class="flex w-full items-center p-6">
  <div class="w-full flex flex-col space-y-4">
    <h1 class="text-4xl font-bold">Demo Page</h1>
    <div class="flex gap-4">
      <div class="card w-96 bg-base-100 shadow-md">
        <div class="card-body">
          <h2 class="card-title">Card title!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
      <div class="card w-96 bg-neutral text-neutral-content shadow-md">
        <div class="card-body">
          <h2 class="card-title">Card title!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
    <div class="stats shadow-md">
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-8 h-8 stroke-current"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            /></svg
          >
        </div>
        <div class="stat-title">Total Likes</div>
        <div class="stat-value text-primary">25.6K</div>
        <div class="stat-desc">21% more than last month</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-8 h-8 stroke-current"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            /></svg
          >
        </div>
        <div class="stat-title">Page Views</div>
        <div class="stat-value text-secondary">2.6M</div>
        <div class="stat-desc">21% more than last month</div>
      </div>
    </div>
  </div>
</div>
