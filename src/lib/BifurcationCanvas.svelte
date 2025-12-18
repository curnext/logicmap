<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import Worker from "./worker?worker";
    import type { MapView, SimulationConfig } from "./types";
    import { DEFAULT_VIEW } from "./types";

    // Type for the data sent from the worker
    interface WorkerMessage {
        buffer: ArrayBuffer;
        width: number;
        height: number;
        isFinal: boolean;
    }

    let {
        view = $bindable(),
        config,
    }: { view: MapView; config: SimulationConfig } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = $state(0);
    let height = $state(0);

    let worker: Worker;
    let observer: ResizeObserver;

    // Interaction state
    let isDragging = $state(false);
    let startMouse = { x: 0, y: 0 };
    let startView = { ...view };

    // Debounce for static rendering
    let staticTimer: number;

    function drawAxes() {
        if (!config.showAxes || !ctx || width === 0 || height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const fontSize = 14 * dpr;
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";

        const padding = 10 * dpr;
        const tickSize = 6 * dpr;
        const labelOffset = 25 * dpr;

        // X Axis (Bottom, representing r)
        const rRange = view.rMax - view.rMin;
        const xRange = view.xMax - view.xMin;

        const rStep = nicerStep(rRange);
        const rStart = Math.ceil(view.rMin / rStep) * rStep;

        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        // Label X Axis
        if (config.showLabels) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillText("Growth Rate (r)", width / 2, height - labelOffset);
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

        for (let r = rStart; r < view.rMax; r += rStep) {
            const sx = ((r - view.rMin) / rRange) * width;
            // Avoid drawing too close to edges
            if (sx < 20 * dpr || sx > width - 20 * dpr) continue;

            ctx.moveTo(sx, height);
            ctx.lineTo(sx, height - tickSize);
            ctx.fillText(
                r.toFixed(getPrecision(rStep)),
                sx,
                height - tickSize - 2 * dpr,
            );
        }

        // Y Axis (Left, representing population x)
        const xStep = nicerStep(xRange);
        const xStart = Math.ceil(view.xMin / xStep) * xStep;

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        // Label Y Axis
        if (config.showLabels) {
            ctx.save();
            ctx.translate(45 * dpr, height / 2); // Moved right to avoid overlap
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillText("Population (x)", 0, 0);
            ctx.restore();
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

        for (let x = xStart; x < view.xMax; x += xStep) {
            const sy = height - ((x - view.xMin) / xRange) * height;
            // Add top margin (80px) to leave space for title
            if (sy < 80 * dpr) continue;

            ctx.moveTo(0, sy);
            ctx.lineTo(tickSize, sy);
            ctx.fillText(
                x.toFixed(getPrecision(xStep)),
                tickSize + 4 * dpr,
                sy,
            );
        }

        ctx.stroke();
    }

    function nicerStep(range: number) {
        const target = range / 8;
        const power = Math.floor(Math.log10(target));
        const base = Math.pow(10, power);
        const m = target / base;

        if (m < 1.5) return 1 * base;
        if (m < 3.5) return 2 * base;
        if (m < 7.5) return 5 * base;
        return 10 * base;
    }

    function getPrecision(step: number) {
        const str = step.toString();
        if (str.includes(".")) return str.split(".")[1].length;
        return 0;
    }

    $effect(() => {
        // When view changes
        const _ =
            view.rMin +
            view.rMax +
            view.xMin +
            view.xMax +
            width +
            height +
            config.detailLevel +
            config.contrast +
            (config.showAxes ? 1 : 0);

        // If dragging, we request 'drag' mode update
        // If static (not dragging for a bit), we request 'static' mode
        if (isDragging) {
            requestRender("drag");
        } else {
            // If we just stopped dragging or view updated programmatically
            requestRender("drag"); // Instant update first
            clearTimeout(staticTimer);
            staticTimer = setTimeout(() => {
                requestRender("static");
            }, 150) as unknown as number;
        }
    });

    function requestRender(mode: "drag" | "static") {
        if (!worker || width === 0 || height === 0) return;

        worker.postMessage({
            width,
            height,
            rMin: view.rMin,
            rMax: view.rMax,
            xMin: view.xMin,
            xMax: view.xMax,
            mode,
            config: $state.snapshot(config), // Pass config to worker
        });
    }

    export function resetView() {
        Object.assign(view, DEFAULT_VIEW);
        // Force resize calculation to re-apply aspect ratio based on the new (default) view
        // effectively centering the default view while respecting window shape
        resize();
    }

    // Touch State
    let touchDist = 0;
    let touchCenter = { x: 0, y: 0 };
    let lastTouchCenter = { x: 0, y: 0 };

    function getTouchDistance(t1: Touch, t2: Touch) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchCenter(t1: Touch, t2: Touch) {
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2,
        };
    }

    function onTouchStart(e: TouchEvent) {
        e.preventDefault();

        if (e.touches.length === 1) {
            isDragging = true;
            startMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            startView = { ...view };
            clearTimeout(staticTimer);
        } else if (e.touches.length === 2) {
            isDragging = true;
            touchDist = getTouchDistance(e.touches[0], e.touches[1]);
            touchCenter = getTouchCenter(e.touches[0], e.touches[1]);
            lastTouchCenter = { ...touchCenter };
            startView = { ...view };
            clearTimeout(staticTimer);
        }
    }

    function onTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (!isDragging) return;

        if (e.touches.length === 1) {
            // Pan logic similar to mouse
            const dx = e.touches[0].clientX - startMouse.x;
            const dy = e.touches[0].clientY - startMouse.y;

            // LogicPixels (CSS pixels)
            const cssWidth = width / window.devicePixelRatio;
            const cssHeight = height / window.devicePixelRatio;

            const rPerPixel = (startView.rMax - startView.rMin) / cssWidth;
            const xPerPixel = (startView.xMax - startView.xMin) / cssHeight;

            view.rMin = startView.rMin - dx * rPerPixel;
            view.rMax = startView.rMax - dx * rPerPixel;
            view.xMin = startView.xMin + dy * xPerPixel;
            view.xMax = startView.xMax + dy * xPerPixel;
        } else if (e.touches.length === 2) {
            // Pinch Zoom + Pan logic
            const newDist = getTouchDistance(e.touches[0], e.touches[1]);
            const newCenter = getTouchCenter(e.touches[0], e.touches[1]);

            // 1. Calculate Zoom Factor
            // If newDist > touchDist, we are zooming IN (scale < 1)
            // If newDist < touchDist, we are zooming OUT (scale > 1)
            const zoomFactor = touchDist / newDist;

            // 2. Pan due to center movement
            const cssWidth = width / window.devicePixelRatio;
            const cssHeight = height / window.devicePixelRatio;

            const rRange = startView.rMax - startView.rMin;
            const xRange = startView.xMax - startView.xMin;

            // Normalize center position (0 to 1) relative to canvas
            const rect = canvas.getBoundingClientRect();

            // Simplified: Re-calculate view from scratch based on startView

            const finalRRange = rRange * zoomFactor;
            const finalXRange = xRange * zoomFactor;

            const relX = touchCenter.x - rect.left;
            const rValAtTouch = startView.rMin + (relX / cssWidth) * rRange;

            const relY = rect.height - (touchCenter.y - rect.top); // from bottom
            const xValAtTouch = startView.xMin + (relY / cssHeight) * xRange;

            const newRelX = newCenter.x - rect.left;
            const newRelY = rect.height - (newCenter.y - rect.top);

            view.rMin = rValAtTouch - (newRelX / cssWidth) * finalRRange;
            view.rMax = view.rMin + finalRRange;

            view.xMin = xValAtTouch - (newRelY / cssHeight) * finalXRange;
            view.xMax = view.xMin + finalXRange;
        }
    }

    function onTouchEnd(e: TouchEvent) {
        if (e.touches.length === 0) {
            isDragging = false;
        } else if (e.touches.length === 1) {
            // Transition from 2 fingers to 1 finger
            // Reset start coordinates to prevent jump
            startMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            startView = { ...view };
        }
    }

    function resize() {
        if (!canvas) return;
        const parent = canvas.parentNode as Element;
        if (!parent) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();

        // Physical pixels
        const newWidth = Math.floor(rect.width * dpr);
        const newHeight = Math.floor(rect.height * dpr);

        // Logical (CSS) pixels for calculation
        const cssWidth = rect.width;
        const cssHeight = rect.height;

        // Aspect Ratio Maintenance (1:1 pixel ratio)
        if (width > 0 && height > 0) {
            // Existing window: Maintain scale based on CSS width NOT physical width
            const rRange = view.rMax - view.rMin;
            const unitsPerPixel = rRange / (width / dpr); // Use previous logical width

            const rCenter = (view.rMin + view.rMax) / 2;
            const xCenter = (view.xMin + view.xMax) / 2;

            const newRRange = unitsPerPixel * cssWidth;
            const newXRange = unitsPerPixel * cssHeight;

            view.rMin = rCenter - newRRange / 2;
            view.rMax = rCenter + newRRange / 2;
            view.xMin = xCenter - newXRange / 2;
            view.xMax = xCenter + newXRange / 2;
        } else {
            // First load
            const rRange = view.rMax - view.rMin;
            const unitsPerPixel = rRange / cssWidth;

            const xCenter = (view.xMin + view.xMax) / 2;
            const newXRange = unitsPerPixel * cssHeight;

            view.xMin = xCenter - newXRange / 2;
            view.xMax = xCenter + newXRange / 2;
        }

        // Apply new dimensions
        width = newWidth;
        height = newHeight;

        canvas.width = width;
        canvas.height = height;

        requestRender("drag");
    }

    onMount(() => {
        worker = new Worker();
        worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
            const { buffer, width: w, height: h } = e.data;
            // Verify dimensions match current state
            if (w === width && h === height && ctx) {
                const imageData = new ImageData(
                    new Uint8ClampedArray(buffer),
                    w,
                    h,
                );
                ctx.putImageData(imageData, 0, 0);

                // Draw Axes on top
                if (config.showAxes) {
                    drawAxes();
                }
            }
        };

        const context = canvas.getContext("2d", { alpha: false });
        if (context) ctx = context;

        // Use ResizeObserver for robust adaptive sizing
        observer = new ResizeObserver(() => resize());
        if (canvas && canvas.parentNode) {
            observer.observe(canvas.parentNode as Element);
        }

        // Initial sizing
        resize();

        // Prevent Safari Pinch-to-Zoom on Page
        const preventDefault = (e: Event) => e.preventDefault();
        canvas.addEventListener("gesturestart", preventDefault);
        canvas.addEventListener("gesturechange", preventDefault);
        canvas.addEventListener("gestureend", preventDefault);

        return () => {
            canvas.removeEventListener("gesturestart", preventDefault);
            canvas.removeEventListener("gesturechange", preventDefault);
            canvas.removeEventListener("gestureend", preventDefault);
        };
    });

    onDestroy(() => {
        if (observer) observer.disconnect();
        if (worker) worker.terminate();
        clearTimeout(staticTimer);
    });

    // Interaction Handlers
    function onMouseDown(e: MouseEvent) {
        isDragging = true;
        startMouse = { x: e.clientX, y: e.clientY };
        startView = { ...view };
        clearTimeout(staticTimer); // Stop static calc if starting
    }

    function onMouseMove(e: MouseEvent) {
        if (!isDragging) return;
        const dx = e.clientX - startMouse.x;
        const dy = e.clientY - startMouse.y;

        // Use CSS pixels for drag calculations
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = width / dpr;
        const cssHeight = height / dpr;

        const rPerPixel = (startView.rMax - startView.rMin) / cssWidth;
        const xPerPixel = (startView.xMax - startView.xMin) / cssHeight;

        // Use mutate to trigger effect
        view.rMin = startView.rMin - dx * rPerPixel;
        view.rMax = startView.rMax - dx * rPerPixel;
        view.xMin = startView.xMin + dy * xPerPixel;
        view.xMax = startView.xMax + dy * xPerPixel;
    }

    function onMouseUp() {
        isDragging = false;
        // Effect will trigger static render after timeout
    }

    function onWheel(e: WheelEvent) {
        e.preventDefault();
        clearTimeout(staticTimer);

        const zoomIntensity = 0.1;
        const zoomFactor = e.deltaY > 0 ? 1 + zoomIntensity : 1 - zoomIntensity;

        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Use CSS dimensions for mouse position calculations
        const cssWidth = rect.width;
        const cssHeight = rect.height;

        const rRange = view.rMax - view.rMin;
        const xRange = view.xMax - view.xMin;

        const mouseR = view.rMin + (mx / cssWidth) * rRange;
        const mouseX = view.xMin + ((cssHeight - my) / cssHeight) * xRange;

        const newRRange = rRange * zoomFactor;
        const newXRange = xRange * zoomFactor;

        view.rMin = mouseR - (mx / cssWidth) * newRRange;
        view.rMax = view.rMin + newRRange;

        view.xMin = mouseX - ((cssHeight - my) / cssHeight) * newXRange;
        view.xMax = view.xMin + newXRange;
    }
</script>

<div class="canvas-wrapper">
    <canvas
        bind:this={canvas}
        onmousedown={onMouseDown}
        onmousemove={onMouseMove}
        onmouseup={onMouseUp}
        onmouseleave={onMouseUp}
        ontouchstart={onTouchStart}
        ontouchmove={onTouchMove}
        ontouchend={onTouchEnd}
        ontouchcancel={onTouchEnd}
        onwheel={onWheel}
    ></canvas>
</div>

<style>
    .canvas-wrapper {
        width: 100%;
        height: 100%;
        cursor: crosshair;
        background: #0d0e12;
        overflow: hidden; /* Fix potential scrollbars */
    }
    canvas {
        display: block;
        width: 100%;
        height: 100%;
        touch-action: none;
    }
</style>
