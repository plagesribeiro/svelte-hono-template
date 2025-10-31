<script lang="ts">
  import { browser } from "$app/environment";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import type { SubmitFunction } from "@sveltejs/kit";

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "forest",
  ];

  let currentTheme = $derived<string>(
    browser && document
      ? document.documentElement.getAttribute("data-theme") || "Theme"
      : "Theme"
  );

  const submitUpdateTheme: SubmitFunction = ({ action }) => {
    const theme = action.searchParams.get("theme");

    if (theme) {
      currentTheme = theme;
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      currentTheme = "Theme";
    }
  };
</script>

<div class="dropdown mb-72">
  <div tabIndex={0} role="button" class="btn m-1">
    {currentTheme}
    <svg
      width="12px"
      height="12px"
      class="inline-block h-2 w-2 fill-current opacity-60"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2048 2048"
    >
      <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
      ></path>
    </svg>
  </div>
  <ul
    tabIndex="-1"
    class="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
  >
    <form method="POST" use:enhance={submitUpdateTheme}>
      {#each themes as theme}
        <li>
          <button
            formaction="/?/setTheme&theme={theme}&redirectTo={page.url
              .pathname}"
            class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
          >
            {theme}
          </button>
        </li>
      {/each}
    </form>
  </ul>
</div>
