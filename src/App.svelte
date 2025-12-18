<script lang="ts">
  import {
    RotateCcw,
    Settings as SettingsIcon,
    CircleQuestionMark,
  } from "lucide-svelte";
  import BifurcationCanvas from "./lib/BifurcationCanvas.svelte";
  import Introduction from "./lib/Introduction.svelte";
  import Settings from "./lib/Settings.svelte";
  import { DEFAULT_VIEW, DEFAULT_CONFIG } from "./lib/types";

  let currentView: "explorer" | "intro" | "settings" = $state("explorer");
  let mapState = $state({ ...DEFAULT_VIEW });
  let config = $state({ ...DEFAULT_CONFIG });

  let canvasComponent: any;

  function resetView() {
    canvasComponent?.resetView();
  }
</script>

<main class="relative w-full h-full overflow-hidden bg-black font-sans">
  <!-- Canvas Layer: Full Screen -->
  <div class="absolute inset-0 z-0">
    <BifurcationCanvas
      bind:this={canvasComponent}
      bind:view={mapState}
      {config}
    />
  </div>

  <!-- UI Overlay Layer -->
  <div
    class="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between"
  >
    <!-- Top Bar -->
    <header class="flex justify-between items-start">
      <!-- Title (Old Theme Style) -->
      <div class="pointer-events-auto">
        <h1
          class="text-2xl font-bold text-white tracking-tight drop-shadow-lg select-none"
        >
          Logic<span class="text-sky-400">Map</span>
        </h1>
      </div>

      <!-- Action Buttons (Top Right) -->
      <div class="pointer-events-auto flex items-center gap-3">
        <!-- Reset (Home) -->
        <button class="icon-btn" onclick={resetView} title="Reset View">
          <RotateCcw size={20} />
        </button>

        <!-- Settings -->
        <button
          class="icon-btn"
          onclick={() => (currentView = "settings")}
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>

        <!-- Guide (?) -->
        <button
          class="icon-btn"
          onclick={() => (currentView = "intro")}
          title="Guide"
        >
          <CircleQuestionMark size={20} />
        </button>
      </div>
    </header>
  </div>

  <!-- Modals Layer: Top Level Z-50 -->
  {#if currentView !== "explorer"}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all pointer-events-auto"
      onclick={() => (currentView = "explorer")}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === "Escape" && (currentView = "explorer")}
    >
      <!-- Modal Content Wrapper: Max Width & Height handling -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl w-full overflow-y-auto"
        class:max-w-md={currentView === "settings"}
        class:max-w-4xl={currentView === "intro"}
        style="max-height: 85vh;"
        onclick={(e) => e.stopPropagation()}
        onwheel={(e) => e.stopPropagation()}
        role="document"
        tabindex="0"
        onkeydown={() => {}}
      >
        {#if currentView === "intro"}
          <Introduction onClose={() => (currentView = "explorer")} />
        {:else if currentView === "settings"}
          <Settings bind:config onClose={() => (currentView = "explorer")} />
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .icon-btn:active {
    transform: translateY(0);
  }
</style>
