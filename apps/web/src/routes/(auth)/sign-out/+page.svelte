<script lang="ts">
  import { goto } from "$app/navigation";
  import { useClerkContext } from "svelte-clerk";

  let signOutComplete = $state(false);

  const ctx = useClerkContext();
  $effect(() => {
    console.log("ctx.isLoaded", ctx.isLoaded);
    if (ctx.isLoaded && ctx.clerk) {
      console.log("ctx.clerk");
      ctx.clerk
        .signOut({ redirectUrl: "/sign-in" })
        .then(async () => {
          signOutComplete = true;
          goto("/sign-in", { replaceState: true });
        })
        .catch((error) => {
          console.error("Sign out error:", error);
        });
    }
  });
</script>

<div class="w-full h-full flex justify-center items-center">
  {signOutComplete ? "Signed out successfully" : "Signing out..."}
</div>
