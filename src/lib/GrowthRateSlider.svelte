<script lang="ts">
    /**
     * Non-linear growth rate slider that provides finer control near r=4
     * Uses cubic root transformation: r = 4 * t^(1/3) where t is slider position
     * This makes the slider spend more distance on the 2-4 range where interesting behavior happens
     */
    let { value = $bindable(3.0) }: { value: number } = $props();

    // Transform: slider position (0-1) to r value (0-4)
    // Using cubic root: r = 4 * t^(1/3)
    function sliderToR(t: number): number {
        return 4 * Math.pow(Math.max(0, Math.min(1, t)), 1 / 3);
    }

    // Inverse transform: r value (0-4) to slider position (0-1)
    // t = (r/4)^3
    function rToSlider(r: number): number {
        return Math.pow(Math.max(0, Math.min(4, r)) / 4, 3);
    }

    let sliderValue = $state(rToSlider(value));

    // Update r when slider moves
    function handleSliderInput(e: Event) {
        const target = e.target as HTMLInputElement;
        sliderValue = parseFloat(target.value);
        value = sliderToR(sliderValue);
    }

    // Sync slider when value changes externally
    $effect(() => {
        const expectedSlider = rToSlider(value);
        // Only update if significantly different to avoid feedback loops
        if (Math.abs(sliderValue - expectedSlider) > 0.001) {
            sliderValue = expectedSlider;
        }
    });
</script>

<div class="slider-container">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label>
        <span class="label-text">Growth Rate (r):</span>
        <strong>{value.toFixed(4)}</strong>
    </label>
    <input
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={sliderValue}
        oninput={handleSliderInput}
    />
</div>

<style>
    .slider-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        width: 100%;
    }

    label {
        font-size: 0.8rem;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .label-text {
        color: #94a3b8;
    }

    strong {
        color: #fff;
        font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
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

    input[type="range"]::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: #38bdf8;
        border-radius: 50%;
        border: none;
    }
</style>
