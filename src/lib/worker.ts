// Web Worker for Bifurcation Calculation

interface RenderParams {
    width: number;
    height: number;
    rMin: number;
    rMax: number;
    xMin: number;
    xMax: number;
    mode: 'drag' | 'static';
    config: { detailLevel: number; contrast: number; showAxes: boolean; };
}

self.onmessage = (e: MessageEvent<RenderParams>) => {
    const { width, height, rMin, rMax, xMin, xMax, mode, config } = e.data;
    const { detailLevel, contrast } = config;

    // Common Map Params
    const rRange = rMax - rMin;
    const xRange = xMax - xMin;
    const w = width;
    const h = height;

    // Adaptive Iterations based on zoom level (rRange)
    // Scale base iterations by detailLevel
    const zoomFactor = 4.0 / Math.abs(rRange);
    const adaptiveMultiplier = Math.max(1, Math.log10(zoomFactor) * 2) * detailLevel;

    if (mode === 'drag') {
        // FAST PASS
        const iterSkip = 300;
        const iterPlot = 100;
        // Fast pass doesn't need to be extremely high res
        const buffer = renderPass(w, h, rMin, xMin, xMax, rRange, xRange, iterSkip, iterPlot, 3);
        self.postMessage({ buffer, width, height, isFinal: true }, { transfer: [buffer.buffer] });
    }
    else {
        // STATIC / PROGRESSIVE PREVIEW WITH INCREMENTAL RENDERING

        const skip = Math.floor(2000 * adaptiveMultiplier);
        const plotStage1 = Math.floor(500 * adaptiveMultiplier);
        const plotStage2 = Math.floor(5000 * adaptiveMultiplier);

        // Create shared hitBuffer and state array
        const hitBuffer = new Uint32Array(w * h);
        const xStates = new Float64Array(w); // Store x state for each column
        let maxHits = 0;

        // Stage 1: Initial calculation with lower plot iterations
        for (let px = 0; px < w; px++) {
            const r = rMin + (px / w) * rRange;
            if (r < -2 || r > 4.01) continue;

            let x = 0.5;
            // Skip transient behavior
            for (let i = 0; i < skip; i++) {
                x = r * x * (1 - x);
                if (Math.abs(x) > 2) break;
            }
            if (Math.abs(x) > 2) continue;

            // Plot initial iterations
            for (let i = 0; i < plotStage1; i++) {
                x = r * x * (1 - x);
                if (Math.abs(x) > 2) break;

                if (x >= xMin && x <= xMax) {
                    const py = Math.floor(h - ((x - xMin) / xRange) * h);
                    if (py >= 0 && py < h) {
                        const idx = py * w + px;
                        hitBuffer[idx]++;
                        if (hitBuffer[idx] > maxHits) maxHits = hitBuffer[idx];
                    }
                }
            }

            // Save state for continuation
            xStates[px] = x;
        }

        // Render Stage 1
        const buffer1 = renderFromHitBuffer(hitBuffer, w, h, maxHits, contrast);
        self.postMessage({ buffer: buffer1, width, height, isFinal: false }, { transfer: [buffer1.buffer] });

        // Stage 2: Continue from saved states with MORE iterations
        const additionalIterations = plotStage2 - plotStage1;

        for (let px = 0; px < w; px++) {
            const r = rMin + (px / w) * rRange;
            if (r < -2 || r > 4.01) continue;

            let x = xStates[px]; // Resume from saved state
            if (Math.abs(x) > 2) continue;

            // Continue plotting additional iterations
            for (let i = 0; i < additionalIterations; i++) {
                x = r * x * (1 - x);
                if (Math.abs(x) > 2) break;

                if (x >= xMin && x <= xMax) {
                    const py = Math.floor(h - ((x - xMin) / xRange) * h);
                    if (py >= 0 && py < h) {
                        const idx = py * w + px;
                        hitBuffer[idx]++;
                        if (hitBuffer[idx] > maxHits) maxHits = hitBuffer[idx];
                    }
                }
            }
        }

        // Render Stage 2 with accumulated data
        const buffer2 = renderFromHitBuffer(hitBuffer, w, h, maxHits, contrast);
        self.postMessage({ buffer: buffer2, width, height, isFinal: true }, { transfer: [buffer2.buffer] });
    }
};

function renderPass(w: number, h: number, rMin: number, xMin: number, xMax: number, rRange: number, xRange: number, skip: number, plot: number, stride: number): Uint8ClampedArray {
    const buffer = new Uint8ClampedArray(w * h * 4);
    // Fill background
    for (let i = 0; i < buffer.length; i += 4) {
        buffer[i] = 13; buffer[i + 1] = 14; buffer[i + 2] = 18; buffer[i + 3] = 255;
    }

    for (let px = 0; px < w; px += stride) {
        const r = rMin + (px / w) * rRange;
        if (r < -2 || r > 4.01) continue;

        let x = 0.5;
        for (let i = 0; i < skip; i++) {
            x = r * x * (1 - x);
            if (Math.abs(x) > 2) break;
        }
        if (Math.abs(x) > 2) continue;

        for (let i = 0; i < plot; i++) {
            x = r * x * (1 - x);
            if (Math.abs(x) > 2) break;

            if (x >= xMin && x <= xMax) {
                const py = Math.floor(h - ((x - xMin) / xRange) * h);
                if (py >= 0 && py < h) {
                    for (let sx = 0; sx < stride; sx++) {
                        if (px + sx >= w) break;
                        const idx = (py * w + (px + sx)) * 4;
                        buffer[idx] = 56; buffer[idx + 1] = 189; buffer[idx + 2] = 248; buffer[idx + 3] = 255;
                    }
                }
            }
        }
    }
    return buffer;
}

function renderFromHitBuffer(hitBuffer: Uint32Array, w: number, h: number, maxHits: number, contrast: number): Uint8ClampedArray {
    const imageBuffer = new Uint8ClampedArray(w * h * 4);
    const logMax = Math.log(maxHits + 1);

    for (let i = 0; i < hitBuffer.length; i++) {
        const hits = hitBuffer[i];
        const idx = i * 4;

        if (hits === 0) {
            imageBuffer[idx] = 13; imageBuffer[idx + 1] = 14; imageBuffer[idx + 2] = 18; imageBuffer[idx + 3] = 255;
        } else {
            let intensity = Math.log(hits + 1) / logMax;
            intensity = Math.min(1.0, intensity * contrast);

            const r = 13 + (56 - 13) * intensity;
            const g = 14 + (189 - 14) * intensity;
            const b = 18 + (248 - 18) * intensity;

            imageBuffer[idx] = r;
            imageBuffer[idx + 1] = g;
            imageBuffer[idx + 2] = b;
            imageBuffer[idx + 3] = 255;

            if (intensity > 0.8) {
                const bleach = (intensity - 0.8) * 5;
                imageBuffer[idx] += (255 - imageBuffer[idx]) * bleach;
                imageBuffer[idx + 1] += (255 - imageBuffer[idx + 1]) * bleach;
                imageBuffer[idx + 2] += (255 - imageBuffer[idx + 2]) * bleach;
            }
        }
    }
    return imageBuffer;
}
