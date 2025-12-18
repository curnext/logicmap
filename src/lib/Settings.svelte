<script lang="ts">
    import type { SimulationConfig } from "./types";

    let {
        config = $bindable(),
        onClose,
    }: { config: SimulationConfig; onClose: () => void } = $props();

    // Helper for segmented control
    function toggle(key: keyof SimulationConfig, value: boolean) {
        // @ts-ignore
        config[key] = value;
    }
</script>

<div class="settings-container">
    <header>
        <h2>Visual Settings</h2>
    </header>

    <div class="content space-y-8">
        <!-- Quality Section -->
        <section>
            <div class="label-row">
                <h3>Detail Level</h3>
                <span class="value-badge">{config.detailLevel}x</span>
            </div>
            <div class="control-row">
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    bind:value={config.detailLevel}
                />
                <div class="range-labels">
                    <span>Fast</span>
                    <span>Ultra</span>
                </div>
            </div>
        </section>

        <!-- Brightness Section -->
        <section>
            <div class="label-row">
                <h3>Brightness</h3>
                <span class="value-badge"
                    >{Math.round(config.contrast * 100)}%</span
                >
            </div>
            <div class="control-row">
                <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    bind:value={config.contrast}
                />
                <div class="range-labels">
                    <span>Dim</span>
                    <span>Bright</span>
                </div>
            </div>
        </section>

        <!-- Toggles Section: Segmented Controls -->
        <section class="toggles-grid">
            <!-- Axes Toggle -->
            <div class="toggle-group">
                <h3>Show Axes</h3>
                <div class="segmented-control">
                    <button
                        class:active={!config.showAxes}
                        onclick={() => (config.showAxes = false)}>Hide</button
                    >
                    <button
                        class:active={config.showAxes}
                        onclick={() => (config.showAxes = true)}>Show</button
                    >
                </div>
            </div>

            <!-- Labels Toggle -->
            <div class="toggle-group">
                <h3>Axis Labels</h3>
                <div class="segmented-control">
                    <button
                        class:active={!config.showLabels}
                        onclick={() => (config.showLabels = false)}>Hide</button
                    >
                    <button
                        class:active={config.showLabels}
                        onclick={() => (config.showLabels = true)}>Show</button
                    >
                </div>
            </div>
        </section>
    </div>

    <footer>
        <button class="primary" onclick={onClose}>Done</button>
    </footer>
</div>

<style>
    .settings-container {
        /* Match Introduction styling */
        width: 100%;
        color: var(--text-main);
        padding: 2rem; /* Restore padding to match Introduction */
    }

    header {
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }

    h2 {
        font-size: 2rem;
        margin: 0;
    }

    h3 {
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--text-main);
        margin: 0;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .value-badge {
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--accent);
        background: rgba(56, 189, 248, 0.1);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        border: 1px solid rgba(56, 189, 248, 0.2);
    }

    /* Range Sliders */
    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        outline: none;
        margin-bottom: 0.5rem;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 10px var(--accent-glow);
        transition: transform 0.1s;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .range-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--text-dim);
    }

    /* Toggle Grid */
    .toggles-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        border-top: 1px solid var(--glass-border);
        padding-top: 1.5rem;
    }

    .toggle-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Segmented Control */
    .segmented-control {
        display: flex;
        background: rgba(0, 0, 0, 0.3);
        padding: 4px;
        border-radius: 8px;
        border: 1px solid var(--glass-border);
        width: 180px; /* Fixed reasonable width */
    }

    .segmented-control button {
        flex: 1;
        background: transparent;
        border: none;
        padding: 0.4rem;
        font-size: 0.9rem;
        border-radius: 6px;
        color: var(--text-dim);
        transition: all 0.2s;
    }

    .segmented-control button.active {
        background: var(--accent);
        color: #000;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .segmented-control button:hover:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }

    footer {
        margin-top: 2rem;
        text-align: right;
    }

    button.primary {
        background-color: var(--accent);
        color: #000;
        font-weight: 700;
        padding: 0.8rem 2rem;
        border-radius: 8px;
        border: none;
    }

    button.primary:hover {
        box-shadow: 0 0 20px var(--accent-glow);
    }
</style>
