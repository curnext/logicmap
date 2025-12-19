<script lang="ts">
    import { onMount } from "svelte";
    import GrowthRateSlider from "./GrowthRateSlider.svelte";

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = 300;
    let height = 300;

    // r value (Reactivity 101: bindable state)
    let r = $state(1.8);

    function setR(val: number) {
        r = val;
    }

    function f(x: number, r: number) {
        return r * x * (1 - x);
    }

    function draw() {
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        const toScreenX = (x: number) => x * width;
        const toScreenY = (y: number) => height - y * height;

        // Draw Parabola: y = r * x * (1 - x)
        ctx.beginPath();
        ctx.strokeStyle = "#38bdf8"; // Sky blue
        ctx.lineWidth = 2;
        for (let x = 0; x <= 1; x += 0.01) {
            const y = f(x, r);
            if (x === 0) ctx.moveTo(toScreenX(x), toScreenY(y));
            else ctx.lineTo(toScreenX(x), toScreenY(y));
        }
        ctx.stroke();

        // Draw Diagonal: y = x
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(toScreenX(0), toScreenY(0));
        ctx.lineTo(toScreenX(1), toScreenY(1));
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Cobweb with Gradient
        let x = 0.1; // Initial population

        // Use a loop that draws each segment individually to apply the color gradient
        const iterations = 1000;

        // Starting position (on x-axis)
        let currentX = x;
        let currentY = 0;

        for (let i = 0; i < iterations; i++) {
            const nextY = f(currentX, r);

            // Calculate progress (0 to 1)
            // We want early iterations to be grey/faint, later ones to be pink/bright
            const t = i / (iterations - 1);

            // Interpolate colors
            // Start (Greyish Blue): 100, 116, 139 (Slate-500)
            // End (Pink): 244, 114, 182 (Pink-400)
            const red = 100 + (244 - 100) * t;
            const green = 116 + (114 - 116) * t;
            const blue = 139 + (182 - 139) * t;
            const alpha = 0.3 + 0.7 * t; // Fade in opacity

            const color = `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${alpha})`;

            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = color;

            // 1. Vertical line up to parabola
            // Start from current position (which is either (x,0) or (x,x) from previous diagonal move)
            // Actually, previous iteration ended at (previousY, previousY), so currentX is previousY.
            // But we need to define the start point.

            if (i === 0) {
                ctx.moveTo(toScreenX(currentX), toScreenY(0));
            } else {
                // Start from diagonal (currentX, currentX)
                ctx.moveTo(toScreenX(currentX), toScreenY(currentX));
            }

            ctx.lineTo(toScreenX(currentX), toScreenY(nextY));
            ctx.stroke();

            // 2. Horizontal line to diagonal
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(toScreenX(currentX), toScreenY(nextY));
            ctx.lineTo(toScreenX(nextY), toScreenY(nextY));
            ctx.stroke();

            // Update x for next iteration
            currentX = nextY;
            currentY = nextY; // Not strictly needed but helps mental model
        }

        // Visualize the fixed point or chaos
        // Draw a small dot at the final x
        ctx.beginPath();
        ctx.fillStyle = "#f472b6";
        ctx.arc(toScreenX(x), toScreenY(x), 4, 0, Math.PI * 2);
        ctx.fill();
    }

    $effect(() => {
        // Redraw whenever r changes
        r;
        draw();
    });

    onMount(() => {
        ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;

        // Fix scaling
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);
        draw();
    });
</script>

<div class="cobweb-container">
    <canvas bind:this={canvas}></canvas>

    <div class="controls">
        <GrowthRateSlider bind:value={r} />

        <div class="presets">
            <button
                onclick={() => setR(2.0)}
                class:active={Math.abs(r - 2.0) < 0.05}>2.0 (Stable)</button
            >
            <button
                onclick={() => setR(3.2)}
                class:active={Math.abs(r - 3.2) < 0.05}>3.2 (Cycle 2)</button
            >
            <button
                onclick={() => setR(3.5)}
                class:active={Math.abs(r - 3.5) < 0.05}>3.5 (Cycle 4)</button
            >
            <button
                onclick={() => setR(3.9)}
                class:active={Math.abs(r - 3.9) < 0.05}>3.9 (Chaos)</button
            >
            <button
                onclick={() => setR(3.84)}
                class:active={Math.abs(r - 3.84) < 0.01}>3.8 (Window)</button
            >
        </div>
    </div>

    <div class="explanation">
        <h4>How to read this plot:</h4>
        <ul>
            <li>
                <span class="text-pink">Pink Line</span>: The rabbits' journey.
                It starts at 0.1 and bounces around.
            </li>
            <li><strong>Try these values:</strong></li>
            <li>
                <button class="text-btn" onclick={() => setR(2.0)}
                    >r = 2.0</button
                >: Population stabilizes at one value. Boring stability.
            </li>
            <li>
                <button class="text-btn" onclick={() => setR(3.2)}
                    >r = 3.2</button
                >: Population bounces between TWO values forever. This is a
                "Period 2" cycle.
            </li>
            <li>
                <button class="text-btn" onclick={() => setR(3.9)}
                    >r = 3.9</button
                >: Complete Chaos. The population never repeats and is totally
                unpredictable.
            </li>
            <li>
                <button class="text-btn" onclick={() => setR(3.8284)}
                    >r = 3.8</button
                >: A surprise "Window of Stability" (Period 3) hidden inside the
                chaos!
            </li>
        </ul>
    </div>
</div>

<style>
    .cobweb-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 2rem 0;
        background: rgba(0, 0, 0, 0.2);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: 100%;
    }

    canvas {
        display: block;
        margin-bottom: 1.5rem;
        border-radius: 4px; /* Slight roundness */
        background: rgba(0, 0, 0, 0.3); /* Darker bg for canvas */
    }

    .controls {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
    }

    .presets button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: var(--text-dim);
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .presets button:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }

    .presets button.active {
        background: var(--accent);
        color: black;
        border-color: var(--accent);
        font-weight: bold;
    }

    .explanation {
        text-align: left;
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        padding: 1rem;
        border-radius: 8px;
    }

    h4 {
        margin: 0 0 0.5rem 0;
        color: white;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    ul {
        margin: 0;
        padding-left: 1.2rem;
        font-size: 0.95rem;
        color: var(--text-dim);
        line-height: 1.6;
    }

    li {
        margin-bottom: 0.4rem;
    }

    .text-btn {
        background: none;
        border: none;
        padding: 0;
        color: #38bdf8;
        font-weight: bold;
        cursor: pointer;
        text-decoration: underline;
        font-size: inherit;
    }
    .text-btn:hover {
        color: white;
    }

    .text-pink {
        color: #f472b6;
        font-weight: bold;
    }
</style>
