<script lang="ts">
    import { onMount } from "svelte";

    let {
        r = $bindable(3.3),
        n = 50,
        rMin = 0,
        rMax = 4,
    }: {
        r: number;
        n: number;
        rMin: number;
        rMax: number;
    } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = $state(0);
    let height = $state(0);

    let x0 = $state(0.33);

    // Clamp r to current view range
    $effect(() => {
        if (r < rMin) r = rMin;
        if (r > rMax) r = rMax;
    });

    // Use derived state for points to avoid effect loops
    let points = $derived.by(() => {
        const p = [x0];
        let currentX = x0;
        // Limit n to prevent performance issues if config is somehow huge
        const limitN = Math.min(n, 1000);
        for (let i = 0; i < limitN; i++) {
            currentX = r * currentX * (1 - currentX);
            p.push(currentX);
        }
        return p;
    });

    function draw() {
        if (!ctx || width === 0 || height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, width, height);

        // Styling
        ctx.fillStyle = "#18181b"; // dark bg
        ctx.fillRect(0, 0, width, height);

        // Grid lines (0 and 1)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;

        const yScale = height;
        // Draw 0 line (bottom)
        ctx.beginPath();
        ctx.moveTo(0, height - 1); // -1 to be visible
        ctx.lineTo(width, height - 1);
        ctx.stroke();

        // Draw 1 line (top)
        ctx.beginPath();
        ctx.moveTo(0, 1);
        ctx.lineTo(width, 1);
        ctx.stroke();

        if (points.length === 0) return;

        const xStep = width / (Math.max(points.length, 2) - 1);

        // Draw Line
        ctx.beginPath();
        ctx.strokeStyle = "#38bdf8"; // Sky 400
        ctx.lineWidth = 1.5 * dpr; // Thin line

        points.forEach((val, i) => {
            const px = i * xStep;
            const py = height - val * yScale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Draw Markers
        ctx.fillStyle = "#fff";
        points.forEach((val, i) => {
            const px = i * xStep;
            const py = height - val * yScale;
            ctx.beginPath();
            ctx.arc(px, py, 2.5 * dpr, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function resize() {
        if (!canvas || !canvas.parentNode) return;
        const rect = (canvas.parentNode as Element).getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const newWidth = rect.width * dpr;
        const newHeight = rect.height * dpr;

        // Force redraw even if size is same if 0 (first load fix)
        if (width === newWidth && height === newHeight && width > 0) return;

        width = newWidth;
        height = newHeight;

        canvas.width = width;
        canvas.height = height;

        draw();
    }

    $effect(() => {
        points;
        width;
        height;
        r; // dependency
        n; // dependency
        draw();
    });

    onMount(() => {
        ctx = canvas.getContext("2d")!;
        const observer = new ResizeObserver(() => resize());
        observer.observe(canvas.parentNode as Element);
        // Immediate resize
        resize();
        // Fallback resize for flex layout settlement
        setTimeout(resize, 50);

        return () => observer.disconnect();
    });
</script>

<div class="plot-container">
    <!-- Canvas Area (Top) -->
    <div class="canvas-wrapper">
        <!-- Labels -->
        <span class="axis-label top-label">1.0</span>
        <span class="axis-label bottom-label">0.0</span>

        <canvas bind:this={canvas}></canvas>
    </div>

    <!-- Controls Bar (Bottom) -->
    <div class="controls-bar">
        <div class="control-item">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label>
                <span>Growth Rate (r):</span>
                <strong>{r.toFixed(4)}</strong>
                <span class="range-hint"
                    >({rMin.toFixed(2)} – {rMax.toFixed(2)})</span
                >
            </label>
            <input
                type="range"
                min={rMin}
                max={rMax}
                step={(rMax - rMin) / 1000}
                bind:value={r}
            />
        </div>
        <div class="control-item">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label>Initial X (x₀): <strong>{x0.toFixed(2)}</strong></label>
            <input type="range" min="0" max="1" step="0.01" bind:value={x0} />
        </div>
    </div>
</div>

<style>
    .plot-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #18181b;
        position: relative;
    }

    .controls-bar {
        padding: 0.75rem 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: center;
        width: 100%;
        z-index: 20;
    }

    .control-item {
        flex: 1;
        min-width: 200px;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .canvas-wrapper {
        flex: 1;
        position: relative;
        width: 100%;
        min-height: 0;
        margin: 0 1rem; /* Add horizontal margin */
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }

    label {
        font-size: 0.8rem;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
    }

    strong {
        color: #fff;
    }

    input[type="range"] {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: #38bdf8;
        border-radius: 50%;
    }

    .axis-label {
        position: absolute;
        left: 8px;
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.4);
        pointer-events: none;
    }
    .top-label {
        top: 4px;
    }
    .bottom-label {
        bottom: 4px;
    }
</style>
