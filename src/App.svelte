<script lang="ts">
  import {
    RotateCcw,
    Settings as SettingsIcon,
    CircleQuestionMark,
  } from "lucide-svelte";
  import BifurcationCanvas from "./lib/BifurcationCanvas.svelte";
  import TimeSeriesPlot from "./lib/TimeSeriesPlot.svelte";
  import Introduction from "./lib/Introduction.svelte";
  import Settings from "./lib/Settings.svelte";
  import { DEFAULT_VIEW, DEFAULT_CONFIG } from "./lib/types";

  let currentView: "explorer" | "intro" | "settings" = $state("explorer");
  let mapState = $state({ ...DEFAULT_VIEW });
  let config = $state({ ...DEFAULT_CONFIG });

  // Shared state for the selected R value (default 3.0 chaotic/stable transition)
  let selectedR = $state(3.3);

  let canvasComponent: BifurcationCanvas;

  function resetView() {
    canvasComponent?.resetView();
  }
</script>

<main class="app-root" class:split={config.showTimeSeries}>
  <!-- Bifurcation Diagram Area -->
  <section class="bifurcation-section">
    <BifurcationCanvas
      bind:this={canvasComponent}
      bind:view={mapState}
      {config}
      selectedR={config.showTimeSeries ? selectedR : null}
    />
  </section>

  <!-- Time Series Plot Area (Conditional) -->
  {#if config.showTimeSeries}
    <section class="timeseries-section">
      <TimeSeriesPlot
        bind:r={selectedR}
        n={config.iterations}
        rMin={mapState.rMin}
        rMax={mapState.rMax}
      />
    </section>
  {/if}

  <!-- UI Overlay -->
  <div class="ui-overlay">
    <header class="top-bar">
      <div class="title">
        <h1>Logic<span class="accent">Map</span></h1>
      </div>
      <div class="actions">
        <button class="icon-btn" onclick={resetView} title="Reset View">
          <RotateCcw size={20} />
        </button>
        <button
          class="icon-btn"
          onclick={() => (currentView = "settings")}
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>
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

  <!-- Modal Layer -->
  {#if currentView !== "explorer"}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="modal-backdrop"
      onclick={() => (currentView = "explorer")}
      onkeydown={(e) => e.key === "Escape" && (currentView = "explorer")}
    >
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="modal-content"
        class:settings-modal={currentView === "settings"}
        class:intro-modal={currentView === "intro"}
        onclick={(e) => e.stopPropagation()}
        onwheel={(e) => e.stopPropagation()}
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
  /* Root Layout - CSS Grid based */
  .app-root {
    width: 100%;
    height: 100vh;
    height: 100dvh; /* Dynamic viewport for mobile */
    display: grid;
    grid-template-rows: 1fr;
    background: #0d0e12;
    overflow: hidden;
    position: relative;
  }

  /* When split mode is active */
  .app-root.split {
    grid-template-rows: 65fr 35fr;
  }

  /* Section containers */
  .bifurcation-section {
    width: 100%;
    min-height: 0; /* Critical for grid items to shrink */
    overflow: hidden;
    position: relative;
  }

  .timeseries-section {
    width: 100%;
    min-height: 0;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: #18181b;
  }

  /* UI Overlay */
  .ui-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    padding: 1.5rem;
    z-index: 20;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title {
    pointer-events: auto;
  }

  .title h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    letter-spacing: -0.025em;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    user-select: none;
    margin: 0;
  }

  .title .accent {
    color: #38bdf8;
  }

  .actions {
    pointer-events: auto;
    display: flex;
    gap: 0.75rem;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: white;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: #18181b;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
  }

  .settings-modal {
    max-width: 28rem;
  }

  .intro-modal {
    max-width: 56rem;
  }
</style>
