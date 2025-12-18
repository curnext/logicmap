<script>
    let { resetView } = $props();
</script>

<div class="controls glass-panel">
    <button onclick={resetView} title="Reset camera to default view">
        Reset View
    </button>
    <div class="hint">
        <span>Scroll to Zoom</span>
        <span>Drag to Pan</span>
    </div>
</div>

<style>
    .controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
    }
    .hint {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        color: var(--text-dim);
        text-align: right;
    }
</style>
